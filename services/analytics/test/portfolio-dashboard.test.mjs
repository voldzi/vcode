import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import vm from 'node:vm';

const names=['portfolio-vcode-click','portfolio-moje-porce-click','portfolio-mestem-hrou-click'];
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

test('authenticated dashboard returns only approved footer capabilities and events from a synthetic permitted website',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'vcode-portfolio-dashboard-'));
 const registry=join(directory,'sites.json');
 const token='synthetic-portfolio-upstream-token',collectorKey='synthetic-private-edge-key-not-for-dashboard';
 const approval='2026-10-09T08:00:00.000Z',started='2026-10-09T09:00:00.000Z';
 const events=[{x:'outbound-click',y:7},...names.map((x,index)=>({x,y:index+1})),{x:'contact-click',y:8},{x:'unknown-click',y:9}];
 const requests=[];
 const upstream=createServer((req,res)=>{
  requests.push(req.url);
  res.setHeader('Content-Type','application/json');
  if(req.url==='/api/auth/login'){res.end(JSON.stringify({token}));return;}
  assert.equal(req.headers.authorization,'Bearer '+token);
  const url=new URL(req.url,'http://synthetic.example.invalid');
  if(url.pathname==='/api/websites'){
   res.end(JSON.stringify({data:[{id:'studio',createdAt:'2026-10-04T00:00:00.000Z'},{id:'acceptance-only',createdAt:'2026-10-04T00:00:00.000Z'}]}));return;
  }
  assert.ok(url.pathname.startsWith('/api/websites/studio/'),'testOnly and unauthorized websites must not be queried');
  assert.equal(url.searchParams.get('timezone'),'Europe/Prague');
  assert.ok(Number(url.searchParams.get('endAt'))>Number(url.searchParams.get('startAt')));
  if(url.pathname.endsWith('/stats'))res.end(JSON.stringify({pageviews:12,visitors:5,visits:6}));
  else if(url.pathname.endsWith('/pageviews'))res.end(JSON.stringify({pageviews:[]}));
  else if(url.searchParams.get('type')==='event')res.end(JSON.stringify(events));
  else res.end('[]');
 });
 await listen(upstream);
 const probe=createServer();await listen(probe);const port=probe.address().port;
 await new Promise(resolve=>probe.close(resolve));
 const site={id:'studio',name:'Synthetic Studio Balance',domain:'studio.example.invalid',collectionEnabled:true,approvedAt:'2026-10-04',metricsApprovedAt:'2026-10-04',integrationVersion:'vcode-public-v2',captureSources:true,allowedPaths:['/'],allowedEvents:['outbound-click',...names,'unknown-click'],collectorKey,approvalEvidenceFile:'/private/synthetic-owner-review-not-for-dashboard',runtimeIntegrity:'synthetic-runtime-integrity-private-config'};
 const save=patch=>writeFile(registry,JSON.stringify([{...site,...patch},{...site,id:'acceptance-only',domain:'acceptance.example.invalid',testOnly:true},{...site,id:'not-permitted',domain:'not-permitted.example.invalid'}]));
 await save({});
 const child=spawn(process.execPath,['services/analytics/server.mjs'],{env:{...process.env,PORT:String(port),PUBLIC_SITE_URL:'https://dashboard.example.invalid',ANALYTICS_UPSTREAM:`http://127.0.0.1:${upstream.address().port}`,ANALYTICS_SITES_FILE:registry,ANALYTICS_STATUS_FILE:join(directory,'no-production-status.json'),ANALYTICS_SESSION_DIR:join(directory,'sessions'),ANALYTICS_COLLECTION_ENABLED:'true',VCODE_ANALYTICS_WEBSITE_ID:'not-permitted',DOWNLOAD_METRICS_PATH:join(directory,'no-production-downloads.json')},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}`;
 try{
  let ready=false;for(let n=0;n<100;n++){try{if((await fetch(base+'/health')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,20));}assert.ok(ready);
  assert.equal((await fetch(base+'/prehled/api/summary?days=30')).status,401);
  assert.equal(requests.length,0,'unauthenticated summary must not query Umami');
  const login=await fetch(base+'/prehled/api/login',{method:'POST',headers:{Origin:'https://dashboard.example.invalid','Content-Type':'application/json'},body:JSON.stringify({username:'synthetic-only',password:'synthetic-only'})});
  assert.equal(login.status,200);
  assert.ok(!(await login.text()).includes(token));
  const headers={Cookie:login.headers.get('set-cookie').split(';')[0]};
  const summary=async()=>{
   const response=await fetch(base+'/prehled/api/summary?days=30',{headers});
   assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
   const text=await response.text();
   for(const secret of [token,collectorKey,site.approvalEvidenceFile,site.runtimeIntegrity,'"collectorKey"','"allowedEvents"','"portfolioMetricsApprovedAt"'])assert.ok(!text.includes(secret),'private configuration must remain server-side');
   const body=JSON.parse(text);assert.equal(body.days,30);assert.equal(body.timezone,'Europe/Prague');
   assert.equal(body.sites.length,1);assert.equal(body.sites[0].domain,site.domain);assert.equal(body.sites[0].available,true);
   return body.sites[0];
  };
  for(const gate of [undefined,null,'not a date']){
   await save({portfolioMetricsApprovedAt:gate,portfolioMetricsCollectionStartedAt:started});
   const result=await summary();
   assert.deepEqual(result.capabilities,{referrers:true,events:['outbound-click']});
   assert.deepEqual(result.events,[events[0]]);
   assert.equal(result.portfolioMetricsCollectionStartedAt,null,'unapproved footer scope must not advertise a start date');
  }
  await save({portfolioMetricsApprovedAt:approval,portfolioMetricsCollectionStartedAt:started,allowedEvents:['outbound-click',names[0],names[2],'unknown-click']});
  let result=await summary();
  assert.deepEqual(result.capabilities.events,['outbound-click',names[0],names[2]]);
  assert.deepEqual(result.events,[events[0],events[1],events[3]]);
  assert.equal(result.portfolioMetricsCollectionStartedAt,started);
  await save({portfolioMetricsApprovedAt:approval,portfolioMetricsCollectionStartedAt:'invalid date'});
  result=await summary();
  assert.deepEqual(result.capabilities.events,['outbound-click',...names]);
  assert.deepEqual(result.events,events.slice(0,4));
  assert.equal(result.portfolioMetricsCollectionStartedAt,approval,'approved date is the safe fallback when collection start is absent or invalid');
  await save({portfolioMetricsApprovedAt:approval,collectionEnabled:false});
  result=await summary();
  assert.equal(result.collectionEnabled,false);
  assert.deepEqual(result.events,events.slice(0,4),'disabled collection retains approved historical metrics');
  await fetch(base+'/prehled/api/logout',{method:'POST',headers:{...headers,Origin:'https://dashboard.example.invalid'},body:'{}'});
  const before=requests.length;
  assert.equal((await fetch(base+'/prehled/api/summary',{headers})).status,401);
  assert.equal(requests.length,before);
 }finally{
  if(child.exitCode===null&&child.signalCode===null){const stopped=new Promise(resolve=>child.once('exit',resolve));child.kill();await stopped;}
  upstream.closeAllConnections();await new Promise(resolve=>upstream.close(resolve));
  await rm(directory,{recursive:true,force:true});
 }
});

test('footer rows name all approved destinations in both locales and show zero only within the approved scope',async()=>{
 const script=await readFile(new URL('../dashboard.js',import.meta.url),'utf8');
 const translations=script.slice(script.indexOf('const labels='),script.indexOf('\nlet language='));
 const eventName=script.slice(script.indexOf('function eventName('),script.indexOf('function list('));
 const portfolioRows=script.slice(script.indexOf('function portfolioRows('),script.indexOf('function renderDetail('));
 const count=script.match(/^const count=.*;$/m)?.[0];assert.ok(count);
 const context={};
 vm.runInNewContext(`${translations}\nlet language='cs';\nconst t=key=>labels[language][key]??key;\n${count}\n${eventName}\n${portfolioRows}\nthis.setLanguage=value=>language=value;this.label=t;`,context);
 const data={capabilities:{events:['outbound-click',...names]},events:[{x:names[0],y:2},{x:names[0],y:{value:3}},{x:names[1],y:4},{x:'unknown-click',y:99},{x:'outbound-click',y:40}]};
 const expected=[{x:names[0],y:5},{x:names[1],y:4},{x:names[2],y:0}];
 for(const language of ['cs','en']){
  context.setLanguage(language);
  assert.equal(context.label('portfolioTitle'),language==='cs'?'Odkazy v patičce':'Footer links');
  assert.deepEqual(names.map(name=>context.eventName(name)),['VCode','Moje porce','Městem hrou']);
  assert.deepEqual(JSON.parse(JSON.stringify(context.portfolioRows(data))),expected);
  assert.deepEqual(JSON.parse(JSON.stringify(context.portfolioRows({...data,capabilities:{events:['outbound-click',names[2]]}}))),[expected[2]]);
  assert.deepEqual(JSON.parse(JSON.stringify(context.portfolioRows({...data,capabilities:{events:['outbound-click']}}))),[]);
  assert.match(context.label('portfolioNote'),language==='cs'?/Nejde o počet lidí, registrací/:/not counts of people, registrations/);
 }
});
