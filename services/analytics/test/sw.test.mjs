import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createPublicShell} from '../public-shell.mjs';

async function fixture(){
 const assets=new Map();
 for(const name of ['dashboard.css','dashboard.js','dashboard-notifications.js','download-metrics-ui.js','contact-inbox-ui.js','partnership-inbox-ui.js','offline.html','icon-192.png','icon-512.png'])assets.set('/prehled/'+name,{body:await readFile(new URL('../'+name,import.meta.url))});
 return createPublicShell(await readFile(new URL('../dashboard.html',import.meta.url)),await readFile(new URL('../sw.js',import.meta.url)),assets);
}

test('PWA never intercepts private APIs or caches authenticated navigation',async()=>{
 const shell=await fixture(),listeners={},cached=[];let installed;
 const context={URL,Request:class extends Request{constructor(url,options){super(new URL(url,'https://example.com'),options);}},self:{location:{origin:'https://example.com'},addEventListener:(name,fn)=>listeners[name]=fn,clients:{claim:async()=>{}},skipWaiting:()=>{}},caches:{open:async()=>({addAll:async assets=>cached.push(...assets.map(a=>a.url))}),match:async path=>path},fetch:async()=>{throw Error('offline');}};
 vm.runInNewContext(shell.serviceWorker,context);
 listeners.install({waitUntil:p=>installed=p});await installed;
 assert.ok(cached.includes('https://example.com'+shell.urls.get('/prehled/offline.html')));
 assert.ok(cached.includes('https://example.com'+shell.urls.get('/prehled/download-metrics-ui.js')));
 assert.ok(cached.includes('https://example.com'+shell.urls.get('/prehled/partnership-inbox-ui.js')));
 assert.ok(cached.includes('https://example.com'+shell.urls.get('/prehled/dashboard-notifications.js')));
 assert.ok(cached.every(url=>/\?v=[a-f0-9]{20}$/.test(url)));
 assert.ok(!cached.some(url=>url.includes('/api/')||new URL(url).pathname==='/prehled/'||url.includes('/downloads/')));
 for(const [path,method]of [['/prehled/api/summary','GET'],['/prehled/api/inquiries','GET'],['/prehled/api/partnerships?limit=50','GET'],['/prehled/api/partners?limit=50','GET'],['/prehled/api/partnerships/11111111-2222-4333-8444-555555555555','PATCH'],['/prehled/api/partners/11111111-2222-4333-8444-555555555555','DELETE'],['/prehled/api/login','POST'],['/downloads/vcode-recall/latest.json','GET'],['/downloads/vcode-recall/0.6.0/VCodeRecall-0.6.0-1-macos-arm64.dmg','GET']])listeners.fetch({request:{url:'https://example.com'+path,method},respondWith:()=>assert.fail('Private request or download intercepted')});
 let response;listeners.fetch({request:{url:'https://example.com/prehled/',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal(await response,shell.urls.get('/prehled/offline.html'));
});

test('PWA uses only its exact content-version assets and removes the previous public shell',async()=>{
 const shell=await fixture(),listeners={},deleted=[];let activated,response;
 const context={URL,self:{location:{origin:'https://example.com'},addEventListener:(name,fn)=>listeners[name]=fn,clients:{claim:async()=>{}},skipWaiting:()=>{}},caches:{keys:async()=>['vcode-metrics-shell-v12','vcode-metrics-shell-old',shell.cache,'unrelated-application'],delete:async key=>deleted.push(key),match:async path=>'cached:'+path},fetch:async()=>assert.fail('Known version should use its public cache')};
 vm.runInNewContext(shell.serviceWorker,context);
 listeners.activate({waitUntil:p=>activated=p});await activated;assert.deepEqual(deleted,['vcode-metrics-shell-v12','vcode-metrics-shell-old']);
 const css=shell.urls.get('/prehled/dashboard.css');listeners.fetch({request:{url:'https://example.com'+css,method:'GET'},respondWith:p=>response=p});assert.equal(await response,'cached:'+css);
 for(const path of ['/prehled/dashboard.css','/prehled/dashboard.css?v=old','/prehled/dashboard.css?v='+shell.versions.get('/prehled/dashboard.css')+'&extra=1'])listeners.fetch({request:{url:'https://example.com'+path,method:'GET'},respondWith:()=>assert.fail('Unknown or old asset version must use the network')});
});
