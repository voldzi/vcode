import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, symlink, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { canReadDownloadMetrics, readDownloadMetrics, validateDownloadMetrics } from '../lib/download-metrics.mjs';

const NOW = Date.parse('2026-10-08T14:00:00.000Z');
const ID = '11111111-2222-3333-4444-555555555555';
const RELEASE = '0.6.0-202610081337';
const ZIP = `VCodeRecall-${RELEASE}-macos-arm64.zip`;
const DMG = `VCodeRecall-${RELEASE}-macos-arm64.dmg`;
const counters = { getRequests: 3, headRequests: 1, fullResponses: 1, rangeResponses: 1, errorResponses: 1, abortedResponses: 1, bytesWritten: 2048, clickIntents: 1 };
const fixture = () => ({
  schemaVersion: 1, product: 'vcode-recall', measurement: 'service-to-proxy', retentionDays: 30, timezone: 'UTC',
  coverageStart: '2026-10-01T12:00:00.000Z', updatedAt: '2026-10-08T13:45:00.000Z',
  releases: [{ id: RELEASE, version: '0.6.0', buildNumber: '202610081337', artifacts: [ZIP, DMG] }],
  days: [
    { date: '2026-10-07', release: RELEASE, artifact: ZIP, ...counters },
    { date: '2026-10-07', release: RELEASE, artifact: null, ...counters, getRequests: 2, bytesWritten: 321, clickIntents: 5 },
  ],
});

  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.value = ''; this.hidden = false; this.events = new Map(); this.focused = false; this.classList = { add: name => { this.className = name; } }; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; this._text = '';  }
    setAttribute(name, value) { this.attributes[name] = value; if (name === 'class') this.className = value; }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return (this._text ?? '') + this.children.map(child => child.textContent ?? '').join(' '); }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener(name, listener) { this.events.set(name, listener); }
    focus() { this.focused = true; this.events.get('focus')?.(); }
    querySelectorAll(tag) { return this.children.flatMap(child => [child, ...child.querySelectorAll(tag)]).filter(child => child.tagName === tag); }
  }

test('file transfers, metadata requests and click intents remain distinct; gaps do not become zeroes', () => {
  const parsed = validateDownloadMetrics(fixture(), { now: NOW, days: 90 });
  assert.equal(parsed.availability, 'available');
  assert.equal(parsed.requestedDays, 90); assert.equal(parsed.periodDays, 30);
  assert.equal(parsed.totals.getRequests, 3); assert.equal(parsed.totals.headRequests, 1);
  assert.equal(parsed.totals.bytesWritten, 2048); assert.equal(parsed.totals.clickIntents, 6);
  assert.equal(parsed.metadata.getRequests, 2); assert.equal(parsed.metadata.bytesWritten, 321);
  assert.equal(parsed.series.length, 1); assert.equal(parsed.series[0].date, '2026-10-07');
  assert.equal(parsed.artifacts.length, 1); assert.equal(parsed.artifacts[0].artifact, ZIP);
  assert.equal(parsed.measurement, 'service-to-proxy');
  assert.ok(!Object.hasOwn(parsed, 'installations')); assert.ok(!Object.hasOwn(parsed, 'uniqueVisitors'));
});

test('empty durable coverage returns no KPI totals instead of a fabricated zero', () => {
  const document = fixture(); document.days = [];
  const parsed = validateDownloadMetrics(document, { now: NOW });
  assert.equal(parsed.empty, true); assert.equal(parsed.totals, null); assert.deepEqual(parsed.series, []);
});

