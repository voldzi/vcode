import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createPartnershipStore} from '../partnership-store.mjs';

const START = Date.parse('2026-10-09T12:00:00Z');
const actor = '11111111-2222-4333-8444-555555555555';
const secret = 'synthetic-partnership-secret-only-'.repeat(2);
const payload = () => ({appId: 'kaloricke-tabulky', requestId: randomUUID(), locale: 'cs', name: 'Synthetic Partner',
  email: 'synthetic@example.invalid', organization: null, type: 'vyrobce', message: 'Only synthetic information for isolated testing.', privacyVersion: 'partnership-intake-20261009-1'});
// These unit tests cover the storage boundary, not a second implementation of PostgreSQL.
// Transaction, concurrency, lease, SQL constraints and retention acceptance run against
// a disposable database in scripts/verify-partnership-postgres.mjs.
const unusedPool = {query: async () => {throw new Error('Unexpected storage access');}, connect: async () => {throw new Error('Unexpected storage access');}};

test('retention maintenance can initialize with no intake secret, but intake fails closed', async () => {
  const store = createPartnershipStore({pool: unusedPool, clock: () => START});
  await assert.rejects(store.save(payload(), {challengeValid: true}), {status: 503, code: 'unavailable', message: 'unavailable'});
  assert.throws(() => createPartnershipStore({pool: null}), {status: 503, code: 'unavailable'});
});

test('private workflow limits and disabled promotion are rejected before storage access', async () => {
  const store = createPartnershipStore({pool: unusedPool, clock: () => START, hashSecret: secret}), id = randomUUID();
  for (const options of [{limit: 0}, {limit: 101}, {limit: '2'}, {stage: 'unknown'}, {appId: 'private/path'}]) {
    await assert.rejects(store.list(options), {status: 400, code: 'invalid-input'});
  }
  for (const input of [{expectedVersion: 0, stage: 'reviewing'}, {expectedVersion: 1, stage: 'unknown'},
    {expectedVersion: 1, managerId: 'another-admin'}, {expectedVersion: 1, nextAction: 'x'.repeat(501)},
    {expectedVersion: 1, nextActionDueAt: 'not-an-instant'}, {expectedVersion: 1, expiresAt: '2027-01-01'}, {}, null]) {
    await assert.rejects(store.update(id, input, actor), {status: 400, code: 'invalid-input'});
  }
  for (const policy of [undefined, {enabled: false}, {enabled: true, version: 'approved', retentionDays: 0},
    {enabled: true, version: 'approved', retentionDays: 366}]) {
    await assert.rejects(store.promote(id, {expectedVersion: 1, displayName: 'Synthetic', policyVersion: 'approved'}, actor, policy), {status: 403, code: 'rejected'});
  }
  for (const input of [{expectedVersion: 0, displayName: 'Synthetic', policyVersion: 'approved'},
    {expectedVersion: 1, displayName: 'Synthetic', policyVersion: 'other'},
    {expectedVersion: 1, displayName: 'Synthetic', policyVersion: 'approved', email: 'copy@example.invalid'}]) {
    await assert.rejects(store.promote(id, input, actor, {enabled: true, version: 'approved', retentionDays: 90}), {status: 400, code: 'invalid-input'});
  }
  await assert.rejects(store.remove('invalid', actor), {status: 400, code: 'invalid-input'});
  await assert.rejects(store.removePartner(id, ''), {status: 400, code: 'invalid-input'});
  await assert.rejects(store.listPartners({limit: 101}), {status: 400, code: 'invalid-input'});
});

test('storage infrastructure failures are replaced with fixed safe errors', async () => {
  const commands = [], db = {release() {commands.push('release');}, async query(sql) {
    commands.push(sql); if (sql === 'BEGIN' || sql === 'ROLLBACK') return {rows: [], rowCount: 0};
    throw new Error('Synthetic failure containing synthetic@example.invalid and an internal address');
  }};
  const store = createPartnershipStore({pool: {query() {}, connect: async () => db}, clock: () => START, hashSecret: secret});
  await assert.rejects(store.save(payload(), {challengeValid: true}), {status: 503, code: 'unavailable', message: 'unavailable'});
  assert.equal(commands.at(-2), 'ROLLBACK'); assert.equal(commands.at(-1), 'release');
});

test('normalized property order does not change HMAC retry identity; deleted retries are never resurrected', async () => {
  const values = []; let receipt, commits = 0, inserts = 0;
  const db = {release() {}, async query(sql, parameters = []) {
    if (sql === 'COMMIT') commits++;
    if (sql.startsWith('SELECT reference,inquiry_id,payload_hash')) return {rows: receipt ? [receipt] : [], rowCount: receipt ? 1 : 0};
    if (sql.startsWith('SELECT count(*)')) return {rows: [{total: 0, application: 0}], rowCount: 1};
    if (sql.startsWith('INSERT INTO vcode_contacts.partnership_receipts')) {
      values.push(parameters); receipt = {reference: parameters[2], inquiry_id: parameters[2], payload_hash: parameters[3]};
    }
    if (sql.startsWith('INSERT')) inserts++;
    return {rows: [], rowCount: 0};
  }};
  const pool = {query() {}, connect: async () => db}, store = createPartnershipStore({pool, clock: () => START, hashSecret: secret});
  const input = payload(), reference = await store.save(input, {challengeValid: true});
  const reordered = Object.fromEntries(Object.entries(input).reverse());
  assert.equal(await store.save(reordered, {challengeValid: false}), reference);
  assert.equal(commits, 2); assert.equal(inserts, 3);
  assert.match(values[0][3], /^[a-f0-9]{64}$/);
  const other = createPartnershipStore({pool, clock: () => START, hashSecret: secret + '-another-key'});
  await assert.rejects(other.save(input, {challengeValid: false}), {status: 409, code: 'idempotency-conflict'});
  receipt.inquiry_id = null;
  await assert.rejects(store.save(input, {challengeValid: true}), {status: 410, code: 'request-closed'});
  assert.equal(inserts, 3);
});


test('application lookup returns only immutable application ID, never inquiry content', async () => {
  let present = true;
  const db = {release() {}, async query(sql) {
    if (sql.startsWith('SELECT app_id AS')) return {rows: present ? [{appId: 'kaloricke-tabulky'}] : [], rowCount: present ? 1 : 0};
    return {rows: [], rowCount: 0};
  }};
  const store = createPartnershipStore({pool: {query() {}, connect: async () => db}, clock: () => START});
  const id = randomUUID();
  assert.equal(await store.getApplication(id), 'kaloricke-tabulky');
  present = false;
  await assert.rejects(store.getApplication(id), {status: 404, code: 'not-found'});
  await assert.rejects(store.getApplication('not-a-uuid'), {status: 400, code: 'invalid-input'});
});
