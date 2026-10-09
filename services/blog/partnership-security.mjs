import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {open} from 'node:fs/promises';
import {constants} from 'node:fs';
import {isAbsolute} from 'node:path';

export const PARTNERSHIP_CONTRACT='partnership-intake-v1';
export const PARTNERSHIP_PRIVACY_VERSION='partnership-intake-20261009-1';
export const PARTNERSHIP_CHALLENGE_TTL=600000;
export const PARTNERSHIP_MIN_DELAY=1500;
export const PARTNERSHIP_MAX_BODY=16384;
export const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export const PARTNERSHIP_STAGES=['new','reviewing','waiting','pilot','active','closed'];
const KEY=/^[A-Za-z0-9_-]{32,256}$/;
const BUCKET=/^[A-Za-z0-9_-]{43}$/;
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const failure=(status,code)=>Object.assign(new Error(code),{status,code});
export const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
export const equal=(a,b)=>{const left=Buffer.from(String(a??'')),right=Buffer.from(String(b??''));return left.length>0&&left.length===right.length&&timingSafeEqual(left,right);};
const exact=(value,required,optional=[])=>plain(value)&&required.every(k=>Object.hasOwn(value,k))&&Object.keys(value).every(k=>required.includes(k)||optional.includes(k));
const sign=(value,secret)=>createHmac('sha256',secret).update('vcode-partnership-challenge-v1:'+value).digest('base64url');
const approved=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const noticeAllowed=(raw,domain)=>{
 if(typeof raw!=='string'||raw.length>2048)return false;
 try{const notice=new URL(raw);return notice.origin===`https://${domain}`&&!notice.username&&!notice.password&&notice.search.length<=512;}catch{return false;}
};

export async function readPartnershipSecret(path){
 let file;
 try{
  if(typeof path!=='string'||!isAbsolute(path))return '';
  file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);const stat=await file.stat();
  if(!stat.isFile()||stat.size>512||(stat.mode&0o077)!==0)return '';
  const value=(await file.readFile('utf8')).trim();return KEY.test(value)?value:'';
 }catch{return '';}finally{await file?.close();}
}

export async function loadPartnershipRegistry(path,catalog,forbidden=[]){
 let file;
 try{
  if(typeof path!=='string'||!isAbsolute(path)||!(catalog instanceof Map)||!catalog.size)return null;
  file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);const stat=await file.stat();
  if(!stat.isFile()||stat.size>65536||(stat.mode&0o077)!==0)return null;
  const value=JSON.parse(await file.readFile('utf8'));
  if(!exact(value,['version','applications'])||value.version!==PARTNERSHIP_CONTRACT||!Array.isArray(value.applications)||value.applications.length<1||value.applications.length>100)return null;
  const result=[],ids=new Set(),domains=new Set(),keys=new Set(forbidden.filter(Boolean));
  for(const app of value.applications){
   if(!exact(app,['appId','domain','enabled','keyFile','types','privacyVersion','approvedAt','publishedAt','noticeUrl','partnerPolicy'])
      ||typeof app.appId!=='string'||!catalog.has(app.appId)||ids.has(app.appId)
      ||typeof app.domain!=='string'||!/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/.test(app.domain)||domains.has(app.domain)
      ||typeof app.enabled!=='boolean'||app.privacyVersion!==PARTNERSHIP_PRIVACY_VERSION
      ||!Array.isArray(app.types)||app.types.length<1||app.types.length>20||new Set(app.types).size!==app.types.length
      ||!app.types.every(t=>typeof t==='string'&&t.length<=50&&ID.test(t)))return null;
   if(!noticeAllowed(app.noticeUrl,app.domain))return null;
   if(app.enabled&&(!approved(app.approvedAt)||!approved(app.publishedAt)))return null;
   if(!app.enabled&&(![null,''].includes(app.approvedAt)&&!approved(app.approvedAt)||![null,''].includes(app.publishedAt)&&!approved(app.publishedAt)))return null;
   const policy=app.partnerPolicy;
   if(!exact(policy,['enabled','version','retentionDays','approvedAt','publishedAt','noticeUrl'])||typeof policy.enabled!=='boolean'
      ||typeof policy.version!=='string'||policy.version.length>80||!Number.isInteger(policy.retentionDays))return null;
   if(policy.enabled){
    if(!ID.test(policy.version)||policy.retentionDays<1||policy.retentionDays>365||!approved(policy.approvedAt)||!approved(policy.publishedAt)
       ||!noticeAllowed(policy.noticeUrl,app.domain))return null;
   }else if(policy.retentionDays!==0||policy.version!==''||![null,''].includes(policy.approvedAt)||![null,''].includes(policy.publishedAt))return null;
   if(app.keyFile!==null&&app.keyFile!==''&&(typeof app.keyFile!=='string'||!isAbsolute(app.keyFile)))return null;
   const key=await readPartnershipSecret(app.keyFile);if(app.enabled&&!key||key&&keys.has(key))return null;
   ids.add(app.appId);domains.add(app.domain);if(key)keys.add(key);result.push({...app,key,name:catalog.get(app.appId)});
  }
  return result;
 }catch{return null;}finally{await file?.close();}
}