test('strict private aggregate contract rejects identifying fields, unknown artifacts and invalid counters', () => {
  const cases = [
    document => document.ip = '192.0.2.1',
    document => document.days[0].referrer = 'https://example.invalid/private',
    document => document.days[0].bytesWritten = '2048',
    document => document.days[0].getRequests = -1,
    document => document.days[0].getRequests = Number.MAX_SAFE_INTEGER + 1,
    document => delete document.days[0].abortedResponses,
    document => document.days[0].artifact = '../private.zip',
    document => document.days[0].artifact = 'unpublished.zip',
    document => document.releases[0].artifacts = [`ChromaStatusBar-${RELEASE}-macos-arm64.zip`],
    document => document.releases[0].artifacts = ['https://example.invalid/file.zip'],
    document => document.releases[0].artifacts = ['VCodeRecall-0.5.0-9-macos-arm64.zip'],
    document => document.releases[0].buildNumber = '0',
    document => document.releases[0].version = 'v0.6.0',
    document => document.days.push(structuredClone(document.days[0])),
    document => document.days[0].date = '2026-02-30',
    document => document.days[0].date = '2026-10-09',
    document => { document.coverageStart = '2026-01-01T00:00:00.000Z'; document.days[0].date = '2026-09-01'; },
    document => document.updatedAt = '2026-10-08T14:10:00.000Z',
    document => document.coverageStart = '2026-10-09T00:00:00.000Z',
    document => document.timezone = 'Europe/Prague',
    document => document.days = Array.from({ length: 2911 }, () => structuredClone(document.days[0])),
    document => document.releases = Array.from({ length: 33 }, () => structuredClone(document.releases[0])),
  ];
  for (const mutate of cases) {
    const document = fixture(); mutate(document);
    assert.throws(() => validateDownloadMetrics(document, { now: NOW }), TypeError);
  }
  const overflow = fixture(); overflow.days[0].bytesWritten = Number.MAX_SAFE_INTEGER;
  overflow.days.push({ ...overflow.days[0], date: '2026-10-08', bytesWritten: 1 });
  assert.throws(() => validateDownloadMetrics(overflow, { now: NOW }), TypeError);
});

