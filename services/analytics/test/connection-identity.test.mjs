import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionForSite,monitorIdentity} from '../connection-identity.mjs';
const first={id:'first',domain:'shared.example',trackerPath:'/one/tracker.js',collectorPath:'/one/events'};
const second={id:'second',domain:'shared.example',trackerPath:'/two/tracker.js',collectorPath:'/two/events'};

test('same-host applications keep independent monitor identities and connectivity',()=>{
  assert.notDeepEqual(monitorIdentity(first),monitorIdentity(second));
  const statuses=[{...monitorIdentity(first),connected:true},{...monitorIdentity(second),connected:false}];
  assert.equal(connectionForSite(first,[first,second],statuses).connected,true);
  assert.equal(connectionForSite(second,[first,second],statuses).connected,false);
});

test('legacy domain result is accepted only for a unique registered hostname',()=>{
  const old={domain:'shared.example',connected:true};
  assert.equal(connectionForSite(first,[first],[old]),old);
  assert.equal(connectionForSite(first,[first,second],[old]),null);
  assert.equal(connectionForSite(second,[first,second],[old]),null);
});

test('stale identity from a changed host or collector is not reused',()=>{
  assert.equal(connectionForSite(first,[first,second],[{...monitorIdentity(first),domain:'other.example',connected:true}]),null);
  assert.equal(connectionForSite(first,[first,second],[{...monitorIdentity(first),collectorPath:'/old/events',connected:true}]),null);
});
