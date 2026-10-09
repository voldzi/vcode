import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,writeFile,chmod,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {PARTNERSHIP_CONTRACT,PARTNERSHIP_PRIVACY_VERSION,readPartnershipSecret,loadPartnershipRegistry,
 validatePartnershipChallenge,validatePartnershipPayload,issuePartnershipChallenge,validPartnershipChallenge,authenticPartnershipChallenge,
 partnershipBody,validatePartnershipUpdate,validatePartnershipPromotion} from '../partnership-security.mjs';

const NOW=Date.parse('2026-10-09T12:00:00Z'),SECRET='synthetic-challenge-secret-'.repeat(3),KEY='synthetic-application-key-'.repeat(3);
const bucket='A'.repeat(43),app={appId:'kaloricke-tabulky',privacyVersion:PARTNERSHIP_PRIVACY_VERSION,types:['vyrobce','jine']};
const challenge=()=>({requestId:randomUUID(),locale:'cs',clientBucket:bucket});
const form=()=>({...challenge(),token:'synthetic-token',privacyVersion:PARTNERSHIP_PRIVACY_VERSION,name:'Synthetic Partner',email:'SYNTHETIC@EXAMPLE.INVALID',organization:null,type:'vyrobce',message:'Only synthetic text for isolated boundary testing.',website:''});
const disabledPolicy={enabled:false,version:'',retentionDays:0,approvedAt:null,publishedAt:null,noticeUrl:null};
const registryApp=(keyFile,overrides={})=>({appId:'kaloricke-tabulky',domain:'example.invalid',enabled:true,keyFile,types:['vyrobce','jine'],
 privacyVersion:PARTNERSHIP_PRIVACY_VERSION,approvedAt:new Date(NOW).toISOString(),publishedAt:new Date(NOW).toISOString(),noticeUrl:'https://example.invalid/privacy?zobrazit=soukromi#analytics',partnerPolicy:disabledPolicy,...overrides});