export function normalizedText(value,minimum,maximum,multiline=false){
 if(typeof value!=='string')throw failure(400,'invalid-input');
 const text=value.normalize('NFC').replace(/\r\n?/g,'\n').trim();
 if(!text.isWellFormed()||[...text].length<minimum||[...text].length>maximum||(multiline?/[\x00-\x08\x0b-\x1f\x7f]/:/[\x00-\x1f\x7f]/).test(text))throw failure(400,'invalid-input');
 return text;
}
export function validatePartnershipChallenge(input){
 if(!exact(input,['requestId','locale','clientBucket'])||typeof input.requestId!=='string'||!UUID.test(input.requestId)
    ||!['cs','en'].includes(input.locale)||typeof input.clientBucket!=='string'||!BUCKET.test(input.clientBucket))throw failure(400,'invalid-input');
 return {...input,requestId:input.requestId.toLowerCase()};
}
export function validatePartnershipPayload(input,app){
 const required=['requestId','locale','clientBucket','token','privacyVersion','name','email','type','message','website'];
 if(!exact(input,required,['organization'])||typeof input.requestId!=='string'||!UUID.test(input.requestId)
    ||!['cs','en'].includes(input.locale)||typeof input.clientBucket!=='string'||!BUCKET.test(input.clientBucket)
    ||typeof input.token!=='string'||!input.token.trim()||input.token.length>2048||!app.types.includes(input.type))throw failure(400,'invalid-input');
 if(input.privacyVersion!==app.privacyVersion)throw failure(400,'privacy-version-mismatch');
 if(input.website!=='')throw failure(403,'rejected');
 const name=normalizedText(input.name,2,100),email=normalizedText(input.email,3,254).toLowerCase();
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw failure(400,'invalid-input');
 return {appId:app.appId,requestId:input.requestId.toLowerCase(),locale:input.locale,name,email,
  organization:input.organization==null?null:normalizedText(input.organization,0,160)||null,
  type:input.type,message:normalizedText(input.message,30,4000,true),privacyVersion:app.privacyVersion};
}
export function issuePartnershipChallenge(app,input,secret,now=Date.now()){
 const raw=Buffer.from(JSON.stringify({appId:app.appId,requestId:input.requestId,locale:input.locale,privacyVersion:app.privacyVersion,
  issuedAt:now,nonce:randomBytes(16).toString('base64url')})).toString('base64url');
 return {ok:true,contractVersion:PARTNERSHIP_CONTRACT,appId:app.appId,requestId:input.requestId,
  token:raw+'.'+sign(raw+':'+input.clientBucket,secret),minimumDelayMs:PARTNERSHIP_MIN_DELAY,
  expiresAt:new Date(now+PARTNERSHIP_CHALLENGE_TTL).toISOString(),privacyVersion:app.privacyVersion};
}
export function authenticPartnershipChallenge(token,app,input,secret){
 if(typeof token!=='string'||token.length>2048||typeof secret!=='string'||!KEY.test(secret))return null;
 const [value,signature,extra]=token.split('.');
 if(!value||!signature||extra||!equal(signature,sign(value+':'+input.clientBucket,secret)))return null;
 try{
  const data=JSON.parse(Buffer.from(value,'base64url').toString('utf8'));
  const bound=exact(data,['appId','requestId','locale','privacyVersion','issuedAt','nonce'])&&data.appId===app.appId&&data.requestId===input.requestId.toLowerCase()
   &&data.locale===input.locale&&data.privacyVersion===app.privacyVersion&&typeof data.nonce==='string'&&/^[A-Za-z0-9_-]{22}$/.test(data.nonce)
   &&Number.isSafeInteger(data.issuedAt)&&data.issuedAt>=0;
  return bound?data:null;
 }catch{return null;}
}
export function validPartnershipChallenge(token,app,input,secret,now=Date.now()){
 const data=authenticPartnershipChallenge(token,app,input,secret);
 return Boolean(data&&now-data.issuedAt>=PARTNERSHIP_MIN_DELAY&&now-data.issuedAt<=PARTNERSHIP_CHALLENGE_TTL);
}
export async function partnershipBody(request){
 if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(String(request.headers['content-type']??''))
    ||request.headers['content-encoding']&&request.headers['content-encoding']!=='identity')throw failure(415,'invalid-content-type');
 const sizeHeader=request.headers['content-length'];
 if(sizeHeader&&(!/^\d+$/.test(sizeHeader)||Number(sizeHeader)>PARTNERSHIP_MAX_BODY))throw failure(413,'too-large');
 const chunks=[];let size=0;
 for await(const chunk of request){size+=chunk.length;if(size>PARTNERSHIP_MAX_BODY)throw failure(413,'too-large');chunks.push(chunk);}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));}catch{throw failure(400,'invalid-input');}
}
export function validatePartnershipUpdate(input,ownerId){
 if(!exact(input,['expectedVersion'],['stage','managerId','nextAction','nextActionDueAt'])||Object.keys(input).length<2
    ||!Number.isInteger(input.expectedVersion)||input.expectedVersion<1||input.expectedVersion>2147483646)throw failure(400,'invalid-input');
 const result={expectedVersion:input.expectedVersion};
 if(Object.hasOwn(input,'stage')){if(!PARTNERSHIP_STAGES.includes(input.stage))throw failure(400,'invalid-input');result.stage=input.stage;}
 if(Object.hasOwn(input,'managerId')){if(input.managerId!==null&&input.managerId!==ownerId)throw failure(400,'invalid-input');result.managerId=input.managerId;}
 if(Object.hasOwn(input,'nextAction'))result.nextAction=input.nextAction===null?null:normalizedText(input.nextAction,0,500)||null;
 if(Object.hasOwn(input,'nextActionDueAt')){
  const value=input.nextActionDueAt;
  if(value===null)result.nextActionDueAt=null;
  else{
   if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)||!Number.isFinite(Date.parse(value)))throw failure(400,'invalid-input');
   const iso=new Date(value).toISOString();if(iso!==value&&iso.replace('.000Z','Z')!==value)throw failure(400,'invalid-input');result.nextActionDueAt=iso;
  }
 }
 return result;
}
export function validatePartnershipPromotion(input){
 if(!exact(input,['expectedVersion','displayName','policyVersion'])||!Number.isInteger(input.expectedVersion)||input.expectedVersion<1||input.expectedVersion>2147483646
    ||typeof input.policyVersion!=='string'||!ID.test(input.policyVersion)||input.policyVersion.length>80)throw failure(400,'invalid-input');
 return {...input,displayName:normalizedText(input.displayName,2,160)};
}
