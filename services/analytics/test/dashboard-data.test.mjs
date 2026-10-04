import test from 'node:test';
import assert from 'node:assert/strict';
import {periodWindow,dailySeries,dateKey} from '../dashboard-data.mjs';
test('daily buckets preserve Prague dates across DST and distinguish missing coverage from zero',()=>{
 const window=periodWindow(7,Date.parse('2026-03-30T04:20:00Z'));
 const series=dailySeries({pageviews:[{x:'2026-03-29T00:00:00Z',y:4},{x:'2026-03-29T00:00:00Z',y:3},{x:'2026-03-29T00:00:00Z',y:-1}]},window,'2026-03-27T06:00:00Z');
 assert.equal(series.length,8);assert.equal(series[0].pageviews,null);assert.equal(series.find(p=>p.date==='2026-03-28').pageviews,0);assert.equal(series.find(p=>p.date==='2026-03-29').pageviews,7);assert.equal(window.endAt-window.startAt,7*86400000);assert.equal(dateKey(Date.parse('2026-03-29T23:00:00Z')),'2026-03-30');assert.throws(()=>periodWindow(8),{status:400});
});
