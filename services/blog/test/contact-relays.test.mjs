import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHash, randomUUID} from 'node:crypto';
import {chmod, mkdtemp, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CONTACT_PRIVACY_VERSION, validateContactPayload} from '../contacts.mjs';
import {CONTACT_RELAY_PRIVACY_VERSION, createContactRelayService} from '../contact-relays.mjs';

const START = Date.parse('2026-10-09T12:00:00.000Z');
const CHALLENGE = '/internal/contact-relays/v1/challenge', SUBMISSIONS = '/internal/contact-relays/v1/submissions';
const KEY_A = 'synthetic_mestem_hrou_credential_only_32chars';
const KEY_B = 'synthetic_second_application_only_32chars';
const INBOX = 'synthetic_inbox_credential_must_not_authorize_32chars';
const ORIGIN = 'https://mestemhrou.example.invalid', SECOND_ORIGIN = 'https://second.example.invalid';
const catalog = new Map([['mestem-hrou', 'Městem hrou'], ['second-app', 'Second application']]);
const config = {contactRelayEnabled: true, contactPrivacyVersion: CONTACT_PRIVACY_VERSION, contactInboxToken: INBOX,
  contactFormSecret: 'synthetic_form_secret_only_32_chars', partnershipChallengeSecret: 'synthetic_partnership_secret_only_32_chars',
  telegramEnabled: true, telegramBotToken: 'synthetic-bot', telegramChatId: 'synthetic-chat'};
const input = token => ({token, requestId: randomUUID(), locale: 'cs', name: 'Syntetická osoba', email: 'synthetic@example.invalid',
  organization: null, message: 'Pouze syntetická zpráva pro izolované ověření v aplikaci.', website: '', privacyVersion: CONTACT_PRIVACY_VERSION});