test('private reader bounds file size, rejects symlinks and never exposes a path or raw parse error', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'recall-aggregate-reader-'));
  try {
    const path = join(directory, 'counts.json'); await writeFile(path, JSON.stringify(fixture()));
    assert.equal((await readDownloadMetrics(path, { now: NOW })).availability, 'available');
    for (const input of [undefined, '', 'relative.json', 'https://example.invalid/counts.json', join(directory, 'missing.json')]) {
      const result = await readDownloadMetrics(input, { now: NOW });
      assert.equal(result.availability, 'unavailable'); assert.equal(result.totals, null);
      assert.ok(!JSON.stringify(result).includes(directory));
    }
    const link = join(directory, 'linked.json'); await symlink(path, link);
    assert.equal((await readDownloadMetrics(link, { now: NOW })).reason, 'invalid');
    await writeFile(path, '{ "private_raw_error":');
    assert.equal((await readDownloadMetrics(path, { now: NOW })).reason, 'invalid');
    await writeFile(path, Buffer.alloc(2 * 1024 * 1024 + 1));
    assert.equal((await readDownloadMetrics(path, { now: NOW })).reason, 'invalid');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('only an account permitted to the canonical VCode website can read download metrics', () => {
  assert.equal(canReadDownloadMetrics([{ id: ID }], ID), true);
  assert.equal(canReadDownloadMetrics([{ id: 'another-site' }], ID), false);
  assert.equal(canReadDownloadMetrics([{ id: ID }], undefined), false);
  assert.equal(canReadDownloadMetrics([{ id: 'site' }], 'site'), false);
  assert.equal(canReadDownloadMetrics(null, ID), false);
});

test('distribution UI explains ranges and proxy writes; missing data is never rendered as zero or retained after clear', async () => {
  const context = { Intl, Date, Map, Math, Object, window: {}, document: { createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag) } };
  vm.runInNewContext(await readFile(new URL('../download-metrics-ui.js', import.meta.url), 'utf8'), context);
  const host = new Element('section'), ui = context.window.VCodeDownloadMetrics;
  ui.render(host, { availability: 'unavailable', reason: 'not-configured' }, 'en');
  assert.match(host.textContent, /Summary not connected yet/); assert.match(host.textContent, /does not mean zero transfers/);
  assert.equal(host.querySelectorAll('strong').length, 0);
  ui.render(host, validateDownloadMetrics(fixture(), { now: NOW }), 'en');
  assert.match(host.textContent, /Completed 206 ranges/); assert.match(host.textContent, /not installations or unique people/);
  assert.match(host.textContent, /service to the web proxy/); assert.match(host.textContent, /VCodeRecall-0\.6\.0-/);
  assert.match(host.textContent, /Metadata and supplementary files/);
  assert.ok(host.querySelectorAll('details').some(element => element.className === 'panel distribution-counter-details'));
  assert.ok(host.querySelectorAll('details').some(element => element.className === 'distribution-file-details'));
  assert.ok(host.querySelectorAll('table').length > 0);
  assert.equal(host.querySelectorAll('svg').length, 0);
  assert.match(host.textContent, /Only one day has a record/);
  assert.ok(host.querySelectorAll('div').some(node => node.className === 'distribution-snapshot'));
  assert.match(host.textContent, /Days with file records: 1 of 7/);
  ui.clear(host); assert.equal(host.hidden, true); assert.equal(host.textContent, '');
  ui.render(host, { availability: 'unavailable', reason: 'not-authorized' }, 'cs'); assert.equal(host.hidden, true); assert.equal(host.textContent, '');

  const summary = new Element('section'), populated = validateDownloadMetrics(fixture(), { now: NOW });
  const zeroDocument = fixture(); zeroDocument.days = zeroDocument.days.map(row => ({ ...row, ...Object.fromEntries(Object.keys(counters).map(key => [key, 0])) }));
  const measuredZero = validateDownloadMetrics(zeroDocument, { now: NOW });
  const emptyDocument = fixture(); emptyDocument.days = [];
  const empty = validateDownloadMetrics(emptyDocument, { now: NOW });
  for (const language of ['cs', 'en']) {
    ui.renderSummary(summary, populated, language);
    assert.equal(summary.querySelectorAll('h2')[0].id, 'application-distribution-title');
    assert.ok(summary.querySelectorAll('a').some(link => link.href === (language === 'cs' ? '/aplikace/vcode-recall/' : '/en/apps/vcode-recall/')));
    assert.deepEqual(summary.querySelectorAll('dd').map(node => node.textContent), ['6', '1', '2 KiB']);
    assert.match(summary.textContent, language === 'cs' ? /Souhrn dostupný/ : /Summary available/);
    assert.match(summary.textContent, language === 'cs' ? /Používání nativní aplikace ani instalace se neměří/ : /Native app usage and installations are not measured/);
    assert.match(summary.textContent, language === 'cs' ? /filtr webu se na distribuci nevztahuje/ : /website filter does not apply to distribution/);
    assert.match(summary.textContent, language === 'cs' ? /proxy ≠ potvrzení doručení/ : /proxy ≠ confirmed delivery/);
    assert.ok(!summary.querySelectorAll('dt').some(node => /instal|install|uživatel|user/i.test(node.textContent)));
    ui.renderSummary(summary, measuredZero, language);
    assert.deepEqual(summary.querySelectorAll('dd').map(node => node.textContent), ['0', '0', '0 B']);
    ui.renderSummary(summary, empty, language);
    assert.deepEqual(summary.querySelectorAll('dd').map(node => node.textContent), ['—', '—', '—']);
    assert.match(summary.textContent, language === 'cs' ? /Zatím bez záznamů/ : /No records yet/);
    for (const reason of ['not-configured', 'not-ready', 'invalid']) {
      ui.renderSummary(summary, { availability: 'unavailable', reason }, language);
      assert.deepEqual(summary.querySelectorAll('dd').map(node => node.textContent), ['—', '—', '—']);
      if (reason !== 'invalid') assert.match(summary.textContent, language === 'cs' ? /neprokazují dostupnost aplikace/ : /establish whether the app is available/);
    }
    ui.renderSummary(summary, populated, language); ui.render(host, populated, language);
    const unauthorized = { availability: 'unavailable', reason: 'not-authorized' };
    ui.renderSummary(summary, unauthorized, language); ui.render(host, unauthorized, language);
    for (const surface of [summary, host]) { assert.equal(surface.hidden, true); assert.equal(surface.textContent, ''); }
  }

  // Execute the actual dashboard clear path used by logout, offline and expiry.
  ui.renderSummary(summary, populated, 'cs'); ui.render(host, populated, 'cs');
  const elements = new Map([['application-distribution', summary], ['distribution', host]]);
  context.$ = id => { if (!elements.has(id)) elements.set(id, new Element('div')); return elements.get(id); };
  context.revision = 0; context.data = populated; context.expiry = 1; context.navigator = { onLine: true };
  context.clearTimeout = () => {}; let authenticated = true; context.authenticated = value => { authenticated = value; };
  const dashboard = await readFile(new URL('../dashboard.js', import.meta.url), 'utf8');
  vm.runInNewContext(dashboard.slice(dashboard.indexOf('function clear(){'), dashboard.indexOf('function scheduleExpiry(')), context);
  context.clear();
  for (const surface of [summary, host]) { assert.equal(surface.hidden, true); assert.equal(surface.textContent, ''); }
  assert.equal(authenticated, false); assert.equal(context.data, null);
  assert.equal(elements.get('dashboard').hidden, true); assert.equal(elements.get('login').hidden, false);
});

