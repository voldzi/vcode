// Run on a Docker host with the tested blog image already present.
// All storage is disposable; no host ports, secrets, production DB or Telegram.
// node scripts/verify-contact-postgres.mjs --image <tested-blog-image>
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const argument = name => {const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1];};
const image = argument('--image'), postgresImage = argument('--postgres-image') ?? 'postgres:17-alpine';
if (!image || image.startsWith('-') || postgresImage.startsWith('-')) throw new Error('Provide --image with an existing tested blog image.');
const directory = await mkdtemp(join(tmpdir(), 'vcode-contact-postgres-'));
const prefix = `vcode-contact-pg-${process.pid}-${Date.now()}`;
const database = prefix + '-database', probe = prefix + '-probe';
const password = randomBytes(24).toString('hex'); // Disposable test credential only.
const docker = (...args) => execFileSync('docker', args, {maxBuffer: 4 * 1024 * 1024, timeout: 120000});
const clean = (...args) => {try {docker(...args);} catch { /* Only own disposable resources. */ }};

const acceptance = String.raw`
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {migrate} from './services/blog/db.mjs';
import {createContactService} from './services/blog/contacts.mjs';
const pool = new pg.Pool({connectionString: process.env.TEST_DATABASE_URL, max: 4, connectionTimeoutMillis: 5000});
let now = Date.parse('2026-10-09T12:00:00.000Z'), telegramFails = false;
const base = now, sent = [];
const config = {siteOrigin:'https://example.invalid',contactEnabled:true,contactPrivacyVersion:'contact-20261009',
  contactFormSecret:'synthetic-form-key-'.repeat(3),contactInboxToken:'synthetic-inbox-key-'.repeat(3),
  telegramEnabled:true,telegramBotToken:'synthetic-not-real',telegramChatId:'synthetic-chat',telegramApiBaseUrl:'https://telegram.invalid'};
try {
 await migrate(pool); await migrate(pool); // New schema is repeatable and leaves blog migrations valid.
 const service = await createContactService({pool,config,clock:()=>now,fetchImpl:async (_, options)=>{
  sent.push(JSON.parse(options.body));
  return new Response(JSON.stringify(telegramFails?{ok:false}:{ok:true,result:{message_id:sent.length}}),{status:telegramFails?503:200});
 }});
 assert.equal(service.enabled,true,'Tested image includes its canonical application catalog');
 const request = async (path,method='GET',data,authenticated=false)=>{
  const req=Readable.from(data===undefined?[]:[Buffer.from(JSON.stringify(data))]);
  req.url=path;req.method=method;req.socket={remoteAddress:'192.0.2.40'};
  req.headers={'sec-fetch-site':'same-origin',origin:config.siteOrigin,'x-real-ip':'192.0.2.40',
   ...(data===undefined?{}:{'content-type':'application/json'}),...(authenticated?{authorization:'Bearer '+config.contactInboxToken}:{})};
  const res={headersSent:false,writeHead(status,headers){this.status=status;this.headers=headers;this.headersSent=true;return this;},end(value){this.body=value;}};
  assert.equal(await service.handle(req,res),true);assert.equal(res.headers['Cache-Control'],'no-store');
  return {status:res.status,value:JSON.parse(res.body)};
 };
 const payload=token=>({token,requestId:randomUUID(),locale:'cs',name:'Syntetický kontakt',email:'synthetic@example.invalid',
  organization:null,area:'partnership',application:'vcode-recall',message:'Izolovaná syntetická zpráva pro ověření SQL a trvalé fronty.',website:'',privacyVersion:'contact-20261009'});
 const challenge=(await request('/api/contact/challenge')).value;now+=2000;
 const form=payload(challenge.token),receipt=await request('/api/contact','POST',form);
 assert.equal(receipt.status,202);const first=receipt.value.reference;
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries')).rows[0].count,1);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.outbox')).rows[0].count,1);
 assert.equal((await request('/api/contact','POST',form)).value.reference,first);
 assert.equal((await request('/api/contact','POST',{...form,message:form.message+' změna'})).status,409);
 await assert.rejects(pool.query("UPDATE vcode_contacts.inquiries SET status='unapproved' WHERE id=$1",[first]),failure=>failure.code==='23514');
 await assert.rejects(pool.query("UPDATE vcode_contacts.inquiries SET privacy_version='old' WHERE id=$1",[first]),failure=>failure.code==='23514');
 await assert.rejects(pool.query("UPDATE vcode_contacts.inquiries SET expires_at=created_at+interval '2161 hours' WHERE id=$1",[first]),failure=>failure.code==='23514');
 // A durable inbox insert must roll back if inserting its outbox fails.
 await pool.query('ALTER TABLE vcode_contacts.outbox ADD CONSTRAINT acceptance_reject CHECK(false) NOT VALID');
 const failedForm={...form,requestId:randomUUID()};
 const failed=await request('/api/contact','POST',failedForm);assert.equal(failed.status,503);assert.deepEqual(failed.value,{ok:false,error:'unavailable'});
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries WHERE request_id=$1',[failedForm.requestId])).rows[0].count,0);
 await pool.query('ALTER TABLE vcode_contacts.outbox DROP CONSTRAINT acceptance_reject');
 // Real PostgreSQL advisory transaction lock serializes concurrent retries.
 const concurrentForm={...form,requestId:randomUUID(),area:'development'};
 const parallel=await Promise.all([request('/api/contact','POST',concurrentForm),request('/api/contact','POST',concurrentForm)]);
 assert.ok(parallel.every(reply=>reply.status===202));assert.equal(parallel[0].value.reference,parallel[1].value.reference);
 const second=parallel[0].value.reference;
 const inbox=await request('/internal/contacts?limit=1&startAt='+base+'&endAt='+now,'GET',undefined,true);
 assert.equal(inbox.status,200);assert.equal(inbox.value.items.length,1);assert.equal(inbox.value.summary.total,2);assert.equal(inbox.value.interest.received,2);
 assert.deepEqual(inbox.value.notifications,{pending:2,sent:0,failed:0});
 assert.equal((await request('/internal/contacts/'+first,'PATCH',{status:'read'},true)).status,200);
 assert.equal((await pool.query('SELECT status FROM vcode_contacts.inquiries WHERE id=$1',[first])).rows[0].status,'read');
 assert.equal((await request('/internal/contacts/'+second,'DELETE',undefined,true)).status,200);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.outbox WHERE inquiry_id=$1',[second])).rows[0].count,0);
 await service.maintenance();await service.maintenance();assert.equal(sent.length,1);
 assert.equal((await pool.query('SELECT status,attempts FROM vcode_contacts.outbox WHERE inquiry_id=$1',[first])).rows[0].status,'sent');
 now=base+3600000;const laterChallenge=(await request('/api/contact/challenge')).value;now+=2000;
 const laterForm=payload(laterChallenge.token),later=await request('/api/contact','POST',laterForm);assert.equal(later.status,202);
 telegramFails=true;
 for(let attempt=0;attempt<6;attempt++){
  await service.maintenance();const job=(await pool.query('SELECT status,attempts,next_attempt_at FROM vcode_contacts.outbox WHERE inquiry_id=$1',[later.value.reference])).rows[0];
  assert.equal(job.attempts,attempt+1);now=job.next_attempt_at.getTime();
 }
 assert.equal((await pool.query('SELECT status FROM vcode_contacts.outbox WHERE inquiry_id=$1',[later.value.reference])).rows[0].status,'failed');
 await service.maintenance();assert.equal(sent.length,7);
 const notificationState=(await request('/internal/contacts','GET',undefined,true)).value.notifications;
 assert.deepEqual(notificationState,{pending:0,sent:1,failed:1});
 for(const notice of sent){for(const field of [form.name,form.email,form.message])assert.ok(!notice.text.includes(field));assert.ok(notice.text.includes('https://example.invalid/prehled/#inquiries'));}
 const mismatch=(await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.outbox o JOIN vcode_contacts.inquiries i ON i.id=o.inquiry_id WHERE o.expires_at<>i.expires_at')).rows[0].count;
 assert.equal(mismatch,0);
 now=base+90*86400000+2000;await service.maintenance();
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries WHERE id=$1',[first])).rows[0].count,0);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.outbox WHERE inquiry_id=$1',[first])).rows[0].count,0);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries')).rows[0].count,1);
 now=base+91*86400000;await service.maintenance();
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries')).rows[0].count,0);
 assert.equal((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.outbox')).rows[0].count,0);
 console.log('PASS: real PostgreSQL migrations/constraints; atomic receipt/outbox rollback; concurrent idempotency; period metrics; status/delete cascade; durable notification retry; exact 90-day retention.');
} finally {await pool.end();}
`;

