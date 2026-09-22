import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";

const [command = "list-drafts", rawId, rawReviewer] = process.argv.slice(2);
const config = await loadConfig();
const pool = createPool(config.databaseUrl);
await migrate(pool);

const positiveId = (value) => {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) throw new Error("A positive article id is required");
  return id;
};

const reviewer = (value) => {
  const normalized = String(value ?? "").trim();
  if (!/^[a-zA-Z0-9._@ -]{3,80}$/.test(normalized)) throw new Error("A reviewer identity (3-80 safe characters) is required");
  return normalized;
};

async function articleDetail(id) {
  return (await pool.query(
    `SELECT a.id,a.slug,a.topic,a.status,a.sources,a.evidence,a.model,a.input_tokens,a.output_tokens,
            a.estimated_cost_usd,a.generated_at,a.reviewed_at,a.reviewed_by,a.published_at,
            jsonb_object_agg(t.locale,jsonb_build_object('title',t.title,'dek',t.dek,'sections',t.sections,'key_points',t.key_points)) AS translations
     FROM blog_articles a JOIN blog_article_translations t ON t.article_id=a.id
     WHERE a.id=$1 GROUP BY a.id`, [id]
  )).rows[0];
}

try {
  if (command === "list-drafts") {
    const rows = (await pool.query(
      `SELECT a.id,a.slug,a.topic,a.model,a.input_tokens,a.output_tokens,a.estimated_cost_usd,a.generated_at,
              a.evidence->>'policy' AS evidence_policy, jsonb_array_length(COALESCE(a.evidence->'claims','[]'::jsonb)) AS claim_count,
              jsonb_object_agg(t.locale,jsonb_build_object('title',t.title,'dek',t.dek)) AS translations
       FROM blog_articles a JOIN blog_article_translations t ON t.article_id=a.id
       WHERE a.status='draft' GROUP BY a.id ORDER BY a.generated_at DESC LIMIT 20`
    )).rows;
    console.log(JSON.stringify(rows, null, 2));
  } else if (command === "show") {
    const row = await articleDetail(positiveId(rawId));
    if (!row) throw new Error("Article was not found");
    console.log(JSON.stringify(row, null, 2));
  } else if (["review", "publish", "reject"].includes(command)) {
    const id = positiveId(rawId);
    const actor = reviewer(rawReviewer);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const locked = (await client.query("SELECT id,status FROM blog_articles WHERE id=$1 FOR UPDATE", [id])).rows[0];
      if (!locked || locked.status !== "draft") throw new Error("Draft article was not found");
      let result;
      if (command === "review") {
        result = await client.query("UPDATE blog_articles SET reviewed_at=now(),reviewed_by=$2,updated_at=now() WHERE id=$1 RETURNING id,slug,status,reviewed_at,reviewed_by", [id, actor]);
      } else if (command === "publish") {
        result = await client.query(
          "UPDATE blog_articles SET status='published',published_at=now(),reviewed_at=COALESCE(reviewed_at,now()),reviewed_by=COALESCE(reviewed_by,$2),updated_at=now() WHERE id=$1 RETURNING id,slug,status,published_at,reviewed_by",
          [id, actor]
        );
      } else {
        result = await client.query("UPDATE blog_articles SET status='rejected',reviewed_at=now(),reviewed_by=$2,updated_at=now() WHERE id=$1 RETURNING id,slug,status,reviewed_at,reviewed_by", [id, actor]);
      }
      await client.query("INSERT INTO blog_editorial_events (article_id,action,actor) VALUES ($1,$2,$3)", [id, command === "review" ? "reviewed" : command === "publish" ? "published" : "rejected", actor]);
      await client.query("COMMIT");
      console.log(JSON.stringify(result.rows[0], null, 2));
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  } else {
    throw new Error("Usage: articles.mjs list-drafts | show <id> | review <id> <reviewer> | publish <id> <reviewer> | reject <id> <reviewer>");
  }
} finally {
  await pool.end();
}
