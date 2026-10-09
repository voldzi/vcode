import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createContactService, issueContactChallenge, validContactChallenge, validateContactPayload} from '../contacts.mjs';

const START = Date.parse('2026-10-09T12:00:00.000Z');
const config = {siteOrigin: 'https://example.invalid', contactEnabled: true, contactPrivacyVersion: 'contact-20261009',
  contactFormSecret: 'form-fixture-only-'.repeat(3), contactInboxToken: 'inbox-fixture-only-'.repeat(3),
  telegramEnabled: true, telegramBotToken: 'synthetic-bot', telegramChatId: 'fixture-chat', telegramApiBaseUrl: 'https://telegram.invalid'};
const catalog = [{id: 'vcode-recall', name: 'VCode Recall'}, {id: 'kaloricke-tabulky', name: 'Moje porce'}];
const input = (token = 'fixture') => ({token, requestId: randomUUID(), locale: 'cs', name: 'Syntetická osoba', email: 'synthetic@example.invalid',
  organization: null, area: 'partnership', application: 'vcode-recall', message: 'Pouze syntetická zpráva pro izolované ověření formuláře.', website: '', privacyVersion: 'contact-20261009'});

// Stateful SQL test double: records query text/parameters and emulates atomic
// commit/rollback, retention, outbox claims and period aggregates. No real PII.
class Database {
  rows = new Map(); outbox = new Map(); calls = []; backup = null; failInsert = false;
  async connect() {return {query: this.query.bind(this), release() {}};}
  async query(sql, params = []) {
    const q = sql.replace(/\s+/g, ' ').trim(); this.calls.push({sql: q, params: structuredClone(params)});
    const result = rows => ({rows, rowCount: rows.length});
    if (q === 'BEGIN') {this.backup = structuredClone({rows: this.rows, outbox: this.outbox}); return result([]);}
    if (q === 'COMMIT') {this.backup = null; return result([]);}
    if (q === 'ROLLBACK') {if (this.backup) Object.assign(this, this.backup); this.backup = null; return result([]);}
    if (q.startsWith('SELECT pg_advisory')) return result([]);
    if (q.startsWith('DELETE FROM vcode_contacts.inquiries')) {
      const found = [];
      for (const [id, row] of this.rows) if (q.includes('WHERE id=') ? id === params[0] : row.expiresAt <= params[0]) {found.push({id}); this.rows.delete(id); this.outbox.delete(id);}
      return result(found);
    }
    if (q.startsWith('DELETE FROM vcode_contacts.outbox')) {for (const [id, row] of this.outbox) if (row.expires_at <= params[0]) this.outbox.delete(id); return result([]);}
    if (q.startsWith('SELECT id,payload_hash')) return result([...this.rows.values()].filter(row => row.request_id === params[0]).map(row => ({id: row.id, payload_hash: row.payload_hash})));
    if (q.startsWith('INSERT INTO vcode_contacts.inquiries')) {
      if (this.failInsert) throw new Error('Synthetic failure containing synthetic@example.invalid; must never reach client');
      const [id, request_id, payload_hash, locale, name, email, organization, area, application, message, privacy_version, createdAt, expiresAt] = params;
      this.rows.set(id, {id, request_id, payload_hash, locale, name, email, organization, area, application, message, privacy_version, createdAt, updatedAt: createdAt, expiresAt, status: 'new'});
      return result([]);
    }
    if (q.startsWith('INSERT INTO vcode_contacts.outbox')) {this.outbox.set(params[0], {inquiry_id: params[0], next_attempt_at: params[1], expires_at: params[2], lease_until: null, status: 'pending', attempts: 0}); return result([]);}
    if (q.startsWith('SELECT count(*)')) {
      const rows = [...this.rows.values()].filter(row => q.includes('expires_at') ? row.expiresAt > params[0] && row.createdAt >= params[1] && row.createdAt <= params[2] : row.createdAt >= params[0]);
      return result([{count: rows.length}]);
    }
    if (q.startsWith('SELECT status,count')) {
      if (q.includes('vcode_contacts.outbox')) {
        const counts = new Map(); for (const row of this.outbox.values()) if (row.expires_at > params[0]) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
        return result([...counts].map(([status, count]) => ({status, count})));
      }
      const counts = new Map(); for (const row of this.rows.values()) if (row.expiresAt > params[0]) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
      return result([...counts].map(([status, count]) => ({status, count})));
    }
    if (q.startsWith('SELECT area AS') || q.startsWith('SELECT application AS')) {
      const field = q.startsWith('SELECT area AS') ? 'area' : 'application', counts = new Map();
      for (const row of this.rows.values()) if (row.expiresAt > params[0] && row.createdAt >= params[1] && row.createdAt <= params[2] && row[field]) counts.set(row[field], (counts.get(row[field]) ?? 0) + 1);
      return result([...counts].map(([id, count]) => ({id, count})));
    }
    if (q.startsWith('SELECT id,created_at')) {
      return result([...this.rows.values()].filter(row => row.expiresAt > params[0] && (!params[1] || row.status === params[1])).sort((a, b) => b.createdAt - a.createdAt).slice(0, params[2]).map(({request_id, payload_hash, privacy_version, ...row}) => row));
    }
    if (q.startsWith('UPDATE vcode_contacts.inquiries')) {const row = this.rows.get(params[0]); if (!row || row.expiresAt <= params[2]) return result([]); row.status = params[1]; row.updatedAt = params[2]; return result([{id: row.id}]);}
    if (q.startsWith('SELECT o.inquiry_id')) {
      const job = [...this.outbox.values()].find(row => row.status === 'pending' && row.attempts < 6 && row.expires_at > params[0] && row.next_attempt_at <= params[0] && (!row.lease_until || row.lease_until <= params[0]));
      return result(job ? [{...job, area: this.rows.get(job.inquiry_id).area, application: this.rows.get(job.inquiry_id).application}] : []);
    }
    if (q.startsWith("UPDATE vcode_contacts.outbox SET status='failed'")) {for (const row of this.outbox.values()) if (row.status === 'pending' && row.attempts >= 6 && (!row.lease_until || row.lease_until <= params[0])) {row.status = 'failed'; row.lease_until = null;} return result([]);}
    if (q.startsWith('UPDATE vcode_contacts.outbox SET attempts=')) {const row = this.outbox.get(params[0]); row.attempts++; row.lease_until = params[1]; return result([]);}
    if (q.startsWith("UPDATE vcode_contacts.outbox SET status='sent'")) {const row = this.outbox.get(params[0]); row.status = 'sent'; row.lease_until = null; row.telegram_message_id = params[1]; return result([]);}
    if (q.startsWith('UPDATE vcode_contacts.outbox SET status=$2')) {const row = this.outbox.get(params[0]); row.status = params[1]; row.lease_until = null; row.next_attempt_at = params[2]; return result([]);}
    throw new Error('Unmodelled synthetic query: ' + q);
  }
}

