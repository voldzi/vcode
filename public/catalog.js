const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim();

document.querySelectorAll('[data-catalog]').forEach(catalog => {
  const controls = catalog.querySelector('[data-catalog-controls]');
  const form = controls?.querySelector('form');
  const query = form?.elements.namedItem('query');
  const availability = form?.elements.namedItem('availability');
  const platform = form?.elements.namedItem('platform');
  const results = controls?.querySelector('[data-catalog-results]');
  const empty = controls?.querySelector('[data-catalog-empty]');
  const reset = form?.querySelector('button[type="reset"]');
  const cards = [...catalog.querySelectorAll('[data-catalog-card]')];
  if (!controls || !form || !query || !availability || !platform || !results || !empty || !reset || !cards.length) return;
  const cs = document.documentElement.lang === 'cs';
  const groups = [...catalog.querySelectorAll('[data-catalog-group], .games-section')];
  const entries = cards.map(card => ({
    card,
    text: normalize(card.dataset.catalogSearch ?? ''),
    targets: (card.dataset.catalogTargets ?? '').split(' ').map(target => target.split(':'))
  }));
  let announcement;
  const update = () => {
    const terms = normalize(query.value).split(/\s+/).filter(Boolean);
    let count = 0;
    entries.forEach(({ card, text, targets }) => {
      const visible = terms.every(term => text.includes(term)) && targets.some(([targetPlatform, targetAvailability]) =>
        (platform.value === 'all' || platform.value === targetPlatform) && (availability.value === 'all' || availability.value === targetAvailability));
      const wasHidden = card.hidden;
      card.hidden = !visible;
      // Existing entrance animations must not hide cards newly revealed by a filter.
      if (visible && wasHidden) card.classList.add('is-visible');
      if (visible) count++;
    });
    groups.forEach(group => { group.hidden = !group.querySelector('[data-catalog-card]:not([hidden])'); });
    empty.hidden = count !== 0;
    const filtered = Boolean(query.value || availability.value !== 'all' || platform.value !== 'all');
    catalog.classList.toggle('catalog-filtered', filtered);
    reset.disabled = !filtered;
    clearTimeout(announcement);
    announcement = setTimeout(() => { results.textContent = cs ? `Zobrazeno: ${count} z ${cards.length}` : `Showing ${count} of ${cards.length}`; }, 120);
  };
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('reset', () => {
    // Native reset completes after the reset event.
    setTimeout(() => { update(); query.focus(); }, 0);
  });
  controls.hidden = false;
  update();
});
