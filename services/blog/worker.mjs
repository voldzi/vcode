import { createHash } from "node:crypto";
import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";
import { fetchFeed } from "./feeds.mjs";
import { defaultSources } from "./sources.mjs";
import { buildEvidencePack, canonicalizeUrl, normalizeText, relevance, selectEvidenceCluster, titleFingerprint } from "./pipeline.mjs";
import { boundCandidates, generateArticle } from "./openai.mjs";
import { notifyDraft } from "./telegram.mjs";
import { pragueSchedule } from "./schedule.mjs";

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
  await client.query("UPDATE blog_sources SET enabled=false WHERE NOT (id = ANY($1::text[]))", [defaultSources.map((source) => source.id)]);
  for (const source of defaultSources) {
    await client.query(
      `INSERT INTO blog_sources
         (id, name, feed_url, homepage_url, enabled, collection_mode, language, trust_tier, source_kind, retention_policy, license_note, allowed_hosts, topics)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, feed_url=EXCLUDED.feed_url, homepage_url=EXCLUDED.homepage_url,
         collection_mode=EXCLUDED.collection_mode, language=EXCLUDED.language, trust_tier=EXCLUDED.trust_tier,
         source_kind=EXCLUDED.source_kind, retention_policy=EXCLUDED.retention_policy, license_note=EXCLUDED.license_note,
         allowed_hosts=EXCLUDED.allowed_hosts, topics=EXCLUDED.topics`,
      [source.id, source.name, source.feedUrl, source.homepageUrl, source.enabled, source.collectionMode, source.language,
       source.trustTier, source.sourceKind, source.retentionPolicy, source.licenseNote ?? null,
       JSON.stringify(source.allowedHosts), JSON.stringify(source.topics)]
    );
    const cache = (await client.query("SELECT enabled, etag, last_modified FROM blog_sources WHERE id=$1", [source.id])).rows[0];
    if (!cache.enabled || source.collectionMode !== "rss" || !source.feedUrl) continue;
    try {
      const feed = await fetchFeed(source, cache, config.feedUserAgent, {
        maxBytes: config.feedMaxBytes, maxItems: config.feedMaxItems,
        timeoutMs: config.feedTimeoutMs, maxRedirects: config.feedMaxRedirects
      });
      for (const item of feed.items) {
        const enriched = { ...item, trustTier: source.trustTier, sourceKind: source.sourceKind, language: source.language };
        const itemRelevance = relevance(enriched);
        await client.query(
          `INSERT INTO blog_feed_items
             (id, source_id, title, url, canonical_url, summary, author, published_at, normalized_title, title_fingerprint, relevance_score)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, summary=EXCLUDED.summary, author=EXCLUDED.author,
             published_at=EXCLUDED.published_at, canonical_url=EXCLUDED.canonical_url,
             normalized_title=EXCLUDED.normalized_title, title_fingerprint=EXCLUDED.title_fingerprint,
             relevance_score=EXCLUDED.relevance_score`,
          [item.id, item.sourceId, item.title, item.url, canonicalizeUrl(item.url), item.summary, item.author, item.publishedAt,
           normalizeText(item.title), titleFingerprint(item.title), itemRelevance.score]
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
    "SELECT runs, input_tokens + output_tokens AS tokens FROM blog_ai_usage WHERE usage_day=(now() AT TIME ZONE 'Europe/Prague')::date"
  )).rows[0] ?? { runs: 0, tokens: 0 };
  const monthly = (await client.query(
    "SELECT COALESCE(SUM(estimated_cost_usd),0)::float8 AS cost FROM blog_ai_usage WHERE usage_day >= date_trunc('month', now() AT TIME ZONE 'Europe/Prague')::date"
  )).rows[0];
  const worstInputTokens = Math.ceil(config.maxInputChars / 3);
  const worstCost = (worstInputTokens * config.inputPricePerMillionUsd + config.maxOutputTokens * config.outputPricePerMillionUsd) / 1_000_000;
  return Number(daily.runs) < config.maxRunsPerDay
    && Number(daily.tokens) + worstInputTokens + config.maxOutputTokens <= config.dailyTokenBudget
    && Number(monthly.cost) + worstCost <= config.monthlyCostBudgetUsd;
}

function worstCaseReservation() {
  const inputTokens = Math.ceil(config.maxInputChars / 3);
  const outputTokens = config.maxOutputTokens;
  return {
    inputTokens,
    outputTokens,
    costUsd: (inputTokens * config.inputPricePerMillionUsd + outputTokens * config.outputPricePerMillionUsd) / 1_000_000
  };
}

async function reserveBudget(client) {
  const reserved = worstCaseReservation();
  await client.query(
    `INSERT INTO blog_ai_usage (usage_day, runs, input_tokens, output_tokens, estimated_cost_usd)
     VALUES ((now() AT TIME ZONE 'Europe/Prague')::date,1,$1,$2,$3)
     ON CONFLICT (usage_day) DO UPDATE SET runs=blog_ai_usage.runs+1,
       input_tokens=blog_ai_usage.input_tokens+EXCLUDED.input_tokens,
       output_tokens=blog_ai_usage.output_tokens+EXCLUDED.output_tokens,
       estimated_cost_usd=blog_ai_usage.estimated_cost_usd+EXCLUDED.estimated_cost_usd, updated_at=now()`,
    [reserved.inputTokens, reserved.outputTokens, reserved.costUsd]
  );
  return reserved;
}

async function reconcileBudget(client, reserved, usage, actualCost) {
  await client.query(
    `UPDATE blog_ai_usage SET
       input_tokens=GREATEST(0,input_tokens-$1+$2), output_tokens=GREATEST(0,output_tokens-$3+$4),
       estimated_cost_usd=GREATEST(0,estimated_cost_usd-$5+$6), updated_at=now()
     WHERE usage_day=(now() AT TIME ZONE 'Europe/Prague')::date`,
    [reserved.inputTokens, usage.input_tokens ?? 0, reserved.outputTokens, usage.output_tokens ?? 0, reserved.costUsd, actualCost]
  );
}

export async function runOnce({ manualReview = false } = {}) {
  const client = await pool.connect();
  let locked = false;
  let runId;
  try {
    locked = (await client.query("SELECT pg_try_advisory_lock($1) AS locked", [726_341_903])).rows[0].locked;
    if (!locked) { log("run_skipped", { reason: "another worker owns the run lock" }); return "retry"; }
    if (manualReview && config.autoPublish) throw new Error("manual review requires BLOG_AUTO_PUBLISH=false");
    runId = (await client.query("INSERT INTO blog_runs (status, message) VALUES ('running', $1) RETURNING id", [manualReview ? "manual-review" : null])).rows[0].id;
    await client.query("DELETE FROM blog_comments WHERE status IN ('pending','rejected','spam') AND created_at < now() - interval '90 days'");
    await client.query("DELETE FROM blog_feed_items WHERE used_at IS NULL AND collected_at < now() - interval '30 days'");
    const seen = await collectFeeds(client);

    if (!config.generationEnabled) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "generation disabled"]);
      log("run_skipped", { reason: "generation disabled", feedItems: seen });
      return "disabled";
    }
    if (!pragueSchedule().due) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "before 06:20 Europe/Prague"]);
      log("run_skipped", { reason: "before 06:20 Europe/Prague" });
      return "before_due";
    }
    const recent = await client.query("SELECT 1 FROM blog_runs WHERE status IN ('draft','published') AND (finished_at AT TIME ZONE 'Europe/Prague')::date = (now() AT TIME ZONE 'Europe/Prague')::date AND ($1::boolean = false OR message = 'manual-review') LIMIT 1", [manualReview]);
    if (recent.rowCount) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "draft already created today"]);
      log("run_skipped", { reason: manualReview ? "manual review already created today" : "draft already created today" });
      return "complete";
    }
    if (!(await budgetAllows(client))) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "hard AI budget reached"]);
      log("run_skipped", { reason: "hard AI budget reached" });
      return "budget";
    }

    const candidates = (await client.query(
      `SELECT i.id, i.source_id AS "sourceId", s.name AS "sourceName", i.title, i.url, i.summary,
              i.published_at AS "publishedAt", s.trust_tier AS "trustTier", s.source_kind AS "sourceKind",
              s.language, i.relevance_score::float8 AS "storedScore"
       FROM blog_feed_items i JOIN blog_sources s ON s.id=i.source_id
       WHERE i.used_at IS NULL AND i.summary <> '' AND s.enabled
         AND COALESCE(i.published_at, i.collected_at) > now() - interval '14 days'
       ORDER BY COALESCE(i.published_at, i.collected_at) DESC LIMIT 300`
    )).rows;
    const recentArticles = (await client.query(
      "SELECT topic, sources FROM blog_articles WHERE generated_at > now() - interval '7 days' ORDER BY generated_at DESC LIMIT 7"
    )).rows.map((article) => ({
      topic: article.topic,
      sourceIds: [...new Set(article.sources.map((source) => source.sourceId))]
    }));
    const cluster = selectEvidenceCluster(candidates, recentArticles);
    const evidence = buildEvidencePack(cluster);
    if (!cluster || !evidence) {
      await client.query("UPDATE blog_runs SET status='skipped', finished_at=now(), feed_items_seen=$2, message=$3 WHERE id=$1", [runId, seen, "no eligible evidence cluster"]);
      log("run_skipped", { reason: "no eligible evidence cluster" });
      return "retry";
    }

    await client.query(
      `INSERT INTO blog_story_clusters (id, representative_title, item_ids, evidence, score)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET item_ids=EXCLUDED.item_ids, evidence=EXCLUDED.evidence, score=EXCLUDED.score, updated_at=now()`,
      [cluster.id, cluster.items[0].title, JSON.stringify(cluster.items.map((item) => item.id)), JSON.stringify(evidence), cluster.score]
    );

    // Reject deterministic input-policy failures before reserving the daily AI budget.
    boundCandidates(cluster.items, config.maxInputChars);
    const reservedBudget = await reserveBudget(client);
    const generated = await generateArticle(cluster.items, config);
    const selected = generated.inputCandidates.filter((item) => generated.article.source_ids.includes(item.id));
    const slug = slugify(generated.article.cs.title);
    const articleEvidence = { ...evidence, claims: generated.article.claims };
    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO blog_articles (slug, topic, sources, evidence, hero_variant, status, model, input_tokens, output_tokens, estimated_cost_usd, generation_id, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CASE WHEN $6='published' THEN now() ELSE NULL END) RETURNING id`,
      [slug, generated.article.topic, JSON.stringify(selected), JSON.stringify(articleEvidence), generated.article.hero_variant,
       config.autoPublish ? "published" : "draft", config.openaiModel, generated.usage.input_tokens ?? 0,
       generated.usage.output_tokens ?? 0, generated.costUsd, generated.responseId]
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
    await client.query("UPDATE blog_story_clusters SET status=$2, updated_at=now() WHERE id=$1", [cluster.id, config.autoPublish ? "published" : "drafted"]);
    await client.query(
      "INSERT INTO blog_editorial_events (article_id, action, actor, detail) VALUES ($1,'generated','vcode-blog-worker',$2)",
      [articleId, JSON.stringify({ cluster_id: cluster.id, model: config.openaiModel, auto_publish: config.autoPublish })]
    );
    await reconcileBudget(client, reservedBudget, generated.usage, generated.costUsd);
    await client.query("UPDATE blog_runs SET status=$2, finished_at=now(), feed_items_seen=$3, article_id=$4 WHERE id=$1", [runId, config.autoPublish ? "published" : "draft", seen, articleId]);
    await client.query("COMMIT");
    log("article_created", { articleId, slug, topic: generated.article.topic, selectedTopic: cluster.primaryTopic,
      published: config.autoPublish, model: config.openaiModel, costUsd: generated.costUsd });
    if (!config.autoPublish) {
      try {
        const notification = await notifyDraft(client, articleId, config);
        log(notification.skipped ? "telegram_notification_skipped" : "telegram_notification_sent", { articleId, requestId: notification.requestId });
      } catch (error) {
        log("telegram_notification_failed", { articleId, error: error.message });
      }
    }
    return "complete";
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (runId) await client.query("UPDATE blog_runs SET status='failed', finished_at=now(), message=$2 WHERE id=$1", [runId, String(error.message).slice(0, 500)]).catch(() => {});
    log("run_failed", { error: error.message });
    return "retry";
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock($1)", [726_341_903]).catch(() => {});
    client.release();
  }
}

let inFlight = false;
let scheduledDay = null;
let nextMorningAttemptAt = 0;
async function runSafely() {
  if (inFlight) return;
  inFlight = true;
  try {
    let result;
    try { result = await runOnce(); }
    catch (error) { log("run_failed", { error: error.message }); result = "retry"; }
    const schedule = pragueSchedule();
    if (schedule.due) {
      if (["complete", "budget", "disabled"].includes(result)) scheduledDay = schedule.day;
      else nextMorningAttemptAt = Date.now() + 15 * 60_000;
    }
  } finally { inFlight = false; }
}

if (process.argv[2] === "--manual-review") {
  const result = await runOnce({ manualReview: true });
  await pool.end();
  if (result === "retry") process.exitCode = 1;
} else {
  await runSafely();
  const collectionTimer = setInterval(runSafely, config.runIntervalMinutes * 60_000);
  const morningTimer = setInterval(() => {
    const schedule = pragueSchedule();
    if (schedule.due && schedule.day !== scheduledDay && !inFlight && Date.now() >= nextMorningAttemptAt) {
      void runSafely();
    }
  }, 15_000);
  process.on("SIGTERM", async () => { clearInterval(collectionTimer); clearInterval(morningTimer); await pool.end(); process.exit(0); });
  process.on("SIGINT", async () => { clearInterval(collectionTimer); clearInterval(morningTimer); await pool.end(); process.exit(0); });
}
