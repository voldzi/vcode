import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {acceptExpandedPublicEvent,effectiveApprovedEvents} from '../collector-security.mjs';

const portfolioEvents=['portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click'];
const site={id:'isolated-portfolio',domain:'studio.example',collectionEnabled:true,approvedAt:'2026-10-04',metricsApprovedAt:'2026-10-04',portfolioMetricsApprovedAt:'2026-10-09',integrationVersion:'vcode-public-v2',captureSources:true,allowedEvents:['outbound-click',...portfolioEvents],collectorKey:'isolated-edge-key',allowedPaths:['/','/en/']};
const headers={origin:'https://studio.example','sec-fetch-site':'same-origin','x-vcode-collector-key':site.collectorKey,'x-vcode-client-ip':'192.0.2.1'};
const input=name=>({website:site.id,name,path:'/'});

test('each portfolio event requires its exact site permission and separate review gate',()=>{
 for(const name of portfolioEvents){
  assert.deepEqual(acceptExpandedPublicEvent(input(name),headers,[site]).payload,{website:site.id,hostname:site.domain,url:'https://studio.example/',referrer:'',name});
  for(const patch of [{portfolioMetricsApprovedAt:undefined},{portfolioMetricsApprovedAt:null},{portfolioMetricsApprovedAt:''},{portfolioMetricsApprovedAt:' '},{portfolioMetricsApprovedAt:'invalid timestamp'},{portfolioMetricsApprovedAt:true},{metricsApprovedAt:null},{approvedAt:null},{collectionEnabled:false},{integrationVersion:'vcode-public-v1'},{allowedEvents:['outbound-click']}]){
   assert.throws(()=>acceptExpandedPublicEvent(input(name),headers,[{...site,...patch}]));
  }
  const otherSite={...site,id:'other-site',allowedEvents:['outbound-click']};
  assert.throws(()=>acceptExpandedPublicEvent({...input(name),website:otherSite.id},headers,[site,otherSite]));
 }
 const existingScope={...site,portfolioMetricsApprovedAt:undefined};
 assert.equal(acceptExpandedPublicEvent(input('outbound-click'),headers,[existingScope]).payload.name,'outbound-click');
 assert.equal(acceptExpandedPublicEvent({...input('pageview'),source:'tiktok'},headers,[existingScope]).payload.referrer,'https://tiktok.com/');
});

test('portfolio clicks cannot carry target URLs, text, source or private paths and cannot bypass trusted edge',()=>{
 for(const name of portfolioEvents){
  for(const patch of [{target:'https://mojeporce.cz/?account=private'},{url:'https://mestemhrou.cz/'},{text:'private text'},{source:'google'},{path:'/account/'},{path:'/?token=private'},{path:'/#private'},{name:'portfolio-arbitrary-click'},{name:'portfolio-vcode-click?target=private'}]){
   assert.throws(()=>acceptExpandedPublicEvent({...input(name),...patch},headers,[site]));
  }
  for(const patch of [{origin:'https://evil.example'},{origin:'https://studio.example.evil.example'},{'sec-fetch-site':'cross-site'},{'x-vcode-collector-key':'spoofed'},{'x-vcode-client-ip':'invalid'}]){
   assert.throws(()=>acceptExpandedPublicEvent(input(name),{...headers,...patch},[site]));
  }
 }
});

test('dashboard event capabilities use the same approval gate without discarding historical scope',()=>{
 assert.deepEqual(effectiveApprovedEvents(site),['outbound-click',...portfolioEvents]);
 for(const value of [null,'invalid timestamp',''])assert.deepEqual(effectiveApprovedEvents({...site,portfolioMetricsApprovedAt:value}),['outbound-click']);
 assert.deepEqual(effectiveApprovedEvents({...site,allowedEvents:['outbound-click','unknown','outbound-click',portfolioEvents[0]]}),['outbound-click',portfolioEvents[0]]);
 assert.deepEqual(effectiveApprovedEvents({...site,collectionEnabled:false}),['outbound-click',...portfolioEvents]);
 for(const value of [undefined,{}, {...site,integrationVersion:'vcode-public-v1'},{...site,metricsApprovedAt:null},{...site,allowedEvents:null}])assert.deepEqual(effectiveApprovedEvents(value),[]);
});

