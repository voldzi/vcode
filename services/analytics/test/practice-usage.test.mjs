import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {acceptPublicEvent,acceptExpandedPublicEvent,effectiveApprovedEvents,pageviewsAllowed} from '../collector-security.mjs';
import {measurementWindow,dailySeries} from '../dashboard-data.mjs';
const practice=['practice-start','practice-answer-viewed','practice-source-opened','practice-complete','practice-reset'];
const footer=['portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click','portfolio-myslopis-click'];
const site={id:'fixture-practice-usage',domain:'practice.example',integrationVersion:'vcode-public-v2',collectionEnabled:true,pageviewsEnabled:true,approvedAt:'2026-01-01',metricsApprovedAt:'2026-01-01',portfolioMetricsApprovedAt:'2026-01-01',portfolioMetricsCollectionStartedAt:'2026-01-01',practiceUsageMetricsRequired:true,practiceUsageMetricsApprovedAt:'2026-10-19T00:00:00Z',pageviewsCollectionStartedAt:'2026-10-19T01:00:00Z',practiceUsageCollectionStartedAt:'2026-10-19T02:00:00Z',captureSources:false,allowedEvents:[...footer,...practice],allowedPaths:['/prezentaceAI/'],collectorKey:'fixture-only-edge'};
const headers={origin:'https://practice.example','x-vcode-client-ip':'198.51.100.1','x-vcode-collector-key':site.collectorKey};
const input=name=>({website:site.id,name,path:'/prezentaceAI/'});
test('practice events need their own dated approval and start, without changing approved footer events',()=>{
 for(const patch of [{practiceUsageMetricsApprovedAt:null},{practiceUsageMetricsApprovedAt:'invalid'},{practiceUsageMetricsRequired:false},{practiceUsageCollectionStartedAt:null},{captureSources:true}]){
  const config={...site,...patch};assert.deepEqual(effectiveApprovedEvents(config),footer);
  for(const name of practice)assert.throws(()=>acceptExpandedPublicEvent(input(name),headers,[config]));
  for(const name of footer)assert.equal(acceptExpandedPublicEvent(input(name),headers,[config]).payload.name,name);
 }
 for(const name of practice)assert.deepEqual(acceptExpandedPublicEvent(input(name),headers,[site]).payload,{website:site.id,hostname:site.domain,url:'https://practice.example/prezentaceAI/',referrer:'',name});
});
test('practice pageviews require explicit activation, dated scope approval and a separate collection start in both versions',()=>{
 for(const patch of [{pageviewsEnabled:false},{pageviewsCollectionStartedAt:null},{pageviewsCollectionStartedAt:'invalid'},{practiceUsageMetricsApprovedAt:null},{practiceUsageMetricsRequired:false},{captureSources:true}]){
  const config={...site,...patch};assert.equal(pageviewsAllowed(config),false);for(const fn of [acceptPublicEvent,acceptExpandedPublicEvent])assert.throws(()=>fn(input('pageview'),headers,[config]));
 }
 assert.equal(acceptExpandedPublicEvent(input('pageview'),headers,[site]).payload.name,undefined);
 const atlas={...site,allowedEvents:footer};for(const key of Object.keys(atlas).filter(k=>k.startsWith('practiceUsage')||k==='pageviewsCollectionStartedAt'))delete atlas[key];atlas.captureSources=true;
 assert.equal(pageviewsAllowed(atlas),true);assert.equal(acceptExpandedPublicEvent({...input('pageview'),source:'bing'},headers,[atlas]).payload.referrer,'https://bing.com/');
});
test('usage payload excludes sources, identities, exercise content and query paths',()=>{
 for(const name of [...practice,'pageview']){
  for(const key of ['source','url','referrer','title','query','hash','participantId','sessionId','scenarioId','cohortId','variantId','answer','notes','eventData'])assert.throws(()=>acceptExpandedPublicEvent({...input(name),[key]:'excluded'},headers,[site]));
  for(const path of ['/prezentaceAI/?lekce=private','/prezentaceAI/#private','/prezentaceAI/admin/','/prezentaceAI/api/v1/'])assert.throws(()=>acceptExpandedPublicEvent({...input(name),path},headers,[site]));
 }
});
test('traffic query and daily coverage use the new start, not historical footer collection',()=>{
 const window={startAt:Date.parse('2026-10-12T00:00:00Z'),endAt:Date.parse('2026-10-19T12:00:00Z')};
 assert.deepEqual(measurementWindow(window,site.pageviewsCollectionStartedAt),{startAt:Date.parse(site.pageviewsCollectionStartedAt),endAt:window.endAt,started:true,comparisonCovered:false});
 assert.equal(measurementWindow(window,'2026-10-20').started,false);
 assert.equal(measurementWindow(window,'2026-01-01').comparisonCovered,true);
 const series=dailySeries(null,window,site.pageviewsCollectionStartedAt);assert.ok(series.slice(0,-1).every(p=>p.pageviews===null));assert.equal(series.at(-1).pageviews,0);
});
test('practice dashboard keeps five milestone counts separate from footer clicks and shows no pre-activation zeros',()=>{
 const source=readFileSync(new URL('../dashboard.js',import.meta.url),'utf8');const context={count:x=>Number(x)||0,Date};vm.runInNewContext(source.slice(source.indexOf('function practiceRows('),source.indexOf('function renderDetail(')),context);
 const s={capabilities:{events:site.allowedEvents},practiceUsageCollectionStartedAt:site.practiceUsageCollectionStartedAt,events:[{x:'practice-start',y:3},{x:'practice-start',y:2},{x:'portfolio-vcode-click',y:99}]};
 const rows=JSON.parse(JSON.stringify(context.practiceRows(s,Date.parse('2026-10-20'))));assert.deepEqual(rows.map(x=>x.x),practice);assert.deepEqual(rows.map(x=>x.y),[5,0,0,0,0]);
 assert.ok(context.practiceRows(s,Date.parse('2026-10-01')).every(x=>x.y===null));
});
