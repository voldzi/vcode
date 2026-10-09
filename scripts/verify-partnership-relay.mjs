// Isolated acceptance of the actual Moje porce relay libraries over TLS/HTTP.
// No host ports, production services, live keys, visitor records or Telegram.
// node scripts/verify-partnership-relay.mjs --client-root <Moje-porce-checkout>
//   --image <tested-VCode-blog-image> [--output /absolute/evidence.json]
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash, randomBytes} from 'node:crypto';
import {chmod, mkdtemp, readFile, realpath, rm, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, isAbsolute, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const option = name => {const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1];};
const clientInput = option('--client-root'), image = option('--image');
const postgresImage = option('--postgres-image') ?? 'postgres:17-alpine';
const nginxImage = option('--nginx-image') ?? 'nginx@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46';
const output = option('--output');
if (!clientInput || !isAbsolute(clientInput) || !image || image.startsWith('-') || postgresImage.startsWith('-') || nginxImage.startsWith('-') || output && !isAbsolute(output)) {
  throw new Error('Provide an absolute --client-root, an existing --image and optional absolute --output.');
}
const clientRoot = await realpath(clientInput);
const requireClient = createRequire(join(clientRoot, 'package.json'));
const esbuildPath = createRequire(requireClient.resolve('tsx')).resolve('esbuild');
const {build} = await import(pathToFileURL(esbuildPath).href);
const directory = await mkdtemp(join(tmpdir(), 'vcode-partnership-relay-'));
await chmod(directory, 0o700);
const prefix = `vcode-partnership-relay-${process.pid}-${Date.now()}`;
const names = {database: prefix+'-database', backend: prefix+'-backend', gateway: prefix+'-gateway', client: prefix+'-client'};
const central = prefix+'-central', clients = prefix+'-clients';
const tlsVolume = prefix+'-tls';
const gatewayConfigPath = join(dirname(fileURLToPath(import.meta.url)),'../deploy/partnerships/tls-gateway.conf');
const uid = String(process.getuid?.() ?? 1000), gid = String(process.getgid?.() ?? 1000);
const clockBase = Date.parse('2026-10-09T14:59:58Z');
const synthetic = {
  clientKey: randomBytes(32).toString('base64url'),
  challengeSecret: randomBytes(32).toString('base64url'),
  inboxKey: randomBytes(32).toString('base64url'),
  databasePassword: randomBytes(24).toString('hex'),
  owner: '11111111-2222-4333-8444-555555555555',
  base: clockBase,
  privacyDigest: 'e51f75f34afd247d2ec6ed64282d7b9655865bf330736e308d4e9539c45bca1a'
};
const docker = (...args) => execFileSync('docker', args, {encoding:'utf8', timeout:120000, maxBuffer:4*1024*1024, stdio:['ignore','pipe','pipe']});
const clean = (...args) => {try {docker(...args);} catch { /* Own disposable resources only. */ }};
const put = (name, value) => writeFile(join(directory,name), value, {mode:0o600});
const delay = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
const volumes = ['--volume',directory+':/qa:rw'];
const constrained = ['--memory','384m','--cpus','0.5','--pids-limit','96','--security-opt','no-new-privileges:true','--cap-drop','ALL'];
const identity = ['--user',uid+':'+gid];
const scriptHashes = {};
let completed = false;
let evidence;

