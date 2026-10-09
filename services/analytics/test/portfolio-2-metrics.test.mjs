import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {acceptExpandedPublicEvent,effectiveApprovedEvents} from '../collector-security.mjs';

const gameEvents=['portfolio-vcode-click','portfolio-moje-porce-click','portfolio-myslopis-click'];
const allPortfolioEvents=[...gameEvents,'portfolio-mestem-hrou-click'];
const site={id:'isolated-portfolio-2',domain:'game.example',collectionEnabled:true,approvedAt:'2026-10-04',metricsApprovedAt:'2026-10-04',portfolioMetricsApprovedAt:'2026-10-09T14:00:00Z',integrationVersion:'vcode-public-v2',captureSources:true,allowedEvents:['outbound-click',...gameEvents],collectorKey:'isolated-game-edge-key',allowedPaths:['/mestem-hrou/']};
const headers={origin:'https://game.example','sec-fetch-site':'same-origin','x-vcode-collector-key':site.collectorKey,'x-vcode-client-ip':'192.0.2.2'};
const input=name=>({website:site.id,name,path:'/mestem-hrou/'});

test('Myslopis footer event requires its own allowed site scope and dated portfolio approval',()=>{
 assert.deepEqual(acceptExpandedPublicEvent(input('portfolio-myslopis-click'),headers,[site]).payload,{website:site.id,hostname:site.domain,url:'https://game.example/mestem-hrou/',referrer:'',name:'portfolio-myslopis-click'});
 for(const patch of [{portfolioMetricsApprovedAt:undefined},{portfolioMetricsApprovedAt:null},{portfolioMetricsApprovedAt:''},{portfolioMetricsApprovedAt:'invalid date'},{portfolioMetricsApprovedAt:true},{metricsApprovedAt:null},{approvedAt:null},{collectionEnabled:false},{integrationVersion:'vcode-public-v1'},{allowedEvents:['outbound-click','portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click']}]){
  assert.throws(()=>acceptExpandedPublicEvent(input('portfolio-myslopis-click'),headers,[{...site,...patch}]));
 }
 const otherSite={...site,id:'isolated-portfolio-1',allowedEvents:['outbound-click','portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click']};
 assert.throws(()=>acceptExpandedPublicEvent({...input('portfolio-myslopis-click'),website:otherSite.id},headers,[site,otherSite]));
 assert.deepEqual(effectiveApprovedEvents(site),['outbound-click',...gameEvents]);
 assert.deepEqual(effectiveApprovedEvents({...site,portfolioMetricsApprovedAt:null}),['outbound-click']);
});

test('Myslopis event cannot carry target URL, text, source or private paths and cannot bypass edge authentication',()=>{
 for(const patch of [{target:'https://myslopis.cz/?private=1'},{url:'https://myslopis.cz/'},{text:'Myslopis footer'},{source:'google'},{path:'/account/'},{path:'/mestem-hrou/?token=private'},{path:'/mestem-hrou/#private'},{name:'portfolio-arbitrary-click'}]){
  assert.throws(()=>acceptExpandedPublicEvent({...input('portfolio-myslopis-click'),...patch},headers,[site]));
 }
 for(const patch of [{origin:'https://evil.example'},{origin:'https://game.example.evil.example'},{'sec-fetch-site':'cross-site'},{'x-vcode-collector-key':'spoofed'},{'x-vcode-client-ip':'invalid'}]){
  assert.throws(()=>acceptExpandedPublicEvent(input('portfolio-myslopis-click'),{...headers,...patch},[site]));
 }
 assert.throws(()=>acceptExpandedPublicEvent(input('portfolio-mestem-hrou-click'),headers,[site]));
});

