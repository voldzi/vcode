// Run on a Docker host with the tested blog image already present.
// All storage is disposable; no host ports, secrets, production DB or Telegram.
// node scripts/verify-partnership-postgres.mjs --image <tested-blog-image>
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const argument = name => {const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1];};
const image = argument('--image'), postgresImage = argument('--postgres-image') ?? 'postgres:17-alpine';
if (!image || image.startsWith('-') || postgresImage.startsWith('-')) throw new Error('Provide --image with an existing tested blog image.');
const directory = await mkdtemp(join(tmpdir(), 'vcode-partnership-postgres-'));
const prefix = `vcode-partnership-pg-${process.pid}-${Date.now()}`;
const database = prefix + '-database', probe = prefix + '-probe';
const password = randomBytes(24).toString('hex'); // Disposable test credential only.
const docker = (...args) => execFileSync('docker', args, {maxBuffer: 4 * 1024 * 1024, timeout: 120000});
const clean = (...args) => {try {docker(...args);} catch { /* Only own disposable resources. */ }};

const acceptance = String.raw`
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import pg from 'pg';
import {migrate} from './services/blog/db.mjs';
import {createPartnershipStore} from './services/blog/partnership-store.mjs';
import {createPartnershipService} from './services/blog/partnerships.mjs';

const pool = new pg.Pool({connectionString: process.env.TEST_DATABASE_URL, max: 8, connectionTimeoutMillis: 5000});
const DAY=86400000, BASE=Date.parse('2026-10-09T12:00:00Z'), actor='11111111-2222-4333-8444-555555555555';
let now=BASE;
const store = createPartnershipStore({pool,clock:()=>now,hashSecret:'synthetic-storage-hmac-secret-only-'.repeat(2)});
const second = createPartnershipStore({pool,clock:()=>now,hashSecret:'synthetic-storage-hmac-secret-only-'.repeat(2)});
const data=(appId='kaloricke-tabulky')=>({appId,requestId:randomUUID(),locale:'cs',name:'Synthetic Partner',email:'synthetic@example.invalid',organization:'Synthetic Organisation',type:'vyrobce',message:'Synthetic offer for isolated PostgreSQL acceptance only.',privacyVersion:'partnership-intake-20261009-1'});
const count=async table=>Number((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.'+table)).rows[0].count);
const reset=async()=>{await pool.query('TRUNCATE vcode_contacts.partnership_inquiries,vcode_contacts.partnership_receipts,vcode_contacts.partners CASCADE');now=BASE;};
const reject=async(action,status,code)=>assert.rejects(action,f=>f.status===status&&f.code===code&&f.message===code);
try {
 await migrate(pool);await migrate(pool);
 assert.equal(await count('inquiries'),0,'Existing contact tables remain available and untouched');
 const form=data(),ref=await store.save(form,{challengeValid:true});
 assert.equal(await store.getApplication(ref),form.appId);
 assert.equal(await count('partnership_inquiries'),1);assert.equal(await count('partnership_receipts'),1);assert.equal(await count('partnership_outbox'),1);
 now+=600001;assert.equal(await store.save(Object.fromEntries(Object.entries(form).reverse()),{challengeValid:false}),ref,'Stable retries survive expired challenge');
 await reject(store.save({...form,message:form.message+' altered'},{challengeValid:true}),409,'idempotency-conflict');
 await reject(store.save(data(),{challengeValid:false}),403,'rejected');
 // A failure after two writes must roll back inquiry, receipt and outbox together.
 await pool.query('ALTER TABLE vcode_contacts.partnership_outbox ADD CONSTRAINT acceptance_reject CHECK(false) NOT VALID');
 const failure=data();await reject(store.save(failure,{challengeValid:true}),503,'unavailable');
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.partnership_receipts WHERE request_id=$1',[failure.requestId])).rows[0].count,0);
 assert.equal(await count('partnership_inquiries'),1);
 await pool.query('ALTER TABLE vcode_contacts.partnership_outbox DROP CONSTRAINT acceptance_reject');
 const retry=data(),parallel=await Promise.all([store.save(retry,{challengeValid:true}),second.save(retry,{challengeValid:true}),store.save(retry,{challengeValid:true})]);
 assert.equal(new Set(parallel).size,1);assert.equal(await count('partnership_inquiries'),2);assert.equal(await count('partnership_outbox'),2);
 const other=await store.save({...form,appId:'mestem-hrou'},{challengeValid:true});assert.notEqual(other,ref,'Request ID belongs to its authenticated application');
 const limited=await store.list({limit:1});assert.equal(limited.items.length,1);assert.equal(limited.summary.total,3);assert.deepEqual(limited.notifications,{pending:3,sent:0,failed:0});
 const oneApp=await store.list({appId:'kaloricke-tabulky'});assert.equal(oneApp.summary.total,2);
 const expiry=(await pool.query('SELECT expires_at FROM vcode_contacts.partnership_inquiries WHERE id=$1',[ref])).rows[0].expires_at;
 await assert.rejects(pool.query("UPDATE vcode_contacts.partnership_inquiries SET created_at=created_at+interval '1 hour',expires_at=expires_at+interval '1 hour' WHERE id=$1",[ref]),f=>f.code==='23514');
 await assert.rejects(pool.query("UPDATE vcode_contacts.partnership_inquiries SET stage='unknown' WHERE id=$1",[ref]),f=>f.code==='23514');
 await assert.rejects(pool.query('UPDATE vcode_contacts.partnership_inquiries SET next_action_due_at=expires_at WHERE id=$1',[ref]),f=>f.code==='23514');
 await assert.rejects(pool.query("UPDATE vcode_contacts.partnership_outbox SET expires_at=expires_at+interval '1 hour' WHERE inquiry_id=$1",[ref]),f=>f.code==='23514');
 const edits=await Promise.allSettled([store.update(ref,{expectedVersion:1,stage:'reviewing'},actor),second.update(ref,{expectedVersion:1,stage:'waiting'},actor)]);
 assert.equal(edits.filter(r=>r.status==='fulfilled').length,1);assert.equal(edits.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);
 let item=(await store.list({appId:'kaloricke-tabulky'})).items.find(i=>i.id===ref);
 assert.equal(item.version,2);assert.equal(item.audit.length,1);assert.equal(item.expiresAt.getTime(),expiry.getTime());
 await reject(store.update(ref,{expectedVersion:2,nextActionDueAt:expiry.toISOString()},actor),400,'invalid-input');
 const privateAction='Synthetic private next action never copied into audit history';
 item=await store.update(ref,{expectedVersion:2,managerId:actor,nextAction:privateAction,nextActionDueAt:new Date(BASE+DAY).toISOString()},actor);
 assert.equal(item.nextAction,privateAction);
 for(const forbidden of [form.email,form.name,form.organization,form.message,privateAction])assert.ok(!JSON.stringify(item.audit).includes(forbidden));
 assert.ok(!JSON.stringify(item).includes('payload_hash'));assert.ok(!JSON.stringify(item).includes('request_id'));
 // A workflow change and its redacted audit are one transaction.
 await pool.query('ALTER TABLE vcode_contacts.partnership_audit ADD CONSTRAINT acceptance_reject CHECK(false) NOT VALID');
 await reject(store.update(ref,{expectedVersion:item.version,stage:'closed'},actor),503,'unavailable');
 const afterFailure=(await store.list({appId:'kaloricke-tabulky'})).items.find(i=>i.id===ref);assert.equal(afterFailure.version,item.version);assert.equal(afterFailure.stage,item.stage);
 await pool.query('ALTER TABLE vcode_contacts.partnership_audit DROP CONSTRAINT acceptance_reject');
 for(let index=0;index<205;index++)item=await store.update(ref,{expectedVersion:item.version,stage:index%2?'reviewing':'waiting'},actor);
 assert.equal(item.audit.length,200,'Serialized audit is bounded per inquiry');assert.equal(item.expiresAt.getTime(),expiry.getTime());
 await reject(store.promote(ref,{expectedVersion:item.version,displayName:'Synthetic approved partner',policyVersion:'synthetic-policy'},actor,{enabled:false}),403,'rejected');
 const policy={enabled:true,version:'synthetic-policy',retentionDays:365};now=BASE+DAY;
 const promotionInput={expectedVersion:item.version,displayName:'Synthetic approved partner',policyVersion:policy.version};
 await pool.query('ALTER TABLE vcode_contacts.partnership_audit ADD CONSTRAINT acceptance_reject CHECK(false) NOT VALID');
 await reject(store.promote(ref,promotionInput,actor,policy),503,'unavailable');assert.equal(await count('partners'),0);
 await pool.query('ALTER TABLE vcode_contacts.partnership_audit DROP CONSTRAINT acceptance_reject');
 const partner=await store.promote(ref,promotionInput,actor,policy);assert.equal(partner.expiresAt.getTime(),now+365*DAY);
 assert.deepEqual(Object.keys(partner).sort(),['appId','createdAt','createdBy','displayName','expiresAt','id','policyVersion','type'].sort());
 const partnerFields=(await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='vcode_contacts' AND table_name='partners'")).rows.map(r=>r.column_name);
 for(const field of ['email','name','message','organization','next_action'])assert.ok(!partnerFields.includes(field));
 await reject(store.promote(ref,{...promotionInput,expectedVersion:item.version+1},actor,policy),409,'idempotency-conflict');
 await store.remove(ref,actor);await reject(store.getApplication(ref),404,'not-found');await reject(store.save(form,{challengeValid:true}),410,'request-closed');await reject(store.save({...form,message:form.message+' altered'},{challengeValid:true}),410,'request-closed');
 assert.equal((await pool.query('SELECT inquiry_id FROM vcode_contacts.partnership_receipts WHERE reference=$1',[ref])).rows[0].inquiry_id,null);
 assert.equal((await pool.query('SELECT source_inquiry_id FROM vcode_contacts.partners WHERE id=$1',[partner.id])).rows[0].source_inquiry_id,null);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.partnership_audit WHERE inquiry_id=$1',[ref])).rows[0].count,0);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.partnership_outbox WHERE inquiry_id=$1',[ref])).rows[0].count,0);
 now=BASE+90*DAY;
 const disabledStore=createPartnershipStore({pool,clock:()=>now});await disabledStore.maintenance();
 assert.equal(await count('partnership_receipts'),2,'Only receipts created later than the exact boundary remain');
 assert.equal((await store.listPartners()).items.length,1,'Independent partner does not extend the original inquiry');
 await reject(store.save(form,{challengeValid:false}),403,'rejected');
 now=BASE+366*DAY;await disabledStore.maintenance();await reject(store.getApplication(parallel[0]),404,'not-found');assert.equal(await count('partners'),0);assert.equal(await count('partnership_inquiries'),0);assert.equal(await count('partnership_receipts'),0);assert.equal(await count('partnership_outbox'),0);
 console.log('PASS: repeatable private migrations, committed receipt/outbox, SQL rollback, concurrent retry isolation, workflow optimistic locking, bounded redacted audit, approved minimal promotion, tombstones and exact immutable retention.');

 // Tombstones count against each app's UTC-day capacity; the global lock prevents races across replicas.
 await reset();
 for(let index=0;index<30;index++){const id=await store.save(data(),{challengeValid:true});await store.remove(id,actor);}
 const perApp=await Promise.allSettled([store.save(data(),{challengeValid:true}),second.save(data(),{challengeValid:true})]);
 assert.ok(perApp.every(r=>r.status==='rejected'&&r.reason.status===429));assert.equal(await count('partnership_receipts'),30);
 for(const [appId,amount] of [['mestem-hrou',30],['myslopis',30],['synthetic-fourth',10]])for(let index=0;index<amount;index++)await store.save(data(appId),{challengeValid:true});
 await reject(store.save(data('synthetic-fifth'),{challengeValid:true}),429,'rate-limit');
 assert.equal(await count('partnership_receipts'),100);now=BASE+DAY;await store.save(data(),{challengeValid:true});assert.equal(await count('partnership_receipts'),101);
 console.log('PASS: persistent per-app 30/day and global 100/day capacity includes deletion receipts and resets at UTC day boundaries.');

 // Lease takeover: stale completion cannot overwrite the new worker's retry state.
 await reset();const noticeForm=data(),noticeRef=await store.save(noticeForm,{challengeValid:true});
 let enter,release;const entered=new Promise(resolve=>enter=resolve),held=new Promise(resolve=>release=resolve),seen=[];
 const firstRun=store.maintenance({notify:async job=>{seen.push(job);enter();await held;}});await entered;
 assert.equal((await second.maintenance({notify:async job=>seen.push(job)})).processed,0);
 now+=60001;await second.maintenance({notify:async job=>{seen.push(job);throw new Error('Synthetic Telegram failure with synthetic@example.invalid');}});
 release();await firstRun;
 let state=(await pool.query('SELECT status,attempts,next_attempt_at,lease_token FROM vcode_contacts.partnership_outbox WHERE inquiry_id=$1',[noticeRef])).rows[0];
 assert.equal(state.status,'pending');assert.equal(state.attempts,2);assert.equal(state.lease_token,null,'Stale successful callback did not mark the new lease sent');
 for(let attempt=3;attempt<=6;attempt++){
  now=state.next_attempt_at.getTime();await store.maintenance({notify:async job=>{seen.push(job);throw new Error('synthetic failure');}});
  state=(await pool.query('SELECT status,attempts,next_attempt_at FROM vcode_contacts.partnership_outbox WHERE inquiry_id=$1',[noticeRef])).rows[0];assert.equal(state.attempts,attempt);
 }
 assert.equal(state.status,'failed');await store.maintenance({notify:async()=>{throw new Error('Must not send after six attempts');}});
 assert.equal(seen.length,6);for(const job of seen){assert.deepEqual(Object.keys(job).sort(),['appId','reference']);for(const field of [noticeForm.email,noticeForm.name,noticeForm.message,noticeForm.organization])assert.ok(!JSON.stringify(job).includes(field));}
 const successRef=await store.save(data('myslopis'),{challengeValid:true});let successes=0;
 await Promise.all([store.maintenance({notify:async()=>{successes++;}}),second.maintenance({notify:async()=>{successes++;}})]);
 assert.equal(successes,1);assert.equal((await pool.query('SELECT status FROM vcode_contacts.partnership_outbox WHERE inquiry_id=$1',[successRef])).rows[0].status,'sent');
 await second.maintenance({notify:async()=>{successes++;}});assert.equal(successes,1);
 const deleteForm=data(),deleteRef=await store.save(deleteForm,{challengeValid:true});let enterDelete,releaseDelete;
 const deletingEntered=new Promise(resolve=>enterDelete=resolve),deletingHeld=new Promise(resolve=>releaseDelete=resolve);
 const deletingRun=store.maintenance({notify:async()=>{enterDelete();await deletingHeld;}});await deletingEntered;
 await second.remove(deleteRef,actor);releaseDelete();await deletingRun;
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.partnership_outbox WHERE inquiry_id=$1',[deleteRef])).rows[0].count,0);
 await reject(store.save(deleteForm,{challengeValid:true}),410,'request-closed');
 const mismatch=Number((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.partnership_outbox o JOIN vcode_contacts.partnership_inquiries i ON i.id=o.inquiry_id WHERE o.expires_at<>i.expires_at')).rows[0].count);assert.equal(mismatch,0);
 now+=91*DAY;await store.maintenance();for(const table of ['partnership_inquiries','partnership_receipts','partnership_outbox','partnership_audit'])assert.equal(await count(table),0);
 console.log('PASS: durable bounded retries, atomic cross-worker leases, stale callback CAS, content-free notification jobs, deletion during delivery and complete expiry cleanup.');

 // Exercise the actual transport used by application relays, with real private
 // file gates and real transactions. Native fetch supplies sec-fetch-mode:cors.
 await reset();
 const privateDir=await mkdtemp(join(tmpdir(),'vcode-partnership-http-'));
 const appKey='synthetic-mojejidlo-server-key-'.repeat(2),otherKey='synthetic-mestem-server-key-'.repeat(2);
 const secret='synthetic-challenge-server-key-'.repeat(2),inboxKey='synthetic-inbox-owner-key-'.repeat(2);
 const registryPath=join(privateDir,'registry.json'),firstKeyPath=join(privateDir,'first-key'),secondKeyPath=join(privateDir,'second-key');
 const disabledPolicy={enabled:false,version:'',retentionDays:0,approvedAt:null,publishedAt:null,noticeUrl:''};
 const entry=(appId,domain,keyFile)=>({appId,domain,keyFile,enabled:true,types:['vyrobce','jine'],privacyVersion:'partnership-intake-20261009-1',approvedAt:new Date(BASE).toISOString(),publishedAt:new Date(BASE).toISOString(),noticeUrl:'https://'+domain+'/privacy?section=partnership',partnerPolicy:disabledPolicy});
 const registry={version:'partnership-intake-v1',applications:[entry('kaloricke-tabulky','mojeporce.cz',firstKeyPath),entry('mestem-hrou','mestemhrou.cz',secondKeyPath)]};
 await writeFile(firstKeyPath,appKey,{mode:0o600});await writeFile(secondKeyPath,otherKey,{mode:0o600});await writeFile(registryPath,JSON.stringify(registry),{mode:0o600});
 const sent=[],httpConfig={siteOrigin:'https://example.invalid',partnershipIntakeEnabled:true,partnershipRegistryFile:registryPath,partnershipChallengeSecret:secret,contactInboxToken:inboxKey,contactInboxOwnerId:actor,contactFormSecret:'synthetic-existing-contact-key-'.repeat(2),telegramEnabled:true,telegramBotToken:'synthetic-no-real-bot',telegramChatId:'synthetic-chat',telegramApiBaseUrl:'https://telegram.invalid'};
 const service=await createPartnershipService({pool,config:httpConfig,clock:()=>now,fetchImpl:async(_,options)=>{sent.push(JSON.parse(options.body));return new Response(JSON.stringify({ok:true,result:{message_id:sent.length}}));}});
 const http=createServer(async(req,res)=>{if(!await service.handle(req,res))res.writeHead(404).end();});
 await new Promise(resolve=>http.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+http.address().port,bucket='B'.repeat(43);
 const request=async(path,{method='GET',payload,key=appKey,owner,headers={}}={})=>{
  const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+key,...(owner?{'X-VCode-Admin-Id':owner}:{}),...(payload?{'Content-Type':'application/json'}:{}),...headers},body:payload?JSON.stringify(payload):undefined});
  assert.equal(response.headers.get('cache-control'),'no-store');return {status:response.status,body:await response.json()};
 };
 try{
  const id=randomUUID(),challengeInput={requestId:id,locale:'cs',clientBucket:bucket};
  const challenge=await request('/internal/partnerships/v1/challenge',{method:'POST',payload:challengeInput});assert.equal(challenge.status,200);assert.equal(challenge.body.appId,'kaloricke-tabulky');
  for(const headers of[{Origin:httpConfig.siteOrigin},{Cookie:'synthetic=must-not-forward'},{'Sec-Fetch-Site':'same-origin'}])assert.equal((await request('/internal/partnerships/v1/challenge',{method:'POST',payload:challengeInput,headers})).status,403);
  const offer={...data(),requestId:id,token:challenge.body.token,clientBucket:bucket,website:''};delete offer.appId;
  now+=2000;
  assert.equal((await request('/internal/partnerships/v1/submissions',{method:'POST',payload:offer,key:otherKey})).status,403,'Cross-app token must not create a DB receipt');
  assert.equal((await request('/internal/partnerships/v1/submissions',{method:'POST',payload:{...offer,requestId:randomUUID()}})).status,403);
  const accepted=await request('/internal/partnerships/v1/submissions',{method:'POST',payload:offer});assert.equal(accepted.status,202);
  const wireReference=accepted.body.reference;
  assert.equal(await count('partnership_inquiries'),1);assert.equal(await count('partnership_receipts'),1);assert.equal(await count('partnership_outbox'),1);
  const repeats=await Promise.all([request('/internal/partnerships/v1/submissions',{method:'POST',payload:offer}),request('/internal/partnerships/v1/submissions',{method:'POST',payload:offer})]);
  for(const reply of repeats){assert.equal(reply.status,202);assert.equal(reply.body.reference,wireReference);}
  assert.equal((await request('/internal/partnerships/v1/submissions',{method:'POST',payload:{...offer,message:offer.message+' changed'}})).status,409);
  now+=600001;assert.equal((await request('/internal/partnerships/v1/submissions',{method:'POST',payload:offer})).body.reference,wireReference);
  assert.equal((await request('/internal/partnerships/v1/inquiries')).status,401,'Application key cannot administer');
  assert.equal((await request('/internal/partnerships/v1/inquiries',{key:inboxKey,owner:randomUUID()})).status,401,'Inbox key also needs configured verified actor');
  const inbox=await request('/internal/partnerships/v1/inquiries',{key:inboxKey,owner:actor});assert.equal(inbox.status,200);assert.equal(inbox.body.items.length,1);assert.equal(Object.hasOwn(inbox.body,'managerId'),false);
  const expiry=inbox.body.items[0].expiresAt;
  const changed=await request('/internal/partnerships/v1/inquiries/'+wireReference,{method:'PATCH',key:inboxKey,owner:actor,payload:{expectedVersion:1,stage:'reviewing',managerId:actor,nextAction:'Synthetic next action'}});
  assert.equal(changed.status,200);assert.equal(changed.body.item.version,2);assert.equal(changed.body.item.expiresAt,expiry);assert.equal(changed.body.item.audit.length,1);
  assert.equal((await request('/internal/partnerships/v1/inquiries/'+wireReference,{method:'PATCH',key:inboxKey,owner:actor,payload:{expectedVersion:1,stage:'closed'}})).status,409);
  await service.maintenance();assert.equal(sent.length,1);for(const value of[offer.name,offer.email,offer.organization,offer.message])assert.ok(!sent[0].text.includes(value));assert.ok(sent[0].text.includes('/prehled/#partnerships'));
  assert.equal((await request('/internal/partnerships/v1/inquiries/'+wireReference,{method:'DELETE',key:inboxKey,owner:actor})).status,200);
  now+=3600000;assert.equal((await request('/internal/partnerships/v1/submissions',{method:'POST',payload:offer})).status,410);
  assert.equal(await count('partnership_inquiries'),0);assert.equal(await count('partnership_outbox'),0);assert.equal(await count('partnership_audit'),0);assert.equal(await count('partnership_receipts'),1);
  const nextId=randomUUID(),nextChallenge=await request('/internal/partnerships/v1/challenge',{method:'POST',payload:{...challengeInput,requestId:nextId}});assert.equal(nextChallenge.status,200);now+=2000;
  await pool.query('ALTER TABLE vcode_contacts.partnership_outbox ADD CONSTRAINT acceptance_http_reject CHECK(false) NOT VALID');
  try{
   const failed=await request('/internal/partnerships/v1/submissions',{method:'POST',payload:{...offer,requestId:nextId,token:nextChallenge.body.token}});assert.equal(failed.status,503);assert.equal(failed.body.code,'unavailable');
   for(const value of[offer.name,offer.email,offer.message,'acceptance_http_reject'])assert.ok(!JSON.stringify(failed.body).includes(value));
   assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.partnership_receipts WHERE request_id=$1',[nextId])).rows[0].count,0);
  }finally{await pool.query('ALTER TABLE vcode_contacts.partnership_outbox DROP CONSTRAINT acceptance_http_reject');}
  registry.applications[0].enabled=false;await writeFile(registryPath,JSON.stringify(registry));await rm(firstKeyPath);
  assert.equal((await request('/internal/partnerships/v1/challenge',{method:'POST',payload:challengeInput})).status,401);
  assert.equal((await request('/internal/partnerships/v1/challenge',{method:'POST',payload:{...challengeInput,requestId:randomUUID()},key:otherKey})).status,200,'Revocation must preserve another app');
  const disabled=await createPartnershipService({pool,config:{...httpConfig,partnershipIntakeEnabled:false,partnershipChallengeSecret:''},clock:()=>BASE+91*DAY});
  await disabled.maintenance();assert.equal(await count('partnership_receipts'),0);
  console.log('PASS: actual relay HTTP transport, private-file app approval, bound cross-app challenges, atomic SQL receipt/retry/rollback, admin RBAC/workflow/audit, generic Telegram, delete/tombstone and independent revocation.');
 }finally{http.closeAllConnections();await new Promise(resolve=>http.close(resolve));await rm(privateDir,{recursive:true,force:true});}

 // A real cold blog server with no partnership configuration must still purge
 // old records; maintenance is not conditional on publication or intake flags.
 await reset();
 const historical=createPartnershipStore({pool,clock:()=>Date.now()-91*DAY,hashSecret:secret});
 await historical.save(data(),{challengeValid:true});assert.equal(await count('partnership_inquiries'),1);
 let output='';const child=spawn(process.execPath,['services/blog/server.mjs'],{cwd:'/app',env:{PATH:process.env.PATH,DATABASE_URL:process.env.TEST_DATABASE_URL,BLOG_COMMENT_HASH_SECRET:'synthetic-blog-comment-secret-'.repeat(2),BLOG_PORT:'18889'}});
 child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);
 try{
  let healthy=false;
  for(let attempt=0;attempt<80;attempt++){
   if(child.exitCode!==null)throw new Error('Synthetic cold server terminated before health check');
   try{const r=await fetch('http://127.0.0.1:18889/health/blog');if(r.status===200){assert.equal((await r.json()).generationEnabled,false);healthy=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.equal(healthy,true);assert.equal(await count('partnership_inquiries'),0);assert.equal(await count('partnership_receipts'),0);assert.equal(await count('partnership_outbox'),0);
  assert.ok(!output.includes('synthetic@example.invalid'));assert.ok(!output.includes('Synthetic Partner'));
  console.log('PASS: actual blog server cold-disabled startup preserves health and prunes partnership data with no intake secret or registry.');
 }finally{
  child.kill('SIGTERM');await new Promise(resolve=>{const timer=setTimeout(()=>{child.kill('SIGKILL');resolve();},2000);child.once('exit',()=>{clearTimeout(timer);resolve();});});
 }
} finally {await pool.end();}

`;

