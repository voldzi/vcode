import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createPartnershipProxy,partnershipList,partnershipItem,partnershipPartner} from '../lib/partnership-proxy.mjs';
const OWNER='11111111-2222-4333-8444-555555555555',ID='22222222-3333-4444-8555-666666666666',PARTNER='33333333-4444-4555-8666-777777777777';
const timestamp='2026-10-09T12:00:00.000Z';
const item=()=>({id:ID,appId:'kaloricke-tabulky',type:'vyrobce',locale:'cs',name:'Synthetic Sender',email:'synthetic@example.invalid',organization:null,message:'Synthetic partnership offer for isolated testing only.',privacyVersion:'partnership-intake-20261009-1',stage:'new',managerId:null,nextAction:null,nextActionDueAt:null,version:1,createdAt:timestamp,updatedAt:timestamp,expiresAt:'2027-01-07T12:00:00.000Z',audit:[{id:PARTNER,actorId:OWNER,action:'created',changedFields:[],fromStage:'new',toStage:'new',createdAt:timestamp}]});
const partner=()=>({id:PARTNER,appId:'kaloricke-tabulky',type:'vyrobce',displayName:'Synthetic partner',policyVersion:'synthetic-approved-policy',createdBy:OWNER,createdAt:timestamp,expiresAt:'2027-01-07T12:00:00.000Z'});
const list=()=>({items:[item()],summary:{new:1,reviewing:0,waiting:0,pilot:0,active:0,closed:0,total:1},notifications:{pending:0,sent:1,failed:0},applications:[{id:'kaloricke-tabulky',name:'Moje porce',types:['vyrobce','obchod','autor-receptu','jine']}],promotionEnabled:[]});
async function fixture(run){
 const calls=[],verified=[],state={revoked:false,response:undefined,error:undefined,revokeDuringBody:false};
 const handle=createPartnershipProxy({
  origin:'https://example.invalid',sameOrigin:(req,origin)=>req.headers.origin===origin,
  authorize:async session=>{verified.push(session);if(state.revoked)throw Object.assign(Error('synthetic private token'),{status:401});if(session.role!=='owner')throw Object.assign(Error('synthetic-app-key'),{status:403});return{actorId:OWNER,key:'synthetic-private-secret'};},
  request:async(context,path,options)=>{calls.push({context,path,options});if(state.error)throw state.error;if(state.response!==undefined)return state.response;if(options.method==='DELETE')return{ok:true,reference:path.split('/').at(-1)};if(options.method==='PATCH'){const input=JSON.parse(options.body);return{ok:true,item:{...item(),...input,version:input.expectedVersion+1,expectedVersion:undefined}};}return path.includes('/partners?')?{items:[]}:list();},
  send:(res,status,value,type,headers={})=>{res.writeHead(status,{'Content-Type':type??'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(value));},
  body:async req=>{let size=0,body='';for await(const chunk of req){size+=chunk.length;if(size>4096)throw Object.assign(Error('synthetic too large'),{status:413});body+=chunk;}if(state.revokeDuringBody)state.revoked=true;return JSON.parse(body);}
 });
 const server=createServer(async(req,res)=>{const session=req.headers.cookie==='session=owner'?{role:'owner'}:req.headers.cookie==='session=other'?{role:'other'}:null;const handled=await handle(req,res,new URL(req.url,'https://example.invalid'),session);if(!handled){res.writeHead(418);res.end();}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;const headers={Cookie:'session=owner',Origin:'https://example.invalid','Content-Type':'application/json'};
 try{await run({calls,verified,state,base,headers});}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
test('owner proxy returns bounded private metadata only after a fresh owner verification',async()=>fixture(async f=>{
 assert.equal((await fetch(f.base+'/unrelated')).status,418);
 assert.equal((await fetch(f.base+'/prehled/api/partnerships')).status,401);
 assert.equal((await fetch(f.base+'/prehled/api/partnerships',{headers:{Cookie:'session=other','X-VCode-Admin-Id':OWNER,'X-Role':'owner'}})).status,403);
 assert.equal((await fetch(f.base+'/prehled/api/partnerships',{headers:{Authorization:'Bearer synthetic-application-key'}})).status,401);assert.equal(f.calls.length,0);
 const response=await fetch(f.base+'/prehled/api/partnerships?limit=10&stage=new&appId=kaloricke-tabulky',{headers:f.headers});assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const result=await response.json();assert.equal(result.managerId,OWNER);assert.equal(result.items[0].id,ID);assert.deepEqual(result.promotionEnabled,[]);assert.equal(f.calls[0].path,'/internal/partnerships/v1/inquiries?limit=10&stage=new&appId=kaloricke-tabulky');
 const before=f.verified.length;f.state.revoked=true;assert.equal((await fetch(f.base+'/prehled/api/partners',{headers:f.headers})).status,401);assert.equal(f.verified.length,before+1);assert.equal(f.calls.length,1);
}));
test('write proxy refuses cross-origin, browser actor selection, ambiguous queries and malformed requests before upstream',async()=>fixture(async f=>{
 const query=['?limit=101','?limit=1&limit=2','?role=admin','?stage=unknown','?appId=https%3A%2F%2Fevil.invalid'];for(const q of query)assert.equal((await fetch(f.base+'/prehled/api/partnerships'+q,{headers:f.headers})).status,400);
 const patch=async(body,headers=f.headers,path='/prehled/api/partnerships/'+ID)=>fetch(f.base+path,{method:'PATCH',headers,body:JSON.stringify(body)});
 assert.equal((await patch({expectedVersion:1,stage:'reviewing'},{...f.headers,Origin:'https://evil.invalid'})).status,403);
 for(const body of [{expectedVersion:1,stage:'reviewing',actorId:OWNER},{expectedVersion:0,stage:'reviewing'},{expectedVersion:1,managerId:PARTNER},{expectedVersion:1},{expectedVersion:1,nextActionDueAt:'tomorrow'},{expectedVersion:1,nextAction:'x'.repeat(501)},{expectedVersion:1,nextAction:'x\u0000'},{expectedVersion:1,nextAction:'first\nsecond'},{expectedVersion:1,nextActionDueAt:'2026-02-31T12:00:00Z'},{expectedVersion:1,nextActionDueAt:'2026-10-10T12:00:00.1Z'},{expectedVersion:2147483647,stage:'new'}])assert.equal((await patch(body)).status,400);
 assert.equal((await patch({expectedVersion:1,stage:'reviewing'},{...f.headers,'Content-Type':'text/plain'})).status,415);
 assert.equal((await patch({expectedVersion:1,stage:'reviewing'},{...f.headers,'Content-Encoding':'gzip'})).status,415);
 assert.equal((await patch({expectedVersion:1,nextAction:'x'.repeat(5000)})).status,413);
 assert.equal((await fetch(f.base+'/prehled/api/partnerships/'+ID,{headers:f.headers})).status,405);
 assert.equal((await fetch(f.base+'/prehled/api/partnerships/invalid',{headers:f.headers})).status,404);
 assert.equal((await fetch(f.base+'/prehled/api/partners/'+PARTNER,{method:'DELETE',headers:f.headers,body:'{"actorId":"spoof"}'})).status,400);
 assert.equal(f.calls.length,0);
}));
test('workflow, promotion and deletion preserve optimistic version and fixed internal routes',async()=>fixture(async f=>{
 f.state.response={ok:true,item:{...item(),stage:'reviewing',managerId:OWNER,version:2}};
 const updated=await fetch(f.base+'/prehled/api/partnerships/'+ID,{method:'PATCH',headers:f.headers,body:JSON.stringify({expectedVersion:1,stage:'reviewing',managerId:OWNER,nextAction:'Synthetic next step',nextActionDueAt:'2026-10-10T12:00:00Z'})});assert.equal(updated.status,200);assert.equal((await updated.json()).item.version,2);assert.equal(f.calls[0].context.actorId,OWNER);assert.equal(JSON.parse(f.calls[0].options.body).expectedVersion,1);
 f.state.response={ok:true,partner:partner()};const promoted=await fetch(f.base+'/prehled/api/partnerships/'+ID+'/promote',{method:'POST',headers:f.headers,body:JSON.stringify({expectedVersion:2,displayName:'Synthetic partner',policyVersion:'synthetic-approved-policy'})});assert.equal(promoted.status,200);assert.equal(f.calls[1].path,'/internal/partnerships/v1/inquiries/'+ID+'/promote');assert.equal(Object.hasOwn((await promoted.json()).partner,'email'),false);
 f.state.response=undefined;assert.equal((await fetch(f.base+'/prehled/api/partners/'+PARTNER,{method:'DELETE',headers:f.headers})).status,200);assert.equal(f.calls[2].path,'/internal/partnerships/v1/partners/'+PARTNER);
}));
test('all upstream failure text is replaced and unknown responses fail closed',async()=>fixture(async f=>{
 for(const status of [400,401,403,404,409,410,413,415,429,503,500]){f.state.error=Object.assign(Error('synthetic secret synthetic@example.invalid DATABASE INTERNAL'),{status});const response=await fetch(f.base+'/prehled/api/partnerships',{headers:f.headers});assert.equal(response.status,status===500?503:status);const value=await response.json();assert.equal(value.ok,false);assert.equal(value.requestId,null);assert.ok(!JSON.stringify(value).includes('synthetic'));if([429,503,500].includes(status))assert.equal(response.headers.get('retry-after'),'60');if(status===409)assert.equal(value.code,'idempotency-conflict');}
 f.state.error=undefined;for(const bad of [{...list(),internalSecret:'synthetic-secret'},{...list(),items:[{...item(),hash:'synthetic-secret'}]},{...list(),items:Array.from({length:101},item)},{...list(),applications:[{id:'kaloricke-tabulky',name:'Moje porce',types:['other']}]},{...list(),items:[{...item(),managerId:PARTNER}]}]){f.state.response=bad;assert.equal((await fetch(f.base+'/prehled/api/partnerships',{headers:f.headers})).status,503);}
}));
test('permissions revoked while reading a private mutation body prevent any internal write',async()=>fixture(async f=>{
 f.state.revokeDuringBody=true;
 const response=await fetch(f.base+'/prehled/api/partnerships/'+ID,{method:'PATCH',headers:f.headers,body:'{"expectedVersion":1,"stage":"reviewing"}'});assert.equal(response.status,401);assert.equal(f.verified.length,2);assert.equal(f.calls.length,0);assert.equal((await response.json()).code,'unauthorized');
}));
test('private serializers reject contact copies, internal source links, historical content and unbounded histories',()=>{
 assert.throws(()=>partnershipPartner({...partner(),sourceInquiryId:ID}));assert.throws(()=>partnershipPartner({...partner(),email:'synthetic@example.invalid'}));assert.throws(()=>partnershipPartner({...partner(),expiresAt:'2030-01-01T12:00:00Z'}));
 assert.throws(()=>partnershipItem({...item(),audit:[{...item().audit[0],message:'synthetic'}]}));assert.throws(()=>partnershipItem({...item(),audit:Array.from({length:201},()=>item().audit[0])}));assert.throws(()=>partnershipItem({...item(),nextActionDueAt:item().expiresAt}));
 assert.equal(partnershipItem({...item(),audit:Array.from({length:200},()=>item().audit[0])}).audit.length,200);assert.throws(()=>partnershipList({...list(),promotionEnabled:[{appId:'unknown',policyVersion:'synthetic'}]},OWNER));
 assert.throws(()=>partnershipItem({...item(),expiresAt:'2027-01-07T12:00:01.000Z'}));assert.throws(()=>partnershipItem({...item(),updatedAt:item().expiresAt}));assert.throws(()=>partnershipPartner({...partner(),expiresAt:'2026-10-09T13:00:00Z'}));
 for(const field of ['name','organization','nextAction'])assert.throws(()=>partnershipItem({...item(),[field]:'Synthetic\nsecond line'}));assert.throws(()=>partnershipPartner({...partner(),displayName:'Synthetic\tpartner'}));assert.throws(()=>partnershipItem({...item(),audit:[{...item().audit[0],actorId:null}]}));
 for(const appId of ['ends-with-','double--hyphen','a'.repeat(101)])assert.throws(()=>partnershipItem({...item(),appId}));assert.equal(partnershipItem({...item(),appId:'a'.repeat(100),type:'b'.repeat(50)}).appId.length,100);assert.throws(()=>partnershipPartner({...partner(),policyVersion:'a'.repeat(81)}));
});
