import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('PWA never intercepts private APIs or caches authenticated navigation',async()=>{
 const listeners={},cached=[];let installed;
 const installSource=await readFile(new URL('../sw.js',import.meta.url),'utf8');
 const context={URL,Request:class extends Request{constructor(url,options){super(new URL(url,'https://example.com'),options);}},self:{location:{origin:'https://example.com'},addEventListener:(name,fn)=>listeners[name]=fn,clients:{claim:async()=>{}},skipWaiting:()=>{}},caches:{open:async()=>({addAll:async assets=>cached.push(...assets.map(a=>new URL(a.url).pathname))}),match:async path=>path},fetch:async()=>{throw Error('offline');}};vm.runInNewContext(installSource,context);
 listeners.install({waitUntil:p=>installed=p});await installed;assert.ok(cached.includes('/prehled/offline.html'));assert.ok(!cached.some(p=>p.includes('/api/')||p==='/prehled/'));
 for(const [path,method]of [['/prehled/api/summary','GET'],['/prehled/api/login','POST']])listeners.fetch({request:{url:'https://example.com'+path,method},respondWith:()=>assert.fail('private request intercepted')});
 let response;listeners.fetch({request:{url:'https://example.com/prehled/',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal(await response,'/prehled/offline.html');
});
