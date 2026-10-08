import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../../../public/recall-downloads.js', import.meta.url), 'utf8');
function run(options = {}) {
  const calls = [];
  let click;
  const context = {
    location: { origin:'https://vcode.zeleznalady.cz', hostname:'vcode.zeleznalady.cz', protocol:'https:', pathname:'/aplikace/vcode-recall/', ...options.location },
    navigator: { onLine:true, ...options.navigator },
    document: { addEventListener:(_, handler) => { click = handler; } },
    fetch:(...args) => { calls.push(args); return Promise.resolve(); }, URL
  };
  vm.runInNewContext(source, context);
  return { calls, click:(href, trusted=true) => click?.({ isTrusted:trusted, target:{ closest:()=>({href}) } }) };
}
const artifact = 'https://vcode.zeleznalady.cz/downloads/chromadb-status/0.6.0-42/VCodeRecall-0.6.0-42-macos-arm64.dmg';
test('download intent contains only fixed product identity, no referrer, URL or identifier', () => {
  const runner = run(); runner.click(artifact);
  assert.equal(runner.calls.length, 1);
  const [url, init] = runner.calls[0];
  assert.equal(url, '/analytics/download-intent');
  assert.equal(init.credentials, 'omit');
  assert.equal(init.referrerPolicy, 'no-referrer');
  assert.deepEqual(JSON.parse(init.body), {product:'vcode-recall'});
});
test('DNT/GPC, offline, local preview, untrusted events and arbitrary links send no intent', () => {
  for (const options of [{navigator:{doNotTrack:'1'}},{navigator:{globalPrivacyControl:true}},{navigator:{onLine:false}},{location:{search:'?private=1'}},{location:{hash:'#private'}},{location:{hostname:'127.0.0.1'}},{location:{pathname:'/preview-local/recall/cs/'}}]) {
    const runner = run(options); runner.click(artifact); assert.equal(runner.calls.length, 0);
  }
  const runner = run();
  for (const target of [artifact+'?private=1',artifact+'#fragment',artifact.replace('vcode.zeleznalady.cz','evil.example'), 'https://vcode.zeleznalady.cz/downloads/chromadb-status/private.txt']) runner.click(target);
  runner.click(artifact, false); assert.equal(runner.calls.length, 0);
});
