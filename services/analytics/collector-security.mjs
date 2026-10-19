import {timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
function acceptPublicBase(input,headers,sites){
 if(!input || Object.keys(input).some(k=>!['website','name','path'].includes(k)))throw new Error('Unexpected properties');
 const site=sites.find(s=>s.id===input.website);
 if(site?.collectionEnabled!==true || !site.approvedAt || !site.collectorKey || !Array.isArray(site.allowedPaths))throw new Error('Unapproved site');
 const provided=Buffer.from(String(headers['x-vcode-collector-key']??'')),expected=Buffer.from(site.collectorKey);
 if(provided.length!==expected.length || !timingSafeEqual(provided,expected))throw new Error('Untrusted edge');
 if(headers.origin!==`https://${site.domain}` || (headers['sec-fetch-site'] && headers['sec-fetch-site']!=='same-origin'))throw new Error('Foreign origin');
 if(input.name!=='pageview' || typeof input.path!=='string' || !site.allowedPaths.includes(input.path) || !/^\/[a-zA-Z0-9_:/-]*$/.test(input.path))throw new Error('Private path');
 const ip=String(headers['x-vcode-client-ip']??'');
 if(!isIP(ip))throw new Error('Invalid edge address');
 return {payload:{website:site.id,hostname:site.domain,url:`https://${site.domain}${input.path}`,referrer:''},ip};
}

export function acceptPublicEvent(input,headers,sites){
 if(!pageviewsAllowed(sites.find(site=>site.id===input?.website)))throw new Error('Pageviews unapproved');
 return acceptPublicBase(input,headers,sites);
}

const sourceDomains={google:'google.com',seznam:'seznam.cz',bing:'bing.com',duckduckgo:'duckduckgo.com',facebook:'facebook.com',instagram:'instagram.com',tiktok:'tiktok.com',linkedin:'linkedin.com',openai:'chatgpt.com',claude:'claude.ai',perplexity:'perplexity.ai'};
const portfolioEvents=new Set(['portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click','portfolio-myslopis-click']);
const practiceEvents=new Set(['practice-start','practice-answer-viewed','practice-source-opened','practice-complete','practice-reset']);
const dated=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
export function practiceUsageApproved(site){
 return site?.integrationVersion==='vcode-public-v2'&&site.practiceUsageMetricsRequired===true&&site.captureSources===false&&dated(site.practiceUsageMetricsApprovedAt);
}
export function pageviewsAllowed(site){
 if(site?.pageviewsEnabled===false)return false;
 if(site?.practiceUsageMetricsRequired===true||Object.hasOwn(site??{},'practiceUsageMetricsApprovedAt'))return site.pageviewsEnabled===true&&practiceUsageApproved(site)&&dated(site.pageviewsCollectionStartedAt);
 return true;
}
const supportedEvents=new Set(['app-store-click','contact-click','outbound-click',...portfolioEvents,...practiceEvents]);
export function effectiveApprovedEvents(site){
 if(site?.integrationVersion!=='vcode-public-v2'||!site.metricsApprovedAt||!Array.isArray(site.allowedEvents))return [];
 const portfolioApproved=typeof site.portfolioMetricsApprovedAt==='string'&&Number.isFinite(Date.parse(site.portfolioMetricsApprovedAt));
 const practiceApproved=practiceUsageApproved(site)&&dated(site.practiceUsageCollectionStartedAt);
 return [...new Set(site.allowedEvents)].filter(name=>supportedEvents.has(name)&&(!portfolioEvents.has(name)||portfolioApproved)&&(!practiceEvents.has(name)||practiceApproved));
}
export function acceptExpandedPublicEvent(input,headers,sites){
 if(!input||Object.keys(input).some(k=>!['website','name','path','source'].includes(k)))throw new Error('Unexpected properties');
 const site=sites.find(s=>s.id===input.website);
 if(site?.integrationVersion!=='vcode-public-v2'||!site.metricsApprovedAt)throw new Error('Expanded metrics unapproved');
 if(input.name==='pageview'&&!pageviewsAllowed(site))throw new Error('Pageviews unapproved');
 const accepted=acceptPublicBase({website:input.website,name:'pageview',path:input.path},headers,sites);
 if(input.name!=='pageview'){
  if(!effectiveApprovedEvents(site).includes(input.name)||Object.hasOwn(input,'source'))throw new Error('Unapproved event');
  accepted.payload.name=input.name;
 }
 if(Object.hasOwn(input,'source')){
  if(site.captureSources!==true||!Object.hasOwn(sourceDomains,input.source))throw new Error('Unapproved source');
  accepted.payload.referrer='https://'+sourceDomains[input.source]+'/';
 }
 return accepted;
}
