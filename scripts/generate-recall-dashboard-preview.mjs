import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateDownloadMetrics } from '../services/analytics/lib/download-metrics.mjs';

// Private visual acceptance fixture. Never queries Umami, the registry, a release
// package or an existing aggregate file. No authentication route is changed.
const directory = await mkdtemp(join(tmpdir(), 'vcode-recall-dashboard-preview-'));
const version = '0.6.0', buildNumber = '202610081337', release = `${version}-${buildNumber}`;
const zip = `VCodeRecall-${release}-macos-arm64.zip`, dmg = `VCodeRecall-${release}-macos-arm64.dmg`;
const zero = { getRequests: 0, headRequests: 0, fullResponses: 0, rangeResponses: 0, errorResponses: 0, abortedResponses: 0, bytesWritten: 0, clickIntents: 0 };
const rows = [];
for (let index = 0; index < 7; index++) {
  if (index === 2) continue; // Explicit missing coverage, not an invented zero.
  const date = `2026-10-${String(index + 2).padStart(2, '0')}`;
  rows.push({ date, release, artifact: zip, ...zero, getRequests: 5 + index * 2, headRequests: 2, fullResponses: 2 + index, rangeResponses: index, errorResponses: 1, abortedResponses: 1, bytesWritten: (2 + index) * 128 * 1024 * 1024 });
  rows.push({ date, release, artifact: dmg, ...zero, getRequests: 3 + index, headRequests: 1, fullResponses: 1 + index, rangeResponses: 1, errorResponses: 1, bytesWritten: (1 + index) * 96 * 1024 * 1024 });
  rows.push({ date, release, artifact: null, ...zero, getRequests: 2, headRequests: 1, bytesWritten: 1200, clickIntents: 4 + index });
}
const document = {
  schemaVersion: 1, product: 'vcode-recall', measurement: 'service-to-proxy', retentionDays: 30, timezone: 'UTC',
  coverageStart: '2026-10-02T00:00:00.000Z', updatedAt: '2026-10-08T14:00:00.000Z',
  releases: [{ id: release, version, buildNumber, artifacts: [zip, dmg] }], days: rows,
};
const metrics = validateDownloadMetrics(document, { days: 7, now: Date.parse('2026-10-08T14:00:00.000Z') });
await writeFile(join(directory, 'dashboard.css'), await readFile(new URL('../services/analytics/dashboard.css', import.meta.url)));
await writeFile(join(directory, 'download-metrics-ui.js'), await readFile(new URL('../services/analytics/download-metrics-ui.js', import.meta.url)));
await writeFile(join(directory, 'preview.js'), `const query=new URL(location.href).searchParams;const language=query.get('lang')==='en'?'en':'cs';document.documentElement.lang=language;document.documentElement.dataset.theme=query.get('theme')==='dark'?'dark':'light';if(query.get('zoom')==='2')document.documentElement.classList.add('qa-zoom');document.getElementById('qa-label').textContent=language==='en'?'PRIVATE SYNTHETIC FIXTURE · NOT PRODUCTION DATA':'NEVEŘEJNÁ SYNTETICKÁ UKÁZKA · NEJDE O PRODUKČNÍ ÚDAJE';document.getElementById('qa-title').textContent=language==='en'?'Distribution preview':'Náhled distribuce';document.getElementById('qa-description').textContent=language==='en'?'Fictional release and counters. No package has been released.':'Smyšlené vydání a čítače. Žádný balíček nebyl uvolněn.';window.VCodeDownloadMetrics.render(document.getElementById('distribution'),query.get('view')==='pending'?{availability:'unavailable',reason:'not-ready',product:'vcode-recall',totals:null,series:[],artifacts:[]}:${JSON.stringify(metrics)},language);`);
await writeFile(join(directory, 'preview.css'), '.qa-zoom{font-size:200%}main{max-width:1350px}body{padding-bottom:2rem}.app-header{margin-bottom:1rem}.app-header h1{overflow-wrap:anywhere}.qa-links{display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0}.qa-links a{min-height:44px;padding:.5rem}.distribution-file-metrics dd{white-space:normal}');
await writeFile(join(directory, 'index.html'), '<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private synthetic distribution preview</title><link rel="stylesheet" href="/dashboard.css"><link rel="stylesheet" href="/preview.css"><script defer src="/download-metrics-ui.js"></script><script defer src="/preview.js"></script></head><body><main><header class="app-header"><div><p class="eyebrow" id="qa-label"></p><h1 id="qa-title"></h1><p class="muted" id="qa-description"></p></div></header><nav class="qa-links" aria-label="Synthetic preview variants"><a href="/?lang=cs">CS</a><a href="/?lang=en">EN</a><a href="/?lang=cs&view=pending">Příprava</a><a href="/?lang=cs&theme=dark">Dark</a><a href="/?lang=cs&zoom=2">200 %</a></nav><section id="distribution" aria-labelledby="distribution-title"></section></main></body></html>');
await writeFile(join(directory, 'serve.mjs'), `import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';const allowed=new Map([['/','index.html'],['/dashboard.css','dashboard.css'],['/preview.css','preview.css'],['/download-metrics-ui.js','download-metrics-ui.js'],['/preview.js','preview.js']]);createServer(async(req,res)=>{const name=allowed.get(new URL(req.url,'http://127.0.0.1').pathname);if(req.method!=='GET'||!name){res.writeHead(404);res.end();return;}const type=name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':'text/javascript';res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','Content-Security-Policy':"default-src 'self';script-src 'self';style-src 'self';connect-src 'none'"});res.end(await readFile(new URL(name,import.meta.url)));}).listen(Number(process.env.PORT??4396),'127.0.0.1');`);
console.log(JSON.stringify({ directory, server: join(directory, 'serve.mjs'), url: 'http://127.0.0.1:4396/', synthetic: true }, null, 2));
