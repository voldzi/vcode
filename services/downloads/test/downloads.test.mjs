import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, chmod, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateKeyPairSync, sign } from 'node:crypto';
import { request } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { canonical, digest, artifactBase, loadCatalog, publishRelease, promoteAccepted, verifyReceipt, readTrustedKey, parseManifest, publicMetadata, privateBuildProof, scopeApprovalDigest, PREFIX, ORIGIN } from '../release.mjs';
import { validateDownloadMetrics } from '../../analytics/lib/download-metrics.mjs';
import { verifyPublicReleaseBuild } from '../../../scripts/recall-publication-gate.mjs';
import { createDownloadServer, singleRange } from '../server.mjs';
import { AggregateCounters } from '../metrics.mjs';

// Synthetic bytes and ephemeral test keys only. These fixtures are never public
// release evidence and do not read/launch any installed app, model or index.
async function fixture({large=false}={}) {
  const root=await mkdtemp('/private/tmp/vcode-download-test-');
  const sourceDirectory=resolve(root,'source');await mkdir(sourceDirectory);
  const {publicKey,privateKey}=generateKeyPairSync('ed25519');
  const trustedKeyPath=resolve(root,'trust.pem');await writeFile(trustedKeyPath,publicKey.export({type:'spki',format:'pem'}));
  const catalogPath=resolve(root,'catalog.json'),metricsPath=resolve(root,'aggregates.json');
  const f={root,sourceDirectory,trustedKeyPath,catalogPath,metricsPath,privateKey};
  await candidate(f,'1',{large});
  f.cleanup=async()=>{const releases=resolve(root,'releases');for(const entry of await readdir(releases,{withFileTypes:true}).catch(()=>[]))if(entry.isDirectory())await chmod(resolve(releases,entry.name),0o700);await rm(root,{recursive:true,force:true});};return f;
}
async function candidate(f,build='1',{large=false}={}) {
  const base=artifactBase('0.6.0',build);
  const zip=large?Buffer.alloc(16*1024**2,0x71):Buffer.from('synthetic zip bytes: 0123456789');
  const dmg=Buffer.from('synthetic dmg bytes: abcdefghij');
  f.zip=zip;f.dmg=dmg;
  f.manifest={schemaVersion:2,name:'VCode Recall',version:'0.6.0',buildNumber:build,build,
    platform:'macos-arm64',minimumSystemVersion:'26.0',bundleIdentifier:'cz.home.chromadb.statusbar',distribution:'public',
    notarized:true,signing:'developer-id',payloadTreeSHA256:'a'.repeat(64),
    artifacts:[{file:`${base}.zip`,kind:'installer',sha256:digest(zip),sizeBytes:zip.length},{file:`${base}.dmg`,kind:'installer',sha256:digest(dmg),sizeBytes:dmg.length},
      {file:`${base}.licenses.txt`,kind:'license',sha256:digest(Buffer.from('synthetic license')),sizeBytes:17},
      {file:`${base}.sources.tar.gz`,kind:'source',sha256:digest(Buffer.from('synthetic source')),sizeBytes:16}],
    archive:`${base}.zip`,sha256:digest(zip)};
  for(const item of f.manifest.artifacts)await writeFile(resolve(f.sourceDirectory,item.file),item.kind==='installer'?(item.file.endsWith('.zip')?zip:dmg):Buffer.from(item.kind==='license'?'synthetic license':'synthetic source'));
  f.manifestBytes=Buffer.from(JSON.stringify(f.manifest)+'\n');
  f.manifestFile=`${base}.manifest.json`;f.receiptFile=`${base}.attestation.json`;
  await writeFile(resolve(f.sourceDirectory,f.manifestFile),f.manifestBytes);
  const now=new Date().toISOString();
  const apple={status:'Accepted',submissionId:'00000000-0000-0000-0000-000000000001',stapleValidated:true,gatekeeperAccepted:true};
  f.payload={schemaVersion:1,productId:'vcode-recall',releaseId:`0.6.0-${build}`,manifestSHA256:digest(f.manifestBytes),artifacts:f.manifest.artifacts,
    app:{bundleName:'VCode Recall.app',bundleIdentifier:f.manifest.bundleIdentifier,version:'0.6.0',buildNumber:build,
      minimumSystemVersion:'26.0',platform:'macos-arm64',teamIdentifier:'MC3RPR926P',cdHash:'b'.repeat(40),
      payloadTreeSHA256:'a'.repeat(64),nativeRuntimeTreeSHA256:'c'.repeat(64),developerIDVerified:true,hardenedRuntimeVerified:true,
      appleTimestampVerified:true,signatureVerified:true,localizations:['cs','en'],selfContainedNative:true},
    notarization:{app:{...apple},dmg:{...apple}},acceptance:Object.fromEntries(['cleanInstall','quarantineLaunch','offlineFirstRun','loginAndAutostart','mcpClients','retrieval','twoVersionReplacement','rollback','removal','csAndEn'].map(k=>[k,true])),
    licensing:{applicationLicense:'proprietary-free',licenseReviewComplete:true,requiredSourcesComplete:true,requiredSourceFiles:[`${base}.sources.tar.gz`]},
    ready:{status:'READY-TO-PUBLISH',approvedAt:now},privacy:{status:'APPROVED',noticeSHA256:'d'.repeat(64),approvedAt:now},issuedAt:now};
  await attest(f);
  f.ackReady=f.payload.releaseId;f.ackPrivacy=f.payload.privacy.noticeSHA256;f.prefix=PREFIX+f.payload.releaseId+'/';
}
async function attest(f){f.receipt={schemaVersion:f.payload.schemaVersion,payload:f.payload,signature:sign(null,Buffer.from(canonical(f.payload)),f.privateKey).toString('base64')};await writeFile(resolve(f.sourceDirectory,f.receiptFile),JSON.stringify(f.receipt));}
async function scopedCandidate(f) {
  const optional=['cleanInstall','quarantineLaunch','rollback','removal'];
  f.payload.schemaVersion=2;
  f.payload.acceptance={scope:'existing-owner-account',checks:Object.fromEntries(Object.keys(f.payload.acceptance).map(k=>[k,optional.includes(k)?'NOT-RUN':'PASS']))};
  f.payload.scopeApproval={status:'APPROVED',scope:'existing-owner-account',notRunChecks:[...optional].sort(),approvedAt:f.payload.issuedAt};
  f.ackScope=scopeApprovalDigest(f.payload);
  await attest(f);
}
async function live(f){
  await publishRelease(f);
  const service=await createDownloadServer(f);
  await new Promise(resolve=>service.server.listen(0,'127.0.0.1',resolve));
  f.service=service;f.url=`http://127.0.0.1:${service.server.address().port}`;
  f.stop=async()=>{await new Promise(resolve=>service.server.close(resolve));await service.close();};
  return service;
}

