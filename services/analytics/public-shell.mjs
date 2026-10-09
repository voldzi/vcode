import {createHash} from 'node:crypto';

const digest=body=>createHash('sha256').update(body).digest('hex').slice(0,20);
const CACHEABLE=new Set(['dashboard.css','dashboard.js','download-metrics-ui.js','contact-inbox-ui.js','offline.html','icon-192.png','icon-512.png']);

// Identity depends only on the public shell. Registry, sessions and API data never enter it.
export function createPublicShell(html,worker,assets){
 const versions=new Map(),urls=new Map();
 const add=(path,body)=>{const version=digest(body);versions.set(path,version);urls.set(path,path+'?v='+version);};
 const rewrite=source=>String(source).replace(/\b(href|src)=(['"])(\/prehled\/[^'"?]+)(?:\?[^'"]*)?\2/g,(match,attribute,quote,path)=>urls.has(path)?attribute+'='+quote+urls.get(path)+quote:match);
 for(const [path,asset]of assets){
  if(!CACHEABLE.has(path.slice('/prehled/'.length))||path==='/prehled/offline.html')continue;
  add(path,asset.body);
 }
 // Resolve the offline page's stylesheet and icon before deriving its own identity.
 const offlinePath='/prehled/offline.html',offline=assets.get(offlinePath);
 if(!offline)throw Error('Incomplete dashboard public shell');
 const offlineBody=Buffer.from(rewrite(offline.body));assets.set(offlinePath,{...offline,body:offlineBody});add(offlinePath,offlineBody);
 if(urls.size!==CACHEABLE.size)throw Error('Incomplete dashboard public shell');
 const cache='vcode-metrics-shell-'+digest(digest(String(worker))+'\n'+[...urls.values()].sort().join('\n'));
 const page=rewrite(html);
 const serviceWorker=String(worker).replace('__PUBLIC_CACHE__',cache).replace('__PUBLIC_ASSETS__',JSON.stringify([...urls.values()])).replace('__PUBLIC_OFFLINE__',urls.get('/prehled/offline.html'));
 if(/__PUBLIC_(?:CACHE|ASSETS|OFFLINE)__/.test(serviceWorker))throw Error('Unresolved dashboard public shell');
 return{page,serviceWorker,versions,urls,cache,etag:'"'+digest(serviceWorker)+'"'};
}
