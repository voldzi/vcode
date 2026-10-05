import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,stat,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createSessionStore,SHORT_SESSION_MS,REMEMBER_SESSION_MS} from '../sessions.mjs';
test('remembered sessions survive restart, expire, and are revoked durably without storing raw tokens or IDs',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vcode-session-test-'));let time=1000;const now=()=>time;
 try{
  let store=await createSessionStore(dir,{now});
  const short=await store.create('short-secret'),long=await store.create('remembered-secret',true);
  assert.equal(short.until-time,SHORT_SESSION_MS);assert.equal(long.until-time,REMEMBER_SESSION_MS);
  const disk=await readFile(join(dir,'sessions.enc'));assert.ok(!disk.includes(Buffer.from('remembered-secret')));assert.ok(!disk.includes(Buffer.from(long.id)));
  assert.equal((await stat(join(dir,'sessions.enc'))).mode&0o777,0o600);assert.equal((await stat(join(dir,'session-key'))).mode&0o777,0o600);
  store=await createSessionStore(dir,{now});assert.equal(store.get(short.id),null);assert.equal(store.get(long.id).token,'remembered-secret');assert.equal(store.get('bad'),null);
  await store.remove(long.id);store=await createSessionStore(dir,{now});assert.equal(store.get(long.id),null);
  const expiring=await store.create('expiring',true);time=expiring.until;assert.equal(store.get(expiring.id),null);await store.prune();store=await createSessionStore(dir,{now});assert.equal(store.size,0);
  await store.create('integrity',true);const corrupt=await readFile(join(dir,'sessions.enc'));corrupt[corrupt.length-1]^=1;await writeFile(join(dir,'sessions.enc'),corrupt);await assert.rejects(createSessionStore(dir,{now}));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('ordinary sessions expire at one hour; remember requires configured server storage',async()=>{
 let time=0;const store=await createSessionStore(undefined,{now:()=>time});const s=await store.create('test');time=SHORT_SESSION_MS;assert.equal(store.get(s.id),null);await assert.rejects(store.create('test',true));
});
