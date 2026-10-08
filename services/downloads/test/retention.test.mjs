import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, stat, chmod, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { AggregateCounters } from '../metrics.mjs';
import { createDownloadServer } from '../server.mjs';

// Synthetic aggregate labels only, never real downloads, accounts or visitors.
const id='0.6.0-123';
const installers=['VCodeRecall-0.6.0-123-macos-arm64.zip','VCodeRecall-0.6.0-123-macos-arm64.dmg'];
const active={active:{id},releases:[{id,manifest:{version:'0.6.0',build:'123',artifacts:installers.map(file=>({file,kind:'installer'}))}}]};
const disabled={active:null,releases:[]};
async function fixture(){
  const root=await mkdtemp('/private/tmp/vcode-retention-test-'),path=resolve(root,'downloads.json');
  let now=new Date('2026-09-30T12:00:00.000Z');
  const clock=()=>new Date(now);
  const counters=new AggregateCounters({path,clock});await counters.start(active);
  await counters.record({release:id,artifact:installers[0],method:'GET',status:200,bytes:5,finished:true});
  now=new Date('2026-10-01T12:00:00.000Z');await counters.record({release:id,artifact:null,click:true});
  now=new Date('2026-10-30T23:59:59.999Z');await counters.record({release:id,artifact:installers[1],method:'HEAD',status:200,finished:true});
  return {root,path,clock,counters,setTime:value=>{now=new Date(value);},cleanup:()=>rm(root,{recursive:true,force:true})};
}
test('inactive refresh preserves the 29th prior UTC day, expires the 30th and records nothing new',async()=>{
  const f=await fixture();try{
    // Oct 30: Oct 1 is exactly 29 prior UTC days; Sep 30 is expired.
    await f.counters.start(disabled);assert.equal(f.counters.active,false);assert.equal(f.counters.failed,false);
    let document=JSON.parse(await readFile(f.path));assert.deepEqual(document.days.map(row=>row.date),['2026-10-01','2026-10-30']);
    await f.counters.record({release:id,artifact:null,click:true});await f.counters.record({release:'arbitrary/private/url',artifact:'../private',method:'GET',bytes:9,finished:true,status:200});
    await f.counters.flush();assert.deepEqual(JSON.parse(await readFile(f.path)).days,document.days);
    // One millisecond later UTC changes day. Oct 1 must now expire.
    f.setTime('2026-10-31T00:00:00.000Z');await f.counters.start(disabled);
    document=JSON.parse(await readFile(f.path));assert.deepEqual(document.days.map(row=>row.date),['2026-10-30']);
    assert.equal(document.days[0].headRequests,1);assert.equal(document.days[0].getRequests,0);
    assert.equal((await stat(f.path)).mode&0o777,0o600);
  }finally{await f.counters.close();await f.cleanup();}
});
test('cold inactive restart validates historical allowlist and durably removes expired rows',async()=>{
  const f=await fixture();try{
    f.setTime('2026-10-31T00:00:00.000Z');const restarted=new AggregateCounters({path:f.path,clock:f.clock});await restarted.start(disabled);
    assert.equal(restarted.active,false);assert.equal(restarted.failed,false);assert.equal(restarted.retentionReady,true);
    assert.deepEqual(JSON.parse(await readFile(f.path)).days.map(row=>row.date),['2026-10-30']);
    f.setTime('2026-11-29T00:00:00.000Z');const later=new AggregateCounters({path:f.path,clock:f.clock});await later.start(disabled);
    const document=JSON.parse(await readFile(f.path));assert.deepEqual(document.days,[]);assert.equal(later.active,false);assert.equal(later.failed,false);
    assert.equal(document.coverageStart,'2026-09-30T12:00:00.000Z');assert.equal(document.updatedAt,'2026-11-29T00:00:00.000Z');
  }finally{await f.counters.close();await f.cleanup();}
});
test('server minute-maintenance path keeps pruning without publication config or active catalog',async()=>{
  const f=await fixture();let service;try{
    // The same callback uses 60,000 ms in production. A short interval keeps
    // this disposable unit acceptance bounded without binding any HTTP port.
    const counters=new AggregateCounters({path:f.path,clock:f.clock});service=await createDownloadServer({counters,retentionMs:10});
    assert.equal(counters.active,false);assert.equal(counters.failed,false);
    f.setTime('2026-10-31T00:00:00.000Z');await service.refresh(true);
    assert.deepEqual(JSON.parse(await readFile(f.path)).days.map(row=>row.date),['2026-10-30']);
    f.setTime('2026-11-29T00:00:00.000Z');await delay(40);await counters.close();
    assert.deepEqual(JSON.parse(await readFile(f.path)).days,[]);assert.equal(counters.active,false);
    assert.equal(counters.record({release:id,artifact:null,click:true}),undefined);
  }finally{if(service)await service.close();await f.counters.close();await f.cleanup();}
});
test('disabled missing aggregate stays absent on start, refresh and maintenance; deleted file is not recreated',async()=>{
  const root=await mkdtemp('/private/tmp/vcode-retention-missing-'),path=resolve(root,'downloads.json');let service;
  try{
    const counters=new AggregateCounters({path});await counters.start(disabled);await counters.flush();
    service=await createDownloadServer({counters,retentionMs:10});await service.refresh(true);await delay(30);await counters.close();
    await assert.rejects(readFile(path),{code:'ENOENT'});assert.equal(counters.active,false);assert.equal(counters.retentionReady,false);assert.equal(counters.coverageStart,null);
  }finally{if(service)await service.close();await rm(root,{recursive:true,force:true});}
  const f=await fixture();try{await f.counters.start(disabled);await rm(f.path);await f.counters.flush();await assert.rejects(readFile(f.path),{code:'ENOENT'});assert.equal(f.counters.retentionReady,false);}
  finally{await f.counters.close();await f.cleanup();}
});
test('inactive cleanup rejects unsafe private file, symlink and forged historical labels without overwriting',async()=>{
  const f=await fixture();try{
    const original=await readFile(f.path);await chmod(f.path,0o644);
    let counters=new AggregateCounters({path:f.path,clock:f.clock});await counters.start(disabled);await counters.flush();assert.equal(counters.failed,true);assert.deepEqual(await readFile(f.path),original);
    await chmod(f.path,0o600);
    const forged=JSON.parse(original);forged.releases[0].artifacts[0]='../private-project.txt';const bytes=JSON.stringify(forged);await writeFile(f.path,bytes);
    counters=new AggregateCounters({path:f.path,clock:f.clock});await counters.start(disabled);await counters.flush();assert.equal(counters.failed,true);assert.equal(await readFile(f.path,'utf8'),bytes);
    const target=resolve(f.root,'target.json');await writeFile(target,original,{mode:0o600});await rm(f.path);await symlink(target,f.path);
    counters=new AggregateCounters({path:f.path,clock:f.clock});await counters.start(disabled);await counters.flush();assert.equal(counters.failed,true);assert.deepEqual(await readFile(target),original);
  }finally{await f.counters.close();await f.cleanup();}
});
