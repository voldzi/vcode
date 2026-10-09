import {createHmac, randomBytes, timingSafeEqual} from 'node:crypto';
import {constants} from 'node:fs';
import {open} from 'node:fs/promises';
import {isIP} from 'node:net';
import {isAbsolute} from 'node:path';

export const CONTACT_RELAY_PRIVACY_VERSION = 'contact-20261009';
const CONTACT_PRIVACY_VERSION = CONTACT_RELAY_PRIVACY_VERSION;

const PREFIX = '/internal/contact-relays';
const CHALLENGE_PATH = `${PREFIX}/v1/challenge`, SUBMIT_PATH = `${PREFIX}/v1/submissions`;
const TTL = 600000, MIN_DELAY = 1500, MAX_BODY = 16384;
const KEY = /^[A-Za-z0-9_-]{32,256}$/, ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const ERROR_STATUS = {'invalid-input': 400, unauthorized: 401, 'origin-not-allowed': 403, rejected: 403,
  'not-found': 404, 'method-not-allowed': 405, 'idempotency-conflict': 409, 'too-large': 413,
  'invalid-content-type': 415, 'rate-limit': 429, unavailable: 503};
const failure = (status, code) => Object.assign(new Error(code), {status, code});
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const exact = (value, required, optional = []) => plain(value) && required.every(key => Object.hasOwn(value, key))
  && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
const equal = (left, right) => {
  const a = Buffer.from(String(left ?? '')), b = Buffer.from(String(right ?? ''));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
};
const hmac = (secret, purpose, value) => createHmac('sha256', secret).update(purpose + ':' + value).digest('base64url');
const json = (res, status, value, headers = {}) => {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", ...headers});
  res.end(JSON.stringify(value));
};

// Read private operator files afresh. Bound the actual read, not just the stat,
// and reject symlink leaves and group/world-readable or writable credentials.
async function privateFile(path, maximum) {
  let file;
  try {
    if (typeof path !== 'string' || !isAbsolute(path)) return null;
    file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const stat = await file.stat();
    if (!stat.isFile() || (stat.mode & 0o777) !== 0o600 || stat.size < 1 || stat.size > maximum) return null;
    const buffer = Buffer.alloc(maximum + 1);
    let size = 0;
    while (size <= maximum) {
      const {bytesRead} = await file.read(buffer, size, buffer.length - size, null);
      if (!bytesRead) break;
      size += bytesRead;
    }
    if (size > maximum) return null;
    return new TextDecoder('utf-8', {fatal: true}).decode(buffer.subarray(0, size));
  } catch {return null;} finally {await file?.close();}
}

const publicOrigin = raw => {
  if (typeof raw !== 'string' || raw.length > 253) return false;
  try {
    const value = new URL(raw);
    return value.protocol === 'https:' && value.origin === raw && !value.username && !value.password
      && /^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/.test(value.hostname);
  } catch {return false;}
};
const approval = (raw, now) => {
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(raw)) return false;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) && parsed <= now && (new Date(parsed).toISOString() === raw || new Date(parsed).toISOString().replace('.000Z', 'Z') === raw);
};

async function registry(config, catalog, now) {
  try {
    const source = await privateFile(config.contactRelayRegistryFile, 65536);
    if (source === null) return null;
    const entries = JSON.parse(source);
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 100) return null;
    const ids = new Set(), origins = new Set(), applications = new Set();
    const keys = new Set([config.contactInboxToken, config.contactFormSecret, config.partnershipChallengeSecret].filter(Boolean));
    const result = [];
    for (const item of entries) {
      if (!exact(item, ['id', 'origin', 'application', 'area', 'enabled', 'privacyVersion', 'approvedAt', 'publishedAt', 'keyFile'])
          || typeof item.id !== 'string' || item.id.length > 100 || !ID.test(item.id) || ids.has(item.id)
          || !publicOrigin(item.origin) || origins.has(item.origin) || !catalog.has(item.application) || applications.has(item.application)
          || item.area !== 'partnership' || typeof item.enabled !== 'boolean' || item.privacyVersion !== CONTACT_PRIVACY_VERSION
          || typeof item.keyFile !== 'string' || !isAbsolute(item.keyFile)) return null;
      if (item.enabled ? !approval(item.approvedAt, now) || !approval(item.publishedAt, now)
        : (![null, ''].includes(item.approvedAt) && !approval(item.approvedAt, now)) || (![null, ''].includes(item.publishedAt) && !approval(item.publishedAt, now))) return null;
      const key = (await privateFile(item.keyFile, 512))?.trim() ?? '';
      if (item.enabled && !KEY.test(key) || key && (!KEY.test(key) || keys.has(key))) return null;
      ids.add(item.id); origins.add(item.origin); applications.add(item.application); if (key) keys.add(key);
      result.push({...item, key});
    }
    return result;
  } catch {return null;}
}

