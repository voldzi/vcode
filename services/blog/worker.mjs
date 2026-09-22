import { createHash } from "node:crypto";
import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";
import { defaultSources, fetchFeed } from "./feeds.mjs";
import { generateArticle } from "./openai.mjs";

const config = await loadConfig();
const pool = createPool(config.databaseUrl);
await migrate(pool);

const log = (event, detail = {}) => console.log(JSON.stringify({ time: new Date().toISOString(), service: "vcode-blog-worker", event, ...detail }));

function slugify(value) {
  const base = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
  const suffix = createHash("sha256").update(`${value}:${new Date().toISOString().slice(0, 13)}`).digest("hex").slice(0, 8);
  return `${base || "technologicky-prehled"}-${suffix}`;
}

async function collectFeeds(client) {
  let seen = 0;
  for (const source of defaultSources) {
    await client.query(
      `INSERT INTO blog_sources (id, name, feed_url, homepage_url) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, feed_url=EXCLUDED.feed_url, homepage_url=EXCLUDED.homepage_url`,
      [source.id, source.name, source.feedUrl, source.homepageUrl]
    );
    const cache = (await client.query("SELECT etag, last_modified FROM blog_sources WHERE id=$1", [source.id])).rows[0];
    try {
      const feed = await fetchFeed(source, cache, config.feedUserAgent);
      for (const item of feed.items) {
        await client.query(
          `INSERT INTO blog_feed_items (id, source_id, title, url, summary, author, published_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, summary=EXCLUDED.summary, author=EXCLUDED.author, published_at=EXCLUDED.published_at`,
          [item.id, item.sourceId, item.title, item.url, item.summary, item.author, item.publishedAt]
        );
      }
      seen += feed.items.length;
      await client.query(
        `UPDATE blog_sources SET etag=$2, last_modified=$3, last_checked_at=now(), last_success_at=now(), last_error=NULL WHERE id=$1`,
        [source.id, feed.etag, feed.lastModified]
      );
    } catch (error) {
      await client.query("UPDATE blog_sources SET last_checked_at=now(), last_error=$2 WHERE id=$1", [source.id, String(error.message).slice(0, 500)]);
      log("feed_failed", { source: source.id, error: error.message });
    }
  }
  return seen;
}

async function budgetAllows(client) {
  const daily = (await client.query(
    "SELECT runs, input_tokens + output_tokens AS tokens FROM blog_ai_usage WHERE usage_day=CURRENT_DATE"
  )).rows[0] ?? { runs: 0, tokens: 0 };
  const monthly = (await client.query(
    "SELECT COALESCE(SUM(estimated_cost_usd),0)::float8 AS cost FROM blog_ai_usage WHERE usage_day >= date_trunc('month', CURRENT_DATE)::date"
  )).rows[0];
  const worstInputTokens = Math.ceil(config.maxInputChars / 3);
  const worstCost = (worstInputTokens * config.inputPricePerMillionUsd + config.maxOutputTokens * config.outputPricePerMillionUsd) / 1_000_000;
  return Number(daily.runs) < config.maxRunsPerDay
    && Number(daily.tokens) + worstInputTokens + config.maxOutputTokens <= config.dailyTokenBudget
    && Number(monthly.cost) + worstCost <= config.monthlyCostBudgetUsd;
}

