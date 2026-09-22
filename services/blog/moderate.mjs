import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";

const [command = "list", rawId] = process.argv.slice(2);
const config = await loadConfig();
const pool = createPool(config.databaseUrl);
await migrate(pool);

try {
  if (command === "list") {
    const rows = (await pool.query(
      `SELECT c.id,a.slug,c.display_name,c.body,c.created_at
       FROM blog_comments c JOIN blog_articles a ON a.id=c.article_id
       WHERE c.status='pending' ORDER BY c.created_at LIMIT 100`
    )).rows;
    console.log(JSON.stringify(rows, null, 2));
  } else if (["approve", "reject"].includes(command)) {
    const id = Number.parseInt(rawId, 10);
    if (!Number.isInteger(id) || id < 1) throw new Error("A positive comment id is required");
    const status = command === "approve" ? "approved" : "rejected";
    const result = await pool.query("UPDATE blog_comments SET status=$2,moderated_at=now() WHERE id=$1 AND status='pending' RETURNING id,status", [id, status]);
    if (!result.rowCount) throw new Error("Pending comment was not found");
    console.log(JSON.stringify(result.rows[0]));
  } else {
    throw new Error("Usage: moderate.mjs list | approve <id> | reject <id>");
  }
} finally {
  await pool.end();
}
