/* Cache only this application's public static assets. Never cache analytics, credentials or authenticated navigation. */
const CACHE='vcode-metrics-shell-v2';
const ASSETS=['/prehled/offline.html','/prehled/dashboard.css','/prehled/dashboard.js','/prehled/icon-192.png','/prehled/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{credentials:'omit',cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('vcode-metrics-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||event.request.method!=='GET'||!url.pathname.startsWith('/prehled/')||url.pathname.startsWith('/prehled/api/'))return;
 if(event.request.mode==='navigate') {event.respondWith(fetch(event.request).catch(()=>caches.match('/prehled/offline.html')));return;}
 if(!url.search&&ASSETS.includes(url.pathname))event.respondWith(caches.match(url.pathname).then(cached=>cached||fetch(event.request)));
});
