import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";
import { moderateComment } from "./openai.mjs";
import { renderArticle, renderHeroSvg, renderIndex, renderReviewPage, renderReviewResult } from "./render.mjs";
import { applyEditorialAction, findReviewByToken } from "./review.mjs";
import { handleTelegramUpdate, telegramReady, validWebhookSecret } from "./telegram.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const css = await readFile(join(here, "blog.css"), "utf8");
const config = await loadConfig();
if (!config.commentHashSecret || config.commentHashSecret.length < 32) throw new Error("BLOG_COMMENT_HASH_SECRET must contain at least 32 characters");
const pool = createPool(config.databaseUrl);
await migrate(pool);

const send = (response, status, type, body, headers = {}) => {
  response.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff", ...headers });
  response.end(body);
};
const hash = (value) => createHash("sha256").update(`${config.commentHashSecret}:${value}`).digest("hex");
const clientIp = (request) => String(request.headers["x-forwarded-for"] ?? request.socket.remoteAddress ?? "unknown").split(",")[0].trim();

async function bodyParams(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) throw Object.assign(new Error("request body too large"), { status: 413 });
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

async function bodyJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 65_536) throw Object.assign(new Error("request body too large"), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("invalid JSON"), { status: 400 }); }
}

function validOrigin(request) {
  try {
    const supplied = request.headers.origin ?? request.headers.referer;
    return Boolean(supplied) && new URL(String(supplied)).origin === new URL(config.siteOrigin).origin;
  }
  catch { return false; }
}

async function listArticles(locale) {
  return (await pool.query(
    `SELECT a.slug,a.topic,a.published_at,t.title,t.dek FROM blog_articles a
     JOIN blog_article_translations t ON t.article_id=a.id AND t.locale=$1
     WHERE a.status='published' ORDER BY a.published_at DESC LIMIT 40`, [locale]
  )).rows;
}

async function findArticle(slug, locale) {
  return (await pool.query(
    `SELECT a.id,a.slug,a.topic,a.sources,a.hero_variant,a.published_at,t.title,t.dek,t.sections,t.key_points
     FROM blog_articles a JOIN blog_article_translations t ON t.article_id=a.id AND t.locale=$2
     WHERE a.slug=$1 AND a.status='published'`, [slug, locale]
  )).rows[0];
}

