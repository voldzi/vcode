import { constants } from 'node:fs';
import { open, lstat } from 'node:fs/promises';
import { atomicJSON, PRODUCT, exact, validTime, safePath, fileIdentity, VERSION, BUILD } from './release.mjs';

const COUNTERS = ['getRequests','headRequests','fullResponses','rangeResponses','errorResponses','abortedResponses','bytesWritten','clickIntents'];
const MAX_ROWS = 2910;
function checkedReleases(releases) {
  if(!Array.isArray(releases) || releases.length>32)throw Error('Invalid aggregate releases');
  const ids=new Set();
  for(const release of releases) {
    exact(release,['id','version','buildNumber','artifacts'],'aggregate release');
    if(typeof release.version!=='string' || !VERSION.test(release.version) || typeof release.buildNumber!=='string' || !BUILD.test(release.buildNumber)
      || release.id!==`${release.version}-${release.buildNumber}` || ids.has(release.id)
      || !Array.isArray(release.artifacts) || release.artifacts.length!==2
      || new Set(release.artifacts).size!==2
      || release.artifacts.some(file=>![`VCodeRecall-${release.version}-${release.buildNumber}-macos-arm64.zip`,`VCodeRecall-${release.version}-${release.buildNumber}-macos-arm64.dmg`].includes(file)))throw Error('Invalid aggregate release');
    ids.add(release.id);
  }
  return releases;
}
async function readExisting(path) {
  await safePath(path);
  const file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);
  try {
    const before=await file.stat();
    if(!before.isFile() || before.size<1 || before.size>2*1024**2 || (before.mode&0o077)!==0
      || (typeof process.getuid==='function' && before.uid!==process.getuid()))throw Error('Unsafe private aggregate');
    const bytes=await file.readFile();
    if(bytes.length!==before.size || fileIdentity(before)!==fileIdentity(await file.stat()))throw Error('Aggregate changed while reading');
    return JSON.parse(bytes);
  } finally {await file.close();}
}
async function privateDestination(path) {
  await safePath(path);
  const info=await lstat(path);
  if(!info.isFile() || info.size<1 || info.size>2*1024**2 || (info.mode&0o077)!==0
    || (typeof process.getuid==='function' && info.uid!==process.getuid()))throw Error('Unsafe private aggregate');
}
export class AggregateCounters {
  constructor({path=null,clock=()=>new Date() }={}) {
    this.path=path; this.clock=clock; this.rows=new Map(); this.releases=[];
    this.coverageStart=null; this.active=false; this.failed=false;this.retentionReady=false;
    this.pending=Promise.resolve();this.writing=false;this.dirty=false;
  }
  async start(catalog) {
    const published=catalog.releases.map(r=>({id:r.id,version:r.manifest.version,buildNumber:r.manifest.build,
      artifacts:r.manifest.artifacts.filter(a=>a.kind==='installer').map(a=>a.file)}));
    this.active=Boolean(catalog.active && this.path);
    if (!this.path){this.retentionReady=false;return;}
    // Disabling collection must not disable retention for an existing file.
    // An empty disabled catalog may retain only its validated historical labels;
    // those labels never authorize recording or serving a release.
    if(published.length || this.active)this.releases=published;
    if(this.retentionReady && this.coverageStart && !this.failed){this.prune();await this.flush();return;}
    await this.pending;this.rows.clear(); this.failed=false;this.retentionReady=false;
    let previous;
    try { previous=await readExisting(this.path); }
    catch(error) { if(error.code!=='ENOENT') {this.failed=true;this.active=false;return;} }
    if(previous) {
      try {
        exact(previous,['schemaVersion','product','measurement','retentionDays','timezone','coverageStart','updatedAt','releases','days'],'aggregate');
        if(previous.schemaVersion!==1 || previous.product!==PRODUCT || previous.measurement!=='service-to-proxy'
          || previous.retentionDays!==30 || previous.timezone!=='UTC' || !validTime(previous.coverageStart)
          || !validTime(previous.updatedAt) || Date.parse(previous.coverageStart)>Date.parse(previous.updatedAt)
          || Date.parse(previous.updatedAt)>this.clock().getTime()+300_000
          || !Array.isArray(previous.days) || previous.days.length>MAX_ROWS) throw Error('Invalid aggregate');
        const historical=checkedReleases(previous.releases);
        if(!published.length && !this.active)this.releases=historical;
        for(const row of previous.days) {
          exact(row,['date','release','artifact',...COUNTERS],'aggregate row');
          if(!/^\d{4}-\d\d-\d\d$/.test(row.date) || new Date(row.date).toISOString().slice(0,10)!==row.date
            || row.date<previous.coverageStart.slice(0,10) || !this.allowed(row.release,row.artifact)
            || COUNTERS.some(k=>!Number.isSafeInteger(row[k]) || row[k]<0)) throw Error('Invalid aggregate row');
          const key=JSON.stringify([row.date,row.release,row.artifact]);
          if(this.rows.has(key)) throw Error('Duplicate aggregate row');
          this.rows.set(key,row);
        }
        this.coverageStart=previous.coverageStart;
      } catch {this.failed=true;this.active=false;this.rows.clear();return;}
    } else {
      // Never create a metrics file or establish coverage for a disabled install.
      if(!this.active){this.coverageStart=null;return;}
      this.coverageStart=this.clock().toISOString();
    }
    this.retentionReady=true;
    this.prune();
    await this.flush();
  }
  allowed(release,artifact) {
    if(release==='none') return artifact===null;
    const entry=this.releases.find(r=>r.id===release);
    return Boolean(entry && (artifact===null || entry.artifacts.includes(artifact)));
  }
  prune() {
    // UTC dates: the current day plus 29 previous calendar days.
    const cutoff=new Date(this.clock()); cutoff.setUTCHours(0,0,0,0); cutoff.setUTCDate(cutoff.getUTCDate()-29);
    const first=cutoff.toISOString().slice(0,10), today=this.clock().toISOString().slice(0,10);
    for(const [key,row] of this.rows) if(row.date<first || row.date>today || !this.allowed(row.release,row.artifact)) this.rows.delete(key);
  }
  record({release='none',artifact=null,method,status=0,bytes=0,finished=false,aborted=false,click=false}) {
    if(!this.active || this.failed || !this.allowed(release,artifact)) return;
    this.prune();
    const date=this.clock().toISOString().slice(0,10);
    const key=JSON.stringify([date,release,artifact]);
    if(!this.rows.has(key)) {
      if(this.rows.size>=MAX_ROWS) {this.failed=true;return;}
      this.rows.set(key,{date,release,artifact,...Object.fromEntries(COUNTERS.map(k=>[k,0]))});
    }
    const row=this.rows.get(key);
    const increment=(name,n=1)=>{if(Number.isSafeInteger(n)&&n>=0&&Number.isSafeInteger(row[name]+n))row[name]+=n;else this.failed=true;};
    if(click) increment('clickIntents');
    else {
      if(method==='GET') increment('getRequests');
      if(method==='HEAD') increment('headRequests');
      if(status>=400) increment('errorResponses');
      if(finished && artifact && method==='GET' && status===200) increment('fullResponses');
      if(finished && artifact && method==='GET' && status===206) increment('rangeResponses');
      if(aborted) increment('abortedResponses');
      if(method==='GET') increment('bytesWritten',bytes);
    }
    // No queue of raw requests, even temporarily: only merged numeric buckets.
    return this.flush();
  }
  snapshot() {
    this.prune();
    return {schemaVersion:1,product:PRODUCT,measurement:'service-to-proxy',retentionDays:30,timezone:'UTC',
      coverageStart:this.coverageStart,updatedAt:this.clock().toISOString(),releases:this.releases,
      days:[...this.rows.values()].sort((a,b)=>JSON.stringify([a.date,a.release,a.artifact]).localeCompare(JSON.stringify([b.date,b.release,b.artifact])))};
  }
  flush() {
    if(!this.path || !this.retentionReady || this.failed) return Promise.resolve();
    // One writer plus a boolean dirty flag: bursts never create a promise queue
    // per request or retain raw requests. The next snapshot merges all counts.
    this.dirty=true;
    if(this.writing)return this.pending;
    this.writing=true;
    this.pending=(async()=>{
      try {
        do {
          this.dirty=false;
          try {await privateDestination(this.path);} catch(error) {
            if(error.code!=='ENOENT')throw error;
            if(!this.active){this.retentionReady=false;this.rows.clear();return;}
          }
          await atomicJSON(this.path,this.snapshot());
        }
        while(this.dirty && !this.failed);
      } catch {this.failed=true;}
      finally {this.writing=false;}
    })();
    return this.pending;
  }
  async close(){await this.pending;}
}
