import {createHmac, randomUUID, timingSafeEqual} from 'node:crypto';

const DAY = 86400000, RETENTION = 90 * DAY, LOCK = 726341912;
const STAGES = ['new', 'reviewing', 'waiting', 'pilot', 'active', 'closed'];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const retryDelays = [60000, 300000, 1800000, 7200000, 43200000];
const error = (status, code) => Object.assign(new Error(code), {status, code});
const same = (a, b) => {const left = Buffer.from(a), right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right);};
const validId = value => typeof value === 'string' && UUID.test(value);
const text = (value, min, max) => typeof value === 'string' && value.isWellFormed() && [...value].length >= min && [...value].length <= max && !/[\x00-\x1f\x7f]/.test(value);
const slug = (value, max = 100) => typeof value === 'string' && value.length <= max && SLUG.test(value);
const actor = id => {if (!text(id, 1, 100)) throw error(400, 'invalid-input');};
const validateList = ({limit, appId}) => {if (!Number.isInteger(limit) || limit < 1 || limit > 100 || (appId !== null && !slug(appId))) throw error(400, 'invalid-input');};
const ITEM = `id,app_id AS "appId",type,locale,name,email,organization,message,privacy_version AS "privacyVersion",
 stage,manager_id AS "managerId",next_action AS "nextAction",next_action_due_at AS "nextActionDueAt",version,
 created_at AS "createdAt",updated_at AS "updatedAt",expires_at AS "expiresAt"`;
const PARTNER = `id,app_id AS "appId",type,display_name AS "displayName",policy_version AS "policyVersion",
 created_by AS "createdBy",created_at AS "createdAt",expires_at AS "expiresAt"`;

