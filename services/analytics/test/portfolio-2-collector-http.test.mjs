import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('portfolio-2 collector serves its exact revision and isolates Myslopis acceptance from other sites and privacy suppression',async()=>{
 const received=[];
 const upstream=createServer(async(req,res)=>{
  assert.equal(req.url,'/api/send');assert.equal(req.headers['x-real-ip'],'192.0.2.2');
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  received.push(JSON.parse(Buffer.concat(chunks).toString()));res.writeHead(200,{'Content-Type':'application/json'});res.end('{}');
 });
 await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
 const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
 const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
 const directory=await mkdtemp(join(tmpdir(),'vcode-portfolio-2-collector-')),registry=join(directory,'sites.json');
 const site={id:'isolated-portfolio-2',domain:'game.example',collectionEnabled:true,approvedAt:'2026-10-04',metricsApprovedAt:'2026-10-04',portfolioMetricsApprovedAt:'2026-10-09T14:00:00Z',integrationVersion:'vcode-public-v2',captureSources:true,allowedEvents:['outbound-click','portfolio-myslopis-click'],collectorKey:'isolated-game-edge-key',allowedPaths:['/mestem-hrou/']};
 const otherSite={...site,id:'isolated-portfolio-1',allowedEvents:['outbound-click','portfolio-vcode-click']};
 await writeFile(registry,JSON.stringify([site,otherSite]));
 const child=spawn(process.execPath,['services/analytics/collector.mjs'],{env:{...process.env,PORT:String(port),ANALYTICS_UPSTREAM:`http://127.0.0.1:${upstream.address().port}`,ANALYTICS_SITES_FILE:registry},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}`,headers={'Content-Type':'application/json',Origin:'https://game.example','Sec-Fetch-Site':'same-origin','X-VCode-Collector-Key':site.collectorKey,'X-VCode-Client-IP':'192.0.2.2'};
 const input={website:site.id,name:'portfolio-myslopis-click',path:'/mestem-hrou/'};
 const post=(payload,patch={})=>fetch(base+'/v2/events',{method:'POST',headers:{...headers,...patch},body:JSON.stringify(payload)});
 try{
  let ready=false;for(let n=0;n<50;n++){try{if((await fetch(base+'/health')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,20));}assert.ok(ready);
  const response=await fetch(base+'/v2/tracker-portfolio-2.js');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL('../public-v2-portfolio-2.js',import.meta.url)));
  assert.equal((await post(input)).status,204);
  assert.deepEqual(received,[{type:'event',payload:{website:site.id,hostname:site.domain,url:'https://game.example/mestem-hrou/',referrer:'',name:'portfolio-myslopis-click'}}]);
  assert.equal((await post({...input,website:otherSite.id})).status,400);
  for(const [patch,status]of [[{DNT:'1'},204],[{'Sec-GPC':'1'},204],[{Origin:'https://evil.example'},400],[{'X-VCode-Collector-Key':'spoofed'},400]])assert.equal((await post(input,patch)).status,status);
  for(const patch of [{target:'https://myslopis.cz/'},{text:'Myslopis'},{source:'google'},{path:'/account/'},{name:'portfolio-arbitrary-click'}])assert.equal((await post({...input,...patch})).status,400);
  await writeFile(registry,JSON.stringify([{...site,portfolioMetricsApprovedAt:'invalid date'},otherSite]));
  assert.equal((await post(input)).status,400);assert.equal(received.length,1);
  assert.equal((await post({...input,name:'outbound-click'})).status,204);assert.equal(received.length,2);
 }finally{
  if(child.exitCode===null&&child.signalCode===null){const stopped=new Promise(resolve=>child.once('exit',resolve));child.kill();await stopped;}
  upstream.closeAllConnections();await new Promise(resolve=>upstream.close(resolve));
  await rm(directory,{recursive:true,force:true});
 }
});
