import assert from "node:assert/strict";
import test from "node:test";
import { cleanText, parseFeed, privateAddress } from "../feeds.mjs";
import { boundCandidates, validateArticle } from "../openai.mjs";
import { buildEvidencePack, canonicalizeUrl, clusterCandidates, selectEvidenceCluster, titleSimilarity } from "../pipeline.mjs";
import { escapeHtml, renderIndex } from "../render.mjs";
import { activeSources, defaultSources } from "../sources.mjs";

const source = { id: "root", name: "Root.cz", homepageUrl: "https://www.root.cz/" };

test("RSS parser keeps only HTTPS links from the configured publication", () => {
  const xml = `<?xml version="1.0"?><rss><channel><item><title>Bezpečný &amp; otevřený software</title><link>https://www.root.cz/clanky/test/</link><description><![CDATA[<p>Krátký <b>souhrn</b>.</p>]]></description><pubDate>Mon, 21 Sep 2026 10:00:00 GMT</pubDate></item><item><title>Cizí web</title><link>https://example.com/a</link></item></channel></rss>`;
  const items = parseFeed(xml, source);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Bezpečný & otevřený software");
  assert.equal(items[0].summary, "Krátký souhrn.");
});

test("feed text removes executable markup", () => {
  assert.equal(cleanText("<script>alert(1)</script><p>Čistý text</p>"), "Čistý text");
});

test("feed network guard rejects private and link-local addresses", () => {
  const dotted = (...parts) => parts.join(".");
  for (const address of [dotted(127, 0, 0, 1), dotted(10, 0, 0, 4), dotted(172, 20, 0, 3), dotted(192, 168, 1, 5), dotted(169, 254, 1, 1), "::1", "fd00::1", "fe80::1", `::ffff:${dotted(127, 0, 0, 1)}`]) {
    assert.equal(privateAddress(address), true, address);
  }
  assert.equal(privateAddress("8.8.8.8"), false);
  assert.equal(privateAddress("2606:4700:4700::1111"), false);
});

test("article validator requires two publications and bounded bilingual content", () => {
  const paragraph = "Toto je dostatečně dlouhý odstavec, který věcně vysvětluje technologickou změnu a její praktické souvislosti bez přebírání původního textu. ".repeat(5);
  const candidates = [{ id: "a".repeat(64), sourceName: "Root.cz" }, { id: "b".repeat(64), sourceName: "Lupa.cz" }];
  const translation = { title: "Důležitá technologická změna", dek: "Souhrn podstatné změny a jejího dopadu pro běžné uživatele i organizace.", sections: [1,2,3].map((n) => ({ heading: `Souvislost číslo ${n}`, paragraphs: [paragraph], source_ids: candidates.map((item) => item.id) })), key_points: ["První jasný bod pro čtenáře", "Druhý jasný bod pro čtenáře", "Třetí jasný bod pro čtenáře"] };
  const article = {
    topic: "ai", hero_variant: "grid", cs: translation, en: translation, source_ids: candidates.map((item) => item.id),
    claims: [{ cs: "Ověřené věcné tvrzení podložené oběma zdroji.", en: "A verified factual claim supported by both sources.", kind: "fact", source_ids: candidates.map((item) => item.id) },
      { cs: "Druhé ověřené tvrzení s dohledatelnými podklady.", en: "A second verified statement with traceable evidence.", kind: "fact", source_ids: candidates.map((item) => item.id) },
      { cs: "Opatrná interpretace praktického dopadu této změny.", en: "A cautious interpretation of the practical impact.", kind: "interpretation", source_ids: candidates.map((item) => item.id) }]
  };
  assert.equal(validateArticle(article, candidates), article);
});

test("renderer escapes article list content", () => {
  const html = renderIndex([{ slug: "bezpecny", title: "<script>alert(1)</script>", dek: "Text", topic: "ai", published_at: "2026-09-21T10:00:00Z" }], "cs");
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.equal(escapeHtml(`\"<&'`), "&quot;&lt;&amp;&#39;");
});

