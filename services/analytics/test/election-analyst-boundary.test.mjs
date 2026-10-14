import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptExpandedPublicEvent} from '../collector-security.mjs';

// Entirely synthetic registrations; no production identifier, edge key or records.
const atlas={id:'synthetic-atlas',domain:'stratos.example.invalid',integrationVersion:'vcode-public-v2',collectionEnabled:true,approvedAt:'synthetic-owner-review',metricsApprovedAt:'synthetic-metrics-review',captureSources:true,allowedPaths:['/ea/'],allowedEvents:[],collectorKey:'synthetic-atlas-edge-key'};
const sibling={...atlas,id:'synthetic-private-sibling',allowedPaths:['/akb/'],collectorKey:'synthetic-separate-edge-key'};
const headers={origin:'https://stratos.example.invalid','sec-fetch-site':'same-origin','x-vcode-client-ip':'192.0.2.55','x-vcode-collector-key':atlas.collectorKey};
const view={website:atlas.id,name:'pageview',path:'/ea/',source:'bing'};

test('an atlas registration on a shared STRATOS origin cannot collect sibling paths or political selections',()=>{
 const sites=[atlas,sibling];
 assert.deepEqual(acceptExpandedPublicEvent(view,headers,sites).payload,{website:atlas.id,hostname:atlas.domain,url:'https://stratos.example.invalid/ea/',referrer:'https://bing.com/'});
 for(const path of ['/','/ea','/akb/','/chat/','/ea/privacy/analytics/','/ea/api/results','/ea/?candidate=synthetic','/ea/#municipality=synthetic','/ea/../akb/']){
  assert.throws(()=>acceptExpandedPublicEvent({...view,path},headers,sites));
 }
 for(const name of ['contact-click','outbound-click','app-store-click','portfolio-vcode-click','candidate-selected','map-moved']){
  assert.throws(()=>acceptExpandedPublicEvent({website:atlas.id,name,path:'/ea/'},headers,sites));
 }
 for(const key of ['candidate','municipality','election','query','coordinates','filter','notes','export','title','referrer','target','properties']){
  assert.throws(()=>acceptExpandedPublicEvent({...view,[key]:'synthetic-sensitive-value'},headers,sites));
 }
 // Same origin alone cannot substitute for the other registration's edge key.
 assert.throws(()=>acceptExpandedPublicEvent({website:sibling.id,name:'pageview',path:'/akb/'},headers,sites));
 assert.throws(()=>acceptExpandedPublicEvent(view,{...headers,'x-vcode-collector-key':sibling.collectorKey},sites));
});

test('atlas registration and metrics approvals remain separate from adding it to the dashboard',()=>{
 for(const patch of [{collectionEnabled:false},{approvedAt:null},{metricsApprovedAt:null},{captureSources:false}]){
  assert.throws(()=>acceptExpandedPublicEvent(view,headers,[{...atlas,...patch}]));
 }
 const disabled={...atlas,collectionEnabled:false,approvedAt:null,metricsApprovedAt:null,captureSources:false};
 assert.throws(()=>acceptExpandedPublicEvent({website:atlas.id,name:'pageview',path:'/ea/'},headers,[disabled]));
 // No raw referrer survives even when collection is explicitly approved.
 assert.throws(()=>acceptExpandedPublicEvent({...view,source:'https://bing.com/search?q=synthetic-sensitive-value'},headers,[atlas]));
});