async function fixture(overrides = {}) {
  let now = START; const pool = new Database(), sent = []; let failTelegram = false;
  const service = await createContactService({pool, config: {...config, ...overrides}, catalog, clock: () => now, fetchImpl: async (_, options) => {
    sent.push(JSON.parse(options.body)); return new Response(JSON.stringify(failTelegram ? {ok: false} : {ok: true, result: {message_id: 42}}), {status: failTelegram ? 503 : 200});
  }});
  const server = createServer(async (request, response) => {if (!(await service.handle(request, response))) response.writeHead(404).end();});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = async (path, {method = 'GET', data, headers = {}} = {}) => {
    const response = await fetch(base + path, {method, headers: {'Sec-Fetch-Site': 'same-origin', Origin: config.siteOrigin,
      'X-Real-IP': '192.0.2.22', ...(data === undefined ? {} : {'Content-Type': 'application/json'}), ...headers}, body: data === undefined ? undefined : typeof data === 'string' ? data : JSON.stringify(data)});
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return {status: response.status, value: await response.json()};
  };
  return {pool, service, sent, request, time: value => now = value, failTelegram: value => failTelegram = value,
    challenge: async () => (await request('/api/contact/challenge')).value,
    close: async () => {server.closeAllConnections(); await new Promise(resolve => server.close(resolve));}};
}

test('HMAC challenge is short lived, delayed, address-bound and carries no address; strict payload preserves safe text', () => {
  const challenge = issueContactChallenge(config.contactFormSecret, '192.0.2.22', START);
  assert.equal(validContactChallenge(challenge.token, config.contactFormSecret, '192.0.2.22', START + 1499), false);
  assert.equal(validContactChallenge(challenge.token, config.contactFormSecret, '192.0.2.22', START + 1500), true);
  assert.equal(validContactChallenge(challenge.token, config.contactFormSecret, '192.0.2.99', START + 1500), false);
  assert.equal(validContactChallenge(challenge.token, config.contactFormSecret, '192.0.2.22', START + 600001), false);
  assert.equal(validContactChallenge(challenge.token + 'x', config.contactFormSecret, '192.0.2.22', START + 1500), false);
  assert.ok(!Buffer.from(challenge.token.split('.')[0], 'base64url').toString().includes('192.0.2'));
  const value = input(); value.message = '<img src=x onerror="alert(1)"> is plain user text'; value.application = null;
  assert.equal(validateContactPayload(value, new Map(catalog.map(item => [item.id, item.name]))).message, value.message);
  for (const change of [{email: 'bad\r\naddress@example.invalid'}, {message: 'short'}, {name: 'a'.repeat(101)}, {organization: 'o'.repeat(161)}, {message: 'm'.repeat(4001)}, {message: '\ud800'.repeat(40)}, {application: 'internal-unpublished'}, {area: 'arbitrary'}, {privacyVersion: 'old'}, {unknown: true}]) {
    assert.throws(() => validateContactPayload({...input(), ...change}, new Map(catalog.map(item => [item.id, item.name]))), failure => failure.status === 400);
  }
});

