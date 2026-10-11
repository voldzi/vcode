/* Cache only this application's public static assets. Never cache analytics, credentials or authenticated navigation. */
// The dashboard server inserts content identities; no manual cache-version bump is needed.
const CACHE='__PUBLIC_CACHE__';
const ASSETS=__PUBLIC_ASSETS__;
const OFFLINE='__PUBLIC_OFFLINE__';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{credentials:'omit',cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('vcode-metrics-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||event.request.method!=='GET'||!url.pathname.startsWith('/prehled/')||url.pathname.startsWith('/prehled/api/'))return;
 if(event.request.mode==='navigate') {event.respondWith(fetch(event.request).catch(()=>caches.match(OFFLINE)));return;}
 const asset=url.pathname+url.search;
 if(ASSETS.includes(asset))event.respondWith(caches.match(asset).then(cached=>cached||fetch(event.request)));
});

// Notification copy and destinations are fixed here. Push payloads never supply message text or URLs.
const INBOX_SECTIONS=new Set(['inquiries','partnerships']);
const NOTIFICATION_COPY={cs:{title:'VCode Přehled',body:'Čeká na vás nová zpráva. Otevřete soukromý Přehled.'},en:{title:'VCode Dashboard',body:'A new message is waiting. Open your private Dashboard.'}};
function dashboardClient(client){try{const url=new URL(client.url);return url.origin===self.location.origin&&url.pathname==='/prehled/';}catch{return false;}}
self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?.json()??{};}catch{}
 const section=payload?.type==='vcode-inbox'&&INBOX_SECTIONS.has(payload.section)?payload.section:'inquiries';
 const text=NOTIFICATION_COPY[payload?.locale==='en'?'en':'cs'];
 event.waitUntil((async()=>{
  // Every push is user-visible, even if the dashboard is already open.
  await self.registration.showNotification(text.title,{body:text.body,icon:'/prehled/icon-192.png',badge:'/prehled/icon-192.png',tag:'vcode-inbox-'+section,data:{section}});
  if(payload?.type==='vcode-inbox'&&Number.isSafeInteger(payload.totalCount)&&payload.totalCount>=0){try{if(payload.totalCount)await self.navigator?.setAppBadge?.(Math.min(payload.totalCount,9999));else await self.navigator?.clearAppBadge?.();}catch{}}
  for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))if(dashboardClient(client))client.postMessage({type:'VCODE_INBOX_UPDATED'});
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const section=INBOX_SECTIONS.has(event.notification.data?.section)?event.notification.data.section:'inquiries';
 const target=new URL('/prehled/#'+section,self.location.origin).href;
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true}),existing=windows.find(dashboardClient);
  if(existing){try{const moved=await existing.navigate(target);if(moved){await moved.focus();return;}}catch{}}
  await self.clients.openWindow(target);
 })());
});
