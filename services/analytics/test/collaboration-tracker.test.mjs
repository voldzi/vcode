import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source = readFileSync(new URL('../tracker.js', import.meta.url), 'utf8');
function tracker(navigator = {}, pathname = '/spoluprace/', searchAndHash = '', referrer = '') {
  const events = [], listeners = {};
  const context = {navigator, location: {pathname, href: 'https://vcode.zeleznalady.cz' + pathname + searchAndHash},
    document: {referrer, addEventListener: (event, handler) => {listeners[event] = handler;}}, URL,
    fetch: async (url, options) => {events.push({url, options, payload: JSON.parse(options.body)});}};
  runInNewContext(source, context);
  return {events, click: (href, marked = false) => listeners.click?.({target: {closest: () => ({href, hasAttribute: () => marked})}})};
}
test('marked collaboration links emit a count without target, form values or selection', () => {
  const {events, click} = tracker();
  click('https://vcode.zeleznalady.cz/spoluprace/#poptavka', true);
  click('https://vcode.zeleznalady.cz/aplikace/myslopis/');
  assert.deepEqual(events.map(event => event.payload.name), ['pageview', 'collaboration-click']);
  const event = events[1];
  assert.deepEqual(Object.keys(event.payload).sort(), ['name','referrer','url','website']);
  assert.equal(event.payload.url, 'https://vcode.zeleznalady.cz/spoluprace/');
  assert.equal(event.options.credentials, 'omit');
  assert.equal(event.options.referrerPolicy, 'no-referrer');
});
test('collaboration metrics retain DNT, GPC and private dashboard exclusions', () => {
  for (const [navigator, path] of [[{doNotTrack:'1'},'/spoluprace/'],[{globalPrivacyControl:true},'/en/work-with-us/'],[{},'/prehled/']]) {
    const {events, click} = tracker(navigator, path);
    click('https://vcode.zeleznalady.cz/spoluprace/', true);
    assert.equal(events.length, 0);
  }
});
test('unmarked mailbox and App Store links preserve their established counters', () => {
  const {events, click} = tracker();
  click('mailto:podpora@zeleznalady.cz?subject=Collaboration');
  click('https://apps.apple.com/app/id1336678493');
  assert.deepEqual(events.map(event => event.payload.name), ['pageview','contact-click','app-store-click']);
});
test('analytics requests strip prefill, personal query fields and fragments before transmission while retaining approved campaign/source counts', () => {
  for (const path of ['/spoluprace/','/en/work-with-us/']) {
    const {events, click} = tracker({}, path, '?app=mestem-hrou&area=partnership&email=synthetic%40example.invalid&message=private-text&utm_source=game&utm_medium=web&utm_campaign=partnership&utm_content=excluded#poptavka', 'https://mestemhrou.cz/private?email=synthetic@example.invalid#private');
    click('https://apps.apple.com/app/id1336678493');
    assert.equal(events.length, 2);
    for (const event of events) {
      assert.equal(event.payload.url, 'https://vcode.zeleznalady.cz' + path + '?utm_source=game&utm_medium=web&utm_campaign=partnership');
      assert.equal(event.payload.referrer, 'https://mestemhrou.cz');
      assert.equal(event.options.referrerPolicy, 'no-referrer');
      assert.ok(!/mestem-hrou|private-text|synthetic|poptavka|utm_content/.test(event.options.body));
    }
  }
  for (const referrer of ['https://synthetic:secret@example.invalid/private','http://example.invalid/private','not-a-url']) {
    const {events}=tracker({},'/spoluprace/','?utm_source=synthetic%40example.invalid#secret',referrer);
    assert.equal(events[0].payload.url,'https://vcode.zeleznalady.cz/spoluprace/');assert.equal(events[0].payload.referrer,'');
  }
});
