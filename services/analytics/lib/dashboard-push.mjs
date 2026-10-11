// Opt-in delivery for the private dashboard. The existing session and owner
// permission remain the only authorization; no separate long-lived login token.
import {createHash,createCipheriv,createDecipheriv,randomBytes,createECDH} from 'node:crypto';
import {open,mkdir,writeFile,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join,isAbsolute} from 'node:path';
import {Agent} from 'node:https';
import {lookup} from 'node:dns';
import {isIP} from 'node:net';

const HASH=/^[a-f0-9]{64}$/,UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const MAX_DEVICES=20,MAX_SESSION_DEVICES=5,MAX_FILE=512*1024;
const digest=value=>createHash('sha256').update(value).digest('hex');
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const exact=(value,keys)=>plain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
const fail=(status=400)=>Object.assign(new Error('dashboard notification request rejected'),{status});
const b64=(value,length)=>typeof value==='string'&&/^[A-Za-z0-9_-]+$/.test(value)&&Buffer.from(value,'base64url').length===length&&Buffer.from(value,'base64url').toString('base64url')===value;
const appleHost=value=>/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+push\.apple\.com$/.test(value);

export function validatePushEndpoint(value){
 let url;try{url=new URL(value);}catch{throw fail();}
 if(typeof value!=='string'||value.length>2048||url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash||url.href!==value)throw fail();
 const provider=appleHost(url.hostname)&&/^\/[A-Za-z0-9_/-]+$/.test(url.pathname)
  ||url.hostname==='fcm.googleapis.com'&&/^\/(?:fcm\/send|wp)\/[A-Za-z0-9_:-]+$/.test(url.pathname)
  ||url.hostname==='updates.push.services.mozilla.com'&&/^\/wpush\/v[12]\/[A-Za-z0-9_-]+$/.test(url.pathname);
 if(!provider||url.pathname==='/'||url.pathname.includes('//')||url.pathname.includes('/../'))throw fail();
 return value;
}

export function validatePushSubscription(input){
 if(!plain(input)||Object.keys(input).some(key=>!['endpoint','keys','expirationTime'].includes(key))||!Object.hasOwn(input,'endpoint')||!exact(input.keys,['p256dh','auth'])||!b64(input.keys.p256dh,65)||Buffer.from(input.keys.p256dh,'base64url')[0]!==4||!b64(input.keys.auth,16))throw fail();
 const expirationTime=input.expirationTime??null;
 if(expirationTime!==null&&(!Number.isSafeInteger(expirationTime)||expirationTime<0))throw fail();
 // Reject invalid elliptic-curve keys before retaining any browser capability.
 try{const ecdh=createECDH('prime256v1');ecdh.generateKeys();ecdh.computeSecret(Buffer.from(input.keys.p256dh,'base64url'));}catch{throw fail();}
 return{endpoint:validatePushEndpoint(input.endpoint),expirationTime,keys:{p256dh:input.keys.p256dh,auth:input.keys.auth}};
}

export function publicPushAddress(address){
 if(isIP(address)===4){const [a,b,c]=address.split('.').map(Number);return!(a===0||a===10||a===127||a>=224||a===100&&b>=64&&b<=127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===88&&c===99)||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);}
 // Global unicast only; deny documentation, mapped IPv4 and local IPv6.
 if(isIP(address)!==6)return false;let normalized;try{normalized=new URL('https://['+address+']/').hostname.slice(1,-1);}catch{return false;}
 return /^[23][a-f0-9]{3}:/i.test(normalized)&&!/^2001:(?:db8|0|2|[12][0-9a-f])(?::|$)|^2001::|^(?:2002|3ffe|3fff):/i.test(normalized);
}
function pushAgent(){return new Agent({keepAlive:false,maxSockets:2,lookup(hostname,options,callback){
 if(!appleHost(hostname)&&!['fcm.googleapis.com','updates.push.services.mozilla.com'].includes(hostname)){callback(fail());return;}
 lookup(hostname,{all:true,verbatim:true},(error,addresses)=>{if(error){callback(error);return;}if(!addresses.length||addresses.some(row=>!publicPushAddress(row.address))){callback(fail());return;}const rows=options.family?addresses.filter(row=>row.family===options.family):addresses;if(!rows.length){callback(fail());return;}if(options.all)callback(null,rows);else callback(null,rows[0].address,rows[0].family);});
 }});}
