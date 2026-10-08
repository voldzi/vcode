import test from 'node:test';
import assert from 'node:assert/strict';
import { recallLegalHTML } from '../../../src/lib/recallLegal.mjs';
test('legal renderer isolates each approved privacy language and excludes private notes', () => {
  const html='<h1>Private review</h1><h2 id="cs">Čeština</h2><h3>Provozovatel</h3><p>CZ copy</p><h2 id="en">English</h2><h3>Provider</h3><p>EN copy</p><h2 id="ops">Kontrola před aktivací / Before activation</h2><p>Private operational note</p>';
  assert.equal(recallLegalHTML(html,'privacy','cs'),'<h3>Provozovatel</h3><p>CZ copy</p>');
  assert.equal(recallLegalHTML(html,'privacy','en'),'<h3>Provider</h3><p>EN copy</p>');
});
test('legal renderer isolates terms languages and fails closed on missing or ambiguous boundaries', () => {
  const html='<h2>Čeština — návrh pro uživatele</h2><p>CZ</p><h2>English — proposed recipient copy</h2><p>EN</p><h2>Zbývající rozhodnutí a podklady / Outstanding decisions and evidence</h2><p>private</p>';
  assert.equal(recallLegalHTML(html,'terms','cs'),'<p>CZ</p>');
  assert.equal(recallLegalHTML(html,'terms','en'),'<p>EN</p>');
  assert.throws(()=>recallLegalHTML(html,'terms','other'));
  assert.throws(()=>recallLegalHTML(html.replace('<h2>English','<h2>Missing'),'terms','cs'),/boundary/);
  assert.throws(()=>recallLegalHTML('<h2>Čeština — návrh pro uživatele</h2>'+html,'terms','cs'),/boundary/);
  assert.throws(()=>recallLegalHTML(html.replace('<p>CZ</p>','<h2>Private unexpected section</h2>'),'terms','cs'),/section/);
});
