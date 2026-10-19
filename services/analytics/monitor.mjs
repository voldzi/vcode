import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const registry=process.env.ANALYTICS_SITES_FILE??'/run/config/sites.json';
const stateFile=process.env.ANALYTICS_STATUS_FILE??'/state/connections.json';
const expected=createHash('sha384').update(await readFile(new URL('./public-v1.js',import.meta.url))).digest('base64');
async function run(){
 const sites=JSON.parse(await readFile(registry,'utf8'));
 const statuses=await Promise.all(sites.filter(s=>['vcode-public-v1','vcode-public-v2'].includes(s.integrationVersion)).map(async s=>{
  const status={domain:s.domain,checkedAt:new Date().toISOString(),connected:false};
  try{
   if(!/^[a-z0-9.-]+$/.test(s.domain)||!s.trackerPath?.startsWith('/')||!s.collectorPath?.startsWith('/'))throw new Error('Invalid registry');
   const response=await fetch(`https://${s.domain}${s.trackerPath}`,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'VCode analytics connection check'}});
   if(!response.ok||!response.headers.get('content-type')?.includes('javascript'))throw new Error('Tracker missing');
   if(Number(response.headers.get('content-length')??0)>10000)throw new Error('Invalid tracker');
   const source=await response.text();if(source.length>10000||'sha384-'+createHash('sha384').update(source).digest('base64')!==(s.runtimeIntegrity??'sha384-'+expected))throw new Error('Tracker mismatch');
   if(s.portfolioMetricsApprovedAt&&s.allowedEvents?.some(name=>name.startsWith('portfolio-'))&&s.portfolioTrackerPath){
    if(!/^\/[a-zA-Z0-9_./-]+$/.test(s.portfolioTrackerPath)||s.portfolioTrackerPath.includes('..')||!/^sha384-[A-Za-z0-9+/]+={0,2}$/.test(s.portfolioRuntimeIntegrity??''))throw new Error('Invalid portfolio runtime');
    const extra=await fetch(`https://${s.domain}${s.portfolioTrackerPath}`,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'VCode analytics connection check'}});
    if(!extra.ok||!extra.headers.get('content-type')?.includes('javascript')||Number(extra.headers.get('content-length')??0)>10000)throw new Error('Portfolio runtime missing');
    const code=await extra.text();if(code.length>10000||'sha384-'+createHash('sha384').update(code).digest('base64')!==s.portfolioRuntimeIntegrity)throw new Error('Portfolio runtime mismatch');
   }
   if(s.practiceUsageMetricsRequired===true&&typeof s.practiceUsageMetricsApprovedAt==='string'&&Number.isFinite(Date.parse(s.practiceUsageMetricsApprovedAt))){
    if(!/^\/[a-zA-Z0-9_./-]+$/.test(s.practiceUsageTrackerPath??'')||s.practiceUsageTrackerPath.includes('..')||!/^sha384-[A-Za-z0-9+/]+={0,2}$/.test(s.practiceUsageRuntimeIntegrity??''))throw new Error('Invalid practice runtime');
    const extra=await fetch(`https://${s.domain}${s.practiceUsageTrackerPath}`,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'VCode analytics connection check'}});
    if(!extra.ok||!extra.headers.get('content-type')?.includes('javascript')||Number(extra.headers.get('content-length')??0)>10000)throw new Error('Practice runtime missing');
    const code=await extra.text();if(code.length>10000||'sha384-'+createHash('sha384').update(code).digest('base64')!==s.practiceUsageRuntimeIntegrity)throw new Error('Practice runtime mismatch');
   }
   const rejected=await fetch(`https://${s.domain}${s.collectorPath}`,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Origin:`https://${s.domain}`,'User-Agent':'VCode analytics connection check'},body:'{}',signal:AbortSignal.timeout(12000)});
   if(rejected.status!==400)throw new Error('Collector missing');
   status.connected=true;
  }catch{}
  return status;
 }));
 await writeFile(stateFile+'.partial',JSON.stringify(statuses),{mode:0o600});await rename(stateFile+'.partial',stateFile);
 console.log('Analytics connection check completed:',statuses.filter(s=>s.connected).length+'/'+statuses.length);
}
while(true){try{await run();}catch{console.error('Analytics connection check failed.');}await new Promise(r=>setTimeout(r,300000));}