function clientAddress(request) {
  const address = request.headers['x-real-ip'];
  if (typeof address !== 'string' || address.length > 128 || !isIP(address)) throw failure(403, 'rejected');
  return address;
}
function browserContext(request, app) {
  // Only the owned relay Bearer is meaningful here; no administrator identity
  // or browser session may be forwarded into the contact ingestion boundary.
  if (Object.keys(request.headers).some(name => name === 'cookie' || name === 'proxy-authorization' || name.startsWith('x-vcode-')
      || name === 'x-admin-id' || name === 'x-admin-token')) throw failure(403, 'rejected');
  if (request.headers.origin !== app.origin || request.headers['sec-fetch-site'] !== 'same-origin') throw failure(403, 'origin-not-allowed');
}
function authenticate(request, entries) {
  const header = request.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ') || !KEY.test(header.slice(7))) throw failure(401, 'unauthorized');
  const app = entries.find(entry => entry.key && equal(entry.key, header.slice(7)));
  if (!app) throw failure(401, 'unauthorized');
  browserContext(request, app);
  return app;
}

const tokenSecret = app => hmac(app.key, 'vcode-contact-relay-key-v1', app.id);
const signature = (app, value, address) => hmac(tokenSecret(app), 'vcode-contact-relay-challenge-v1', JSON.stringify([value, address]));
function challenge(app, address, now) {
  const raw = Buffer.from(JSON.stringify({id: app.id, origin: app.origin, application: app.application, area: app.area,
    privacyVersion: app.privacyVersion, issuedAt: now, nonce: randomBytes(16).toString('base64url')})).toString('base64url');
  return {enabled: true, token: raw + '.' + signature(app, raw, address), minimumDelayMs: MIN_DELAY,
    expiresAt: new Date(now + TTL).toISOString(), privacyVersion: CONTACT_PRIVACY_VERSION};
}
function authenticatedChallenge(token, app, address) {
  if (typeof token !== 'string' || token.length > 1024) return null;
  const [raw, signed, extra] = token.split('.');
  if (!raw || !/^[A-Za-z0-9_-]+$/.test(raw) || !/^[A-Za-z0-9_-]{43}$/.test(signed ?? '') || extra
      || !equal(signed, signature(app, raw, address))) return null;
  try {
    const value = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(Buffer.from(raw, 'base64url')));
    if (!exact(value, ['id', 'origin', 'application', 'area', 'privacyVersion', 'issuedAt', 'nonce'])
        || value.id !== app.id || value.origin !== app.origin || value.application !== app.application || value.area !== app.area
        || value.privacyVersion !== app.privacyVersion || !Number.isSafeInteger(value.issuedAt) || value.issuedAt < 0
        || typeof value.nonce !== 'string' || !/^[A-Za-z0-9_-]{22}$/.test(value.nonce)) return null;
    return value;
  } catch {return null;}
}
async function body(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(String(request.headers['content-type'] ?? ''))
      || request.headers['content-encoding'] && request.headers['content-encoding'] !== 'identity') throw failure(415, 'invalid-content-type');
  const declared = request.headers['content-length'];
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY)) throw failure(413, 'too-large');
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw failure(413, 'too-large');
    chunks.push(chunk);
  }
  try {return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(Buffer.concat(chunks)));}
  catch {throw failure(400, 'invalid-input');}
}