export async function runOnce() {
  const client = await pool.connect();
  let locked = false;
  let runId;
  try {
    locked = (await client.query("SELECT pg_try_advisory_lock($1) AS locked", [726_341_903])).rows[0].locked;
    if (!locked) return log("run_skipped", { reason: "another worker owns the run lock" });
    runId = (await client.query("INSERT INTO blog_runs (status) VALUES ('running') RETURNING id")).rows[0].id;
    await client.query("DELETE FROM blog_comments WHERE status IN ('pending','rejected','spam') AND created_at < now() - interval '90 days'");
    await client.query("DELETE FROM blog_feed_items WHERE used_at IS NULL AND collected_at < now() - interval '30 days'");
    const seen = await collectFeeds(client);

    if (!config.generationEnabled) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "generation disabled"]);
      return log("run_skipped", { reason: "generation disabled", feedItems: seen });
    }
    const recent = await client.query("SELECT 1 FROM blog_runs WHERE status='published' AND finished_at > now() - ($1::text || ' minutes')::interval LIMIT 1", [config.runIntervalMinutes - 5]);
    if (recent.rowCount) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "publication interval not elapsed"]);
      return log("run_skipped", { reason: "publication interval not elapsed" });
    }
    if (!(await budgetAllows(client))) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "hard AI budget reached"]);
      return log("run_skipped", { reason: "hard AI budget reached" });
    }

    const candidates = (await client.query(
      `SELECT i.id, i.source_id AS "sourceId", s.name AS "sourceName", i.title, i.url, i.summary,
              i.published_at AS "publishedAt"
       FROM blog_feed_items i JOIN blog_sources s ON s.id=i.source_id
       WHERE i.used_at IS NULL AND i.summary <> '' AND COALESCE(i.published_at, i.collected_at) > now() - interval '7 days'
       ORDER BY COALESCE(i.published_at, i.collected_at) DESC LIMIT 24`
    )).rows;
    if (new Set(candidates.map((item) => item.sourceId)).size < 2) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "not enough independent fresh sources"]);
      return log("run_skipped", { reason: "not enough independent fresh sources" });
    }

    const generated = await generateArticle(candidates, config);
    const selected = generated.inputCandidates.filter((item) => generated.article.source_ids.includes(item.id));
    const slug = slugify(generated.article.cs.title);
    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO blog_articles (slug, topic, sources, hero_variant, status, model, input_tokens, output_tokens, estimated_cost_usd, generation_id, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $5='published' THEN now() ELSE NULL END) RETURNING id`,
      [slug, generated.article.topic, JSON.stringify(selected), generated.article.hero_variant, config.autoPublish ? "published" : "draft",
       config.openaiModel, generated.usage.input_tokens ?? 0, generated.usage.output_tokens ?? 0, generated.costUsd, generated.responseId]
    );
    const articleId = inserted.rows[0].id;
    for (const locale of ["cs", "en"]) {
      const translation = generated.article[locale];
      await client.query(
        `INSERT INTO blog_article_translations (article_id, locale, title, dek, sections, key_points) VALUES ($1,$2,$3,$4,$5,$6)`,
        [articleId, locale, translation.title, translation.dek, JSON.stringify(translation.sections), JSON.stringify(translation.key_points)]
      );
    }
    await client.query("UPDATE blog_feed_items SET used_at=now() WHERE id = ANY($1::text[])", [generated.article.source_ids]);
    await client.query(
      `INSERT INTO blog_ai_usage (usage_day, runs, input_tokens, output_tokens, estimated_cost_usd)
       VALUES (CURRENT_DATE,1,$1,$2,$3)
       ON CONFLICT (usage_day) DO UPDATE SET runs=blog_ai_usage.runs+1,
         input_tokens=blog_ai_usage.input_tokens+EXCLUDED.input_tokens,
         output_tokens=blog_ai_usage.output_tokens+EXCLUDED.output_tokens,
         estimated_cost_usd=blog_ai_usage.estimated_cost_usd+EXCLUDED.estimated_cost_usd, updated_at=now()`,
      [generated.usage.input_tokens ?? 0, generated.usage.output_tokens ?? 0, generated.costUsd]
    );
    await client.query("UPDATE blog_runs SET status=$2, finished_at=now(), feed_items_seen=$3, article_id=$4 WHERE id=$1", [runId, config.autoPublish ? "published" : "draft", seen, articleId]);
    await client.query("COMMIT");
    log("article_created", { articleId, slug, published: config.autoPublish, model: config.openaiModel, costUsd: generated.costUsd });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (runId) await client.query("UPDATE blog_runs SET status='failed', finished_at=now(), message=$2 WHERE id=$1", [runId, String(error.message).slice(0, 500)]).catch(() => {});
    log("run_failed", { error: error.message });
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock($1)", [726_341_903]).catch(() => {});
    client.release();
  }
}

await runOnce();
const timer = setInterval(runOnce, config.runIntervalMinutes * 60_000);
process.on("SIGTERM", async () => { clearInterval(timer); await pool.end(); process.exit(0); });
process.on("SIGINT", async () => { clearInterval(timer); await pool.end(); process.exit(0); });