const common = String.raw`
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appendFile,chmod,mkdir,writeFile} from 'node:fs/promises';
import pg from '/app/node_modules/pg/lib/index.js';
import {migrate} from '/app/services/blog/db.mjs';
import {createPartnershipService} from '/app/services/blog/partnerships.mjs';
import {createPartnershipStore} from '/app/services/blog/partnership-store.mjs';
export const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8'));
export const clock=()=>Number(readFileSync('/qa/clock','utf8'));
export const owner=fixture.owner;
export async function setup(){
 const pool=new pg.Pool({connectionString:'postgresql://partnership_test:'+fixture.databasePassword+'@partnership-postgres:5432/partnership_test',max:4,connectionTimeoutMillis:5000});
 await migrate(pool);
 const privateDir='/tmp/partnership-private';await mkdir(privateDir,{recursive:true,mode:0o700});await chmod(privateDir,0o700);
 const keyFile=privateDir+'/client-key',registryFile=privateDir+'/registry.json';
 await writeFile(keyFile,fixture.clientKey,{mode:0o600});
 await writeFile(registryFile,JSON.stringify({version:'partnership-intake-v1',applications:[{appId:'kaloricke-tabulky',domain:'mojeporce.cz',enabled:true,keyFile,types:['vyrobce','obchod','autor-receptu','jine'],privacyVersion:'partnership-intake-20261009-1',approvedAt:new Date(fixture.base).toISOString(),publishedAt:new Date(fixture.base).toISOString(),noticeUrl:'https://mojeporce.cz/ochrana-soukromi#nabidky-spoluprace',partnerPolicy:{enabled:false,version:'',retentionDays:0,approvedAt:null,publishedAt:null,noticeUrl:''}}]}),{mode:0o600});
 const config={siteOrigin:'https://vcode.example.invalid',partnershipIntakeEnabled:true,partnershipRegistryFile:registryFile,partnershipChallengeSecret:fixture.challengeSecret,contactInboxToken:fixture.inboxKey,contactInboxOwnerId:owner,contactFormSecret:'synthetic-existing-contact-secret-only',telegramEnabled:true,telegramBotToken:'fixture-bot-never-live',telegramChatId:'fixture-chat-never-live',telegramApiBaseUrl:'https://telegram.example.invalid'};
 const service=await createPartnershipService({pool,config,clock,fetchImpl:async(url,options)=>{
  assert.equal(url,'https://telegram.example.invalid/botfixture-bot-never-live/sendMessage');
  const payload=JSON.parse(options.body);
  for(const forbidden of ['synthetic@example.invalid','Synthetic Partner','Synthetic Organisation','Synthetic partnership offer'])assert.ok(!JSON.stringify(payload).includes(forbidden));
  assert.match(payload.text,/Moje porce/);assert.match(payload.text,/https:\/\/vcode\.example\.invalid\/prehled\/#partnerships/);
  await appendFile('/qa/notifications.jsonl',JSON.stringify(payload)+'\n',{mode:0o600});
  return new Response(JSON.stringify({ok:true,result:{message_id:1}}),{headers:{'content-type':'application/json'}});
 }});
 assert.equal(service.ready,true,'Actual private file registry is ready');
 return {pool,service,store:createPartnershipStore({pool,clock,hashSecret:fixture.challengeSecret})};
}
`;

const backend = String.raw`
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {writeFile} from 'node:fs/promises';
import {setup} from './common.mjs';
const {pool,service}=await setup();
const observations={requests:0,nativeFetchModeSeen:false,successfulBrowserContextSeen:false,browserContextRejected:false,unknownFetchMetadataRejected:false,forwardingProbeSeen:false,forwardingReferralAdminSeen:false};
const server=createServer(async(req,res)=>{
 observations.requests++;
 if(req.headers['sec-fetch-mode']==='cors')observations.nativeFetchModeSeen=true;
 const browserContext=['origin','cookie','referer','x-real-ip','sec-fetch-site','sec-fetch-dest','sec-fetch-user'].some(key=>key in req.headers);
 if(req.headers['x-fixture-forwarding-probe']==='synthetic-only'){
  observations.forwardingProbeSeen=true;
  if(['x-real-ip','x-forwarded-for','x-forwarded-host','x-forwarded-proto','x-forwarded-port','forwarded','referer','user-agent','x-vcode-admin-id'].some(key=>key in req.headers))observations.forwardingReferralAdminSeen=true;
 }
 if(!await service.handle(req,res))res.writeHead(404).end();
 if(browserContext&&res.statusCode<300)observations.successfulBrowserContextSeen=true;
 if(browserContext&&res.statusCode===403)observations.browserContextRejected=true;
 if(req.headers['sec-fetch-synthetic']==='synthetic-only'&&res.statusCode===403)observations.unknownFetchMetadataRejected=true;
 await writeFile('/qa/observations.json',JSON.stringify(observations),{mode:0o600});
});
await new Promise(resolve=>server.listen(8090,'0.0.0.0',resolve));
await writeFile('/qa/backend-ready','ready',{mode:0o600});
async function stop(){server.close();await pool.end();process.exit(0);}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
`;

