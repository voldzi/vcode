import { readFile } from "node:fs/promises";

const integer = (name, fallback, minimum = 0) => {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isFinite(value) || value < minimum) throw new Error(`${name} must be an integer >= ${minimum}`);
  return value;
};

const number = (name, fallback, minimum = 0) => {
  const value = Number.parseFloat(process.env[name] ?? String(fallback));
  if (!Number.isFinite(value) || value < minimum) throw new Error(`${name} must be a number >= ${minimum}`);
  return value;
};

const boolean = (name, fallback) => {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
};

export async function readSecret(envName, fileEnvName) {
  if (process.env[fileEnvName]) return (await readFile(process.env[fileEnvName], "utf8")).trim();
  return process.env[envName]?.trim() ?? "";
}

export async function loadConfig() {
  return {
    port: integer("BLOG_PORT", 8090, 1),
    databaseUrl: await readSecret("DATABASE_URL", "DATABASE_URL_FILE"),
    openaiApiKey: await readSecret("OPENAI_API_KEY", "OPENAI_API_KEY_FILE"),
    openaiModel: process.env.BLOG_OPENAI_MODEL ?? "gpt-5.6-luna",
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    runIntervalMinutes: integer("BLOG_RUN_INTERVAL_MINUTES", 360, 60),
    generationIntervalMinutes: integer("BLOG_GENERATION_INTERVAL_MINUTES", 1440, 360),
    maxRunsPerDay: integer("BLOG_AI_MAX_RUNS_PER_DAY", 1, 1),
    maxInputChars: integer("BLOG_AI_MAX_INPUT_CHARS", 28000, 4000),
    maxOutputTokens: integer("BLOG_AI_MAX_OUTPUT_TOKENS", 2200, 500),
    dailyTokenBudget: integer("BLOG_AI_DAILY_TOKEN_BUDGET", 80000, 1000),
    monthlyCostBudgetUsd: number("BLOG_AI_MONTHLY_COST_USD", 5, 0.1),
    inputPricePerMillionUsd: number("BLOG_AI_INPUT_PRICE_PER_MILLION_USD", 0.2, 0),
    outputPricePerMillionUsd: number("BLOG_AI_OUTPUT_PRICE_PER_MILLION_USD", 1.2, 0),
    autoPublish: boolean("BLOG_AUTO_PUBLISH", false),
    generationEnabled: boolean("BLOG_GENERATION_ENABLED", false),
    commentAutoApprove: boolean("BLOG_COMMENT_AUTO_APPROVE", false),
    commentHashSecret: await readSecret("BLOG_COMMENT_HASH_SECRET", "BLOG_COMMENT_HASH_SECRET_FILE"),
    siteOrigin: process.env.PUBLIC_SITE_URL ?? "https://vcode.zeleznalady.cz",
    feedUserAgent: process.env.BLOG_FEED_USER_AGENT ?? "VCodeTechDigest/1.0 (+https://vcode.zeleznalady.cz/blog/)",
    feedMaxBytes: integer("BLOG_FEED_MAX_BYTES", 2_000_000, 64_000),
    feedMaxItems: integer("BLOG_FEED_MAX_ITEMS", 100, 10),
    feedTimeoutMs: integer("BLOG_FEED_TIMEOUT_MS", 15_000, 1_000),
    feedMaxRedirects: integer("BLOG_FEED_MAX_REDIRECTS", 3, 0)
  };
}
