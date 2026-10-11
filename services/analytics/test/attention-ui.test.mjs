import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const script=await readFile(new URL('../dashboard.js',import.meta.url),'utf8');
const source=script.slice(script.indexOf('let attention='),script.indexOf('function initWorkspace('));
function fixture(){
 const elements=new Map(),requests=[],badges=[],timers=new Map();let next=0,expired=false;
 const context={Number,Object,String,$:id=>{if(!elements.has(id))elements.set(id,{hidden:true,textContent:'',setAttribute(key,value){this[key]=value;}});return elements.get(id);},t:key=>key,format:String,data:{},navigator:{onLine:true},document:{visibilityState:'visible'},window:{VCodeNotifications:{setBadge:value=>badges.push(value)}},request:path=>new Promise((resolve,reject)=>requests.push({path,resolve,reject})),setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),status:()=>{},clear:()=>{expired=true;context.data=null;context.clearAttention();}};
 vm.runInNewContext(source,context);
 return{context,elements,requests,badges,timers,get expired(){return expired;}};
}
const result=(a,b)=>({inquiries:{available:true,count:a},partnerships:{available:true,count:b}});
test('global badge counts come only from attention, never date, website or filtered inbox summaries',async()=>{
 const f=fixture();f.context.data={sites:[],days:90,partnerships:{summary:{new:0}}};
 const pending=f.context.refreshAttention();assert.equal(f.requests[0].path,'attention');f.requests[0].resolve(result(3,7));await pending;
 assert.equal(f.elements.get('inquiries-badge').textContent,'3');assert.equal(f.elements.get('partnerships-badge').textContent,'7');assert.equal(f.badges.at(-1),10);
 assert.match(f.elements.get('partnerships-navigation')['aria-label'],/newPartnerships: 7/);
 const updated=f.context.refreshAttention();f.requests[1].resolve(result(0,1));await updated;assert.equal(f.elements.get('inquiries-badge').hidden,true);assert.equal(f.badges.at(-1),1);
});
test('unavailable sections clear old counts and badge totals without inventing zero',async()=>{
 const f=fixture();let pending=f.context.refreshAttention();f.requests[0].resolve(result(5,2));await pending;
 pending=f.context.refreshAttention();f.requests[1].resolve({inquiries:{available:false,count:null},partnerships:{available:true,count:4}});await pending;
 assert.equal(f.elements.get('inquiries-badge').hidden,true);assert.equal(f.elements.get('inquiries-badge').textContent,'');assert.equal(f.elements.get('partnerships-badge').textContent,'4');assert.equal(f.badges.at(-1),0);
 pending=f.context.refreshAttention();f.requests[2].reject({status:503});await pending;assert.equal(f.elements.get('partnerships-badge').hidden,true);assert.equal(f.badges.at(-1),0);
});
test('logout discards an in-flight response; rejected authorization clears all private attention',async()=>{
 const f=fixture();let pending=f.context.refreshAttention();f.context.clear();f.requests[0].resolve(result(8,9));await pending;assert.equal(f.badges.at(-1),0);assert.equal(f.timers.size,0);assert.equal(f.elements.get('inquiries-badge').hidden,true);
 f.context.data={};pending=f.context.refreshAttention();f.requests[1].reject({status:401});await pending;assert.equal(f.expired,true);assert.equal(f.context.data,null);assert.equal(f.timers.size,0);
});
test('a stale request cannot overwrite a newer count and no background timer is scheduled while hidden',async()=>{
 const f=fixture();const old=f.context.refreshAttention(),fresh=f.context.refreshAttention();f.requests[1].resolve(result(1,0));await fresh;f.requests[0].resolve(result(20,30));await old;assert.equal(f.badges.at(-1),1);
 f.context.document.visibilityState='hidden';const pending=f.context.refreshAttention();f.requests[2].resolve(result(0,0));await pending;assert.equal(f.timers.size,0);assert.equal(f.elements.get('inquiries-badge').hidden,true);
});
test('owner rejection removes private inboxes and malformed counts never become badges',async()=>{
 const f=fixture(),cleared=[];f.context.window.VCodeContactInbox={clear:()=>cleared.push('inquiries')};f.context.window.VCodePartnershipInbox={clear:()=>cleared.push('partnerships')};f.context.window.VCodeNotifications.clear=()=>cleared.push('notifications');
 let pending=f.context.refreshAttention();f.requests[0].resolve(result(-1,1.5));await pending;assert.equal(f.elements.get('inquiries-badge').hidden,true);assert.equal(f.elements.get('partnerships-badge').hidden,true);
 pending=f.context.refreshAttention();f.requests[1].reject({status:403});await pending;assert.deepEqual(cleared,['inquiries','partnerships','notifications']);assert.equal(f.badges.at(-1),0);
});
