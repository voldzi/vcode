import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

export const defaultSources = [
  { id: "root", name: "Root.cz", feedUrl: "https://www.root.cz/rss/clanky/", homepageUrl: "https://www.root.cz/" },
  { id: "lupa", name: "Lupa.cz", feedUrl: "https://www.lupa.cz/rss/clanky/", homepageUrl: "https://www.lupa.cz/" },
  { id: "computertrends", name: "Computertrends", feedUrl: "https://www.computertrends.cz/rss/clanky/", homepageUrl: "https://www.computertrends.cz/" },
  { id: "umeligence", name: "Uměligence.cz", feedUrl: "https://www.umeligence.cz/rss.xml", homepageUrl: "https://www.umeligence.cz/" }
];

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

function validUrl(value, expectedHost) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === expectedHost || url.hostname.endsWith(`.${expectedHost}`)) ? url.href : "";
  } catch { return ""; }
}

export function parseFeed(xml, source) {
  const document = parser.parse(xml);
  const rssItems = asArray(document?.rss?.channel?.item);
  const atomItems = asArray(document?.feed?.entry);
  const expectedHost = new URL(source.homepageUrl).hostname;
  return [...rssItems, ...atomItems].flatMap((item) => {
    const atomLink = asArray(item?.link).find((candidate) => candidate?.["@_rel"] === "alternate") ?? asArray(item?.link)[0];
    const url = validUrl(text(item?.link) || text(atomLink?.["@_href"]) || text(item?.guid), expectedHost);
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

export async function fetchFeed(source, cache, userAgent) {
  const headers = { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml", "User-Agent": userAgent };
  if (cache?.etag) headers["If-None-Match"] = cache.etag;
  if (cache?.last_modified) headers["If-Modified-Since"] = cache.last_modified;
  const response = await fetch(source.feedUrl, { headers, signal: AbortSignal.timeout(15_000), redirect: "follow" });
  if (response.status === 304) return { unchanged: true, items: [], etag: cache?.etag, lastModified: cache?.last_modified };
  if (!response.ok) throw new Error(`feed returned HTTP ${response.status}`);
  const body = await response.text();
  if (body.length > 2_000_000) throw new Error("feed exceeds 2 MB safety limit");
  return {
    unchanged: false,
    items: parseFeed(body, source),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  };
}
