import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const origin = 'https://vcode.zeleznalady.cz';
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
const asArray = value => value == null ? [] : Array.isArray(value) ? value : [value];
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value.replaceAll('&amp;', '&')]));
const fail = (ok, message) => assert.ok(ok, message);
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...await walk(join(dir, entry.name)));
    else if (entry.name === 'index.html') out.push(join(dir, entry.name));
  }
  return out;
}
const pages = new Map();
for (const file of await walk('dist')) {
  const path = file.slice('dist'.length).replace(/index\.html$/, '');
  const html = await readFile(file, 'utf8');
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attrs(tag));
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attrs(tag));
  const noindex = meta.some(item => item.name === 'robots' && item.content?.includes('noindex'));
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(([, json]) => asArray(JSON.parse(json)));
  pages.set(path, { file, html, links, meta, noindex, schemas });
}
const index = parser.parse(await readFile('dist/sitemap-index.xml', 'utf8'));
const sitemapUrls = new Set();
for (const sitemap of asArray(index.sitemapindex.sitemap)) {
  const url = new URL(sitemap.loc);
  fail(url.origin === origin, 'Sitemap origin must be canonical');
  const xml = parser.parse(await readFile(join('dist', url.pathname), 'utf8'));
  for (const item of asArray(xml.urlset.url)) sitemapUrls.add(item.loc);
}
let count = 0;
for (const [path, page] of pages) {
  if (page.noindex) {
    fail(!sitemapUrls.has(origin + path), `${path}: noindex page in sitemap`);
    continue;
  }
  count++;
  fail(!/^\/(?:prehled|preview-local|internal|api)(?:\/|$)/.test(path), `${path}: private route in public build`);
  fail(sitemapUrls.has(origin + path), `${path}: missing sitemap entry`);
  fail(page.links.filter(item => item.rel === 'canonical').length === 1 && page.links.some(item => item.rel === 'canonical' && item.href === origin + path), `${path}: invalid canonical`);
  fail((page.html.match(/<h1\b/g) ?? []).length === 1, `${path}: expected one H1`);
  fail(/<title>[^<]+<\/title>/.test(page.html), `${path}: missing title`);
  fail(page.meta.filter(item => item.name === 'description' && item.content).length === 1, `${path}: missing description`);
  fail(page.meta.some(item => item.name === 'robots' && item.content?.includes('max-image-preview:large')), `${path}: missing image preview permission`);
  for (const lang of ['cs', 'en', 'x-default']) {
    const alternate = page.links.find(item => item.hreflang === lang);
    fail(alternate, `${path}: missing ${lang} alternate`);
    const url = new URL(alternate.href);
    fail(url.origin === origin && !url.hash && !url.search, `${path}: noncanonical alternate`);
    const other = pages.get(url.pathname);
    fail(other && !other.noindex, `${path}: alternate has no public page: ${url.pathname}`);
    if (lang !== 'x-default') fail(other.links.some(item => item.hreflang && item.href === origin + path), `${path}: nonreciprocal alternate`);
  }
  fail(page.schemas.some(item => item['@type'] === 'WebPage' && item.url === origin + path), `${path}: missing WebPage identity`);
  if (/^\/(?:aplikace|en\/apps)\//.test(path)) fail(page.schemas.some(item => ['SoftwareApplication', 'VideoGame'].includes(item['@type']) && item['@id'] && item.description && item.inLanguage), `${path}: missing app facts`);
  if (/^\/(?:navody|en\/guides)\/[^/]+\/$/.test(path) && !path.includes('/aplikace/')) fail(page.schemas.some(item => item['@type'] === 'TechArticle' && item.dateModified), `${path}: missing reviewed guide metadata`);
  for (const link of [...page.html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(([, href]) => href)) {
    if (!link.startsWith('/') || link.startsWith('//')) continue;
    const url = new URL(link.replaceAll('&amp;', '&'), origin);
    if (/^\/(?:blog|en\/blog|prehled|downloads|api)(?:\/|$)/.test(url.pathname)) continue;
    if (url.pathname.endsWith('/')) fail(pages.has(url.pathname) && !pages.get(url.pathname).noindex, `${path}: broken public page link ${url.pathname}`);
    else await access(join('dist', decodeURIComponent(url.pathname))).catch(() => fail(false, `${path}: missing local asset ${url.pathname}`));
  }
}
for (const url of sitemapUrls) fail(pages.has(new URL(url).pathname) && !pages.get(new URL(url).pathname).noindex, `Sitemap contains nonpublic URL ${url}`);
const reference = await readFile('dist/llms.txt', 'utf8');
for (const [path] of pages) if (/^\/(?:aplikace|en\/apps)\//.test(path)) fail(reference.includes(origin + path), `AI reference missing ${path}`);
const robots = await readFile('dist/robots.txt', 'utf8');
for (const agent of ['*', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
  const block = robots.split(/\n\n/).find(part => part.split('\n').includes(`User-agent: ${agent}`));
  fail(block?.includes('Allow: /') && block.includes('Disallow: /prehled') && block.includes('Disallow: /preview-local/'), `${agent}: unsafe discovery rules`);
}
console.log(`Discoverability: ${count} public static pages; sitemap, reciprocal languages, structured facts, links, AI reference and private exclusions verified.`);
