import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('portfolio collector preserves old routes and delivers only approved finite events to isolated Umami',async()=>{
 const received=[];
 const upstream=createServer(async(req,res)=>{
  assert.equal(req.url,'/api/send');assert.equal(req.headers['x-real-ip'],'192.0.2.1');
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  received.push(JSON.parse(Buffer.concat(chunks).toString()));res.writeHead(200,{'Content-Type':'application/json'});res.end('{}');
 });
 await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
 const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
 const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
 const directory=await mkdtemp(join(tmpdir(),'vcode-portfolio-collector-')),registry=join(directory,'sites.json');
 const names=['portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click'];
 const site={id:'isolated-portfolio',domain:'studio.example',collectionEnabled:true,approvedAt:'2026-10-04',metricsApprovedAt:'2026-10-04',portfolioMetricsApprovedAt:'2026-10-09',integrationVersion:'vcode-public-v2',captureSources:true,allowedEvents:['outbound-click',...names],collectorKey:'isolated-edge-key',allowedPaths:['/']};
 await writeFile(registry,JSON.stringify([site]));
 const child=spawn(process.execPath,['services/analytics/collector.mjs'],{env:{...process.env,PORT:String(port),ANALYTICS_UPSTREAM:`http://127.0.0.1:${upstream.address().port}`,ANALYTICS_SITES_FILE:registry},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}`,headers={'Content-Type':'application/json',Origin:'https://studio.example','Sec-Fetch-Site':'same-origin','X-VCode-Collector-Key':site.collectorKey,'X-VCode-Client-IP':'192.0.2.1'};
 const post=(payload,patch={},path='/v2/events')=>fetch(base+path,{method:'POST',headers:{...headers,...patch},body:JSON.stringify(payload)});
 const input=name=>({website:site.id,name,path:'/'});
 try{
  let ready=false;for(let n=0;n<50;n++){try{if((await fetch(base+'/health')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,20));}assert.ok(ready);
  for(const [path,filename]of [['/v1/tracker.js','public-v1.js'],['/v2/tracker.js','public-v2.js'],['/v2/tracker-tiktok.js','public-v2-tiktok.js'],['/v2/tracker-portfolio.js','public-v2-portfolio.js']]){
   const response=await fetch(base+path);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);
   assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL('../'+filename,import.meta.url)));
  }
  for(const name of [...names,'outbound-click'])assert.equal((await post(input(name))).status,204);
  assert.equal((await post({...input('pageview'),source:'tiktok'})).status,204);
  assert.equal((await post(input('pageview'),{},'/v1/events')).status,204);
  assert.equal(received.length,6);
  for(const [index,name]of [...names,'outbound-click'].entries())assert.deepEqual(received[index],{type:'event',payload:{website:site.id,hostname:site.domain,url:'https://studio.example/',referrer:'',name}});
  assert.equal(received[4].payload.referrer,'https://tiktok.com/');assert.ok(!Object.hasOwn(received[5].payload,'name'));
  for(const [patch,status]of [[{DNT:'1'},204],[{'Sec-GPC':'1'},204],[{Origin:'https://evil.example'},400],[{'X-VCode-Collector-Key':'spoofed'},400]])assert.equal((await post(input(names[0]),patch)).status,status);
  for(const patch of [{target:'https://mojeporce.cz/'},{text:'link text'},{source:'google'},{path:'/account/'},{name:'unknown-click'}])assert.equal((await post({...input(names[0]),...patch})).status,400);
  await writeFile(registry,JSON.stringify([{...site,portfolioMetricsApprovedAt:null}]));
  for(const name of names)assert.equal((await post(input(name))).status,400);
  assert.equal(received.length,6);
  assert.equal((await post(input('outbound-click'))).status,204);assert.equal(received.length,7);
 }finally{
  if(child.exitCode===null&&child.signalCode===null){const stopped=new Promise(resolve=>child.once('exit',resolve));child.kill();await stopped;}
  upstream.closeAllConnections();await new Promise(resolve=>upstream.close(resolve));
  await rm(directory,{recursive:true,force:true});
 }
});
