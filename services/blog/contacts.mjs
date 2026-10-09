import {createHash, createHmac, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {telegramCall} from './telegram.mjs';
import {createContactRelayService} from './contact-relays.mjs';

export const CONTACT_PRIVACY_VERSION = 'contact-20261009';
const TTL = 90 * 86400000, CHALLENGE_TTL = 600000, MIN_DELAY = 1500, MAX_BODY = 16384;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const AREAS = ['development', 'partnership', 'private-deployment', 'other'];
const STATUSES = ['new', 'read', 'closed'];
const AREA_NAMES = {development: 'Vývoj', partnership: 'Spolupráce', 'private-deployment': 'Soukromé nasazení', other: 'Jiné'};
const retryDelays = [60000, 300000, 1800000, 7200000, 43200000];
const error = (status, code) => Object.assign(new Error(code), {status, code});
const equal = (left, right) => {
  const a = Buffer.from(String(left ?? '')), b = Buffer.from(String(right ?? ''));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
};
const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('base64url');
const client = request => String(request.headers['x-real-ip'] ?? request.socket.remoteAddress ?? 'unknown').slice(0, 128);
const json = (res, status, body, headers = {}) => {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", ...headers});
  res.end(JSON.stringify(body));
};
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const length = value => [...value].length;
const normalized = (value, minimum, maximum, multiline = false) => {
  if (typeof value !== 'string') throw error(400, 'invalid-input');
  const text = value.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if (!text.isWellFormed() || length(text) < minimum || length(text) > maximum || (multiline ? /[\x00-\x08\x0b-\x1f\x7f]/ : /[\x00-\x1f\x7f]/).test(text)) throw error(400, 'invalid-input');
  return text;
};

export function validateContactPayload(input, catalog) {
  const required = ['token', 'requestId', 'locale', 'name', 'email', 'area', 'message', 'website', 'privacyVersion'];
  const allowed = [...required, 'organization', 'application'];
  if (!plain(input) || !required.every(key => Object.hasOwn(input, key)) || Object.keys(input).some(key => !allowed.includes(key))
      || typeof input.token !== 'string' || input.token.length > 1024 || typeof input.requestId !== 'string' || !UUID.test(input.requestId)
      || !['cs', 'en'].includes(input.locale) || !AREAS.includes(input.area) || input.privacyVersion !== CONTACT_PRIVACY_VERSION) throw error(400, 'invalid-input');
  if (typeof input.website !== 'string' || input.website !== '') throw error(403, 'rejected');
  const name = normalized(input.name, 2, 100), email = normalized(input.email, 3, 254).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw error(400, 'invalid-input');
  const organization = input.organization == null ? null : normalized(input.organization, 0, 160) || null;
  const application = input.application == null ? null : normalized(input.application, 0, 100) || null;
  if (application && !catalog.has(application)) throw error(400, 'invalid-input');
  return {requestId: input.requestId.toLowerCase(), locale: input.locale, name, email, organization,
    area: input.area, application, message: normalized(input.message, 30, 4000, true), privacyVersion: CONTACT_PRIVACY_VERSION};
}

export function issueContactChallenge(secret, address, now = Date.now()) {
  const value = Buffer.from(JSON.stringify({issuedAt: now, nonce: randomBytes(16).toString('base64url'), privacyVersion: CONTACT_PRIVACY_VERSION})).toString('base64url');
  return {enabled: true, token: `${value}.${sign(value + ':' + address, secret)}`, minimumDelayMs: MIN_DELAY,
    expiresAt: new Date(now + CHALLENGE_TTL).toISOString(), privacyVersion: CONTACT_PRIVACY_VERSION};
}
export function validContactChallenge(token, secret, address, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 1024) return false;
  const [value, signature, extra] = token.split('.');
  if (!value || !signature || extra || !equal(signature, sign(value + ':' + address, secret))) return false;
  try {
    const data = JSON.parse(Buffer.from(value, 'base64url'));
    return plain(data) && Object.keys(data).sort().join(',') === 'issuedAt,nonce,privacyVersion'
      && Number.isSafeInteger(data.issuedAt) && /^[A-Za-z0-9_-]{22}$/.test(data.nonce)
      && data.privacyVersion === CONTACT_PRIVACY_VERSION && now - data.issuedAt >= MIN_DELAY && now - data.issuedAt <= CHALLENGE_TTL;
  } catch { return false; }
}

async function body(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(String(request.headers['content-type'] ?? ''))
      || (request.headers['content-encoding'] && request.headers['content-encoding'] !== 'identity')) throw error(415, 'invalid-content-type');
  if (request.headers['content-length'] && (!/^\d+$/.test(request.headers['content-length']) || Number(request.headers['content-length']) > MAX_BODY)) throw error(413, 'too-large');
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > MAX_BODY) throw error(413, 'too-large'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw error(400, 'invalid-input'); }
}

