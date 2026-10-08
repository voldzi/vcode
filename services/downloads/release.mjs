import { constants } from 'node:fs';
import { open, lstat, mkdir, rename, unlink, chmod, readdir } from 'node:fs/promises';
import { resolve, dirname, basename, sep } from 'node:path';
import { createHash, createPublicKey, verify } from 'node:crypto';

export const PRODUCT = 'vcode-recall';
export const PREFIX = '/downloads/chromadb-status/';
export const ORIGIN = 'https://vcode.zeleznalady.cz';
export const TEAM = 'MC3RPR926P';
export const VERSION = /^(?:0|[1-9]\d{0,5})\.(?:0|[1-9]\d{0,5})\.(?:0|[1-9]\d{0,5})$/;
export const BUILD = /^[1-9]\d{0,19}$/;
export const HASH = /^[0-9a-f]{64}$/;
export const MAX_RELEASES = 32;
const MAX_FILE = 30 * 1024 ** 3;
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/;
export function refuse(message) { throw new Error(message); }
export function exact(object, keys, label = 'object') {
  if (!object || typeof object !== 'object' || Array.isArray(object)
    || Object.keys(object).sort().join('|') !== [...keys].sort().join('|')) refuse(`Invalid ${label}`);
}
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function digest(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export function validTime(value) { return typeof value === 'string' && ISO.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString()===value; }
export function releaseId(version, build) {
  if (typeof version!=='string' || typeof build!=='string' || !VERSION.test(version) || !BUILD.test(build)) refuse('Invalid release identity');
  return `${version}-${build}`;
}
export function artifactBase(version, build) { releaseId(version, build); return `VCodeRecall-${version}-${build}-macos-arm64`; }

// Check every component; O_NOFOLLOW on the final file alone is insufficient.
export async function safePath(path, { directory = false } = {}) {
  if (typeof path !== 'string' || !path.startsWith(sep) || resolve(path) !== path) refuse('Expected canonical absolute path');
  let current = sep;
  for (const part of path.slice(1).split(sep).filter(Boolean)) {
    current = resolve(current, part);
    const info = await lstat(current);
    if (info.isSymbolicLink()) refuse('Symlink path refused');
    if (current !== path && !info.isDirectory()) refuse('Non-directory parent');
    if (current === path && (directory ? !info.isDirectory() : !info.isFile())) refuse('Invalid path type');
  }
  return path;
}
export function fileIdentity(stat) { return [stat.dev, stat.ino, stat.size, stat.mtimeMs, stat.ctimeMs].join('|'); }
export async function readRegular(path, maximum = 65_536) {
  await safePath(path);
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.size > maximum || before.size < 1) refuse('Invalid file size');
    const bytes = await handle.readFile();
    if (bytes.length !== before.size || fileIdentity(before) !== fileIdentity(await handle.stat())) refuse('File changed while reading');
    return bytes;
  } finally { await handle.close(); }
}
export async function verifiedFile(path, expectedHash, expectedSize) {
  await safePath(path);
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.size !== expectedSize) refuse('Artifact size mismatch');
    const hash = createHash('sha256');
    const stream = handle.createReadStream({ autoClose: false });
    for await (const chunk of stream) hash.update(chunk);
    if (hash.digest('hex') !== expectedHash || fileIdentity(before) !== fileIdentity(await handle.stat())) refuse('Artifact hash or identity mismatch');
    return { path, size: before.size, hash: expectedHash, identity: fileIdentity(before) };
  } finally { await handle.close(); }
}
export function parseManifest(bytes) {
  if (bytes.length > 65_536) refuse('Manifest too large');
  const m = JSON.parse(bytes);
  exact(m, ['schemaVersion','name','version','buildNumber','build','platform','minimumSystemVersion','bundleIdentifier','distribution','notarized','signing','payloadTreeSHA256','artifacts','archive','sha256'], 'release manifest');
  const base = artifactBase(m.version, m.buildNumber);
  if (m.schemaVersion !== 2 || !['VCode Recall','ChromaStatusBar'].includes(m.name) || m.build !== m.buildNumber
    || m.platform !== 'macos-arm64' || m.minimumSystemVersion !== '26.0'
    || m.bundleIdentifier !== 'cz.home.chromadb.statusbar' || m.distribution !== 'public'
    || m.notarized !== true || m.signing !== 'developer-id' || !HASH.test(m.payloadTreeSHA256)
    || !Array.isArray(m.artifacts) || m.artifacts.length < 4 || m.artifacts.length > 10) refuse('Unapproved release manifest');
  for (const item of m.artifacts) {
    exact(item, ['file','kind','sha256','sizeBytes'], 'artifact');
    const accepted = {installer:[`${base}.zip`,`${base}.dmg`],license:[`${base}.licenses.zip`,`${base}.licenses.txt`,`${base}.licenses.json`],source:[`${base}.sources.tar.gz`,`${base}.sources.zip`]};
    if (!accepted[item.kind]?.includes(item.file) || !HASH.test(item.sha256)
      || !Number.isSafeInteger(item.sizeBytes) || item.sizeBytes < 1 || item.sizeBytes > MAX_FILE) refuse('Invalid artifact');
  }
  const installers=m.artifacts.filter(item=>item.kind==='installer');
  if (new Set(m.artifacts.map(item => item.file)).size !== m.artifacts.length || installers.length!==2
    || !m.artifacts.some(item=>item.kind==='license') || !m.artifacts.some(item=>item.kind==='source')
    || m.archive !== `${base}.zip` || m.sha256 !== installers.find(item => item.file===`${base}.zip`)?.sha256) refuse('Inconsistent archive');
  return m;
}
export function latestFor(m) {
  const item = m.artifacts.find(item => item.kind==='installer' && item.file.endsWith('.dmg'));
  const result = { schemaVersion:1, version:m.version, build:m.build, buildNumber:m.buildNumber,
    minimumSystemVersion:m.minimumSystemVersion, platform:m.platform, downloadURL:ORIGIN + PREFIX + releaseId(m.version,m.build)+'/'+item.file,
    sha256:item.sha256, sizeBytes:item.sizeBytes, distribution:'public', signing:'developer-id', notarized:true };
  const bytes = Buffer.from(JSON.stringify(result) + '\n');
  if (bytes.length > 65_536) refuse('Latest too large');
  return bytes;
}
export async function readTrustedKey(path) {
  await safePath(path);
  if(((await lstat(path)).mode & 0o022)!==0)refuse('Trust key must not be group/world writable');
  const key = createPublicKey(await readRegular(path, 8192));
  if (key.asymmetricKeyType !== 'ed25519') refuse('Ed25519 trust key required');
  return key;
}
export function verifyReceipt(envelope, m, manifestHash, key) {
  exact(envelope, ['schemaVersion','payload','signature'], 'attestation envelope');
  if (![1,2].includes(envelope.schemaVersion) || typeof envelope.signature !== 'string'
    || !/^[A-Za-z0-9+/]{86}==$/.test(envelope.signature)) refuse('Invalid attestation signature encoding');
  const signature = Buffer.from(envelope.signature, 'base64');
  if (signature.length !== 64 || !verify(null, Buffer.from(canonical(envelope.payload)), key, signature)) refuse('Untrusted release attestation');
  const p = envelope.payload;
  const scoped = envelope.schemaVersion === 2;
  exact(p, ['schemaVersion','productId','releaseId','manifestSHA256','artifacts','app','notarization','acceptance','licensing','ready','privacy','issuedAt',...(scoped?['scopeApproval']:[])], 'attestation');
  if (p.schemaVersion !== envelope.schemaVersion || p.productId !== PRODUCT || p.releaseId !== releaseId(m.version, m.build)
    || p.manifestSHA256 !== manifestHash || canonical(p.artifacts) !== canonical(m.artifacts)
    || !validTime(p.issuedAt) || Date.parse(p.issuedAt) > Date.now() + 300_000) refuse('Attestation identity mismatch');
  exact(p.app, ['bundleName','bundleIdentifier','version','buildNumber','minimumSystemVersion','platform','teamIdentifier','cdHash','payloadTreeSHA256','nativeRuntimeTreeSHA256','developerIDVerified','hardenedRuntimeVerified','appleTimestampVerified','signatureVerified','localizations','selfContainedNative'], 'application evidence');
  const a = p.app;
  if (a.bundleName !== 'VCode Recall.app' || a.bundleIdentifier !== m.bundleIdentifier || a.version !== m.version
    || a.buildNumber !== m.build || a.minimumSystemVersion !== m.minimumSystemVersion || a.platform !== m.platform
    || a.teamIdentifier !== TEAM || !/^[0-9a-f]{40}$/.test(a.cdHash) || a.payloadTreeSHA256 !== m.payloadTreeSHA256
    || !HASH.test(a.nativeRuntimeTreeSHA256) || canonical(a.localizations) !== '["cs","en"]'
    || ['developerIDVerified','hardenedRuntimeVerified','appleTimestampVerified','signatureVerified','selfContainedNative'].some(k => a[k] !== true)) refuse('Application acceptance missing');
  exact(p.notarization, ['app','dmg'], 'notarization evidence');
  for (const item of Object.values(p.notarization)) {
    exact(item, ['status','submissionId','stapleValidated','gatekeeperAccepted'], 'Apple evidence');
    if (item.status !== 'Accepted' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(item.submissionId)
      || item.stapleValidated !== true || item.gatekeeperAccepted !== true) refuse('Apple acceptance missing');
  }
  const checks = ['cleanInstall','quarantineLaunch','offlineFirstRun','loginAndAutostart','mcpClients','retrieval','twoVersionReplacement','rollback','removal','csAndEn'];
  if (!scoped) {
    exact(p.acceptance, checks, 'installer acceptance');
    if (checks.some(k => p.acceptance[k] !== true)) refuse('Installer acceptance missing');
  } else {
    exact(p.acceptance, ['scope','checks'], 'scoped installer acceptance');
    exact(p.acceptance.checks, checks, 'scoped installer checks');
    const optional = ['cleanInstall','quarantineLaunch','rollback','removal'];
    if (p.acceptance.scope !== 'existing-owner-account'
      || checks.some(k => !['PASS','NOT-RUN'].includes(p.acceptance.checks[k]))
      || checks.filter(k => !optional.includes(k)).some(k => p.acceptance.checks[k] !== 'PASS')) refuse('Scoped installer acceptance missing');
    exact(p.scopeApproval, ['status','scope','notRunChecks','approvedAt'], 'scope approval');
    const notRun = checks.filter(k => p.acceptance.checks[k] === 'NOT-RUN').sort();
    if (p.scopeApproval.status !== 'APPROVED' || p.scopeApproval.scope !== p.acceptance.scope
      || !Array.isArray(p.scopeApproval.notRunChecks) || canonical(p.scopeApproval.notRunChecks) !== canonical(notRun)
      || !validTime(p.scopeApproval.approvedAt) || Date.parse(p.scopeApproval.approvedAt) > Date.parse(p.issuedAt)) refuse('Scope approval missing');
  }
  exact(p.licensing,['applicationLicense','licenseReviewComplete','requiredSourcesComplete','requiredSourceFiles'],'licensing evidence');
  const required=m.artifacts.filter(item=>item.kind==='source').map(item=>item.file).sort();
  if(p.licensing.applicationLicense!=='proprietary-free' || p.licensing.licenseReviewComplete!==true || p.licensing.requiredSourcesComplete!==true
    || !Array.isArray(p.licensing.requiredSourceFiles) || canonical([...p.licensing.requiredSourceFiles].sort())!==canonical(required)) refuse('License or source acceptance missing');
  exact(p.ready, ['status','approvedAt'], 'publisher approval');
  exact(p.privacy, ['status','noticeSHA256','approvedAt'], 'privacy approval');
  if (p.ready.status !== 'READY-TO-PUBLISH' || p.privacy.status !== 'APPROVED' || !HASH.test(p.privacy.noticeSHA256)
    || ![p.ready.approvedAt, p.privacy.approvedAt].every(validTime)
    || [p.ready.approvedAt, p.privacy.approvedAt].some(t => Date.parse(t) > Date.parse(p.issuedAt))) refuse('Owner approval missing');
  return p;
}

