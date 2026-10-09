import {readFile} from 'node:fs/promises';
import {createPartnershipStore} from './partnership-store.mjs';
import {telegramCall} from './telegram.mjs';
import {PARTNERSHIP_CONTRACT,PARTNERSHIP_STAGES,UUID,equal,failure,plain,normalizedText,loadPartnershipRegistry,
 validatePartnershipChallenge,validatePartnershipPayload,issuePartnershipChallenge,authenticPartnershipChallenge,validPartnershipChallenge,
 partnershipBody,validatePartnershipUpdate,validatePartnershipPromotion} from './partnership-security.mjs';

const PREFIX='/internal/partnerships',KEY=/^[A-Za-z0-9_-]{32,256}$/;
const ERROR_STATUS={'invalid-input':400,'privacy-version-mismatch':400,unauthorized:401,rejected:403,'not-found':404,
 'method-not-allowed':405,'idempotency-conflict':409,'request-closed':410,'too-large':413,'invalid-content-type':415,'rate-limit':429,unavailable:503};
const ERROR_TEXT={'invalid-input':'Invalid request.','privacy-version-mismatch':'The processing notice version does not match.',unauthorized:'Authentication is required.',
 rejected:'The request cannot be accepted.','not-found':'The requested item was not found.','method-not-allowed':'This method is not allowed.',
 'idempotency-conflict':'The request conflicts with the existing record.','request-closed':'The original request is closed.',
 'too-large':'The request is too large.','invalid-content-type':'Use uncompressed UTF-8 JSON.','rate-limit':'Try again later.',unavailable:'The service is temporarily unavailable.'};
const json=(res,status,value,headers={})=>{
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
  'X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",...headers});
 res.end(JSON.stringify(value));
};
const safeId=value=>typeof value==='string'&&UUID.test(value)?value.toLowerCase():null;
const withoutBrowserContext=request=>{
 if(Object.keys(request.headers).some(name=>{
  const key=name.toLowerCase();
  return key==='origin'||key==='cookie'||key.startsWith('sec-fetch-')&&(key!=='sec-fetch-mode'||request.headers[name]!=='cors');
 }))throw failure(403,'rejected');
 // Node's server-side fetch emits only Sec-Fetch-Mode:cors; browsers also send
 // Origin or site/destination metadata, which remain rejected above.
};
const query=(url,allowed)=>{
 if([...url.searchParams.keys()].some(name=>!allowed.includes(name))||allowed.some(name=>url.searchParams.getAll(name).length>1))throw failure(400,'invalid-input');
 const raw=url.searchParams.get('limit'),limit=raw===null?50:Number(raw),appId=url.searchParams.get('appId');
 if(raw!==null&&!/^[1-9]\d{0,2}$/.test(raw)||!Number.isInteger(limit)||limit<1||limit>100
  ||appId!==null&&(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(appId)||appId.length>100))throw failure(400,'invalid-input');
 const stage=url.searchParams.get('stage');if(stage!==null&&!PARTNERSHIP_STAGES.includes(stage))throw failure(400,'invalid-input');
 return {limit,appId,...(allowed.includes('stage')?{stage}:{})};
};

