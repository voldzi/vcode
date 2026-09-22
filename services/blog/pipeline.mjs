import { createHash } from "node:crypto";

const trackingParameters = new Set(["fbclid", "gclid", "dclid", "mc_cid", "mc_eid", "ref", "source"]);
const stopWords = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "to", "with", "a", "aby", "ale", "do", "i", "jak", "je", "jsou", "na", "o", "od", "po", "pro", "se", "s", "u", "v", "ve", "z", "za"]);
const topicKeywords = new Map([
  ["ai", ["ai", "agent", "artificial intelligence", "embedding", "inference", "jazykov", "llm", "model", "neural", "uměl"]],
  ["security", ["attack", "bezpeč", "cve", "malware", "ransomware", "security", "vulnerability", "zranitel"]],
  ["software", ["api", "database", "developer", "framework", "javascript", "open source", "program", "software", "typescript", "web"]],
  ["internet", ["cloud", "datacenter", "dns", "domain", "internet", "network", "síť"]],
  ["infrastructure", ["container", "gpu", "kubernetes", "linux", "postgres", "server", "storage"]]
]);

export function canonicalizeUrl(raw) {
  const url = new URL(raw);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || trackingParameters.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
  const sorted = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  url.search = "";
  for (const [key, value] of sorted) url.searchParams.append(key, value);
  return url.href;
}

export function normalizeText(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function terms(value) {
  return new Set(normalizeText(value).split(" ").filter((term) => term.length > 2 && !stopWords.has(term)));
}

export function titleFingerprint(value) {
  return createHash("sha256").update([...terms(value)].sort().join(" ")).digest("hex");
}

export function titleSimilarity(left, right) {
  const a = terms(left);
  const b = terms(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((term) => b.has(term)).length;
  return intersection / (a.size + b.size - intersection);
}

export function relevance(item) {
  const haystack = normalizeText(`${item.title} ${item.summary}`);
  let score = item.trustTier === "authority" ? 0.3 : item.trustTier === "primary" ? 0.2 : 0;
  const topics = [];
  for (const [topic, keywords] of topicKeywords) {
    const hits = keywords.filter((keyword) => haystack.includes(normalizeText(keyword))).length;
    if (hits) {
      topics.push(topic);
      score += Math.min(0.4, hits * 0.12);
    }
  }
  const ageHours = item.publishedAt ? Math.max(0, (Date.now() - new Date(item.publishedAt).valueOf()) / 3_600_000) : 168;
  score += Math.max(0, 0.25 - ageHours / 672);
  return { score: Math.min(1, Number(score.toFixed(3))), topics };
}

export function clusterCandidates(candidates, threshold = 0.42) {
  const ranked = candidates.map((item) => ({ ...item, ...relevance(item) })).filter((item) => item.score >= 0.25)
    .sort((a, b) => b.score - a.score || String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")));
  const clusters = [];
  for (const item of ranked) {
    const cluster = clusters.find((entry) => entry.items.some((other) => titleSimilarity(item.title, other.title) >= threshold));
    if (cluster) cluster.items.push(item);
    else clusters.push({ id: titleFingerprint(item.title), items: [item] });
  }
  return clusters.map((cluster) => {
    const publishers = new Set(cluster.items.map((item) => item.sourceId));
    const hasPrimary = cluster.items.some((item) => ["primary", "authority"].includes(item.trustTier));
    return {
      ...cluster,
      publisherCount: publishers.size,
      hasPrimary,
      score: Number((Math.max(...cluster.items.map((item) => item.score)) + Math.min(0.3, (publishers.size - 1) * 0.15) + (hasPrimary ? 0.15 : 0)).toFixed(3))
    };
  }).sort((a, b) => b.score - a.score);
}

export function selectEvidenceCluster(candidates) {
  return clusterCandidates(candidates).find((cluster) => cluster.hasPrimary || cluster.publisherCount >= 2) ?? null;
}

export function buildEvidencePack(cluster) {
  if (!cluster) return null;
  const items = cluster.items.slice(0, 10);
  return {
    version: 1,
    cluster_id: cluster.id,
    score: cluster.score,
    policy: cluster.hasPrimary ? "primary-source" : "multi-publication",
    created_at: new Date().toISOString(),
    sources: items.map((item) => ({
      id: item.id,
      source_id: item.sourceId,
      publication: item.sourceName,
      title: item.title,
      url: item.url,
      published_at: item.publishedAt,
      trust_tier: item.trustTier,
      source_kind: item.sourceKind,
      language: item.language,
      summary: item.summary
    }))
  };
}
