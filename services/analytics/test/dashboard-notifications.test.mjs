import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../dashboard-notifications.js',import.meta.url),'utf8');
const publicKey=Buffer.from([4,...Array(64).fill(1)]).toString('base64url');
function fixture({ios=false,installed=false,permission='default',available=true,hasSubscription=false,registered=false,postFails=false,deleteHangs=false,manualTimers=false}={}){
 let authenticated=true,language='cs',permissionCalls=0,subscribeCalls=0,unsubscribeCalls=0,serverSubscribed=registered;
 const elements=new Map(['notification-enable','notification-disable','notification-status','notification-help'].map(id=>[id,{disabled:false,textContent:'',listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(){}}])),requests=[],badges=[],events=[],serviceEvents={},timers=new Map();let timerId=0;
 const subscription={endpoint:'https://push.example.test/synthetic-only',toJSON:()=>({endpoint:'https://push.example.test/synthetic-only',expirationTime:null,keys:{p256dh:'synthetic-public-key',auth:'synthetic-auth'}}),unsubscribe:async()=>{unsubscribeCalls++;hasSubscription=false;return true;}};
 const pushManager={getSubscription:async()=>hasSubscription?subscription:null,subscribe:async options=>{subscribeCalls++;assert.equal(options.userVisibleOnly,true);assert.equal(options.applicationServerKey.byteLength,65);hasSubscription=true;return subscription;}};
 const Notification={permission,requestPermission:()=>{permissionCalls++;Notification.permission='granted';return Promise.resolve('granted');}};
 const context={console,Event,AbortController,Uint8Array,atob,setTimeout:manualTimers?fn=>{const id=++timerId;timers.set(id,fn);return id;}:setTimeout,clearTimeout:manualTimers?id=>timers.delete(id):clearTimeout,Notification,window:{isSecureContext:true,PushManager:class{},Notification,matchMedia:()=>({matches:installed})},navigator:{userAgent:ios?'iPhone':'Synthetic Desktop',platform:ios?'iPhone':'Synthetic',maxTouchPoints:ios?1:0,standalone:installed,serviceWorker:{getRegistration:async()=>({active:{},pushManager}),addEventListener:(name,fn)=>serviceEvents[name]=fn},setAppBadge:async count=>badges.push(count),clearAppBadge:async()=>badges.push(0)},document:{visibilityState:'visible',getElementById:id=>elements.get(id),addEventListener(){},dispatchEvent:event=>events.push(event.type)},fetch:async(path,init)=>{requests.push({path,init});assert.equal(init.credentials,'same-origin');assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');if(path.endsWith('/subscription')){if(init.method==='DELETE'&&deleteHangs)return new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(init.signal.reason),{once:true}));if(init.method==='POST'&&postFails)return{ok:false,status:503};serverSubscribed=init.method==='POST';return{ok:true,json:async()=>({ok:true,subscribed:serverSubscribed})};}if(path.endsWith('/status'))return{ok:true,json:async()=>({subscribed:serverSubscribed})};return{ok:true,json:async()=>({enabled:available,available,publicKey:available?publicKey:null,subscribed:serverSubscribed})};}};
 vm.runInNewContext(source,context);const api=context.window.VCodeNotifications;api.init({authenticated:()=>authenticated,locale:()=>language});
 return{api,elements,requests,badges,events,serviceEvents,Notification,setAuthenticated:value=>authenticated=value,setLanguage:value=>language=value,counts:()=>({permissionCalls,subscribeCalls,unsubscribeCalls}),click:id=>elements.get(id).listeners.click(),expire:()=>{for(const timer of [...timers.values()])timer();}};
}

test('notification load checks only private current-device status, and permission requires an explicit click',async()=>{
 const f=fixture();await f.api.refresh();assert.deepEqual(f.counts(),{permissionCalls:0,subscribeCalls:0,unsubscribeCalls:0});assert.equal(f.elements.get('notification-enable').disabled,false);assert.equal(f.elements.get('notification-status').textContent,'Upozornění jsou na tomto zařízení vypnutá.');
 const enabling=f.click('notification-enable');assert.equal(f.counts().permissionCalls,1,'Permission is requested directly in the click before any awaited network work');await enabling;assert.deepEqual(f.counts(),{permissionCalls:1,subscribeCalls:1,unsubscribeCalls:0});assert.equal(f.elements.get('notification-disable').disabled,false);
 const sent=f.requests.find(item=>item.init.method==='POST'&&item.path.endsWith('/subscription'));assert.ok(sent);const body=JSON.parse(sent.init.body);assert.deepEqual(Object.keys(body).sort(),['locale','subscription']);assert.equal(body.locale,'cs');assert.equal(body.subscription.endpoint,'https://push.example.test/synthetic-only');assert.equal(body.subscription.expirationTime,null);
 f.setLanguage('en');f.api.updateLocale();assert.equal(f.elements.get('notification-status').textContent,'Notifications are on on this device.');
 f.api.setBadge(5);f.setAuthenticated(false);f.api.clear();assert.deepEqual(f.badges,[5,0]);assert.equal(f.elements.get('notification-enable').disabled,true);assert.equal(f.elements.get('notification-status').textContent,'Sign in to manage notifications.');
});

test('iOS explains Home Screen installation without requesting permission or creating a subscription',async()=>{
 const f=fixture({ios:true});await f.api.refresh();await f.click('notification-enable');assert.equal(f.requests.length,0);assert.equal(f.counts().permissionCalls,0);assert.match(f.elements.get('notification-status').textContent,/přidejte Přehled na plochu/);assert.equal(f.elements.get('notification-enable').disabled,true);
 const installed=fixture({ios:true,installed:true});await installed.api.refresh();assert.equal(installed.elements.get('notification-enable').disabled,false);assert.equal(installed.counts().permissionCalls,0);
});

test('server opt-in and denied browser permission prevent enable, with no background subscription',async()=>{
 for(const options of [{available:false},{permission:'denied'}]){const f=fixture(options);await f.api.refresh();await f.click('notification-enable');assert.equal(f.elements.get('notification-enable').disabled,true);assert.equal(f.counts().permissionCalls,0);assert.equal(f.counts().subscribeCalls,0);}
 const f=fixture({hasSubscription:true,registered:false,permission:'granted'});await f.api.refresh();assert.equal(f.elements.get('notification-status').textContent,'Upozornění jsou na tomto zařízení vypnutá.');assert.ok(f.requests.some(item=>item.path.endsWith('/status')));assert.ok(!f.requests.some(item=>item.path.endsWith('/subscription')));
});

test('failure to register newly created push unsubscribes it and explicit disable deletes server registration first',async()=>{
 const failed=fixture({postFails:true});await failed.api.refresh();await failed.click('notification-enable');assert.equal(failed.counts().unsubscribeCalls,1);assert.match(failed.elements.get('notification-status').textContent,/nepodařilo/);assert.equal(failed.elements.get('notification-disable').disabled,true);
 const registered=fixture({permission:'granted',hasSubscription:true,registered:true});await registered.api.refresh();assert.equal(registered.elements.get('notification-disable').disabled,false);assert.equal(await registered.api.disable(),true);assert.equal(registered.counts().unsubscribeCalls,1);const deletion=registered.requests.find(item=>item.init.method==='DELETE');assert.deepEqual(JSON.parse(deletion.init.body),{endpoint:'https://push.example.test/synthetic-only'});assert.equal(registered.elements.get('notification-enable').disabled,false);
});

test('permission result after clearing the authenticated view never subscribes or restores private state',async()=>{
 const f=fixture();await f.api.refresh();let resolve;f.Notification.requestPermission=()=>new Promise(done=>resolve=done);const pending=f.click('notification-enable');f.setAuthenticated(false);f.api.clear();resolve('granted');await pending;assert.equal(f.counts().subscribeCalls,0);assert.ok(!f.requests.some(item=>item.path.endsWith('/subscription')));assert.match(f.elements.get('notification-status').textContent,/přihlaste/);
});

test('unreachable unsubscribe API has a bounded wait so explicit logout can continue',async()=>{
 const f=fixture({permission:'granted',hasSubscription:true,registered:true,deleteHangs:true,manualTimers:true});await f.api.refresh();const pending=f.api.disable();
 for(let n=0;n<20&&!f.requests.some(item=>item.init.method==='DELETE');n++)await Promise.resolve();assert.ok(f.requests.some(item=>item.init.method==='DELETE'));
 f.expire();assert.equal(await pending,false);assert.equal(f.counts().unsubscribeCalls,0);assert.match(f.elements.get('notification-status').textContent,/nepodařilo/);assert.equal(f.elements.get('notification-disable').disabled,false);
});
