import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../partnership-inbox-ui.js',import.meta.url),'utf8');
const tick=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve));};
const OWNER='11111111-2222-4333-8444-555555555555',ID='22222222-3333-4444-8555-666666666666',PARTNER='33333333-4444-4555-8666-777777777777';
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.listeners={};this.hidden=false;this.value='';this._text='';this.open=false;this.disabled=false;}
 append(...items){for(const item of items)item.parent=this;this.children.push(...items);}
 replaceChildren(...items){this.children=[];this._text='';this.append(...items);}
 setAttribute(key,value){this.attributes[key]=value;}removeAttribute(key){delete this.attributes[key];}
 addEventListener(key,listener){this.listeners[key]=listener;}focus(){this.focused=true;}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
 showModal(){this.open=true;}close(){this.open=false;}
 set textContent(value){this._text=String(value);this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join(' ');}
 set innerHTML(_){assert.fail('Private content must use text nodes');}
 all(tag){return this.children.flatMap(child=>[child,...child.descendants()]).filter(child=>child.tagName===tag);}
 descendants(){return this.children.flatMap(child=>[child,...child.descendants()]);}
}
const synthetic=()=>({items:[{id:ID,appId:'kaloricke-tabulky',type:'vyrobce',locale:'cs',name:'SYNTHETIC PARTNER SENDER',email:'synthetic@example.invalid',organization:'Synthetic organisation',message:'<script>SYNTHETIC PRIVATE OFFER</script>',privacyVersion:'partnership-intake-20261009-1',stage:'new',managerId:null,nextAction:null,nextActionDueAt:null,version:1,createdAt:'2026-10-09T12:00:00Z',updatedAt:'2026-10-09T12:00:00Z',expiresAt:'2027-01-07T12:00:00Z',audit:[{id:PARTNER,actorId:null,action:'created',changedFields:[],fromStage:null,toStage:'new',createdAt:'2026-10-09T12:00:00Z'}]}],summary:{new:1,reviewing:0,waiting:0,pilot:0,active:0,closed:0,total:1},notifications:{pending:0,sent:1,failed:0},applications:[{id:'kaloricke-tabulky',name:'Moje porce',types:['vyrobce','obchod','jine']}],promotionEnabled:[],managerId:OWNER});
function fixture(confirm=false){
 const host=new Element('section'),nav=new Element('a'),requests=[],events=[],listeners={};const forbidden=new Proxy({},{get(){assert.fail('No partnership content in browser storage');}});
 const context={Intl,Date,Map,Number,URLSearchParams,AbortController,CustomEvent:class{constructor(type){this.type=type;}},navigator:{onLine:true},localStorage:forbidden,sessionStorage:forbidden,caches:forbidden,document:{createElement:tag=>new Element(tag),getElementById:()=>nav,dispatchEvent:event=>events.push(event)},window:{confirm:()=>confirm,addEventListener:(type,listener)=>{listeners[type]=listener;}},fetch:(url,options)=>new Promise(resolve=>requests.push({url,options,resolve:(body,status=200)=>resolve({ok:status>=200&&status<300,status,json:async()=>body})}))};vm.runInNewContext(source,context);return{host,nav,requests,events,listeners,context,ui:context.window.VCodePartnershipInbox};
}
async function ready(f,{locale='cs',data=synthetic(),partners={items:[]}}={}){f.ui.render({container:f.host,locale});f.requests.at(-2).resolve(data);f.requests.at(-1).resolve(partners);await tick();}
const formEvent=()=>({preventDefault(){}});
test('private offers are text-safe, bilingual and never retained after clear/offline or a late response',async()=>{
 for(const locale of ['cs','en']){const f=fixture();await ready(f,{locale});assert.match(f.host.textContent,/SYNTHETIC PRIVATE OFFER/);assert.equal(f.host.all('script').length,0);assert.equal(f.nav.hidden,false);assert.ok(f.host.textContent.includes(locale==='en'?'Offers are deleted within 90 days':'Nabídky se mažou do 90 dní'));assert.equal(f.requests[0].options.cache,'no-store');assert.equal(f.requests[0].options.credentials,'same-origin');assert.equal(f.requests[0].options.redirect,'error');f.listeners.offline();assert.equal(f.host.hidden,true);assert.equal(f.host.textContent,'');assert.equal(f.nav.hidden,true);}
 const f=fixture();f.ui.render({container:f.host,locale:'cs'});f.ui.clear();for(const request of f.requests)request.resolve(synthetic());await tick();assert.equal(f.host.textContent,'');assert.equal(f.requests[0].options.signal.aborted,true);
});
test('401 and 403 clear every private record and only 401 requests reauthentication',async()=>{
 for(const status of [401,403]){const f=fixture();f.ui.render({container:f.host,locale:'en'});f.requests[0].resolve({message:'SYNTHETIC PRIVATE LEAK'},status);await tick();f.requests[1].resolve({items:[]});await tick();assert.equal(f.host.hidden,true);assert.equal(f.host.textContent,'');assert.equal(f.nav.hidden,true);assert.equal(f.events.length,status===401?1:0);if(status===401)assert.equal(f.events[0].type,'vcode:inbox-auth-expired');}
});
test('workflow sends the current optimistic version and owner assignment; conflicts discard stale contact contents',async()=>{
 const f=fixture();await ready(f,{locale:'en'});const form=f.host.all('form')[0],selects=form.all('select'),next=form.all('input')[0];selects[0].value='reviewing';selects[1].value=OWNER;next.value='Synthetic next action';form.listeners.submit(formEvent());const request=f.requests.at(-1);assert.equal(request.options.method,'PATCH');assert.equal(request.url,'/prehled/api/partnerships/'+ID);assert.deepEqual(JSON.parse(request.options.body),{expectedVersion:1,stage:'reviewing',managerId:OWNER,nextAction:'Synthetic next action',nextActionDueAt:null});assert.ok(f.host.all('button').filter(button=>button.type!=='submit').every(button=>button.disabled));request.resolve({code:'version-conflict'},409);await tick();assert.ok(f.host.textContent.includes('changed in the meantime'));assert.ok(!f.host.textContent.includes('SYNTHETIC PRIVATE OFFER'));assert.ok(!f.host.textContent.includes('synthetic@example.invalid'));
});
test('changing private host during an in-flight mutation cancels it and cannot repopulate the old host',async()=>{
 const f=fixture();await ready(f);f.host.all('form')[0].listeners.submit(formEvent());const oldRequest=f.requests.at(-1),next=new Element('section');f.ui.render({container:next,locale:'en'});assert.equal(oldRequest.options.signal.aborted,true);assert.equal(f.host.textContent,'');assert.equal(f.host.hidden,true);oldRequest.resolve({ok:true,item:{}});f.requests.at(-2).resolve(synthetic());f.requests.at(-1).resolve({items:[]});await tick();assert.match(next.textContent,/SYNTHETIC PRIVATE OFFER/);assert.equal(f.host.textContent,'');assert.equal(f.requests.length,5);
});
test('filters are separate from visitor analytics and preserve a bounded application list',async()=>{
 const f=fixture();await ready(f,{locale:'en'});const filters=f.host.all('div').find(node=>node.className==='panel partnership-filters'),application=filters.all('select')[0];application.value='kaloricke-tabulky';application.listeners.change();assert.match(f.requests.at(-2).url,/limit=50&appId=kaloricke-tabulky$/);assert.match(f.requests.at(-1).url,/partners\?limit=50&appId=kaloricke-tabulky$/);assert.ok(f.requests.every(request=>!request.url.includes('/analytics/')));
});
test('deleting an offer requires confirmation; keyboard focus and live feedback follow successful changes',async()=>{
 const declined=fixture(false);await ready(declined);declined.host.all('button').find(node=>node.textContent==='Smazat nabídku').listeners.click();assert.equal(declined.requests.length,2);
 const f=fixture(true);await ready(f,{locale:'en'});f.host.all('form')[0].listeners.submit(formEvent());f.requests.at(-1).resolve({ok:true});await tick();const updated=synthetic();updated.items[0].version=2;f.requests.at(-2).resolve(updated);f.requests.at(-1).resolve({items:[]});await tick();const card=f.host.all('details').find(node=>node.className==='panel partnership-card');assert.equal(card.open,true);assert.equal(card.children[0].focused,true);assert.ok(f.host.all('p').some(node=>node.attributes.role==='status'&&node.attributes['aria-live']==='polite'));
 f.host.all('button').find(node=>node.textContent==='Delete offer').listeners.click();const deletion=f.requests.at(-1);assert.equal(deletion.options.method,'DELETE');assert.equal(deletion.options.body,undefined);deletion.resolve({ok:true});await tick();const empty=synthetic();empty.items=[];empty.summary.new=empty.summary.total=0;f.requests.at(-2).resolve(empty);f.requests.at(-1).resolve({items:[]});await tick();assert.equal(f.host.all('h2')[0].focused,true);assert.match(f.host.textContent,/record was deleted/);
});
test('partner promotion is unavailable by default and never copies a contact or message into the explicit minimal record',async()=>{
 const disabled=fixture();await ready(disabled,{locale:'en'});assert.ok(!disabled.host.all('button').some(node=>node.textContent==='Create a partner record'));
 const f=fixture(),data=synthetic();data.promotionEnabled=[{appId:'kaloricke-tabulky',policyVersion:'synthetic-approved-policy'}];await ready(f,{locale:'en',data});const button=f.host.all('button').find(node=>node.textContent==='Create a partner record');button.listeners.click();const dialog=f.host.all('dialog')[0],name=dialog.all('input')[0];assert.equal(dialog.open,true);assert.equal(name.value,'');assert.equal(name.focused,true);assert.ok(!dialog.textContent.includes('synthetic@example.invalid'));const form=dialog.all('form')[0];form.listeners.submit(formEvent());assert.equal(f.requests.length,2);assert.match(dialog.textContent,/Enter a partner name/);name.value='Synthetic separately named partner';form.listeners.submit(formEvent());const request=f.requests.at(-1);assert.equal(request.url,'/prehled/api/partnerships/'+ID+'/promote');assert.deepEqual(JSON.parse(request.options.body),{expectedVersion:1,displayName:'Synthetic separately named partner',policyVersion:'synthetic-approved-policy'});assert.equal(f.host.all('dialog').length,0);
});
test('invalid next-step deadlines never leave the browser; failed alerts contain no Telegram message contents',async()=>{
 const f=fixture(),data=synthetic();data.notifications.failed=1;await ready(f,{data});assert.ok(f.host.all('p').some(node=>node.attributes.role==='alert'));const form=f.host.all('form')[0],due=form.all('input').find(input=>input.type==='datetime-local');due.value='2030-01-01T12:00';form.listeners.submit(formEvent());assert.equal(f.requests.length,2);assert.equal(due.focused,true);assert.match(form.textContent,/platný termín/);f.listeners.pagehide();assert.equal(f.host.textContent,'');
});

