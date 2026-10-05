import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('30-day browser expiry schedules bounded timers instead of overflowing and signing out immediately',async()=>{
 const script=await readFile(new URL('../dashboard.js',import.meta.url),'utf8');
 const source=script.slice(script.indexOf('function scheduleExpiry('),script.indexOf('async function load('));
 let now=0,queued,cleared=false;const delays=[];
 const context={Date:{now:()=>now},clear:()=>cleared=true,status:()=>{},t:x=>x,setTimeout:(fn,delay)=>{queued=fn;delays.push(delay);}};
 vm.runInNewContext(source,context);context.scheduleExpiry(30*86400000);
 assert.equal(cleared,false);assert.equal(delays[0],86400000);
 now=29*86400000;queued();assert.equal(cleared,false);assert.equal(delays.at(-1),86400000);
 now=30*86400000;queued();assert.equal(cleared,true);
});