const control = String.raw`
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {setup,owner} from './common.mjs';
const {pool,service,store}=await setup();
try{
 const state=JSON.parse(await readFile('/qa/state.json','utf8'));
 const result=await pool.query('SELECT name,email,organization,message FROM vcode_contacts.partnership_inquiries WHERE id=$1',[state.reference]);
 assert.equal(result.rows.length,1);assert.equal(result.rows[0].name,'Synthetic Partner');assert.equal(result.rows[0].email,'synthetic@example.invalid');assert.equal(result.rows[0].organization,'Synthetic Organisation');assert.ok(!result.rows[0].message.includes('\r'));
 const counts=(await pool.query('SELECT (SELECT count(*)::int FROM vcode_contacts.partnership_inquiries) AS inquiries,(SELECT count(*)::int FROM vcode_contacts.partnership_receipts) AS receipts,(SELECT count(*)::int FROM vcode_contacts.partnership_outbox) AS outbox')).rows[0];
 assert.deepEqual(counts,{inquiries:1,receipts:1,outbox:1});
 await service.maintenance();
 const notifications=(await readFile('/qa/notifications.jsonl','utf8')).trim().split('\n');assert.equal(notifications.length,1);
 assert.equal((await pool.query('SELECT status FROM vcode_contacts.partnership_outbox WHERE inquiry_id=$1',[state.reference])).rows[0].status,'sent');
 await service.maintenance();assert.equal((await readFile('/qa/notifications.jsonl','utf8')).trim().split('\n').length,1);
 await store.remove(state.reference,owner);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM vcode_contacts.partnership_inquiries')).rows[0].n,0);
 assert.equal((await pool.query('SELECT inquiry_id FROM vcode_contacts.partnership_receipts WHERE reference=$1',[state.reference])).rows[0].inquiry_id,null);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM vcode_contacts.partnership_outbox')).rows[0].n,0);
 await writeFile('/qa/control-proof.json',JSON.stringify({committedOneInquiryReceiptOutbox:true,genericNotificationMockedOnce:true,tombstonePreserved:true,deletedOutboxRemoved:true}),{mode:0o600});
}finally{await pool.end();}
`;

