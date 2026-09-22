import { fetchFeed } from "../services/blog/feeds.mjs";
import { activeSources, defaultSources } from "../services/blog/sources.mjs";

const userAgent = "VCodeSourceValidator/1.0 (+https://vcode.zeleznalady.cz/blog/)";
const results = await Promise.all(activeSources().map(async (source) => {
  const started = performance.now();
  try {
    const feed = await fetchFeed(source, {}, userAgent, { maxBytes: 2_000_000, timeoutMs: 15_000, maxRedirects: 3 });
    return { id: source.id, ok: true, items: feed.items.length, duration_ms: Math.round(performance.now() - started) };
  } catch (error) {
    return { id: source.id, ok: false, error: String(error.message).slice(0, 240), duration_ms: Math.round(performance.now() - started) };
  }
}));

console.log(JSON.stringify({ checked_at: new Date().toISOString(), configured: defaultSources.length, active: results.length, results }, null, 2));
if (results.some((result) => !result.ok)) process.exitCode = 1;
