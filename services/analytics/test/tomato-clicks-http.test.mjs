import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {TOMATO_CLICK_PATHS,TOMATO_NOTICE_VERSION} from '../tomato-click-policy.mjs';
const listen=s=>new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
test('isolated HTTP collector and authenticated dashboard enforce the exact Tomato approval, preserving legacy counters',async()=>{
 const id='e155b7ef-28c5-4787-96cb-53777ecf693c',origin='https://vcode.zeleznalady.cz';
 const directory=await mkdtemp(join(tmpdir(),'vcode-tomato-click-'));const registry=join(directory,'registry.json');
 const sent=[];const upstream=createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');if(req.url==='/api/send'){let raw='';for await(const chunk of req)raw+=chunk;sent.push(JSON.parse(raw));res.end('{}');return;}if(req.url==='/api/auth/login'){res.end('{"token":"synthetic-local-token"}');return;}assert.equal(req.headers.authorization,'Bearer synthetic-local-token');if(req.url.startsWith('/api/websites?'))res.end(JSON.stringify({data:[{id}]}));else if(req.url.includes('/stats?'))res.end('{"pageviews":0,"visitors":0,"visits":0}');else if(req.url.includes('/pageviews?'))res.end('{"pageviews":[]}');else res.end('[]');});
 await listen(upstream);const probe=createServer();await listen(probe);const port=probe.address().port;await new Promise(r=>probe.close(r));
 const site={id,domain:'vcode.zeleznalady.cz',name:'Synthetic VCode',tomatoPlayClicks:{enabled:true,paths:[...TOMATO_CLICK_PATHS],noticeVersion:TOMATO_NOTICE_VERSION,approvedAt:'2026-10-15T17:00:00Z',publishedAt:'2026-10-15T17:30:00Z',collectionStartedAt:'2026-10-15T17:31:00Z',noticeCsSHA256:'a'.repeat(64),noticeEnSHA256:'b'.repeat(64)}};
 const save=()=>writeFile(registry,JSON.stringify([site]));await save();
 const child=spawn(process.execPath,['services/analytics/server.mjs'],{env:{...process.env,PORT:String(port),ANALYTICS_SESSION_DIR:join(directory,'sessions'),ANALYTICS_COLLECTION_ENABLED:'true',ANALYTICS_UPSTREAM:`http://127.0.0.1:${upstream.address().port}`,PUBLIC_SITE_URL:origin,ANALYTICS_SITES_FILE:registry},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}`,event=path=>({website:id,name:'outbound-click',url:origin+path});
 const post=(body,headers={})=>fetch(base+'/analytics/event',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
 try{
  let ready=false;for(let n=0;n<100;n++){try{if((await fetch(base+'/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,20));}assert.ok(ready);
  assert.equal((await fetch(base+'/prehled/api/summary')).status,401);
  for(const path of TOMATO_CLICK_PATHS)assert.equal((await post(event(path))).status,204);
  assert.deepEqual(sent.map(x=>x.payload.name),['outbound-click','outbound-click']);
  for(const [i,path]of TOMATO_CLICK_PATHS.entries())assert.deepEqual(sent[i],{type:'event',payload:{website:id,hostname:'vcode.zeleznalady.cz',url:origin+path,referrer:'',name:'outbound-click'}});
  for(const path of ['/','/en/','/hry/','/aplikace/nest/','/api/','/prehled/','/en/apps/rajcatova-sklizen/private'])assert.equal((await post(event(path))).status,400);
  for(const body of [{...event(TOMATO_CLICK_PATHS[0]),target:'excluded'},{...event(TOMATO_CLICK_PATHS[0]),url:origin+TOMATO_CLICK_PATHS[0]+'?utm_source=excluded'}])assert.equal((await post(body)).status,400);
  assert.equal((await post(event(TOMATO_CLICK_PATHS[0]),{Origin:'https://other.example'})).status,403);
  assert.equal((await post(event(TOMATO_CLICK_PATHS[0]),{DNT:'1'})).status,204);
  assert.equal((await post(event(TOMATO_CLICK_PATHS[0]),{'Sec-GPC':'1'})).status,204);assert.equal(sent.length,2);
  assert.equal((await post({website:id,name:'app-store-click',url:origin+'/aplikace/nest/?utm_source=approved#excluded',referrer:'https://www.google.com/search?q=excluded'})).status,204);
  assert.equal(sent.at(-1).payload.url,origin+'/aplikace/nest/?utm_source=approved');assert.equal(sent.at(-1).payload.referrer,'https://www.google.com');
  const login=await fetch(base+'/prehled/api/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({username:'synthetic',password:'synthetic'})});assert.equal(login.status,200);const headers={Cookie:login.headers.get('set-cookie').split(';')[0]};
  const summary=await (await fetch(base+'/prehled/api/summary',{headers})).json();assert.ok(summary.sites[0].capabilities.events.includes('outbound-click'));assert.deepEqual(summary.sites[0].capabilities.scopes,{'outbound-click':'tomato-play'});assert.ok(!JSON.stringify(summary).includes('noticeCsSHA256'));
  site.tomatoPlayClicks.enabled=false;await save();assert.equal((await post(event(TOMATO_CLICK_PATHS[0]))).status,400);assert.equal(sent.length,3);
  const revoked=await (await fetch(base+'/prehled/api/summary',{headers})).json();assert.ok(!revoked.sites[0].capabilities.events.includes('outbound-click'));assert.equal(revoked.sites[0].capabilities.scopes,undefined);
 }finally{if(child.exitCode===null&&child.signalCode===null){const stopped=new Promise(r=>child.once('exit',r));child.kill();await stopped;}upstream.closeAllConnections();await new Promise(r=>upstream.close(r));await rm(directory,{recursive:true,force:true});}
});
