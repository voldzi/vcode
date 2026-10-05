import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {acceptExpandedPublicEvent} from '../collector-security.mjs';
const site={id:'test',domain:'example.com',collectionEnabled:true,approvedAt:'reviewed',metricsApprovedAt:'reviewed-metrics',integrationVersion:'vcode-public-v2',captureSources:true,allowedEvents:['contact-click'],collectorKey:'test-private-key',allowedPaths:['/']};
const headers={origin:'https://example.com','x-vcode-collector-key':'test-private-key','x-vcode-client-ip':'192.0.2.1'};
test('expanded collection requires separate reviewed scope and never accepts raw referral or target data',()=>{
 const view={website:'test',name:'pageview',path:'/',source:'google'};
 assert.equal(acceptExpandedPublicEvent(view,headers,[site]).payload.referrer,'https://google.com/');
 assert.equal(acceptExpandedPublicEvent({website:'test',name:'contact-click',path:'/'},headers,[site]).payload.name,'contact-click');
 for(const patch of [{source:'https://google.com/?private=data'},{target:'mailto:private@example.com'},{source:'__proto__'},{name:'outbound-click'},{path:'/private/'},{title:'private'}])assert.throws(()=>acceptExpandedPublicEvent({...view,...patch},headers,[site]));
 for(const patch of [{metricsApprovedAt:null},{integrationVersion:'vcode-public-v1'},{captureSources:false},{collectionEnabled:false}])assert.throws(()=>acceptExpandedPublicEvent(view,headers,[{...site,...patch}]));
});
test('v2 runtime maps only selected public sources, requires explicit clicks and respects privacy switches',async()=>{
 const script=await readFile(new URL('../public-v2.js',import.meta.url),'utf8'),calls=[];
 const context={window:{},URL,document:{referrer:'https://www.google.com/search?q=private#fragment'},navigator:{onLine:true},fetch:(...args)=>{calls.push(args);return Promise.resolve();}};
 vm.runInNewContext(script,context);
 const config={websiteId:'test',collectorPath:'/analytics/v2/events',allowedPaths:['/'],allowedEvents:['contact-click'],captureSources:true,autoPageview:false,autoClick:false,captureTitle:false,captureReferrer:false,credentials:'omit',offline:'discard'};
 const tracker=context.window.vcodePublicAnalytics.create(config);
 assert.equal(calls.length,0);tracker.pageview('/');tracker.event('contact-click','/');tracker.event('outbound-click','/');tracker.pageview('/private/');
 assert.equal(calls.length,2);assert.deepEqual(JSON.parse(calls[0][1].body),{website:'test',name:'pageview',path:'/',source:'google'});assert.deepEqual(JSON.parse(calls[1][1].body),{website:'test',name:'contact-click',path:'/'});assert.equal(calls[0][1].credentials,'omit');assert.equal(calls[0][1].referrerPolicy,'no-referrer');
 for(const key of ['doNotTrack','globalPrivacyControl','onLine']){const value=context.navigator[key];context.navigator[key]=key==='doNotTrack'?'1':key==='onLine'?false:true;tracker.event('contact-click','/');context.navigator[key]=value;}assert.equal(calls.length,2);
 context.document.referrer='https://internal.private/account?secret=true';context.window.vcodePublicAnalytics.create(config).pageview('/');assert.ok(!Object.hasOwn(JSON.parse(calls.at(-1)[1].body),'source'));
});

test('TikTok runtime classifies only the public TikTok domain and strips video/profile/query data',async()=>{
 const script=await readFile(new URL('../public-v2-tiktok.js',import.meta.url),'utf8');
 const config={websiteId:'test',collectorPath:'/analytics/v2/events',allowedPaths:['/'],allowedEvents:['contact-click'],captureSources:true,autoPageview:false,autoClick:false,captureTitle:false,captureReferrer:false,credentials:'omit',offline:'discard'};
 for(const [referrer,expected] of [['https://www.tiktok.com/@private/video/123?secret=x#private','tiktok'],['https://vm.tiktok.com/private','tiktok'],['https://tiktok.com/','tiktok'],['https://tiktok.com.attacker.example/private',undefined],['https://not-tiktok.com/private',undefined]]){
  const calls=[],context={window:{},URL,document:{referrer},navigator:{onLine:true},fetch:(...args)=>{calls.push(args);return Promise.resolve();}};
  vm.runInNewContext(script,context);const tracker=context.window.vcodePublicAnalytics.create(config);tracker.pageview('/');
  const payload=JSON.parse(calls[0][1].body);assert.deepEqual(payload,{website:'test',name:'pageview',path:'/',...(expected?{source:expected}:{})});
  if(expected)assert.equal(acceptExpandedPublicEvent(payload,headers,[site]).payload.referrer,'https://tiktok.com/');
  context.navigator.doNotTrack='1';tracker.pageview('/');context.navigator.doNotTrack=undefined;context.navigator.globalPrivacyControl=true;tracker.pageview('/');context.navigator.globalPrivacyControl=false;context.navigator.onLine=false;tracker.pageview('/');assert.equal(calls.length,1);
 }
 assert.throws(()=>acceptExpandedPublicEvent({website:'test',name:'pageview',path:'/',source:'https://tiktok.com/@private'},headers,[site]));
});

test('dashboard names TikTok public referrers without mislabelling unrelated domains',async()=>{
 const script=await readFile(new URL('../dashboard.js',import.meta.url),'utf8');
 const helper=script.slice(script.indexOf('function trafficSourceLabel('),script.indexOf('function list('));
 const context={URL};vm.runInNewContext(helper,context);
 for(const value of ['tiktok.com','www.tiktok.com','VM.TIKTOK.COM','https://tiktok.com/','https://www.tiktok.com/','https://vm.tiktok.com/'])assert.equal(context.trafficSourceLabel(value),'TikTok');
 for(const value of ['tiktok.com.example','https://tiktok.com.example/','https://google.com/','/tiktok.com/',''])assert.equal(context.trafficSourceLabel(value),value);
});