async function fixture(overrides = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'vcode-contact-relay-test-')); await chmod(directory, 0o700);
  const path = join(directory, 'registry.json'), keyAPath = join(directory, 'app-a.key'), keyBPath = join(directory, 'app-b.key');
  await writeFile(keyAPath, KEY_A + '\n', {mode: 0o600}); await writeFile(keyBPath, KEY_B + '\n', {mode: 0o600});
  let now = START;
  let entries = [{id: 'mestem-hrou', origin: ORIGIN, application: 'mestem-hrou', area: 'partnership', enabled: true,
    privacyVersion: CONTACT_PRIVACY_VERSION, approvedAt: '2026-10-09T10:00:00Z', publishedAt: '2026-10-09T11:00:00Z', keyFile: keyAPath},
  {id: 'second-app', origin: SECOND_ORIGIN, application: 'second-app', area: 'partnership', enabled: true,
    privacyVersion: CONTACT_PRIVACY_VERSION, approvedAt: '2026-10-09T10:00:00Z', publishedAt: '2026-10-09T11:00:00Z', keyFile: keyBPath}];
  const update = async mutate => {entries = mutate(structuredClone(entries)); await writeFile(path, JSON.stringify(entries), {mode: 0o600});};
  await update(value => value);
  const rows = new Map(), calls = [];
  let failSave = false;
  const save = async (payload, options) => {
    calls.push({payload: structuredClone(payload), options: structuredClone(options)});
    if (failSave) throw new Error('Synthetic storage error containing synthetic@example.invalid and ' + KEY_A);
    const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex'), existing = rows.get(payload.requestId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw Object.assign(new Error('conflict'), {status: 409, code: 'idempotency-conflict'});
      return existing.reference;
    }
    if (options.lookupOnly) return null;
    const reference = randomUUID(); rows.set(payload.requestId, {reference, fingerprint}); return reference;
  };
  const runtime = {...config, contactRelayRegistryFile: path, ...overrides};
  const service = createContactRelayService({config: runtime, catalog, save, validatePayload: validateContactPayload, clock: () => now});
  const server = createServer(async (request, response) => {
    if (!(await service.handle(request, response))) response.writeHead(404, {'Content-Type': 'application/json'}).end(JSON.stringify({fallback: true}));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = async (route, {method = 'GET', data, headers = {}} = {}) => {
    const response = await fetch(base + route, {method, headers: {Authorization: 'Bearer ' + KEY_A, Origin: ORIGIN,
      'Sec-Fetch-Site': 'same-origin', 'X-Real-IP': '192.0.2.22', ...(data === undefined ? {} : {'Content-Type': 'application/json'}), ...headers},
    body: data === undefined ? undefined : typeof data === 'string' || data instanceof Uint8Array ? data : JSON.stringify(data)});
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    const value = await response.json();
    if (!value.fallback) assert.equal(response.headers.get('cache-control'), 'no-store');
    return {status: response.status, value, headers: response.headers};
  };
  return {directory, path, keyAPath, keyBPath, runtime, rows, calls, request, update,
    time: value => now = value, failSave: value => failSave = value,
    challenge: async options => (await request(CHALLENGE, options)).value,
    close: async () => {server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(directory, {recursive: true, force: true});}};
}

test('per-app relay uses the existing contact payload and supports only exact delayed idempotent retries', async () => {
  assert.equal(CONTACT_RELAY_PRIVACY_VERSION, CONTACT_PRIVACY_VERSION);
  const f = await fixture(); try {
    const challenge = await f.challenge(), submission = input(challenge.token);
    assert.deepEqual(Object.keys(challenge).sort(), ['enabled', 'expiresAt', 'minimumDelayMs', 'privacyVersion', 'token']);
    assert.equal(challenge.enabled, true); assert.equal(challenge.minimumDelayMs, 1500);
    assert.equal(challenge.expiresAt, new Date(START + 600000).toISOString());
    const tokenData = Buffer.from(challenge.token.split('.')[0], 'base64url').toString();
    for (const privateValue of ['192.0.2.22', KEY_A, INBOX, submission.email]) assert.ok(!tokenData.includes(privateValue));
    f.time(START + 1499);
    assert.deepEqual((await f.request(SUBMISSIONS, {method: 'POST', data: submission})).value, {ok: false, error: 'rejected'});
    assert.equal(f.calls.length, 0);
    f.time(START + 1500);
    const accepted = await f.request(SUBMISSIONS, {method: 'POST', data: submission});
    assert.equal(accepted.status, 202); assert.deepEqual(Object.keys(accepted.value).sort(), ['ok', 'reference']);
    assert.equal(f.rows.size, 1); assert.equal(f.calls[0].payload.application, 'mestem-hrou'); assert.equal(f.calls[0].payload.area, 'partnership');
    assert.deepEqual(f.calls[0].options, {lookupOnly: false});
    for (const forbidden of ['192.0.2.22', KEY_A, INBOX, challenge.token, ORIGIN]) assert.ok(!JSON.stringify(f.calls).includes(forbidden));
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission})).value.reference, accepted.value.reference);
    f.time(START + 600001);
    const retry = await f.request(SUBMISSIONS, {method: 'POST', data: submission});
    assert.equal(retry.status, 202); assert.equal(retry.value.reference, accepted.value.reference); assert.equal(f.rows.size, 1);
    assert.deepEqual(f.calls.at(-1).options, {lookupOnly: true});
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: {...submission, message: submission.message + ' changed'}})).status, 409);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: {...submission, requestId: randomUUID()}})).status, 403);
    f.rows.clear();
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission})).status, 403); assert.equal(f.rows.size, 0);
  } finally {await f.close();}
});

test('relay rejects foreign origins, IPs, browser sessions, administrator tokens and cross-app challenges', async () => {
  const f = await fixture(); try {
    const challenge = await f.challenge(), submission = input(challenge.token); f.time(START + 2000);
    for (const [headers, expected] of [[{Origin: SECOND_ORIGIN}, 403], [{Origin: ''}, 403], [{'Sec-Fetch-Site': 'cross-site'}, 403],
      [{'Sec-Fetch-Site': ''}, 403], [{Cookie: 'synthetic=session'}, 403], [{'X-VCode-Admin-Id': randomUUID()}, 403],
      [{'Proxy-Authorization': 'Bearer synthetic'}, 403], [{'X-Real-IP': ''}, 403], [{'X-Real-IP': 'invalid, 192.0.2.22'}, 403],
      [{Authorization: 'Bearer ' + INBOX}, 401], [{Authorization: 'Bearer ' + config.contactFormSecret}, 401],
      [{Authorization: 'Bearer ' + config.partnershipChallengeSecret}, 401], [{Authorization: ''}, 401]]) {
      assert.equal((await f.request(CHALLENGE, {headers})).status, expected);
    }
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission, headers: {'X-Real-IP': '192.0.2.99'}})).status, 403);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission,
      headers: {Authorization: 'Bearer ' + KEY_B, Origin: SECOND_ORIGIN}})).status, 403);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: {...submission, token: challenge.token + 'x'}})).status, 403);
    f.time(START - 1);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission})).status, 403);
    assert.equal(f.calls.length, 0);
  } finally {await f.close();}
});

