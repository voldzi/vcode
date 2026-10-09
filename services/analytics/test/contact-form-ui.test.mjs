import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../../../public/contact.js',import.meta.url),'utf8');
const ID='11111111-2222-4333-8444-555555555555';
const tick=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
function fixture(mode='network',version='contact-20261009',{search='',locale='en',area='partnership',application=''}={}){
 let now=Date.parse('2026-10-09T12:00:00Z'),gets=0,posts=0;const requests=[],events=[],listeners={};
 const field=value=>({value,readOnly:false,disabled:false,focused:false,focus(){this.focused=true;}});
 const fields={name:field('Synthetic Person'),email:field('synthetic@example.invalid'),organization:field('Synthetic fixture'),area:field(area),application:field(application),message:field('This is an entirely synthetic enquiry for an isolated test.'),website:field('')};
 fields.area.options=['','development','partnership','private-deployment','other'].map(value=>({value,disabled:false}));
 fields.application.options=['','mestem-hrou','nest'].map(value=>({value,disabled:false}));
 const button={disabled:true},status={hidden:true,textContent:'',dataset:{},setAttribute(){},focus(){this.focused=true;}};
 const form={hidden:true,dataset:{locale,privacyVersion:'contact-20261009'},elements:fields,querySelector:()=>button,addEventListener:(name,handler)=>listeners[name]=handler,reportValidity:()=>true,setAttribute(){},removeAttribute(){},reset(){for(const item of Object.values(fields))item.value='';}};
 const forbidden=new Proxy({}, {get(){assert.fail('Contact data must never enter browser storage');}});
 const response=(status,body)=>({status,ok:status>=200&&status<300,json:async()=>body});
 const context={Intl,TextEncoder,AbortSignal,URLSearchParams,location:{search},Date:{now:()=>now,parse:Date.parse},crypto:{randomUUID:()=>ID},localStorage:forbidden,sessionStorage:forbidden,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},document:{getElementById:id=>id==='contact-form'?form:status,dispatchEvent:event=>events.push(event)},setTimeout:fn=>{now+=1500;fn();},fetch:async(url,options)=>{
  assert.ok(!url.includes('synthetic')&&!url.includes('@'));assert.equal(options.cache,'no-store');
  if(url.endsWith('/challenge')){gets++;if(mode==='renewal'&&gets===2)throw Error('isolated network failure');return response(200,{enabled:true,token:'synthetic-token-'+gets,minimumDelayMs:1500,expiresAt:new Date(now+600000).toISOString(),privacyVersion:version});}
  assert.equal(url,'/api/contact');assert.equal(options.method,'POST');requests.push(JSON.parse(options.body));posts++;
  if(posts===1){if(mode==='network')throw Error('isolated network failure');if(mode==='renewal')return response(403,{ok:false,error:'challenge-expired'});}
  return response(202,{ok:true,reference:ID});
 }};
 vm.runInNewContext(source,context);return{form,button,status,fields,requests,events,submit:()=>listeners.submit({preventDefault(){}})};
}
for(const mode of ['network','renewal'])test(`public form preserves exact request after ${mode} failure, retries without PII storage and resets only after 202`,async()=>{
 const f=fixture(mode);await tick();assert.equal(f.form.hidden,false);await f.submit();assert.equal(f.requests.length,1);assert.equal(f.requests[0].application,null);assert.equal(f.button.disabled,false);assert.equal(f.fields.message.readOnly,true);assert.notEqual(f.fields.message.value,'');assert.equal(f.events.length,0);
 await f.submit();assert.equal(f.requests.length,2);const {token:firstToken,...first}=f.requests[0],{token:secondToken,...second}=f.requests[1];assert.deepEqual(second,first);assert.equal(second.requestId,ID);assert.equal(f.fields.message.value,'');assert.equal(f.fields.message.readOnly,false);assert.equal(f.events.length,1);assert.equal(f.events[0].type,'vcode:contact-sent');assert.equal(f.events[0].detail,undefined);
});
test('public form does not activate against an unreviewed privacy version or submit too-short input',async()=>{
 const mismatch=fixture('network','unreviewed-version');await tick();assert.equal(mismatch.form.hidden,true);assert.equal(mismatch.requests.length,0);
 const valid=fixture();await tick();valid.fields.message.value='Too short';await valid.submit();assert.equal(valid.requests.length,0);assert.equal(valid.fields.message.focused,true);assert.notEqual(valid.status.textContent,'');
});
test('both locales suggest only visible app/area choices; manual changes are submitted and successful reset clears them',async()=>{
 for(const locale of ['cs','en']){
  const f=fixture('success','contact-20261009',{locale,area:'',search:'?app=mestem-hrou&area=partnership'});
  await tick();assert.equal(f.form.hidden,false);assert.equal(f.fields.application.value,'mestem-hrou');assert.equal(f.fields.area.value,'partnership');assert.equal(f.requests.length,0);assert.equal(f.events.length,0);
  assert.equal(f.fields.name.value,'Synthetic Person');assert.equal(f.fields.email.value,'synthetic@example.invalid');assert.equal(f.fields.website.value,'');
  f.fields.application.value='nest';f.fields.area.value='development';await f.submit();
  assert.equal(f.requests.length,1);assert.equal(f.requests[0].application,'nest');assert.equal(f.requests[0].area,'development');assert.equal(f.requests[0].locale,locale);
  assert.equal(f.fields.application.value,'');assert.equal(f.fields.area.value,'');assert.equal(f.events[0].detail,undefined);
 }
});
test('unknown, duplicate, empty and oversized URL suggestions are rejected together without copying contact data',async()=>{
 const searches=['?app=mestem-hrou&area=invalid','?app=private-app&area=partnership','?app=mestem-hrou&app=nest&area=partnership','?app=mestem-hrou&area=partnership&area=other','?app=mestem-hrou&area=','?App=mestem-hrou&area=partnership','?app=mestem-hrou&area=partnership&email=url-person%40example.invalid','?application=mestem-hrou&area=partnership','?app=mestem-hrou&area=partnership&message='+ 'x'.repeat(512)];
 for(const search of searches){
  const f=fixture('success','contact-20261009',{area:'',search});await tick();
  assert.equal(f.fields.application.value,'',search);assert.equal(f.fields.area.value,'',search);assert.equal(f.requests.length,0);assert.equal(f.fields.email.value,'synthetic@example.invalid');assert.equal(f.fields.message.value,'This is an entirely synthetic enquiry for an isolated test.');
 }
});
test('existing choices survive suggestions; uncertain retries preserve the chosen app without reapplying the URL',async()=>{
 const existing=fixture('success','contact-20261009',{application:'nest',area:'other',search:'?app=mestem-hrou&area=partnership'});
 assert.equal(existing.fields.application.value,'nest');assert.equal(existing.fields.area.value,'other');
 const f=fixture('network','contact-20261009',{area:'',search:'?app=mestem-hrou&area=partnership'});await tick();await f.submit();await f.submit();
 assert.equal(f.requests.length,2);assert.equal(f.requests[0].application,'mestem-hrou');assert.equal(f.requests[1].application,'mestem-hrou');assert.equal(f.requests[1].requestId,f.requests[0].requestId);assert.equal(f.fields.application.value,'');assert.equal(f.fields.area.value,'');
});