test('empty unconfigured service is healthy disabled and exposes no public health/metrics/download',async()=>{
  const service=await createDownloadServer();await new Promise(r=>service.server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${service.server.address().port}`;
  try {
    for(const path of ['/health','/metrics',PREFIX+'latest.json'])assert.equal((await fetch(base+path)).status,404);
    assert.equal(service.counters.active,false);
  } finally {await new Promise(r=>service.server.close(r));await service.close();}
});
test('publisher signature and all exact artifact gates are checked independently of manifest booleans',async()=>{
  const f=await fixture();try {
    const key=await readTrustedKey(f.trustedKeyPath);
    assert.throws(()=>parseManifest(Buffer.from(JSON.stringify({...f.manifest,build:1,buildNumber:1}))),/identity/);
    verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key);
    for(const mutate of [p=>p.app.teamIdentifier='AAAAAAAAAA',p=>p.ready.status='PENDING',p=>p.privacy.status='PENDING',
      p=>p.notarization.app.status='In Progress',p=>p.notarization.dmg.stapleValidated=false,p=>p.acceptance.cleanInstall=false,
      p=>p.acceptance.twoVersionReplacement=false,p=>p.app.bundleName='ChromaStatusBar.app',p=>p.manifestSHA256='0'.repeat(64)]) {
      const original=f.payload;f.payload=structuredClone(original);mutate(f.payload);await attest(f);
      assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key));f.payload=original;
    }
    await attest(f);f.receipt.payload.app.teamIdentifier='AAAAAAAAAA';assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key),/Untrusted/);
    const wrong=generateKeyPairSync('ed25519').publicKey;assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),wrong));
  } finally {await f.cleanup();}
});
test('offline publication requires separate exact operator acknowledgments',async()=>{
  const f=await fixture();try {
    await assert.rejects(publishRelease({...f,ackReady:undefined}),/acknowledgment/);
    await assert.rejects(publishRelease({...f,ackPrivacy:'e'.repeat(64)}),/acknowledgment/);
    await assert.rejects(readFile(f.catalogPath));
  } finally {await f.cleanup();}
});
test('scoped v2 receipt preserves mandatory checks, exact signed scope and all original trust gates',async()=>{
  const f=await fixture();try {
    await scopedCandidate(f);
    const key=await readTrustedKey(f.trustedKeyPath);
    verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key);
    const original=structuredClone(f.payload);
    const mutations=[
      ...['offlineFirstRun','loginAndAutostart','mcpClients','retrieval','twoVersionReplacement','csAndEn'].map(k=>p=>p.acceptance.checks[k]='NOT-RUN'),
      p=>p.acceptance.checks.cleanInstall=true,p=>p.acceptance.checks.removal='FAIL',
      p=>delete p.acceptance.checks.rollback,p=>p.acceptance.checks.extra='PASS',
      p=>p.acceptance.scope='clean-mac',p=>delete p.scopeApproval,
      p=>p.scopeApproval.status='PENDING',p=>p.scopeApproval.scope='other',
      p=>p.scopeApproval.notRunChecks.pop(),p=>p.scopeApproval.notRunChecks.reverse(),
      p=>p.scopeApproval.notRunChecks.push('removal'),p=>p.scopeApproval.extra=true,
      p=>p.scopeApproval.approvedAt=new Date(Date.parse(p.issuedAt)+1000).toISOString(),
      p=>p.app.signatureVerified=false,p=>p.app.teamIdentifier='AAAAAAAAAA',
      p=>p.app.hardenedRuntimeVerified=false,p=>p.app.appleTimestampVerified=false,
      p=>p.app.selfContainedNative=false,p=>p.app.localizations=['cs'],
      p=>p.notarization.app.status='In Progress',p=>p.notarization.dmg.gatekeeperAccepted=false,
      p=>p.licensing.requiredSourcesComplete=false,p=>p.licensing.licenseReviewComplete=false,
      p=>p.privacy.status='PENDING',p=>p.ready.status='PENDING',
      p=>p.artifacts[0].sha256='0'.repeat(64),p=>p.manifestSHA256='0'.repeat(64)
    ];
    for(const mutate of mutations){f.payload=structuredClone(original);mutate(f.payload);await attest(f);assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key));}
    f.payload=structuredClone(original);await attest(f);
    f.receipt.payload.acceptance.checks.cleanInstall='PASS';assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key),/Untrusted/);
    await attest(f);f.receipt.schemaVersion=1;assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key));
    await attest(f);assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),generateKeyPairSync('ed25519').publicKey),/Untrusted/);
    f.payload=structuredClone(original);f.payload.acceptance.checks.rollback='PASS';f.payload.scopeApproval.notRunChecks=f.payload.scopeApproval.notRunChecks.filter(k=>k!=='rollback');await attest(f);
    verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key);
  } finally {await f.cleanup();}
});
test('scoped publication and promotion require independent exact scope acknowledgment; private scope stays out of public metadata',async()=>{
  const f=await fixture();try {
    await scopedCandidate(f);
    await assert.rejects(publishRelease({...f,ackScope:undefined}),/scope acknowledgment/);
    await assert.rejects(publishRelease({...f,ackScope:'e'.repeat(64)}),/scope acknowledgment/);
    await assert.rejects(readFile(f.catalogPath));
    await publishRelease(f);
    const bytes=await readFile(f.catalogPath);
    await assert.rejects(promoteAccepted({...f,id:f.ackReady,ackScope:undefined}),/scope acknowledgment/);
    await assert.rejects(promoteAccepted({...f,id:f.ackReady,ackScope:'e'.repeat(64)}),/scope acknowledgment/);
    assert.deepEqual(await readFile(f.catalogPath),bytes);
    await promoteAccepted({...f,id:f.ackReady});
    const catalog=await loadCatalog(f);
    assert.equal(catalog.active.acceptance.acceptance.checks.removal,'NOT-RUN');
    const metadata=publicMetadata(catalog);
    for(const name of ['scopeApproval','acceptance','approvedAt','issuedAt'])assert.equal(JSON.stringify(metadata).includes(name),false);
    assert.deepEqual(metadata.validation,{scope:'existing-owner-account',notRunChecks:['cleanInstall','quarantineLaunch','removal','rollback']});
    const proofFile=resolve(f.root,'scoped-build-proof.json');await writeFile(proofFile,JSON.stringify(privateBuildProof(catalog)));
    await verifyPublicReleaseBuild({publicRelease:metadata,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy});
    const misleading=structuredClone(metadata);misleading.validation.notRunChecks=[];
    await assert.rejects(verifyPublicReleaseBuild({publicRelease:misleading,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy}),/metadata/);
  } finally {await f.cleanup();}
});
test('scoped v2 still rejects real artifact tampering before catalog creation',async()=>{
  const f=await fixture();try {
    await scopedCandidate(f);
    await writeFile(resolve(f.sourceDirectory,f.manifest.artifacts[0].file),Buffer.alloc(f.zip.length,0));
    await assert.rejects(publishRelease(f),/hash/);
    await assert.rejects(readFile(f.catalogPath));
  } finally {await f.cleanup();}
});
test('latest feed and immutable metadata match the manifest and exact HTTPS app updater path',async()=>{
  const f=await fixture();try {await live(f);
    const response=await fetch(f.url+PREFIX+'latest.json',{redirect:'error'});assert.equal(response.status,200);
    assert.equal(response.headers.get('content-type'),'application/json');assert.match(response.headers.get('cache-control'),/no-cache/);
    const latest=await response.json();assert.equal(latest.downloadURL,ORIGIN+f.prefix+f.manifest.artifacts[1].file);
    assert.equal(latest.sha256,digest(f.dmg));assert.equal(latest.buildNumber,'1');assert.equal(latest.sizeBytes,f.dmg.length);
    const metadata=await fetch(f.url+f.prefix+f.manifestFile);assert.equal(metadata.status,200);assert.equal(digest(Buffer.from(await metadata.arrayBuffer())),digest(f.manifestBytes));
    assert.match(metadata.headers.get('content-disposition'),/^attachment;/);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('only exact allowlisted filenames are served; raw and encoded traversal and query aliases are rejected',async()=>{
  const f=await fixture();try {await live(f);
    for(const path of [PREFIX+'.env',PREFIX+'trust.pem',PREFIX+'../catalog.json',PREFIX+'%2e%2e/catalog.json',PREFIX+'latest.json?q=1',PREFIX+'%6catest.json',PREFIX+'//latest.json',PREFIX+'arbitrary.zip','/metrics']) {
      const status=await new Promise((resolve,reject)=>{const req=request(f.url,{path},r=>{r.resume();resolve(r.statusCode);});req.on('error',reject);req.end();});assert.equal(status,404,path);
    }
    assert.equal((await fetch(f.url+f.prefix+f.manifest.artifacts[0].file,{method:'POST'})).status,405);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('whole file, HEAD, conditional GET and single ranges have accurate bytes and representation metadata',async()=>{
  const f=await fixture();try {await live(f);const url=f.url+f.prefix+f.manifest.artifacts[0].file;
    const full=await fetch(url);assert.equal(full.status,200);assert.equal(full.headers.get('content-type'),'application/zip');assert.match(full.headers.get('cache-control'),/immutable/);assert.deepEqual(Buffer.from(await full.arrayBuffer()),f.zip);
    const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(Number(head.headers.get('content-length')),f.zip.length);assert.equal((await head.arrayBuffer()).byteLength,0);
    const partial=await fetch(url,{headers:{Range:'bytes=2-6'}});assert.equal(partial.status,206);assert.equal(partial.headers.get('content-range'),`bytes 2-6/${f.zip.length}`);assert.deepEqual(Buffer.from(await partial.arrayBuffer()),f.zip.subarray(2,7));
    const suffix=await fetch(url,{headers:{Range:'bytes=-4'}});assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),f.zip.subarray(-4));
    const etag=full.headers.get('etag');const cached=await fetch(url,{headers:{'If-None-Match':etag}});assert.equal(cached.status,304);assert.equal(cached.headers.get('content-length'),null);
    const ignored=await fetch(url,{headers:{Range:'bytes=2-6','If-Range':'"wrong"'}});assert.equal(ignored.status,200);await ignored.arrayBuffer();
    await delay(20);await f.service.counters.close();const aggregate=f.service.counters.snapshot();const row=aggregate.days.find(r=>r.artifact===f.manifest.artifacts[0].file);
    assert.equal(row.headRequests,1);assert.equal(row.fullResponses,2);assert.equal(row.rangeResponses,2);assert.equal(row.bytesWritten,f.zip.length*2+5+4);
    for(const key of ['ip','userAgent','referrer','visitorId','requestId'])assert.equal(JSON.stringify(aggregate).includes(`"${key}"`),false);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('malformed, multipart and unsatisfiable byte ranges receive 416',async()=>{
  const f=await fixture();try {await live(f);const url=f.url+f.prefix+f.manifest.artifacts[0].file;
    for(const range of ['bytes=0-1,3-4','bytes=-0','bytes=999999-','bytes=5-2','items=1-2','bytes=999999999999999999999999-']) {
      const response=await fetch(url,{headers:{Range:range}});assert.equal(response.status,416);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('content-range'),`bytes */${f.zip.length}`);
    }
    assert.deepEqual(singleRange('bytes=1-',5),{start:1,end:4});assert.equal(singleRange('bytes=3-1',5),false);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('changed on-disk artifact never serves old hash metadata or payload',async()=>{
  const f=await fixture();try {await live(f);const item=f.manifest.artifacts[0],path=resolve(f.root,'releases',f.payload.releaseId,item.file);
    await chmod(path,0o600);await writeFile(path,Buffer.alloc(item.sizeBytes,0x33));
    const failed=await fetch(f.url+f.prefix+item.file);assert.equal(failed.status,503);assert.equal(failed.headers.get('cache-control'),'no-store');assert.equal(failed.headers.get('etag'),null);assert.equal(failed.headers.get('content-disposition'),null);
    await f.service.refresh(true);assert.equal((await fetch(f.url+PREFIX+'latest.json')).status,404);
    await assert.rejects(loadCatalog(f),/hash/);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('availability probe marks private health unavailable after immutable artifact drift',async()=>{
  const f=await fixture();try {await live(f);await new Promise(r=>f.service.privateServer.listen(0,'127.0.0.1',r));
    const health=`http://127.0.0.1:${f.service.privateServer.address().port}/health`;
    assert.equal((await fetch(health)).status,200);
    const item=f.manifest.artifacts[0],path=resolve(f.root,'releases',f.payload.releaseId,item.file);await chmod(path,0o600);await writeFile(path,'synthetic drift');
    await f.service.probe();assert.equal((await fetch(health)).status,503);assert.equal((await fetch(f.url+PREFIX+'latest.json')).status,404);
  } finally {if(f.service?.privateServer.listening)await new Promise(r=>f.service.privateServer.close(r));if(f.stop)await f.stop();await f.cleanup();}
});
test('required license/source artifacts are hash-bound and served separately from installer KPIs',async()=>{
  const f=await fixture();try {await live(f);const item=f.manifest.artifacts.find(a=>a.kind==='source');
    const response=await fetch(f.url+f.prefix+item.file);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/gzip');assert.equal(digest(Buffer.from(await response.arrayBuffer())),item.sha256);
    await f.service.counters.close();const snapshot=f.service.counters.snapshot();assert(snapshot.days.every(r=>r.artifact===null));assert.equal(snapshot.days.reduce((n,r)=>n+r.fullResponses,0),0);
    const key=await readTrustedKey(f.trustedKeyPath);f.payload.licensing.requiredSourcesComplete=false;await attest(f);assert.throws(()=>verifyReceipt(f.receipt,f.manifest,digest(f.manifestBytes),key),/source/);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('symlink source/parent/published files are refused without reading arbitrary targets',async()=>{
  const f=await fixture();try {
    const item=f.manifest.artifacts[0],path=resolve(f.sourceDirectory,item.file);await rm(path);await symlink(resolve(f.sourceDirectory,f.manifest.artifacts[1].file),path);
    await assert.rejects(publishRelease(f),/Symlink/);
    const linked=resolve(f.root,'linked');await symlink(f.sourceDirectory,linked);await assert.rejects(publishRelease({...f,sourceDirectory:linked}),/Symlink/);
    await assert.rejects(readFile(f.catalogPath));
  } finally {await f.cleanup();}
});
test('failed stage/hash checks preserve active version and immutable existing release',async()=>{
  const f=await fixture();try {
    await publishRelease(f);const first=await readFile(f.catalogPath);
    await assert.rejects(publishRelease(f),/already exists/);assert.deepEqual(await readFile(f.catalogPath),first);
    const oldZip=resolve(f.root,'releases','0.6.0-1',f.manifest.artifacts[0].file);assert.deepEqual(await readFile(oldZip),f.zip);
    await candidate(f,'2');await assert.rejects(publishRelease({...f,beforeCommit:()=>{throw Error('synthetic staging failure');}}),/staging failure/);
    assert.deepEqual(await readFile(f.catalogPath),first);assert.deepEqual(await readFile(oldZip),f.zip);
    await writeFile(resolve(f.sourceDirectory,f.manifest.artifacts[0].file),'tampered');await assert.rejects(publishRelease(f),/size|hash/);assert.deepEqual(await readFile(f.catalogPath),first);
  } finally {await f.cleanup();}
});
test('publisher lock prevents competing publication and leaves existing catalog unchanged',async()=>{
  const f=await fixture();try {await writeFile(resolve(f.root,'.publication.lock'),'synthetic lock');await assert.rejects(publishRelease(f),/EEXIST/);await assert.rejects(readFile(f.catalogPath));}
  finally {await f.cleanup();}
});
test('atomic accepted rollback rechecks hashes and permits only prior signed release',async()=>{
  const f=await fixture();try {await publishRelease(f);await candidate(f,'2');await publishRelease(f);
    assert.equal((await loadCatalog(f)).active.id,'0.6.0-2');
    await promoteAccepted({...f,id:'0.6.0-1',ackReady:'0.6.0-1'});assert.equal((await loadCatalog(f)).active.id,'0.6.0-1');
    await assert.rejects(promoteAccepted({...f,id:'0.6.0-999',ackReady:'0.6.0-999'}));assert.equal((await loadCatalog(f)).active.id,'0.6.0-1');
  } finally {await f.cleanup();}
});
test('click intent excludes cookies/identity, honors DNT/GPC and requires exact same origin bounded payload',async()=>{
  const f=await fixture();try {await live(f);const url=f.url+'/analytics/download-intent';const headers={Origin:ORIGIN,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json'};
    assert.equal((await fetch(url,{method:'POST',headers,body:'{"product":"vcode-recall"}'})).status,204);
    for(const extra of [{DNT:'1'},{'Sec-GPC':'1'}])assert.equal((await fetch(url,{method:'POST',headers:{...headers,...extra},body:'{"product":"vcode-recall"}'})).status,204);
    assert.equal((await fetch(url,{method:'POST',headers:{...headers,Cookie:'sid=synthetic'},body:'{"product":"vcode-recall"}'})).status,403);
    assert.equal((await fetch(url,{method:'POST',headers:{...headers,Origin:'https://evil.example'},body:'{"product":"vcode-recall"}'})).status,403);
    assert.equal((await fetch(url,{method:'POST',headers,body:'{"product":"vcode-recall","url":"private"}'})).status,400);
    assert.equal((await fetch(url,{method:'POST',headers,body:'x'.repeat(129)})).status,413);
    await f.service.counters.close();assert.equal(f.service.counters.snapshot().days.reduce((n,r)=>n+r.clickIntents,0),1);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('client disconnection is a partial service write, not a completed download',async()=>{
  const f=await fixture({large:true});try {await live(f);
    await new Promise((resolve,reject)=>{const req=request(f.url+f.prefix+f.manifest.artifacts[0].file,response=>{
      response.once('data',()=>{response.destroy();req.destroy();resolve();});});req.on('error',error=>{if(error.code!=='ECONNRESET')reject(error);});req.end();});
    await delay(100);await f.service.counters.close();const row=f.service.counters.snapshot().days.find(r=>r.artifact===f.manifest.artifacts[0].file);
    assert.equal(row.fullResponses,0);assert.equal(row.abortedResponses,1);assert(row.bytesWritten>0);assert(row.bytesWritten<f.zip.length);
  } finally {if(f.stop)await f.stop();await f.cleanup();}
});
test('30-day UTC retention runs on write/read with daily aggregates only, restart persists totals',async()=>{
  const f=await fixture();try {await publishRelease(f);const catalog=await loadCatalog(f);let now=new Date('2026-10-01T00:00:00.000Z');
    const counters=new AggregateCounters({path:f.metricsPath,clock:()=>now});await counters.start(catalog);
    await counters.record({release:catalog.active.id,artifact:null,click:true});now=new Date('2026-10-30T00:00:00.000Z');await counters.record({release:catalog.active.id,artifact:null,click:true});
    assert.equal(counters.snapshot().days.length,2);now=new Date('2026-10-31T00:00:00.000Z');await counters.flush();assert.equal(counters.snapshot().days.length,1);
    const restarted=new AggregateCounters({path:f.metricsPath,clock:()=>now});await restarted.start(catalog);assert.equal(restarted.snapshot().days[0].clickIntents,1);
    assert.equal(restarted.snapshot().measurement,'service-to-proxy');assert.equal(restarted.snapshot().timezone,'UTC');
    const corrupted=JSON.parse(await readFile(f.metricsPath));corrupted.coverageStart='2027-01-01T00:00:00.000Z';await writeFile(f.metricsPath,JSON.stringify(corrupted));
    const invalid=new AggregateCounters({path:f.metricsPath,clock:()=>now});await invalid.start(catalog);assert.equal(invalid.active,false);assert.equal(invalid.failed,true);
  } finally {await f.cleanup();}
});
test('aggregate writer meets authenticated dashboard reader contract; public metadata contains no attestation',async()=>{
  const f=await fixture();try {await publishRelease(f);const catalog=await loadCatalog(f),counters=new AggregateCounters({path:f.metricsPath});await counters.start(catalog);
    await counters.record({release:catalog.active.id,artifact:f.manifest.artifacts[0].file,method:'GET',status:200,finished:true,bytes:f.zip.length});
    await counters.record({release:catalog.active.id,artifact:null,click:true});
    const read=validateDownloadMetrics(counters.snapshot());assert.equal(read.availability,'available');assert.equal(read.totals.fullResponses,1);assert.equal(read.totals.clickIntents,1);assert.equal(read.totals.bytesWritten,f.zip.length);
    const metadata=publicMetadata(catalog);assert.equal(metadata.artifacts.length,2);assert.equal(metadata.complianceArtifacts.length,2);assert.equal(metadata.artifacts[0].url,f.prefix+f.manifest.artifacts[0].file);assert.equal(metadata.manifestURL,f.prefix+f.manifestFile);
    for(const key of ['signature','teamIdentifier','acceptance','receipt','issuedAt','approvedAt'])assert.equal(JSON.stringify(metadata).includes(`"${key}"`),false);
    const proof=privateBuildProof(catalog);assert.equal(digest(Buffer.from(proof.manifestBase64,'base64')),digest(f.manifestBytes));assert.deepEqual(proof.receipt,f.receipt);assert(Buffer.byteLength(JSON.stringify(proof))<=131072);
  }finally{await f.cleanup();}
});
test('unsafe or malformed private publication catalog and writable trust key fail closed',async()=>{
  const f=await fixture();try {await publishRelease(f);const original=await readFile(f.catalogPath);
    await chmod(f.catalogPath,0o644);await assert.rejects(loadCatalog(f),/owner-only/);await chmod(f.catalogPath,0o600);
    await writeFile(f.catalogPath,'not json');await assert.rejects(loadCatalog(f));
    const service=await createDownloadServer(f);await new Promise(r=>service.privateServer.listen(0,'127.0.0.1',r));
    assert.equal((await fetch(`http://127.0.0.1:${service.privateServer.address().port}/health`)).status,503);
    await new Promise(r=>service.privateServer.close(r));await service.close();
    await writeFile(f.catalogPath,original);await chmod(f.trustedKeyPath,0o666);await assert.rejects(loadCatalog(f),/Trust key/);
    await chmod(f.trustedKeyPath,0o600);await rm(f.catalogPath);await symlink(resolve(f.sourceDirectory,f.manifestFile),f.catalogPath);await assert.rejects(loadCatalog(f),/Symlink/);
  }finally{await f.cleanup();}
});
test('large request bursts coalesce into bounded durable writes with exact totals',async()=>{
  const f=await fixture();try {await publishRelease(f);const catalog=await loadCatalog(f),counters=new AggregateCounters({path:f.metricsPath});await counters.start(catalog);
    let pending;for(let i=0;i<2000;i++)pending=counters.record({release:catalog.active.id,artifact:null,click:true});
    assert.equal(counters.writing,true);assert.equal(counters.pending,pending);await counters.close();
    const document=JSON.parse(await readFile(f.metricsPath));assert.equal(document.days[0].clickIntents,2000);assert.equal(document.days.length,1);assert.equal(counters.writing,false);
  }finally{await f.cleanup();}
});
test('pre-existing unpublished immutable directory is never deleted on failure',async()=>{
  const f=await fixture();try {const final=resolve(f.root,'releases',f.payload.releaseId);await mkdir(final,{recursive:true});await writeFile(resolve(final,'sentinel'),'existing owner data');
    await assert.rejects(publishRelease(f),/EEXIST/);assert.equal(await readFile(resolve(final,'sentinel'),'utf8'),'existing owner data');await assert.rejects(readFile(f.catalogPath));
  }finally{await f.cleanup();}
});
test('published static build verifies exact signed private proof, public URLs/hashes/platform and approvals',async()=>{
  const f=await fixture();try {await publishRelease(f);const catalog=await loadCatalog(f),publicRelease=publicMetadata(catalog),proof=privateBuildProof(catalog),proofFile=resolve(f.root,'private-build-proof.json');
    await writeFile(proofFile,JSON.stringify(proof));await verifyPublicReleaseBuild({publicRelease,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy});
    await assert.rejects(verifyPublicReleaseBuild({publicRelease,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:'0'.repeat(64)}),/privacy/);
    for(const mutate of [m=>m.artifacts[0].url='/downloads/arbitrary.zip',m=>m.artifacts[0].sha256='0'.repeat(64),m=>m.minimumSystemVersion='13.0',m=>m.complianceArtifacts=[]]) {
      const tampered=structuredClone(publicRelease);mutate(tampered);await assert.rejects(verifyPublicReleaseBuild({publicRelease:tampered,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy}),/metadata/);
    }
    await assert.rejects(verifyPublicReleaseBuild({publicRelease,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy}),/required/);
    await assert.rejects(verifyPublicReleaseBuild({publicRelease,proofFile,keyFile:resolve(f.root,'missing.pem'),approvedPrivacySHA256:f.ackPrivacy}));
    // A trusted signer must still provide the literal approvals; a valid
    // cryptographic signature does not waive those independent status checks.
    f.payload.ready.status='PENDING';await attest(f);await writeFile(proofFile,JSON.stringify({...proof,receipt:f.receipt}));
    await assert.rejects(verifyPublicReleaseBuild({publicRelease,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy}),/approval/);
    f.payload.ready.status='READY-TO-PUBLISH';f.payload.privacy.status='PENDING';await attest(f);await writeFile(proofFile,JSON.stringify({...proof,receipt:f.receipt}));
    await assert.rejects(verifyPublicReleaseBuild({publicRelease,proofFile,keyFile:f.trustedKeyPath,approvedPrivacySHA256:f.ackPrivacy}),/approval/);
  }finally{await f.cleanup();}
});