async function renderSitemap() {
  const articles = (await pool.query("SELECT slug,updated_at FROM blog_articles WHERE status='published' ORDER BY published_at DESC")).rows;
  const urls = articles.flatMap((article) => ["/blog/", "/en/blog/"].map((prefix) =>
    `<url><loc>https://vcode.zeleznalady.cz${prefix}${encodeURIComponent(article.slug)}/</loc><lastmod>${new Date(article.updated_at).toISOString()}</lastmod></url>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://vcode.zeleznalady.cz/blog/</loc></url><url><loc>https://vcode.zeleznalady.cz/en/blog/</loc></url>${urls}</urlset>`;
}

const escapeXml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" })[character]);

async function renderFeed(locale) {
  const articles = await listArticles(locale);
  const prefix = locale === "cs" ? "/blog" : "/en/blog";
  const title = locale === "cs" ? "VCode — technologický blog" : "VCode — technology blog";
  const description = locale === "cs" ? "Ověřené technologické novinky s odkazy na původní zdroje." : "Verified technology briefings with links to original sources.";
  const items = articles.map((article) => {
    const url = `${config.siteOrigin}${prefix}/${encodeURIComponent(article.slug)}/`;
    return `<item><title>${escapeXml(article.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(article.published_at).toUTCString()}</pubDate><description>${escapeXml(article.dek)}</description></item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(title)}</title><link>${config.siteOrigin}${prefix}/</link><description>${escapeXml(description)}</description><language>${locale === "cs" ? "cs-CZ" : "en-GB"}</language>${items}</channel></rss>`;
}

async function submitComment(request, response, slug) {
  if (!validOrigin(request)) return send(response, 403, "text/plain; charset=utf-8", "Forbidden");
  const form = await bodyParams(request);
  const lang = form.get("lang") === "en" ? "en" : "cs";
  const path = `${lang === "en" ? "/en" : ""}/blog/${encodeURIComponent(slug)}/`;
  if (form.get("website")) return response.writeHead(303, { Location: `${path}?comment=received` }).end();
  const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const body = String(form.get("body") ?? "").trim();
  if (name.length < 2 || name.length > 60 || body.length < 10 || body.length > 2000 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return send(response, 400, "text/plain; charset=utf-8", lang === "cs" ? "Neplatný komentář." : "Invalid comment.");
  const article = (await pool.query("SELECT id FROM blog_articles WHERE slug=$1 AND status='published'", [slug])).rows[0];
  if (!article) return send(response, 404, "text/plain; charset=utf-8", "Not found");
  const ipHash = hash(clientIp(request));
  const recent = Number((await pool.query("SELECT count(*)::int AS count FROM blog_comments WHERE ip_hash=$1 AND created_at > now() - interval '1 hour'", [ipHash])).rows[0].count);
  if (recent >= 3) return send(response, 429, "text/plain; charset=utf-8", lang === "cs" ? "Limit komentářů byl vyčerpán. Zkuste to později." : "Comment limit reached. Please try later.", { "Retry-After": "3600" });
  const moderation = await moderateComment(body, config);
  const status = moderation.flagged ? "spam" : moderation.available && config.commentAutoApprove ? "approved" : "pending";
  await pool.query(
    `INSERT INTO blog_comments (article_id,display_name,body,email_hash,ip_hash,user_agent,status,moderation,moderated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $7='pending' THEN NULL ELSE now() END)`,
    [article.id, name, body, email ? hash(email) : null, ipHash, String(request.headers["user-agent"] ?? "").slice(0, 300), status, JSON.stringify(moderation)]
  );
  response.writeHead(303, { Location: `${path}?comment=received` }).end();
}

const privateHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

async function telegramWebhook(request, response) {
  if (!telegramReady(config)) return send(response, 404, "text/plain; charset=utf-8", "Not found");
  if (!validWebhookSecret(request.headers["x-telegram-bot-api-secret-token"], config.telegramWebhookSecret)) return send(response, 403, "text/plain; charset=utf-8", "Forbidden");
  await handleTelegramUpdate(pool, await bodyJson(request), config);
  return send(response, 200, "application/json; charset=utf-8", '{"ok":true}', { "Cache-Control": "no-store" });
}

async function reviewPage(request, response, token, action = false) {
  if (!telegramReady(config)) return send(response, 404, "text/plain; charset=utf-8", "Not found");
  const review = await findReviewByToken(pool, token, config);
  if (!review) return send(response, 404, "text/plain; charset=utf-8", "Not found", privateHeaders);
  if (!action) return send(response, 200, "text/html; charset=utf-8", renderReviewPage(review, token), privateHeaders);
  if (!validOrigin(request)) return send(response, 403, "text/plain; charset=utf-8", "Forbidden", privateHeaders);
  const form = await bodyParams(request);
  const requested = form.get("action");
  if (!["publish", "reject"].includes(requested) || form.get("confirm") !== requested) return send(response, 400, "text/plain; charset=utf-8", "Akci je nutné potvrdit.", privateHeaders);
  const result = await applyEditorialAction(pool, review.request_id, requested, `telegram-link:${review.intended_user_id}`);
  return send(response, 200, "text/html; charset=utf-8", renderReviewResult(result.status), privateHeaders);
}

const server = createServer(async (request, response) => {
  const started = Date.now();
  try {
    const url = new URL(request.url ?? "/", config.siteOrigin);
    const method = request.method === "HEAD" ? "GET" : request.method;
    if (method === "GET" && url.pathname === "/health/blog") {
      await pool.query("SELECT 1");
      return send(response, 200, "application/json; charset=utf-8", JSON.stringify({ status: "ok", generationEnabled: config.generationEnabled }));
    }
    if (method === "POST" && url.pathname === "/api/blog/telegram/webhook") return await telegramWebhook(request, response);
    const reviewMatch = url.pathname.match(/^\/blog\/review\/([A-Za-z0-9_-]{40,80})(\/action)?$/);
    if (reviewMatch && ((method === "GET" && !reviewMatch[2]) || (method === "POST" && reviewMatch[2]))) return await reviewPage(request, response, reviewMatch[1], Boolean(reviewMatch[2]));
    if (method === "GET" && url.pathname === "/blog-sitemap.xml") return send(response, 200, "application/xml; charset=utf-8", await renderSitemap(), { "Cache-Control": "public,max-age=300" });
    if (method === "GET" && ["/blog/feed.xml", "/en/blog/feed.xml"].includes(url.pathname)) return send(response, 200, "application/rss+xml; charset=utf-8", await renderFeed(url.pathname.startsWith("/en/") ? "en" : "cs"), { "Cache-Control": "public,max-age=300" });
    if (method === "GET" && url.pathname === "/blog-assets/blog.css") return send(response, 200, "text/css; charset=utf-8", css, { "Cache-Control": "public,max-age=3600" });
    const artMatch = url.pathname.match(/^\/blog-assets\/([a-z0-9-]+)\.svg$/);
    if (method === "GET" && artMatch) {
      const article = (await pool.query("SELECT hero_variant FROM blog_articles WHERE slug=$1 AND status='published'", [artMatch[1]])).rows[0];
      if (!article) return send(response, 404, "text/plain; charset=utf-8", "Not found");
      return send(response, 200, "image/svg+xml; charset=utf-8", renderHeroSvg(article.hero_variant), { "Cache-Control": "public,max-age=86400" });
    }
    const locale = url.pathname.startsWith("/en/") ? "en" : "cs";
    if (method === "GET" && ["/blog", "/blog/", "/en/blog", "/en/blog/"].includes(url.pathname)) {
      return send(response, 200, "text/html; charset=utf-8", renderIndex(await listArticles(locale), locale), { "Cache-Control": "public,max-age=60,stale-while-revalidate=300" });
    }
    const articleMatch = url.pathname.match(/^\/(?:en\/)?blog\/([a-z0-9-]+)\/?$/);
    if (method === "GET" && articleMatch) {
      const article = await findArticle(articleMatch[1], locale);
      if (!article) return send(response, 404, "text/plain; charset=utf-8", "Not found");
      const comments = (await pool.query("SELECT display_name,body,created_at FROM blog_comments WHERE article_id=$1 AND status='approved' ORDER BY created_at", [article.id])).rows;
      return send(response, 200, "text/html; charset=utf-8", renderArticle(article, comments, locale, url.searchParams.get("comment") === "received"), { "Cache-Control": "private,no-cache" });
    }
    const commentMatch = url.pathname.match(/^\/api\/blog\/([a-z0-9-]+)\/comments$/);
    if (method === "POST" && commentMatch) return await submitComment(request, response, commentMatch[1]);
    send(response, 404, "text/plain; charset=utf-8", "Not found");
  } catch (error) {
    const status = Number(error.status) || 500;
    const safePath = String(request.url ?? "").replace(/(\/blog\/review\/)[A-Za-z0-9_-]+/g, "$1[redacted]");
    console.error(JSON.stringify({ time: new Date().toISOString(), service: "vcode-blog", event: "request_failed", path: safePath, status, durationMs: Date.now() - started, error: error.message }));
    if (!response.headersSent) send(response, status, "text/plain; charset=utf-8", status === 500 ? "Internal server error" : error.message);
  }
});

server.listen(config.port, "0.0.0.0", () => console.log(JSON.stringify({ time: new Date().toISOString(), service: "vcode-blog", event: "listening", port: config.port })));
const shutdown = async () => { server.close(); await pool.end(); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
