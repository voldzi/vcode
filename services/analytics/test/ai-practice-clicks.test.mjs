import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {sanitizeEvent} from '../security.mjs';
import {AI_PRACTICE_CLICK_PATHS,AI_PRACTICE_NOTICE_VERSION,aiPracticeClicksEnabled,legacyEventCapabilities} from '../tomato-click-policy.mjs';
const id='e155b7ef-28c5-4787-96cb-53777ecf693c'; // Public website registration, no visitor data.
const notice={enabled:true,paths:[...AI_PRACTICE_CLICK_PATHS],noticeVersion:AI_PRACTICE_NOTICE_VERSION,approvedAt:'2026-10-15T17:00:00Z',publishedAt:'2026-10-15T17:30:00Z',collectionStartedAt:'2026-10-15T17:31:00Z',noticeCsSHA256:'a'.repeat(64),noticeEnSHA256:'b'.repeat(64)};
const site={id,domain:'vcode.zeleznalady.cz',aiPracticeClicks:notice};
const input=path=>({website:id,name:'practice-open-click',url:'https://vcode.zeleznalady.cz'+path});
const source=readFileSync(new URL('../../../public/ai-practice-clicks.v1.js',import.meta.url),'utf8');
function runtime(path=AI_PRACTICE_CLICK_PATHS[0],navigator={},mode='ok'){
 const calls=[],listeners={};const location={origin:'https://vcode.zeleznalady.cz',pathname:path};
 for(const key of ['search','hash','href'])Object.defineProperty(location,key,{get(){throw Error('Original incoming URL must not be read');}});
 const document={addEventListener:(type,fn,options)=>{assert.equal(options.passive,true);(listeners[type]??=[]).push(fn);}};
 for(const key of ['referrer','cookie'])Object.defineProperty(document,key,{get(){throw Error('Private browser data must not be read');}});
 const context={window:{},location,navigator,document,fetch:(url,options)=>{calls.push({url,options,payload:JSON.parse(options.body)});if(mode==='throw')throw Error('blocked');return mode==='reject'?Promise.reject(Error('blocked')):Promise.resolve();}};
 const execute=()=>vm.runInNewContext(source,context);execute();
 const click=(patch={},href='https://games.zeleznalady.cz/prezentaceAI/',marked=true)=>{
  const event={button:0,defaultPrevented:false,target:{closest:selector=>{assert.equal(selector,'a[data-ai-practice="true"]');return marked?{href}:null;}},preventDefault:()=>assert.fail('navigation must not be intercepted'),...patch};
  for(const fn of listeners.click??[])fn(event);
 };
 return{calls,listeners,navigator,click,execute};
}
test('AI practice collector accepts only the two canonical public pages with the exact three-field payload',()=>{
 for(const path of AI_PRACTICE_CLICK_PATHS){const {payload}=sanitizeEvent(input(path),[site]);assert.deepEqual(payload,{website:id,hostname:site.domain,url:input(path).url,referrer:'',name:'practice-open-click'});}
 for(const path of ['/','/en/','/hry/','/en/games/','/aplikace/nest/','/en/apps/nest/','/prehled/','/aplikace/rajcatova-sklizen/private','/aplikace/rajcatova-sklizen','/aplikace/%72ajcatova-sklizen/'])assert.throws(()=>sanitizeEvent(input(path),[site]));
 for(const suffix of ['?email=private','#private','?','#','?utm_source=game'])assert.throws(()=>sanitizeEvent({...input(AI_PRACTICE_CLICK_PATHS[0]),url:input(AI_PRACTICE_CLICK_PATHS[0]).url+suffix},[site]));
 for(const extra of ['referrer','target','source','properties','title','lang','gameState'])assert.throws(()=>sanitizeEvent({...input(AI_PRACTICE_CLICK_PATHS[0]),[extra]:'excluded'},[site]));
 for(const url of ['https://vcode.zeleznalady.cz:444'+AI_PRACTICE_CLICK_PATHS[0],'http://vcode.zeleznalady.cz'+AI_PRACTICE_CLICK_PATHS[0],'https://user:secret@vcode.zeleznalady.cz'+AI_PRACTICE_CLICK_PATHS[0],AI_PRACTICE_CLICK_PATHS[0]])assert.throws(()=>sanitizeEvent({...input(AI_PRACTICE_CLICK_PATHS[0]),url},[site]));
});
test('concrete published notice and explicit path approval are mandatory and fail closed',()=>{
 assert.equal(aiPracticeClicksEnabled(site),true);assert.deepEqual(legacyEventCapabilities(site),['app-store-click','contact-click','collaboration-click','practice-open-click']);
 for(const patch of [{enabled:false},{enabled:'true'},{noticeVersion:'unreviewed'},{approvedAt:null},{approvedAt:1},{publishedAt:undefined},{collectionStartedAt:null},{noticeCsSHA256:''},{noticeEnSHA256:['b'.repeat(64)]},{paths:[...AI_PRACTICE_CLICK_PATHS,'/']},{paths:[AI_PRACTICE_CLICK_PATHS[0]]}]){
  const bad={...site,aiPracticeClicks:{...notice,...patch}};assert.equal(aiPracticeClicksEnabled(bad),false);assert.throws(()=>sanitizeEvent(input(AI_PRACTICE_CLICK_PATHS[0]),[bad]));assert.ok(!legacyEventCapabilities(bad).includes('outbound-click'));
 }
 for(const patch of [{collectionEnabled:false},{domain:'other.example'},{id:'other-public-website'},{aiPracticeClicks:undefined}])assert.equal(aiPracticeClicksEnabled({...site,...patch}),false);
});
test('single click binding covers keyboard/touch-generated click without duplicate listeners or pageviews',()=>{
 for(const path of AI_PRACTICE_CLICK_PATHS){const r=runtime(path);r.execute();assert.deepEqual(Object.keys(r.listeners),['click']);assert.equal(r.listeners.click.length,1);assert.equal(r.calls.length,0);r.click();assert.equal(r.calls.length,1);const call=r.calls[0];assert.deepEqual(call.payload,input(path));assert.equal(call.url,'/analytics/event');assert.equal(call.options.credentials,'omit');assert.equal(call.options.referrerPolicy,'no-referrer');assert.equal(call.options.cache,'no-store');}
});
test('unmarked, intercepted, middle-button, other-game and mismatched-language links are not counted',()=>{
 const r=runtime();r.click({},undefined,false);r.click({defaultPrevented:true});r.click({button:1});r.click({},'https://games.zeleznalady.cz/AI practice/?lang=en');r.click({},'https://games.zeleznalady.cz/AI practice/?lang=cs&extra=private');r.click({},'https://other.example/');assert.equal(r.calls.length,0);
 for(const path of ['/','/aplikace/nest/','/prehled/','/en/apps/rajcatova-sklizen/private']){const v=runtime(path);v.click();assert.equal(v.calls.length,0);}
});
test('DNT/GPC/offline suppress initial and later sends without queueing or affecting navigation',()=>{
 for(const [key,value] of [['doNotTrack','1'],['doNotTrack','yes'],['globalPrivacyControl',true],['onLine',false]]){
  const initial=runtime(undefined,{[key]:value});initial.click();assert.equal(initial.calls.length,0);
  const later=runtime();later.navigator[key]=value;later.click();assert.equal(later.calls.length,0);
 }
});
test('blocked or rejected collector does not throw, retry, prevent navigation or expose link data',async()=>{
 for(const mode of ['throw','reject']){const r=runtime(undefined,{},mode);assert.doesNotThrow(()=>r.click());await new Promise(resolve=>setImmediate(resolve));assert.equal(r.calls.length,1);assert.deepEqual(Object.keys(r.calls[0].payload).sort(),['name','url','website']);}
});
test('dashboard exposes a distinct practice-opening label without relabelling Tomato events',()=>{
 const script=readFileSync(new URL('../dashboard.js',import.meta.url),'utf8');
 assert.ok(script.includes("aiPractice:'Otevření cvičebny AI v práci'"));
 assert.ok(script.includes("'practice-open-click':'aiPractice'"));
 const helper=script.slice(script.indexOf('function presentationEvents('),script.indexOf('function list('));const c={};vm.runInNewContext(helper,c);
 const events=[{x:'practice-open-click',y:3},{x:'outbound-click',y:2}];
 assert.deepEqual(JSON.parse(JSON.stringify(c.presentationEvents({events,capabilities:{scopes:{'outbound-click':'tomato-play'}}}))),[{x:'practice-open-click',y:3},{x:'tomato-play-click',y:2}]);
});