async function privateFile(path,maximum){let file;try{file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);const info=await file.stat();if(!info.isFile()||(info.mode&0o077)!==0||info.size>maximum)throw fail(503);return await file.readFile();}finally{await file?.close();}}
function snapshot(value){
 if(!exact(value,['inquiries','partnerships']))throw fail(503);
 const section=row=>{if(row===null)return null;if(!exact(row,['count','ids'])||!Number.isSafeInteger(row.count)||row.count<0||!Array.isArray(row.ids)||row.ids.length>100||new Set(row.ids).size!==row.ids.length||!row.ids.every(id=>UUID.test(id??'')))throw fail(503);return{count:row.count,ids:row.ids.map(id=>digest(id.toLowerCase())).sort()};};
 return{inquiries:section(value.inquiries),partnerships:section(value.partnerships)};
}
function validSeen(value){return value===null||exact(value,['inquiries','partnerships'])&&Object.values(value).every(row=>row===null||exact(row,['count','ids'])&&Number.isSafeInteger(row.count)&&row.count>=0&&Array.isArray(row.ids)&&row.ids.length<=100&&row.ids.every(id=>HASH.test(id??'')));}

export async function createDashboardPush({enabled=false,directory,sessions,authorize,readCounts,now=Date.now,push,subject='mailto:podpora@zeleznalady.cz',intervalMs=90000,deliveryTimeoutMs=5000,onError=()=>{}}){
 const records=new Map();let vapid,key,queue=Promise.resolve(),running=false,timer;
 const storage=typeof directory==='string'&&isAbsolute(directory),available=enabled&&storage;
 const file=storage?join(directory,'dashboard-push.enc'):null;
 if(storage){
  await mkdir(directory,{recursive:true,mode:0o700});key=await privateFile(join(directory,'session-key'),32);if(key.length!==32)throw fail(503);
  if(available)push??=(await import('web-push')).default;
  try{
   const encrypted=await privateFile(file,MAX_FILE);if(encrypted.length<28)throw fail(503);const decipher=createDecipheriv('aes-256-gcm',key,encrypted.subarray(0,12));decipher.setAuthTag(encrypted.subarray(12,28));const state=JSON.parse(Buffer.concat([decipher.update(encrypted.subarray(28)),decipher.final()]).toString());
   if(!exact(state,['version','vapid','records'])||state.version!==1||!exact(state.vapid,['publicKey','privateKey'])||!b64(state.vapid.publicKey,65)||!b64(state.vapid.privateKey,32)||!Array.isArray(state.records)||state.records.length>MAX_DEVICES)throw fail(503);
   vapid=state.vapid;const ecdh=createECDH('prime256v1');ecdh.setPrivateKey(Buffer.from(vapid.privateKey,'base64url'));if(ecdh.getPublicKey().toString('base64url')!==vapid.publicKey)throw fail(503);
   for(const row of state.records){if(!exact(row,['reference','actorId','subscription','locale','until','seen','retryAt','failures'])||!HASH.test(row.reference??'')||!UUID.test(row.actorId??'')||!['cs','en'].includes(row.locale)||!Number.isSafeInteger(row.until)||!Number.isSafeInteger(row.retryAt)||!Number.isSafeInteger(row.failures)||row.failures<0||!validSeen(row.seen))throw fail(503);row.subscription=validatePushSubscription(row.subscription);const id=digest(row.subscription.endpoint);if(records.has(id))throw fail(503);if(row.until>now()&&sessions.getByReference(row.reference))records.set(id,row);}
  }catch(error){if(error.code!=='ENOENT')throw error;if(available)vapid=push.generateVAPIDKeys();}
 }
 function save(){if(!storage||!vapid)return Promise.resolve();const data=JSON.stringify({version:1,vapid,records:[...records.values()]});const task=queue.then(async()=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const encrypted=Buffer.concat([cipher.update(data),cipher.final()]);await writeFile(file+'.tmp',Buffer.concat([iv,cipher.getAuthTag(),encrypted]),{mode:0o600});await rename(file+'.tmp',file);});queue=task.catch(()=>{});return task;}
 if(storage)await save();
 const context=async session=>{if(!session||!sessions.getByReference(sessions.reference(session.id)))throw fail(401);return authorize(session);};
 const config=(session,endpoint)=>({enabled,available,reason:available?null:enabled?'unconfigured':'disabled',publicKey:available?vapid.publicKey:null,subscribed:available&&[...records.values()].some(row=>row.reference===sessions.reference(session.id)&&row.until>now()&&(!endpoint||row.subscription.endpoint===endpoint)),sessionExpiresAt:new Date(session.until).toISOString()});
 async function current(session,endpoint){await context(session);if(endpoint!==undefined)validatePushEndpoint(endpoint);return config(session,endpoint);}
 async function subscribe(session,input){
  if(!exact(input,['subscription','locale'])||!['cs','en'].includes(input.locale))throw fail();
  const subscription=validatePushSubscription(input.subscription),owner=await context(session);if(!available)throw fail(503);
  if(!UUID.test(owner.actorId??''))throw fail(503);
  const reference=sessions.reference(session.id),id=digest(subscription.endpoint),existing=records.get(id);
  // Explicit opt-in may renew this device after a fresh login of the same owner.
  if(existing&&existing.actorId!==owner.actorId.toLowerCase())throw fail(409);
  if(!existing&&(records.size>=MAX_DEVICES||[...records.values()].filter(row=>row.reference===reference).length>=MAX_SESSION_DEVICES))throw fail(429);
  const until=Math.min(session.until,subscription.expirationTime??session.until);if(until<=now())throw fail();
  const fresh=await context(session);if(fresh.actorId?.toLowerCase()!==owner.actorId.toLowerCase())throw fail(403);
  const seen=existing?.reference===reference?existing.seen:snapshot(await readCounts(fresh));
  if(!sessions.getByReference(reference))throw fail(401);
  // Authorization and baseline reads are asynchronous: re-check quotas against
  // the current map so simultaneous opt-ins cannot exceed the storage limit.
  const current=records.get(id);
  if(current&&current.actorId!==owner.actorId.toLowerCase())throw fail(409);
  if(!current&&records.size>=MAX_DEVICES||current?.reference!==reference&&[...records.values()].filter(row=>row.reference===reference).length>=MAX_SESSION_DEVICES)throw fail(429);
  const row={reference,actorId:owner.actorId.toLowerCase(),subscription,locale:input.locale,until,seen,retryAt:0,failures:0};records.set(id,row);try{await save();}catch(error){if(current)records.set(id,current);else records.delete(id);throw error;}return{ok:true,...config(session,subscription.endpoint)};
 }
 async function unsubscribe(session,endpoint){validatePushEndpoint(endpoint);const owner=await context(session),id=digest(endpoint),row=records.get(id);if(row?.actorId===owner.actorId?.toLowerCase()){records.delete(id);try{await save();}catch(error){records.set(id,row);throw error;}}return{ok:true};}
 async function removeSession(id){const reference=sessions.reference(id);let changed=false;for(const [hash,row]of records)if(row.reference===reference){records.delete(hash);changed=true;}if(changed)await save();}
 async function tick(){
  if(!storage||running)return;running=true;let changed=false;
  try{
   for(const [id,row]of records)if(row.until<=now()||!sessions.getByReference(row.reference)){records.delete(id);changed=true;}
   if(!available){if(changed)await save();return;}
   const references=[...new Set([...records.values()].filter(row=>row.retryAt<=now()).map(row=>row.reference))];
   for(const reference of references){
    const session=sessions.getByReference(reference);if(!session)continue;
    let counts;try{counts=snapshot(await readCounts(await authorize(session)));}catch(error){if([401,403].includes(error.status)){for(const [id,row]of records)if(row.reference===reference){records.delete(id);changed=true;}}else onError();continue;}
    for(const [id,row]of records){
     if(row.reference!==reference||row.retryAt>now())continue;
     for(const section of ['inquiries','partnerships']){
      const latest=counts[section],previous=row.seen?.[section];if(!latest)continue;
      if(previous&&previous.count===latest.count&&previous.ids.length===latest.ids.length&&previous.ids.every((value,index)=>value===latest.ids[index]))continue;
      const unseen=previous&&latest.ids.some(value=>!previous.ids.includes(value)),increased=previous&&latest.count>previous.count;
      if(latest.count>0&&(unseen||increased)){
       // Re-check the upstream role/owner/website and live session immediately
       // before delivery, including after an earlier device or inbox completed.
       try{
        const live=sessions.getByReference(reference);if(!live||records.get(id)!==row)break;const verified=await authorize(live);if(verified.actorId?.toLowerCase()!==row.actorId)throw fail(403);if(!sessions.getByReference(reference)||records.get(id)!==row)break;if(row.until<=now()){records.delete(id);changed=true;break;}
        const totalCount=counts.inquiries&&counts.partnerships?counts.inquiries.count+counts.partnerships.count:null;
        const agent=pushAgent();let deadline;
        try{
         const timeout=new Promise((_,reject)=>{deadline=setTimeout(()=>{agent.destroy();reject(fail(503));},Math.max(1,Math.min(5000,deliveryTimeoutMs)));});
         const delivery=push.sendNotification(row.subscription,JSON.stringify({type:'vcode-inbox',section,locale:row.locale,count:latest.count,totalCount}),{vapidDetails:{subject,...vapid},contentEncoding:'aes128gcm',TTL:Math.max(1,Math.min(300,Math.floor((row.until-now())/1000))),timeout:5000,urgency:'normal',topic:'vcode-'+section,agent});
         await Promise.race([delivery,timeout]);
        }finally{clearTimeout(deadline);agent.destroy();}
        row.failures=0;row.retryAt=0;
       }catch(error){if([401,403,404,410].includes(error.status??error.statusCode)){records.delete(id);changed=true;break;}row.failures++;row.retryAt=now()+Math.min(3600000,90000*2**Math.min(row.failures,5));changed=true;onError();break;}
      }
      row.seen??={inquiries:null,partnerships:null};row.seen[section]=latest;changed=true;
     }
    }
   }
   if(changed)await save();
  }finally{running=false;}
 }
 function start(){if(storage&&vapid&&!timer){timer=setInterval(()=>{void tick().catch(onError);},Math.max(60000,Math.min(120000,intervalMs)));timer.unref();}}
 function stop(){if(timer)clearInterval(timer);timer=undefined;}
 return{current,subscribe,unsubscribe,removeSession,tick,start,stop};
}

