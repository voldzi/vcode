import { createHash } from "node:crypto";

const trackingParameters = new Set(["fbclid", "gclid", "dclid", "mc_cid", "mc_eid", "ref", "source"]);
const stopWords = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "to", "with", "a", "aby", "ale", "do", "i", "jak", "je", "jsou", "na", "o", "od", "po", "pro", "se", "s", "u", "v", "ve", "z", "za"]);
const topicKeywords = new Map([
  ["ai", ["ai", "agent", "artificial intelligence", "embedding", "gpt", "inference", "jazykov", "llm", "model", "neural", "uměl"]],
  ["security", ["attack", "bezpeč", "cve", "malware", "ransomware", "security", "vulnerability", "zranitel"]],
  ["software", ["api", "database", "developer", "framework", "javascript", "open source", "program", "software", "typescript", "web"]],
  ["internet", ["cloud", "datacenter", "dns", "domain", "internet", "network", "síť"]],
  ["infrastructure", ["container", "gpu", "kubernetes", "linux", "postgres", "server", "storage"]]
]);
const keywordMatches = (haystack, keyword) => {
  const normalized = normalizeText(keyword);
  return normalized.length <= 3
    ? ` ${haystack} `.includes(` ${normalized} `)
    : haystack.includes(normalized);
};

function topicHits(value) {
  const haystack = normalizeText(value);
  return [...topicKeywords].map(([topic, keywords]) => ({
    topic, hits: keywords.filter((keyword) => keywordMatches(haystack, keyword)).length
  }));
}

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
  const titleHits = topicHits(item.title);
  const combinedHits = topicHits(`${item.title} ${item.summary}`);
  let score = item.trustTier === "authority" ? 0.3 : item.trustTier === "primary" ? 0.2 : 0;
  const topics = combinedHits.filter(({ hits }) => hits).map(({ topic }) => topic);
  score += Math.min(0.4, Math.max(0, ...combinedHits.map(({ hits }) => hits)) * 0.12);
  const rankedTopics = combinedHits.map(({ topic, hits }, index) => ({ topic, hits, titleHits: titleHits[index].hits }))
    .sort((a, b) => b.titleHits - a.titleHits || b.hits - a.hits);
  const primaryTopic = rankedTopics[0]?.hits
    ? (rankedTopics[0].topic === "infrastructure" ? "software" : rankedTopics[0].topic)
    : null;
  const ageHours = item.publishedAt ? Math.max(0, (Date.now() - new Date(item.publishedAt).valueOf()) / 3_600_000) : 168;
  score += Math.max(0, 0.25 - ageHours / 672);
  return { score: Math.min(1, Number(score.toFixed(3))), topics, primaryTopic };
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
    const hasPrimary = cluster.items.some((item) => item.sourceKind === "official" && ["primary", "authority"].includes(item.trustTier));
    return {
      ...cluster,
      primaryTopic: cluster.items[0].primaryTopic,
      publisherCount: publishers.size,
      hasPrimary,
      score: Number((Math.max(...cluster.items.map((item) => item.score)) + Math.min(0.3, (publishers.size - 1) * 0.15) + (hasPrimary ? 0.15 : 0)).toFixed(3))
    };
  }).sort((a, b) => b.score - a.score);
}

export function selectEvidenceCluster(candidates, recentArticles = []) {
  const eligible = clusterCandidates(candidates).filter((cluster) => cluster.hasPrimary || cluster.publisherCount >= 2);
  return eligible.map((cluster) => {
    const repeatedTopic = recentArticles.filter((article) => article.topic === cluster.primaryTopic).length;
    const repeatedPublisher = recentArticles.some((article) => article.sourceIds?.includes(cluster.items[0].sourceId));
    const topicPenalty = Math.min(0.45, repeatedTopic * 0.2)
      + (recentArticles[0]?.topic === cluster.primaryTopic ? 0.08 : 0);
    return { ...cluster, selectionScore: Number((cluster.score - topicPenalty - (repeatedPublisher ? 0.07 : 0)).toFixed(3)) };
  }).sort((a, b) => b.selectionScore - a.selectionScore || b.score - a.score)[0] ?? null;
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
