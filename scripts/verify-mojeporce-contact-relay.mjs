// Disposable acceptance: frozen Moje porce DMZ template -> actual Moje porce route exports
// and Node HTTPS adapter -> private TLS gateway -> createContactService and only
// the existing 002_contacts.sql tables. This does not build the Next framework.
// No host ports, production connections, genuine records or real Telegram.
// node scripts/verify-mojeporce-contact-relay.mjs --client-root <absolute-checkout>
//   --image <tested-blog-image> [--output /absolute/evidence.json]
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash, randomBytes} from 'node:crypto';
import {chmod, mkdir, mkdtemp, readFile, realpath, rm, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {isAbsolute, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const option = name => {const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1];};
const clientInput = option('--client-root'), image = option('--image'), output = option('--output');
const postgresImage = option('--postgres-image') ?? 'postgres:17-alpine';
const nginxImage = option('--nginx-image') ?? 'nginx@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46';
if (!clientInput || !isAbsolute(clientInput) || !image || image.startsWith('-') || postgresImage.startsWith('-') || nginxImage.startsWith('-') || output && !isAbsolute(output)) throw new Error('Provide an absolute --client-root, existing --image and optional absolute --output.');
const clientRoot = await realpath(clientInput);
const requireClient = createRequire(join(clientRoot,'package.json'));
const esbuildPath = createRequire(requireClient.resolve('tsx')).resolve('esbuild');
const {build} = await import(pathToFileURL(esbuildPath).href);
const templateRoot = fileURLToPath(new URL('../deploy/contact-relays/', import.meta.url));
const directory = await mkdtemp(join(tmpdir(), 'vcode-mojeporce-relay-'));
await chmod(directory, 0o700);
const prefix = `vcode-mojeporce-relay-${process.pid}-${Date.now()}`;
const names = Object.fromEntries(['database','backend','gateway','app','dmz','browser','outsider','wrong-hostname','tls-probe'].map(name => [name, prefix+'-'+name]));
const networks = Object.fromEntries(['central','relay','app','edge','wrong-hostname'].map(name => [name, prefix+'-'+name]));
const volumes = Object.fromEntries(['gateway-config','gateway-tls','dmz-config','wrong-hostname-tls'].map(name => [name, prefix+'-'+name]));
const uid = String(process.getuid?.() ?? 1000), gid = String(process.getgid?.() ?? 1000);
const base = Date.parse('2026-10-10T06:00:00Z');
const synthetic = {base, key: randomBytes(32).toString('base64url'), secondKey: randomBytes(32).toString('base64url'), guard: randomBytes(32).toString('base64url'),
  inbox: randomBytes(32).toString('base64url'), form: randomBytes(32).toString('base64url'), password: randomBytes(24).toString('hex')};
const docker = (...args) => execFileSync('docker', args, {encoding:'utf8', timeout:120000, maxBuffer:4*1024*1024, stdio:['ignore','pipe','pipe']});
const clean = (...args) => {try {docker(...args);} catch { /* Own disposable resources only. */ }};
const put = (name, value) => writeFile(join(directory,name), value, {mode:0o600});
const delay = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
const constrained = ['--memory','384m','--cpus','0.5','--pids-limit','96','--security-opt','no-new-privileges:true','--cap-drop','ALL'];
const fixtureMount = ['--volume',directory+':/qa:rw'];
const identity = ['--user',uid+':'+gid];
const hashes = {};
const clientHashes = {};
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
 {id:'kaloricke-tabulky',origin:'https://mojeporce.cz',application:'kaloricke-tabulky',area:'partnership',enabled:false,privacyVersion:'contact-20261009',approvedAt:null,publishedAt:null,keyFile:privateDir+'/first-key'},
 {id:'mestem-hrou',origin:'https://mestemhrou.cz',application:'mestem-hrou',area:'partnership',enabled:true,privacyVersion:'contact-20261009',approvedAt:new Date(fixture.base).toISOString(),publishedAt:new Date(fixture.base).toISOString(),keyFile:privateDir+'/second-key'}
];
export async function prepare(){
 await mkdir(privateDir,{recursive:true,mode:0o700});await chmod(privateDir,0o700);
 await writeFile(entries[0].keyFile,fixture.key,{mode:0o600});await writeFile(entries[1].keyFile,fixture.secondKey,{mode:0o600});
 await writeFile(registryPath,JSON.stringify(entries),{mode:0o600});
}
export const config={siteOrigin:'https://vcode.example.invalid',contactEnabled:true,contactRelayEnabled:true,contactRelayRegistryFile:registryPath,
 contactInboxToken:fixture.inbox,contactFormSecret:fixture.form,contactPrivacyVersion:'contact-20261009',
 telegramEnabled:true,telegramBotToken:'fixture-never-live',telegramChatId:'fixture-never-live-chat',telegramApiBaseUrl:'https://telegram.example.invalid'};
