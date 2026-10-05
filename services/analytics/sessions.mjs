import {createHash,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
export const SHORT_SESSION_MS=60*60*1000;
export const REMEMBER_SESSION_MS=30*24*60*60*1000;
const digest=id=>createHash('sha256').update(id).digest('hex');
export async function createSessionStore(directory,{now=Date.now}={}) {
 const records=new Map();let key;let queue=Promise.resolve();
 const path=directory&&join(directory,'sessions.enc');
 if(directory){
  await mkdir(directory,{recursive:true,mode:0o700});
  const keyPath=join(directory,'session-key');
  try{key=await readFile(keyPath);}catch(e){if(e.code!=='ENOENT')throw e;key=randomBytes(32);await writeFile(keyPath,key,{mode:0o600,flag:'wx'});}
  if(key.length!==32)throw Error('Invalid session encryption key');
  try{
   const encrypted=await readFile(path);const decipher=createDecipheriv('aes-256-gcm',key,encrypted.subarray(0,12));decipher.setAuthTag(encrypted.subarray(12,28));
   const data=JSON.parse(Buffer.concat([decipher.update(encrypted.subarray(28)),decipher.final()]).toString());
   if(!Array.isArray(data)||data.length>1000)throw Error('Invalid session store');
   for(const [hash,s] of data){if(!/^[a-f0-9]{64}$/.test(hash)||typeof s.token!=='string'||!Number.isFinite(s.until)||s.remember!==true)throw Error('Invalid session record');if(s.until>now())records.set(hash,s);}
  }catch(e){if(e.code!=='ENOENT')throw e;}
 }
 function save(){
  if(!directory)return Promise.resolve();
  const data=JSON.stringify([...records].filter(([,s])=>s.remember&&s.until>now()));
  const task=queue.then(async()=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const content=Buffer.concat([cipher.update(data),cipher.final()]);await writeFile(path+'.tmp',Buffer.concat([iv,cipher.getAuthTag(),content]),{mode:0o600});await rename(path+'.tmp',path);});queue=task.catch(()=>{});return task;
 }
 return {
  get size(){return records.size;},
  async create(token,remember=false){
   if(remember&&!directory)throw Error('Persistent sessions are unavailable');
   if(records.size>=1000)throw Error('Too many sessions');
   const id=randomBytes(32).toString('hex');const hash=digest(id),s={token,remember,until:now()+(remember?REMEMBER_SESSION_MS:SHORT_SESSION_MS)};
   records.set(hash,s);try{if(remember)await save();}catch(e){records.delete(hash);throw e;}return {id,...s};
  },
  get(id){if(typeof id!=='string'||!/^[a-f0-9]{64}$/.test(id))return null;const s=records.get(digest(id));return s&&s.until>now()?{id,...s}:null;},
  async remove(id){const hash=digest(id),s=records.get(hash);records.delete(hash);try{if(s?.remember)await save();}catch(e){records.set(hash,s);throw e;}},
  async prune(){let changed=false;for(const [hash,s]of records)if(s.until<=now()){records.delete(hash);changed=changed||s.remember;}if(changed)await save();}
 };
}