export async function createPartnershipService({pool,config,clock=()=>Date.now(),fetchImpl=fetch,store,registryProvider}){
 const catalog=new Map();
 try{
  const entries=JSON.parse(await readFile(config.contactCatalogPath??new URL('./contact-catalog.json',import.meta.url),'utf8'));
  if(!Array.isArray(entries)||!entries.length||entries.length>100)throw new Error('catalog');
  for(const item of entries){
   if(!plain(item)||Object.keys(item).sort().join(',')!=='id,name'||typeof item.id!=='string'||item.id.length>100
    ||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)||catalog.has(item.id)||normalizedText(item.name,1,100)!==item.name)throw new Error('catalog');
   catalog.set(item.id,item.name);
  }
 }catch{catalog.clear();}
 let origin;
 try{const parsed=new URL(config.siteOrigin);origin=parsed.protocol==='https:'||parsed.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(parsed.hostname)?parsed.origin:null;}catch{origin=null;}
 const inboxReady=Boolean(origin&&catalog.size&&typeof config.contactInboxToken==='string'&&config.contactInboxToken.length>=32&&UUID.test(config.contactInboxOwnerId??''));
 const challengeReady=typeof config.partnershipChallengeSecret==='string'&&KEY.test(config.partnershipChallengeSecret)
  &&!equal(config.partnershipChallengeSecret,config.contactInboxToken)&&!equal(config.partnershipChallengeSecret,config.contactFormSecret);
 const notificationsReady=()=>Boolean(config.telegramEnabled&&config.telegramBotToken&&config.telegramChatId);
 const baseReady=()=>Boolean(config.partnershipIntakeEnabled===true&&inboxReady&&challengeReady&&notificationsReady());
 const forbidden=[config.contactInboxToken,config.partnershipChallengeSecret,config.contactFormSecret].filter(Boolean);
 let registry=null,lastReady=false;
 const reload=async()=>{
  try{registry=registryProvider?await registryProvider(catalog,forbidden):await loadPartnershipRegistry(config.partnershipRegistryFile,catalog,forbidden);}
  catch{registry=null;}
  // Providers are an explicit testing dependency and return the validated loader result.
  if(!Array.isArray(registry)||!registry.length||registry.length>100||registry.some(app=>!plain(app)||!catalog.has(app.appId)
   ||typeof app.enabled!=='boolean'||typeof app.key!=='string'||app.key&&(!KEY.test(app.key)||forbidden.includes(app.key)))
   ||new Set(registry.map(app=>app.appId)).size!==registry.length
   ||new Set(registry.filter(app=>app.key).map(app=>app.key)).size!==registry.filter(app=>app.key).length)registry=null;
  lastReady=Boolean(baseReady()&&registry?.some(app=>app.enabled&&app.key));return registry;
 };
 const storage=store??createPartnershipStore({pool,clock,hashSecret:challengeReady?config.partnershipChallengeSecret:undefined});
 const counters=new Map();
 const limit=(kind,app,bucket)=>{
  const now=clock(),window=kind==='challenge'?600000:3600000;
  for(const [key,value]of counters)if(value.until<=now)counters.delete(key);
  const checks=[[`${kind}:${app}:${bucket}`,kind==='challenge'?12:8],[`${kind}:${app}`,kind==='challenge'?120:60]];
  if(counters.size+checks.filter(([key])=>!counters.has(key)).length>5000)throw failure(429,'rate-limit');
  for(const [key,maximum]of checks){let item=counters.get(key);if(!item){item={count:0,until:now+window};counters.set(key,item);}if(++item.count>maximum)throw failure(429,'rate-limit');}
 };
 const authenticateApp=request=>{
  const authorization=request.headers.authorization;
  if(typeof authorization!=='string'||!authorization.startsWith('Bearer ')||authorization.length>263)throw failure(401,'unauthorized');
  const supplied=authorization.slice(7);
  if(!KEY.test(supplied))throw failure(401,'unauthorized');
  const app=registry?.find(item=>item.enabled&&item.key&&equal(item.key,supplied));
  if(!app)throw failure(401,'unauthorized');return app;
 };
 const authenticateAdmin=request=>{
  if(!inboxReady)throw failure(503,'unavailable');
  if(!equal(request.headers.authorization,'Bearer '+config.contactInboxToken)
   ||request.headers['x-vcode-admin-id']!==config.contactInboxOwnerId)throw failure(401,'unauthorized');
  return config.contactInboxOwnerId;
 };
 const applications=()=>registry?.map(({appId,types})=>({id:appId,name:catalog.get(appId),types:[...types]}))??[];
 const policies=()=>registry?.filter(app=>app.enabled&&app.partnerPolicy?.enabled).map(app=>({appId:app.appId,policyVersion:app.partnerPolicy.version}))??[];

 async function handle(request,res){
  const raw=request.url??'';if(typeof raw!=='string'||!raw.startsWith(PREFIX))return false;
  let requestId=null;
  try{
   const url=new URL(raw,origin??'https://example.invalid');
   if(!url.pathname.startsWith(PREFIX+'/')||url.hash||url.pathname.includes('%'))throw failure(404,'not-found');
   withoutBrowserContext(request);await reload();
   const intake=['/internal/partnerships/v1/challenge','/internal/partnerships/v1/submissions'].includes(url.pathname);
   if(intake){
    if(url.search)throw failure(400,'invalid-input');
    if(request.method!=='POST')throw failure(405,'method-not-allowed');
    if(!lastReady)throw failure(503,'unavailable');
    authenticateApp(request);const input=await partnershipBody(request);requestId=safeId(input?.requestId);
    await reload();if(!lastReady)throw failure(503,'unavailable');const app=authenticateApp(request);
    if(url.pathname.endsWith('/challenge')){
     const challenge=validatePartnershipChallenge(input);limit('challenge',app.appId,challenge.clientBucket);
     json(res,200,issuePartnershipChallenge(app,challenge,config.partnershipChallengeSecret,clock()));return true;
    }
    const payload=validatePartnershipPayload(input,app);limit('submit',app.appId,input.clientBucket);
    const authenticated=authenticPartnershipChallenge(input.token,app,input,config.partnershipChallengeSecret),now=clock();
    if(!authenticated||authenticated.issuedAt>now)throw failure(403,'rejected');
    const reference=await storage.save(payload,{challengeValid:validPartnershipChallenge(input.token,app,input,config.partnershipChallengeSecret,now)});
    json(res,202,{ok:true,contractVersion:PARTNERSHIP_CONTRACT,requestId:payload.requestId,reference});return true;
   }
   const actorId=authenticateAdmin(request);
   if(url.pathname==='/internal/partnerships/v1/inquiries'){
    if(request.method!=='GET')throw failure(405,'method-not-allowed');
    const options=query(url,['limit','stage','appId']);if(options.appId&&!catalog.has(options.appId))throw failure(400,'invalid-input');
    const result=await storage.list(options);json(res,200,{...result,applications:applications(),promotionEnabled:policies()});return true;
   }
   if(url.pathname==='/internal/partnerships/v1/partners'){
    if(request.method!=='GET')throw failure(405,'method-not-allowed');
    const options=query(url,['limit','appId']);if(options.appId&&!catalog.has(options.appId))throw failure(400,'invalid-input');
    json(res,200,await storage.listPartners(options));return true;
   }
   if(url.search)throw failure(400,'invalid-input');
   const inquiry=/^\/internal\/partnerships\/v1\/inquiries\/([a-f0-9-]{36})(\/promote)?$/i.exec(url.pathname);
   if(inquiry&&UUID.test(inquiry[1])){
    const id=inquiry[1].toLowerCase();
    if(inquiry[2]){
     if(request.method!=='POST')throw failure(405,'method-not-allowed');
     const input=validatePartnershipPromotion(await partnershipBody(request));await reload();const appId=await storage.getApplication(id);
     const app=registry?.find(entry=>entry.appId===appId&&entry.enabled),policy=app?.partnerPolicy;
     if(!baseReady()||!policy?.enabled)throw failure(403,'rejected');
     json(res,200,{ok:true,partner:await storage.promote(id,input,actorId,policy)});return true;
    }
    if(request.method==='PATCH'){const input=validatePartnershipUpdate(await partnershipBody(request),actorId);json(res,200,{ok:true,item:await storage.update(id,input,actorId)});return true;}
    if(request.method==='DELETE'){json(res,200,await storage.remove(id,actorId));return true;}
    throw failure(405,'method-not-allowed');
   }
   const partner=/^\/internal\/partnerships\/v1\/partners\/([a-f0-9-]{36})$/i.exec(url.pathname);
   if(partner&&UUID.test(partner[1])){
    if(request.method!=='DELETE')throw failure(405,'method-not-allowed');json(res,200,await storage.removePartner(partner[1].toLowerCase(),actorId));return true;
   }
   throw failure(404,'not-found');
  }catch(error){
   const code=Object.hasOwn(ERROR_STATUS,error?.code)&&ERROR_STATUS[error.code]===error.status?error.code:'unavailable',status=ERROR_STATUS[code];
   if(!res.headersSent)json(res,status,{ok:false,code,message:ERROR_TEXT[code],requestId},status===429||status===503?{'Retry-After':'60'}:{});
   request.resume?.();return true;
  }
 }
 async function maintenance(){
  await reload();
  return storage.maintenance({notify:lastReady?async job=>{
   // Recheck revocation immediately before delivery; never include contact or message fields.
   await reload();const app=registry?.find(entry=>entry.appId===job.appId&&entry.enabled);
   if(!lastReady||!app)throw failure(503,'unavailable');
   const text=`Nová nabídka partnerství pro ${catalog.get(app.appId)}\nReference: ${job.reference}\n${new URL('/prehled/#partnerships',origin).href}`;
   await telegramCall(config,'sendMessage',{chat_id:config.telegramChatId,text,disable_web_page_preview:true},fetchImpl);
  }:undefined});
 }
 await reload();
 return {handle,maintenance,get ready(){return lastReady;}};
}