test("candidate bounding preserves valid JSON and independent publications", () => {
  const candidates = [
    { id: "a".repeat(64), sourceId: "root", sourceName: "Root.cz", title: "A", summary: "a".repeat(800), url: "https://www.root.cz/a", publishedAt: null },
    { id: "b".repeat(64), sourceId: "root", sourceName: "Root.cz", title: "B", summary: "b".repeat(800), url: "https://www.root.cz/b", publishedAt: null },
    { id: "c".repeat(64), sourceId: "lupa", sourceName: "Lupa.cz", title: "C", summary: "c".repeat(800), url: "https://www.lupa.cz/c", publishedAt: null }
  ];
  const selected = boundCandidates(candidates, 2300);
  assert.equal(new Set(selected.map((item) => item.sourceId)).size, 2);
  assert.ok(JSON.stringify(selected).length < 3000);
});

test("source registry starts with verified feeds and keeps unverified adapters disabled", () => {
  assert.equal(defaultSources.length, 12);
  assert.equal(activeSources().length, 11);
  assert.equal(defaultSources.find((item) => item.id === "anthropic")?.enabled, false);
});

test("URL canonicalization removes marketing parameters and normalizes paths", () => {
  assert.equal(canonicalizeUrl("https://Example.com/a//b/?utm_source=test&b=2&a=1#part"), "https://example.com/a/b?a=1&b=2");
});

test("editorial pipeline clusters similar headlines and builds provenance", () => {
  const now = new Date().toISOString();
  const candidates = [
    { id: "a".repeat(64), sourceId: "openai", sourceName: "OpenAI", trustTier: "primary", sourceKind: "official", language: "en", title: "New AI model improves efficient inference", summary: "A new AI model improves efficient inference for application developers.", url: "https://openai.com/a", publishedAt: now },
    { id: "b".repeat(64), sourceId: "root", sourceName: "Root.cz", trustTier: "editorial", sourceKind: "publication", language: "cs", title: "New AI model improves inference efficiency", summary: "Nový AI model a jeho praktické použití pro vývojáře.", url: "https://www.root.cz/b", publishedAt: now }
  ];
  assert.ok(titleSimilarity(candidates[0].title, candidates[1].title) > 0.4);
  const clusters = clusterCandidates(candidates);
  assert.equal(clusters.length, 1);
  const evidence = buildEvidencePack(selectEvidenceCluster(candidates));
  assert.equal(evidence.policy, "primary-source");
  assert.equal(evidence.sources.length, 2);
});

test("a single source is accepted only when it is authoritative and official", () => {
  const paragraph = "This sufficiently long paragraph explains the technical change and its practical consequences without copying the source wording. ".repeat(12);
  const candidate = { id: "c".repeat(64), sourceName: "NÚKIB", trustTier: "authority", sourceKind: "official" };
  const translation = { title: "Authoritative security information", dek: "A careful summary of an authoritative security update and its practical impact.", sections: [1, 2, 3].map((n) => ({ heading: `Authoritative context ${n}`, paragraphs: [paragraph], source_ids: [candidate.id] })), key_points: ["First practical and verifiable point", "Second practical and verifiable point", "Third practical and verifiable point"] };
  const claims = [1, 2, 3].map((n) => ({ cs: `Ověřené tvrzení číslo ${n} z autoritativního zdroje.`, en: `Verified claim number ${n} from the authoritative source.`, kind: "fact", source_ids: [candidate.id] }));
  const article = { topic: "security", hero_variant: "signals", cs: translation, en: translation, source_ids: [candidate.id], claims };
  assert.equal(validateArticle(article, [candidate]), article);
  assert.throws(() => validateArticle(article, [{ ...candidate, trustTier: "editorial", sourceKind: "publication" }]), /independent publications/);
});
