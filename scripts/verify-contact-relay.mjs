// Disposable acceptance: actual app Nginx -> private TLS gateway -> existing
// createContactService -> only the existing 002_contacts.sql tables.
// No host ports, production connections, genuine records or real Telegram.
// node scripts/verify-contact-relay.mjs --image <tested-blog-image> [--output /absolute/evidence.json]
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash, randomBytes} from 'node:crypto';
import {chmod, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {isAbsolute, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const option = name => {const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1];};
const image = option('--image'), output = option('--output');
const postgresImage = option('--postgres-image') ?? 'postgres:17-alpine';
const nginxImage = option('--nginx-image') ?? 'nginx@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46';
if (!image || image.startsWith('-') || postgresImage.startsWith('-') || nginxImage.startsWith('-') || output && !isAbsolute(output)) throw new Error('Provide an existing --image and optional absolute --output.');
const templateRoot = fileURLToPath(new URL('../deploy/contact-relays/', import.meta.url));
const directory = await mkdtemp(join(tmpdir(), 'vcode-contact-relay-'));
await chmod(directory, 0o700);
const prefix = `vcode-contact-relay-${process.pid}-${Date.now()}`;
const names = Object.fromEntries(['database','backend','gateway','app','browser','outsider'].map(name => [name, prefix+'-'+name]));
const networks = Object.fromEntries(['central','relay','edge'].map(name => [name, prefix+'-'+name]));
const volumes = Object.fromEntries(['gateway-config','gateway-tls','app-config','app-secret'].map(name => [name, prefix+'-'+name]));
const uid = String(process.getuid?.() ?? 1000), gid = String(process.getgid?.() ?? 1000);
const base = Date.parse('2026-10-09T14:59:58Z');
const synthetic = {base, key: randomBytes(32).toString('base64url'), secondKey: randomBytes(32).toString('base64url'),
  inbox: randomBytes(32).toString('base64url'), form: randomBytes(32).toString('base64url'), password: randomBytes(24).toString('hex')};
const docker = (...args) => execFileSync('docker', args, {encoding:'utf8', timeout:120000, maxBuffer:4*1024*1024, stdio:['ignore','pipe','pipe']});
const clean = (...args) => {try {docker(...args);} catch { /* Own disposable resources only. */ }};
const put = (name, value) => writeFile(join(directory,name), value, {mode:0o600});
const delay = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
const constrained = ['--memory','384m','--cpus','0.5','--pids-limit','96','--security-opt','no-new-privileges:true','--cap-drop','ALL'];
const fixtureMount = ['--volume',directory+':/qa:rw'];
const identity = ['--user',uid+':'+gid];
const hashes = {};
let evidence, completed = false;

const common = String.raw`
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appendFile,chmod,mkdir,writeFile} from 'node:fs/promises';
import pg from '/app/node_modules/pg/lib/index.js';
import {createContactService} from '/app/services/blog/contacts.mjs';
export const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8'));
export const clock=()=>Number(readFileSync('/qa/clock','utf8'));
export const pool=()=>new pg.Pool({connectionString:'postgresql://contact_test:'+fixture.password+'@contact-postgres:5432/contact_test',max:4,connectionTimeoutMillis:5000});
export const privateDir='/tmp/contact-relay-private';
export const registryPath=privateDir+'/registry.json';
export const entries=[
 {id:'mestem-hrou',origin:'https://mestemhrou.cz',application:'mestem-hrou',area:'partnership',enabled:true,privacyVersion:'contact-20261009',approvedAt:new Date(fixture.base).toISOString(),publishedAt:new Date(fixture.base).toISOString(),keyFile:privateDir+'/first-key'},
 {id:'synthetic-second',origin:'https://second.example.invalid',application:'myslopis',area:'partnership',enabled:true,privacyVersion:'contact-20261009',approvedAt:new Date(fixture.base).toISOString(),publishedAt:new Date(fixture.base).toISOString(),keyFile:privateDir+'/second-key'}
];
export async function prepare(){
 await mkdir(privateDir,{recursive:true,mode:0o700});await chmod(privateDir,0o700);
 await writeFile(entries[0].keyFile,fixture.key,{mode:0o600});await writeFile(entries[1].keyFile,fixture.secondKey,{mode:0o600});
 await writeFile(registryPath,JSON.stringify(entries),{mode:0o600});
}
export const config={siteOrigin:'https://vcode.example.invalid',contactEnabled:true,contactRelayEnabled:true,contactRelayRegistryFile:registryPath,
 contactInboxToken:fixture.inbox,contactFormSecret:fixture.form,contactPrivacyVersion:'contact-20261009',
 telegramEnabled:true,telegramBotToken:'fixture-never-live',telegramChatId:'fixture-never-live-chat',telegramApiBaseUrl:'https://telegram.example.invalid'};
export const service=pool=>createContactService({pool,config,catalog:[{id:'mestem-hrou',name:'Městem hrou'},{id:'myslopis',name:'Synthetic Second App'}],clock,fetchImpl:async(url,options)=>{
 assert.equal(url,'https://telegram.example.invalid/botfixture-never-live/sendMessage');
 const payload=JSON.parse(options.body);
 for(const forbidden of ['Synthetic Contact','synthetic@example.invalid','Synthetic Organisation','Synthetic isolated partnership message',fixture.key,fixture.inbox])assert.ok(!JSON.stringify(payload).includes(forbidden));
 assert.match(payload.text,/Městem hrou/);assert.match(payload.text,/Spolupráce/);assert.match(payload.text,/https:\/\/vcode\.example\.invalid\/prehled\/#inquiries/);
 assert.equal(payload.disable_web_page_preview,true);
 await appendFile('/qa/notifications.jsonl',JSON.stringify(payload)+'\n',{mode:0o600});
 return new Response(JSON.stringify({ok:true,result:{message_id:1}}),{headers:{'content-type':'application/json'}});
}});
`;

const backend = String.raw`
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {fixture,pool,prepare,service} from './common.mjs';
const database=pool();
const sql=await readFile('/app/services/blog/migrations/002_contacts.sql','utf8');await database.query(sql);await database.query(sql);
await prepare();const contacts=await service(database);assert.equal(contacts.enabled,true);
const observations={requests:0,privateKeysInResponses:false,rawBrowserHeadersForwarded:false,canonicalAppContextSeen:false};
const server=createServer(async(req,res)=>{
 observations.requests++;
 if(req.url.startsWith('/internal/contact-relays/')&&req.headers['x-fixture-direct-control']!=='isolated-controller'){
  if(['cookie','proxy-authorization','referer','user-agent','x-forwarded-for','x-forwarded-host','x-forwarded-proto','x-forwarded-port','forwarded','x-vcode-admin-id','x-admin-id','x-admin-token'].some(key=>key in req.headers))observations.rawBrowserHeadersForwarded=true;
  if(req.headers.authorization==='Bearer '+fixture.key&&req.headers.origin==='https://mestemhrou.cz'&&req.headers['sec-fetch-site']==='same-origin')observations.canonicalAppContextSeen=true;
 }
 if(!await contacts.handle(req,res))res.writeHead(404).end();
 await writeFile('/qa/observations.json',JSON.stringify(observations),{mode:0o600});
});
await new Promise(resolve=>server.listen(8090,'0.0.0.0',resolve));await writeFile('/qa/backend-ready','ready',{mode:0o600});
async function stop(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await database.end();process.exit(0);}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
`;

const probe = String.raw`
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {request as httpsRequest} from 'node:https';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8')),phase=process.argv[2];
const advance=now=>writeFileSync('/qa/clock',String(now));
const address='198.51.100.11',origin='https://mestemhrou.cz';
const request=async(path,{method='GET',body,headers={},gateway=false}={})=>{
 const raw=body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body);
 const response=await new Promise((resolve,reject)=>{
  const req=(gateway?httpsRequest:httpRequest)({hostname:gateway?'vcode-contact-relay':'contact-app',port:gateway?8443:8080,path,method,
   ...(gateway?{ca:readFileSync('/qa/ca.pem'),servername:'vcode-contact-relay'}:{}),
   headers:{host:gateway?'vcode-contact-relay':'mestemhrou.cz',origin,'sec-fetch-site':'same-origin','x-real-ip':address,
    ...(raw===undefined?{}:{'content-type':'application/json','content-length':Buffer.byteLength(raw)}),...(gateway?{authorization:'Bearer '+fixture.key}:{}),...headers}},incoming=>{
    const chunks=[];incoming.on('data',chunk=>chunks.push(chunk));incoming.on('error',reject);incoming.on('end',()=>resolve({status:incoming.statusCode,headers:incoming.headers,raw:Buffer.concat(chunks).toString('utf8')}));
   });req.on('error',reject);req.setTimeout(10000,()=>req.destroy(new Error('Synthetic request timeout')));req.end(raw);
 });
 assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.headers['x-content-type-options'],'nosniff');assert.equal(response.headers['access-control-allow-origin'],undefined);assert.equal(response.headers['set-cookie'],undefined);
 assert.ok(!response.raw.includes(fixture.key)&&!response.raw.includes(fixture.inbox));
 let parsed;try{parsed=JSON.parse(response.raw);}catch{throw new Error('Expected bounded JSON, status '+response.status);}
 return {status:response.status,body:parsed,headers:response.headers};
};
const denied=async(status,path,options)=>{const result=await request(path,options);assert.equal(result.status,status);assert.deepEqual(Object.keys(result.body).sort(),['error','ok']);assert.equal(result.body.ok,false);return result;};
const challengePath='/api/partner-contact/challenge',submitPath='/api/partner-contact';
if(phase==='first'){
 const challenge=await request(challengePath,{headers:{origin:''}});assert.equal(challenge.status,200);assert.equal(challenge.body.enabled,true);assert.equal(challenge.body.minimumDelayMs,1500);assert.equal(challenge.body.privacyVersion,'contact-20261009');
 assert.equal(Date.parse(challenge.body.expiresAt),fixture.base+600000);
 assert.ok(!challenge.body.token.includes(address));assert.ok(!Buffer.from(challenge.body.token.split('.')[0],'base64url').toString().includes(address));
 const payload={requestId:randomUUID(),token:challenge.body.token,locale:'cs',name:'  Synthetic Contact  ',email:'Synthetic@Example.Invalid',organization:'Synthetic Organisation',message:'Synthetic isolated partnership message.\r\nNo real contact or visitor data.',website:'',privacyVersion:'contact-20261009'};
 await denied(403,submitPath,{method:'POST',body:payload});advance(fixture.base+1800);
 await denied(403,submitPath,{method:'POST',body:payload,headers:{'x-real-ip':'198.51.100.12'}});
 await denied(403,submitPath,{method:'POST',body:payload,headers:{origin:'https://evil.example.invalid'}});
 await denied(403,submitPath,{method:'POST',body:payload,headers:{'sec-fetch-site':'cross-site'}});
 await denied(400,submitPath,{method:'POST',body:{...payload,application:'myslopis'}});
 await denied(400,submitPath,{method:'POST',body:{...payload,area:'other'}});
 await denied(403,'/internal/contact-relays/v1/submissions',{method:'POST',body:payload,gateway:true,headers:{authorization:'Bearer '+fixture.secondKey,origin:'https://second.example.invalid'}});
 const first=await request(submitPath,{method:'POST',body:payload,headers:{authorization:'Bearer client-spoof-never-forwarded',cookie:'synthetic=never-forwarded','x-vcode-admin-id':randomUUID(),referer:origin+'/private-game?email=never-forwarded','x-forwarded-for':'203.0.113.13',forwarded:'for=203.0.113.13','user-agent':'Synthetic Browser'}});
 assert.equal(first.status,202);assert.deepEqual(Object.keys(first.body).sort(),['ok','reference']);assert.equal(first.body.ok,true);assert.match(first.body.reference,/^[a-f0-9-]{36}$/);
 const repeats=await Promise.all([request(submitPath,{method:'POST',body:payload}),request(submitPath,{method:'POST',body:payload})]);for(const repeat of repeats)assert.deepEqual(repeat.body,first.body);
 const conflict=await denied(409,submitPath,{method:'POST',body:{...payload,message:payload.message+' Changed.'}});assert.equal(conflict.body.error,'idempotency-conflict');
 advance(fixture.base+600001);assert.deepEqual((await request(submitPath,{method:'POST',body:payload})).body,first.body);
 await denied(403,submitPath,{method:'POST',body:{...payload,requestId:randomUUID()}});
 for(const [path,method,status]of[[challengePath,'POST',405],[submitPath,'GET',405],[challengePath,'OPTIONS',405],[submitPath+'/unknown','GET',404]])await denied(status,path,{method});
 await denied(400,challengePath+'?email=synthetic@example.invalid');await denied(400,challengePath+'?',{});
 await denied(403,challengePath,{headers:{host:'other.example.invalid'}});
 await denied(403,challengePath,{headers:{'x-real-ip':'unknown'}});
 await denied(413,submitPath,{method:'POST',body:'x'.repeat(16385)});
 await denied(415,submitPath,{method:'POST',body:payload,headers:{'content-type':'text/plain'}});
 await denied(415,submitPath,{method:'POST',body:payload,headers:{'content-encoding':'gzip'}});
 await denied(405,'/internal/contact-relays/v1/challenge',{method:'POST',gateway:true});
 await denied(400,'/internal/contact-relays/v1/challenge?x=1',{gateway:true});
 await denied(401,'/internal/contact-relays/v1/challenge',{gateway:true,headers:{authorization:'Bearer '+ 'A'.repeat(43)}});
 for(const path of ['/internal/contacts','/api/contact','/internal/partnerships/v1/inquiries','/health/blog'])await denied(404,path,{gateway:true});
 await assert.rejects(fetch('http://blog:8090/internal/contacts',{signal:AbortSignal.timeout(1500)}),'App-side browser cannot reach the central backend');
 writeFileSync('/qa/state.json',JSON.stringify({payload,reference:first.body.reference}),{mode:0o600});
 writeFileSync('/qa/first-proof.json',JSON.stringify({appNginxActual:true,nativeTls:true,minimumDelay:true,addressAppOriginBinding:true,fixedAreaApplication:true,clientAuthCookieAdminReferralStripped:true,committed202:true,concurrentRetryOneReceipt:true,changedPayload409:true,expiredRetryLookupOnly:true,expiredUnknownDoesNotInsert:true,bodyLimit16KiB:true,exactRoutesMethodsQueries:true,privateInboxNotRouted:true,noBroadCors:true,backendNetworkIsolated:true}),{mode:0o600});
}else if(phase==='deleted'){
 const state=JSON.parse(readFileSync('/qa/state.json','utf8'));advance(fixture.base+3600001);
 await denied(403,submitPath,{method:'POST',body:state.payload});
 writeFileSync('/qa/deleted-proof.json',JSON.stringify({deletedExpiredReceiptCannotResurrect:true}),{mode:0o600});
}else if(phase==='revoked'){
 await denied(503,challengePath);
 writeFileSync('/qa/revocation-proof.json',JSON.stringify({credentialRevocationImmediate:true}),{mode:0o600});
}else throw new Error('Unknown phase');
`;

const control = String.raw`
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fixture,clock,pool,service,config,entries,registryPath} from './common.mjs';
const database=pool(),phase=process.argv[2],state=JSON.parse(await readFile('/qa/state.json','utf8'));
const count=async table=>Number((await database.query('SELECT count(*)::int AS n FROM vcode_contacts.'+table)).rows[0].n);
const internal=async(path,{method='GET',key=fixture.inbox,body}={})=>{
 const result=await fetch('http://localhost:8090'+path,{method,headers:{authorization:'Bearer '+key,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 assert.equal(result.headers.get('cache-control'),'no-store');return {status:result.status,body:await result.json()};
};
try{
 if(phase==='inspect'){
  const tables=(await database.query("SELECT table_name FROM information_schema.tables WHERE table_schema='vcode_contacts' ORDER BY table_name")).rows.map(row=>row.table_name);assert.deepEqual(tables,['inquiries','outbox']);
  assert.equal(await count('inquiries'),1);assert.equal(await count('outbox'),1);
  const columns=(await database.query("SELECT column_name FROM information_schema.columns WHERE table_schema='vcode_contacts' ORDER BY table_name,ordinal_position")).rows.map(row=>row.column_name);
  for(const forbidden of ['ip','ip_address','token','client_bucket','source','referrer','game','location'])assert.ok(!columns.includes(forbidden));
  const rows=(await database.query('SELECT * FROM vcode_contacts.inquiries WHERE id=$1',[state.reference])).rows;assert.equal(rows.length,1);
  const row=rows[0];assert.equal(row.name,'Synthetic Contact');assert.equal(row.email,'synthetic@example.invalid');assert.equal(row.organization,'Synthetic Organisation');assert.equal(row.area,'partnership');assert.equal(row.application,'mestem-hrou');assert.ok(!row.message.includes('\r'));
  assert.equal(row.expires_at.getTime()-row.created_at.getTime(),90*86400000);
  for(const forbidden of [fixture.key,fixture.inbox,state.payload.token,'198.51.100.11'])assert.ok(!JSON.stringify(rows).includes(forbidden));
  assert.equal((await internal('/internal/contacts',{key:fixture.key})).status,401);
  const inbox=await internal('/internal/contacts');assert.equal(inbox.status,200);assert.equal(inbox.body.items.length,1);assert.equal(inbox.body.summary.total,1);assert.equal(inbox.body.items[0].id,state.reference);
  const contacts=await service(database);await contacts.maintenance();await contacts.maintenance();
  assert.equal((await readFile('/qa/notifications.jsonl','utf8')).trim().split('\n').length,1);
  assert.equal((await database.query('SELECT status,attempts FROM vcode_contacts.outbox')).rows[0].status,'sent');
  const failedId=randomUUID();await writeFile('/qa/clock',String(fixture.base+3600001));
  const challenge=await fetch('http://localhost:8090/internal/contact-relays/v1/challenge',{headers:{authorization:'Bearer '+fixture.key,origin:'https://mestemhrou.cz','sec-fetch-site':'same-origin','x-real-ip':'198.51.100.11','x-fixture-direct-control':'isolated-controller'}});const challengeBody=await challenge.json();assert.equal(challenge.status,200);
  await writeFile('/qa/clock',String(clock()+1800));
  await database.query('ALTER TABLE vcode_contacts.outbox ADD CONSTRAINT acceptance_reject CHECK(false) NOT VALID');
  try{
   const failed=await fetch('http://localhost:8090/internal/contact-relays/v1/submissions',{method:'POST',headers:{authorization:'Bearer '+fixture.key,origin:'https://mestemhrou.cz','sec-fetch-site':'same-origin','x-real-ip':'198.51.100.11','content-type':'application/json','x-fixture-direct-control':'isolated-controller'},body:JSON.stringify({...state.payload,requestId:failedId,token:challengeBody.token})});assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{ok:false,error:'unavailable'});
   assert.equal(await count('inquiries'),1);assert.equal(await count('outbox'),1);
  }finally{await database.query('ALTER TABLE vcode_contacts.outbox DROP CONSTRAINT acceptance_reject');}
  const removed=await internal('/internal/contacts/'+state.reference,{method:'DELETE'});assert.equal(removed.status,200);assert.equal(await count('inquiries'),0);assert.equal(await count('outbox'),0);
  await writeFile('/qa/control-proof.json',JSON.stringify({existingSchemaOnly:true,noRawIpOrTokenInDatabase:true,canonicalApplicationAreaStored:true,exact90DayRetention:true,inboxApplicationKeyDenied:true,inboxOwnerKeyRequired:true,genericTelegramMockedExactlyOnce:true,atomicInsertOutboxRollback:true,deleteCascadesOutbox:true}),{mode:0o600});
 }else if(phase==='retention'){
  // Use the actual central public contact handler to insert a separate synthetic
  // record, then exercise exact expiry independently from the deleted relay row.
  const now=fixture.base+2*3600000;await writeFile('/qa/clock',String(now));
  const headers={origin:config.siteOrigin,'sec-fetch-site':'same-origin','x-real-ip':'203.0.113.99'};
  const challenge=await fetch('http://localhost:8090/api/contact/challenge',{headers});const challengeBody=await challenge.json();assert.equal(challenge.status,200);
  await writeFile('/qa/clock',String(now+1800));
  const payload={...state.payload,requestId:randomUUID(),token:challengeBody.token,application:'mestem-hrou',area:'partnership'};
  const accepted=await fetch('http://localhost:8090/api/contact',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(accepted.status,202);
  const row=(await database.query('SELECT created_at,expires_at FROM vcode_contacts.inquiries')).rows[0];assert.equal(row.expires_at.getTime(),now+1800+90*86400000);
  const contacts=await service(database);await writeFile('/qa/clock',String(row.expires_at.getTime()-1));await contacts.maintenance();assert.equal(await count('inquiries'),1);assert.equal(await count('outbox'),1);
  await writeFile('/qa/clock',String(row.expires_at.getTime()));await contacts.maintenance();assert.equal(await count('inquiries'),0);assert.equal(await count('outbox'),0);
  await writeFile('/qa/retention-proof.json',JSON.stringify({oneMillisecondBeforeExpiryRetained:true,exact90DayBoundaryPurgesInquiryAndOutbox:true,centralExistingContactPathPreserved:true}),{mode:0o600});
 }else if(phase==='revoke'){
  entries[0].keyFile='/tmp/contact-relay-private/revoked-key';await writeFile(registryPath,JSON.stringify(entries),{mode:0o600});
 }else throw new Error('Unknown control phase');
}finally{await database.end();}
`;

try {
  const identities={blog:docker('image','inspect',image,'--format','{{.Id}}').trim(),nginx:docker('image','inspect',nginxImage,'--format','{{.Id}}').trim(),postgres:docker('image','inspect',postgresImage,'--format','{{.Id}}').trim()};
  await put('fixture.json',JSON.stringify(synthetic));await put('clock',String(base));
  await put('common.mjs',common);await put('backend.mjs',backend);await put('control.mjs',control);await put('probe.mjs',probe);
  for(const file of ['state.json','first-proof.json','deleted-proof.json','revocation-proof.json'])await put(file,'');
  await put('database.env',`POSTGRES_USER=contact_test\nPOSTGRES_DB=contact_test\nPOSTGRES_PASSWORD=${synthetic.password}\n`);
  await mkdir(join(directory,'config'),{mode:0o700});
  for(const file of ['api-security-headers.conf','error-pages.conf','error-handlers.conf','app-common.conf','app-proxy.conf.example','app-http.conf.example','tls-gateway.conf']){
    const source=await readFile(join(templateRoot,file),'utf8');hashes[file]=createHash('sha256').update(source).digest('hex');await put('config/'+file,source);
  }
  const openssl=(...args)=>execFileSync('openssl',args,{cwd:directory,timeout:30000,stdio:['ignore','pipe','pipe']});
  openssl('req','-x509','-newkey','rsa:2048','-nodes','-keyout','ca.key','-out','ca.pem','-days','2','-subj','/CN=VCode isolated contact fixture CA','-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign');
  openssl('req','-new','-newkey','rsa:2048','-nodes','-keyout','server.key','-out','server.csr','-subj','/CN=vcode-contact-relay');
  await put('leaf.extensions','basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:vcode-contact-relay\n');
  openssl('x509','-req','-in','server.csr','-CA','ca.pem','-CAkey','ca.key','-CAcreateserial','-out','server.pem','-days','2','-sha256','-extfile','leaf.extensions');
  openssl('verify','-CAfile','ca.pem','-verify_hostname','vcode-contact-relay','server.pem');
  for(const file of ['ca.key','ca.pem','ca.srl','server.key','server.pem','server.csr'])await chmod(join(directory,file),0o600);
  for(const network of Object.values(networks))docker('network','create','--internal',network);
  docker('run','--detach','--rm','--pull','never','--name',names.browser,'--network',networks.edge,...constrained,...identity,...fixtureMount,identities.blog,'node','-e','setInterval(()=>{},1000)');
  const edgeAddress=JSON.parse(docker('inspect',names.browser))[0].NetworkSettings.Networks[networks.edge].IPAddress;
  assert.match(edgeAddress,/^(?:\d{1,3}\.){3}\d{1,3}$/);
  const maps=(await readFile(join(directory,'config/app-http.conf.example'),'utf8')).replace('__VERIFIED_TRUSTED_EDGE_CIDR__',edgeAddress+'/32');await put('config/app-http.conf',maps);
  await put('config/app-proxy.conf',await readFile(join(directory,'config/app-proxy.conf.example'),'utf8'));
  await put('config/app-nginx.conf',`pid /tmp/nginx.pid;\nworker_processes 1;\nerror_log /dev/null crit;\nevents {worker_connections 128;}\nhttp {\n access_log /tmp/game-access.log;\n client_body_temp_path /tmp/body; proxy_temp_path /tmp/proxy; fastcgi_temp_path /tmp/fastcgi; uwsgi_temp_path /tmp/uwsgi; scgi_temp_path /tmp/scgi;\n include /etc/nginx/contact-relays/app-http.conf;\n server {listen 8080;server_name mestemhrou.cz;\n include /etc/nginx/contact-relays/app-proxy.conf;\n location = /api/game-fixture {return 418 'unchanged-game-api';}\n location / {return 200 'unchanged-static-app';}\n }\n}\n`);
  await put('authorization.conf',`proxy_set_header Authorization "Bearer ${synthetic.key}";\n`);
  for(const volume of Object.values(volumes))docker('volume','create',volume);
  const copyVolume=(volume,command)=>docker('run','--rm','--pull','never','--network','none','--user','0:0','--memory','64m','--cpus','0.25','--entrypoint','sh','--volume',directory+':/qa:ro','--volume',volume+':/target',identities.nginx,'-ec',command+'; chown -R 101:101 /target; chmod 0700 /target; chmod 0600 /target/*');
  copyVolume(volumes['gateway-config'],'cp /qa/config/*.conf /target/');copyVolume(volumes['app-config'],'cp /qa/config/*.conf /target/');
  copyVolume(volumes['gateway-tls'],'cp /qa/server.pem /qa/server.key /qa/ca.pem /target/');copyVolume(volumes['app-secret'],'cp /qa/authorization.conf /qa/ca.pem /target/');
  docker('run','--detach','--rm','--pull','never','--name',names.database,'--network',networks.central,'--network-alias','contact-postgres','--memory','512m','--cpus','0.5','--tmpfs','/var/lib/postgresql/data:rw,size=128m','--env-file',join(directory,'database.env'),identities.postgres);
  let ready=false;for(let attempt=0;attempt<60;attempt++){try{docker('exec',names.database,'pg_isready','-h','127.0.0.1','-U','contact_test','-d','contact_test');ready=true;break;}catch{await delay(200);}}assert.equal(ready,true);
  docker('run','--detach','--rm','--pull','never','--name',names.backend,'--network',networks.central,'--network-alias','blog',...constrained,...identity,...fixtureMount,'--tmpfs','/tmp:rw,size=32m,mode=1777',identities.blog,'node','/qa/backend.mjs');
  ready=false;for(let attempt=0;attempt<60;attempt++){try{assert.equal(await readFile(join(directory,'backend-ready'),'utf8'),'ready');ready=true;break;}catch{await delay(200);}}assert.equal(ready,true,'Actual central contacts HTTP and only existing schema ready');
  const nginxBase=['--pull','never','--user','101:101','--read-only','--memory','64m','--cpus','0.25','--pids-limit','32','--security-opt','no-new-privileges:true','--cap-drop','ALL','--tmpfs','/tmp:rw,uid=101,gid=101,size=16m,mode=0700','--entrypoint','nginx'];
  docker('create','--name',names.gateway,'--network',networks.relay,'--network-alias','vcode-contact-relay',...nginxBase,'--volume',volumes['gateway-config']+':/etc/nginx/contact-relays:ro','--volume',volumes['gateway-tls']+':/run/contact-relay-tls:ro',identities.nginx,'-c','/etc/nginx/contact-relays/tls-gateway.conf','-g','daemon off;');
  docker('network','connect',networks.central,names.gateway);docker('start',names.gateway);docker('exec',names.gateway,'nginx','-t','-c','/etc/nginx/contact-relays/tls-gateway.conf');
  docker('create','--name',names.app,'--network',networks.edge,'--network-alias','contact-app',...nginxBase,'--volume',volumes['app-config']+':/etc/nginx/contact-relays:ro','--volume',volumes['app-secret']+':/run/contact-relay:ro',identities.nginx,'-c','/etc/nginx/contact-relays/app-nginx.conf','-g','daemon off;');
  docker('network','connect',networks.relay,names.app);docker('start',names.app);docker('exec',names.app,'nginx','-t','-c','/etc/nginx/contact-relays/app-nginx.conf');
  assert.deepEqual(JSON.parse(docker('exec',names.gateway,'curl','--fail','--silent','--max-time','5','--cacert','/run/contact-relay-tls/ca.pem','--resolve','vcode-contact-relay:8443:127.0.0.1','--header','Host: vcode-contact-relay','https://vcode-contact-relay:8443/health').trim()),{ok:true});
  // The probe needs relay-network connectivity only for explicit authenticated
  // gateway rejection tests. The application never reaches the central network.
  docker('network','connect',networks.relay,names.browser);
  docker('exec',names.browser,'node','--input-type=module','-e',`import assert from 'node:assert/strict';await assert.rejects(fetch('https://vcode-contact-relay:8443/health'),error=>['UNABLE_TO_VERIFY_LEAF_SIGNATURE','UNABLE_TO_GET_ISSUER_CERT_LOCALLY','SELF_SIGNED_CERT_IN_CHAIN'].includes(error.cause?.code));`);
  const runPhase=phase=>docker('exec',names.browser,'node','/qa/probe.mjs',phase);
  runPhase('first');docker('exec',names.backend,'node','/qa/control.mjs','inspect');runPhase('deleted');
  docker('exec',names.backend,'node','/qa/control.mjs','retention');docker('exec',names.backend,'node','/qa/control.mjs','revoke');
  // A non-allowlisted TCP peer cannot spoof the trusted edge's client-IP header.
  docker('run','--rm','--pull','never','--name',names.outsider,'--network',networks.edge,...constrained,...identity,identities.blog,'node','--input-type=module','-e',`import assert from 'node:assert/strict';const result=await fetch('http://contact-app:8080/api/partner-contact/challenge',{headers:{host:'mestemhrou.cz',origin:'https://mestemhrou.cz','sec-fetch-site':'same-origin','x-real-ip':'198.51.100.11'}});assert.equal(result.status,403);assert.deepEqual(await result.json(),{ok:false,error:'origin-not-allowed'});const game=await fetch('http://contact-app:8080/api/game-fixture');assert.equal(game.status,418);assert.equal(await game.text(),'unchanged-game-api');const home=await fetch('http://contact-app:8080/');assert.equal(home.status,200);assert.equal(await home.text(),'unchanged-static-app');`);
  // Missing private key fails closed without an accepted browser response.
  runPhase('revoked');
  const accessLog=docker('exec',names.app,'cat','/tmp/game-access.log');
  assert.ok(accessLog.includes('/api/game-fixture'),'Unrelated game logging remains enabled');
  assert.ok(!accessLog.includes('api/partner-contact')&&!accessLog.includes('synthetic@example.invalid'),'Contact errors and internal redirects do not expose raw queries to the application log');
  const outcomes={};for(const file of ['first-proof.json','control-proof.json','deleted-proof.json','retention-proof.json','revocation-proof.json'])Object.assign(outcomes,JSON.parse(await readFile(join(directory,file),'utf8')));
  const observed=JSON.parse(await readFile(join(directory,'observations.json'),'utf8'));assert.equal(observed.canonicalAppContextSeen,true);assert.equal(observed.rawBrowserHeadersForwarded,false);
  for(const [file,hash]of Object.entries(hashes))assert.equal(createHash('sha256').update(await readFile(join(templateRoot,file))).digest('hex'),hash,'Template source unchanged during acceptance');
  evidence={result:'PASS',scope:'Actual app Nginx, verified native TLS private gateway, actual createContactService and existing 002_contacts.sql in disposable PostgreSQL',images:identities,templateSha256:hashes,syntheticDataOnly:true,noHostPorts:true,noProductionConnections:true,realTelegramCalls:0,systemTrustChanged:false,outcomes:{...outcomes,untrustedTlsCertificateRejected:true,trustedTcpEdgeRequired:true,unrelatedStaticAndGameRoutesPreserved:true,rejectedQueryExcludedFromAppLogs:true,browserReferralAdminCookieHeadersSuppressed:true,nginxUid101ReadOnly:true,exactGatewayHealthPassed:true}};
  completed=true;
}catch(error){
  // Only bounded own-fixture logs. Never load a live environment or registry.
  for(const name of [names.backend,names.gateway,names.app]){try{process.stderr.write(docker('logs','--tail','25',name));}catch{}}
  throw error;
}finally{
  for(const name of Object.values(names))clean('rm','--force',name);
  for(const network of Object.values(networks))clean('network','rm',network);
  for(const volume of Object.values(volumes))clean('volume','rm',volume);
  await rm(directory,{recursive:true,force:true});
  assert.equal(docker('ps','-a','--filter','name='+prefix,'--format','{{.Names}}').trim(),'');
  assert.equal(docker('network','ls','--filter','name='+prefix,'--format','{{.Name}}').trim(),'');
  assert.equal(docker('volume','ls','--filter','name='+prefix,'--format','{{.Name}}').trim(),'');
  if(!completed)process.stderr.write('Isolated contact fixture failed; its own resources and synthetic credentials were removed.\n');
}
evidence.disposableResourcesRemoved=true;
if(output)await writeFile(output,JSON.stringify(evidence,null,2)+'\n',{mode:0o600});
process.stdout.write(JSON.stringify(evidence)+'\n');
