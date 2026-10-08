import { createServer } from 'node:http';
import { open, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { loadCatalog, PREFIX, ORIGIN, PRODUCT, safePath, fileIdentity } from './release.mjs';
import { AggregateCounters } from './metrics.mjs';

const INTENT='/analytics/download-intent';
function waitWritable(res) {
  return new Promise((resolve,reject)=>{
    const cleanup=()=>{res.off('drain',drain);res.off('close',close);res.off('error',error);};
    const drain=()=>{cleanup();resolve();},close=()=>{cleanup();resolve();},error=(e)=>{cleanup();reject(e);};
    res.once('drain',drain);res.once('close',close);res.once('error',error);
    if(res.destroyed)close();
  });
}
export function singleRange(header,size) {
  if(header===undefined) return null;
  if(typeof header!=='string' || !/^bytes=(?:\d+-\d*|-\d+)$/.test(header)) return false;
  const [left,right]=header.slice(6).split('-');
  let start,end;
  if(left==='') {const suffix=Number(right);if(!Number.isSafeInteger(suffix)||suffix<=0)return false;start=Math.max(0,size-suffix);end=size-1;}
  else {start=Number(left);end=right===''?size-1:Number(right);}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return false;
  return {start,end:Math.min(end,size-1)};
}
export async function createDownloadServer(config={}) {
  const counters=config.counters ?? new AggregateCounters({path:config.metricsPath});
  let catalog={active:null,releases:[],resources:new Map()}, valid=true, catalogStamp=null;
  let loading=false;
  let intentWindow=Date.now(),intentCount=0;
  // Existing private aggregates need retention even without publication inputs.
  // This empty catalog cannot enable new counters, intent or public downloads.
  await counters.start(catalog);
  async function refresh(force=false) {
    if(loading)return;
    loading=true;
    try {
      if(!config.root || !config.catalogPath){await counters.start({active:null,releases:[],resources:new Map()});return;}
      let stamp=null;
      try {stamp=fileIdentity(await stat(config.catalogPath));}catch(error){if(error.code!=='ENOENT')throw error;}
      if(!force && stamp===catalogStamp)return;
      const replacement=await loadCatalog({root:config.root,catalogPath:config.catalogPath,trustedKeyPath:config.trustedKeyPath});
      await counters.start(replacement);
      catalog=replacement;valid=true;catalogStamp=stamp;
    } catch {valid=false;catalog={active:null,releases:[],resources:new Map()};counters.active=false;}
    finally{loading=false;}
  }
  await refresh(true);
  const reload=setInterval(()=>void refresh(),config.refreshMs??15_000);reload.unref();
  async function probe() {
    try {
      for(const resource of catalog.resources.values())if(resource.path){
        await safePath(resource.path);
        if(fileIdentity(await stat(resource.path))!==resource.identity)throw Error('Artifact drift');
      }
    } catch {valid=false;catalog={active:null,releases:[],resources:new Map()};counters.active=false;}
  }
  const availability=setInterval(()=>void probe(),config.probeMs??60_000);availability.unref();
  // Hashes are reconciled again, independently of unchanged catalog metadata.
  // Sequential streaming avoids loading native/model archives into memory.
  const integrity=setInterval(()=>void refresh(true),config.hashCheckMs??6*60*60_000);integrity.unref();
  // Pruning runs even on a quiet server; old days are never kept indefinitely.
  const retention=setInterval(()=>void counters.flush(),config.retentionMs??60_000);retention.unref();
  const server=createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy','same-origin');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Robots-Tag','noindex, nofollow');
    const raw=req.url??'';
    let metric=null,bytes=0,recorded=false;
    const record=(finished,aborted)=>{
      if(recorded||!metric)return;recorded=true;
      counters.record({...metric,method:req.method,status:res.statusCode,bytes,finished,aborted});
    };
    res.on('finish',()=>record(true,false));
    res.on('close',()=>record(res.writableFinished,!res.writableFinished));
    const empty=status=>{
      res.statusCode=status;
      if(status>=400){res.setHeader('Cache-Control','no-store');res.removeHeader('ETag');res.removeHeader('Content-Disposition');res.setHeader('Content-Type','text/plain; charset=utf-8');}
      if(status===304)res.removeHeader('Content-Length');else res.setHeader('Content-Length','0');
      res.end();
    };
    // Raw request target equality eliminates encoded aliases and ambiguous paths.
    if(raw.includes('%') || raw.includes('?') || raw.includes('#') || raw.includes('\\') || !raw.startsWith('/') || raw.includes('//')) return empty(404);
    if(raw===INTENT){
      if(req.method!=='POST') {res.setHeader('Allow','POST');return empty(405);}
      if(!catalog.active || !valid || !counters.active || counters.failed) return empty(503);
      if(req.headers.dnt==='1' || req.headers['sec-gpc']==='1')return empty(204);
      if(req.headers.origin!==ORIGIN || req.headers['sec-fetch-site']!=='same-origin'
        || req.headers.cookie || req.headers.authorization || req.headers['content-type']!=='application/json')return empty(403);
      if(Date.now()-intentWindow>=60_000){intentWindow=Date.now();intentCount=0;}
      // One bounded global allowance, no address/device keyed rate-limit records.
      if(++intentCount>120){res.setHeader('Retry-After','60');return empty(429);}
      if(req.headers['content-length'] && (!/^\d+$/.test(req.headers['content-length']) || Number(req.headers['content-length'])>128))return empty(413);
      let body=Buffer.alloc(0);
      try {
        for await(const chunk of req){if(body.length+chunk.length>128){res.setHeader('Connection','close');return empty(413);}body=Buffer.concat([body,chunk]);}
        const data=JSON.parse(body);
        if(!data || Array.isArray(data) || Object.keys(data).join(',')!=='product' || data.product!==PRODUCT)return empty(400);
      } catch {return empty(400);}
      counters.record({release:catalog.active.id,artifact:null,click:true});return empty(204);
    }
    if(!raw.startsWith(PREFIX))return empty(404);
    const resource=catalog.resources.get(raw);
    if(resource)metric={release:resource.release,artifact:resource.artifact};
    else if(raw===PREFIX+'latest.json' && catalog.active)metric={release:catalog.active.id,artifact:null};
    if(req.method!=='GET' && req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return empty(405);}
    if(!valid || !resource)return empty(404);
    const size=resource.bytes?.length??resource.size;
    res.setHeader('Content-Type',resource.mime);
    res.setHeader('ETag',`"sha256-${resource.hash}"`);
    res.setHeader('Accept-Ranges','bytes');
    res.setHeader('Cache-Control',resource.latest?'no-cache, max-age=0, must-revalidate':'public, max-age=31536000, immutable');
    if(resource.filename)res.setHeader('Content-Disposition',`attachment; filename="${resource.filename}"`);
    const rangeHeader=req.headers.range;
    const range=singleRange(rangeHeader,size);
    // HEAD validates a supplied range but has the full representation metadata.
    if(range===false){res.setHeader('Content-Range',`bytes */${size}`);return empty(416);}
    let handle;
    try {
      if(resource.path){
        await safePath(resource.path);
        handle=await open(resource.path,constants.O_RDONLY|constants.O_NOFOLLOW);
        if(fileIdentity(await handle.stat())!==resource.identity)throw Error('Artifact drift');
      }
      if(!rangeHeader && req.headers['if-none-match']===`"sha256-${resource.hash}"`)return empty(304);
      if(req.method==='HEAD'){res.statusCode=200;res.setHeader('Content-Length',String(size));return res.end();}
      const useRange=range && (!req.headers['if-range'] || req.headers['if-range']===`"sha256-${resource.hash}"`);
      const start=useRange?range.start:0,end=useRange?range.end:size-1;
      res.statusCode=useRange?206:200;
      if(useRange)res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Length',String(end-start+1));
      if(resource.bytes){const data=resource.bytes.subarray(start,end+1);bytes=data.length;res.end(data);return;}
      const stream=handle.createReadStream({start,end,autoClose:false});
      res.once('close',()=>{if(!res.writableFinished)stream.destroy();});
      for await(const chunk of stream){
        if(res.destroyed)break;
        // Bytes accepted by this download service's writable stream to its proxy.
        // This is not TCP/client acknowledgement or successful installation.
        bytes+=chunk.length;
        if(!res.write(chunk))await waitWritable(res);
      }
      if(!res.destroyed)res.end();
    } catch {
      if(!res.headersSent)empty(503);else res.destroy();
    } finally {if(handle)await handle.close().catch(()=>{});}
  });
  server.headersTimeout=10_000;server.requestTimeout=15_000;server.keepAliveTimeout=5000;
  const privateServer=createServer((req,res)=>{
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
    if(req.url!=='/health' || !['GET','HEAD'].includes(req.method)){res.statusCode=404;return res.end();}
    res.statusCode=valid&&!counters.failed?200:503;
    const bytes=JSON.stringify({status:valid&&!counters.failed?'ok':'unavailable',publication:catalog.active?'active':'disabled',metrics:counters.active&&!counters.failed?'active':'unavailable'});
    res.end(req.method==='HEAD'?undefined:bytes);
  });
  return {server,privateServer,counters,refresh,probe,close:async()=>{clearInterval(reload);clearInterval(retention);clearInterval(availability);clearInterval(integrity);await counters.close();}};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const service=await createDownloadServer({root:process.env.DOWNLOADS_ROOT,catalogPath:process.env.DOWNLOADS_CATALOG_PATH,
    trustedKeyPath:process.env.DOWNLOADS_TRUSTED_PUBLIC_KEY_FILE,metricsPath:process.env.DOWNLOAD_METRICS_PATH});
  service.server.listen(Number(process.env.DOWNLOADS_PORT??8096),'0.0.0.0');
  // Never proxy this listener. Only container loopback healthchecks use it.
  service.privateServer.listen(Number(process.env.DOWNLOADS_HEALTH_PORT??8097),'127.0.0.1');
  const stop=()=>{service.server.close();service.privateServer.close();void service.close();};
  process.on('SIGTERM',stop);process.on('SIGINT',stop);
}
