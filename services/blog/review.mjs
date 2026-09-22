import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const digest = (secret, value) => createHmac("sha256", secret).update(String(value)).digest("hex");
export const reviewTokenHash = (token, secret) => digest(secret, `review:${token}`);
export const callbackSignature = (action, id, secret) => digest(secret, `callback:${action}:${id}`).slice(0, 16);
export const callbackData = (action, id, secret) => `v1:${action}:${id}:${callbackSignature(action, id, secret)}`;

export function parseCallbackData(value, secret) {
  const match = String(value ?? "").match(/^v1:([prcxz]):([1-9][0-9]*):([a-f0-9]{16})$/);
  if (!match) return null;
  const expected = Buffer.from(callbackSignature(match[1], match[2], secret));
  const supplied = Buffer.from(match[3]);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied) ? { action: match[1], requestId: match[2] } : null;
}

export async function createReviewRequest(client, articleId, config) {
  const token = randomBytes(32).toString("base64url");
  const row = (await client.query(
    `INSERT INTO blog_review_requests (article_id,token_hash,telegram_chat_id,intended_user_id,expires_at)
     VALUES ($1,$2,$3,$4,now()+($5::text||' hours')::interval) RETURNING id,expires_at`,
    [articleId, reviewTokenHash(token, config.reviewSigningSecret), config.telegramChatId, config.telegramUserId, config.reviewTtlHours]
  )).rows[0];
  return { ...row, token };
}

export async function findReviewByToken(client, token, config) {
  return (await client.query(
    `SELECT r.id AS request_id,r.status AS review_status,r.expires_at,r.intended_user_id,
            a.id,a.slug,a.topic,a.sources,a.evidence,a.status,a.model,a.input_tokens,a.output_tokens,a.estimated_cost_usd,
            jsonb_object_agg(t.locale,jsonb_build_object('title',t.title,'dek',t.dek,'sections',t.sections,'key_points',t.key_points)) AS translations
     FROM blog_review_requests r JOIN blog_articles a ON a.id=r.article_id
     JOIN blog_article_translations t ON t.article_id=a.id
     WHERE r.token_hash=$1 GROUP BY r.id,a.id`,
    [reviewTokenHash(token, config.reviewSigningSecret)]
  )).rows[0];
}

export async function applyEditorialAction(client, requestId, action, actor) {
  const connection = typeof client.connect === "function" ? await client.connect() : client;
  await connection.query("BEGIN");
  try {
    const row = (await connection.query(
      `SELECT r.id,r.article_id,r.status AS review_status,r.expires_at,a.status AS article_status,a.evidence
       FROM blog_review_requests r JOIN blog_articles a ON a.id=r.article_id WHERE r.id=$1 FOR UPDATE OF r,a`, [requestId]
    )).rows[0];
    if (!row) throw Object.assign(new Error("Review request not found"), { status: 404 });
    if (row.review_status !== "pending" || row.article_status !== "draft") throw Object.assign(new Error("Review request was already completed"), { status: 409 });
    if (new Date(row.expires_at) <= new Date()) {
      await connection.query("UPDATE blog_review_requests SET status='expired' WHERE id=$1", [requestId]);
      await connection.query("COMMIT");
      throw Object.assign(new Error("Review request expired"), { status: 410, transactionFinished: true });
    }
    const next = action === "publish" ? "published" : "rejected";
    await connection.query(
      `UPDATE blog_articles SET status=$2,reviewed_at=now(),reviewed_by=$3,published_at=CASE WHEN $2='published' THEN now() ELSE NULL END,updated_at=now() WHERE id=$1`,
      [row.article_id, next, actor]
    );
    await connection.query("UPDATE blog_review_requests SET status='consumed',consumed_at=now() WHERE id=$1", [requestId]);
    await connection.query("INSERT INTO blog_editorial_events(article_id,action,actor,detail) VALUES($1,$2,$3,$4)", [row.article_id, next, actor, JSON.stringify({ review_request_id: requestId })]);
    const clusterId = row.evidence?.cluster_id;
    if (clusterId) await connection.query("UPDATE blog_story_clusters SET status=$2,updated_at=now() WHERE id=$1", [clusterId, next]);
    await connection.query("COMMIT");
    return { articleId: row.article_id, status: next };
  } catch (error) {
    if (!error.transactionFinished) await connection.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    if (connection !== client) connection.release();
  }
}
