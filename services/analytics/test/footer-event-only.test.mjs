import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {acceptPublicEvent,acceptExpandedPublicEvent,effectiveApprovedEvents} from '../collector-security.mjs';
const names=['portfolio-moje-porce-click','portfolio-mestem-hrou-click','portfolio-myslopis-click','portfolio-vcode-click'];
const ai={id:'isolated-event-only-ai',domain:'practice.example',integrationVersion:'vcode-public-v2',collectionEnabled:true,pageviewsEnabled:false,approvedAt:'2026-10-19T00:00:00Z',metricsApprovedAt:'2026-10-19T00:00:00Z',portfolioMetricsApprovedAt:'2026-10-19T00:00:00Z',allowedPaths:['/practice/'],allowedEvents:names,captureSources:false,collectorKey:'synthetic-isolated-edge-key'};
const ea={...ai,id:'isolated-atlas',domain:'atlas.example',allowedPaths:['/atlas/'],pageviewsEnabled:true,captureSources:true};
const headers=site=>({origin:'https://'+site.domain,'sec-fetch-site':'same-origin','x-vcode-collector-key':site.collectorKey,'x-vcode-client-ip':'198.51.100.9'});
const input=(site,name)=>({website:site.id,name,path:site.allowedPaths[0]});
test('event-only site accepts exactly the four fixed categories and rejects pageviews in both collector versions',()=>{
 for(const name of names){const r=acceptExpandedPublicEvent(input(ai,name),headers(ai),[ai]);assert.deepEqual(r.payload,{website:ai.id,hostname:ai.domain,url:'https://practice.example/practice/',referrer:'',name});}
 assert.throws(()=>acceptExpandedPublicEvent(input(ai,'pageview'),headers(ai),[ai]));
 assert.throws(()=>acceptPublicEvent(input(ai,'pageview'),headers(ai),[ai]));
 assert.throws(()=>acceptPublicEvent(input(ai,names[0]),headers(ai),[ai]));
 for(const extra of ['source','url','href','title','referrer','query','hash','nickname','returnCode','participant','notes','target','eventData'])assert.throws(()=>acceptExpandedPublicEvent({...input(ai,names[0]),[extra]:'excluded'},headers(ai),[ai]));
 for(const path of ['/practice/?private=x','/practice/#private','/practice/admin','/practice/privacy/','/private/'])assert.throws(()=>acceptExpandedPublicEvent({...input(ai,names[0]),path},headers(ai),[ai]));
});
test('new event-only flag does not revoke existing atlas clean-entry pageviews or their source category',()=>{
 const before=acceptExpandedPublicEvent({...input(ea,'pageview'),source:'google'},headers(ea),[ea]);assert.equal(before.payload.referrer,'https://google.com/');assert.equal(before.payload.name,undefined);
 for(const name of names){const after=acceptExpandedPublicEvent(input(ea,name),headers(ea),[ea]);assert.equal(after.payload.url,'https://atlas.example/atlas/');assert.equal(after.payload.referrer,'');}
 assert.deepEqual(acceptExpandedPublicEvent({...input(ea,'pageview'),source:'google'},headers(ea),[ea]),before);
 const old={...ea};delete old.pageviewsEnabled;assert.deepEqual(acceptExpandedPublicEvent(input(old,'pageview'),headers(old),[old]).payload,acceptPublicEvent(input(old,'pageview'),headers(old),[old]).payload);
});
test('distinct site, edge, consent and event allowlists cannot authorize one another',()=>{
 for(const patch of [{collectionEnabled:false},{approvedAt:null},{metricsApprovedAt:null},{portfolioMetricsApprovedAt:null},{portfolioMetricsApprovedAt:'invalid'},{allowedEvents:[]},{allowedPaths:['/other/']}])assert.throws(()=>acceptExpandedPublicEvent(input(ai,names[0]),headers(ai),[{...ai,...patch}]));
 assert.equal(effectiveApprovedEvents({...ai,portfolioMetricsApprovedAt:null}).length,0);
 for(const patch of [{origin:'https://other.example'},{'sec-fetch-site':'cross-site'},{'x-vcode-client-ip':'invalid'},{'x-vcode-collector-key':'wrong-key'}])assert.throws(()=>acceptExpandedPublicEvent(input(ai,names[0]),{...headers(ai),...patch},[ai]));
 assert.throws(()=>acceptExpandedPublicEvent({...input(ai,names[0]),website:ea.id},headers(ai),[ai,ea]));
});
test('dashboard always shows four separate approved portfolio totals, including real zeros, and describes event-only measurement',()=>{
 const source=readFileSync(new URL('../dashboard.js',import.meta.url),'utf8');const body=source.slice(source.indexOf('function portfolioRows('),source.indexOf('function renderDetail('));const context={count:x=>Number(x)||0};vm.runInNewContext(body,context);
 const rows=JSON.parse(JSON.stringify(context.portfolioRows({capabilities:{events:names},events:[{x:names[0],y:3},{x:names[0],y:2},{x:names[2],y:7},{x:'pageview',y:99},{x:'private',y:123}]})));
 assert.equal(rows.length,4);assert.equal(rows.find(x=>x.x===names[0]).y,5);assert.equal(rows.find(x=>x.x===names[1]).y,0);assert.equal(rows.find(x=>x.x===names[2]).y,7);
 assert.ok(source.includes("eventOnlyNotice:'Tento web počítá pouze čtyři odkazy v patičce."));assert.ok(source.includes("t(s.capabilities.pageviews===false?'footerClicks':'pageviews')"));
});
