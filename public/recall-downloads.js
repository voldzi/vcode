// Activated only by a published, accepted Recall product page.
(() => {
  const page = /^\/(?:aplikace|en\/apps)\/vcode-recall\/$/.test(location.pathname);
  if (!page || location.hostname !== 'vcode.zeleznalady.cz' || location.protocol !== 'https:' || location.search || location.hash ||
      navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || navigator.onLine === false) return;
  document.addEventListener('click', event => {
    if (!event.isTrusted || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || navigator.onLine === false) return;
    const link = event.target.closest?.('a[data-recall-download]');
    if (!link) return;
    const target = new URL(link.href, location.origin);
    if (target.origin !== location.origin || target.search || target.hash ||
        !/^\/downloads\/chromadb-status\/\d+\.\d+\.\d+(?:\.\d+)?-\d+\/VCodeRecall-\d+\.\d+\.\d+(?:\.\d+)?-\d+-macos-arm64\.(?:zip|dmg)$/.test(target.pathname)) return;
    fetch('/analytics/download-intent', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'vcode-recall' })
    }).catch(() => {});
  });
})();
