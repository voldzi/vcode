// Isolated runtime checks: no production registries, accounts or visitor data.
// Usage: node scripts/verify-nginx-boundary.mjs --image <built-web-image>
import assert from 'node:assert/strict';
import {execFileSync, spawn} from 'node:child_process';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';

const option = process.argv.indexOf('--image');
const image = option >= 0 ? process.argv[option + 1] : undefined;
if (!image || image.startsWith('-')) throw new Error('Specify --image with the tested web image.');
// Synthetic static fixtures must be readable by the unprivileged Nginx worker,
// even when the operator protects release evidence with a restrictive umask.
const previousUmask = process.umask(0o022);
const repository = resolve(fileURLToPath(new URL('..', import.meta.url)));
const directory = await mkdtemp(join(tmpdir(), 'vcode-nginx-boundary-'));
const suffix = `${process.pid}-${Date.now()}`;
const network = `vcode-boundary-${suffix}`;
const upstream = `${network}-upstream`;
const web = `${network}-web`;
const docker = (...args) => execFileSync('docker', args, {maxBuffer: 4 * 1024 * 1024});
const safeRemove = (...args) => {try {docker(...args);} catch { /* Cleanup only. */ }};
const textAsset = '/* Synthetic acceptance data. */\n' + '.example { color: #124456; }\n'.repeat(250);
const privateHtml = '<!doctype html><html lang="cs"><title>Synthetic dashboard</title><body>Login fixture</body></html>';
const strictCsp = (await readFile(join(repository, 'services/analytics/server.mjs'), 'utf8'))
  .match(/'Content-Security-Policy':"([^"]+)"/)[1];

