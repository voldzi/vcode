import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request as httpRequest} from 'node:http';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPartnershipService} from '../partnerships.mjs';
import {PARTNERSHIP_CONTRACT,PARTNERSHIP_PRIVACY_VERSION} from '../partnership-security.mjs';

const START=Date.parse('2026-10-09T12:00:00Z'),OWNER='11111111-2222-4333-8444-555555555555';
const KEY_A='synthetic-app-a-key-'.repeat(3),KEY_B='synthetic-app-b-key-'.repeat(3),INBOX='synthetic-owner-inbox-'.repeat(3),SECRET='synthetic-challenge-key-'.repeat(3);
const path='/internal/partnerships/v1',bucket='A'.repeat(43);
const rejected=(status,code)=>Object.assign(new Error(code),{status,code});
const disabledPolicy={enabled:false,version:'',retentionDays:0,approvedAt:null,publishedAt:null,noticeUrl:null};
const form=(challenge,extra={})=>({requestId:challenge.requestId,locale:'cs',clientBucket:bucket,token:challenge.token,privacyVersion:PARTNERSHIP_PRIVACY_VERSION,
 name:'Synthetic Partner',email:'synthetic@example.invalid',organization:null,type:'vyrobce',message:'An isolated synthetic partnership offer for acceptance.',website:'',...extra});

