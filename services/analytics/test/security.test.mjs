import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeEvent,sameOrigin} from '../security.mjs';
const sites=[{id:'public-id',domain:'vcode.zeleznalady.cz'}];
test('only known public sites and event names can be collected',()=>{
 assert.throws(()=>sanitizeEvent({website:'unknown',name:'pageview',url:'/'},sites));
 assert.throws(()=>sanitizeEvent({website:'public-id',name:'comment-text',url:'/'},sites));
 assert.throws(()=>sanitizeEvent({website:'public-id',name:'pageview',url:'/prehled/'},sites));
 assert.throws(()=>sanitizeEvent({website:'public-id',name:'pageview',url:'/blog/review/private-token'},sites));
 assert.throws(()=>sanitizeEvent({website:'public-id',name:'pageview',url:'https://evil.example/'},sites));
});
test('query secrets, fragments and referrer paths never enter analytics',()=>{
 const event=sanitizeEvent({website:'public-id',name:'pageview',url:'https://vcode.zeleznalady.cz/blog/test/?token=secret&utm_source=newsletter#private',referrer:'https://example.com/private?email=someone'},sites);
 assert.equal(event.payload.url,'https://vcode.zeleznalady.cz/blog/test/?utm_source=newsletter');
 assert.equal(event.payload.referrer,'https://example.com');
 assert.equal(event.payload.name,undefined);
});
test('state-changing dashboard requests require the exact configured origin',()=>{
 assert.equal(sameOrigin({headers:{origin:'https://evil.example'}},'https://vcode.zeleznalady.cz'),false);
 assert.equal(sameOrigin({headers:{}},'https://vcode.zeleznalady.cz'),false);
 assert.equal(sameOrigin({headers:{origin:'https://vcode.zeleznalady.cz'}},'https://vcode.zeleznalady.cz'),true);
});
