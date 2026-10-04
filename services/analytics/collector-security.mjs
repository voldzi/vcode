import {timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
export function acceptPublicEvent(input,headers,sites){
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