// The HTTP tests isolate routing/auth/validation from SQL. PostgreSQL acceptance
// independently exercises the actual store, transactions, expiry and replicas.
class MemoryStore{
 rows=new Map();receipts=new Map();saved=[];actions=[];partners=[];maintenanceCalls=0;failSave=false;notification;
 constructor(clock){this.clock=clock;}
 async save(payload,{challengeValid}){
  if(this.failSave)throw new Error('Synthetic storage failure with synthetic@example.invalid and private content');
  this.saved.push({payload,challengeValid});const key=payload.appId+':'+payload.requestId,existing=this.receipts.get(key),hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  if(existing){if(!this.rows.has(existing.id))throw rejected(410,'request-closed');if(existing.hash!==hash)throw rejected(409,'idempotency-conflict');return existing.id;}
  if(!challengeValid)throw rejected(403,'rejected');const id=randomUUID(),createdAt=new Date(this.clock()).toISOString();
  this.receipts.set(key,{id,hash});this.rows.set(id,{id,...payload,stage:'new',managerId:null,nextAction:null,nextActionDueAt:null,version:1,createdAt,updatedAt:createdAt,expiresAt:new Date(this.clock()+90*86400000).toISOString(),audit:[]});return id;
 }
 async list(options){this.actions.push(['list',options]);return {items:[...this.rows.values()],summary:{new:this.rows.size,reviewing:0,waiting:0,pilot:0,active:0,closed:0,total:this.rows.size},notifications:{pending:this.rows.size,sent:0,failed:0}};}
 async update(id,input,actorId){this.actions.push(['update',id,input,actorId]);const item=this.rows.get(id);if(!item)throw rejected(404,'not-found');Object.assign(item,input,{version:item.version+1});return item;}
 async remove(id,actorId){this.actions.push(['remove',id,actorId]);if(!this.rows.delete(id))throw rejected(404,'not-found');return {ok:true,reference:id};}
 async getApplication(id){const item=this.rows.get(id);if(!item)throw rejected(404,'not-found');return item.appId;}
 async promote(id,input,actorId,policy){this.actions.push(['promote',id,input,actorId,policy]);const row=this.rows.get(id),partner={id:randomUUID(),appId:row.appId,type:row.type,displayName:input.displayName,policyVersion:policy.version,createdBy:actorId,createdAt:new Date(this.clock()).toISOString(),expiresAt:new Date(this.clock()+policy.retentionDays*86400000).toISOString()};this.partners.push(partner);return partner;}
 async listPartners(options){this.actions.push(['partners',options]);return {items:this.partners};}
 async removePartner(id,actorId){this.actions.push(['removePartner',id,actorId]);return {ok:true,reference:id};}
 async maintenance({notify}={}){this.maintenanceCalls++;this.notification=notify;if(notify&&this.rows.size){const row=[...this.rows.values()][0];await notify({reference:row.id,appId:row.appId});}return {processed:notify?1:0};}
}
async function fixture(overrides={}){
 let now=START;const directory=await mkdtemp(join(tmpdir(),'vcode-partnership-http-')),registryFile=join(directory,'registry.json'),keyA=join(directory,'a.key'),keyB=join(directory,'b.key');
 await writeFile(keyA,KEY_A,{mode:0o600});await writeFile(keyB,KEY_B,{mode:0o600});
 const apps=[{appId:'kaloricke-tabulky',domain:'app-a.invalid',enabled:true,keyFile:keyA,types:['vyrobce','obchod','autor-receptu','jine'],privacyVersion:PARTNERSHIP_PRIVACY_VERSION,approvedAt:new Date(START).toISOString(),publishedAt:new Date(START).toISOString(),noticeUrl:'https://app-a.invalid/privacy',partnerPolicy:structuredClone(disabledPolicy)},
  {appId:'mestem-hrou',domain:'app-b.invalid',enabled:true,keyFile:keyB,types:['jine'],privacyVersion:PARTNERSHIP_PRIVACY_VERSION,approvedAt:new Date(START).toISOString(),publishedAt:new Date(START).toISOString(),noticeUrl:'https://app-b.invalid/?zobrazit=soukromi',partnerPolicy:structuredClone(disabledPolicy)}];
 const writeRegistry=()=>writeFile(registryFile,JSON.stringify({version:PARTNERSHIP_CONTRACT,applications:apps}),{mode:0o600});await writeRegistry();
 const config={siteOrigin:'https://vcode.example.invalid',partnershipIntakeEnabled:true,partnershipRegistryFile:registryFile,partnershipChallengeSecret:SECRET,
 contactInboxToken:INBOX,contactInboxOwnerId:OWNER,contactFormSecret:'synthetic-contact-form-'.repeat(3),telegramEnabled:true,telegramBotToken:'not-a-real-bot',telegramChatId:'synthetic-chat',telegramApiBaseUrl:'https://telegram.invalid',...overrides};
 const store=new MemoryStore(()=>now),sent=[],service=await createPartnershipService({config,store,clock:()=>now,fetchImpl:async(_,options)=>{sent.push(JSON.parse(options.body));return new Response(JSON.stringify({ok:true,result:{message_id:sent.length}}),{status:200});}});
 const server=createServer(async(req,res)=>{if(!await service.handle(req,res))res.writeHead(404).end();});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const request=(pathname,{method='POST',data,headers={},key=KEY_A,raw=false}={})=>new Promise((resolve,reject)=>{
  const bytes=data===undefined?null:raw?data:Buffer.from(JSON.stringify(data));
  const req=httpRequest({hostname:'127.0.0.1',port:server.address().port,path:pathname,method,headers:{Authorization:'Bearer '+key,...(bytes===null?{}:{'Content-Type':'application/json','Content-Length':bytes.length}),...headers}},res=>{
   const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>{const text=Buffer.concat(chunks).toString('utf8');resolve({status:res.statusCode,headers:res.headers,text,value:text?JSON.parse(text):null});});
  });req.on('error',reject);req.end(bytes);
 });
 const challenge=async(extra={},key=KEY_A)=>{const input={requestId:randomUUID(),locale:'cs',clientBucket:bucket,...extra};const reply=await request(path+'/challenge',{data:input,key});return {...reply,input};};
 const admin={key:INBOX,headers:{'X-VCode-Admin-Id':OWNER}};
 return {directory,config,apps,writeRegistry,service,store,sent,request,challenge,admin,port:server.address().port,time:value=>now=value,close:async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}};
}

const assertSafe=reply=>{assert.equal(reply.headers['cache-control'],'no-store');assert.equal(reply.headers['x-robots-tag'],'noindex, nofollow');assert.equal(reply.headers['access-control-allow-origin'],undefined);if(reply.status>=400)assert.deepEqual(Object.keys(reply.value).sort(),['code','message','ok','requestId']);};

