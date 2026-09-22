import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";

const [command = "list-drafts", rawId] = process.argv.slice(2);
const config = await loadConfig();
const pool = createPool(config.databaseUrl);
await migrate(pool);

try {
  if (command === "list-drafts") {
    const rows = (await pool.query(
      `SELECT a.id,a.slug,a.topic,a.sources,a.model,a.input_tokens,a.output_tokens,a.estimated_cost_usd,a.generated_at,
              jsonb_object_agg(t.locale,jsonb_build_object('title',t.title,'dek',t.dek,'sections',t.sections,'key_points',t.key_points)) AS translations
       FROM blog_articles a JOIN blog_article_translations t ON t.article_id=a.id
       WHERE a.status='draft' GROUP BY a.id ORDER BY a.generated_at DESC LIMIT 20`
    )).rows;
    console.log(JSON.stringify(rows, null, 2));
  } else if (["publish", "reject"].includes(command)) {
    const id = Number.parseInt(rawId, 10);
    if (!Number.isInteger(id) || id < 1) throw new Error("A positive article id is required");
    const result = command === "publish"
      ? await pool.query("UPDATE blog_articles SET status='published',published_at=now(),updated_at=now() WHERE id=$1 AND status='draft' RETURNING id,slug,status,published_at", [id])
      : await pool.query("UPDATE blog_articles SET status='rejected',updated_at=now() WHERE id=$1 AND status='draft' RETURNING id,slug,status", [id]);
    if (!result.rowCount) throw new Error("Draft article was not found");
    console.log(JSON.stringify(result.rows[0]));
  } else {
    throw new Error("Usage: articles.mjs list-drafts | publish <id> | reject <id>");
  }
} finally {
  await pool.end();
}