test('daily file plot labels dates and count grid, breaks at missing records and supports keyboard and touch selection', async () => {
  const context = { Intl, Date, Map, Math, Object, Set, window: {}, document: { createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag) } };
  vm.runInNewContext(await readFile(new URL('../download-metrics-ui.js', import.meta.url), 'utf8'), context);
  const document = fixture();
  document.days = [
    { ...document.days[0], date: '2026-10-03', getRequests: 2 },
    { ...document.days[0], date: '2026-10-05', getRequests: 0 },
    { ...document.days[0], date: '2026-10-06', getRequests: 4 },
  ];
  const parsed = validateDownloadMetrics(document, { now: NOW });
  for (const language of ['cs', 'en']) {
    const host = new Element('section'); context.window.VCodeDownloadMetrics.render(host, parsed, language);
    const svg = host.querySelectorAll('svg')[0];
    assert.equal(svg.attributes.viewBox, '0 0 720 260');
    const axis = svg.querySelectorAll('g').find(node => node.className === 'distribution-chart-axis');
    const labels = axis.querySelectorAll('text').map(node => node.textContent);
    assert.deepEqual(labels.slice(0, 5), ['0', '1', '2', '3', '4']);
    assert.match(labels.at(-1), /8/); assert.match(labels.at(-3), /2/);
    const line = svg.querySelectorAll('path')[0].attributes.d;
    assert.equal((line.match(/M/g) ?? []).length, 2, 'a missing day breaks the measured path');
    assert.equal((line.match(/L/g) ?? []).length, 1, 'only adjacent recorded days connect');
    const markers = svg.querySelectorAll('g').filter(node => node.className === 'distribution-chart-day');
    assert.equal(markers.length, 7);
    assert.equal(markers[2].attributes.role, 'button'); assert.equal(markers[2].attributes.tabindex, '0');
    assert.match(markers[2].attributes['aria-label'], language === 'cs' ? /Bez záznamu/ : /No record/);
    assert.match(markers[3].attributes['aria-label'], /GET: 0$/, 'a recorded zero is distinguishable from an absent record');
    const readout = host.querySelectorAll('p').find(node => node.className === 'chart-readout distribution-chart-readout');
    assert.equal(readout.attributes['aria-live'], 'polite');
    const picker = host.querySelectorAll('label').find(node => node.className === 'distribution-day-picker');
    assert.match(picker.textContent, language === 'cs' ? /Detail dne/ : /Day detail/);
    const select = picker.querySelectorAll('select')[0];
    assert.equal(select.children.length, 7);
    assert.equal(select.value, '2026-10-06');
    select.value = '2026-10-04'; select.events.get('change')();
    assert.match(readout.textContent, language === 'cs' ? /Bez záznamu/ : /No record/);
    select.value = '2026-10-05'; select.events.get('change')(); assert.match(readout.textContent, /GET: 0$/);
    assert.match(select.children[3].textContent, /GET: 0$/);
    markers[2].events.get('click')(); assert.match(readout.textContent, language === 'cs' ? /Bez záznamu/ : /No record/);
    assert.equal(select.value, '2026-10-04', 'chart selection and native picker stay synchronized');
    markers[2].events.get('keydown')({ key: 'ArrowRight', preventDefault() {} });
    assert.equal(markers[3].focused, true); assert.match(readout.textContent, /GET: 0$/);
    markers[3].events.get('keydown')({ key: 'End', preventDefault() {} }); assert.equal(markers.at(-1).focused, true);
    markers.at(-1).events.get('keydown')({ key: 'Home', preventDefault() {} }); assert.equal(markers[0].focused, true);
    const body = host.querySelectorAll('tbody')[0]; assert.equal(body.children.length, 7);
    assert.match(body.children[2].textContent, language === 'cs' ? /Bez záznamu/ : /No record/);
    assert.equal(body.children[3].children[1].textContent, '0');
    assert.match(host.textContent, language === 'cs' ? /Dny se záznamem souborů: 3 z 7/ : /Days with file records: 3 of 7/);
  }
});