test('server keys identify apps; inbox key and exact owner isolate administration; browser context is rejected',async()=>{
 const f=await fixture();try{
  const accepted=await f.challenge();assert.equal(accepted.status,200);assert.equal(accepted.value.appId,'kaloricke-tabulky');assertSafe(accepted);
  for(const key of ['unknown-key',INBOX]){const reply=await f.challenge({},key);assert.equal(reply.status,401);assertSafe(reply);assert.equal(reply.value.requestId,null);}
  for(const headers of [{Origin:'https://app-a.invalid'},{'Sec-Fetch-Site':'same-origin'},{'Sec-Fetch-Mode':'navigate'},{Cookie:'account=synthetic'}]){const reply=await f.request(path+'/challenge',{data:accepted.input,headers});assert.equal(reply.status,403);}
  for(const options of [{key:KEY_A},{key:KEY_B},{key:INBOX},{key:INBOX,headers:{'X-VCode-Admin-Id':randomUUID()}}])assert.equal((await f.request(path+'/inquiries',{method:'GET',...options})).status,401);
  const list=await f.request(path+'/inquiries',{method:'GET',...f.admin});assert.equal(list.status,200);assert.deepEqual(list.value.applications.map(app=>app.id),['kaloricke-tabulky','mestem-hrou']);assert.deepEqual(list.value.promotionEnabled,[]);assert.ok(!Object.hasOwn(list.value,'managerId'));assertSafe(list);
  assert.equal((await f.request('/api/contact',{method:'GET'})).status,404,'Partnership service leaves existing public contact routes to their own boundary');
 }finally{await f.close();}
});