const probe = String.raw`
import assert from 'node:assert/strict';
import {createServer,request as httpRequest} from 'node:http';
import {readFileSync,writeFileSync} from 'node:fs';
import {Readable} from 'node:stream';
import {randomUUID} from 'node:crypto';
import {createPartnershipHandlers,createPartnershipLimiter,createPartnershipTransport,configuredPartnershipTransport,partnershipPrivacyDigest,partnershipPrivacyVersion} from './client-bundle.mjs';
const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8')),phase=process.argv[2];
const clock=()=>Number(readFileSync('/qa/clock','utf8'));
const advance=now=>writeFileSync('/qa/clock',String(now));
const origin='https://vcode-partnership-intake:8443';
const env={PARTNERSHIP_ENABLED:'true',PARTNERSHIP_PRIVACY_APPROVED:'true',PARTNERSHIP_PRIVACY_PUBLISHED:'true',PARTNERSHIP_TRUSTED_INGRESS:'true',PARTNERSHIP_PRIVACY_VERSION:partnershipPrivacyVersion,PARTNERSHIP_PRIVACY_DIGEST:partnershipPrivacyDigest,PARTNERSHIP_UPSTREAM_ORIGIN:origin,PARTNERSHIP_CLIENT_TOKEN:fixture.clientKey};
assert.equal(partnershipPrivacyDigest,fixture.privacyDigest);
assert.equal(configuredPartnershipTransport(env)?.policy.available,true);
assert.equal(configuredPartnershipTransport({...env,PARTNERSHIP_UPSTREAM_ORIGIN:'http://vcode-partnership-intake:8443'}),null);
assert.equal(configuredPartnershipTransport({...env,PARTNERSHIP_PRIVACY_APPROVED:'false'}),null);
const transport=createPartnershipTransport({origin,token:fixture.clientKey},{clock});
const handlers=createPartnershipHandlers({transport:()=>transport,clock,limited:createPartnershipLimiter(clock)});
const relay=createServer(async(req,res)=>{
 try{
  const request=new Request('http://mojeporce.cz'+req.url,{method:req.method,headers:req.headers,body:Readable.toWeb(req),duplex:'half'});
  const response=await (req.url==='/api/partnership/challenge'?handlers.challenge(request):handlers.submit(request));
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500).end();}
});
await new Promise(resolve=>relay.listen(0,'127.0.0.1',resolve));
const local='http://127.0.0.1:'+relay.address().port;
const post=async(path,body,extra={})=>{
 const response=await new Promise((resolve,reject)=>{
  const request=httpRequest(local+'/api/partnership/'+path,{method:'POST',headers:{host:'mojeporce.cz',origin:'https://mojeporce.cz','sec-fetch-site':'same-origin','x-real-ip':'192.0.2.11','content-type':'application/json',...extra}},incoming=>{
   const chunks=[];incoming.on('data',chunk=>chunks.push(chunk));incoming.on('error',reject);incoming.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:incoming.statusCode,headers:incoming.headers})));
  });request.on('error',reject);request.end(JSON.stringify(body));
 });
 assert.equal(response.headers.get('cache-control'),'no-store');return {status:response.status,body:await response.json()};
};
try{
 if(phase==='first'){
  // No fetch replacement: the actual source transport performs native Node TLS.
  const id=randomUUID(),challenge=await post('challenge',{requestId:id});assert.equal(challenge.status,200);assert.equal(challenge.body.enabled,true);assert.equal(challenge.body.minimumDelayMs,1500);assert.ok(!JSON.stringify(challenge.body).includes(fixture.clientKey));assert.equal('clientBucket' in challenge.body,false);
  const payload={requestId:id,token:challenge.body.token,privacyVersion:partnershipPrivacyVersion,name:'  Synthetic Partner  ',email:'Synthetic@Example.Invalid',organization:'Synthetic Organisation',type:'vyrobce',message:'Synthetic partnership offer for isolated HTTP and TLS acceptance only.\r\nNo real contact or visitor data.',website:''};
  const early=await post('inquiries',payload);assert.equal(early.status,403);assert.equal(early.body.error.code,'CHALLENGE_INVALID');
  advance(fixture.base+1800);
  const first=await post('inquiries',payload);assert.equal(first.status,202);assert.equal(first.body.accepted,true);assert.match(first.body.reference,/^[a-f0-9-]{36}$/);
  const retries=await Promise.all([post('inquiries',payload),post('inquiries',payload)]);for(const retry of retries){assert.equal(retry.status,202);assert.equal(retry.body.reference,first.body.reference);}
  const changed=await post('inquiries',{...payload,message:payload.message+' changed'});assert.equal(changed.status,409);assert.equal(changed.body.error.code,'IDEMPOTENCY_CONFLICT');
  advance(fixture.base+600001);
  const expiredRetry=await post('inquiries',payload);assert.equal(expiredRetry.status,202);assert.equal(expiredRetry.body.reference,first.body.reference);
  const newExpired=await post('inquiries',{...payload,requestId:randomUUID()});assert.equal(newExpired.status,403);
  const challengePayload={requestId:randomUUID(),locale:'cs',clientBucket:'A'.repeat(43)};
  const wrong=await fetch(origin+'/internal/partnerships/v1/challenge',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+ 'B'.repeat(64)},body:JSON.stringify(challengePayload)});assert.equal(wrong.status,401);assert.equal((await wrong.json()).code,'unauthorized');
  for(const [path,method,status] of [['/internal/partnerships/v1/inquiries','GET',404],['/internal/partnerships/v1/inquiries','POST',404],['/internal/partnerships/v1/challenge','GET',405],['/internal/partnerships/v1/challenge','OPTIONS',405],['/health/blog','GET',404]]){
   const denied=await fetch(origin+path,{method});assert.equal(denied.status,status);await denied.arrayBuffer();
  }
  const query=await fetch(origin+'/internal/partnerships/v1/challenge?unexpected=1',{method:'POST'});assert.equal(query.status,400);await query.arrayBuffer();
  const oversized=await fetch(origin+'/internal/partnerships/v1/submissions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+fixture.clientKey},body:'x'.repeat(16385)});assert.equal(oversized.status,413);await oversized.arrayBuffer();
  const browserContext=await fetch(origin+'/internal/partnerships/v1/challenge',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+fixture.clientKey,origin:'https://evil.example.invalid'},body:JSON.stringify(challengePayload)});assert.equal(browserContext.status,403);await browserContext.arrayBuffer();
  const unknownMetadata=await fetch(origin+'/internal/partnerships/v1/challenge',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+fixture.clientKey,'sec-fetch-synthetic':'synthetic-only'},body:JSON.stringify(challengePayload)});assert.equal(unknownMetadata.status,403);assert.equal((await unknownMetadata.json()).code,'rejected');
  const strippedMetadata=await fetch(origin+'/internal/partnerships/v1/challenge',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+fixture.clientKey,'x-fixture-forwarding-probe':'synthetic-only','x-real-ip':'192.0.2.11','x-forwarded-for':'192.0.2.11','x-forwarded-host':'synthetic.example.invalid','x-forwarded-proto':'https','x-forwarded-port':'8443',forwarded:'for=192.0.2.11;host=synthetic.example.invalid;proto=https',referer:'https://synthetic.example.invalid/private-path','user-agent':'Synthetic Test Agent','x-vcode-admin-id':'11111111-2222-4333-8444-555555555555'},body:JSON.stringify(challengePayload)});assert.equal(strippedMetadata.status,200);await strippedMetadata.arrayBuffer();
  const crossOrigin=await post('challenge',{requestId:randomUUID()},{origin:'https://evil.example.invalid'});assert.equal(crossOrigin.status,403);
  await assert.rejects(fetch('http://blog:8090/internal/partnerships/v1/inquiries',{signal:AbortSignal.timeout(1500)}),'Client network cannot reach backend directly');
  writeFileSync('/qa/state.json',JSON.stringify({payload,reference:first.body.reference}),{mode:0o600});
  writeFileSync('/qa/client-first-proof.json',JSON.stringify({actualRelayHttp:true,nativeTransportTls:true,strictHttpsGuardPreserved:true,minimumDelayRejected:true,committed202:true,concurrentRetriesSameReference:true,changedPayload409:true,expiredRetrySameReference:true,wrongKey401:true,gatewayNoReadOrAdminRoutes:true,backendNetworkIsolated:true}),{mode:0o600});
 }else if(phase==='deleted'){
  const state=JSON.parse(readFileSync('/qa/state.json','utf8'));advance(fixture.base+3600001);
  const deleted=await post('inquiries',state.payload);assert.equal(deleted.status,410);assert.equal(deleted.body.error.code,'REQUEST_CLOSED');
  writeFileSync('/qa/client-deleted-proof.json',JSON.stringify({deletedRetry410:true,noResurrection:true}),{mode:0o600});
 }else throw new Error('Unknown fixture phase');
}finally{await new Promise(resolve=>relay.close(resolve));}
`;

