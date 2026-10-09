import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getPublicProducts } from '../src/lib/products.ts';

const base = 'https://vcode.zeleznalady.cz';
const catalog = JSON.parse(await readFile(new URL('../services/blog/contact-catalog.json', import.meta.url), 'utf8'));
const publicProducts = getPublicProducts().map(({ id, name }) => ({ id, name }));
assert.deepEqual(catalog, publicProducts, 'The accepted enquiry catalog must exactly match the published portfolio, including current product names.');
const api = JSON.parse(await readFile(new URL('../openapi/openapi.json', import.meta.url), 'utf8'));
assert.deepEqual(api.components.schemas.ContactApplication.enum, publicProducts.map(({ id }) => id), 'The documented contact choices must match the canonical public product IDs.');
assert.ok(!Object.keys(api.paths).some(path => path.startsWith('/internal/')), 'Internal service routes must never enter the public contract.');

const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  return String.fromCodePoint(entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1)));
});
const attrs = source => new Map([...source.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map(([, name, quoted, single, bare]) => [name, decode(quoted ?? single ?? bare ?? '')]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'gi'))].map(([, attributes]) => attrs(attributes));

for (const page of [
  { lang: 'cs', route: '/spoluprace/', other: '/en/work-with-us/', subject: 'Zájem o spolupráci', privacy: '/soukromi/#poptavky-soukromi' },
  { lang: 'en', route: '/en/work-with-us/', other: '/spoluprace/', subject: 'Collaboration enquiry', privacy: '/en/privacy/#enquiries-privacy' }
]) {
  const html = await readFile(new URL(`../dist${page.route}index.html`, import.meta.url), 'utf8');
  assert.equal(tags(html, 'html')[0]?.get('lang'), page.lang, `${page.route}: intentional page language`);
  const links = tags(html, 'link');
  assert.equal(links.find(link => link.get('rel') === 'canonical')?.get('href'), base + page.route, `${page.route}: canonical route`);
  for (const [language, route] of [[page.lang, page.route], [page.lang === 'cs' ? 'en' : 'cs', page.other]]) {
    assert.ok(links.some(link => link.get('rel') === 'alternate' && link.get('hreflang') === language && link.get('href') === base + route), `${page.route}: correct ${language} alternate`);
  }
  assert.ok(tags(html, 'script').some(script => script.get('src') === '/analytics/tracker.js' && script.get('referrerpolicy') === 'no-referrer'), `${page.route}: preserve the approved tracker without sending the contact URL as its referrer`);
  const anchorHrefs = tags(html, 'a').map(anchor => anchor.get('href')).filter(Boolean);
  assert.ok(anchorHrefs.includes(page.privacy), `${page.route}: direct link to the concrete privacy notice`);
  assert.ok(anchorHrefs.includes(page.lang === 'cs' ? '/podpora/' : '/en/support/'), `${page.route}: existing-user support`);
  assert.ok(anchorHrefs.some(href => href === `mailto:podpora@zeleznalady.cz?subject=${encodeURIComponent(page.subject)}`), `${page.route}: direct email fallback with an encoded, fixed subject`);
  for (const tag of [...tags(html, 'a'), ...tags(html, 'script'), ...tags(html, 'form')]) {
    const target = tag.get('href') ?? tag.get('src') ?? tag.get('action');
    if (!target) continue;
    const url = new URL(target, base);
    assert.ok(![...url.searchParams.keys()].some(key => /^(?:name|email|organization|message|token|requestId|application|website)$/i.test(key)), `${page.route}: personal form data and tokens must not enter URL parameters`);
  }
  const match = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)].find(([, attributes]) => attrs(attributes).get('id') === 'contact-form');
  assert.ok(match, `${page.route}: static contact form`);
  const form = attrs(match[1]);
  assert.equal(form.get('method').toLowerCase(), 'post', `${page.route}: no form contents in a GET URL`);
  assert.equal(form.get('action'), '/api/contact', `${page.route}: only the reviewed public contact boundary`);
  assert.equal(form.get('data-locale'), page.lang, `${page.route}: explicit request locale`);
  assert.equal(form.get('data-privacy-version'), 'contact-20261009', `${page.route}: reviewed privacy version`);
  assert.ok(form.has('hidden'), `${page.route}: unavailable until the activation/challenge check succeeds`);
  assert.ok(tags(match[2], 'button').some(button => button.get('type') === 'submit' && button.has('disabled')), `${page.route}: no enabled submission before the server check`);
  const select = [...match[2].matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/gi)].find(([, attributes]) => attrs(attributes).get('name') === 'application');
  assert.ok(select, `${page.route}: canonical application choices`);
  const choices = [...select[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map(([, attributes, text]) => ({ id: attrs(attributes).get('value'), name: decode(text.trim()) })).filter(({ id }) => id);
  assert.deepEqual(choices, catalog, `${page.route}: no stale product names, drafts or private endpoint values in choices`);
  assert.ok(!html.includes('/internal/contacts'), `${page.route}: internal inbox paths stay server-side`);
  console.log(`${page.route}: canonical locales, safe fallback, disabled activation gate and ${choices.length} catalog choices verified.`);
}