test('activation, publication, key rotation and revocation are read afresh on every request', async () => {
  const f = await fixture(); try {
    const challenge = await f.challenge(), submission = input(challenge.token); f.time(START + 2000);
    await f.update(entries => entries.map(entry => ({...entry, enabled: false, approvedAt: null, publishedAt: null})));
    assert.deepEqual(await f.challenge(), {enabled: false, privacyVersion: CONTACT_PRIVACY_VERSION});
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission})).status, 503); assert.equal(f.calls.length, 0);
    await f.update(entries => entries.map(entry => ({...entry, enabled: true, approvedAt: '2026-10-09T10:00:00Z', publishedAt: null})));
    assert.equal((await f.request(CHALLENGE)).status, 503);
    await f.update(entries => entries.map(entry => ({...entry, publishedAt: '2026-10-09T11:00:00Z'})));
    const newKey = 'synthetic_rotated_new_key_independent_32chars';
    await writeFile(f.keyAPath, newKey, {mode: 0o600});
    assert.equal((await f.request(CHALLENGE)).status, 401);
    assert.equal((await f.request(CHALLENGE, {headers: {Authorization: 'Bearer ' + newKey}})).status, 200);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: submission, headers: {Authorization: 'Bearer ' + newKey}})).status, 403);
    assert.equal(f.calls.length, 0);
  } finally {await f.close();}
  for (const overrides of [{contactRelayEnabled: false}, {contactInboxToken: ''}, {telegramEnabled: false}, {telegramBotToken: ''},
    {telegramChatId: ''}, {contactPrivacyVersion: 'old'}]) {
    const f = await fixture(overrides); try {assert.equal((await f.challenge()).enabled, false);} finally {await f.close();}
  }
});

test('private registry and key permissions, symlinks, duplicate credentials and finite bindings fail closed', async () => {
  const f = await fixture(); try {
    await chmod(f.path, 0o644); assert.equal((await f.request(CHALLENGE)).status, 503); await chmod(f.path, 0o600);
    await chmod(f.keyAPath, 0o640); assert.equal((await f.request(CHALLENGE)).status, 503); await chmod(f.keyAPath, 0o600);
    const link = join(f.directory, 'linked.key'); await symlink(f.keyAPath, link);
    await f.update(entries => entries.map((entry, index) => index === 0 ? {...entry, keyFile: link} : entry));
    assert.equal((await f.request(CHALLENGE)).status, 503);
    await f.update(entries => entries.map((entry, index) => index === 0 ? {...entry, keyFile: f.keyAPath} : entry));
    await writeFile(f.keyBPath, KEY_A, {mode: 0o600}); assert.equal((await f.request(CHALLENGE)).status, 503);
    await writeFile(f.keyBPath, KEY_B, {mode: 0o600}); await writeFile(f.keyAPath, INBOX, {mode: 0o600});
    assert.equal((await f.request(CHALLENGE, {headers: {Authorization: 'Bearer ' + INBOX}})).status, 503);
    await writeFile(f.keyAPath, KEY_A, {mode: 0o600});
    for (const changed of [{origin: ORIGIN + '/'}, {origin: 'http://mestemhrou.example.invalid'}, {origin: 'https://*.example.invalid'},
      {application: 'not-public'}, {area: 'development'}, {privacyVersion: 'old'}, {extra: true}, {publishedAt: '2027-10-09T11:00:00Z'}]) {
      await f.update(entries => entries.map((entry, index) => index === 0 ? {...entry, ...changed} : entry));
      assert.equal((await f.request(CHALLENGE)).status, 503);
      await f.update(entries => entries.map((entry, index) => index === 0 ? {id: 'mestem-hrou', origin: ORIGIN, application: 'mestem-hrou',
        area: 'partnership', enabled: true, privacyVersion: CONTACT_PRIVACY_VERSION, approvedAt: '2026-10-09T10:00:00Z',
        publishedAt: '2026-10-09T11:00:00Z', keyFile: f.keyAPath} : entry));
    }
    assert.equal(f.calls.length, 0);
  } finally {await f.close();}
});

