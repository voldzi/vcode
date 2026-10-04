import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('dashboard data requires login, token stays server-side, logout revokes access',async()=>{
 const upstream=createServer((req,res)=>{res.setHeader('Content-Type','application/json');const p=req.url;if(p==='/api/auth/login'){res.end(JSON.stringify({token:'test-internal-token'}));return;}assert.equal(req.headers.authorization,'Bearer test-internal-token');if(p.startsWith('/api/websites?'))res.end(JSON.stringify({data:[{id:'site'},{id:'isolated'},{id:'foreign'}]}));else if(p.includes('/websites/foreign/')){res.statusCode=503;res.end('{}');}else if(p.includes('/stats?'))res.end(JSON.stringify({pageviews:2,visitors:1,visits:1}));else if(p.includes('/pageviews?'))res.end(JSON.stringify({pageviews:[{x:new Date().toISOString(),y:2}]}));else {assert.match(p,/type=(path|referrer|event)&/);res.end('[]');}});
 await new Promise(r=>upstream.listen(0,'127.0.0.1',r));
 const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 const directory=await mkdtemp(join(tmpdir(),'vcode-metrics-'));const registry=join(directory,'sites.json');await writeFile(registry,JSON.stringify([{id:'site',name:'Test site',domain:'example.com',collectorKey:'never-return-this-private-key'},{id:'isolated',name:'Isolated acceptance',domain:'example.com',testOnly:true},{id:'foreign',name:'Other website',domain:'other.example',collectionEnabled:false,integrationVersion:'vcode-public-v1'}]));
 const child=spawn(process.execPath,['services/analytics/server.mjs'],{env:{...process.env,PORT:String(port),ANALYTICS_COLLECTION_ENABLED:'true',ANALYTICS_UPSTREAM:`http://127.0.0.1:${upstream.address().port}`,PUBLIC_SITE_URL:'https://example.com',ANALYTICS_SITES_FILE:registry},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}`;
 try{
  let ready=false;for(let n=0;n<50;n++){try{const r=await fetch(base+'/health');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,20));}assert.ok(ready);
  assert.equal((await fetch(base+'/prehled/api/summary')).status,401);
  assert.equal((await fetch(base+'/prehled/api/login',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'})).status,403);
  const login=await fetch(base+'/prehled/api/login',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({username:'test',password:'test-pass'})});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);assert.ok(!(await login.text()).includes('test-internal-token'));
  const headers={Cookie:cookie.split(';')[0],Origin:'https://example.com'};
  const summary=await fetch(base+'/prehled/api/summary',{headers});assert.equal(summary.status,200);const summaryBody=await summary.text();assert.ok(!summaryBody.includes('never-return-this-private-key'));const parsed=JSON.parse(summaryBody);assert.equal(parsed.sites.length,2);assert.equal(parsed.incomplete,true);assert.equal(parsed.sites[1].stats,null);assert.equal(parsed.sites[1].available,false);assert.equal(parsed.sites[1].capabilities.referrers,false);assert.equal(parsed.sites[0].stats.pageviews,2);assert.equal(parsed.timezone,'Europe/Prague');assert.ok(parsed.sessionExpiresAt);assert.equal(parsed.sites[0].series.at(-1).pageviews,2);
  for(const asset of ['manifest.webmanifest','sw.js','offline.html','icon-192.png']){const response=await fetch(base+'/prehled/'+asset);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');if(asset==='sw.js')assert.equal(response.headers.get('service-worker-allowed'),'/prehled/');}
  assert.equal((await fetch(base+'/analytics/tracker.js')).status,200);assert.match(await (await fetch(base+'/analytics/tracker.js')).text(),/const website='site'/);
  assert.equal((await fetch(base+'/analytics/event',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({website:'foreign',name:'pageview',url:'https://other.example/'})})).status,400);
  await fetch(base+'/prehled/api/logout',{method:'POST',headers,body:'{}'});assert.equal((await fetch(base+'/prehled/api/summary',{headers})).status,401);
  for(let n=0;n<11;n++){
   const attempt=await fetch(base+'/prehled/api/login',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json','X-Real-IP':'untrusted-'+n+', 192.0.2.99'},body:JSON.stringify({username:'test',password:'test-pass'})});
   assert.equal(attempt.status,n<10?200:429);
  }
 }finally{if(child.exitCode===null&&child.signalCode===null){const stopped=new Promise(r=>child.once('exit',r));child.kill();await stopped;}upstream.closeAllConnections();await new Promise(r=>upstream.close(r));await rm(directory,{recursive:true,force:true});}
});