export const service=pool=>createContactService({pool,config,catalog:[{id:'kaloricke-tabulky',name:'Moje porce'},{id:'mestem-hrou',name:'Městem hrou'}],clock,fetchImpl:async(url,options)=>{
 assert.equal(url,'https://telegram.example.invalid/botfixture-never-live/sendMessage');
 const payload=JSON.parse(options.body);
 for(const forbidden of ['Synthetic Contact','synthetic@example.invalid','Synthetic Organisation','Synthetic isolated partnership message',fixture.key,fixture.inbox])assert.ok(!JSON.stringify(payload).includes(forbidden));
 assert.match(payload.text,/Moje porce/);assert.match(payload.text,/Spolupráce/);assert.match(payload.text,/https:\/\/vcode\.example\.invalid\/prehled\/#inquiries/);
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
  if(req.headers.authorization==='Bearer '+fixture.key&&req.headers.origin==='https://mojeporce.cz'&&req.headers['sec-fetch-site']==='same-origin')observations.canonicalAppContextSeen=true;
 }
 if(!await contacts.handle(req,res))res.writeHead(404).end();
 await writeFile('/qa/observations.json',JSON.stringify(observations),{mode:0o600});
});
await new Promise(resolve=>server.listen(8090,'0.0.0.0',resolve));await writeFile('/qa/backend-ready','ready',{mode:0o600});
async function stop(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await database.end();process.exit(0);}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
`;

const adapter = String.raw`
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {Readable} from 'node:stream';
import * as client from './client-bundle.mjs';
const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8'));
const clock=()=>Number(readFileSync('/qa/clock','utf8'));Date.now=clock;
assert.equal(client.partnerContactAvailable(),true,'Actual protected runtime configuration is ready');
assert.equal(client.challenge.runtime,'nodejs');assert.equal(client.submission.runtime,'nodejs');
for(const method of ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'])assert.equal(typeof client.challenge[method],'function');
for(const method of ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'])assert.equal(typeof client.submission[method],'function');
const observed={requests:0,privateBrowserHeadersForwarded:false,actualEdgeAddressSeen:false,configuredGuardSeen:false};
const http=createServer(async(req,res)=>{
 observed.requests++;
 const direct=req.headers['x-fixture-direct-probe']==='synthetic-control';
 if(!direct&&req.url.startsWith('/api/partner-contact')){
  if(['cookie','authorization','referer','user-agent','x-forwarded-for','x-forwarded-host','x-forwarded-proto','forwarded','x-vcode-admin-id','x-admin-token'].some(key=>key in req.headers))observed.privateBrowserHeadersForwarded=true;
  if(req.headers['x-real-ip']===fixture.edgeAddress)observed.actualEdgeAddressSeen=true;
  if(req.headers['x-mojeporce-contact-ingress']===fixture.guard)observed.configuredGuardSeen=true;
 }
 try{
  let response;
  const request=new Request('https://mojeporce.cz'+req.url,{method:req.method,headers:req.headers,
   ...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
  if(req.url.startsWith('/api/partner-contact')){
   const route=req.url.split('?')[0].endsWith('/challenge')?client.challenge:client.submission;
   response=await route[req.method](request);
  }else response=Response.json({error:{code:'NOT_FOUND',message:'Synthetic application route unavailable.',requestId:'req_synthetic'}},{status:404,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(503,{'content-type':'application/json','cache-control':'no-store'}).end(JSON.stringify({error:{code:'CONTACT_UNAVAILABLE',message:'Synthetic request failed.',requestId:'req_synthetic'}}));}
 await writeFile('/qa/adapter-observations.json',JSON.stringify(observed),{mode:0o600});
});
await new Promise(resolve=>http.listen(8092,'0.0.0.0',resolve));await writeFile('/qa/adapter-ready','ready',{mode:0o600});
async function stop(){http.closeAllConnections();await new Promise(resolve=>http.close(resolve));process.exit(0);}process.on('SIGTERM',stop);process.on('SIGINT',stop);
`;

const adapterProbe = String.raw`
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createPartnerContactTransport,partnerContactAvailable,challenge,submission} from './client-bundle.mjs';
const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8')),phase=process.argv[2];
if(phase==='invalid-ca'){
 const transport=createPartnerContactTransport({credential:fixture.key,guard:fixture.guard,ca:readFileSync('/qa/untrusted-ca.pem','utf8')});
 await assert.rejects(transport.send('challenge',fixture.edgeAddress),error=>error.message==='CONTACT_UNAVAILABLE');
 writeFileSync('/qa/invalid-ca-proof.json',JSON.stringify({actualNodeTransportRejectsUntrustedCa:true}),{mode:0o600});
}else if(phase==='wrong-hostname'){
 const transport=createPartnerContactTransport({credential:fixture.key,guard:fixture.guard,ca:readFileSync('/qa/ca.pem','utf8')});
 await assert.rejects(transport.send('challenge',fixture.edgeAddress),error=>error.message==='CONTACT_UNAVAILABLE');
 writeFileSync('/qa/hostname-proof.json',JSON.stringify({actualNodeTransportRejectsWrongTlsHostname:true,fixedTlsServerNamePreserved:true}),{mode:0o600});
}else if(phase==='bad-runtime'){
 assert.equal(partnerContactAvailable(),false);
 const result=await challenge.GET(new Request('https://mojeporce.cz/api/partner-contact/challenge',{headers:{host:'mojeporce.cz','sec-fetch-site':'same-origin','x-real-ip':fixture.edgeAddress,'x-mojeporce-contact-ingress':fixture.guard}}));
 assert.equal(result.status,200);assert.deepEqual(await result.json(),{enabled:false,privacyVersion:'contact-20261009'});
 writeFileSync('/qa/runtime-proof.json',JSON.stringify({wrongPrivacyDigestDisablesActualRuntime:true}),{mode:0o600});
}else throw new Error('Unknown adapter probe phase');
`;

const probe = String.raw`
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {request as httpsRequest} from 'node:https';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8')),phase=process.argv[2];
const advance=now=>writeFileSync('/qa/clock',String(now));
const address='198.51.100.11',origin='https://mojeporce.cz';
const request=async(path,{method='GET',body,headers={},gateway=false}={})=>{
 const raw=body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body);
 const response=await new Promise((resolve,reject)=>{
  const req=(gateway?httpsRequest:httpRequest)({hostname:gateway?'vcode-contact-relay':'contact-app',port:gateway?8443:8080,path,method,
   ...(gateway?{ca:readFileSync('/qa/ca.pem'),servername:'vcode-contact-relay'}:{}),
   headers:{host:gateway?'vcode-contact-relay':'mojeporce.cz',origin,'sec-fetch-site':'same-origin','x-real-ip':address,
    ...(raw===undefined?{}:{'content-type':'application/json','content-length':Buffer.byteLength(raw)}),...(gateway?{authorization:'Bearer '+fixture.key}:{}),...headers}},incoming=>{
    const chunks=[];incoming.on('data',chunk=>chunks.push(chunk));incoming.on('error',reject);incoming.on('end',()=>resolve({status:incoming.statusCode,headers:incoming.headers,raw:Buffer.concat(chunks).toString('utf8')}));
   });req.on('error',reject);req.setTimeout(10000,()=>req.destroy(new Error('Synthetic request timeout')));req.end(raw);
 });
 assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.headers['x-content-type-options'],'nosniff');assert.equal(response.headers['access-control-allow-origin'],undefined);assert.equal(response.headers['set-cookie'],undefined);
 for(const secret of [fixture.key,fixture.inbox,fixture.guard,'vcode-contact-relay','/internal/contact-relays'])assert.ok(!response.raw.includes(secret));
 let parsed;try{parsed=JSON.parse(response.raw);}catch{throw new Error('Expected bounded JSON, status '+response.status);}
 return {status:response.status,body:parsed,headers:response.headers};
};
const denied=async(status,path,options)=>{const result=await request(path,options);assert.equal(result.status,status);
 if(options?.gateway){assert.deepEqual(Object.keys(result.body).sort(),['error','ok']);assert.equal(result.body.ok,false);}
 else{assert.deepEqual(Object.keys(result.body),['error']);assert.deepEqual(Object.keys(result.body.error).sort(),['code','message','requestId']);assert.equal(typeof result.body.error.code,'string');assert.equal(typeof result.body.error.message,'string');assert.match(result.body.error.requestId,/^req_/);}
 return result;};
const challengePath='/api/partner-contact/challenge',submitPath='/api/partner-contact';
if(phase==='guards'){
 const invalid={requestId:randomUUID(),token:'synthetic-unaccepted-token',locale:'cs',name:'Synthetic Contact',email:'synthetic@example.invalid',message:'Synthetic isolated message for validation only.',website:'',privacyVersion:'contact-20261009'};
 await denied(403,submitPath,{method:'POST',body:invalid,headers:{origin:'https://evil.example.invalid'}});
 await denied(403,submitPath,{method:'POST',body:invalid,headers:{'sec-fetch-site':'cross-site'}});
 await denied(403,challengePath,{headers:{host:'other.example.invalid'}});
 await denied(400,submitPath,{method:'POST',body:{...invalid,application:'mestem-hrou'}});
 await denied(400,submitPath,{method:'POST',body:{...invalid,area:'other'}});
 await denied(400,submitPath,{method:'POST',body:{...invalid,healthData:'never-forwarded'}});
 await denied(400,challengePath+'?email=synthetic@example.invalid');await denied(400,challengePath+'?');
 await denied(400,'/api/partner-contact/%63hallenge');
 await denied(413,submitPath,{method:'POST',body:'x'.repeat(16385)});
 await denied(415,submitPath,{method:'POST',body:invalid,headers:{'content-type':'text/plain'}});
 await denied(415,submitPath,{method:'POST',body:invalid,headers:{'content-encoding':'gzip'}});
 await denied(405,submitPath);await denied(405,challengePath,{method:'POST'});await denied(405,challengePath,{method:'OPTIONS'});
 await denied(403,'/api/unrelated-proxy-fixture',{headers:{'x-mojeporce-contact-ingress':fixture.guard,'x-fixture-direct-probe':'synthetic-control'}});
 writeFileSync('/qa/guards-proof.json',JSON.stringify({actualNodeStrictSchema:true,upstreamHeadersHaveSingleSecurityPolicy:true,foreignOriginAndFetchMetadataDenied:true,exactRawIngressRoutesBeforeFramework:true,nodeErrorResponseContractPreserved:true,requestLimit16KiB:true,compressedBodyDenied:true,noHealthOrAccountFieldsForwarded:true,otherProxyLocationClearsClientSuppliedGuard:true}),{mode:0o600});
}else if(phase==='disabled'){
 const result=await request(challengePath,{headers:{origin:''}});
 if(result.status===403&&result.body?.error?.code==='CONTACT_REJECTED'){
  writeFileSync('/qa/source-blocker.json',JSON.stringify({pipelineBlockedBeforeInsertion:true,actualNodeTransportRejectedByFrozenHostGate:true,requiredExplicitHost:'vcode-contact-relay',gatewayHostRulePreserved:true}),{mode:0o600});
  throw new Error('Actual source transport rejected by the frozen private Host gate; add the explicit Host header in the source app before acceptance.');
 }
 assert.equal(result.status,200);assert.deepEqual(result.body,{enabled:false,privacyVersion:'contact-20261009'});
 writeFileSync('/qa/disabled-proof.json',JSON.stringify({initialCentralApplicationDisabled:true}),{mode:0o600});
}else if(phase==='first'){
 const challenge=await request(challengePath,{headers:{origin:''}});assert.equal(challenge.status,200);assert.equal(challenge.body.enabled,true);assert.equal(challenge.body.minimumDelayMs,1500);assert.equal(challenge.body.privacyVersion,'contact-20261009');
 assert.equal(Date.parse(challenge.body.expiresAt),fixture.base+600000);
 assert.ok(!challenge.body.token.includes(fixture.edgeAddress));assert.ok(!Buffer.from(challenge.body.token.split('.')[0],'base64url').toString().includes(fixture.edgeAddress));
 const payload={requestId:randomUUID(),token:challenge.body.token,locale:'cs',name:'  Synthetic Contact  ',email:'Synthetic@Example.Invalid',organization:'Synthetic Organisation',message:'Synthetic isolated partnership message.\r\nNo real contact or visitor data.',website:'',privacyVersion:'contact-20261009'};
 await denied(403,submitPath,{method:'POST',body:payload});advance(fixture.base+1800);
 await denied(403,submitPath,{method:'POST',body:payload,headers:{origin:'https://evil.example.invalid'}});
 await denied(403,submitPath,{method:'POST',body:payload,headers:{'sec-fetch-site':'cross-site'}});
 await denied(400,submitPath,{method:'POST',body:{...payload,application:'mestem-hrou'}});
 await denied(400,submitPath,{method:'POST',body:{...payload,area:'other'}});
 const first=await request(submitPath,{method:'POST',body:payload,headers:{authorization:'Bearer client-spoof-never-forwarded',cookie:'synthetic=never-forwarded','x-mojeporce-contact-ingress':'client-spoof-never-forwarded','x-real-ip':'203.0.113.77','x-synthetic-forwarded-ip':'203.0.113.78','x-vcode-admin-id':randomUUID(),referer:origin+'/private-account?email=never-forwarded','x-forwarded-for':'203.0.113.13',forwarded:'for=203.0.113.13','user-agent':'Synthetic Browser'}});
 assert.equal(first.status,202);assert.deepEqual(Object.keys(first.body).sort(),['ok','reference']);assert.equal(first.body.ok,true);assert.match(first.body.reference,/^[a-f0-9-]{36}$/);
 const repeats=await Promise.all([request(submitPath,{method:'POST',body:payload}),request(submitPath,{method:'POST',body:payload})]);for(const repeat of repeats)assert.deepEqual(repeat.body,first.body);
 const conflict=await denied(409,submitPath,{method:'POST',body:{...payload,message:payload.message+' Changed.'}});assert.equal(conflict.body.error.code,'IDEMPOTENCY_CONFLICT');
 advance(fixture.base+600001);assert.deepEqual((await request(submitPath,{method:'POST',body:payload})).body,first.body);
 await denied(403,submitPath,{method:'POST',body:{...payload,requestId:randomUUID()}});
 for(const [path,method,status]of[[challengePath,'POST',405],[submitPath,'GET',405],[challengePath,'OPTIONS',405],[submitPath+'/unknown','GET',404]])await denied(status,path,{method});
 await denied(400,challengePath+'?email=synthetic@example.invalid');await denied(400,challengePath+'?',{});
 await denied(403,challengePath,{headers:{host:'other.example.invalid'}});
 const ignoredIp=await request(challengePath,{headers:{'x-real-ip':'unknown'}});assert.equal(ignoredIp.status,200);
 await denied(413,submitPath,{method:'POST',body:'x'.repeat(16385)});
 await denied(415,submitPath,{method:'POST',body:payload,headers:{'content-type':'text/plain'}});
 await denied(415,submitPath,{method:'POST',body:payload,headers:{'content-encoding':'gzip'}});
 await assert.rejects(fetch('http://blog:8090/internal/contacts',{signal:AbortSignal.timeout(1500)}),'App-side browser cannot reach the central backend');
 writeFileSync('/qa/state.json',JSON.stringify({payload,reference:first.body.reference}),{mode:0o600});
 writeFileSync('/qa/first-proof.json',JSON.stringify({actualMojePorceRouteExports:true,frozenActualIngressTemplateWithSyntheticRuntime:true,nativeNodeTransportTls:true,minimumDelay:true,canonicalOriginValidation:true,fixedAreaApplication:true,clientAuthCookieAdminReferralStripped:true,clientIpAndGuardOverwritten:true,originalTcpPeerSurvivesGlobalRealIpRewrite:true,committed202:true,concurrentRetryOneReceipt:true,changedPayload409:true,expiredRetryLookupOnly:true,expiredUnknownDoesNotInsert:true,bodyLimit16KiB:true,exactRoutesMethodsQueries:true,noBroadCors:true,backendNetworkIsolated:true}),{mode:0o600});
}else if(phase==='deleted'){
 const state=JSON.parse(readFileSync('/qa/state.json','utf8'));advance(fixture.base+3600001);
 await denied(403,submitPath,{method:'POST',body:state.payload});
 writeFileSync('/qa/deleted-proof.json',JSON.stringify({deletedExpiredReceiptCannotResurrect:true}),{mode:0o600});
}else if(phase==='revoked'){
 const challenge=await request(challengePath);assert.equal(challenge.status,200);assert.deepEqual(challenge.body,{enabled:false,privacyVersion:'contact-20261009'});
 const state=JSON.parse(readFileSync('/qa/state.json','utf8'));await denied(503,submitPath,{method:'POST',body:state.payload});
 writeFileSync('/qa/revocation-proof.json',JSON.stringify({independentApplicationDisableImmediate:true,disabledApplicationCannotSubmit:true}),{mode:0o600});
}else throw new Error('Unknown phase');
`;

const control = String.raw`
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fixture,clock,pool,service,config,entries,registryPath} from './common.mjs';
const database=pool(),phase=process.argv[2],state=['inspect','retention'].includes(phase)?JSON.parse(await readFile('/qa/state.json','utf8')):null;
const count=async table=>Number((await database.query('SELECT count(*)::int AS n FROM vcode_contacts.'+table)).rows[0].n);
const internal=async(path,{method='GET',key=fixture.inbox,body}={})=>{
 const result=await fetch('http://localhost:8090'+path,{method,headers:{authorization:'Bearer '+key,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 assert.equal(result.headers.get('cache-control'),'no-store');return {status:result.status,body:await result.json()};
};
try{
 if(phase==='registry'){
  const challenge=async(index)=>{
   const entry=entries[index],key=index===0?fixture.key:fixture.secondKey;
   const response=await fetch('http://localhost:8090/internal/contact-relays/v1/challenge',{headers:{authorization:'Bearer '+key,origin:entry.origin,'sec-fetch-site':'same-origin','x-real-ip':'198.51.100.55','x-fixture-direct-control':'isolated-controller'}});
   assert.equal(response.status,200);return response.json();
  };
  assert.notEqual(fixture.key,fixture.secondKey);assert.notEqual(fixture.key,fixture.guard);assert.notEqual(fixture.key,fixture.inbox);
  assert.equal((await challenge(1)).enabled,true);assert.deepEqual(await challenge(0),{enabled:false,privacyVersion:'contact-20261009'});
  const anonymous=await fetch('http://localhost:8090/internal/contacts');assert.equal(anonymous.status,401);
  assert.equal((await internal('/internal/contacts',{key:fixture.key})).status,401);
  assert.equal(await count('inquiries'),0);assert.equal(await count('outbox'),0);
  await writeFile('/qa/registry-proof.json',JSON.stringify({twoApplicationRegistryValid:true,independentNewCredential:true,existingMestemHrouActive:true,mojePorceInitiallyDisabled:true,anonymousInboxDenied:true,applicationCredentialCannotReadInbox:true,noRowsOrOutboxCreatedByConfigurationChecks:true}),{mode:0o600});
 }else if(phase==='enable'){
  entries[0].enabled=true;entries[0].approvedAt=new Date(fixture.base).toISOString();entries[0].publishedAt=new Date(fixture.base).toISOString();await writeFile(registryPath,JSON.stringify(entries),{mode:0o600});
  const active=await fetch('http://localhost:8090/internal/contact-relays/v1/challenge',{headers:{authorization:'Bearer '+fixture.secondKey,origin:entries[1].origin,'sec-fetch-site':'same-origin','x-real-ip':'198.51.100.55','x-fixture-direct-control':'isolated-controller'}});assert.equal(active.status,200);assert.equal((await active.json()).enabled,true);
  await writeFile('/qa/activation-proof.json',JSON.stringify({syntheticActivationOnlyMojePorce:true,existingApplicationCredentialPreserved:true}),{mode:0o600});
 }else if(phase==='inspect'){
  const tables=(await database.query("SELECT table_name FROM information_schema.tables WHERE table_schema='vcode_contacts' ORDER BY table_name")).rows.map(row=>row.table_name);assert.deepEqual(tables,['inquiries','outbox']);
  assert.equal(await count('inquiries'),1);assert.equal(await count('outbox'),1);
  const columns=(await database.query("SELECT column_name FROM information_schema.columns WHERE table_schema='vcode_contacts' ORDER BY table_name,ordinal_position")).rows.map(row=>row.column_name);
  for(const forbidden of ['ip','ip_address','token','client_bucket','source','referrer','game','location'])assert.ok(!columns.includes(forbidden));
  const rows=(await database.query('SELECT * FROM vcode_contacts.inquiries WHERE id=$1',[state.reference])).rows;assert.equal(rows.length,1);
  const row=rows[0];assert.equal(row.name,'Synthetic Contact');assert.equal(row.email,'synthetic@example.invalid');assert.equal(row.organization,'Synthetic Organisation');assert.equal(row.area,'partnership');assert.equal(row.application,'kaloricke-tabulky');assert.ok(!row.message.includes('\r'));
  assert.equal(row.expires_at.getTime()-row.created_at.getTime(),90*86400000);
  for(const forbidden of [fixture.key,fixture.inbox,fixture.guard,state.payload.token,fixture.edgeAddress])assert.ok(!JSON.stringify(rows).includes(forbidden));
  assert.equal((await internal('/internal/contacts',{key:fixture.key})).status,401);
  const inbox=await internal('/internal/contacts');assert.equal(inbox.status,200);assert.equal(inbox.body.items.length,1);assert.equal(inbox.body.summary.total,1);assert.equal(inbox.body.items[0].id,state.reference);
  const contacts=await service(database);await contacts.maintenance();await contacts.maintenance();
  assert.equal((await readFile('/qa/notifications.jsonl','utf8')).trim().split('\n').length,1);
  assert.equal((await database.query('SELECT status,attempts FROM vcode_contacts.outbox')).rows[0].status,'sent');
  const failedId=randomUUID();await writeFile('/qa/clock',String(fixture.base+3600001));
  const challenge=await fetch('http://localhost:8090/internal/contact-relays/v1/challenge',{headers:{authorization:'Bearer '+fixture.key,origin:'https://mojeporce.cz','sec-fetch-site':'same-origin','x-real-ip':'198.51.100.11','x-fixture-direct-control':'isolated-controller'}});const challengeBody=await challenge.json();assert.equal(challenge.status,200);
  await writeFile('/qa/clock',String(clock()+1800));
  await database.query('ALTER TABLE vcode_contacts.outbox ADD CONSTRAINT acceptance_reject CHECK(false) NOT VALID');
  try{
   const failed=await fetch('http://localhost:8090/internal/contact-relays/v1/submissions',{method:'POST',headers:{authorization:'Bearer '+fixture.key,origin:'https://mojeporce.cz','sec-fetch-site':'same-origin','x-real-ip':'198.51.100.11','content-type':'application/json','x-fixture-direct-control':'isolated-controller'},body:JSON.stringify({...state.payload,requestId:failedId,token:challengeBody.token})});assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{ok:false,error:'unavailable'});
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
  const payload={...state.payload,requestId:randomUUID(),token:challengeBody.token,application:'kaloricke-tabulky',area:'partnership'};
  const accepted=await fetch('http://localhost:8090/api/contact',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(accepted.status,202);
  const row=(await database.query('SELECT created_at,expires_at FROM vcode_contacts.inquiries')).rows[0];assert.equal(row.expires_at.getTime(),now+1800+90*86400000);
  const contacts=await service(database);await writeFile('/qa/clock',String(row.expires_at.getTime()-1));await contacts.maintenance();assert.equal(await count('inquiries'),1);assert.equal(await count('outbox'),1);
  await writeFile('/qa/clock',String(row.expires_at.getTime()));await contacts.maintenance();assert.equal(await count('inquiries'),0);assert.equal(await count('outbox'),0);
  await writeFile('/qa/retention-proof.json',JSON.stringify({oneMillisecondBeforeExpiryRetained:true,exact90DayBoundaryPurgesInquiryAndOutbox:true,centralExistingContactPathPreserved:true}),{mode:0o600});
 }else if(phase==='revoke'){
  entries[0].enabled=false;await writeFile(registryPath,JSON.stringify(entries),{mode:0o600});
  const active=await fetch('http://localhost:8090/internal/contact-relays/v1/challenge',{headers:{authorization:'Bearer '+fixture.secondKey,origin:entries[1].origin,'sec-fetch-site':'same-origin','x-real-ip':'198.51.100.55','x-fixture-direct-control':'isolated-controller'}});assert.equal(active.status,200);assert.equal((await active.json()).enabled,true);
  await writeFile('/qa/revoke-preserved-proof.json',JSON.stringify({existingMestemHrouStillActiveAfterMojePorceDisabled:true}),{mode:0o600});
 }else throw new Error('Unknown control phase');
}finally{await database.end();}
`;

let identities,runFailure;
try {
  identities={blog:docker('image','inspect',image,'--format','{{.Id}}').trim(),nginx:docker('image','inspect',nginxImage,'--format','{{.Id}}').trim(),postgres:docker('image','inspect',postgresImage,'--format','{{.Id}}').trim()};
  const bundle=await build({absWorkingDir:clientRoot,stdin:{contents:`export * as challenge from './src/app/api/partner-contact/challenge/route.ts';\nexport * as submission from './src/app/api/partner-contact/route.ts';\nexport {createPartnerContactTransport,partnerContactAvailable,partnerContactPrivacyDigest} from './src/lib/partner-contact-server.ts';`,loader:'ts',resolveDir:clientRoot,sourcefile:'isolated-contact-routes.ts'},tsconfig:join(clientRoot,'tsconfig.json'),bundle:true,platform:'node',format:'esm',target:'node24',outfile:join(directory,'client-bundle.mjs'),metafile:true,logLevel:'silent'});
  await chmod(join(directory,'client-bundle.mjs'),0o600);
  for(const input of Object.keys(bundle.metafile.inputs)){const path=isAbsolute(input)?input:join(clientRoot,input);if(path.startsWith(clientRoot+'/src/'))clientHashes[path.slice(clientRoot.length+1)]=createHash('sha256').update(await readFile(path)).digest('hex');}
  for(const file of ['src/lib/partner-contact-server.ts','src/lib/partner-contact-privacy.ts','src/app/api/partner-contact/route.ts','src/app/api/partner-contact/challenge/route.ts'])assert.ok(Object.hasOwn(clientHashes,file));
  synthetic.privacyDigest=(await import(pathToFileURL(join(directory,'client-bundle.mjs')).href)).partnerContactPrivacyDigest;
  await put('fixture.json',JSON.stringify(synthetic));await put('clock',String(base));
  await put('common.mjs',common);await put('backend.mjs',backend);await put('control.mjs',control);await put('probe.mjs',probe);await put('adapter.mjs',adapter);await put('adapter-probe.mjs',adapterProbe);
  for(const file of ['state.json','first-proof.json','deleted-proof.json','revocation-proof.json'])await put(file,'');
  await put('database.env',`POSTGRES_USER=contact_test\nPOSTGRES_DB=contact_test\nPOSTGRES_PASSWORD=${synthetic.password}\n`);
  await mkdir(join(directory,'config'),{mode:0o700});
  for(const file of ['api-security-headers.conf','error-pages.conf','error-handlers.conf','tls-gateway.conf','mojeporce-node-ingress.conf.example']){const source=await readFile(join(templateRoot,file),'utf8');hashes[file]=createHash('sha256').update(source).digest('hex');await put('config/'+file,source);}
  const openssl=(...args)=>execFileSync('openssl',args,{cwd:directory,timeout:30000,stdio:['ignore','pipe','pipe']});
  openssl('req','-x509','-newkey','rsa:2048','-nodes','-keyout','ca.key','-out','ca.pem','-days','2','-subj','/CN=VCode isolated Moje porce fixture CA','-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign');
  openssl('req','-x509','-newkey','rsa:2048','-nodes','-keyout','untrusted-ca.key','-out','untrusted-ca.pem','-days','2','-subj','/CN=Isolated untrusted fixture CA');
  for(const [prefix,hostname]of [['server','vcode-contact-relay'],['wrong','wrong.example.invalid']]){
    openssl('req','-new','-newkey','rsa:2048','-nodes','-keyout',prefix+'.key','-out',prefix+'.csr','-subj','/CN='+hostname);
    await put(prefix+'.extensions','basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:'+hostname+'\n');
    openssl('x509','-req','-in',prefix+'.csr','-CA','ca.pem','-CAkey','ca.key','-CAcreateserial','-out',prefix+'.pem','-days','2','-sha256','-extfile',prefix+'.extensions');
  }
  openssl('verify','-CAfile','ca.pem','-verify_hostname','vcode-contact-relay','server.pem');
  for(const file of ['ca.key','ca.pem','ca.srl','server.key','server.pem','server.csr','wrong.key','wrong.pem','wrong.csr','untrusted-ca.key','untrusted-ca.pem'])await chmod(join(directory,file),0o600);
  for(const network of Object.values(networks))docker('network','create','--internal',network);
  docker('run','--detach','--rm','--pull','never','--name',names.browser,'--network',networks.edge,...constrained,...identity,...fixtureMount,identities.blog,'node','-e','setInterval(()=>{},1000)');
  synthetic.edgeAddress=JSON.parse(docker('inspect',names.browser))[0].NetworkSettings.Networks[networks.edge].IPAddress;assert.match(synthetic.edgeAddress,/^(?:\d{1,3}\.){3}\d{1,3}$/);await put('fixture.json',JSON.stringify(synthetic));
  await put('credential',synthetic.key);await put('guard',synthetic.guard);
  const ingress=await readFile(join(directory,'config/mojeporce-node-ingress.conf.example'),'utf8');
  assert.equal(hashes['mojeporce-node-ingress.conf.example'],'3b0df5f3ccb3a731a494d88cbbfdcac1327bce8495ddbbfd97c7aba1c89b075e','Freeze the reviewed actual Moje ingress template before acceptance');
  await put('config/mojeporce-node-ingress.conf',ingress);
  await put('config/ingress-guard.conf',`proxy_set_header X-Mojeporce-Contact-Ingress "${synthetic.guard}";\n`);
  await put('config/dmz.conf',`pid /tmp/nginx.pid;worker_processes 1;error_log /dev/null crit;events {worker_connections 128;}http {access_log /tmp/app-access.log;client_body_temp_path /tmp/body;proxy_temp_path /tmp/proxy;fastcgi_temp_path /tmp/fastcgi;uwsgi_temp_path /tmp/uwsgi;scgi_temp_path /tmp/scgi;\nset_real_ip_from ${synthetic.edgeAddress}/32;real_ip_header X-Synthetic-Forwarded-IP;\nupstream mojeporce_node_runtime {server contact-node:8092;}\nserver {listen 8080;server_name mojeporce.cz;\ninclude /etc/nginx/mojeporce-contact-relay/mojeporce-node-ingress.conf;\nlocation = /api/unrelated-proxy-fixture {proxy_pass http://mojeporce_node_runtime/api/partner-contact/challenge;proxy_set_header Host mojeporce.cz;proxy_set_header Origin https://mojeporce.cz;proxy_set_header Sec-Fetch-Site same-origin;proxy_set_header X-Real-IP $realip_remote_addr;proxy_set_header X-Mojeporce-Contact-Ingress "";}\nlocation = /api/unrelated-fixture {return 418 'unchanged-api';}location / {return 200 'unchanged-static-app';}}}`);
  for(const volume of Object.values(volumes))docker('volume','create',volume);
  const copyVolume=(volume,command)=>docker('run','--rm','--pull','never','--network','none','--user','0:0','--memory','64m','--cpus','0.25','--entrypoint','sh','--volume',directory+':/qa:ro','--volume',volume+':/target',identities.nginx,'-ec',command+'; chown -R 101:101 /target; chmod 0700 /target; chmod 0600 /target/*');
  copyVolume(volumes['gateway-config'],'cp /qa/config/tls-gateway.conf /qa/config/api-security-headers.conf /qa/config/error-pages.conf /qa/config/error-handlers.conf /target/');copyVolume(volumes['dmz-config'],'cp /qa/config/dmz.conf /qa/config/api-security-headers.conf /qa/config/ingress-guard.conf /qa/config/mojeporce-node-ingress.conf /target/');
  copyVolume(volumes['gateway-tls'],'cp /qa/server.pem /qa/server.key /qa/ca.pem /target/');copyVolume(volumes['wrong-hostname-tls'],'cp /qa/wrong.pem /target/server.pem; cp /qa/wrong.key /target/server.key; cp /qa/ca.pem /target/');
  docker('run','--detach','--rm','--pull','never','--name',names.database,'--network',networks.central,'--network-alias','contact-postgres','--memory','512m','--cpus','0.5','--tmpfs','/var/lib/postgresql/data:rw,size=128m','--env-file',join(directory,'database.env'),identities.postgres);
  let ready=false;for(let attempt=0;attempt<60;attempt++){try{docker('exec',names.database,'pg_isready','-h','127.0.0.1','-U','contact_test','-d','contact_test');ready=true;break;}catch{await delay(200);}}assert.equal(ready,true);
  docker('run','--detach','--rm','--pull','never','--name',names.backend,'--network',networks.central,'--network-alias','blog',...constrained,...identity,...fixtureMount,'--tmpfs','/tmp:rw,size=32m,mode=1777',identities.blog,'node','/qa/backend.mjs');
  ready=false;for(let attempt=0;attempt<60;attempt++){try{assert.equal(await readFile(join(directory,'backend-ready'),'utf8'),'ready');ready=true;break;}catch{await delay(200);}}assert.equal(ready,true,'Actual central contacts HTTP and only existing schema ready');
  docker('exec',names.backend,'node','/qa/control.mjs','registry');
  const nginxBase=['--pull','never','--user','101:101','--read-only','--memory','64m','--cpus','0.25','--pids-limit','32','--security-opt','no-new-privileges:true','--cap-drop','ALL','--tmpfs','/tmp:rw,uid=101,gid=101,size=16m,mode=0700','--entrypoint','nginx'];
  docker('create','--name',names.gateway,'--network',networks.relay,'--network-alias','vcode-contact-relay',...nginxBase,'--volume',volumes['gateway-config']+':/etc/nginx/contact-relays:ro','--volume',volumes['gateway-tls']+':/run/contact-relay-tls:ro',identities.nginx,'-c','/etc/nginx/contact-relays/tls-gateway.conf','-g','daemon off;');
  docker('network','connect',networks.central,names.gateway);docker('start',names.gateway);docker('exec',names.gateway,'nginx','-t','-c','/etc/nginx/contact-relays/tls-gateway.conf');
  assert.deepEqual(JSON.parse(docker('exec',names.gateway,'curl','--fail','--silent','--max-time','5','--cacert','/run/contact-relay-tls/ca.pem','--resolve','vcode-contact-relay:8443:127.0.0.1','--header','Host: vcode-contact-relay','https://vcode-contact-relay:8443/health').trim()),{ok:true});
  const appEnv=['--env','PARTNER_CONTACT_ENABLED=true','--env','PARTNER_CONTACT_PRIVACY_APPROVED=true','--env','PARTNER_CONTACT_PRIVACY_PUBLISHED=true','--env','PARTNER_CONTACT_PRIVACY_VERSION=contact-20261009','--env','PARTNER_CONTACT_PRIVACY_DIGEST='+synthetic.privacyDigest,'--env','PARTNER_CONTACT_CREDENTIAL_FILE=/qa/credential','--env','PARTNER_CONTACT_INGRESS_GUARD_FILE=/qa/guard','--env','PARTNER_CONTACT_CA_FILE=/qa/ca.pem'];
  docker('create','--name',names.app,'--network',networks.app,'--network-alias','contact-node','--pull','never',...constrained,...identity,...fixtureMount,...appEnv,identities.blog,'node','/qa/adapter.mjs');docker('network','connect',networks.relay,names.app);docker('start',names.app);
  ready=false;for(let attempt=0;attempt<60;attempt++){try{assert.equal(await readFile(join(directory,'adapter-ready'),'utf8'),'ready');ready=true;break;}catch{await delay(200);}}assert.equal(ready,true,'Actual Moje porce route exports and protected runtime ready');
  docker('create','--name',names.dmz,'--network',networks.edge,'--network-alias','contact-app',...nginxBase,'--volume',volumes['dmz-config']+':/etc/nginx/mojeporce-contact-relay:ro',identities.nginx,'-c','/etc/nginx/mojeporce-contact-relay/dmz.conf','-g','daemon off;');docker('network','connect',networks.app,names.dmz);docker('start',names.dmz);docker('exec',names.dmz,'nginx','-t','-c','/etc/nginx/mojeporce-contact-relay/dmz.conf');
  docker('exec',names.app,'node','/qa/adapter-probe.mjs','invalid-ca');
  docker('exec','--env','PARTNER_CONTACT_PRIVACY_DIGEST=incorrect',names.app,'node','/qa/adapter-probe.mjs','bad-runtime');
  docker('create','--name',names['wrong-hostname'],'--network',networks['wrong-hostname'],'--network-alias','vcode-contact-relay',...nginxBase,'--volume',volumes['gateway-config']+':/etc/nginx/contact-relays:ro','--volume',volumes['wrong-hostname-tls']+':/run/contact-relay-tls:ro',identities.nginx,'-c','/etc/nginx/contact-relays/tls-gateway.conf','-g','daemon off;');docker('start',names['wrong-hostname']);
  docker('run','--rm','--pull','never','--name',names['tls-probe'],'--network',networks['wrong-hostname'],...constrained,...identity,...fixtureMount,identities.blog,'node','/qa/adapter-probe.mjs','wrong-hostname');
  const runPhase=phase=>docker('exec',names.browser,'node','/qa/probe.mjs',phase);
  docker('run','--rm','--pull','never','--name',names.outsider,'--network',networks.app,...constrained,...identity,...fixtureMount,identities.blog,'node','--input-type=module','-e',`import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';const fixture=JSON.parse(readFileSync('/qa/fixture.json','utf8'));for(const guard of [undefined,'A'.repeat(43)]){const result=await fetch('http://contact-node:8092/api/partner-contact/challenge',{headers:{host:'mojeporce.cz',origin:'https://mojeporce.cz','sec-fetch-site':'same-origin','x-real-ip':fixture.edgeAddress,'x-fixture-direct-probe':'synthetic-control',...(guard?{'x-mojeporce-contact-ingress':guard}:{})}});assert.equal(result.status,403);assert.equal((await result.json()).error.code,'ORIGIN_REJECTED');}await assert.rejects(fetch('http://blog:8090/internal/contacts',{signal:AbortSignal.timeout(1500)}));writeFileSync('/qa/ingress-proof.json',JSON.stringify({directNodeWithoutGuardDenied:true,directNodeSpoofGuardDenied:true,appNetworkCannotReachContactDatabase:true}),{mode:0o600});`);
  runPhase('guards');
  // This real end-to-end call exposes source/gateway incompatibilities. Never
  // widen the gateway Host rule or replace the source transport to obtain PASS.
  runPhase('disabled');docker('exec',names.backend,'node','/qa/control.mjs','enable');runPhase('first');
  docker('exec',names.backend,'node','/qa/control.mjs','inspect');runPhase('deleted');
  docker('exec',names.backend,'node','/qa/control.mjs','retention');docker('exec',names.backend,'node','/qa/control.mjs','revoke');
  runPhase('revoked');
  docker('exec',names.browser,'node','--input-type=module','-e',`import assert from 'node:assert/strict';const result=await fetch('http://contact-app:8080/api/unrelated-fixture');assert.equal(result.status,418);assert.equal(await result.text(),'unchanged-api');const home=await fetch('http://contact-app:8080/');assert.equal(home.status,200);assert.equal(await home.text(),'unchanged-static-app');`);
  const accessLog=docker('exec',names.dmz,'cat','/tmp/app-access.log');assert.ok(accessLog.includes('/api/unrelated-fixture'));assert.ok(!accessLog.includes('api/partner-contact')&&!accessLog.includes('synthetic@example.invalid'));
  const outcomes={};for(const file of ['registry-proof.json','activation-proof.json','guards-proof.json','disabled-proof.json','first-proof.json','control-proof.json','deleted-proof.json','retention-proof.json','revocation-proof.json','revoke-preserved-proof.json','invalid-ca-proof.json','hostname-proof.json','runtime-proof.json','ingress-proof.json'])Object.assign(outcomes,JSON.parse(await readFile(join(directory,file),'utf8')));
  const observed=JSON.parse(await readFile(join(directory,'observations.json'),'utf8'));assert.equal(observed.canonicalAppContextSeen,true);assert.equal(observed.rawBrowserHeadersForwarded,false);
  const adapterObserved=JSON.parse(await readFile(join(directory,'adapter-observations.json'),'utf8'));assert.equal(adapterObserved.privateBrowserHeadersForwarded,false);assert.equal(adapterObserved.actualEdgeAddressSeen,true);assert.equal(adapterObserved.configuredGuardSeen,true);
  for(const [file,hash]of Object.entries(hashes))assert.equal(createHash('sha256').update(await readFile(join(templateRoot,file))).digest('hex'),hash);
  for(const [file,hash]of Object.entries(clientHashes))assert.equal(createHash('sha256').update(await readFile(join(clientRoot,file))).digest('hex'),hash,'Source changed during acceptance');
  evidence={result:'PASS',scope:'Actual Moje porce Node route exports and verified native HTTPS transport through frozen Moje porce DMZ template and frozen private TLS gateway to createContactService and disposable PostgreSQL',nextFrameworkBuildVerified:false,productionDmzInstallationVerified:false,actualIngressTemplateVerified:true,images:identities,templateSha256:hashes,clientSourceSha256:clientHashes,clientPrivacyDigest:synthetic.privacyDigest,syntheticDataOnly:true,noHostPorts:true,noProductionConnections:true,realTelegramCalls:0,systemTrustChanged:false,outcomes:{...outcomes,unrelatedStaticAndApiRoutesPreserved:true,rejectedQueryExcludedFromAppLogs:true,browserReferralAdminCookieHeadersSuppressed:true,nginxUid101ReadOnly:true,exactGatewayHealthPassed:true}};completed=true;
}catch(error){
  runFailure=error;const partial={};
  let diagnostic=String(error.stderr??error.message??'Synthetic fixture failed').slice(-3500);
  for(const secret of [synthetic.key,synthetic.secondKey,synthetic.guard,synthetic.inbox,synthetic.form,synthetic.password])diagnostic=diagnostic.replaceAll(secret,'[synthetic-secret-redacted]');
  process.stderr.write(diagnostic+'\n');
  for(const file of ['registry-proof.json','guards-proof.json','ingress-proof.json','invalid-ca-proof.json','hostname-proof.json','runtime-proof.json','source-blocker.json']){try{Object.assign(partial,JSON.parse(await readFile(join(directory,file),'utf8')));}catch{}}
  evidence={result:partial.actualNodeTransportRejectedByFrozenHostGate?'BLOCKED':'FAIL',scope:'Isolated source adapter acceptance; production untouched',images:identities,templateSha256:hashes,clientSourceSha256:clientHashes,syntheticDataOnly:true,noHostPorts:true,noProductionConnections:true,realTelegramCalls:0,outcomes:partial};
  for(const name of [names.backend,names.app,names.dmz,names.gateway]){try{process.stderr.write(docker('logs','--tail','12',name));}catch{}}
}finally{
  for(const name of Object.values(names))clean('rm','--force',name);for(const network of Object.values(networks))clean('network','rm',network);for(const volume of Object.values(volumes))clean('volume','rm',volume);
  await rm(directory,{recursive:true,force:true});
  assert.equal(docker('ps','-a','--filter','name='+prefix,'--format','{{.Names}}').trim(),'');assert.equal(docker('network','ls','--filter','name='+prefix,'--format','{{.Name}}').trim(),'');assert.equal(docker('volume','ls','--filter','name='+prefix,'--format','{{.Name}}').trim(),'');
  if(!completed)process.stderr.write('Isolated Moje porce fixture did not pass; its own resources and synthetic credentials were removed.\n');
}
evidence.disposableResourcesRemoved=true;if(output)await writeFile(output,JSON.stringify(evidence,null,2)+'\n',{mode:0o600});process.stdout.write(JSON.stringify(evidence)+'\n');
if(runFailure)process.exitCode=1;
