import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const script=await readFile(new URL('../dashboard.js',import.meta.url),'utf8');
const source=script.slice(script.indexOf('function initSectionNavigation('),script.indexOf('function scheduleExpiry('));
function fixture(hash='#inquiries'){
 const events={},navEvents={},frames=new Map(),calls=[];let next=0,observing=false,mutation;
 const heading={focus:options=>calls.push(['focus',options]),tabIndex:0};
 const dashboard={hidden:true,querySelectorAll:()=>busy};let busy=[];
 const target={hidden:true,closest:()=>target.hidden||dashboard.hidden?{}:null,querySelector:()=>heading,scrollIntoView:options=>calls.push(['scroll',options])};
 const nodes={dashboard,'dashboard-navigation':{addEventListener:(name,fn)=>navEvents[name]=fn},inquiries:target,partnerships:target,overview:target};
 const context={$:id=>nodes[id],location:{hash},document:{body:{dataset:{authenticated:'false'}}},window:{addEventListener:(name,fn)=>events[name]=fn},Node:{DOCUMENT_POSITION_FOLLOWING:4},MutationObserver:class{constructor(fn){mutation=fn;}observe(){observing=true;}disconnect(){observing=false;}},requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(source,context);context.initSectionNavigation();
 const flush=()=>{const list=[...frames.values()];frames.clear();list.forEach(fn=>fn());};
 const changed=()=>{if(observing)mutation();flush();};
 return{context,events,navEvents,dashboard,target,heading,calls,flush,changed,setBusy:list=>busy=list,get observing(){return observing;},ready(){dashboard.hidden=false;target.hidden=false;context.document.body.dataset.authenticated='true';changed();}};
}
test('Telegram section waits through login and async inbox rendering, then scrolls and focuses exactly once',()=>{
 const f=fixture();f.flush();assert.equal(f.calls.length,0);assert.equal(f.observing,true);
 f.setBusy([f.target]);f.ready();assert.equal(f.calls.length,0);
 f.setBusy([]);f.changed();assert.equal(f.calls[0][0],'scroll');assert.equal(f.calls[1][0],'focus');assert.equal(f.heading.tabIndex,-1);assert.equal(f.observing,false);
 f.changed();assert.equal(f.calls.length,2,'refresh must not move the user back');
});
test('same-section navigation, history and BFCache reopen the destination',()=>{
 const f=fixture();f.ready();f.calls.length=0;
 let prevented=false;f.navEvents.click({target:{closest:()=>({hash:'#inquiries'})},preventDefault:()=>prevented=true});f.flush();assert.equal(prevented,true);assert.equal(f.calls.length,2);
 f.calls.length=0;f.context.location.hash='#partnerships';f.events.hashchange();f.flush();assert.equal(f.calls.length,2);
 f.calls.length=0;f.events.pageshow({persisted:true});f.flush();assert.equal(f.calls.length,2);
});
test('hidden or forbidden inbox does not receive focus; manual scrolling cancels an outstanding jump',()=>{
 const f=fixture();f.dashboard.hidden=false;f.context.document.body.dataset.authenticated='true';f.changed();assert.equal(f.calls.length,0);
 f.events.touchmove();f.ready();assert.equal(f.calls.length,0);
 const invalid=fixture('#%E0%A4%A');invalid.ready();assert.equal(invalid.calls.length,0);assert.equal(invalid.observing,false);
 const privateTarget=fixture('#login-form');privateTarget.ready();assert.equal(privateTarget.calls.length,0);
});
test('partnership jump waits for earlier inbox layout but not later sections',()=>{
 const f=fixture('#partnerships');const earlier={compareDocumentPosition:()=>4},later={compareDocumentPosition:()=>2};
 f.setBusy([earlier]);f.ready();assert.equal(f.calls.length,0);
 f.setBusy([later]);f.changed();assert.equal(f.calls.length,2);
});