export async function createContactService({pool, config, catalog, clock = () => Date.now(), fetchImpl = fetch}) {
  if (!catalog) { try {catalog = JSON.parse(await readFile(new URL('./contact-catalog.json', import.meta.url), 'utf8'));} catch {catalog = [];} }
  const applications = new Map();
  if (Array.isArray(catalog) && catalog.length <= 100) for (const item of catalog) {
    if (!plain(item) || typeof item.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || item.id.length > 100
        || typeof item.name !== 'string' || !item.name.isWellFormed() || length(item.name) < 1 || length(item.name) > 100 || applications.has(item.id)) {applications.clear(); break;}
    applications.set(item.id, item.name);
  }
  let origin;
  try {
    const value = new URL(config.siteOrigin);
    origin = value.protocol === 'https:' || (value.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(value.hostname)) ? value.origin : null;
  } catch {origin = null;}
  const inboxReady = typeof config.contactInboxToken === 'string' && config.contactInboxToken.length >= 32;
  const notificationReady = () => Boolean(config.telegramEnabled && config.telegramBotToken && config.telegramChatId);
  const ready = Boolean(config.contactEnabled && origin && applications.size && inboxReady
    && typeof config.contactFormSecret === 'string' && config.contactFormSecret.length >= 32
    && config.contactFormSecret !== config.contactInboxToken && config.contactPrivacyVersion === CONTACT_PRIVACY_VERSION && notificationReady());
  const limits = new Map(); let maintenanceRunning = false;
  const limited = (kind, request, count, window) => {
    const now = clock();
    for (const [key, entry] of limits) if (entry.until <= now) limits.delete(key);
    const hour = Math.floor(now / 3600000);
    const identity = kind + ':' + sign(`${hour}:${client(request)}`, config.contactFormSecret || config.contactInboxToken);
    const keys = [[identity, count], [kind + ':global', kind === 'challenge' ? 120 : 60]];
    for (const [key, maximum] of keys) {
      let entry = limits.get(key);
      if (!entry) {if (limits.size >= 5000) return true; entry = {count: 0, until: now + window}; limits.set(key, entry);}
      if (++entry.count > maximum) return true;
    }
    return false;
  };
  const prune = now => pool.query('DELETE FROM vcode_contacts.inquiries WHERE expires_at <= $1', [new Date(now)]);

  async function save(payload, {lookupOnly = false} = {}) {
    const now = clock(), reference = randomUUID(), expiry = new Date(now + TTL);
    const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      // Serialize idempotency/global capacity across any blog replicas.
      await db.query('SELECT pg_advisory_xact_lock($1)', [726341908]);
      await db.query('DELETE FROM vcode_contacts.inquiries WHERE expires_at <= $1', [new Date(now)]);
      const existing = (await db.query('SELECT id,payload_hash FROM vcode_contacts.inquiries WHERE request_id=$1', [payload.requestId])).rows[0];
      if (existing) {
        if (!equal(existing.payload_hash, fingerprint)) throw error(409, 'idempotency-conflict');
        await db.query('COMMIT'); return existing.id;
      }
      // An expired signed relay challenge can recover an existing receipt only.
      if (lookupOnly) {await db.query('COMMIT'); return null;}
      const volume = (await db.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries WHERE created_at >= $1', [new Date(now - 86400000)])).rows[0];
      if (Number(volume.count) >= 100) throw error(429, 'rate-limit');
      await db.query(`INSERT INTO vcode_contacts.inquiries (id,request_id,payload_hash,locale,name,email,organization,area,application,message,privacy_version,created_at,updated_at,expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$13)`,
      [reference, payload.requestId, fingerprint, payload.locale, payload.name, payload.email, payload.organization, payload.area, payload.application, payload.message, payload.privacyVersion, new Date(now), expiry]);
      await db.query('INSERT INTO vcode_contacts.outbox (inquiry_id,next_attempt_at,expires_at) VALUES ($1,$2,$3)', [reference, new Date(now), expiry]);
      await db.query('COMMIT'); return reference;
    } catch (failure) {await db.query('ROLLBACK').catch(() => {}); throw failure;} finally {db.release();}
  }

  async function internal(request, res, url) {
    if (!inboxReady || !equal(request.headers.authorization, 'Bearer ' + config.contactInboxToken)) throw error(401, 'unauthorized');
    const now = clock(); await prune(now);
    if (request.method === 'GET' && url.pathname === '/internal/contacts') {
      const allowed = ['limit', 'status', 'startAt', 'endAt'];
      if ([...url.searchParams.keys()].some(key => !allowed.includes(key) || url.searchParams.getAll(key).length !== 1)) throw error(400, 'invalid-input');
      const rawLimit = url.searchParams.get('limit'), limit = rawLimit === null ? 100 : Number(rawLimit);
      const status = url.searchParams.get('status');
      if ((rawLimit !== null && !/^\d+$/.test(rawLimit)) || !Number.isInteger(limit) || limit < 1 || limit > 200 || (status && !STATUSES.includes(status))) throw error(400, 'invalid-input');
      const rawStart = url.searchParams.get('startAt'), rawEnd = url.searchParams.get('endAt');
      if ((rawStart !== null && !/^\d{1,16}$/.test(rawStart)) || (rawEnd !== null && !/^\d{1,16}$/.test(rawEnd))) throw error(400, 'invalid-input');
      const endAt = rawEnd === null ? now : Number(rawEnd), startAt = rawStart === null ? endAt - 7 * 86400000 : Number(rawStart);
      if (!Number.isSafeInteger(startAt) || !Number.isSafeInteger(endAt) || startAt < 0 || endAt > now + 300000 || endAt <= startAt || endAt - startAt > TTL) throw error(400, 'invalid-input');
      const items = (await pool.query(`SELECT id,created_at AS "createdAt",updated_at AS "updatedAt",expires_at AS "expiresAt",locale,name,email,organization,area,application,message,status
        FROM vcode_contacts.inquiries WHERE expires_at > $1 AND ($2::text IS NULL OR status=$2) ORDER BY created_at DESC LIMIT $3`, [new Date(now), status || null, limit])).rows;
      const summaryRows = (await pool.query('SELECT status,count(*)::int AS count FROM vcode_contacts.inquiries WHERE expires_at > $1 GROUP BY status', [new Date(now)])).rows;
      const summary = {new: 0, read: 0, closed: 0, total: 0};
      for (const row of summaryRows) {summary[row.status] = Number(row.count); summary.total += Number(row.count);}
      const notificationRows = (await pool.query('SELECT status,count(*)::int AS count FROM vcode_contacts.outbox WHERE expires_at > $1 GROUP BY status', [new Date(now)])).rows;
      const notifications = {pending: 0, sent: 0, failed: 0};
      for (const row of notificationRows) notifications[row.status] = Number(row.count);
      const params = [new Date(now), new Date(startAt), new Date(endAt)];
      const received = Number((await pool.query('SELECT count(*)::int AS count FROM vcode_contacts.inquiries WHERE expires_at > $1 AND created_at >= $2 AND created_at <= $3', params)).rows[0].count);
      const areas = (await pool.query('SELECT area AS id,count(*)::int AS count FROM vcode_contacts.inquiries WHERE expires_at > $1 AND created_at >= $2 AND created_at <= $3 GROUP BY area ORDER BY count DESC,area', params)).rows;
      const applicationRows = (await pool.query('SELECT application AS id,count(*)::int AS count FROM vcode_contacts.inquiries WHERE expires_at > $1 AND created_at >= $2 AND created_at <= $3 AND application IS NOT NULL GROUP BY application ORDER BY count DESC,application', params)).rows;
      return json(res, 200, {items, summary, notifications, interest: {startAt, endAt, received, areas, applications: applicationRows},
        catalog: [...applications].map(([id, name]) => ({id, name}))});
    }
    const match = /^\/internal\/contacts\/([a-f0-9-]{36})$/i.exec(url.pathname);
    if (!match || !UUID.test(match[1]) || url.search) throw error(404, 'not-found');
    if (request.method === 'PATCH') {
      const input = await body(request);
      if (!plain(input) || Object.keys(input).join(',') !== 'status' || !STATUSES.includes(input.status)) throw error(400, 'invalid-input');
      const result = await pool.query('UPDATE vcode_contacts.inquiries SET status=$2,updated_at=$3 WHERE id=$1 AND expires_at > $3 RETURNING id', [match[1], input.status, new Date(now)]);
      if (!result.rowCount) throw error(404, 'not-found');
      return json(res, 200, {ok: true, reference: match[1], status: input.status});
    }
    if (request.method === 'DELETE') {
      const result = await pool.query('DELETE FROM vcode_contacts.inquiries WHERE id=$1 RETURNING id', [match[1]]);
      if (!result.rowCount) throw error(404, 'not-found');
      return json(res, 200, {ok: true, reference: match[1]});
    }
    throw error(405, 'method-not-allowed');
  }

  const relays = createContactRelayService({config, catalog: applications, save, validatePayload: validateContactPayload, clock});
  async function handle(request, res) {
    if (await relays.handle(request, res)) return true;
    const url = new URL(request.url ?? '/', config.siteOrigin);
    if (!url.pathname.startsWith('/api/contact') && !url.pathname.startsWith('/internal/contacts')) return false;
    try {
      if (url.pathname.startsWith('/internal/contacts')) {await internal(request, res, url); return true;}
      if (url.search) throw error(400, 'invalid-input');
      if (!['/api/contact', '/api/contact/challenge'].includes(url.pathname)) throw error(404, 'not-found');
      const expected = url.pathname.endsWith('/challenge') ? 'GET' : 'POST';
      if (request.method !== expected) throw error(405, 'method-not-allowed');
      if (request.headers['sec-fetch-site'] !== 'same-origin' || (request.headers.origin && request.headers.origin !== origin)
          || (request.method === 'POST' && request.headers.origin !== origin)) throw error(403, 'origin-not-allowed');
      if (request.method === 'GET' && !ready) {json(res, 200, {enabled: false, privacyVersion: CONTACT_PRIVACY_VERSION}); return true;}
      if (!ready) throw error(503, 'unavailable');
      if (limited(request.method === 'GET' ? 'challenge' : 'submit', request, request.method === 'GET' ? 12 : 8, request.method === 'GET' ? 600000 : 3600000)) throw error(429, 'rate-limit');
      if (request.method === 'GET') {json(res, 200, issueContactChallenge(config.contactFormSecret, client(request), clock())); return true;}
      const input = await body(request), payload = validateContactPayload(input, applications);
      if (!validContactChallenge(input.token, config.contactFormSecret, client(request), clock())) throw error(403, 'rejected');
      const reference = await save(payload);
      json(res, 202, {ok: true, reference});
      // Delivery is durable in the outbox and is deliberately not a condition
      // of the accepted receipt. The maintenance loop retries failures.
      return true;
    } catch (failure) {
      const status = Number(failure.status) || 503, code = failure.code && failure.status ? failure.code : 'unavailable';
      if (!res.headersSent) json(res, status, {ok: false, error: code}, status === 429 ? {'Retry-After': '3600'} : {});
      request.resume?.(); return true;
    }
  }

  async function maintenance() {
    if (maintenanceRunning) return;
    maintenanceRunning = true;
    try {
      await prune(clock());
      await pool.query('DELETE FROM vcode_contacts.outbox WHERE expires_at <= $1', [new Date(clock())]);
      await pool.query("UPDATE vcode_contacts.outbox SET status='failed',lease_until=NULL WHERE status='pending' AND attempts >= 6 AND (lease_until IS NULL OR lease_until <= $1)", [new Date(clock())]);
      if (!notificationReady()) return;
      for (let index = 0; index < 5; index++) {
        const now = clock(), db = await pool.connect(); let job;
        try {
          await db.query('BEGIN');
          job = (await db.query(`SELECT o.inquiry_id,o.attempts,i.area,i.application FROM vcode_contacts.outbox o JOIN vcode_contacts.inquiries i ON i.id=o.inquiry_id
            WHERE o.status='pending' AND o.attempts < 6 AND o.expires_at > $1 AND i.expires_at > $1 AND o.next_attempt_at <= $1
              AND (o.lease_until IS NULL OR o.lease_until <= $1) ORDER BY o.next_attempt_at LIMIT 1 FOR UPDATE OF o SKIP LOCKED`, [new Date(now)])).rows[0];
          if (job) await db.query('UPDATE vcode_contacts.outbox SET attempts=attempts+1,lease_until=$2 WHERE inquiry_id=$1', [job.inquiry_id, new Date(now + 60000)]);
          await db.query('COMMIT');
        } catch (failure) {await db.query('ROLLBACK').catch(() => {}); throw failure;} finally {db.release();}
        if (!job) break;
        const attempts = Number(job.attempts) + 1;
        try {
          const text = `Nový zájem o spolupráci na VCode\nReference: ${job.inquiry_id.slice(0, 8)}\nOblast: ${AREA_NAMES[job.area] ?? 'Jiné'}${job.application && applications.has(job.application) ? '\nAplikace: ' + applications.get(job.application) : ''}\n${new URL('/prehled/#inquiries', origin).href}`;
          const result = await telegramCall(config, 'sendMessage', {chat_id: config.telegramChatId, text, disable_web_page_preview: true}, fetchImpl);
          await pool.query("UPDATE vcode_contacts.outbox SET status='sent',lease_until=NULL,telegram_message_id=$2,last_error_code=NULL WHERE inquiry_id=$1", [job.inquiry_id, String(result.message_id)]);
        } catch {
          await pool.query("UPDATE vcode_contacts.outbox SET status=$2,lease_until=NULL,next_attempt_at=$3,last_error_code='telegram-unavailable' WHERE inquiry_id=$1",
            [job.inquiry_id, attempts >= 6 ? 'failed' : 'pending', new Date(clock() + (retryDelays[attempts - 1] ?? 43200000))]);
        }
      }
    } finally {maintenanceRunning = false;}
  }
  return {handle, maintenance, enabled: ready};
}
