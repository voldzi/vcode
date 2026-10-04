import { createHash } from "node:crypto";
import { assertSafeFeedUrl, readBoundedBody, cleanText } from "./feeds.mjs";

export function pageMetadata(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
  const meta = tags.map(attributes);
  return cleanText(meta.find(m => m.name === "description")?.content ?? meta.find(m => m.property === "og:description")?.content ?? "", 1800);
}

export function documentationLink(html, baseUrl, allowedHosts) {
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1].replace(/&amp;/g, "&"), baseUrl);
      if (url.protocol === "https:" && allowedHosts.includes(url.hostname) && /docs|documentation|help|getting.started/i.test(url.href + " " + cleanText(match[2]))) return url.href;
    } catch {}
  }
  return null;
}

export async function researchCluster(cluster, sources, config) {
  const items = cluster.items.map(i => ({ ...i }));
  const audit = [];
  // Read only selected official public pages. Retain descriptions and hashes, never page bodies.
  for (const item of items.filter(i => i.sourceKind === "official").slice(0, 2)) {
    const source = sources.find(s => s.id === item.sourceId);
    if (!source) continue;
    try {
      let url = item.url;
      let response;
      for (let redirects = 0; redirects <= 3; redirects++) {
        await assertSafeFeedUrl(url, source);
        response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(config.feedTimeoutMs), headers: { "User-Agent": config.feedUserAgent } });
        if (![301,302,303,307,308].includes(response.status)) break;
        if (redirects === 3 || !response.headers.get("location")) throw new Error("research redirect limit");
        url = new URL(response.headers.get("location"), url).href;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!/text\/html/.test(response.headers.get("content-type") ?? "")) throw new Error("research requires HTML");
      const html = await readBoundedBody(response, config.feedMaxBytes);
      const description = pageMetadata(html);
      if (description && !item.summary.includes(description)) item.summary = `${item.summary}\nOfficial page description: ${description}`;
      const researchHosts = [...source.allowedHosts, ...(source.id === "openai" ? ["help.openai.com", "platform.openai.com", "developers.openai.com"] : [])];
      const related = documentationLink(html, url, researchHosts);
      if (related && !items.some(i => i.url === related)) {
        try {
          await assertSafeFeedUrl(related, { ...source, allowedHosts: researchHosts });
          const doc = await fetch(related, { redirect: "error", signal: AbortSignal.timeout(config.feedTimeoutMs), headers: { "User-Agent": config.feedUserAgent } });
          if (!doc.ok || !/text\/html/.test(doc.headers.get("content-type") ?? "")) throw new Error("documentation unavailable");
          const docHtml = await readBoundedBody(doc, config.feedMaxBytes);
          const summary = pageMetadata(docHtml);
          if (summary) items.push({ ...item, id:createHash("sha256").update(related).digest("hex"), url:related, title:cleanText(docHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "Official documentation",240), summary, publishedAt:null });
          audit.push({ url:related, status:"checked", kind:"documentation", description_available:Boolean(summary), checked_at:new Date().toISOString() });
        } catch { audit.push({url:related,status:"failed",kind:"documentation"}); }
      }
      audit.push({ source_id: item.id, url, checked_at: new Date().toISOString(), status: "checked", description_available: Boolean(description), sha256: createHash("sha256").update(html).digest("hex") });
    } catch (error) {
      audit.push({ source_id: item.id, checked_at: new Date().toISOString(), status: "failed", reason: String(error.message).slice(0,200) });
    }
  }
  if (items.every(i => i.sourceKind === "official") && !audit.some(a => a.status === "checked")) throw new Error("selected official sources could not be verified on public pages");
  return { items, audit };
}
