const sections = {
  privacy: { cs: ['Čeština', 'English'], en: ['English', 'Kontrola před aktivací / Before activation'] },
  terms: { cs: ['Čeština — návrh pro uživatele', 'English — proposed recipient copy'], en: ['English — proposed recipient copy', 'Zbývající rozhodnutí a podklady / Outstanding decisions and evidence'] }
};
/** Extract only the approved recipient language; never include private review notes. */
export function recallLegalHTML(html, kind, lang) {
  const labels = sections[kind]?.[lang];
  if (!labels || typeof html !== 'string') throw Error('Invalid Recall legal document');
  const positions = labels.map(label => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = [...html.matchAll(new RegExp(`<h2(?:\\s[^>]*)?>${escaped}</h2>`, 'g'))];
    if (matches.length !== 1) throw Error('Ambiguous Recall legal boundary');
    return { start: matches[0].index, end: matches[0].index + matches[0][0].length };
  });
  if (positions[0].end >= positions[1].start) throw Error('Invalid Recall legal order');
  const body = html.slice(positions[0].end, positions[1].start).trim();
  if (!body || /<h2\b/i.test(body)) throw Error('Unexpected Recall legal section');
  return body;
}