test('native Node fetch relay transport works without browser Origin/site/cookie context',async()=>{
 const f=await fixture();try{
  const input={requestId:randomUUID(),locale:'cs',clientBucket:bucket};
  // The actual Undici transport adds Sec-Fetch-Mode:cors automatically.
  const base='http://127.0.0.1:'+f.port;
  const send=async(route,data,headers={})=>{
   const response=await fetch(base+route,{method:'POST',headers:{Authorization:'Bearer '+KEY_A,'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
   return {status:response.status,value:await response.json()};
  };
  const challenge=await send(path+'/challenge',input);assert.equal(challenge.status,200);f.time(START+1500);
  assert.equal((await send(path+'/submissions',form(challenge.value))).status,202);
  for(const headers of [{Origin:'https://app-a.invalid'},{'Sec-Fetch-Site':'same-origin'}, {'Sec-Fetch-Dest':'empty'}, {'Sec-Fetch-User':'?1'}, {Cookie:'synthetic=account'}])assert.equal((await send(path+'/challenge',{...input,requestId:randomUUID()},headers)).status,403);
 }finally{await f.close();}
});

test('delayed submit commits once; expired retained token retries stay bound and deletion cannot resurrect inquiry',async()=>{
 const f=await fixture();try{
  const challenge=await f.challenge(),input=form(challenge.value);let reply=await f.request(path+'/submissions',{data:input});assert.equal(reply.status,403);
  f.time(START+1500);reply=await f.request(path+'/submissions',{data:input});assert.equal(reply.status,202);assert.equal(reply.value.requestId,input.requestId);const reference=reply.value.reference;assert.equal(f.store.rows.size,1);assertSafe(reply);
  f.time(START+600001);reply=await f.request(path+'/submissions',{data:input});assert.equal(reply.status,202);assert.equal(reply.value.reference,reference);assert.equal(f.store.saved.at(-1).challengeValid,false);
  assert.equal((await f.request(path+'/submissions',{data:{...input,message:input.message+' altered'}})).status,409);
  for(const extra of [{locale:'en'},{clientBucket:'B'.repeat(43)},{requestId:randomUUID()},{token:input.token+'x'}])assert.equal((await f.request(path+'/submissions',{data:{...input,...extra}})).status,403);
  assert.equal((await f.request(path+'/submissions',{data:{...input,type:'jine'},key:KEY_B})).status,403,'Valid app B key cannot reuse app A token');
  assert.equal((await f.request(path+'/submissions',{data:{...input,token:''}})).status,400);
  assert.equal((await f.request(path+'/inquiries/'+reference,{method:'DELETE',...f.admin})).status,200);
  f.time(START+3600001);assert.equal((await f.request(path+'/submissions',{data:input})).status,410);assert.equal(f.store.rows.size,0);
 }finally{await f.close();}
});

test('registry is reloaded per request for revocation and incomplete/duplicate keys fail closed',async()=>{
 const f=await fixture();try{
  const first=await f.challenge();assert.equal(first.status,200);
  f.apps[0].enabled=false;f.apps[0].keyFile=null;await f.writeRegistry();assert.equal((await f.challenge()).status,401);assert.equal(f.service.ready,true,'Another enabled application remains ready');
  f.apps[1].enabled=false;f.apps[1].keyFile=null;await f.writeRegistry();assert.equal((await f.challenge({},KEY_B)).status,503);assert.equal(f.service.ready,false);
  assert.equal((await f.request(path+'/inquiries',{method:'GET',...f.admin})).status,200,'Existing administration continues while intake is disabled');
  f.apps[0].enabled=true;f.apps[0].keyFile=f.apps[1].keyFile=join(f.directory,'a.key');await f.writeRegistry();assert.equal((await f.challenge()).status,503);
  f.apps[1].keyFile=null;f.apps[0].publishedAt=null;await f.writeRegistry();assert.equal((await f.challenge()).status,503);
 }finally{await f.close();}
});

test('strict HTTP methods, query and body failures use fixed safe errors without storage data',async()=>{
 const f=await fixture();try{
  const challenge=await f.challenge(),input=form(challenge.value);f.time(START+1500);
  for(const [pathname,options,status]of [[path+'/challenge',{method:'GET'},405],[path+'/challenge?extra=1',{data:challenge.input},400],
   [path+'/unknown',{method:'GET',...f.admin},404],[path+'/inquiries?limit=101',{method:'GET',...f.admin},400],
   [path+'/inquiries?limit=1&limit=2',{method:'GET',...f.admin},400],[path+'/partners?stage=new',{method:'GET',...f.admin},400],
   [path+'/inquiries?appId=uncatalogued',{method:'GET',...f.admin},400],
   [path+'/submissions',{data:{...input,appId:'spoof'}},400],[path+'/submissions',{data:{...input,privacyVersion:'old'}},400],
   [path+'/submissions',{data:{...input,website:'spam.invalid'}},403],[path+'/submissions',{data:Buffer.alloc(16385),raw:true},413],
   [path+'/submissions',{data:input,headers:{'Content-Encoding':'gzip'}},415],[path+'/submissions',{data:Buffer.from([0xc3,0x28]),raw:true},400]]){
   const reply=await f.request(pathname,options);assert.equal(reply.status,status);assertSafe(reply);
   for(const hidden of [input.name,input.email,input.message,'spam.invalid'])assert.ok(!reply.text.includes(hidden));
  }
  f.store.failSave=true;const failure=await f.request(path+'/submissions',{data:input});assert.equal(failure.status,503);assert.equal(failure.value.code,'unavailable');assert.equal(failure.headers['retry-after'],'60');assert.ok(!failure.text.includes('synthetic@example.invalid'));
 }finally{await f.close();}
});

test('in-memory counters limit per-app buckets, per-app totals and stay independent across apps',async()=>{
 const f=await fixture();try{
  for(let index=0;index<12;index++)assert.equal((await f.challenge()).status,200);
  const limited=await f.challenge();assert.equal(limited.status,429);assert.equal(limited.headers['retry-after'],'60');assert.equal((await f.challenge({},KEY_B)).status,200);
  f.time(START+600001);assert.equal((await f.challenge()).status,200);
  for(let index=1;index<120;index++)assert.equal((await f.challenge({clientBucket:Buffer.alloc(32,index).toString('base64url')})).status,200);
  assert.equal((await f.challenge({clientBucket:'Z'.repeat(43)})).status,429);
 }finally{await f.close();}
 const submits=await fixture();try{
  const challenge=await submits.challenge(),input=form(challenge.value);submits.time(START+1500);
  for(let index=0;index<8;index++)assert.equal((await submits.request(path+'/submissions',{data:input})).status,202);
  assert.equal((await submits.request(path+'/submissions',{data:input})).status,429);
  submits.time(START+3601500);assert.equal((await submits.request(path+'/submissions',{data:input})).status,202,'Retry counter expiry uses arrival time even for retained old token/bucket');
 }finally{await submits.close();}
});

test('workflow and promotion derive immutable source app policy; caller cannot select app, actor or retention',async()=>{
 const f=await fixture();try{
  const challenge=await f.challenge();f.time(START+1500);const receipt=await f.request(path+'/submissions',{data:form(challenge.value)}),id=receipt.value.reference;
  let reply=await f.request(path+'/inquiries/'+id,{method:'PATCH',data:{expectedVersion:1,stage:'reviewing',managerId:OWNER,nextAction:'  Contact supplier  '},...f.admin});assert.equal(reply.status,200);assert.equal(reply.value.item.nextAction,'Contact supplier');assert.equal(f.store.actions.at(-1)[3],OWNER);
  for(const change of [{managerId:randomUUID()},{appId:'mestem-hrou'},{nextAction:'line1\nline2'},{expiresAt:'2027-01-01'}])assert.equal((await f.request(path+'/inquiries/'+id,{method:'PATCH',data:{expectedVersion:2,...change},...f.admin})).status,400);
  const promotion={expectedVersion:2,displayName:'Synthetic approved organisation',policyVersion:'synthetic-policy'};
  assert.equal((await f.request(path+'/inquiries/'+id+'/promote',{data:promotion,...f.admin})).status,403);
  f.apps[0].partnerPolicy={enabled:true,version:'synthetic-policy',retentionDays:30,approvedAt:new Date(START).toISOString(),publishedAt:new Date(START).toISOString(),noticeUrl:'https://app-a.invalid/partner-privacy'};await f.writeRegistry();
  reply=await f.request(path+'/inquiries/'+id+'/promote',{data:promotion,...f.admin});assert.equal(reply.status,200);assert.equal(reply.value.partner.appId,'kaloricke-tabulky');assert.equal(f.store.actions.at(-1)[4].retentionDays,30);
  assert.equal((await f.request(path+'/inquiries/'+id+'/promote',{data:{...promotion,appId:'mestem-hrou'},...f.admin})).status,400);
  assert.equal((await f.request(path+'/partners?limit=5&appId=kaloricke-tabulky',{method:'GET',...f.admin})).status,200);
  assert.equal((await f.request(path+'/partners/'+reply.value.partner.id,{method:'DELETE',...f.admin})).status,200);
 }finally{await f.close();}
});

test('notifications contain canonical app/reference/private link only; maintenance always runs with intake disabled or missing secrets',async()=>{
 const f=await fixture();try{
  const challenge=await f.challenge();f.time(START+1500);const input=form(challenge.value);await f.request(path+'/submissions',{data:input});
  await f.service.maintenance();assert.equal(f.sent.length,1);
  const notice=f.sent[0];assert.ok(notice.text.includes('Moje porce'));assert.ok(notice.text.includes('https://vcode.example.invalid/prehled/#partnerships'));
  for(const forbidden of [input.name,input.email,input.message,bucket,input.token,KEY_A,SECRET,INBOX])assert.ok(!JSON.stringify(notice).includes(forbidden));
  assert.ok(!Object.hasOwn(notice,'parse_mode'));
  f.config.partnershipIntakeEnabled=false;await f.service.maintenance();assert.equal(f.store.maintenanceCalls,2);assert.equal(f.store.notification,undefined);assert.equal(f.sent.length,1);
 }finally{await f.close();}
 for(const change of [{partnershipIntakeEnabled:false},{partnershipChallengeSecret:''},{partnershipChallengeSecret:INBOX},{telegramEnabled:false},{contactInboxOwnerId:''}]){
  const off=await fixture(change);try{assert.equal(off.service.ready,false);await off.service.maintenance();assert.equal(off.store.maintenanceCalls,1);assert.equal(off.store.notification,undefined);assert.equal((await off.challenge()).status,503);}finally{await off.close();}
 }
});
