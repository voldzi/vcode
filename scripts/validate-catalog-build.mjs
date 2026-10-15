import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

for (const path of ['dist/index.html', 'dist/en/index.html']) {
  const html = await readFile(path, 'utf8');
  const cards = new Map([...html.matchAll(/<article\b[^>]*data-catalog-card="([^"]+)"[^>]*data-catalog-targets="([^"]+)"[^>]*>/g)].map(([, id, targets]) => [id, targets.split(' ')]));
  assert.ok(cards.size, `${path}: the static catalog must remain present`);
  assert.match(html, /data-catalog-controls\s+hidden/, `${path}: controls must start hidden until enhancement is ready`);
  assert.ok(cards.get('kaloricke-tabulky')?.includes('web:available'), `${path}: Moje porce has a public web`);
  assert.ok(cards.get('kaloricke-tabulky')?.includes('ios:upcoming'), `${path}: Moje porce iOS is still upcoming`);
  assert.ok(!cards.get('kaloricke-tabulky')?.includes('ios:available'), `${path}: public web must not imply an available iOS app`);
  assert.ok(cards.get('sibenice')?.includes('tvos:upcoming'), `${path}: Šibenice tvOS is upcoming`);
  assert.ok(!cards.get('sibenice')?.includes('tvos:available'), `${path}: Šibenice tvOS must not be advertised as released`);
  assert.ok(cards.get('nest')?.includes('tvos:available'), `${path}: NEST tvOS is available`);
  assert.ok(cards.get('jizda')?.includes('ios:available'), `${path}: Jízda has a verified public iPhone and iPad release`);
  assert.ok(cards.get('jizda')?.includes('watchos:available'), `${path}: Jízda has verified Apple Watch support`);
  assert.ok(!cards.get('jizda')?.some(target => target.endsWith(':upcoming')), `${path}: future features must not hide Jízda’s available platforms`);
  assert.ok(cards.get('vcode-recall')?.includes('macos:available'), `${path}: Recall is available on Mac`);
  for (const id of ['stratos', 'budget-contract', 'executive-center', 'projectflow', 'archflow', 'akb']) {
    const targets = cards.get(id);
    assert.ok(targets?.every(target => target.endsWith(':private')), `${path}: ${id} remains private`);
  }
  assert.ok(!cards.get('apsyd-central')?.some(target => target.startsWith('tvos:')), `${path}: Czech prose must not be mistaken for a tvOS mention`);
  console.log(`${path}: ${cards.size} public cards; availability and platform boundaries verified.`);
}

// The exact, integrity-pinned Tomato click runtime belongs to only two public details.
const {createHash} = await import('node:crypto');
const {tomatoPlayScript} = await import('../src/lib/tomatoPlayClicks.ts');
const clickBytes = await readFile('public' + tomatoPlayScript.src);
assert.equal(tomatoPlayScript.integrity, 'sha384-' + createHash('sha384').update(clickBytes).digest('base64'));
for (const [path, lang] of [['dist/aplikace/rajcatova-sklizen/index.html', 'cs'], ['dist/en/apps/rajcatova-sklizen/index.html', 'en']]) {
  const html = await readFile(path, 'utf8');
  assert.ok(html.includes(`href="https://games.zeleznalady.cz/tomato/?lang=${lang}" data-tomato-play="true"`));
  assert.ok(html.includes(`src="${tomatoPlayScript.src}" integrity="${tomatoPlayScript.integrity}"`));
  assert.equal(html.split(tomatoPlayScript.src).length - 1, 1);
}
for (const path of ['dist/aplikace/nest/index.html','dist/en/apps/nest/index.html','dist/hry/index.html','dist/en/games/index.html']) {
  assert.ok(!(await readFile(path,'utf8')).includes(tomatoPlayScript.src));
}
console.log('Tomato CTA: exact CS/EN destinations, scoped marker and pinned runtime integrity verified.');