try {
  execFileSync(process.execPath, ['--input-type=module', '--check'], {input: acceptance});
  await writeFile(join(directory, 'acceptance.mjs'), acceptance);
  docker('image', 'inspect', image);
  docker('image', 'inspect', postgresImage);
  docker('network', 'create', '--internal', prefix);
  docker('run', '--detach', '--rm', '--pull=never', '--name', database, '--network', prefix,
    '--network-alias', 'contacts-test-database', '--memory', '512m', '--cpus', '0.5',
    '--tmpfs', '/var/lib/postgresql/data:rw,size=128m', '--env', 'POSTGRES_USER=contacts_test',
    '--env', 'POSTGRES_DB=contacts_test', '--env', 'POSTGRES_PASSWORD=' + password, postgresImage);
  let ready = false;
  for (let n = 0; n < 120; n++) {
    // TCP readiness excludes initdb's temporary socket-only postmaster.
    try {docker('exec', database, 'pg_isready', '-h', '127.0.0.1', '-U', 'contacts_test', '-d', 'contacts_test');ready = true;break;} catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('Isolated synthetic PostgreSQL did not become ready.');
  const output = docker('run', '--rm', '--pull=never', '--name', probe, '--network', prefix,
    '--entrypoint', 'node', '--workdir', '/app', '--volume', join(directory, 'acceptance.mjs') + ':/app/contact-postgres-acceptance.mjs:ro',
    '--env', 'TEST_DATABASE_URL=postgresql://contacts_test:' + password + '@contacts-test-database:5432/contacts_test',
    image, '/app/contact-postgres-acceptance.mjs');
  process.stdout.write(output);
} finally {
  clean('rm', '--force', probe);
  clean('rm', '--force', database);
  clean('network', 'rm', prefix);
  await rm(directory, {recursive: true, force: true});
}