// This digest identifies the separately verified human scope decision. A signed
// publisher assertion is insufficient to authorize omission of installer checks.
export function scopeApprovalDigest(approval) {
  return approval.schemaVersion === 2 ? digest(Buffer.from(canonical(approval.scopeApproval))) : null;
}
function requireScopeAcknowledgment(approval, ackScope) {
  const expected = scopeApprovalDigest(approval);
  if (expected !== null && ackScope !== expected) refuse('Authenticated scope acknowledgment required');
}
export async function loadCatalog({ root, catalogPath, trustedKeyPath }) {
  await safePath(root, {directory:true});
  let bytes;
  try { bytes = await readRegular(catalogPath, 2 * 1024 ** 2); }
  catch (error) { if (error.code === 'ENOENT') return { active:null, releases:[], resources:new Map() }; throw error; }
  if(((await lstat(catalogPath)).mode & 0o077)!==0)refuse('Publication catalog must be owner-only');
  const c = JSON.parse(bytes);
  exact(c, ['schemaVersion','productId','activeRelease','releases'], 'publication catalog');
  if (c.schemaVersion !== 1 || c.productId !== PRODUCT || !Array.isArray(c.releases) || c.releases.length > MAX_RELEASES
    || new Set(c.releases.map(r => r.id)).size !== c.releases.length) refuse('Invalid publication catalog');
  const key = c.releases.length ? await readTrustedKey(trustedKeyPath) : null;
  const releases = [];
  const resources = new Map();
  for (const entry of c.releases) {
    exact(entry, ['id','manifestFile','manifestSHA256','receipt'], 'catalog release');
    if (typeof entry.id !== 'string' || !/^\d{1,6}\.\d{1,6}\.\d{1,6}-[1-9]\d{0,19}$/.test(entry.id) || !HASH.test(entry.manifestSHA256)) refuse('Invalid release path');
    const directory = resolve(root, 'releases', entry.id);
    await safePath(directory, {directory:true});
    if (basename(entry.manifestFile) !== entry.manifestFile || !entry.manifestFile.endsWith('.manifest.json')) refuse('Invalid manifest path');
    const manifestBytes = await readRegular(resolve(directory, entry.manifestFile));
    if (digest(manifestBytes) !== entry.manifestSHA256) refuse('Manifest hash mismatch');
    const m = parseManifest(manifestBytes);
    const base = artifactBase(m.version, m.build);
    if (entry.id !== releaseId(m.version, m.build) || entry.manifestFile !== `${base}.manifest.json`) refuse('Catalog release mismatch');
    const acceptance = verifyReceipt(entry.receipt, m, entry.manifestSHA256, key);
    const latest = latestFor(m);
    const release = { id:entry.id, manifest:m, manifestBytes, receipt:entry.receipt, acceptance, latest };
    releases.push(release);
    const add = (file, resource) => {
      const url=PREFIX+entry.id+'/'+file;
      if (resources.has(url)) refuse('Duplicate resource');
      resources.set(url, {release:entry.id, ...resource});
    };
    add(entry.manifestFile, { bytes:manifestBytes, hash:entry.manifestSHA256, mime:'application/json', filename:entry.manifestFile, artifact:null });
    add(`${base}.latest.json`, { bytes:latest, hash:digest(latest), mime:'application/json', filename:`${base}.latest.json`, artifact:null });
    for (const item of m.artifacts) {
      const file = await verifiedFile(resolve(directory, item.file), item.sha256, item.sizeBytes);
      const mime=item.file.endsWith('.dmg')?'application/x-apple-diskimage':item.file.endsWith('.zip')?'application/zip':item.file.endsWith('.tar.gz')?'application/gzip':item.file.endsWith('.json')?'application/json':'text/plain; charset=utf-8';
      add(item.file, {...file,mime,filename:item.file,artifact:item.kind==='installer'?item.file:null});
      const checksum = Buffer.from(`${item.sha256}  ${item.file}\n`);
      add(`${item.file}.sha256`, {bytes:checksum, hash:digest(checksum), mime:'text/plain; charset=utf-8', filename:`${item.file}.sha256`, artifact:null});
    }
  }
  const active = releases.find(r => r.id === c.activeRelease) ?? null;
  if (c.activeRelease !== null && !active) refuse('Unknown active release');
  if (active) resources.set(PREFIX + 'latest.json', {bytes:active.latest, hash:digest(active.latest), mime:'application/json', filename:null, artifact:null, release:active.id, latest:true});
  return {active, releases, resources};
}
export function publicMetadata(catalog) {
  if(!catalog.active)return null;
  const release=catalog.active,m=release.manifest;
  const item=a=>({file:a.file,sha256:a.sha256,sizeBytes:a.sizeBytes,url:PREFIX+release.id+'/'+a.file});
  return {version:m.version,buildNumber:m.buildNumber,minimumSystemVersion:m.minimumSystemVersion,platform:m.platform,
    manifestURL:PREFIX+release.id+'/'+artifactBase(m.version,m.build)+'.manifest.json',
    artifacts:m.artifacts.filter(a=>a.kind==='installer').map(item),
    complianceArtifacts:m.artifacts.filter(a=>a.kind!=='installer').map(a=>({...item(a),kind:a.kind})),
    ...(release.acceptance?.schemaVersion===2?{validation:{scope:'existing-owner-account',notRunChecks:[...release.acceptance.scopeApproval.notRunChecks]}}:{})};
}
export function privateBuildProof(catalog) {
  if(!catalog.active)return null;
  const proof={schemaVersion:1,manifestBase64:catalog.active.manifestBytes.toString('base64'),receipt:catalog.active.receipt};
  if(Buffer.byteLength(JSON.stringify(proof))>131_072)refuse('Build proof too large');
  return proof;
}
export async function atomicJSON(path, value) {
  await safePath(dirname(path), {directory:true});
  try { await safePath(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = resolve(dirname(path), `.${basename(path)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  const handle = await open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { await handle.writeFile(JSON.stringify(value) + '\n'); await handle.sync(); }
  finally { await handle.close(); }
  try {
    await rename(temporary, path);
    const parent = await open(dirname(path), constants.O_RDONLY); try { await parent.sync(); } finally { await parent.close(); }
  } catch (error) { await unlink(temporary).catch(() => {}); throw error; }
}

// This privileged offline operation never creates its own signing evidence.
// The publisher's trusted Ed25519 private key is held outside this service.
export async function publishRelease(options) {
  await safePath(options.root, {directory:true});
  const lockPath = resolve(options.root,'.publication.lock');
  const lock = await open(lockPath,constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);
  try { return await publishLocked(options); }
  finally { await lock.close(); await unlink(lockPath); }
}
async function publishLocked({root, catalogPath, trustedKeyPath, sourceDirectory, manifestFile, receiptFile, ackReady, ackPrivacy, ackScope, beforeCommit}) {
  await safePath(root, {directory:true});
  await safePath(sourceDirectory, {directory:true});
  if (basename(manifestFile) !== manifestFile || basename(receiptFile) !== receiptFile) refuse('Unsafe handoff filename');
  const bytes = await readRegular(resolve(sourceDirectory, manifestFile));
  const m = parseManifest(bytes);
  const id = releaseId(m.version, m.build);
  const base = artifactBase(m.version, m.build);
  if (manifestFile !== `${base}.manifest.json`) refuse('Manifest filename mismatch');
  const receipt = JSON.parse(await readRegular(resolve(sourceDirectory, receiptFile), 65_536));
  const approval = verifyReceipt(receipt, m, digest(bytes), await readTrustedKey(trustedKeyPath));
  if (ackReady !== id || ackPrivacy !== approval.privacy.noticeSHA256) refuse('Authenticated operator acknowledgment required');
  requireScopeAcknowledgment(approval, ackScope);
  await loadCatalog({root,catalogPath,trustedKeyPath});
  let catalog;
  try { catalog = JSON.parse(await readRegular(catalogPath, 2 * 1024 ** 2)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; catalog = {schemaVersion:1,productId:PRODUCT,activeRelease:null,releases:[]}; }
  if (catalog.releases.length >= MAX_RELEASES || catalog.releases.some(r => r.id === id)) refuse('Immutable release already exists or catalog full');
  const releasesRoot = resolve(root, 'releases');
  await mkdir(releasesRoot, {recursive:true,mode:0o700}); await safePath(releasesRoot, {directory:true});
  const stage = resolve(releasesRoot, `.stage-${crypto.randomUUID()}`);
  await mkdir(stage, {mode:0o700});
  const final = resolve(releasesRoot,id);
  let promoted = false, ownFinal = false;
  try {
    for (const item of m.artifacts) {
      await verifiedFile(resolve(sourceDirectory,item.file),item.sha256,item.sizeBytes);
      const source = await open(resolve(sourceDirectory,item.file), constants.O_RDONLY | constants.O_NOFOLLOW);
      const target = await open(resolve(stage,item.file), constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
      try {
        const hash = createHash('sha256'); let size = 0;
        for await (const chunk of source.createReadStream({autoClose:false})) { hash.update(chunk); size += chunk.length; await target.writeFile(chunk); }
        if (hash.digest('hex') !== item.sha256 || size !== item.sizeBytes) refuse('Staged artifact changed');
        await target.sync();
      } finally { await source.close(); await target.close(); }
      await chmod(resolve(stage,item.file),0o444);
    }
    const manifest = await open(resolve(stage,manifestFile),constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY|constants.O_NOFOLLOW,0o444);
    try { await manifest.writeFile(bytes); await manifest.sync(); } finally { await manifest.close(); }
    if (beforeCommit) await beforeCommit(); // injectable failure only in offline synthetic acceptance
    // Exclusive directory creation prevents replacement of an immutable version.
    await mkdir(final, {mode:0o700}); ownFinal = true;
    for (const file of await readdir(stage)) await rename(resolve(stage,file),resolve(final,file));
    await chmod(final,0o555);
    promoted = true;
    catalog.releases.push({id,manifestFile,manifestSHA256:digest(bytes),receipt});
    catalog.activeRelease = id;
    await atomicJSON(catalogPath,catalog);
    return {id,manifestSHA256:digest(bytes)};
  } finally {
    // Only clean the unique, unpublished stage. A complete final release survives
    // catalog failure for an operator to reconcile; the old active pointer stays.
    const {rm} = await import('node:fs/promises');
    await rm(stage,{recursive:true,force:true});
    if (!promoted && ownFinal) await rm(final,{recursive:true,force:true}).catch(() => {});
  }
}

export async function promoteAccepted({root,catalogPath,trustedKeyPath,id,ackReady,ackPrivacy,ackScope}) {
  await safePath(root,{directory:true});
  const lockPath = resolve(root,'.publication.lock');
  const lock = await open(lockPath,constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);
  try {
    const verified = await loadCatalog({root,catalogPath,trustedKeyPath});
    const release = verified.releases.find(r => r.id === id);
    if (!release || ackReady !== id || ackPrivacy !== release.acceptance.privacy.noticeSHA256) refuse('Accepted release acknowledgment required');
    requireScopeAcknowledgment(release.acceptance, ackScope);
    const catalog = JSON.parse(await readRegular(catalogPath,2*1024**2));
    catalog.activeRelease = id;
    await atomicJSON(catalogPath,catalog);
    return {id};
  } finally { await lock.close(); await unlink(lockPath); }
}
