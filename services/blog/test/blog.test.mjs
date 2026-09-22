import assert from "node:assert/strict";
import test from "node:test";
import { cleanText, parseFeed } from "../feeds.mjs";
import { boundCandidates, validateArticle } from "../openai.mjs";
import { escapeHtml, renderIndex } from "../render.mjs";

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

test("article validator requires two publications and bounded bilingual content", () => {
  const paragraph = "Toto je dostatečně dlouhý odstavec, který věcně vysvětluje technologickou změnu a její praktické souvislosti bez přebírání původního textu. ".repeat(5);
  const candidates = [{ id: "a".repeat(64), sourceName: "Root.cz" }, { id: "b".repeat(64), sourceName: "Lupa.cz" }];
  const translation = { title: "Důležitá technologická změna", dek: "Souhrn podstatné změny a jejího dopadu pro běžné uživatele i organizace.", sections: [1,2,3].map((n) => ({ heading: `Souvislost číslo ${n}`, paragraphs: [paragraph], source_ids: candidates.map((item) => item.id) })), key_points: ["První jasný bod pro čtenáře", "Druhý jasný bod pro čtenáře", "Třetí jasný bod pro čtenáře"] };
  const article = { topic: "ai", hero_variant: "grid", cs: translation, en: translation, source_ids: candidates.map((item) => item.id) };
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