// Use a raw HTTP connection inside the isolated container. Unlike wget this
// reads all headers on 401 as well, and never publishes a host-facing port.
async function get(path, headers = [], method = 'GET', payload = '') {
  const result = await new Promise((resolve, reject) => {
    const child = spawn('docker', ['exec', '-i', web, 'nc', '-w', '10', '127.0.0.1', '8080']);
    const output = [], errors = [];
    const timeout = setTimeout(() => child.kill(), 5000);
    child.stdout.on('data', chunk => {
      output.push(chunk);
      const received = Buffer.concat(output);
      const end = received.indexOf('\r\n\r\n');
      if (end < 0) return;
      const header = received.subarray(0, end).toString();
      const length = /\r\nContent-Length:\s*(\d+)/i.exec(header);
      const chunked = /\r\nTransfer-Encoding:\s*chunked/i.test(header);
      if ((length && received.length - end - 4 >= Number(length[1])) ||
          (chunked && received.subarray(-5).equals(Buffer.from('0\r\n\r\n')))) child.stdin.end();
    });
    child.stderr.on('data', chunk => errors.push(chunk));
    child.on('error', error => {clearTimeout(timeout); reject(error);});
    child.on('close', status => {clearTimeout(timeout); child.stdin.end(); resolve({status, stdout: Buffer.concat(output), stderr: Buffer.concat(errors)});});
    // Keep stdin open until Nginx closes the response. BusyBox nc otherwise
    // quits at stdin EOF before a proxied response arrives.
    child.stdin.write(`${method} ${path} HTTP/1.1\r\nHost: example.test\r\nConnection: close\r\n${payload ? `Content-Length: ${Buffer.byteLength(payload)}\r\n` : ''}${headers.join('\r\n')}${headers.length ? '\r\n' : ''}\r\n${payload}`);
  });
  const boundary = result.stdout.indexOf('\r\n\r\n');
  if (boundary < 0) {
    if (path !== '/health') throw new Error(`No HTTP response for ${path}: exit ${result.status}; ${String(result.stderr).slice(0, 200)}`);
    return parse(Buffer.alloc(0), '');
  }
  return parse(result.stdout.subarray(boundary + 4), result.stdout.subarray(0, boundary));
}
function parse(body, stderr) {
  const lines = String(stderr).split(/\r?\n/).map(line => line.trim());
  const status = Number(lines.find(line => /^HTTP\/\d/.test(line))?.split(/\s+/)[1]);
  const headers = new Map();
  for (const line of lines) {
    const found = /^([\w-]+):\s*(.*)$/.exec(line);
    if (found) {
      const name = found[1].toLowerCase();
      headers.set(name, [...(headers.get(name) ?? []), found[2]]);
    }
  }
  if (headers.get('transfer-encoding')?.includes('chunked')) {
    const chunks = [];
    let offset = 0;
    while (offset < body.length) {
      const end = body.indexOf('\r\n', offset);
      assert.ok(end >= offset, 'Complete chunk header');
      const size = Number.parseInt(body.subarray(offset, end).toString(), 16);
      if (size === 0) break;
      assert.ok(Number.isFinite(size) && end + 2 + size <= body.length, 'Complete chunk body');
      chunks.push(body.subarray(end + 2, end + 2 + size));
      offset = end + 2 + size + 2;
    }
    body = Buffer.concat(chunks);
  }
  return {status, headers, body, value: name => headers.get(name.toLowerCase())?.join(', ')};
}
function security(response, expected) {
  assert.deepEqual(response.headers.get('content-security-policy'), Array.isArray(expected) ? expected : [expected], 'Expected inherited CSP headers');
  assert.equal(response.value('x-content-type-options'), 'nosniff');
  assert.equal(response.value('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(response.value('permissions-policy'), /microphone=\(\)/);
}

try {
  await mkdir(join(directory, 'public', '_astro'), {recursive: true});
  await mkdir(join(directory, 'upstream', 'prehled'), {recursive: true});
  await mkdir(join(directory, 'upstream', 'analytics'), {recursive: true});
  await mkdir(join(directory, 'upstream', 'downloads', 'chromadb-status'), {recursive: true});
  await writeFile(join(directory, 'public', 'index.html'), '<h1>Public fixture</h1>');
  await writeFile(join(directory, 'public', '_astro', 'fixture.css'), textAsset);
  await writeFile(join(directory, 'public', '_astro', 'fixture.js'), '// Synthetic script\n' + 'void 0;\n'.repeat(250));
  await writeFile(join(directory, 'upstream', 'prehled', 'index.html'), privateHtml);
  await writeFile(join(directory, 'upstream', 'prehled', 'dashboard.css'), textAsset);
  await writeFile(join(directory, 'upstream', 'prehled', 'dashboard.js'), '/* Synthetic JS */\n' + 'void 0;\n'.repeat(250));
  await writeFile(join(directory, 'upstream', 'prehled', 'manifest.webmanifest'), '{"name":"Fixture"}');
  await writeFile(join(directory, 'upstream', 'analytics', 'tracker.js'), '/* Synthetic tracker */\n' + 'void 0;\n'.repeat(250));
  const artifact = Buffer.from('Synthetic immutable distribution bytes.\n'.repeat(250));
  await writeFile(join(directory, 'upstream', 'downloads', 'chromadb-status', 'fixture.zip'), artifact);
  await writeFile(join(directory, 'upstream.conf'), `events {}\nhttp {\n include /etc/nginx/mime.types;\n server { listen 8091; root /fixture; index index.html; add_header Content-Security-Policy "${strictCsp}" always; add_header Cache-Control no-store always; location = /prehled/api/summary { return 401 '{"error":"Authentication required"}'; } location = /analytics/event { return 400 '{}'; } }\n server { listen 8096; root /fixture; gzip off; }\n server { listen 8090; add_header Cache-Control no-store always; location = /api/contact/challenge { return 200 '{\"enabled\":false}'; } location = /api/contact { return 202 '{\"ip\":\"$http_x_real_ip\",\"origin\":\"$http_origin\",\"site\":\"$http_sec_fetch_site\",\"auth\":\"$http_authorization\",\"cookie\":\"$http_cookie\"}'; } location / { return 200 'Synthetic blog health'; } }\n}\n`);
  docker('network', 'create', '--internal', network);
  docker('run', '--detach', '--rm', '--name', upstream, '--network', network,
    '--network-alias', 'vcode-analytics', '--network-alias', 'downloads', '--network-alias', 'blog',
    '--entrypoint', 'nginx', '--volume', directory + '/upstream.conf:/tmp/upstream.conf:ro',
    '--volume', directory + '/upstream:/fixture:ro', image, '-c', '/tmp/upstream.conf', '-g', 'daemon off;');
  docker('run', '--detach', '--rm', '--name', web, '--network', network,
    '--entrypoint', 'nginx',
    '--volume', join(repository, 'deploy/nginx-main.conf') + ':/etc/nginx/nginx.conf:ro',
    '--volume', join(repository, 'deploy/nginx.conf') + ':/etc/nginx/conf.d/default.conf:ro',
    '--volume', directory + '/public:/usr/share/nginx/html:ro', image, '-g', 'daemon off;');
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await get('/health')).status === 200) {ready = true; break;}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Fixture Nginx health');
  docker('exec', web, 'nginx', '-t');
  const publicResponse = await get('/');
  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.value('cache-control'), 'no-cache', 'Static HTML must revalidate after a release');
  const conditionalPage = await get('/', ['If-None-Match: ' + publicResponse.value('etag')]);
  assert.equal(conditionalPage.status, 304);
  assert.equal(conditionalPage.value('cache-control'), 'no-cache', 'Revalidation policy remains on 304');
  const publicCsp = publicResponse.value('content-security-policy');
  assert.match(publicCsp, /style-src 'self' 'unsafe-inline'/);
  security(publicResponse, publicCsp);
  for (const path of ['/prehled/', '/prehled/dashboard.css', '/prehled/dashboard.js', '/prehled/manifest.webmanifest', '/prehled/api/summary']) {
    const response = await get(path);
    assert.equal(response.status, path.includes('/api/') ? 401 : 200, path);
    security(response, strictCsp);
    assert.equal(response.value('cache-control'), 'no-store');
  }
  for (const path of ['/_astro/fixture.css', '/_astro/fixture.js', '/prehled/dashboard.css', '/prehled/dashboard.js', '/analytics/tracker.js']) {
    const response = await get(path, ['Accept-Encoding: gzip', 'Via: 1.1 acceptance-fixture']);
    assert.equal(response.status, 200, path);
    assert.equal(response.value('content-encoding'), 'gzip', path);
    assert.match(response.value('vary'), /Accept-Encoding/);
    assert.ok(gunzipSync(response.body).length > response.body.length, path);
    security(response, path.startsWith('/prehled/') ? strictCsp : path.startsWith('/analytics/') ? [strictCsp, publicCsp] : publicCsp);
    if (path.startsWith('/_astro/')) assert.match(response.value('cache-control'), /public, immutable/);
  }

  const challenge = await get('/api/contact/challenge', ['Sec-Fetch-Site: same-origin']);
  assert.equal(challenge.status, 200);
  assert.equal(challenge.value('cache-control'), 'no-store');
  const contact = await get('/api/contact', ['Content-Type: application/json', 'Origin: https://example.test', 'Sec-Fetch-Site: same-origin', 'X-Real-IP: 192.0.2.24', 'X-Forwarded-For: forged-client', 'Cookie: synthetic=private', 'Authorization: Bearer synthetic-private'], 'POST', '{}');
  assert.equal(contact.status, 202);
  assert.deepEqual(JSON.parse(contact.body), {ip:'192.0.2.24',origin:'https://example.test',site:'same-origin',auth:'',cookie:''});
  assert.equal(contact.value('cache-control'), 'no-store');
  for (const path of ['/internal/contacts','/api/contact/unknown']) assert.equal((await get(path)).status,404,path);
  const oversized = await get('/api/contact', ['Content-Type: application/json'], 'POST', 'x'.repeat(17 * 1024));
  assert.equal(oversized.status,413);
  const full = await get('/downloads/chromadb-status/fixture.zip', ['Accept-Encoding: gzip']);
  assert.equal(full.status, 200);
  assert.equal(full.value('content-encoding'), undefined);
  assert.deepEqual(full.body, artifact);
  const range = await get('/downloads/chromadb-status/fixture.zip', ['Accept-Encoding: gzip', 'Range: bytes=0-15']);
  assert.equal(range.status, 206);
  assert.equal(range.value('content-encoding'), undefined);
  assert.equal(range.value('etag'), full.value('etag'));
  assert.equal(range.value('content-range'), `bytes 0-15/${artifact.length}`);
  assert.deepEqual(range.body, artifact.subarray(0, 16));
  console.log('PASS: strict dashboard CSP; inherited asset headers; static/proxy CSS/JS gzip; anonymous 401; exact contact routes/header allowlist/body bounds; untouched distribution ranges.');
} finally {
  safeRemove('rm', '--force', web);
  safeRemove('rm', '--force', upstream);
  safeRemove('network', 'rm', network);
  await rm(directory, {recursive: true, force: true});
  process.umask(previousUmask);
}
