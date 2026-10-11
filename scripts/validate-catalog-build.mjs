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
