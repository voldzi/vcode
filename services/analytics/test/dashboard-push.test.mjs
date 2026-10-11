import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,stat,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createECDH,randomBytes} from 'node:crypto';
import {createSessionStore} from '../sessions.mjs';
import {createDashboardPush,createDashboardPushHandler,validatePushEndpoint,validatePushSubscription,publicPushAddress} from '../lib/dashboard-push.mjs';
const OWNER='11111111-2222-4333-8444-555555555555';
const ID1='aaaaaaaa-2222-4333-8444-555555555555',ID2='bbbbbbbb-2222-4333-8444-555555555555',ID3='cccccccc-2222-4333-8444-555555555555';
function keys(){const ecdh=createECDH('prime256v1');ecdh.generateKeys();return{publicKey:ecdh.getPublicKey().toString('base64url'),privateKey:ecdh.getPrivateKey().toString('base64url')};}
function subscription(suffix='synthetic'){return{endpoint:'https://web.push.apple.com/'+suffix,expirationTime:null,keys:{p256dh:keys().publicKey,auth:randomBytes(16).toString('base64url')}};}
function mockPush(){const calls=[];return{calls,generateVAPIDKeys:keys,sendNotification:async(sub,payload,options)=>{calls.push({sub,payload:JSON.parse(payload),options});}};}
async function fixture(){
 const directory=await mkdtemp(join(tmpdir(),'vcode-dashboard-push-'));let time=100000;
 const now=()=>time,sessions=await createSessionStore(directory,{now}),session=await sessions.create('synthetic-opaque-session-token',true),push=mockPush();
 let revoked=false,authorizationCalls=0,counts={inquiries:{count:2,ids:[ID1,ID2]},partnerships:{count:1,ids:[ID3]}};
 const authorize=async()=>{authorizationCalls++;if(revoked)throw Object.assign(Error('revoked'),{status:403});return{actorId:OWNER};};
 const options={enabled:true,directory,sessions,authorize,readCounts:async()=>structuredClone(counts),now,push};
 return{directory,sessions,session,push,options,setTime:value=>{time=value;},setCounts:value=>{counts=value;},setRevoked:()=>{revoked=true;},get authorizationCalls(){return authorizationCalls;},cleanup:()=>rm(directory,{recursive:true,force:true})};
}
test('only valid provider HTTPS capabilities and curve keys accepted; private DNS targets blocked',()=>{
 for(const endpoint of ['https://web.push.apple.com/synthetic','https://region.web.push.apple.com/synthetic','https://fcm.googleapis.com/fcm/send/synthetic:token','https://updates.push.services.mozilla.com/wpush/v2/synthetic'])assert.equal(validatePushEndpoint(endpoint),endpoint);
 for(const endpoint of ['http://web.push.apple.com/x','https://web.push.apple.com:444/x','https://web.push.apple.com@127.0.0.1/x','https://web.push.apple.com.evil.invalid/x','https://localhost/x','https://'+[10,1,1,1].join('.')+'/x','https://web.push.apple.com/x?target=evil','https://web.push.apple.com/x#fragment','https://web.push.apple.com/%2Fprivate','https://fcm.googleapis.com/arbitrary'])assert.throws(()=>validatePushEndpoint(endpoint));
 const good=subscription();assert.deepEqual(validatePushSubscription(good),good);assert.throws(()=>validatePushSubscription({...good,role:'admin'}));assert.throws(()=>validatePushSubscription({...good,keys:{...good.keys,p256dh:Buffer.alloc(65).toString('base64url')}}));assert.throws(()=>validatePushSubscription({...good,expirationTime:1.2}));
 for(const address of ['127.0.0.1',[10,0,0,2].join('.'),'169.254.1.2',[172,16,1,1].join('.'),[192,168,1,1].join('.'),'192.88.99.1','100.64.0.1','198.18.0.1','203.0.113.1','::1','fd00::1','fe80::1','::ffff:127.0.0.1','2001:db8::1','2001::1','2001:0:123::1','2001:1f::1','2001:002f::1','2002:7f00:1::1','3fff::1','3ffe::1'])assert.equal(publicPushAddress(address),false,address);
 for(const address of ['17.57.144.201','142.250.1.1','2606:4700::1111'])assert.equal(publicPushAddress(address),true,address);
});
test('opt-in encrypted state survives restart; only new globally unread IDs notify, including unchanged counts',async()=>{
 const f=await fixture();try{
  let service=await createDashboardPush(f.options);const device=subscription();assert.equal((await service.current(f.session)).subscribed,false);
  const result=await service.subscribe(f.session,{subscription:device,locale:'cs'});assert.equal(result.ok,true);assert.equal(result.subscribed,true);assert.ok(result.publicKey);await service.tick();assert.equal(f.push.calls.length,0,'Old unread messages are only baseline');
  const encrypted=await readFile(join(f.directory,'dashboard-push.enc'));for(const value of [device.endpoint,device.keys.auth,device.keys.p256dh,f.session.id,f.session.token,ID1])assert.equal(encrypted.includes(Buffer.from(value)),false);assert.equal((await stat(join(f.directory,'dashboard-push.enc'))).mode&0o777,0o600);
  service=await createDashboardPush(f.options);assert.equal((await service.current(f.session,device.endpoint)).subscribed,true);
  f.setCounts({inquiries:{count:2,ids:[ID2,ID3]},partnerships:{count:1,ids:[ID3]}});await service.tick();assert.equal(f.push.calls.length,1);assert.deepEqual(f.push.calls[0].payload,{type:'vcode-inbox',section:'inquiries',locale:'cs',count:2,totalCount:3});assert.equal(f.push.calls[0].options.TTL,300);assert.equal(f.push.calls[0].options.timeout,5000);assert.equal(f.push.calls[0].options.contentEncoding,'aes128gcm');await service.tick();assert.equal(f.push.calls.length,1,'No duplicate on the next poll');
  f.setCounts({inquiries:{count:1,ids:[ID3]},partnerships:null});await service.tick();assert.equal(f.push.calls.length,1,'Read/deleted messages do not cause notifications');
  f.setCounts({inquiries:{count:2,ids:[ID1,ID3]},partnerships:null});await service.tick();assert.equal(f.push.calls[1].payload.totalCount,null,'Partial count is never represented as whole app total');
 }finally{await f.cleanup();}
});
test('fresh login may explicitly renew only same-owner device; logout, expiry, revocation and 410 stop delivery',async()=>{
 const f=await fixture();try{
  let service=await createDashboardPush(f.options);const device=subscription();await service.subscribe(f.session,{subscription:device,locale:'en'});
  const fresh=await f.sessions.create('synthetic-fresh-login',true);assert.equal((await service.current(fresh,device.endpoint)).subscribed,false);assert.equal((await service.subscribe(fresh,{subscription:device,locale:'en'})).subscribed,true);
  await f.sessions.remove(fresh.id);await service.removeSession(fresh.id);service=await createDashboardPush(f.options);assert.equal((await service.current(f.session)).subscribed,false);
  await service.subscribe(f.session,{subscription:device,locale:'cs'});f.push.sendNotification=async()=>{throw{statusCode:410};};f.setCounts({inquiries:{count:3,ids:[ID1,ID2,ID3]},partnerships:{count:1,ids:[ID3]}});await service.tick();assert.equal((await service.current(f.session)).subscribed,false);
  await service.subscribe(f.session,{subscription:device,locale:'cs'});f.setRevoked();await service.tick();await assert.rejects(service.current(f.session),error=>error.status===403);assert.equal(f.push.calls.length,0);
  f.setTime(f.session.until);await service.tick();await assert.rejects(service.current(f.session),error=>error.status===401);
 }finally{await f.cleanup();}
});
test('disabled feature never creates VAPID state or sends; existing encrypted state is still pruned after expiry',async()=>{
 const f=await fixture();try{
  const disabled=await createDashboardPush({...f.options,enabled:false,push:undefined});const config=await disabled.current(f.session);assert.equal(config.reason,'disabled');assert.equal(config.publicKey,null);await assert.rejects(readFile(join(f.directory,'dashboard-push.enc')),error=>error.code==='ENOENT');await assert.rejects(disabled.subscribe(f.session,{subscription:subscription(),locale:'cs'}),error=>error.status===503);
  const enabled=await createDashboardPush(f.options);const device=subscription();await enabled.subscribe(f.session,{subscription:device,locale:'cs'});const before=await readFile(join(f.directory,'dashboard-push.enc'));
  const switchedOff=await createDashboardPush({...f.options,enabled:false,push:undefined});f.setTime(f.session.until);await switchedOff.tick();assert.notDeepEqual(await readFile(join(f.directory,'dashboard-push.enc')),before);assert.equal(f.push.calls.length,0);
  f.setTime(100000);assert.equal((await (await createDashboardPush(f.options)).current(f.session)).subscribed,false,'Disabled expiry pruning is durable');
 }finally{await f.cleanup();}
});
test('subscription quotas and transient failures are bounded; retries preserve unseen baseline',async()=>{
 const f=await fixture();try{
  const service=await createDashboardPush(f.options);for(let n=0;n<5;n++)await service.subscribe(f.session,{subscription:subscription('synthetic-'+n),locale:'cs'});await assert.rejects(service.subscribe(f.session,{subscription:subscription('sixth'),locale:'cs'}),error=>error.status===429);
  let requests=0;f.push.sendNotification=async()=>{requests++;throw{statusCode:503};};f.setCounts({inquiries:{count:3,ids:[ID1,ID2,ID3]},partnerships:{count:1,ids:[ID3]}});await service.tick();assert.equal(requests,5);await service.tick();assert.equal(requests,5,'No retry until bounded backoff elapses');f.setTime(100000+180001);f.push.sendNotification=async(sub,payload)=>{requests++;f.push.calls.push(JSON.parse(payload));};await service.tick();assert.equal(requests,10);await service.tick();assert.equal(requests,10);
 }finally{await f.cleanup();}
});
test('notification HTTP mutations require authenticated same-origin uncompressed JSON and strict route/body',async()=>{
 let calls=0;const service={current:async()=>({enabled:false}),subscribe:async()=>{calls++;return{ok:true};},unsubscribe:async()=>({ok:true})};const responses=[];
 const handle=createDashboardPushHandler({service,send:(_res,status,value)=>responses.push({status,value}),body:async req=>req.input,sameOrigin:(req,origin)=>req.headers.origin===origin,origin:'https://example.invalid',limited:()=>false});
 const request=(path,method,input,headers={})=>handle({method,input,headers:{'content-type':'application/json',origin:'https://example.invalid',...headers}},{},new URL(path,'https://example.invalid'),{id:'synthetic'});
 await handle({method:'GET',headers:{}},{},new URL('/prehled/api/notifications','https://example.invalid'),null);assert.equal(responses.pop().status,401);
 await request('/prehled/api/notifications','GET');assert.equal(responses.pop().status,200);
 await request('/prehled/api/notifications/subscription','POST',{}, {origin:'https://evil.invalid'});assert.equal(responses.pop().status,403);assert.equal(calls,0);
 await request('/prehled/api/notifications/subscription','POST',{}, {'content-encoding':'gzip'});assert.equal(responses.pop().status,415);
 await request('/prehled/api/notifications/status','POST',{endpoint:'x',owner:'spoof'});assert.equal(responses.pop().status,400);
 await request('/prehled/api/notifications?endpoint=secret','GET');assert.equal(responses.pop().status,400);
 await request('/prehled/api/notifications/other','GET');assert.equal(responses.pop().status,405);
 await request('/prehled/api/notifications/subscription','POST',{});assert.equal(responses.pop().status,200);assert.equal(calls,1);
});
test('a stalled provider cannot keep a background delivery open beyond its explicit deadline',async()=>{
 const f=await fixture();try{
  let requests=0,destroyed=false;
  f.push.sendNotification=async(_subscription,_payload,options)=>{requests++;const original=options.agent.destroy.bind(options.agent);options.agent.destroy=()=>{destroyed=true;original();};return new Promise(()=>{});};
  const service=await createDashboardPush({...f.options,deliveryTimeoutMs:20});await service.subscribe(f.session,{subscription:subscription(),locale:'cs'});f.setCounts({inquiries:{count:3,ids:[ID1,ID2,ID3]},partnerships:{count:1,ids:[ID3]}});
  await service.tick();assert.equal(requests,1);assert.equal(destroyed,true);await service.tick();assert.equal(requests,1,'Backoff applies after deadline expiration');
 }finally{await f.cleanup();}
});