test('relay accepts only bounded strict UTF-8 contact JSON and never lets a client set application, area or source', async () => {
  const f = await fixture(); try {
    const value = input((await f.challenge()).token); f.time(START + 2000);
    for (const changed of [{application: 'second-app'}, {area: 'other'}, {source: 'private-source'}, {name: 'x'}, {message: 'short'},
      {email: 'bad\r\nmail@example.invalid'}, {requestId: 'invalid'}, {privacyVersion: 'old'}, {organization: 'o'.repeat(161)}, {locale: 'xx'}]) {
      assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: {...value, ...changed}})).status, 400);
    }
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: {...value, website: 'spam.invalid'}})).status, 403);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: Buffer.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d])})).status, 400);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: 'x'.repeat(17000)})).status, 413);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: value, headers: {'Content-Encoding': 'gzip'}})).status, 415);
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: value, headers: {'Content-Type': 'text/plain'}})).status, 415);
    assert.equal(f.calls.length, 0);
    const minimal = {...value}; delete minimal.organization;
    assert.equal((await f.request(SUBMISSIONS, {method: 'POST', data: minimal})).status, 202);
    assert.equal(f.calls[0].payload.organization, null);
  } finally {await f.close();}
});

test('relay only owns exact private paths and never exposes raw failures or CORS', async () => {
  const f = await fixture(); try {
    for (const [route, method, expected] of [[CHALLENGE + '?', 'GET', 400], [CHALLENGE + '?app=mestem-hrou', 'GET', 400],
      [CHALLENGE + '/', 'GET', 404], ['/internal/contact-relays/v1/admin', 'GET', 404], [CHALLENGE, 'OPTIONS', 405],
      [CHALLENGE, 'POST', 405], [SUBMISSIONS, 'GET', 405]]) assert.equal((await f.request(route, {method})).status, expected);
    for (const route of ['/api/contact', '/api/partner-contact/challenge', '/internal/contacts']) assert.equal((await f.request(route)).value.fallback, true);
    const value = input((await f.challenge()).token); f.time(START + 2000); f.failSave(true);
    const result = await f.request(SUBMISSIONS, {method: 'POST', data: value});
    assert.equal(result.status, 503); assert.deepEqual(result.value, {ok: false, error: 'unavailable'});
    assert.equal(result.headers.get('retry-after'), '60');
    assert.equal(result.headers.get('content-security-policy'), "default-src 'none'; frame-ancestors 'none'");
  } finally {await f.close();}
});

test('ephemeral limits enforce address, application and global budgets across registered applications', async () => {
  const f = await fixture(); try {
    for (let index = 0; index < 13; index++) {
      const result = await f.request(CHALLENGE); assert.equal(result.status, index < 12 ? 200 : 429);
      if (index === 12) assert.equal(result.headers.get('retry-after'), '3600');
    }
    f.time(START + 600001);
    for (let index = 0; index < 120; index++) assert.equal((await f.request(CHALLENGE,
      {headers: {'X-Real-IP': `192.0.2.${index + 1}`}})).status, 200);
    assert.equal((await f.request(CHALLENGE, {headers: {Authorization: 'Bearer ' + KEY_B, Origin: SECOND_ORIGIN, 'X-Real-IP': '2001:db8::22'}})).status, 429);
    f.time(START + 1200002);
    assert.equal((await f.request(CHALLENGE, {headers: {Authorization: 'Bearer ' + KEY_B, Origin: SECOND_ORIGIN, 'X-Real-IP': '2001:db8::22'}})).status, 200);
    assert.equal(f.calls.length, 0);
  } finally {await f.close();}
});