test('public form enforces activation, origin, delayed token, honeypot, body bounds and durable receipt without AI', async () => {
  for (const override of [{contactEnabled: false}, {contactFormSecret: ''}, {contactInboxToken: ''}, {contactPrivacyVersion: ''}, {telegramBotToken: ''}]) {
    const f = await fixture(override); try {assert.equal((await f.challenge()).enabled, false); assert.equal((await f.request('/api/contact', {method: 'POST', data: input()})).status, 503); assert.equal(f.pool.rows.size, 0);} finally {await f.close();}
  }
  const f = await fixture(); try {
    assert.equal((await f.request('/api/contact/challenge', {headers: {Origin: 'https://foreign.invalid'}})).status, 403);
    assert.equal((await f.request('/api/contact/challenge', {headers: {'Sec-Fetch-Site': 'cross-site'}})).status, 403);
    const challenge = await f.challenge(), form = input(challenge.token);
    assert.equal((await f.request('/api/contact', {method: 'POST', data: form})).status, 403);
    f.time(START + 2000);
    assert.equal((await f.request('/api/contact', {method: 'POST', data: {...form, website: 'spam.invalid'}})).status, 403);
    assert.equal((await f.request('/api/contact', {method: 'POST', data: 'x'.repeat(17000)})).status, 413);
    const received = await f.request('/api/contact', {method: 'POST', data: form, headers: {DNT: '1', 'Sec-GPC': '1'}});
    assert.equal(received.status, 202); assert.equal(received.value.ok, true); assert.match(received.value.reference, /^[a-f0-9-]{36}$/);
    assert.equal(f.pool.rows.size, 1); assert.equal(f.pool.outbox.size, 1); assert.equal(f.sent.length, 0);
    assert.equal((await f.request('/api/contact', {method: 'POST', data: form})).value.reference, received.value.reference);
    assert.equal(f.pool.rows.size, 1); assert.equal(f.pool.outbox.size, 1);
    assert.equal((await f.request('/api/contact', {method: 'POST', data: {...form, message: form.message + ' changed'}})).status, 409);
    assert.ok(f.pool.calls.every(call => !JSON.stringify(call.params).includes('192.0.2.22')));
    f.time(START + 3600000); const next = await f.challenge(); f.time(START + 3602000); f.pool.failInsert = true;
    const failure = await f.request('/api/contact', {method: 'POST', data: input(next.token)});
    assert.equal(failure.status, 503); assert.deepEqual(failure.value, {ok: false, error: 'unavailable'}); assert.equal(f.pool.rows.size, 1);
  } finally {await f.close();}
});

test('private inbox requires its bearer token; period aggregates ignore list limits; status/delete and 90-day retention work', async () => {
  const f = await fixture(); try {
    const first = input((await f.challenge()).token); f.time(START + 2000);
    const receipt = await f.request('/api/contact', {method: 'POST', data: first}); assert.equal(receipt.status, 202);
    const second = {...first, requestId: randomUUID(), area: 'development', application: 'kaloricke-tabulky'};
    assert.equal((await f.request('/api/contact', {method: 'POST', data: second})).status, 202);
    assert.equal((await f.request('/internal/contacts')).status, 401);
    const headers = {Authorization: 'Bearer ' + config.contactInboxToken};
    const inbox = await f.request('/internal/contacts?limit=1&startAt=' + START + '&endAt=' + (START + 2000), {headers});
    assert.equal(inbox.status, 200); assert.equal(inbox.value.items.length, 1); assert.equal(inbox.value.summary.total, 2); assert.equal(inbox.value.interest.received, 2);
    assert.deepEqual(inbox.value.notifications, {pending: 2, sent: 0, failed: 0});
    assert.deepEqual(inbox.value.catalog, catalog); assert.ok(!JSON.stringify(inbox.value).includes('payload_hash'));
    const earlier = await f.request('/internal/contacts?startAt=' + (START - 10000) + '&endAt=' + (START - 1), {headers}); assert.equal(earlier.value.interest.received, 0);
    assert.equal((await f.request('/internal/contacts?limit=201', {headers})).status, 400);
    assert.equal((await f.request('/internal/contacts/' + receipt.value.reference, {method: 'PATCH', data: {status: 'read'}, headers})).status, 200);
    assert.equal(f.pool.rows.get(receipt.value.reference).status, 'read');
    assert.equal((await f.request('/internal/contacts/' + receipt.value.reference, {method: 'DELETE', headers})).status, 200); assert.equal(f.pool.outbox.size, 1);
    f.time(START + 91 * 86400000); await f.service.maintenance(); assert.equal(f.pool.rows.size, 0); assert.equal(f.pool.outbox.size, 0);
  } finally {await f.close();}
});