export function createDashboardPushHandler({service,send,body,sameOrigin,origin,limited}){
 return async(req,res,url,session)=>{
  if(!/^\/prehled\/api\/notifications(?:\/|$)/.test(url.pathname))return false;
  try{
   if(!session)throw fail(401);if(url.search)throw fail();
   const status=url.pathname==='/prehled/api/notifications/status',subscription=url.pathname==='/prehled/api/notifications/subscription',configuration=url.pathname==='/prehled/api/notifications';
   if(!(configuration&&req.method==='GET'||status&&req.method==='POST'||subscription&&['POST','DELETE'].includes(req.method)))throw fail(405);
   if(req.method!=='GET'){
    if(!sameOrigin(req,origin))throw fail(403);if(limited?.(req,30,60000))throw fail(429);
    if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']??'')||req.headers['content-encoding']&&req.headers['content-encoding']!=='identity')throw fail(415);
   }
   if(configuration){send(res,200,await service.current(session));return true;}
   const input=await body(req,{strictUtf8:true});
   if(status||req.method==='DELETE'){if(!exact(input,['endpoint']))throw fail();send(res,200,status?await service.current(session,input.endpoint):await service.unsubscribe(session,input.endpoint));}
   else send(res,200,await service.subscribe(session,input));
  }catch(error){const status=[400,401,403,405,409,413,415,429,503].includes(error.status)?error.status:error instanceof SyntaxError?400:503;send(res,status,{ok:false,code:status===401?'unauthorized':status===403?'rejected':status===503?'unavailable':'invalid-request'},'application/json',[429,503].includes(status)?{'Retry-After':'60'}:{});}
  return true;
 };
}
