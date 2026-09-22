import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { XMLParser } from "fast-xml-parser";
import { canonicalizeUrl } from "./pipeline.mjs";
export { defaultSources } from "./sources.mjs";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const text = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return text(value["#text"] ?? value.__cdata ?? value._);
  return "";
};

export function cleanText(value, max = 1800) {
  return text(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim()
    .slice(0, max);
}

function validUrl(value, allowedHosts) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedHosts.includes(url.hostname.toLowerCase()) ? canonicalizeUrl(url.href) : "";
  } catch { return ""; }
}

export function parseFeed(xml, source) {
  const document = parser.parse(xml);
  const rssItems = asArray(document?.rss?.channel?.item);
  const atomItems = asArray(document?.feed?.entry);
  const allowedHosts = source.allowedHosts ?? [new URL(source.homepageUrl).hostname];
  return [...rssItems, ...atomItems].flatMap((item) => {
    const atomLink = asArray(item?.link).find((candidate) => candidate?.["@_rel"] === "alternate") ?? asArray(item?.link)[0];
    const url = validUrl(text(item?.link) || text(atomLink?.["@_href"]) || text(item?.guid), allowedHosts);
    const title = cleanText(item?.title, 240);
    if (!url || !title) return [];
    const summary = cleanText(item?.description ?? item?.summary ?? item?.content, 1800);
    const dateValue = text(item?.pubDate ?? item?.published ?? item?.updated);
    const parsedDate = dateValue ? new Date(dateValue) : null;
    return [{
      id: createHash("sha256").update(url).digest("hex"),
      sourceId: source.id,
      sourceName: source.name,
      title,
      url,
      summary,
      author: cleanText(item?.author?.name ?? item?.author ?? item?.["dc:creator"], 160) || null,
      publishedAt: parsedDate && !Number.isNaN(parsedDate.valueOf()) ? parsedDate.toISOString() : null
    }];
  });
}

export function privateAddress(address) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && [0, 168].includes(b)) || (a === 198 && [18, 19, 51].includes(b))
      || (a === 203 && b === 0) || a >= 224;
  }
  const value = address.toLowerCase();
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateAddress(mapped[1]);
  return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd")
    || /^fe[89ab]/.test(value) || value.startsWith("ff");
}

async function assertSafeFeedUrl(raw, source) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || !(source.allowedHosts ?? []).includes(url.hostname.toLowerCase())) throw new Error("feed URL left its allowlisted HTTPS hosts");
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => privateAddress(address))) throw new Error("feed host resolved to a non-public address");
  return url;
}

async function readBoundedBody(response, maxBytes) {
  const declared = Number.parseInt(response.headers.get("content-length") ?? "0", 10);
  if (Number.isFinite(declared) && declared > maxBytes) throw new Error(`feed exceeds ${maxBytes} byte safety limit`);
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error(`feed exceeds ${maxBytes} byte safety limit`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

export async function fetchFeed(source, cache, userAgent, options = {}) {
  const headers = { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml", "User-Agent": userAgent };
  if (cache?.etag) headers["If-None-Match"] = cache.etag;
  if (cache?.last_modified) headers["If-Modified-Since"] = cache.last_modified;
  const maxBytes = options.maxBytes ?? 2_000_000;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const maxRedirects = options.maxRedirects ?? 3;
  let current = source.feedUrl;
  let response;
  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    await assertSafeFeedUrl(current, source);
    response = await fetch(current, { headers, signal: AbortSignal.timeout(timeoutMs), redirect: "manual" });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get("location");
    if (!location || redirects === maxRedirects) throw new Error("feed exceeded its redirect limit");
    current = new URL(location, current).href;
  }
  if (response.status === 304) return { unchanged: true, items: [], etag: cache?.etag, lastModified: cache?.last_modified };
  if (!response.ok) throw new Error(`feed returned HTTP ${response.status}`);
  const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
  if (!/(rss|atom|xml|text\/plain)/.test(contentType)) throw new Error(`feed returned unsupported content type ${contentType || "unknown"}`);
  const body = await readBoundedBody(response, maxBytes);
  return {
    unchanged: false,
    items: parseFeed(body, source).slice(0, options.maxItems ?? 100),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  };
}
