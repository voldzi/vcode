import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {acceptPublicEvent} from '../collector-security.mjs';
const site={id:'test',domain:'example.com',collectionEnabled:true,approvedAt:'2026-10-04',collectorKey:'test-private-key',allowedPaths:['/','/trails/:trail/']};
const headers={origin:'https://example.com','sec-fetch-site':'same-origin','x-vcode-collector-key':site.collectorKey,'x-vcode-client-ip':'192.0.2.1'};
test('public collector enforces approved exact paths and authenticated edge, strips client properties',()=>{
 const input={website:'test',name:'pageview',path:'/trails/:trail/'};
 const accepted=acceptPublicEvent(input,headers,[site]);assert.deepEqual(accepted.payload,{website:'test',hostname:'example.com',url:'https://example.com/trails/:trail/',referrer:''});
 for(const patch of [{path:'/account/'},{path:'/?token=private'},{name:'contact-click'},{title:'private'},{ip:'192.0.2.2'},{website:'other'}])assert.throws(()=>acceptPublicEvent({...input,...patch},headers,[site]));
 for(const patch of [{origin:'https://evil.com'},{'x-vcode-collector-key':'wrong'},{'x-vcode-client-ip':'bad'},{'sec-fetch-site':'cross-site'}])assert.throws(()=>acceptPublicEvent(input,{...headers,...patch},[site]));
 for(const patch of [{approvedAt:null},{collectionEnabled:false},{collectionEnabled:'false'}])assert.throws(()=>acceptPublicEvent(input,headers,[{...site,...patch}]));
});
test('shared runtime sends only explicit sanitized pageviews; no collection offline or with DNT/GPC',async()=>{
 const calls=[],context={window:{},navigator:{onLine:true},fetch:(...args)=>{calls.push(args);return Promise.resolve();}};vm.runInNewContext(await readFile(new URL('../public-v1.js',import.meta.url),'utf8'),context);
 const tracker=context.window.vcodePublicAnalytics.create({websiteId:'test',collectorPath:'/analytics/v1/events',allowedPaths:['/'],allowedEvents:[],autoPageview:false,autoClick:false,captureTitle:false,captureReferrer:false,credentials:'omit',offline:'discard'});
 assert.equal(calls.length,0);tracker.pageview('/private/');assert.equal(calls.length,0);tracker.pageview('/');assert.equal(calls.length,1);assert.deepEqual(JSON.parse(calls[0][1].body),{website:'test',name:'pageview',path:'/'});assert.equal(calls[0][1].credentials,'omit');assert.equal(calls[0][1].referrerPolicy,'no-referrer');
 context.navigator.doNotTrack='1';tracker.pageview('/');context.navigator.doNotTrack='0';context.navigator.globalPrivacyControl=true;tracker.pageview('/');context.navigator.globalPrivacyControl=false;context.navigator.onLine=false;tracker.pageview('/');assert.equal(calls.length,1);
});