test('durable Telegram outbox uses no sender content and bounds retries; ephemeral rate limiting rejects excess attempts', async () => {
  const f = await fixture(); try {
    const form = input((await f.challenge()).token); f.time(START + 2000);
    const receipt = await f.request('/api/contact', {method: 'POST', data: form}); assert.equal(receipt.status, 202);
    f.failTelegram(true);
    for (let attempt = 0; attempt < 6; attempt++) {await f.service.maintenance(); const job = f.pool.outbox.get(receipt.value.reference); assert.equal(job.attempts, attempt + 1); f.time(job.next_attempt_at.getTime());}
    assert.equal(f.pool.outbox.get(receipt.value.reference).status, 'failed'); await f.service.maintenance(); assert.equal(f.sent.length, 6);
    const inbox = await f.request('/internal/contacts', {headers: {Authorization: 'Bearer ' + config.contactInboxToken}});
    assert.deepEqual(inbox.value.notifications, {pending: 0, sent: 0, failed: 1});
    for (const message of f.sent) {
      for (const forbidden of [form.name, form.email, form.message, config.contactFormSecret, config.contactInboxToken]) assert.ok(!JSON.stringify(message).includes(forbidden));
      assert.match(message.text, /https:\/\/example\.invalid\/prehled\/#inquiries/); assert.match(message.text, /VCode Recall/); assert.ok(!Object.hasOwn(message, 'parse_mode'));
    }
    for (let n = 0; n < 13; n++) {const challenge = await f.request('/api/contact/challenge'); assert.equal(challenge.status, n < 12 ? 200 : 429);}
  } finally {await f.close();}
});

test('notification success marks the durable job sent and never resends it', async () => {
  const f = await fixture(); try {
    const form = input((await f.challenge()).token); f.time(START + 2000);
    const receipt = await f.request('/api/contact', {method: 'POST', data: form});
    await f.service.maintenance(); await f.service.maintenance();
    assert.equal(f.sent.length, 1); const job = f.pool.outbox.get(receipt.value.reference); assert.equal(job.status, 'sent'); assert.equal(job.telegram_message_id, '42');
    const inbox = await f.request('/internal/contacts', {headers: {Authorization: 'Bearer ' + config.contactInboxToken}});
    assert.deepEqual(inbox.value.notifications, {pending: 0, sent: 1, failed: 0});
  } finally {await f.close();}
});

test('optional contact file secrets fail closed without breaking worker config or accepting plaintext fallback', () => {
  const source = "import {loadConfig} from './services/blog/config.mjs'; const c=await loadConfig(); console.log(JSON.stringify({enabled:c.contactEnabled,form:c.contactFormSecret,inbox:c.contactInboxToken,privacy:c.contactPrivacyVersion,generation:c.generationEnabled}));";
  const defaults = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', source], {env: {}, encoding: 'utf8'}));
  assert.deepEqual(defaults, {enabled: false, form: '', inbox: '', privacy: '', generation: false});
  const missing = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', source], {env: {
    CONTACT_FORM_ENABLED: 'true', CONTACT_FORM_PRIVACY_VERSION: 'contact-20261009',
    CONTACT_FORM_SECRET_FILE: '/nonexistent-vcode-test/form', CONTACT_INBOX_TOKEN_FILE: '/nonexistent-vcode-test/inbox',
    CONTACT_FORM_SECRET: 'this-plaintext-must-not-be-used', CONTACT_INBOX_TOKEN: 'nor-this-plaintext',
  }, encoding: 'utf8'}));
  assert.equal(missing.enabled, true); assert.equal(missing.form, ''); assert.equal(missing.inbox, ''); assert.equal(missing.generation, false);
});
