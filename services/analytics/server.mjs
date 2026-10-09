import { createServer } from 'node:http';
import { readFile, open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { isAbsolute } from 'node:path';
import {createSessionStore} from './sessions.mjs';
import {periodWindow,dailySeries} from './dashboard-data.mjs';
import { sanitizeEvent, sameOrigin } from './security.mjs';
import {canReadDownloadMetrics,readDownloadMetrics,unavailableDownloadMetrics} from './lib/download-metrics.mjs';
const upstream=process.env.ANALYTICS_UPSTREAM ?? 'http://umami:3000';
const origin=process.env.PUBLIC_SITE_URL ?? 'https://vcode.zeleznalady.cz';
const statusPath=process.env.ANALYTICS_STATUS_FILE??'/state/connections.json';
const registryPath=process.env.ANALYTICS_SITES_FILE ?? '/run/config/sites.json';
const sessions=await createSessionStore(process.env.ANALYTICS_SESSION_DIR);
const attempts=new Map();
const enabled=process.env.ANALYTICS_COLLECTION_ENABLED==='true';
const here=new URL('./',import.meta.url);
const page=await readFile(new URL('dashboard.html',here));
const script=await readFile(new URL('dashboard.js',here));
const css=await readFile(new URL('dashboard.css',here));
const staticAssets=new Map();
for(const [name,type] of [['manifest.webmanifest','application/manifest+json'],['sw.js','text/javascript'],['offline.html','text/html'],['icon-192.png','image/png'],['icon-512.png','image/png'],['download-metrics-ui.js','text/javascript'],['contact-inbox-ui.js','text/javascript']])staticAssets.set('/prehled/'+name,{body:await readFile(new URL(name,here)),type});
const tracker=await readFile(new URL('tracker.js',here),'utf8');
async function sites(){return JSON.parse(await readFile(registryPath,'utf8'));}
function send(res,status,body,type='application/json',headers={}){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'",...headers});res.end(typeof body==='object'&&!Buffer.isBuffer(body)?JSON.stringify(body):body);}
async function body(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>4096)throw Object.assign(new Error('too large'),{status:413});chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
async function api(path,token,options={}){const r=await fetch(upstream+'/api/'+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Object.assign(new Error('upstream failed'),{status:r.status===401?401:502});return r.json();}
const CONTACT_UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const CONTACT_STATUS=new Set(['new','read','closed']);
const CONTACT_AREA=new Set(['development','partnership','private-deployment','other']);
async function contactSecret(path,pattern){
 if(typeof path!=='string'||!isAbsolute(path))throw Object.assign(new Error('contact unavailable'),{status:503});
 let file;try{file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);const info=await file.stat();if(!info.isFile()||info.size>512||(info.mode&0o077)!==0)throw Error();const value=(await file.readFile('utf8')).trim();if(!pattern.test(value))throw Error();return value;}catch{throw Object.assign(new Error('contact unavailable'),{status:503});}finally{await file?.close();}
}
async function contactAuthorization(s){
 // Verify the opaque upstream token now. Browser usernames/roles are never accepted.
 const verified=await api('auth/verify',s.token,{method:'POST'});
 if(verified.role!=='admin'||!CONTACT_UUID.test(verified.id??''))throw Object.assign(new Error('forbidden'),{status:403});
 const owner=await contactSecret(process.env.CONTACT_INBOX_OWNER_ID_FILE,CONTACT_UUID);
 if(verified.id.toLowerCase()!==owner.toLowerCase())throw Object.assign(new Error('forbidden'),{status:403});
 const permitted=await api('websites?pageSize=100',s.token),rows=Array.isArray(permitted)?permitted:permitted.data??[];
 if(!canReadDownloadMetrics(rows,process.env.VCODE_ANALYTICS_WEBSITE_ID))throw Object.assign(new Error('forbidden'),{status:403});
 const key=await contactSecret(process.env.CONTACT_INBOX_TOKEN_FILE,/^[A-Za-z0-9_-]{32,256}$/);
 let service;try{service=new URL(process.env.CONTACT_SERVICE_URL);if(!['http:','https:'].includes(service.protocol)||service.username||service.password||service.search||service.hash||service.pathname!=='/')throw Error();}catch{throw Object.assign(new Error('contact unavailable'),{status:503});}
 return{key,service};
}
async function contactRequest(context,path,options={}){
 const response=await fetch(new URL(path,context.service),{...options,redirect:'error',headers:{'Content-Type':'application/json',Authorization:'Bearer '+context.key},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Object.assign(new Error('contact failed'),{status:[400,404,409,429].includes(response.status)?response.status:502});
 const reader=response.body.getReader();let size=0,chunks=[];try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>2*1024*1024){await reader.cancel();throw Error('response too large');}chunks.push(Buffer.from(next.value));}}finally{reader.releaseLock();}
 return JSON.parse(Buffer.concat(chunks).toString());
}
function contactResult(result){
 const counts=value=>value&&Object.keys(value).length===4&&['new','read','closed','total'].every(key=>Number.isSafeInteger(value[key])&&value[key]>=0);
 if(!result?.notifications||Object.keys(result.notifications).length!==3||!['pending','sent','failed'].every(key=>Number.isSafeInteger(result.notifications[key])&&result.notifications[key]>=0))throw Error('invalid contact response');
 const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
 const string=(value,max)=>typeof value==='string'&&Array.from(value).length<=max;
 if(!result||!Array.isArray(result.items)||result.items.length>100||!counts(result.summary)||!result.interest||!Number.isSafeInteger(result.interest.received)||result.interest.received<0||!Number.isFinite(result.interest.startAt)||!Number.isFinite(result.interest.endAt))throw Error('invalid contact response');
 if(!Array.isArray(result.catalog)||result.catalog.length>100)throw Error('invalid contact response');const catalog=result.catalog.map(app=>{if(!app||Object.keys(app).length!==2||typeof app.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(app.id)||!string(app.name,100))throw Error('invalid contact response');return{id:app.id,name:app.name};});
 const keys=['id','createdAt','updatedAt','expiresAt','locale','name','email','organization','area','application','message','status'];
 const items=result.items.map(item=>{if(!item||Object.keys(item).length!==keys.length||!keys.every(key=>Object.hasOwn(item,key))||!CONTACT_UUID.test(item.id)||!['cs','en'].includes(item.locale)||!timestamp(item.createdAt)||!timestamp(item.updatedAt)||!timestamp(item.expiresAt)||!string(item.name,100)||!string(item.email,254)||!string(item.message,4000)||!(item.organization===null||string(item.organization,160))||!CONTACT_AREA.has(item.area)||!(item.application===null||string(item.application,80))||!CONTACT_STATUS.has(item.status))throw Error('invalid contact response');return Object.fromEntries(keys.map(key=>[key,item[key]]));});
 const groups=(rows,area)=>{if(!Array.isArray(rows)||rows.length>100)throw Error('invalid contact response');return rows.map(row=>{if(!row||Object.keys(row).length!==2||!Object.hasOwn(row,'id')||!Object.hasOwn(row,'count')||!Number.isSafeInteger(row.count)||row.count<0||!(area?CONTACT_AREA.has(row.id):row.id===null||typeof row.id==='string'&&/^[a-z0-9-]{1,80}$/.test(row.id)))throw Error('invalid contact response');return{id:row.id,count:row.count};});};
 return{items,catalog,summary:{...result.summary},notifications:{pending:result.notifications.pending,sent:result.notifications.sent,failed:result.notifications.failed},interest:{startAt:result.interest.startAt,endAt:result.interest.endAt,received:result.interest.received,areas:groups(result.interest.areas,true),applications:groups(result.interest.applications,false)}};
}
function session(req){const id=/(?:^|;\s*)__Host-vcode-metrics=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie??'')?.[1];return sessions.get(id);}
const cookie=(id,age)=>`__Host-vcode-metrics=${id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
function limited(req,limit,windowMs){const key=String(req.headers['x-real-ip']??req.socket.remoteAddress).split(',').at(-1).trim()+':'+(req.url?.includes('login')?'login':'event');const now=Date.now();const bucket=attempts.get(key)??{count:0,until:now+windowMs};if(bucket.until<now){bucket.count=0;bucket.until=now+windowMs;}bucket.count++;attempts.set(key,bucket);return bucket.count>limit;}
setInterval(()=>{const now=Date.now();void sessions.prune().catch(()=>console.error('Session cleanup failed'));for(const[k,v]of attempts)if(v.until<now)attempts.delete(k);},60000).unref();
createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin),path=url.pathname;
 if(req.method==='GET'&&path==='/health'){send(res,200,{ok:true,collectionEnabled:enabled});return;}
 if(req.method==='GET'&&path==='/analytics/tracker.js'){const site=(await sites()).find(s=>s.domain===new URL(origin).hostname&&!s.testOnly&&!['vcode-public-v1','vcode-public-v2'].includes(s.integrationVersion)&&(s.collectionEnabled===undefined||s.collectionEnabled===true));send(res,200,enabled&&site?tracker.replace('__WEBSITE_ID__',site.id):'/* Collection awaits owner approval. */','text/javascript');return;}
 if(req.method==='POST'&&path==='/analytics/event'){
  if(!enabled||req.headers.dnt==='1'||req.headers['sec-gpc']==='1'){req.resume();send(res,204,'');return;}
  if(!sameOrigin(req,origin)){send(res,403,{});return;}
  if(limited(req,120,60000)){send(res,429,{});return;}
  let payload;try{({payload}=sanitizeEvent(await body(req),(await sites()).filter(s=>s.domain===new URL(origin).hostname&&!s.testOnly&&!['vcode-public-v1','vcode-public-v2'].includes(s.integrationVersion)&&(s.collectionEnabled===undefined||s.collectionEnabled===true))));}catch{send(res,400,{});return;}
  await api('send',null,{method:'POST',body:JSON.stringify({type:'event',payload}),headers:{'User-Agent':String(req.headers['user-agent']??'').slice(0,500),'X-Real-IP':String(req.headers['x-real-ip']??req.socket.remoteAddress).split(',').at(-1).trim()}});send(res,204,'');return;
 }
 if(!path.startsWith('/prehled/')){send(res,404,{});return;}
 if(req.method==='GET'&&staticAssets.has(path)){const asset=staticAssets.get(path);send(res,200,asset.body,asset.type,path==='/prehled/sw.js'?{'Service-Worker-Allowed':'/prehled/'}:{});return;}
 if(req.method==='GET'&&path==='/prehled/dashboard.js'){send(res,200,script,'text/javascript');return;}
 if(req.method==='GET'&&path==='/prehled/dashboard.css'){send(res,200,css,'text/css');return;}
 if(req.method==='POST'){
  if(!sameOrigin(req,origin)){send(res,403,{});return;}
  if(path==='/prehled/api/login'){
   if(limited(req,10,900000)){send(res,429,{error:'Příliš mnoho pokusů. Zkuste to později.'});return;}
   const input=await body(req);if(typeof input.username!=='string'||typeof input.password!=='string'||input.username.length>255||input.password.length>255||(input.remember!==undefined&&typeof input.remember!=='boolean')){send(res,400,{});return;}
   const auth=await api('auth/login',null,{method:'POST',body:JSON.stringify({username:input.username,password:input.password})});
   if(!auth.token){send(res,401,{error:'Přihlášení vyžaduje další ověření.'});return;}
   if(sessions.size>=1000){send(res,503,{});return;}
   const previous=session(req);if(previous)await sessions.remove(previous.id);
   const created=await sessions.create(auth.token,input.remember===true);send(res,200,{ok:true},'application/json',{'Set-Cookie':cookie(created.id,Math.ceil((created.until-Date.now())/1000))});return;
  }
  if(path==='/prehled/api/logout'){const s=session(req);if(s)await sessions.remove(s.id);send(res,200,{ok:true},'application/json',{'Set-Cookie':cookie('',0)});return;}
 }
 const s=session(req);
 if(path==='/prehled/'&&req.method==='GET'){send(res,200,page,'text/html');return;}
 if(!s){send(res,401,{error:'Přihlaste se.'});return;}
 if(path==='/prehled/api/inquiries'||path.startsWith('/prehled/api/inquiries/')){
  if(!['GET','PATCH','DELETE'].includes(req.method)){send(res,405,{});return;}
  if(req.method!=='GET'&&!sameOrigin(req,origin)){send(res,403,{});return;}
  const context=await contactAuthorization(s);
  if(path==='/prehled/api/inquiries'&&req.method==='GET'){
   const window=periodWindow(Number(url.searchParams.get('days')??7)),limit=Number(url.searchParams.get('limit')??50);
   if(!Number.isInteger(limit)||limit<1||limit>100||[...url.searchParams.keys()].some(key=>!['days','limit'].includes(key))){send(res,400,{});return;}
   const result=contactResult(await contactRequest(context,`/internal/contacts?limit=${limit}&startAt=${window.startAt}&endAt=${window.endAt}`));send(res,200,result);return;
  }
  const id=path.slice('/prehled/api/inquiries/'.length);if(!CONTACT_UUID.test(id)||req.method==='GET'){send(res,404,{});return;}
  let options={method:req.method};
  if(req.method==='PATCH'){if(req.headers['content-type']!=='application/json'){send(res,415,{});return;}const input=await body(req);if(!input||Object.keys(input).length!==1||!CONTACT_STATUS.has(input.status)){send(res,400,{});return;}options.body=JSON.stringify({status:input.status});}
  const result=await contactRequest(context,'/internal/contacts/'+id,options);
  if(result?.ok!==true||result.reference!==id||(req.method==='PATCH'&&!CONTACT_STATUS.has(result.status)))throw Error('invalid contact response');
  send(res,200,{ok:true,reference:id,...(req.method==='PATCH'?{status:result.status}:{})});return;
 }
 if(path==='/prehled/api/connection-check'&&req.method==='GET'){send(res,200,{forwarded:Boolean(req.headers['x-real-ip']),spoofed:String(req.headers['x-real-ip']??'').split(',').at(-1).trim()==='diagnostic-invalid'});return;}
 if(path==='/prehled/api/summary'&&req.method==='GET'){
  const window=periodWindow(Number(url.searchParams.get('days')??7)),{days,startAt,endAt}=window;
  const permitted=await api('websites?pageSize=100',s.token);const rows=Array.isArray(permitted)?permitted:permitted.data??[];
  const registered=(await sites()).filter(site=>site.testOnly!==true);let connections=[];try{connections=JSON.parse(await readFile(statusPath,'utf8'));}catch{}
  const data=await Promise.all(registered.map(async site=>{
   const website=rows.find(w=>w.id===site.id);if(!website)return null;
   const legacy=!['vcode-public-v1','vcode-public-v2'].includes(site.integrationVersion);
   const expanded=site.integrationVersion==='vcode-public-v2'&&Boolean(site.metricsApprovedAt);
   const hasSources=legacy||(expanded&&site.captureSources===true),hasEvents=legacy||(expanded&&site.allowedEvents?.length>0);
   const metadata={name:site.name,domain:site.domain,collectionEnabled:site.collectionEnabled??(site.domain===new URL(origin).hostname&&enabled),approvedAt:site.approvedAt??null,collectionStartedAt:site.collectionStartedAt??null,metricsCollectionStartedAt:site.metricsCollectionStartedAt??null,registeredAt:website.createdAt??null,integrationVersion:site.integrationVersion??'vcode-legacy',capabilities:{referrers:hasSources,events:legacy?['app-store-click','contact-click','collaboration-click']:expanded?(site.allowedEvents??[]):[]},connection:connections.find(c=>c.domain===site.domain)??null};
   const q=`startAt=${startAt}&endAt=${endAt}&timezone=Europe%2FPrague`;
   try {
    const [stats,pages,referrers,events,series]=await Promise.all([
     api(`websites/${site.id}/stats?${q}&compare=prev`,s.token),
     api(`websites/${site.id}/metrics?${q}&type=path&limit=200`,s.token),
     hasSources?api(`websites/${site.id}/metrics?${q}&type=referrer&limit=10`,s.token):[],
     hasEvents?api(`websites/${site.id}/metrics?${q}&type=event&limit=10`,s.token):[],
     api(`websites/${site.id}/pageviews?${q}&unit=day`,s.token)
    ]);
    return {...metadata,available:true,stats,pages,referrers,events,series:dailySeries(series,window,metadata.collectionStartedAt??metadata.registeredAt)};
   } catch(error) {if(error.status===401)throw error;return {...metadata,available:false,stats:null,pages:[],referrers:[],events:[],series:[]};}
  }));const downloads=canReadDownloadMetrics(rows,process.env.VCODE_ANALYTICS_WEBSITE_ID)?await readDownloadMetrics(process.env.DOWNLOAD_METRICS_PATH,{days}):unavailableDownloadMetrics('not-authorized');send(res,200,{...window,collectionEnabled:enabled,generatedAt:new Date().toISOString(),sessionExpiresAt:new Date(s.until).toISOString(),incomplete:data.some(site=>site&&site.available===false),sites:data.filter(Boolean),downloads});return;
 }
 send(res,404,{});
 }catch(error){const status=error.status??(error instanceof SyntaxError?400:502);send(res,status,{error:status===401?'Nesprávné přihlašovací údaje.':'Požadavek se nepodařilo dokončit.'});}
}).listen(Number(process.env.PORT??8091),'0.0.0.0');