test('private registry permits missing disabled keys but fails closed on active missing/duplicate/forbidden credentials and notice gates',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'vcode-partnership-registry-')),keyFile=join(directory,'key'),file=join(directory,'registry.json'),catalog=new Map([['kaloricke-tabulky','Moje porce'],['mestem-hrou','Městem hrou']]);
 try{
  await writeFile(keyFile,KEY,{mode:0o600});
  const load=async applications=>{await writeFile(file,JSON.stringify({version:PARTNERSHIP_CONTRACT,applications}),{mode:0o600});return loadPartnershipRegistry(file,catalog);};
  const approved=await load([registryApp(keyFile)]);assert.equal(approved[0].key,KEY);assert.equal(approved[0].name,'Moje porce');
  assert.equal((await load([registryApp(null,{enabled:false,approvedAt:null,publishedAt:null})]))[0].key,'');
  assert.equal(await load([registryApp(null)]),null);
  for(const change of [{approvedAt:null},{publishedAt:null},{enabled:'true'},{privacyVersion:'old'},
   {noticeUrl:'https://foreign.invalid/privacy'},{noticeUrl:'https://credentials@example.invalid/privacy'},
   {noticeUrl:'https://example.invalid/privacy?'+ 'x'.repeat(513)}, {appId:'uncatalogued'}, {types:['vyrobce','vyrobce']}, {unexpected:true}])assert.equal(await load([registryApp(keyFile,change)]),null);
  const another=registryApp(keyFile,{appId:'mestem-hrou',domain:'other.invalid',noticeUrl:'https://other.invalid/privacy'});
  assert.equal(await load([registryApp(keyFile),another]),null,'Keys cannot cross application boundaries');
  await load([registryApp(keyFile)]);assert.equal(await loadPartnershipRegistry(file,catalog,[KEY]),null,'An app key cannot be the inbox or challenge credential');
  await chmod(file,0o644);assert.equal(await loadPartnershipRegistry(file,catalog),null);await chmod(file,0o600);
  const link=join(directory,'key-link');await symlink(keyFile,link);assert.equal(await readPartnershipSecret(link),'');
  await chmod(keyFile,0o644);assert.equal(await readPartnershipSecret(keyFile),'');await chmod(keyFile,0o600);
  const policy={enabled:true,version:'synthetic-policy',retentionDays:365,approvedAt:new Date(NOW).toISOString(),publishedAt:new Date(NOW).toISOString(),noticeUrl:'https://example.invalid/privacy?policy=partnership'};
  assert.equal((await load([registryApp(keyFile,{partnerPolicy:policy})]))[0].partnerPolicy.enabled,true);
  for(const change of [{retentionDays:366},{retentionDays:0},{approvedAt:null},{publishedAt:null},{noticeUrl:'https://foreign.invalid/'}])assert.equal(await load([registryApp(keyFile,{partnerPolicy:{...policy,...change}})]),null);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('tokens bind application, request, bucket, locale, notice and time while authentic expired retries remain distinguishable',()=>{
 const input=challenge(),token=issuePartnershipChallenge(app,input,SECRET,NOW).token;
 assert.equal(validPartnershipChallenge(token,app,input,SECRET,NOW+1499),false);
 assert.equal(validPartnershipChallenge(token,app,input,SECRET,NOW+1500),true);
 assert.equal(validPartnershipChallenge(token,app,input,SECRET,NOW+600000),true);
 assert.equal(validPartnershipChallenge(token,app,input,SECRET,NOW+600001),false);
 assert.equal(authenticPartnershipChallenge(token,app,input,SECRET).issuedAt,NOW);
 for(const [otherApp,otherInput,otherToken]of [[{...app,appId:'mestem-hrou'},input,token],[app,{...input,requestId:randomUUID()},token],
  [app,{...input,locale:'en'},token],[app,{...input,clientBucket:'B'.repeat(43)},token],[{...app,privacyVersion:'other'},input,token],[app,input,token+'x']])assert.equal(authenticPartnershipChallenge(otherToken,otherApp,otherInput,SECRET),null);
 assert.equal(authenticPartnershipChallenge(token,app,input,''),null);
 assert.ok(!Buffer.from(token.split('.')[0],'base64url').toString().includes(bucket));
});

test('strict normalized payload rejects account claims, honeypot, malformed text and missing retained tokens',()=>{
 const input=form();input.name='  Synteticky\u0301 partner  ';input.message='A synthetic multiline offer with details.\r\nAnd another line.';
 const value=validatePartnershipPayload(input,app);assert.equal(value.appId,app.appId);assert.equal(value.email,'synthetic@example.invalid');assert.equal(value.name,'Syntetický partner');assert.ok(!value.message.includes('\r'));
 for(const change of [{appId:'spoof'},{account:'private-account'},{clientBucket:'bad'},{locale:'pl'},{type:'unapproved'},
  {token:''},{token:' '},{token:'x'.repeat(2049)},{name:'x'},{name:'x'.repeat(101)},{message:'short'},{message:'x'.repeat(4001)},
  {name:'bad\nname'},{email:'injected\r\n@example.invalid'},{organization:'x'.repeat(161)},{message:'\ud800'.repeat(40)}])assert.throws(()=>validatePartnershipPayload({...form(),...change},app),f=>f.status===400&&f.code==='invalid-input');
 assert.throws(()=>validatePartnershipPayload({...form(),privacyVersion:'old'},app),{status:400,code:'privacy-version-mismatch'});
 assert.throws(()=>validatePartnershipPayload({...form(),website:'spam.invalid'},app),{status:403,code:'rejected'});
 for(const change of [{requestId:'bad'},{locale:'pl'},{clientBucket:'bad'},{appId:'spoof'}])assert.throws(()=>validatePartnershipChallenge({...challenge(),...change}),{status:400,code:'invalid-input'});
});

test('UTF-8 JSON parser enforces body bytes, encoding and malformed sequences',async()=>{
 const request=(bytes,headers={})=>Object.assign(Readable.from([bytes]),{headers:{'content-type':'application/json',...headers}});
 assert.deepEqual(await partnershipBody(request(Buffer.from('{"value":"synthetic"}'))),{value:'synthetic'});
 for(const [bytes,headers,status]of [[Buffer.alloc(16385),{},413],[Buffer.from('{}'),{'content-length':'16385'},413],
  [Buffer.from('{}'),{'content-type':'text/plain'},415],[Buffer.from('{}'),{'content-encoding':'gzip'},415],
  [Buffer.from([0x7b,0x22,0xc3,0x28,0x22,0x3a,0x31,0x7d]),{},400],[Buffer.from('{'),{},400]])await assert.rejects(partnershipBody(request(bytes,headers)),f=>f.status===status);
});

test('workflow validates fixed manager, single-line next action, real ISO dates and separately versioned promotion',()=>{
 const owner=randomUUID(),next=new Date(NOW+86400000).toISOString();
 assert.deepEqual(validatePartnershipUpdate({expectedVersion:1,nextAction:'  Contact supplier  ',nextActionDueAt:next,managerId:owner},owner),{expectedVersion:1,nextAction:'Contact supplier',nextActionDueAt:next,managerId:owner});
 for(const input of [{expectedVersion:0,stage:'new'},{expectedVersion:1,stage:'unknown'},{expectedVersion:1,managerId:randomUUID()},
  {expectedVersion:1,nextAction:'line1\nline2'},{expectedVersion:1,nextActionDueAt:'2026-02-30T12:00:00Z'},
  {expectedVersion:1,nextActionDueAt:'2026-10-09'},{expectedVersion:1,expiresAt:next}])assert.throws(()=>validatePartnershipUpdate(input,owner),{status:400,code:'invalid-input'});
 assert.deepEqual(validatePartnershipPromotion({expectedVersion:1,displayName:'  Synthetic partner  ',policyVersion:'approved-policy'}),{expectedVersion:1,displayName:'Synthetic partner',policyVersion:'approved-policy'});
 assert.throws(()=>validatePartnershipPromotion({expectedVersion:1,displayName:'Synthetic partner',policyVersion:'approved-policy',email:'synthetic@example.invalid'}),{status:400,code:'invalid-input'});
});