const config={websiteId:site.id,collectorPath:'/analytics/v2/events',allowedPaths:['/','/en/'],allowedEvents:['outbound-click',...portfolioEvents],captureSources:true,autoPageview:false,autoClick:false,captureTitle:false,captureReferrer:false,credentials:'omit',offline:'discard'};
const scriptPath=new URL('../public-v2-portfolio.js',import.meta.url);
async function runtime(){
 const calls=[],context={window:{},URL,document:{referrer:'https://www.tiktok.com/@private/video/123?secret=x#fragment'},navigator:{onLine:true},fetch:(...args)=>{calls.push(args);return Promise.resolve();}};
 vm.runInNewContext(await readFile(scriptPath,'utf8'),context);
 return{context,calls,tracker:context.window.vcodePublicAnalytics.create(config)};
}

test('portfolio runtime sends only explicit finite clicks and sanitized pageviews without automatic collection',async()=>{
 const {context,calls,tracker}=await runtime();
 assert.equal(context.window.vcodePublicAnalytics.contractVersion,'vcode-public-v2');
 assert.equal(context.window.vcodePublicAnalytics.runtimeRevision,'portfolio-1');
 assert.equal(calls.length,0);
 for(const name of portfolioEvents)tracker.event(name,'/');
 tracker.event('outbound-click','/');
 tracker.pageview('/en/');
 assert.equal(calls.length,5);
 for(const [index,name]of [...portfolioEvents,'outbound-click'].entries())assert.deepEqual(JSON.parse(calls[index][1].body),input(name));
 assert.deepEqual(JSON.parse(calls[4][1].body),{website:site.id,name:'pageview',path:'/en/',source:'tiktok'});
 for(const [path,options]of calls){
  assert.equal(path,'/analytics/v2/events');assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');
 }
 tracker.event('portfolio-arbitrary-click','/');tracker.event('portfolio-vcode-click','/account/');tracker.pageview('/?private=1');
 assert.equal(calls.length,5);
 for(const patch of [{allowedEvents:['portfolio-arbitrary-click']},{autoClick:true},{autoPageview:true},{captureTitle:true},{captureReferrer:true},{credentials:'include'},{offline:'queue'}])assert.throws(()=>context.window.vcodePublicAnalytics.create({...config,...patch}));
});

test('portfolio runtime discards events with DNT, GPC and offline state without replaying them',async()=>{
 const {context,calls,tracker}=await runtime();
 for(const [key,value]of [['doNotTrack','1'],['globalPrivacyControl',true],['onLine',false]]){
  const prior=context.navigator[key];context.navigator[key]=value;
  tracker.pageview('/');for(const name of portfolioEvents)tracker.event(name,'/');
  context.navigator[key]=prior;
 }
 assert.equal(calls.length,0);
 tracker.event('portfolio-vcode-click','/');assert.equal(calls.length,1);
});

test('immutable old runtime pins and the portfolio artifact remain exact; old clients reject new names',async()=>{
 const pins=[['public-v2.js','sha384-4mn0sN5UeFuzSjaXlbulwbJz7N38PPOovouC9Xp3OHD0r94YKgx8B2RAk/nK6mg0'],['public-v2-tiktok.js','sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5'],['public-v2-portfolio.js','sha384-zkZSzDImQVzQLiRsYnPvb7exdTP5bDp+cGuBD0J+Tb40PGH8ffG+b4qQGqfrP6lf']];
 for(const [filename,pin]of pins){
  const body=await readFile(new URL('../'+filename,import.meta.url));
  assert.equal('sha384-'+createHash('sha384').update(body).digest('base64'),pin);
  if(filename==='public-v2-portfolio.js')continue;
  const context={window:{},URL,document:{referrer:''},navigator:{onLine:true},fetch:()=>Promise.resolve()};
  vm.runInNewContext(body.toString(),context);
  assert.throws(()=>context.window.vcodePublicAnalytics.create(config));
  assert.doesNotThrow(()=>context.window.vcodePublicAnalytics.create({...config,allowedEvents:['outbound-click']}));
 }
});
