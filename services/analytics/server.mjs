import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import {periodWindow,dailySeries} from './dashboard-data.mjs';
import { sanitizeEvent, sameOrigin } from './security.mjs';
const upstream=process.env.ANALYTICS_UPSTREAM ?? 'http://umami:3000';
const origin=process.env.PUBLIC_SITE_URL ?? 'https://vcode.zeleznalady.cz';
const statusPath=process.env.ANALYTICS_STATUS_FILE??'/state/connections.json';
const registryPath=process.env.ANALYTICS_SITES_FILE ?? '/run/config/sites.json';
const sessions=new Map(),attempts=new Map();
const enabled=process.env.ANALYTICS_COLLECTION_ENABLED==='true';
const here=new URL('./',import.meta.url);
const page=await readFile(new URL('dashboard.html',here));
const script=await readFile(new URL('dashboard.js',here));
const css=await readFile(new URL('dashboard.css',here));
const staticAssets=new Map();
for(const [name,type] of [['manifest.webmanifest','application/manifest+json'],['sw.js','text/javascript'],['offline.html','text/html'],['icon-192.png','image/png'],['icon-512.png','image/png']])staticAssets.set('/prehled/'+name,{body:await readFile(new URL(name,here)),type});
const tracker=await readFile(new URL('tracker.js',here),'utf8');
async function sites(){return JSON.parse(await readFile(registryPath,'utf8'));}
function send(res,status,body,type='application/json',headers={}){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'",...headers});res.end(typeof body==='object'&&!Buffer.isBuffer(body)?JSON.stringify(body):body);}
async function body(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>4096)throw Object.assign(new Error('too large'),{status:413});chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
async function api(path,token,options={}){const r=await fetch(upstream+'/api/'+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Object.assign(new Error('upstream failed'),{status:r.status===401?401:502});return r.json();}
function session(req){const id=/__Host-vcode-metrics=([a-f0-9]{64})/.exec(req.headers.cookie??'')?.[1];const s=sessions.get(id);if(!s||s.until<Date.now()){if(id)sessions.delete(id);return null;}return {...s,id};}
const cookie=(id,age)=>`__Host-vcode-metrics=${id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
function limited(req,limit,windowMs){const key=String(req.headers['x-real-ip']??req.socket.remoteAddress).split(',').at(-1).trim()+':'+(req.url?.includes('login')?'login':'event');const now=Date.now();const bucket=attempts.get(key)??{count:0,until:now+windowMs};if(bucket.until<now){bucket.count=0;bucket.until=now+windowMs;}bucket.count++;attempts.set(key,bucket);return bucket.count>limit;}
setInterval(()=>{const now=Date.now();for(const [k,v]of sessions)if(v.until<now)sessions.delete(k);for(const[k,v]of attempts)if(v.until<now)attempts.delete(k);},60000).unref();
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
   const input=await body(req);if(typeof input.username!=='string'||typeof input.password!=='string'||input.username.length>255||input.password.length>255){send(res,400,{});return;}
   const auth=await api('auth/login',null,{method:'POST',body:JSON.stringify({username:input.username,password:input.password})});
   if(!auth.token){send(res,401,{error:'Přihlášení vyžaduje další ověření.'});return;}
   if(sessions.size>=1000){send(res,503,{});return;}
   const id=randomBytes(32).toString('hex');sessions.set(id,{token:auth.token,until:Date.now()+3600000});send(res,200,{ok:true},'application/json',{'Set-Cookie':cookie(id,3600)});return;
  }
  if(path==='/prehled/api/logout'){const s=session(req);if(s)sessions.delete(s.id);send(res,200,{ok:true},'application/json',{'Set-Cookie':cookie('',0)});return;}
 }
 const s=session(req);
 if(path==='/prehled/'&&req.method==='GET'){send(res,200,page,'text/html');return;}
 if(!s){send(res,401,{error:'Přihlaste se.'});return;}
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
   const metadata={name:site.name,domain:site.domain,collectionEnabled:site.collectionEnabled??(site.domain===new URL(origin).hostname&&enabled),approvedAt:site.approvedAt??null,collectionStartedAt:site.collectionStartedAt??null,registeredAt:website.createdAt??null,integrationVersion:site.integrationVersion??'vcode-legacy',capabilities:{referrers:hasSources,events:legacy?['app-store-click','contact-click']:expanded?(site.allowedEvents??[]):[]},connection:connections.find(c=>c.domain===site.domain)??null};
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
  }));send(res,200,{...window,collectionEnabled:enabled,generatedAt:new Date().toISOString(),sessionExpiresAt:new Date(s.until).toISOString(),incomplete:data.some(site=>site&&site.available===false),sites:data.filter(Boolean)});return;
 }
 send(res,404,{});
 }catch(error){const status=error.status??(error instanceof SyntaxError?400:502);send(res,status,{error:status===401?'Nesprávné přihlašovací údaje.':'Požadavek se nepodařilo dokončit.'});}
}).listen(Number(process.env.PORT??8091),'0.0.0.0');
