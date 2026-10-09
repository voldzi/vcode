// Private dashboard boundary. The caller re-verifies the configured owner and
// VCode permission for every request; no browser actor/role is ever accepted.
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug=(value,max)=>typeof value==='string'&&value.length<=max&&SLUG.test(value);
const STAGES=new Set(['new','reviewing','waiting','pilot','active','closed']);
const COUNTS=['new','reviewing','waiting','pilot','active','closed','total'];
const WORKFLOW=['stage','managerId','nextAction','nextActionDueAt'];
const ACTIONS=new Set(['created','workflow-updated','promoted']);
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const exact=(value,keys)=>plain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
const text=(value,max,min=0)=>typeof value==='string'&&value.isWellFormed()&&Array.from(value).length>=min&&Array.from(value).length<=max&&!/[\u0000-\u0008\u000b-\u001f\u007f]/u.test(value);
const instant=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)||!Number.isFinite(Date.parse(value)))return false;const iso=new Date(value).toISOString();return iso===value||iso.replace('.000Z','Z')===value;};
const singleLine=(value,max,min=0)=>text(value,max,min)&&!/[\r\n\t]/u.test(value);
const nullable=(value,test)=>value===null||test(value);
const nonnegative=value=>Number.isSafeInteger(value)&&value>=0;
const positive=value=>Number.isSafeInteger(value)&&value>0;
const invalid=()=>Object.assign(new Error('invalid partnership response'),{status:503});
function auditEntry(value){
 const keys=['id','actorId','action','changedFields','fromStage','toStage','createdAt'];
 if(!exact(value,keys)||!UUID.test(value.id??'')||!UUID.test(value.actorId??'')||!ACTIONS.has(value.action)||!Array.isArray(value.changedFields)||value.changedFields.length>WORKFLOW.length||new Set(value.changedFields).size!==value.changedFields.length||!value.changedFields.every(field=>WORKFLOW.includes(field))||!STAGES.has(value.fromStage)||!STAGES.has(value.toStage)||!instant(value.createdAt))throw invalid();
 return Object.fromEntries(keys.map(key=>[key,key==='changedFields'?[...value[key]]:value[key]]));
}
export function partnershipItem(value){
 const keys=['id','appId','type','locale','name','email','organization','message','privacyVersion','stage','managerId','nextAction','nextActionDueAt','version','createdAt','updatedAt','expiresAt','audit'];
 if(!exact(value,keys)||!UUID.test(value.id??'')||!slug(value.appId,100)||!slug(value.type,50)||!['cs','en'].includes(value.locale)||!singleLine(value.name,100,2)||!text(value.email,254,3)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)||!nullable(value.organization,s=>singleLine(s,160))||!text(value.message,4000,30)||!text(value.privacyVersion,100,1)||!STAGES.has(value.stage)||!nullable(value.managerId,id=>UUID.test(id??''))||!nullable(value.nextAction,s=>singleLine(s,500))||!nullable(value.nextActionDueAt,instant)||!positive(value.version)||!['createdAt','updatedAt','expiresAt'].every(key=>instant(value[key]))||Date.parse(value.expiresAt)-Date.parse(value.createdAt)!==90*86400000||Date.parse(value.updatedAt)<Date.parse(value.createdAt)||Date.parse(value.updatedAt)>=Date.parse(value.expiresAt)||value.nextActionDueAt!==null&&Date.parse(value.nextActionDueAt)>=Date.parse(value.expiresAt)||!Array.isArray(value.audit)||value.audit.length>200)throw invalid();
 return Object.fromEntries(keys.map(key=>[key,key==='audit'?value.audit.map(auditEntry):value[key]]));
}
export function partnershipPartner(value){
 const keys=['id','appId','type','displayName','policyVersion','createdBy','createdAt','expiresAt'];
 if(!exact(value,keys)||!UUID.test(value.id??'')||!slug(value.appId,100)||!slug(value.type,50)||!singleLine(value.displayName,160,2)||!slug(value.policyVersion,80)||!UUID.test(value.createdBy??'')||!instant(value.createdAt)||!instant(value.expiresAt)||Date.parse(value.expiresAt)-Date.parse(value.createdAt)<86400000||Date.parse(value.expiresAt)-Date.parse(value.createdAt)>365*86400000)throw invalid();
 return Object.fromEntries(keys.map(key=>[key,value[key]]));
}
export function partnershipList(value,actorId){
 const keys=['items','summary','notifications','applications','promotionEnabled'];
 if(!exact(value,keys)||!Array.isArray(value.items)||value.items.length>100||!exact(value.summary,COUNTS)||!COUNTS.every(key=>nonnegative(value.summary[key]))||COUNTS.slice(0,-1).reduce((sum,key)=>sum+value.summary[key],0)!==value.summary.total||!exact(value.notifications,['pending','sent','failed'])||!Object.values(value.notifications).every(nonnegative)||!Array.isArray(value.applications)||value.applications.length>100||!Array.isArray(value.promotionEnabled)||value.promotionEnabled.length>100||!UUID.test(actorId??''))throw invalid();
 const applications=value.applications.map(app=>{if(!exact(app,['id','name','types'])||!slug(app.id,100)||!singleLine(app.name,100,1)||!Array.isArray(app.types)||app.types.length>20||new Set(app.types).size!==app.types.length||!app.types.every(type=>slug(type,50)))throw invalid();return{id:app.id,name:app.name,types:[...app.types]};});
 if(new Set(applications.map(app=>app.id)).size!==applications.length)throw invalid();
 const promotionEnabled=value.promotionEnabled.map(policy=>{if(!exact(policy,['appId','policyVersion'])||!applications.some(app=>app.id===policy.appId)||!slug(policy.policyVersion,80))throw invalid();return{appId:policy.appId,policyVersion:policy.policyVersion};});
 if(new Set(promotionEnabled.map(policy=>policy.appId)).size!==promotionEnabled.length)throw invalid();
 const items=value.items.map(partnershipItem);
 if(new Set(items.map(item=>item.id)).size!==items.length||items.some(item=>!applications.some(app=>app.id===item.appId&&app.types.includes(item.type))||item.managerId!==null&&item.managerId.toLowerCase()!==actorId.toLowerCase()))throw invalid();
 return{items,summary:{...value.summary},notifications:{...value.notifications},applications,promotionEnabled,managerId:actorId};
}
function query(url,kind){
 const allowed=kind==='inquiries'?['limit','stage','appId']:['limit','appId'];
 for(const key of url.searchParams.keys())if(!allowed.includes(key)||url.searchParams.getAll(key).length!==1)throw Object.assign(new Error('invalid query'),{status:400});
 const raw=url.searchParams.get('limit')??'50';if(!/^(?:[1-9]\d?|100)$/.test(raw))throw Object.assign(new Error('invalid limit'),{status:400});
 const params=new URLSearchParams({limit:raw});
 if(url.searchParams.has('stage')){const stage=url.searchParams.get('stage');if(!STAGES.has(stage))throw Object.assign(new Error('invalid stage'),{status:400});params.set('stage',stage);}
 if(url.searchParams.has('appId')){const appId=url.searchParams.get('appId');if(!slug(appId,100))throw Object.assign(new Error('invalid app'),{status:400});params.set('appId',appId);}
 return params.toString();
}
function patch(value,actorId){
 if(!plain(value)||(!positive(value.expectedVersion)||value.expectedVersion>2147483646)||Object.keys(value).some(key=>!['expectedVersion',...WORKFLOW].includes(key))||Object.keys(value).length<2||Object.hasOwn(value,'stage')&&!STAGES.has(value.stage)||Object.hasOwn(value,'managerId')&&!nullable(value.managerId,id=>typeof id==='string'&&id.toLowerCase()===actorId.toLowerCase())||Object.hasOwn(value,'nextAction')&&!nullable(value.nextAction,s=>singleLine(s,500))||Object.hasOwn(value,'nextActionDueAt')&&!nullable(value.nextActionDueAt,instant))throw Object.assign(new Error('invalid patch'),{status:400});
 return Object.fromEntries(['expectedVersion',...WORKFLOW].filter(key=>Object.hasOwn(value,key)).map(key=>[key,value[key]]));
}
function promotion(value){if(!exact(value,['expectedVersion','displayName','policyVersion'])||(!positive(value.expectedVersion)||value.expectedVersion>2147483646)||!singleLine(value.displayName,160,2)||!slug(value.policyVersion,80))throw Object.assign(new Error('invalid promotion'),{status:400});return{expectedVersion:value.expectedVersion,displayName:value.displayName,policyVersion:value.policyVersion};}
const errors={400:['invalid-input','Invalid partnership request.'],401:['unauthorized','Sign in to continue.'],403:['rejected','This action is not permitted.'],404:['not-found','The requested item was not found.'],405:['method-not-allowed','This method is not supported.'],409:['idempotency-conflict','This item changed. Refresh before retrying.'],410:['request-closed','This item is no longer retained.'],413:['too-large','The request is too large.'],415:['invalid-content-type','Use an uncompressed JSON request.'],429:['rate-limit','Please try again later.'],503:['unavailable','Partnerships are temporarily unavailable.']};
export function createPartnershipProxy({authorize,request,send,body,sameOrigin,origin}){
 return async function handle(req,res,url,session){
  const path=url.pathname;
  const match=/^\/prehled\/api\/(partnerships|partners)(?:\/(.*))?$/.exec(path);
  if(!match)return false;
  try{
   if(!session)throw Object.assign(new Error('unauthorized'),{status:401});
   let context=await authorize(session);if(!UUID.test(context?.actorId??''))throw Object.assign(new Error('unavailable'),{status:503});
   const kind=match[1]==='partnerships'?'inquiries':'partners',suffix=match[2],promotionRoute=kind==='inquiries'&&typeof suffix==='string'&&suffix.endsWith('/promote'),id=promotionRoute?suffix.slice(0,-8):suffix;
   const list=suffix===undefined;
   if(!list&&!UUID.test(id??''))throw Object.assign(new Error('not found'),{status:404});
   const method=req.method;
   if(list?method!=='GET':promotionRoute?method!=='POST':!((kind==='inquiries'&&method==='PATCH')||method==='DELETE'))throw Object.assign(new Error('method'),{status:405});
   if(!list&&url.search)throw Object.assign(new Error('query'),{status:400});
   if(method!=='GET'&&!sameOrigin(req,origin))throw Object.assign(new Error('origin'),{status:403});
   if(method==='DELETE'&&(req.headers['transfer-encoding']||Number(req.headers['content-length']??0)>0))throw Object.assign(new Error('delete body'),{status:400});
   let options={method};
   if(method==='PATCH'||method==='POST'){
    if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(String(req.headers['content-type']??''))||req.headers['content-encoding']&&req.headers['content-encoding']!=='identity')throw Object.assign(new Error('content type'),{status:415});
    const input=await body(req,{strictUtf8:true});options.body=JSON.stringify(promotionRoute?promotion(input):patch(input,context.actorId));
    // A slow body must not keep permissions or credentials that were revoked
    // while it was being read. Re-verify immediately before the private write.
    const fresh=await authorize(session);if(!UUID.test(fresh?.actorId??'')||fresh.actorId.toLowerCase()!==context.actorId.toLowerCase())throw Object.assign(new Error('forbidden'),{status:403});context=fresh;
   }
   const internal='/internal/partnerships/v1/'+kind+(list?'?'+query(url,kind):'/'+id+(promotionRoute?'/promote':''));
   const result=await request(context,internal,options);
   let output;
   if(list&&kind==='inquiries')output=partnershipList(result,context.actorId);
   else if(list){if(!exact(result,['items'])||!Array.isArray(result.items)||result.items.length>100)throw invalid();output={items:result.items.map(partnershipPartner)};if(new Set(output.items.map(item=>item.id)).size!==output.items.length)throw invalid();}
   else if(method==='DELETE'){if(!exact(result,['ok','reference'])||result.ok!==true||result.reference!==id)throw invalid();output={ok:true,reference:id};}
   else if(promotionRoute){if(!exact(result,['ok','partner'])||result.ok!==true)throw invalid();output={ok:true,partner:partnershipPartner(result.partner)};}
   else{if(!exact(result,['ok','item'])||result.ok!==true)throw invalid();const item=partnershipItem(result.item);if(item.id!==id||item.managerId!==null&&item.managerId.toLowerCase()!==context.actorId.toLowerCase())throw invalid();output={ok:true,item};}
   send(res,200,output);
  }catch(error){const status=Object.hasOwn(errors,error.status)?error.status: error instanceof SyntaxError?400:503;const[code,message]=errors[status];send(res,status,{ok:false,code,message,requestId:null},'application/json',[429,503].includes(status)?{'Retry-After':'60'}:{});}
  return true;
 };
}
