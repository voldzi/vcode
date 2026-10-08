import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import { isAbsolute } from 'node:path';

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 2910;
const DAY = 86400000;
const COUNTERS = Object.freeze(['getRequests', 'headRequests', 'fullResponses', 'rangeResponses', 'errorResponses', 'abortedResponses', 'bytesWritten', 'clickIntents']);
const DOCUMENT_KEYS = ['schemaVersion', 'product', 'measurement', 'retentionDays', 'timezone', 'coverageStart', 'updatedAt', 'releases', 'days'];
const DAY_KEYS = ['date', 'release', 'artifact', ...COUNTERS];
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const VERSION = /^(?:0|[1-9]\d{0,5})\.(?:0|[1-9]\d{0,5})\.(?:0|[1-9]\d{0,5})$/;
const BUILD = /^[1-9]\d{0,19}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const zeros = () => Object.fromEntries(COUNTERS.map(key => [key, 0]));
const fail = () => { throw new TypeError('Invalid download aggregates'); };
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const keys = (value, expected) => plain(value) && Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
const isoTime = value => typeof value === 'string' && ISO.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const dateTime = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;

/** An authenticated Umami session is insufficient: this account must own/access VCode. */
export function canReadDownloadMetrics(websites, canonicalWebsiteId) {
  return typeof canonicalWebsiteId === 'string' && UUID.test(canonicalWebsiteId)
    && Array.isArray(websites) && websites.some(website => website?.id === canonicalWebsiteId);
}

export function unavailableDownloadMetrics(reason = 'not-configured') {
  return { availability: 'unavailable', reason, product: 'vcode-recall', totals: null, series: [], artifacts: [] };
}

function add(target, source) {
  for (const key of COUNTERS) {
    const value = target[key] + source[key];
    if (!Number.isSafeInteger(value)) fail();
    target[key] = value;
  }
}

/** Accept only the private aggregate format emitted by the reviewed distribution service. */
export function validateDownloadMetrics(document, { days = 7, now = Date.now() } = {}) {
  if (!keys(document, DOCUMENT_KEYS) || document.schemaVersion !== 1 || document.product !== 'vcode-recall'
    || document.measurement !== 'service-to-proxy' || document.retentionDays !== 30 || document.timezone !== 'UTC'
    || !isoTime(document.coverageStart) || !isoTime(document.updatedAt)
    || Date.parse(document.coverageStart) > Date.parse(document.updatedAt) || Date.parse(document.updatedAt) > now + 300000
    || !Array.isArray(document.releases) || document.releases.length > 32
    || !Array.isArray(document.days) || document.days.length > MAX_ROWS || ![7, 30, 90].includes(days)) fail();

  const releases = new Map();
  for (const release of document.releases) {
    if (!keys(release, ['id', 'version', 'buildNumber', 'artifacts']) || typeof release.version !== 'string'
      || !VERSION.test(release.version) || typeof release.buildNumber !== 'string' || !BUILD.test(release.buildNumber)
      || release.id !== `${release.version}-${release.buildNumber}` || releases.has(release.id)
      || !Array.isArray(release.artifacts) || release.artifacts.length < 1 || release.artifacts.length > 2) fail();
    const allowed = new Set();
    for (const artifact of release.artifacts) {
      if (typeof artifact !== 'string' || artifact.length > 160 || allowed.has(artifact)
        || !['zip', 'dmg'].some(extension => artifact === `VCodeRecall-${release.version}-${release.buildNumber}-macos-arm64.${extension}`)) fail();
      allowed.add(artifact);
    }
    releases.set(release.id, { ...release, allowed });
  }

  const today = new Date(now).toISOString().slice(0, 10);
  const earliest = new Date(Date.parse(today + 'T00:00:00Z') - 29 * DAY).toISOString().slice(0, 10);
  const periodDays = Math.min(days, 30);
  const startDate = new Date(Date.parse(today + 'T00:00:00Z') - (periodDays - 1) * DAY).toISOString().slice(0, 10);
  const seen = new Set(), selected = [];
  for (const row of document.days) {
    if (!keys(row, DAY_KEYS) || !dateTime(row.date) || row.date < earliest || row.date > today
      || row.date < document.coverageStart.slice(0, 10) || typeof row.release !== 'string'
      || (row.release !== 'none' && !releases.has(row.release))
      || (row.artifact !== null && (!releases.get(row.release)?.allowed.has(row.artifact)))) fail();
    for (const key of COUNTERS) if (!Number.isSafeInteger(row[key]) || row[key] < 0) fail();
    const identity = JSON.stringify([row.date, row.release, row.artifact]);
    if (seen.has(identity)) fail();
    seen.add(identity);
    if (row.date >= startDate) selected.push(row);
  }

  const totals = zeros(), metadata = zeros(), perArtifact = new Map(), series = new Map();
  for (const row of selected) {
    totals.clickIntents += row.clickIntents;
    if (!Number.isSafeInteger(totals.clickIntents)) fail();
    if (row.artifact === null) { add(metadata, row); continue; }
    const fileCounters = { ...row, clickIntents: 0 };
    add(totals, fileCounters);
    const id = JSON.stringify([row.release, row.artifact]);
    const artifact = perArtifact.get(id) ?? { release: row.release, artifact: row.artifact, ...zeros() };
    add(artifact, row); perArtifact.set(id, artifact);
    const daily = series.get(row.date) ?? { date: row.date, ...zeros() };
    add(daily, row); series.set(row.date, daily);
  }
  // No inferred zeroes: missing days may mean no durable coverage or no requests.
  return {
    availability: 'available', product: 'vcode-recall', measurement: 'service-to-proxy', timezone: 'UTC', retentionDays: 30,
    updatedAt: document.updatedAt, coverageStart: document.coverageStart, requestedDays: days, periodDays, startDate, endDate: today,
    empty: selected.length === 0, totals: selected.length ? totals : null, metadata,
    series: [...series.values()].sort((a, b) => a.date.localeCompare(b.date)),
    artifacts: [...perArtifact.values()].sort((a, b) => a.release.localeCompare(b.release) || a.artifact.localeCompare(b.artifact)),
    releases: [...releases.values()].map(({ id, version, buildNumber, artifacts }) => ({ id, version, buildNumber, artifacts })),
  };
}

export async function readDownloadMetrics(path, options = {}) {
  if (typeof path !== 'string' || !path) return unavailableDownloadMetrics('not-configured');
  if (!isAbsolute(path) || path.length > 4096) return unavailableDownloadMetrics('invalid');
  let file;
  try {
    file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const metadata = await file.stat();
    if (!metadata.isFile() || metadata.size > MAX_BYTES) return unavailableDownloadMetrics('invalid');
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await file.read(buffer, offset, buffer.length - offset, offset);
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > MAX_BYTES) return unavailableDownloadMetrics('invalid');
    return validateDownloadMetrics(JSON.parse(buffer.subarray(0, offset).toString('utf8')), options);
  } catch (error) {
    return unavailableDownloadMetrics(error.code === 'ENOENT' ? 'not-ready' : 'invalid');
  } finally { await file?.close(); }
}
