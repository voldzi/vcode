export const TOMATO_CLICK_PATHS=Object.freeze(['/aplikace/rajcatova-sklizen/','/en/apps/rajcatova-sklizen/']);
export const TOMATO_NOTICE_VERSION='tomato-play-2026-10-15';
const legacy=Object.freeze(['app-store-click','contact-click','collaboration-click']);
export function tomatoClicksEnabled(site){
 const p=site?.tomatoPlayClicks;
 return Boolean(site?.domain==='vcode.zeleznalady.cz'&&site.id==='e155b7ef-28c5-4787-96cb-53777ecf693c'&&site.collectionEnabled!==false&&p?.enabled===true&&p.noticeVersion===TOMATO_NOTICE_VERSION&&typeof p.collectionStartedAt==='string'&&Number.isFinite(Date.parse(p.collectionStartedAt))&&typeof p.approvedAt==='string'&&Number.isFinite(Date.parse(p.approvedAt))&&typeof p.publishedAt==='string'&&Number.isFinite(Date.parse(p.publishedAt))&&typeof p.noticeCsSHA256==='string'&&/^[a-f0-9]{64}$/.test(p.noticeCsSHA256)&&typeof p.noticeEnSHA256==='string'&&/^[a-f0-9]{64}$/.test(p.noticeEnSHA256)&&JSON.stringify(p.paths)===JSON.stringify(TOMATO_CLICK_PATHS));
}
export function legacyEventCapabilities(site){return tomatoClicksEnabled(site)?[...legacy,'outbound-click']:[...legacy];}