export function createContactRelayService({config, catalog, save, validatePayload, clock = () => Date.now()}) {
  const applications = new Map();
  const items = catalog instanceof Map ? [...catalog].map(([id, name]) => ({id, name})) : catalog;
  if (Array.isArray(items) && items.length > 0 && items.length <= 100) for (const item of items) {
    if (!exact(item, ['id', 'name']) || typeof item.id !== 'string' || item.id.length > 100 || !ID.test(item.id)
        || typeof item.name !== 'string' || !item.name.isWellFormed() || [...item.name].length < 1 || [...item.name].length > 100
        || applications.has(item.id)) {applications.clear(); break;}
    applications.set(item.id, item.name);
  }
  const ready = () => config.contactRelayEnabled === true && applications.size > 0 && typeof save === 'function' && typeof validatePayload === 'function'
    && typeof config.contactInboxToken === 'string' && config.contactInboxToken.length >= 32
    && config.contactPrivacyVersion === CONTACT_PRIVACY_VERSION && config.telegramEnabled && config.telegramBotToken && config.telegramChatId;
  const counters = new Map(), rateSecret = randomBytes(32);
  function limit(kind, app, address) {
    const now = clock(), window = kind === 'challenge' ? TTL : 3600000;
    for (const [key, value] of counters) if (value.until <= now) counters.delete(key);
    const hashed = hmac(rateSecret, 'vcode-contact-relay-rate-v1', JSON.stringify([app.id, Math.floor(now / window), address]));
    const checks = [[`${kind}:${app.id}:${hashed}`, kind === 'challenge' ? 12 : 8],
      [`${kind}:${app.id}`, kind === 'challenge' ? 120 : 60], [`${kind}:global`, kind === 'challenge' ? 120 : 60]];
    if (counters.size + checks.filter(([key]) => !counters.has(key)).length > 5000) throw failure(429, 'rate-limit');
    for (const [key, maximum] of checks) {
      let value = counters.get(key);
      if (!value) {value = {count: 0, until: now + window}; counters.set(key, value);}
      if (++value.count > maximum) throw failure(429, 'rate-limit');
    }
  }

  async function handle(request, res) {
    const raw = request.url ?? '';
    if (typeof raw !== 'string' || !raw.startsWith(PREFIX)) return false;
    try {
      let url;
      try {url = new URL(raw, 'https://example.invalid');} catch {throw failure(400, 'invalid-input');}
      if (![CHALLENGE_PATH, SUBMIT_PATH].includes(url.pathname) || url.pathname.includes('%')) throw failure(404, 'not-found');
      if (raw.includes('?') || url.hash) throw failure(400, 'invalid-input');
      if (request.method !== (url.pathname === CHALLENGE_PATH ? 'GET' : 'POST')) throw failure(405, 'method-not-allowed');
      let entries = await registry(config, applications, clock());
      if (!entries) throw failure(503, 'unavailable');
      let app = authenticate(request, entries);
      const address = clientAddress(request);
      if (!ready() || !app.enabled) {
        if (request.method === 'GET') {json(res, 200, {enabled: false, privacyVersion: CONTACT_PRIVACY_VERSION}); return true;}
        throw failure(503, 'unavailable');
      }
      if (request.method === 'GET') {
        if (request.headers['content-length'] && request.headers['content-length'] !== '0' || request.headers['transfer-encoding']) throw failure(400, 'invalid-input');
        limit('challenge', app, address);
        json(res, 200, challenge(app, address, clock())); return true;
      }
      const input = await body(request);
      // Re-read activation and credentials after the potentially slow body read.
      entries = await registry(config, applications, clock());
      if (!entries) throw failure(503, 'unavailable');
      app = authenticate(request, entries);
      if (!ready() || !app.enabled) throw failure(503, 'unavailable');
      if (!exact(input, ['token', 'requestId', 'locale', 'name', 'email', 'message', 'website', 'privacyVersion'], ['organization'])) throw failure(400, 'invalid-input');
      const payload = validatePayload({...input, application: app.application, area: app.area}, applications);
      limit('submit', app, address);
      const token = authenticatedChallenge(input.token, app, address), now = clock();
      if (!token || now - token.issuedAt < MIN_DELAY) throw failure(403, 'rejected');
      // An expired but authentic token can retrieve the original receipt only.
      // The shared store must not insert or create outbox work for lookupOnly.
      const reference = await save(payload, {lookupOnly: now - token.issuedAt > TTL});
      if (reference === null) throw failure(403, 'rejected');
      if (typeof reference !== 'string' || !UUID.test(reference)) throw failure(503, 'unavailable');
      json(res, 202, {ok: true, reference}); return true;
    } catch (caught) {
      const code = Object.hasOwn(ERROR_STATUS, caught?.code) && ERROR_STATUS[caught.code] === caught.status ? caught.code : 'unavailable';
      const status = ERROR_STATUS[code], headers = status === 429 ? {'Retry-After': '3600'} : status === 503 ? {'Retry-After': '60'} : {};
      if (!res.headersSent) json(res, status, {ok: false, error: code}, headers);
      request.resume?.(); return true;
    }
  }
  return {handle};
}
