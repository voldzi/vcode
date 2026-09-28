import { XMLParser } from "fast-xml-parser";

const origin = new URL(process.env.PUBLIC_SITE_URL ?? "https://vcode.zeleznalady.cz");
const key = "9aac48ffeaa997f7c28213c058c405e3";
const parser = new XMLParser({ ignoreAttributes: true });
const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];

export async function collectPublicUrls(siteOrigin, fetchImpl = fetch) {
  const pending = ["/sitemap-index.xml", "/blog-sitemap.xml"].map((path) => new URL(path, siteOrigin).href);
  const visited = new Set();
  const urls = new Set();
  while (pending.length) {
    const sitemapUrl = pending.shift();
    if (visited.has(sitemapUrl)) continue;
    if (visited.size >= 20) throw new Error("Too many sitemaps");
    visited.add(sitemapUrl);
    const response = await fetchImpl(sitemapUrl, { redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Sitemap unavailable: ${sitemapUrl} (${response.status})`);
    const xml = await response.text();
    if (xml.length > 2_000_000) throw new Error(`Sitemap too large: ${sitemapUrl}`);
    const document = parser.parse(xml);
    if (!document.sitemapindex && !document.urlset) throw new Error(`Invalid sitemap: ${sitemapUrl}`);
    for (const item of asArray(document.sitemapindex?.sitemap)) {
      const url = new URL(item.loc);
      if (url.origin !== siteOrigin.origin || !url.pathname.endsWith(".xml")) throw new Error(`Unexpected sitemap URL: ${url.href}`);
      pending.push(url.href);
    }
    for (const item of asArray(document.urlset?.url)) {
      const url = new URL(item.loc);
      if (url.origin !== siteOrigin.origin || url.search || url.hash || url.pathname.includes("/review/")) throw new Error(`Unexpected public URL: ${url.href}`);
      urls.add(url.href);
      if (urls.size > 10_000) throw new Error("Too many public URLs");
    }
  }
  if (!urls.size) throw new Error("Sitemaps contain no public URLs");
  return [...urls].sort();
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  const urlList = await collectPublicUrls(origin);
  if (process.argv.includes("--dry-run")) {
    console.log(`Found ${urlList.length} public canonical URLs.`);
  } else {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: origin.host, key, keyLocation: new URL(`/${key}.txt`, origin).href, urlList }),
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw new Error(`IndexNow rejected the request: ${response.status} ${await response.text()}`);
    console.log(`IndexNow accepted ${urlList.length} canonical URLs (${response.status}).`);
  }
}
