import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPublicShell} from '../public-shell.mjs';

test('offline dependencies and worker behavior are part of public shell content identity',async()=>{
 const assets=new Map();
 for(const name of ['dashboard.css','dashboard.js','dashboard-notifications.js','download-metrics-ui.js','contact-inbox-ui.js','partnership-inbox-ui.js','offline.html','icon-192.png','icon-512.png'])assets.set('/prehled/'+name,{body:await readFile(new URL('../'+name,import.meta.url))});
 const html=await readFile(new URL('../dashboard.html',import.meta.url)),worker=await readFile(new URL('../sw.js',import.meta.url));
 const shell=createPublicShell(html,worker,assets),offline=assets.get('/prehled/offline.html').body.toString();
 for(const match of offline.matchAll(/(?:href|src)="(\/prehled\/(?:[^"?]+\.(?:css|png))(?:\?[^" ]*)?)"/g))assert.ok([...shell.urls.values()].includes(match[1]),'Offline dependency must have a cached content identity');
 assert.ok(offline.includes(shell.urls.get('/prehled/dashboard.css')));assert.ok(offline.includes(shell.urls.get('/prehled/icon-192.png')));
 const changedAssets=new Map(assets);changedAssets.set('/prehled/dashboard.css',{body:Buffer.from('/* SYNTHETIC DIFFERENT STYLESHEET */')});
 const changed=createPublicShell(html,worker,changedAssets);assert.notEqual(changed.urls.get('/prehled/offline.html'),shell.urls.get('/prehled/offline.html'));assert.ok(changedAssets.get('/prehled/offline.html').body.toString().includes(changed.urls.get('/prehled/dashboard.css')));
 const changedWorker=createPublicShell(html,String(worker)+'\n/* SYNTHETIC WORKER UPDATE */',new Map(assets));assert.notEqual(changedWorker.cache,shell.cache);assert.notEqual(changedWorker.etag,shell.etag);
});

test('an installed old PWA gets current CSS identity on navigation and matching asset bytes after a CSS release',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'vcode-public-shell-')),service=join(directory,'analytics');
 await cp(new URL('../',import.meta.url),service,{recursive:true,filter:path=>!String(path).includes('/test')});
 const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
 const base='http://127.0.0.1:'+port;let child;
 const stop=async()=>{if(child&&child.exitCode===null&&child.signalCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}};
 const launch=async()=>{
  child=spawn(process.execPath,[join(service,'server.mjs')],{env:{...process.env,PORT:String(port),ANALYTICS_SESSION_DIR:join(directory,'sessions'),PUBLIC_SITE_URL:base},stdio:'ignore'});
  for(let n=0;n<100;n++){try{if((await fetch(base+'/health')).ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,20));}assert.fail('Isolated dashboard did not start');
 };
 const readShell=async()=>{
  const page=await fetch(base+'/prehled/');assert.equal(page.status,200);assert.equal(page.headers.get('cache-control'),'no-store');
  const html=await page.text(),css=/href="(\/prehled\/dashboard\.css\?v=[a-f0-9]{20})"/.exec(html)?.[1];assert.ok(css);
  const partnership=/src="(\/prehled\/partnership-inbox-ui\.js\?v=[a-f0-9]{20})"/.exec(html)?.[1];assert.ok(partnership);
  assert.ok(html.indexOf(partnership)<html.indexOf('/prehled/dashboard.js'));
  const partnershipResponse=await fetch(base+partnership);assert.equal(partnershipResponse.status,200);assert.equal(await partnershipResponse.text(),await readFile(join(service,'partnership-inbox-ui.js'),'utf8'));
  const response=await fetch(base+css);assert.equal(response.status,200);assert.equal(await response.text(),await readFile(join(service,'dashboard.css'),'utf8'));
  const worker=await fetch(base+'/prehled/sw.js');assert.equal(worker.status,200);assert.equal(worker.headers.get('cache-control'),'no-cache');assert.equal(worker.headers.get('service-worker-allowed'),'/prehled/');
  const etag=worker.headers.get('etag');assert.match(etag,/^"[a-f0-9]{20}"$/);const source=await worker.text();assert.ok(source.includes(css));assert.ok(!source.includes('__PUBLIC_'));
  const allowed=JSON.parse(/const ASSETS=(\[[^;]+\]);/.exec(source)[1]),offlinePath=/const OFFLINE='([^']+)'/.exec(source)[1];
  const offline=await fetch(base+offlinePath);assert.equal(offline.status,200);
  for(const match of (await offline.text()).matchAll(/(?:href|src)="(\/prehled\/[^"?]+\.(?:css|png)(?:\?[^" ]*)?)"/g))assert.ok(allowed.includes(match[1]));
  for(const invalid of [css+'&v=stale',css+'&extra=1'])assert.equal((await fetch(base+invalid)).status,404);
  const unchanged=await fetch(base+'/prehled/sw.js',{headers:{'If-None-Match':etag}});assert.equal(unchanged.status,304);assert.equal(unchanged.headers.get('cache-control'),'no-cache');
  assert.equal((await fetch(base+'/prehled/api/inquiries')).status,401);
  assert.equal((await fetch(base+'/prehled/api/partnerships')).status,401);
  assert.equal((await fetch(base+'/prehled/api/partners')).status,401);
  return{css,partnership,etag,source};
 };
 try{
  await launch();const before=await readShell();
  // Reproduce the v12 cache-first rule: a newly versioned CSS URL is outside its cache.
  const oldCacheWouldIntercept=url=>!new URL(url,base).search&&new URL(url,base).pathname==='/prehled/dashboard.css';
  assert.equal(oldCacheWouldIntercept(before.css),false);assert.equal(oldCacheWouldIntercept('/prehled/dashboard.css'),true);
  await stop();await writeFile(join(service,'dashboard.css'),(await readFile(join(service,'dashboard.css'),'utf8'))+'\n/* Synthetic next release */\n.inquiry-totals{display:grid}\n');
  await launch();const after=await readShell();assert.notEqual(after.css,before.css);assert.notEqual(after.etag,before.etag);assert.notEqual(/const CACHE='([^']+)'/.exec(after.source)[1],/const CACHE='([^']+)'/.exec(before.source)[1]);
  // A stale identity must not be filled with different bytes under the old cache key.
  assert.equal((await fetch(base+before.css)).status,404);assert.equal((await fetch(base+'/prehled/sw.js',{headers:{'If-None-Match':before.etag}})).status,200);
  await stop();await writeFile(join(service,'partnership-inbox-ui.js'),(await readFile(join(service,'partnership-inbox-ui.js'),'utf8'))+'\n/* Synthetic new partnership shell release */\n');
  await launch();const final=await readShell();assert.notEqual(final.partnership,after.partnership);assert.notEqual(final.etag,after.etag);assert.equal((await fetch(base+after.partnership)).status,404);
 }finally{await stop();await rm(directory,{recursive:true,force:true});}
});
