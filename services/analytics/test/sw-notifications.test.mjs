import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=(await readFile(new URL('../sw.js',import.meta.url),'utf8')).replace('__PUBLIC_CACHE__','synthetic-cache').replace('__PUBLIC_ASSETS__','[]').replace('__PUBLIC_OFFLINE__','/prehled/offline.html');
function fixture(clients=[]){
 const listeners={},shown=[],badges=[],opened=[];
 const self={location:{origin:'https://vcode.example.test'},navigator:{setAppBadge:async count=>badges.push(count),clearAppBadge:async()=>badges.push(0)},addEventListener:(name,handler)=>listeners[name]=handler,registration:{showNotification:async(title,options)=>shown.push({title,options})},clients:{matchAll:async()=>clients,openWindow:async url=>opened.push(url)}};
 vm.runInNewContext(source,{self,URL});
 const push=async data=>{let promise;listeners.push({data:{json:()=>data},waitUntil:value=>promise=value});await promise;};
 const click=async data=>{let promise,closed=false;listeners.notificationclick({notification:{data,close:()=>closed=true},waitUntil:value=>promise=value});await promise;assert.equal(closed,true);};
 return{push,click,shown,badges,opened};
}

test('every push shows generic fixed copy with no private payload text, including while dashboard is visible',async()=>{
 const messages=[],client={url:'https://vcode.example.test/prehled/#overview',postMessage:data=>messages.push(data)},f=fixture([client,{url:'https://vcode.example.test/',postMessage:()=>assert.fail('Public portfolio must not receive private notification signals')}]);
 await f.push({type:'vcode-inbox',section:'partnerships',locale:'en',count:1,totalCount:3,title:'PRIVATE SENDER',body:'PRIVATE TEXT',url:'https://evil.example/'});
 assert.equal(f.shown.length,1);assert.equal(f.shown[0].title,'VCode Dashboard');assert.equal(f.shown[0].options.body,'A new message is waiting. Open your private Dashboard.');assert.deepEqual(JSON.parse(JSON.stringify(f.shown[0].options.data)),{section:'partnerships'});assert.ok(!JSON.stringify(f.shown).includes('PRIVATE'));assert.deepEqual(f.badges,[3]);assert.equal(messages.length,1);assert.equal(messages[0].type,'VCODE_INBOX_UPDATED');
 await f.push({type:'vcode-inbox',section:'inquiries',locale:'cs',count:0,totalCount:0});assert.equal(f.shown.length,2);assert.deepEqual(f.badges,[3,0]);
 await f.push({type:'vcode-inbox',section:'inquiries',locale:'cs',count:8,totalCount:null});assert.equal(f.shown.length,3);assert.deepEqual(f.badges,[3,0],'A partial count must not replace the total icon badge');
});

test('notification click reuses only the same-origin dashboard and preserves a constant login deep link',async()=>{
 const navigated=[],focused=[],f=fixture([{url:'https://vcode.example.test/',navigate:()=>assert.fail('Do not replace public page')},{url:'https://evil.example/prehled/',navigate:()=>assert.fail('Do not navigate external client')},{url:'https://vcode.example.test/prehled/#overview',navigate:async url=>{navigated.push(url);return{focus:async()=>focused.push(true)};}}]);
 await f.click({section:'partnerships',url:'https://evil.example/steal'});assert.deepEqual(navigated,['https://vcode.example.test/prehled/#partnerships']);assert.deepEqual(focused,[true]);assert.equal(f.opened.length,0);
 const fresh=fixture();await fresh.click({section:'../../api/secret',url:'https://evil.example/'});assert.deepEqual(fresh.opened,['https://vcode.example.test/prehled/#inquiries']);
 const failedNavigation=fixture([{url:'https://vcode.example.test/prehled/',navigate:async()=>null}]);await failedNavigation.click({section:'inquiries'});assert.deepEqual(failedNavigation.opened,['https://vcode.example.test/prehled/#inquiries']);
});

test('malformed notification data cannot change text, link, or badge with noninteger values',async()=>{
 const f=fixture();await f.push({type:'other',section:'partnerships',locale:'../private',count:'9',body:'PRIVATE'});assert.equal(f.shown[0].title,'VCode Přehled');assert.equal(f.shown[0].options.data.section,'inquiries');assert.equal(f.badges.length,0);
 await f.push(null);assert.equal(f.shown.length,2);await f.click(null);assert.deepEqual(f.opened,['https://vcode.example.test/prehled/#inquiries']);
});
