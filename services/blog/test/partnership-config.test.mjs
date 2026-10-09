import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('partnership configuration defaults off and accepts only protected file credentials',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vcode-partnership-config-'));
 const secret='synthetic-partnership-secret-only-'.repeat(2),owner='11111111-2222-4333-8444-555555555555';
 const source="import{loadConfig}from'./services/blog/config.mjs';const c=await loadConfig();console.log(JSON.stringify({enabled:c.partnershipIntakeEnabled,registry:c.partnershipRegistryFile,secret:c.partnershipChallengeSecret,owner:c.contactInboxOwnerId,generation:c.generationEnabled,autoPublish:c.autoPublish}));";
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>!key.startsWith('PARTNERSHIP_')&&!key.startsWith('CONTACT_')&&!key.startsWith('BLOG_')&&!key.endsWith('_FILE')&&!['DATABASE_URL','OPENAI_API_KEY','TELEGRAM_BOT_TOKEN'].includes(key)));
 const load=extra=>JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',source],{cwd:new URL('../../../',import.meta.url),env:{...env,...extra},encoding:'utf8'}));
 try{
  assert.deepEqual(load({PARTNERSHIP_CHALLENGE_SECRET:secret}),{enabled:false,registry:'',secret:'',owner:'',generation:false,autoPublish:false},'No plaintext fallback or default activation');
  const key=join(dir,'key'),id=join(dir,'owner'),wide=join(dir,'wide'),link=join(dir,'link');
  await writeFile(key,secret,{mode:0o600});await writeFile(id,owner,{mode:0o600});await writeFile(wide,secret,{mode:0o644});await symlink(key,link);
  const configured=load({PARTNERSHIP_INTAKE_ENABLED:'true',PARTNERSHIP_REGISTRY_FILE:join(dir,'registry.json'),PARTNERSHIP_CHALLENGE_SECRET_FILE:key,CONTACT_INBOX_OWNER_ID_FILE:id});
  assert.equal(configured.enabled,true);assert.equal(configured.secret,secret);assert.equal(configured.owner,owner);assert.equal(configured.generation,false);assert.equal(configured.autoPublish,false);
  await writeFile(id,'ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF');
  assert.equal(load({CONTACT_INBOX_OWNER_ID_FILE:id}).owner,'abcdefab-cdef-4abc-8abc-abcdefabcdef','UUID identity uses the same canonical casing as the dashboard');
  for(const file of[wide,link,join(dir,'missing'),'relative-key'])assert.equal(load({PARTNERSHIP_CHALLENGE_SECRET_FILE:file}).secret,'');
 }finally{await rm(dir,{recursive:true,force:true});}
});