const config={websiteId:site.id,collectorPath:'/analytics/v2/events',allowedPaths:site.allowedPaths,allowedEvents:['outbound-click',...allPortfolioEvents],captureSources:true,autoPageview:false,autoClick:false,captureTitle:false,captureReferrer:false,credentials:'omit',offline:'discard'};
const runtimePath=new URL('../public-v2-portfolio-2.js',import.meta.url);
async function runtime(){
 const calls=[],context={window:{},URL,document:{referrer:'https://www.tiktok.com/@private/video/123?private=x#private'},navigator:{onLine:true},fetch:(...args)=>{calls.push(args);return Promise.resolve();}};
 vm.runInNewContext(await readFile(runtimePath,'utf8'),context);
 return{context,calls,tracker:context.window.vcodePublicAnalytics.create(config)};
}

test('portfolio-2 explicitly sends finite click names without targets and preserves prior clicks and sanitized sources',async()=>{
 const {context,calls,tracker}=await runtime();
 assert.equal(context.window.vcodePublicAnalytics.contractVersion,'vcode-public-v2');
 assert.equal(context.window.vcodePublicAnalytics.runtimeRevision,'portfolio-2');
 assert.equal(calls.length,0);
 for(const name of [...allPortfolioEvents,'outbound-click'])tracker.event(name,'/mestem-hrou/');
 tracker.pageview('/mestem-hrou/');
 assert.equal(calls.length,6);
 for(const [index,name]of [...allPortfolioEvents,'outbound-click'].entries())assert.deepEqual(JSON.parse(calls[index][1].body),input(name));
 assert.deepEqual(JSON.parse(calls[5][1].body),{...input('pageview'),source:'tiktok'});
 for(const [path,options]of calls){assert.equal(path,'/analytics/v2/events');assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');}
 tracker.event('unknown-click','/mestem-hrou/');tracker.event('portfolio-myslopis-click','/account/');tracker.pageview('/mestem-hrou/?token=private');
 assert.equal(calls.length,6);
 for(const patch of [{allowedEvents:['portfolio-arbitrary-click']},{autoClick:true},{autoPageview:true},{captureTitle:true},{captureReferrer:true},{credentials:'include'},{offline:'queue'}])assert.throws(()=>context.window.vcodePublicAnalytics.create({...config,...patch}));
});

test('portfolio-2 discards DNT, GPC and offline calls without replay or automatic collection',async()=>{
 const {context,calls,tracker}=await runtime();
 for(const [key,value]of [['doNotTrack','1'],['globalPrivacyControl',true],['onLine',false]]){
  const prior=context.navigator[key];context.navigator[key]=value;
  tracker.pageview('/mestem-hrou/');for(const name of allPortfolioEvents)tracker.event(name,'/mestem-hrou/');
  context.navigator[key]=prior;
 }
 assert.equal(calls.length,0);
 tracker.event('portfolio-myslopis-click','/mestem-hrou/');assert.equal(calls.length,1);
});

test('all four immutable v2 runtime pins remain exact and portfolio-1 rejects Myslopis configuration',async()=>{
 const pins=[['public-v2.js','sha384-4mn0sN5UeFuzSjaXlbulwbJz7N38PPOovouC9Xp3OHD0r94YKgx8B2RAk/nK6mg0'],['public-v2-tiktok.js','sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5'],['public-v2-portfolio.js','sha384-zkZSzDImQVzQLiRsYnPvb7exdTP5bDp+cGuBD0J+Tb40PGH8ffG+b4qQGqfrP6lf'],['public-v2-portfolio-2.js','sha384-X7PYkHsq/VMthl17JMrooPLPjIuIbvATaO4BTzzYARDac6rPfVlTNG1ScD/iyGD3']];
 for(const [filename,pin]of pins){
  const body=await readFile(new URL('../'+filename,import.meta.url));
  assert.equal('sha384-'+createHash('sha384').update(body).digest('base64'),pin);
  if(filename==='public-v2-portfolio-2.js')continue;
  const context={window:{},URL,document:{referrer:''},navigator:{onLine:true},fetch:()=>Promise.resolve()};
  vm.runInNewContext(body.toString(),context);
  assert.throws(()=>context.window.vcodePublicAnalytics.create(config));
  assert.doesNotThrow(()=>context.window.vcodePublicAnalytics.create({...config,allowedEvents:['outbound-click']}));
 }
});