test('dashboard host renders partnerships only for the enabled capability and clears them on sign-out, offline and auth expiry',async()=>{
 const dashboard=await readFile(new URL('../dashboard.js',import.meta.url),'utf8'),ids=new Map(),windowListeners={},documentListeners={},requests=[],renders=[],clears=[];
 const get=id=>{if(!ids.has(id)){const node=new Element(id.includes('filter')||id==='period'?'select':'div');node.dataset={};node.options=node.children;Object.defineProperty(node,'options',{get:()=>node.children});if(id==='period')node.value='7';ids.set(id,node);}return ids.get(id);};
 const context={Intl,Date,Map,Number,URL,AbortSignal,location:{hash:''},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},navigator:{onLine:true},localStorage:{getItem:()=>null,setItem:(key)=>assert.ok(['vcode-metrics-language','vcode-metrics-theme'].includes(key))},document:{body:{dataset:{}},documentElement:{dataset:{}},createElement:tag=>new Element(tag),getElementById:get,querySelectorAll:()=>[],addEventListener:(type,fn)=>{documentListeners[type]=fn;}},window:{addEventListener:(type,fn)=>{windowListeners[type]=fn;},VCodePartnershipInbox:{render:value=>renders.push(value),clear:host=>clears.push(host)},VCodeContactInbox:{render(){},clear(){}},VCodeDownloadMetrics:{render(){},renderSummary(){},clear(){}}},setTimeout:()=>1,clearTimeout(){},fetch:(url,options)=>new Promise(resolve=>requests.push({url,options,resolve:(value,status=200)=>resolve({ok:status===200,status,json:async()=>value})}))};
 vm.runInNewContext(dashboard,context);
 const summary=enabled=>({partnershipsEnabled:enabled,sites:[],collectionEnabled:false,startAt:Date.now()-86400000,endAt:Date.now(),generatedAt:new Date().toISOString(),sessionExpiresAt:new Date(Date.now()+86400000).toISOString(),incomplete:false,downloads:{available:false}});
 requests[0].resolve(summary(false));await tick();assert.equal(renders.length,0);assert.equal(clears.at(-1),get('partnerships'));
 get('refresh').listeners.click();requests.at(-1).resolve(summary(true));await tick();assert.equal(renders.length,1);assert.equal(renders[0].container,get('partnerships'));assert.equal(renders[0].locale,'cs');
 get('language').listeners.click();assert.equal(renders.at(-1).locale,'en');
 windowListeners.offline();assert.equal(clears.at(-1),get('partnerships'));assert.equal(get('dashboard').hidden,true);
 context.navigator.onLine=true;windowListeners.online();requests.at(-1).resolve(summary(true));await tick();const before=clears.length;get('refresh').listeners.click();requests.at(-1).resolve({},401);await tick();assert.ok(clears.length>before);assert.equal(get('dashboard').hidden,true);
 documentListeners['vcode:inbox-auth-expired']();assert.equal(clears.at(-1),get('partnerships'));
 get('logout').listeners.click();assert.equal(clears.at(-1),get('partnerships'));assert.equal(requests.at(-1).url,'/prehled/api/logout');requests.at(-1).resolve({ok:true});await tick();
});
