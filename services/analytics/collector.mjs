import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {acceptPublicEvent,acceptExpandedPublicEvent} from './collector-security.mjs';
const registry=process.env.ANALYTICS_SITES_FILE??'/run/config/sites.json';
const upstream=process.env.ANALYTICS_UPSTREAM??'http://umami:3000';
const runtimes=new Map([['/v1/tracker.js',await readFile(new URL('./public-v1.js',import.meta.url))],['/v2/tracker.js',await readFile(new URL('./public-v2.js',import.meta.url))]]);
const buckets=new Map();
setInterval(()=>{for(const[k,v]of buckets)if(v.until<Date.now())buckets.delete(k);},60000).unref();
createServer(async(req,res)=>{
 const send=(status,data='',type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});res.end(data);};
 try{
  const url=new URL(req.url,'http://collector'),path=url.pathname;
  if(url.search){send(404);return;}
  if(req.method==='GET'&&path==='/health'){send(200,'{"ok":true}');return;}
  if(req.method==='GET'&&runtimes.has(path)){send(200,runtimes.get(path),'text/javascript');return;}
  if(req.method!=='POST'||!['/v1/events','/v2/events'].includes(path)){send(404);return;}
  if(req.headers.dnt==='1'||req.headers['sec-gpc']==='1'){req.resume();send(204);return;}
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??'')){send(415);return;}
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>2048){send(413);return;}chunks.push(chunk);}
  let accepted;try{accepted=(path==='/v2/events'?acceptExpandedPublicEvent:acceptPublicEvent)(JSON.parse(Buffer.concat(chunks).toString()),req.headers,JSON.parse(await readFile(registry,'utf8')));}catch{send(400);return;}
  const key=accepted.payload.website+':'+accepted.ip,now=Date.now();let b=buckets.get(key);if(!b||b.until<now)b={count:0,until:now+60000};b.count++;buckets.set(key,b);if(b.count>120){send(429);return;}
  const response=await fetch(upstream+'/api/send',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':String(req.headers['user-agent']??'').slice(0,500),'X-Real-IP':accepted.ip},body:JSON.stringify({type:'event',payload:accepted.payload}),signal:AbortSignal.timeout(12000)});
  if(!response.ok){send(502);return;}send(204);
 }catch{send(502);}
}).listen(Number(process.env.PORT??8092),'0.0.0.0');