test('single recorded zero is compact; metadata-only coverage never fabricates a daily file plot', async () => {
  const context = { Intl, Date, Map, Math, Object, Set, window: {}, document: { createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag) } };
  vm.runInNewContext(await readFile(new URL('../download-metrics-ui.js', import.meta.url), 'utf8'), context);
  const zero = fixture(); zero.days = [{ ...zero.days[0], ...Object.fromEntries(Object.keys(counters).map(key => [key, 0])) }];
  const metadataOnly = fixture(); metadataOnly.days = [metadataOnly.days[1]];
  for (const language of ['cs', 'en']) {
    const host = new Element('section');
    context.window.VCodeDownloadMetrics.render(host, validateDownloadMetrics(zero, { now: NOW }), language);
    assert.equal(host.querySelectorAll('svg').length, 0);
    assert.equal(host.querySelectorAll('strong').find(node => node.className === 'distribution-snapshot-value').textContent, '0');
    assert.match(host.textContent, language === 'cs' ? /Zatím máme záznam pouze za jeden den/ : /Only one day has a record/);
    context.window.VCodeDownloadMetrics.render(host, validateDownloadMetrics(metadataOnly, { now: NOW }), language);
    assert.equal(host.querySelectorAll('svg').length, 0);
    assert.ok(!host.querySelectorAll('strong').some(node => node.className === 'distribution-snapshot-value'));
    assert.match(host.textContent, language === 'cs' ? /Zatím bez denních záznamů souborů/ : /No daily file records yet/);
    assert.match(host.textContent, language === 'cs' ? /Dny se záznamem souborů: 0 z 7/ : /Days with file records: 0 of 7/);
    assert.match(host.querySelectorAll('tbody')[0].textContent, language === 'cs' ? /Bez záznamu/ : /No record/);
  }
});

test('summary protects file aggregates with both session authentication and current VCode permission', async () => {
  const current = new Date();
  const document = fixture(); document.coverageStart = current.toISOString(); document.updatedAt = current.toISOString();
  document.days = document.days.map(row => ({ ...row, date: current.toISOString().slice(0, 10) }));
  const directory = await mkdtemp(join(tmpdir(), 'recall-summary-gate-'));
  const path = join(directory, 'counts.json'), registry = join(directory, 'sites.json');
  await writeFile(path, JSON.stringify(document)); await writeFile(registry, '[]');
  const upstream = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/api/auth/login') {
      let body = ''; for await (const chunk of req) body += chunk;
      const username = JSON.parse(body).username; res.end(JSON.stringify({ token: username === 'owner' ? 'fixture-owner' : 'fixture-other' })); return;
    }
    assert.ok(req.url.startsWith('/api/websites?'));
    res.end(JSON.stringify({ data: req.headers.authorization === 'Bearer fixture-owner' ? [{ id: ID }] : [] }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const probe = createServer(); await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ['services/analytics/server.mjs'], { env: {
    ...process.env, PORT: String(port), ANALYTICS_UPSTREAM: `http://127.0.0.1:${upstream.address().port}`,
    PUBLIC_SITE_URL: 'https://example.invalid', ANALYTICS_SITES_FILE: registry, ANALYTICS_SESSION_DIR: join(directory, 'sessions'),
    VCODE_ANALYTICS_WEBSITE_ID: ID, DOWNLOAD_METRICS_PATH: path,
  }, stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let n = 0; n < 100; n++) { try { if ((await fetch(base + '/health')).ok) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 20)); }
    assert.ok(ready); assert.equal((await fetch(base + '/prehled/api/summary')).status, 401);
    for (const [username, expected] of [['other', 'unavailable'], ['owner', 'available']]) {
      const login = await fetch(base + '/prehled/api/login', { method: 'POST', headers: { Origin: 'https://example.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: 'synthetic-only' }) });
      assert.equal(login.status, 200); const cookie = login.headers.get('set-cookie').split(';')[0];
      const response = await fetch(base + '/prehled/api/summary', { headers: { Cookie: cookie } });
      assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
      const result = await response.json(); assert.equal(result.downloads.availability, expected);
      if (username === 'other') { assert.equal(result.downloads.reason, 'not-authorized'); assert.equal(result.downloads.totals, null); assert.ok(!JSON.stringify(result).includes(ZIP)); }
      else assert.equal(result.downloads.totals.bytesWritten, 2048);
      assert.ok(!JSON.stringify(result).includes(path));
    }
    const asset = await fetch(base + '/prehled/download-metrics-ui.js'); assert.equal(asset.status, 200); assert.equal(asset.headers.get('content-type'), 'text/javascript');
  } finally {
    if (child.exitCode === null && child.signalCode === null) { const stopped = new Promise(resolve => child.once('exit', resolve)); child.kill(); await stopped; }
    upstream.closeAllConnections(); await new Promise(resolve => upstream.close(resolve)); await rm(directory, { recursive: true, force: true });
  }
});