try {
  // Existing images only: this fixture never installs packages or pulls implicitly.
  const imageIdentity = docker('image','inspect',image,'--format','{{.Id}}').trim();
  const nginxIdentity = docker('image','inspect',nginxImage,'--format','{{.Id}}').trim();
  const postgresIdentity = docker('image','inspect',postgresImage,'--format','{{.Id}}').trim();
  const result = await build({absWorkingDir:clientRoot,stdin:{contents:`export {createPartnershipHandlers,createPartnershipLimiter} from './src/lib/partnership-server.ts';\nexport {createPartnershipTransport,configuredPartnershipTransport,partnershipPrivacyDigest} from './src/lib/partnership-transport.ts';\nexport {partnershipPrivacyVersion} from './src/lib/partnership-privacy.ts';`,loader:'ts',resolveDir:clientRoot,sourcefile:'isolated-partnership-relay.ts'},tsconfig:join(clientRoot,'tsconfig.json'),bundle:true,platform:'node',format:'esm',target:'node24',outfile:join(directory,'client-bundle.mjs'),metafile:true,logLevel:'silent'});
  await chmod(join(directory,'client-bundle.mjs'),0o600);
  for (const input of Object.keys(result.metafile.inputs)) {
    const path = isAbsolute(input) ? input : join(clientRoot,input);
    if (path.startsWith(clientRoot+'/src/')) scriptHashes[path.slice(clientRoot.length+1)] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  assert.ok(Object.keys(scriptHashes).includes('src/lib/partnership-server.ts'));
  assert.ok(Object.keys(scriptHashes).includes('src/lib/partnership-transport.ts'));
  await put('fixture.json',JSON.stringify(synthetic));await put('clock',String(clockBase));
  await put('client-fixture.json',JSON.stringify({clientKey:synthetic.clientKey,base:synthetic.base,privacyDigest:synthetic.privacyDigest}));
  for(const file of ['state.json','client-first-proof.json','client-deleted-proof.json'])await put(file,'');
  await put('common.mjs',common);await put('backend.mjs',backend);await put('control.mjs',control);await put('probe.mjs',probe);
  await put('database.env',`POSTGRES_USER=partnership_test\nPOSTGRES_DB=partnership_test\nPOSTGRES_PASSWORD=${synthetic.databasePassword}\n`);
  const openssl = (...args) => execFileSync('openssl',args,{cwd:directory,timeout:30000,stdio:['ignore','pipe','pipe']});
  openssl('req','-x509','-newkey','rsa:2048','-nodes','-keyout','ca.key','-out','ca.pem','-days','2','-subj','/CN=VCode isolated partnership fixture CA','-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign');
  openssl('req','-new','-newkey','rsa:2048','-nodes','-keyout','server.key','-out','server.csr','-subj','/CN=vcode-partnership-intake');
  await put('leaf.extensions','basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:vcode-partnership-intake\n');
  openssl('x509','-req','-in','server.csr','-CA','ca.pem','-CAkey','ca.key','-CAcreateserial','-out','server.pem','-days','2','-sha256','-extfile','leaf.extensions');
  openssl('verify','-CAfile','ca.pem','-verify_hostname','vcode-partnership-intake','server.pem');
  for (const file of ['ca.key','ca.pem','ca.srl','server.key','server.pem','server.csr']) await chmod(join(directory,file),0o600);
  const gatewayConfigSha256=createHash('sha256').update(await readFile(gatewayConfigPath)).digest('hex');
  docker('network','create','--internal',central);docker('network','create','--internal',clients);
  docker('run','--detach','--rm','--pull','never','--name',names.database,'--network',central,'--network-alias','partnership-postgres','--memory','512m','--cpus','0.5','--tmpfs','/var/lib/postgresql/data:rw,size=128m','--env-file',join(directory,'database.env'),postgresIdentity);
  let ready = false;
  for (let attempt=0;attempt<60;attempt++) {try {docker('exec',names.database,'pg_isready','-h','127.0.0.1','-U','partnership_test','-d','partnership_test');ready=true;break;}catch{await delay(200);}}
  assert.equal(ready,true,'Own temporary PostgreSQL ready');
  docker('run','--detach','--rm','--pull','never','--name',names.backend,'--network',central,'--network-alias','blog',...constrained,...identity,...volumes,'--tmpfs','/tmp:rw,size=32m,mode=1777',imageIdentity,'node','/qa/backend.mjs');
  ready=false;
  for(let attempt=0;attempt<60;attempt++){try{assert.equal(await readFile(join(directory,'backend-ready'),'utf8'),'ready');ready=true;break;}catch{await delay(200);}}
  assert.equal(ready,true,'Actual service HTTP handler and migration ready');
  docker('volume','create',tlsVolume);
  docker('run','--rm','--pull','never','--network','none','--user','0:0','--memory','64m','--cpus','0.25','--entrypoint','sh','--volume',directory+':/qa:ro','--volume',tlsVolume+':/run/partnership-tls',nginxIdentity,'-ec','cp /qa/server.pem /qa/server.key /qa/ca.pem /run/partnership-tls/; chown -R 101:101 /run/partnership-tls; chmod 0700 /run/partnership-tls; chmod 0600 /run/partnership-tls/*');
  docker('create','--pull','never','--name',names.gateway,'--network',clients,'--network-alias','vcode-partnership-intake','--user','101:101','--read-only','--memory','64m','--cpus','0.25','--pids-limit','32','--security-opt','no-new-privileges:true','--cap-drop','ALL','--volume',gatewayConfigPath+':/etc/nginx/nginx.conf:ro','--volume',tlsVolume+':/run/partnership-tls:ro','--tmpfs','/tmp:rw,uid=101,gid=101,size=16m,mode=0700','--entrypoint','nginx',nginxIdentity,'-g','daemon off;');
  docker('network','connect',central,names.gateway);docker('start',names.gateway);
  docker('exec',names.gateway,'nginx','-t');
  assert.equal(docker('exec',names.gateway,'curl','--fail','--silent','--max-time','5','--cacert','/run/partnership-tls/ca.pem','--resolve','vcode-partnership-intake:8443:127.0.0.1','https://vcode-partnership-intake:8443/health').trim(),'ok','Exact Compose health command succeeds');
  // An untrusted process must reject the synthetic certificate; no global TLS bypass.
  docker('run','--rm','--pull','never','--name',names.client,'--network',clients,...constrained,...identity,imageIdentity,'node','--input-type=module','-e',`import assert from 'node:assert/strict';await assert.rejects(fetch('https://vcode-partnership-intake:8443/health'),error=>['UNABLE_TO_VERIFY_LEAF_SIGNATURE','UNABLE_TO_GET_ISSUER_CERT_LOCALLY','SELF_SIGNED_CERT_IN_CHAIN'].includes(error.cause?.code));`);
  const clientVolumes=['--volume',join(directory,'client-fixture.json')+':/qa/fixture.json:ro'];
  for(const file of ['client-bundle.mjs','probe.mjs','ca.pem'])clientVolumes.push('--volume',join(directory,file)+':/qa/'+file+':ro');
  for(const file of ['clock','state.json','client-first-proof.json','client-deleted-proof.json'])clientVolumes.push('--volume',join(directory,file)+':/qa/'+file+':rw');
  const clientRun = phase => docker('run','--rm','--pull','never','--name',names.client,'--network',clients,...constrained,...identity,...clientVolumes,'--env','NODE_EXTRA_CA_CERTS=/qa/ca.pem',imageIdentity,'node','/qa/probe.mjs',phase);
  clientRun('first');
  docker('exec',names.backend,'node','/qa/control.mjs');
  clientRun('deleted');
  const first=JSON.parse(await readFile(join(directory,'client-first-proof.json'),'utf8'));
  const controlled=JSON.parse(await readFile(join(directory,'control-proof.json'),'utf8'));
  const deleted=JSON.parse(await readFile(join(directory,'client-deleted-proof.json'),'utf8'));
  const observations=JSON.parse(await readFile(join(directory,'observations.json'),'utf8'));
  assert.equal(observations.nativeFetchModeSeen,true);assert.equal(observations.successfulBrowserContextSeen,false);assert.equal(observations.browserContextRejected,true);
  assert.equal(observations.unknownFetchMetadataRejected,true);assert.equal(observations.forwardingProbeSeen,true);assert.equal(observations.forwardingReferralAdminSeen,false);
  assert.equal(createHash('sha256').update(await readFile(gatewayConfigPath)).digest('hex'),gatewayConfigSha256,'Gateway source unchanged during acceptance');
  for(const [path,expected]of Object.entries(scriptHashes))assert.equal(createHash('sha256').update(await readFile(join(clientRoot,path))).digest('hex'),expected,'Client source unchanged during acceptance');
  evidence={result:'PASS',scope:'Actual Moje porce relay libraries over HTTP, native TLS transport, exact private nginx gateway, actual VCode HTTP handler and disposable PostgreSQL',nextRouteFrameworkWiringVerified:false,syntheticDataOnly:true,noHostPorts:true,closedDockerNetworks:true,noProductionConnections:true,realTelegramCalls:0,systemTrustChanged:false,untrustedCertificateRejected:true,sourcePrivacyDigest:synthetic.privacyDigest,clientSourceHashes:scriptHashes,clientBundleSha256:createHash('sha256').update(await readFile(join(directory,'client-bundle.mjs'))).digest('hex'),vcodeBlogImage:imageIdentity,nginxImage:nginxIdentity,postgresImage:postgresIdentity,gatewayConfigSha256,outcomes:{...first,...controlled,...deleted,nativeFetchModeSeen:true,noBrowserContextForwarded:true,browserContextRejected:true,unknownFetchMetadataRejected:true,rawAddressReferralAdminHeadersSuppressed:true,gatewayUid101ReadOnly:true,exactComposeHealthPassed:true,gatewayBodyLimitVerified:true,gatewayQueriesRejected:true}};
  completed=true;
} catch (error) {
  // Only bounded own-fixture logs; no live environment or credentials are loaded.
  for (const name of [names.backend,names.gateway]) {try {process.stderr.write(docker('logs','--tail','35',name));} catch {}}
  try {docker('run','--rm','--pull','never','--network','none','--user','101:101','--read-only','--memory','64m','--cpus','0.25','--cap-drop','ALL','--volume',gatewayConfigPath+':/etc/nginx/nginx.conf:ro','--volume',tlsVolume+':/run/partnership-tls:ro','--tmpfs','/tmp:rw,uid=101,gid=101,size=16m,mode=0700','--entrypoint','nginx',nginxImage,'-t','-g','error_log /dev/stderr notice;');} catch(diagnostic) {process.stderr.write(diagnostic.stderr ?? '');}
  throw error;
} finally {
  for (const name of [names.client,names.gateway,names.backend,names.database]) clean('rm','--force',name);
  clean('network','rm',clients);clean('network','rm',central);
  clean('volume','rm',tlsVolume);
  await rm(directory,{recursive:true,force:true});
  assert.equal(docker('ps','-a','--filter','name='+prefix,'--format','{{.Names}}').trim(),'','Own fixture containers removed');
  assert.equal(docker('network','ls','--filter','name='+prefix,'--format','{{.Name}}').trim(),'','Own fixture networks removed');
  assert.equal(docker('volume','ls','--filter','name='+prefix,'--format','{{.Name}}').trim(),'','Own fixture TLS volume removed');
  if(!completed)process.stderr.write('Isolated fixture failed; its own containers, networks and synthetic credentials were removed.\n');
}
evidence.disposableResourcesRemoved=true;
if(output)await writeFile(output,JSON.stringify(evidence,null,2)+'\n',{mode:0o600});
textResult(evidence);
function textResult(evidence){process.stdout.write(JSON.stringify(evidence)+'\n');}
