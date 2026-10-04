export function sanitizeEvent(input, sites) {
  const site = sites.find(s => s.id === input.website);
  if (!site || !['pageview','app-store-click','contact-click'].includes(input.name)) throw new Error('invalid event');
  const url = new URL(input.url, `https://${site.domain}`);
  if (url.hostname !== site.domain || url.protocol !== 'https:' || url.username || url.password) throw new Error('invalid host');
  if (!/^\/(?:en\/)?(?:$|aplikace\/|apps\/|app-store\/|blog\/|navody\/|guides\/|podpora\/|support\/|soukromi\/|privacy\/|nest\/|sibenice\/|jizda\/|cop-mobile\/)/.test(url.pathname)) throw new Error('private or unknown page');
  if (/\/(?:blog\/review|prehled|api)(?:\/|$)/.test(decodeURIComponent(url.pathname))) throw new Error('private page');
  const clean = new URL(url.pathname, `https://${site.domain}`);
  for (const key of ['utm_source','utm_medium','utm_campaign']) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_-]{1,64}$/.test(value)) clean.searchParams.set(key,value);
  }
  let referrer = '';
  try { const r = new URL(input.referrer); if (r.protocol === 'https:') referrer = r.origin; } catch {}
  return { site, payload: { website:site.id, hostname:site.domain, url:clean.href, referrer, ...(input.name !== 'pageview' ? {name:input.name} : {}) } };
}
export function sameOrigin(request, origin) {
  return request.headers.origin === origin;
}