try {
  execFileSync(process.execPath, ['--input-type=module', '--check'], {input: acceptance});
  await writeFile(join(directory, 'acceptance.mjs'), acceptance);
  docker('image', 'inspect', image);
  docker('image', 'inspect', postgresImage);
  docker('network', 'create', '--internal', prefix);
  docker('run', '--detach', '--rm', '--pull=never', '--name', database, '--network', prefix,
    '--network-alias', 'partnerships-test-database', '--memory', '512m', '--cpus', '0.5',
    '--tmpfs', '/var/lib/postgresql/data:rw,size=128m', '--env', 'POSTGRES_USER=partnerships_test',
    '--env', 'POSTGRES_DB=partnerships_test', '--env', 'POSTGRES_PASSWORD=' + password, postgresImage);
  let ready = false;
  for (let n = 0; n < 120; n++) {
    // TCP readiness excludes initdb's temporary socket-only postmaster.
    try {docker('exec', database, 'pg_isready', '-h', '127.0.0.1', '-U', 'partnerships_test', '-d', 'partnerships_test');ready = true;break;} catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('Isolated synthetic PostgreSQL did not become ready.');
  const output = docker('run', '--rm', '--pull=never', '--name', probe, '--network', prefix,
    '--memory', '384m', '--cpus', '0.5',
    '--entrypoint', 'node', '--workdir', '/app', '--volume', join(directory, 'acceptance.mjs') + ':/app/partnership-postgres-acceptance.mjs:ro',
    '--env', 'TEST_DATABASE_URL=postgresql://partnerships_test:' + password + '@partnerships-test-database:5432/partnerships_test',
    image, '/app/partnership-postgres-acceptance.mjs');
  process.stdout.write(output);
} finally {
  clean('rm', '--force', probe);
  clean('rm', '--force', database);
  clean('network', 'rm', prefix);
  await rm(directory, {recursive: true, force: true});
}
