import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));

export function createPool(databaseUrl) {
  if (!databaseUrl) throw new Error("DATABASE_URL or DATABASE_URL_FILE is required");
  return new pg.Pool({ connectionString: databaseUrl, max: 8, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
}

export async function migrate(pool) {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [726_341_902]);
    const sql = await readFile(join(here, "migrations", "001_blog.sql"), "utf8");
    await client.query(sql);
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [726_341_902]).catch(() => {});
    client.release();
  }
}