/** Storage only: callers authenticate, normalize submission fields and enforce approved app registries. */
export function createPartnershipStore({pool, clock = () => Date.now(), hashSecret}) {
  if (!pool || typeof pool.connect !== 'function' || typeof pool.query !== 'function' ) throw error(503, 'unavailable');
  let maintenanceRunning = false;
  const time = () => {const value = clock(); if (!Number.isSafeInteger(value) || value < 0 || !Number.isFinite(new Date(value).getTime())) throw error(503, 'unavailable'); return value;};
  const transaction = async work => {
    let db;
    try {
      db = await pool.connect(); await db.query('BEGIN');
      await db.query('SELECT pg_advisory_xact_lock($1)', [LOCK]);
      const result = await work(db); await db.query('COMMIT'); return result;
    } catch (failure) {
      await db?.query('ROLLBACK').catch(() => {});
      if (Number.isInteger(failure.status) && typeof failure.code === 'string') throw failure;
      throw error(503, 'unavailable');
    } finally {db?.release();}
  };
  const prune = async (db, now) => {
    await db.query('DELETE FROM vcode_contacts.partnership_inquiries WHERE expires_at <= $1', [new Date(now)]);
    await db.query('DELETE FROM vcode_contacts.partnership_receipts WHERE expires_at <= $1', [new Date(now)]);
    await db.query('DELETE FROM vcode_contacts.partners WHERE expires_at <= $1', [new Date(now)]);
  };
  const withAudit = async (db, items) => {
    if (!items.length) return items;
    const rows = (await db.query(`SELECT recent.id,recent.inquiry_id AS "inquiryId",actor_id AS "actorId",action,changed_fields AS "changedFields",
      from_stage AS "fromStage",to_stage AS "toStage",created_at AS "createdAt" FROM unnest($1::uuid[]) AS wanted(inquiry_id)
      JOIN LATERAL (SELECT * FROM vcode_contacts.partnership_audit a WHERE a.inquiry_id=wanted.inquiry_id
        ORDER BY a.created_at DESC,a.id DESC LIMIT 200) AS recent USING (inquiry_id)
      ORDER BY created_at,id`, [items.map(item => item.id)])).rows;
    const grouped = new Map(items.map(item => [item.id, []]));
    for (const {inquiryId, ...entry} of rows) grouped.get(inquiryId)?.push(entry);
    return items.map(item => ({...item, audit: grouped.get(item.id)}));
  };
  const audit = (db, id, actorId, action, fields, oldStage, newStage, now) => db.query(`INSERT INTO vcode_contacts.partnership_audit
    (id,inquiry_id,actor_id,action,changed_fields,from_stage,to_stage,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [randomUUID(), id, actorId, action, fields, oldStage, newStage, new Date(now)]);

  async function save(payload, {challengeValid = false} = {}) {
    if (typeof hashSecret !== 'string' || hashSecret.length < 32) throw error(503, 'unavailable');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw error(400, 'invalid-input');
    // Explicit ordering prevents input property order affecting safe retry identity.
    const normalized = {appId: payload.appId, requestId: payload.requestId, locale: payload.locale, name: payload.name,
      email: payload.email, organization: payload.organization ?? null, type: payload.type, message: payload.message, privacyVersion: payload.privacyVersion};
    const fingerprint = createHmac('sha256', hashSecret).update('vcode:partnership-intake-v1:payload\0').update(JSON.stringify(normalized)).digest('hex');
    return transaction(async db => {
      const now = time(); await prune(db, now);
      const receipt = (await db.query(`SELECT reference,inquiry_id,payload_hash FROM vcode_contacts.partnership_receipts
        WHERE app_id=$1 AND request_id=$2 FOR UPDATE`, [payload.appId, payload.requestId])).rows[0];
      if (receipt) {
        if (!receipt.inquiry_id) throw error(410, 'request-closed');
        if (!same(receipt.payload_hash, fingerprint)) throw error(409, 'idempotency-conflict');
        return receipt.reference;
      }
      if (challengeValid !== true) throw error(403, 'rejected');
      const midnight = Math.floor(now / DAY) * DAY;
      const volume = (await db.query(`SELECT count(*)::int AS total,count(*) FILTER (WHERE app_id=$3)::int AS application
        FROM vcode_contacts.partnership_receipts WHERE created_at >= $1 AND created_at < $2`, [new Date(midnight), new Date(midnight + DAY), payload.appId])).rows[0];
      if (Number(volume.total) >= 100 || Number(volume.application) >= 30) throw error(429, 'rate-limit');
      const reference = randomUUID(), created = new Date(now), expires = new Date(now + RETENTION);
      await db.query(`INSERT INTO vcode_contacts.partnership_inquiries
        (id,app_id,type,locale,name,email,organization,message,privacy_version,created_at,updated_at,expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,$11)`,
        [reference, payload.appId, payload.type, payload.locale, payload.name, payload.email, payload.organization ?? null, payload.message, payload.privacyVersion, created, expires]);
      await db.query(`INSERT INTO vcode_contacts.partnership_receipts (app_id,request_id,reference,inquiry_id,payload_hash,created_at,expires_at)
        VALUES ($1,$2,$3,$3,$4,$5,$6)`, [payload.appId, payload.requestId, reference, fingerprint, created, expires]);
      await db.query(`INSERT INTO vcode_contacts.partnership_outbox (inquiry_id,next_attempt_at,expires_at) VALUES ($1,$2,$3)`, [reference, created, expires]);
      return reference;
    });
  }

  async function list({limit = 50, stage = null, appId = null} = {}) {
    validateList({limit, appId}); if (stage !== null && !STAGES.includes(stage)) throw error(400, 'invalid-input');
    return transaction(async db => {
      const now = time(); await prune(db, now);
      const params = [new Date(now), stage, appId];
      const items = (await db.query(`SELECT ${ITEM} FROM vcode_contacts.partnership_inquiries
        WHERE expires_at > $1 AND ($2::text IS NULL OR stage=$2) AND ($3::text IS NULL OR app_id=$3)
        ORDER BY created_at DESC,id LIMIT $4`, [...params, limit])).rows;
      const counts = (await db.query(`SELECT stage,count(*)::int AS count FROM vcode_contacts.partnership_inquiries
        WHERE expires_at > $1 AND ($2::text IS NULL OR stage=$2) AND ($3::text IS NULL OR app_id=$3) GROUP BY stage`, params)).rows;
      const summary = {new: 0, reviewing: 0, waiting: 0, pilot: 0, active: 0, closed: 0, total: 0};
      for (const row of counts) {summary[row.stage] = Number(row.count); summary.total += Number(row.count);}
      const notifications = {pending: 0, sent: 0, failed: 0};
      const jobs = (await db.query(`SELECT o.status,count(*)::int AS count FROM vcode_contacts.partnership_outbox o
        JOIN vcode_contacts.partnership_inquiries i ON i.id=o.inquiry_id WHERE i.expires_at > $1
        AND ($2::text IS NULL OR i.stage=$2) AND ($3::text IS NULL OR i.app_id=$3) GROUP BY o.status`, params)).rows;
      for (const row of jobs) notifications[row.status] = Number(row.count);
      return {items: await withAudit(db, items), summary, notifications};
    });
  }

  async function update(id, input, actorId) {
    actor(actorId); if (!input || typeof input !== 'object' || Array.isArray(input)) throw error(400, 'invalid-input');
    const allowed = ['stage', 'managerId', 'nextAction', 'nextActionDueAt'];
    const fields = allowed.filter(key => Object.hasOwn(input, key));
    if (!validId(id) || !Number.isInteger(input.expectedVersion) || input.expectedVersion < 1 || !fields.length
      || Object.keys(input).some(key => ![...allowed, 'expectedVersion'].includes(key))
      || (fields.includes('stage') && !STAGES.includes(input.stage))
      || (fields.includes('managerId') && input.managerId !== null && input.managerId !== actorId)
      || (fields.includes('nextAction') && input.nextAction !== null && !text(input.nextAction, 0, 500))) throw error(400, 'invalid-input');
    let due;
    if (fields.includes('nextActionDueAt')) {
      if (input.nextActionDueAt !== null && typeof input.nextActionDueAt !== 'string') throw error(400, 'invalid-input');
      due = input.nextActionDueAt === null ? null : new Date(input.nextActionDueAt);
      if (due !== null && !Number.isFinite(due.getTime())) throw error(400, 'invalid-input');
    }
    return transaction(async db => {
      const now = time(); await prune(db, now);
      const original = (await db.query(`SELECT ${ITEM} FROM vcode_contacts.partnership_inquiries WHERE id=$1 FOR UPDATE`, [id])).rows[0];
      if (!original) throw error(404, 'not-found');
      if (original.version !== input.expectedVersion) throw error(409, 'idempotency-conflict');
      if (due && due.getTime() >= new Date(original.expiresAt).getTime()) throw error(400, 'invalid-input');
      const values = {stage: original.stage, managerId: original.managerId, nextAction: original.nextAction, nextActionDueAt: original.nextActionDueAt, ...input};
      const item = (await db.query(`UPDATE vcode_contacts.partnership_inquiries SET stage=$2,manager_id=$3,next_action=$4,next_action_due_at=$5,
        version=version+1,updated_at=$6 WHERE id=$1 AND version=$7 RETURNING ${ITEM}`,
        [id, values.stage, values.managerId, values.nextAction, fields.includes('nextActionDueAt') ? due : values.nextActionDueAt, new Date(now), input.expectedVersion])).rows[0];
      if (!item) throw error(409, 'idempotency-conflict');
      await audit(db, id, actorId, 'workflow-updated', fields, original.stage, item.stage, now);
      return (await withAudit(db, [item]))[0];
    });
  }

  async function remove(id, actorId) {
    actor(actorId); if (!validId(id)) throw error(400, 'invalid-input');
    return transaction(async db => {
      await prune(db, time());
      const result = await db.query('DELETE FROM vcode_contacts.partnership_inquiries WHERE id=$1 RETURNING id', [id]);
      if (!result.rowCount) throw error(404, 'not-found');
      return {ok: true, reference: id};
    });
  }

  async function getApplication(id) {
    if (!validId(id)) throw error(400, 'invalid-input');
    return transaction(async db => {
      const now = time(); await prune(db, now);
      const row = (await db.query('SELECT app_id AS "appId" FROM vcode_contacts.partnership_inquiries WHERE id=$1 AND expires_at > $2', [id, new Date(now)])).rows[0];
      if (!row) throw error(404, 'not-found');
      return row.appId;
    });
  }

  async function promote(id, input, actorId, policy) {
    actor(actorId);
    if (!policy || policy.enabled !== true || !text(policy.version, 1, 100) || !Number.isInteger(policy.retentionDays) || policy.retentionDays < 1 || policy.retentionDays > 365) throw error(403, 'rejected');
    if (!validId(id) || !input || Object.keys(input).sort().join(',') !== 'displayName,expectedVersion,policyVersion'
      || !Number.isInteger(input.expectedVersion) || input.expectedVersion < 1 || !text(input.displayName, 2, 160) || input.policyVersion !== policy.version) throw error(400, 'invalid-input');
    return transaction(async db => {
      const now = time(); await prune(db, now);
      const item = (await db.query(`SELECT ${ITEM} FROM vcode_contacts.partnership_inquiries WHERE id=$1 FOR UPDATE`, [id])).rows[0];
      if (!item) throw error(404, 'not-found');
      if (item.version !== input.expectedVersion) throw error(409, 'idempotency-conflict');
      const existing = (await db.query(`SELECT id FROM vcode_contacts.partners WHERE source_inquiry_id=$1`, [id])).rows[0];
      if (existing) throw error(409, 'idempotency-conflict');
      const partner = (await db.query(`INSERT INTO vcode_contacts.partners (id,app_id,type,display_name,policy_version,created_by,source_inquiry_id,created_at,expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${PARTNER}`,
        [randomUUID(), item.appId, item.type, input.displayName, policy.version, actorId, id, new Date(now), new Date(now + policy.retentionDays * DAY)])).rows[0];
      await db.query('UPDATE vcode_contacts.partnership_inquiries SET version=version+1,updated_at=$2 WHERE id=$1', [id, new Date(now)]);
      await audit(db, id, actorId, 'promoted', [], item.stage, item.stage, now);
      return partner;
    });
  }

  async function listPartners({limit = 50, appId = null} = {}) {
    validateList({limit, appId});
    return transaction(async db => {
      const now = time(); await prune(db, now);
      const items = (await db.query(`SELECT ${PARTNER} FROM vcode_contacts.partners WHERE expires_at > $1
        AND ($2::text IS NULL OR app_id=$2) ORDER BY created_at DESC,id LIMIT $3`, [new Date(now), appId, limit])).rows;
      return {items};
    });
  }

  async function removePartner(id, actorId) {
    actor(actorId); if (!validId(id)) throw error(400, 'invalid-input');
    return transaction(async db => {
      await prune(db, time());
      const result = await db.query('DELETE FROM vcode_contacts.partners WHERE id=$1 RETURNING id', [id]);
      if (!result.rowCount) throw error(404, 'not-found');
      return {ok: true, reference: id};
    });
  }

  async function maintenance({notify} = {}) {
    if (maintenanceRunning) return {processed: 0};
    maintenanceRunning = true; let processed = 0;
    try {
      await transaction(async db => {
        const now = time(); await prune(db, now);
        await db.query(`UPDATE vcode_contacts.partnership_outbox SET status='failed',lease_until=NULL,lease_token=NULL
          WHERE status='pending' AND attempts >= 6 AND (lease_until IS NULL OR lease_until <= $1)`, [new Date(now)]);
      });
      if (typeof notify !== 'function') return {processed};
      for (let index = 0; index < 5; index++) {
        const job = await transaction(async db => {
          const now = time();
          const row = (await db.query(`SELECT o.inquiry_id AS reference,o.attempts,i.app_id AS "appId"
            FROM vcode_contacts.partnership_outbox o JOIN vcode_contacts.partnership_inquiries i ON i.id=o.inquiry_id
            WHERE o.status='pending' AND o.attempts < 6 AND o.expires_at > $1 AND i.expires_at > $1 AND o.next_attempt_at <= $1
            AND (o.lease_until IS NULL OR o.lease_until <= $1) ORDER BY o.next_attempt_at,o.inquiry_id LIMIT 1 FOR UPDATE OF o SKIP LOCKED`, [new Date(now)])).rows[0];
          if (!row) return null;
          const lease = randomUUID(), attempts = Number(row.attempts) + 1;
          await db.query('UPDATE vcode_contacts.partnership_outbox SET attempts=$2,lease_until=$3,lease_token=$4 WHERE inquiry_id=$1', [row.reference, attempts, new Date(now + 60000), lease]);
          return {...row, attempts, lease};
        });
        if (!job) break;
        processed++; let timer, success = false;
        try {
          await Promise.race([Promise.resolve().then(() => notify({reference: job.reference, appId: job.appId})),
            new Promise((_, reject) => {timer = setTimeout(() => reject(error(503, 'unavailable')), 10000);})]);
          success = true;
        } catch { /* Store only retry state; never arbitrary service errors or content. */ }
        finally {clearTimeout(timer);}
        const now = time();
        await transaction(db => db.query(`UPDATE vcode_contacts.partnership_outbox SET status=$4,lease_until=NULL,lease_token=NULL,next_attempt_at=$5
          WHERE inquiry_id=$1 AND lease_token=$2 AND attempts=$3 AND status='pending' AND expires_at > $6`,
          [job.reference, job.lease, job.attempts, success ? 'sent' : job.attempts >= 6 ? 'failed' : 'pending',
            new Date(now + (success ? 0 : retryDelays[job.attempts - 1] ?? 43200000)), new Date(now)]));
      }
      return {processed};
    } finally {maintenanceRunning = false;}
  }
  return {save, list, update, remove, getApplication, promote, listPartners, removePartner, maintenance};
}
