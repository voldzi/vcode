import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../../../public/contact.js',import.meta.url),'utf8');
const ID='11111111-2222-4333-8444-555555555555';
const tick=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
function fixture(mode='network',version='contact-20261009'){
 let now=Date.parse('2026-10-09T12:00:00Z'),gets=0,posts=0;const requests=[],events=[],listeners={};
 const field=value=>({value,readOnly:false,disabled:false,focused:false,focus(){this.focused=true;}});
 const fields={name:field('Synthetic Person'),email:field('synthetic@example.invalid'),organization:field('Synthetic fixture'),area:field('partnership'),application:field(''),message:field('This is an entirely synthetic enquiry for an isolated test.'),website:field('')};
 const button={disabled:true},status={hidden:true,textContent:'',dataset:{},setAttribute(){},focus(){this.focused=true;}};
 const form={hidden:true,dataset:{locale:'en',privacyVersion:'contact-20261009'},elements:fields,querySelector:()=>button,addEventListener:(name,handler)=>listeners[name]=handler,reportValidity:()=>true,setAttribute(){},removeAttribute(){},reset(){for(const item of Object.values(fields))item.value='';}};
 const forbidden=new Proxy({}, {get(){assert.fail('Contact data must never enter browser storage');}});
 const response=(status,body)=>({status,ok:status>=200&&status<300,json:async()=>body});
 const context={Intl,TextEncoder,AbortSignal,Date:{now:()=>now,parse:Date.parse},crypto:{randomUUID:()=>ID},localStorage:forbidden,sessionStorage:forbidden,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},document:{getElementById:id=>id==='contact-form'?form:status,dispatchEvent:event=>events.push(event)},setTimeout:fn=>{now+=1500;fn();},fetch:async(url,options)=>{
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
