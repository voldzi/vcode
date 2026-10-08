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
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.value = ''; this.hidden = false; this.classList = { add: name => { this.className = name; } }; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; this.value = ''; }
    setAttribute(name, value) { this.attributes[name] = value; }
    set textContent(value) { this.value = String(value); this.children = []; }
    get textContent() { return this.value + this.children.map(child => child.textContent ?? '').join(' '); }
    addEventListener() {}
    querySelectorAll(tag) { return this.children.flatMap(child => [child, ...child.querySelectorAll(tag)]).filter(child => child.tagName === tag); }
  }
  const context = { Intl, Date, Map, Math, Object, window: {}, document: { createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag) } };
  vm.runInNewContext(await readFile(new URL('../download-metrics-ui.js', import.meta.url), 'utf8'), context);
  const host = new Element('section'), ui = context.window.VCodeDownloadMetrics;
  ui.render(host, { availability: 'unavailable', reason: 'not-configured' }, 'en');
  assert.match(host.textContent, /Distribution is being prepared/); assert.match(host.textContent, /does not mean zero downloads/);
  assert.equal(host.querySelectorAll('strong').length, 0);
  ui.render(host, validateDownloadMetrics(fixture(), { now: NOW }), 'en');
  assert.match(host.textContent, /Completed 206 ranges/); assert.match(host.textContent, /not installations or unique people/);
  assert.match(host.textContent, /service to the web proxy/); assert.match(host.textContent, /VCodeRecall-0\.6\.0-/);
  assert.match(host.textContent, /Metadata and supplementary files/);
  assert.ok(host.querySelectorAll('details').length >= 9); assert.ok(host.querySelectorAll('table').length > 0);
  const circles = host.querySelectorAll('circle'); assert.ok(circles.length); assert.equal(circles[0].attributes.tabindex, '0');
  ui.clear(host); assert.equal(host.hidden, true); assert.equal(host.textContent, '');
  ui.render(host, { availability: 'unavailable', reason: 'not-authorized' }, 'cs'); assert.equal(host.hidden, true); assert.equal(host.textContent, '');
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
