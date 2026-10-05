# Expanded metric integration, v2

The owner approved the intent to add traffic sources and click counts in VCode on 2026-10-04. The concrete CS/EN privacy replacement in analytics-expanded-metrics-review.md (6dc4dd3) was explicitly approved with activation by the owner. Publication and collection now require per-site migration acceptance. Existing v1 pageviews continue unchanged.

The prepared `/v2/tracker.js` and `/v2/events` collector routes coexist with v1. Each site must migrate its same-origin proxy and bridge together, pin the v2 runtime SHA384, preserve exact public route normalization and session exclusions, and identify the runtime as `vcode-public-v2`. Configuration adds `captureSources` and an explicit `allowedEvents` subset of `app-store-click`, `contact-click`, `outbound-click`. Both automatic flags remain false. The application calls `pageview(canonicalPath)` and `event(name,canonicalPath)` only on permitted public routes. Contact and outbound clicks carry no target URL, address or link text.

Source classification maps the initial document referrer to a fixed public-service enum: google, seznam, bing, duckduckgo, facebook, instagram, linkedin, openai, claude, perplexity. Original addresses and parameters never leave the browser. Unknown/private sources are unspecified. The server derives a canonical public service referrer for Umami from the enum. Neither generic arbitrary referrers nor automatic document-wide click capture are supported.

Private registry entries additionally require `metricsApprovedAt` before expanded events are accepted, plus captureSources and allowedEvents matching the approved site configuration. Dashboard source and event capabilities are derived from these fields. A migrated site's ordinary release must preserve the reviewed notice, runtime version/SRI, route restrictions and privacy guards. Monitor checks support both runtime versions. The preparation stage preserved v1 registry entries. Production migration status is recorded below.

Acceptance requires isolated test website storage, source normalization and explicit click counts, rejection of raw URLs, sensitive properties, unknown sources/events/private paths, and zero collection for DNT/GPC/offline/authenticated routes. Test data must not increase real visitor statistics. Preserve private registry file bind-mount identity when applying changes.

## Prepared service verification — 2026-10-04

Checks, 37 tests and the 122-page static build passed. Web, blog, worker and analytics dashboard/collector/monitor images were built. Prepared services were deployed with existing v1 site collection preserved; the dashboard is healthy and public/authenticated smoke checks passed. An isolated temporary Umami website verified one source-bearing pageview and one contact click through the new internal collector route. Raw referral URLs, private paths and unknown events were rejected; DNT/GPC did not add records. The temporary website was removed and the original registry restored. No actual visitor counts were modified by this test. Per-application preparation was dispatched for all five public-v1 websites; expanded collection remains pending the concrete notice review and migration acceptance.


## Production frontend deployment — 2026-10-04

The concrete CS/EN text and activation were approved in owner record a56b160 for content 6dc4dd3. The public v2 proxy pair was installed for all five domains while preserving v1, private keys, trusted client-IP override, stripped incoming headers/query, 2 KiB body limit and disabled edge request logging. Nginx configuration validation passed before reload. All five public proxies passed isolated source/click ingestion, foreign-origin/private-path/unknown-property rejection and DNT/GPC suppression; temporary Umami websites were removed and real visitor counts were not inflated.

| Public website | Deployed frontend | Supported explicit clicks |
| --- | --- | --- |
| Masáže | 729d22bf5259b833f3160bb2887be3b5bf172106 | contact-click, outbound-click |
| Studio Balance | 68fa497 | outbound-click |
| Kalorické tabulky | 887d346 | contact-click |
| COP | a607666 / image 6c86f8a2d88513b871dde5c28f944af7faf164b66e3d27ae9a3b8e12e3d66d00 | none; only entry sources |
| Městem hrou | own-domain frontend v88 / image 90b81d89839889a6ae7079487792183ba383942496d502e049da7eea3ee36a87 | outbound-click |

Each application preserves its exact original public path categories, session/DNT/GPC/offline exclusions and pins shared runtime sha384-4mn0sN5UeFuzSjaXlbulwbJz7N38PPOovouC9Xp3OHD0r94YKgx8B2RAk/nK6mg0. Release guards and repository instructions preserve this integration. COP has no eligible public click link; no artificial click metric was added. VCode keeps its reviewed legacy sources/App Store/contact integration.

Dashboard source 420a74a is deployed as image sha256:e23fd9a0830ed52a13b005c40457fb6ffe7b8bca41a2f7ad142d3730f1ce2fca. Both public image builds and the dashboard build passed. Check, all 37 tests and the 122-page static build passed; the initial sandbox-only test run could not bind localhost and passed after granting the required local-port permission. Metric units and the collection start date are displayed explicitly. PWA cache v5 never stores private statistics or authenticated navigation.


## Completed central activation and acceptance — 2026-10-04

All six registered websites have pageview collection enabled. All five additional websites now use vcode-public-v2 with captureSources=true and exactly the event subsets above. VCode keeps its existing reviewed legacy integration. Registry updates preserved file inode, original approvals/pageview start dates, identifiers, private edge keys and exact public path allowlists; private backups precede each change.

Masáže, Studio Balance, Kalorie and COP passed full exact approved CS/EN paragraph verification in production HTML before activation. Městem hrou's SPA paragraphs were independently matched against the rendered production CS/EN text captured with collector blocking (CS SHA256 5bd46f527a79cc496962501321bed4b1b456d68aad0a7a04e64f1cda8ed414d2; EN 937a75024cda6639580028614f6984e661dd04b31cb0d0adadf74fc5c39e9fc8). Its privacy view is excluded from collection. Tracker bytes matched the shared SRI before every activation. Městem hrou expanded collection started at 2026-10-04T18:48:08.179766+00:00.

The final authenticated production summary verified all six sites available with daily series, collection enabled, traffic-source capability active and the exact approved event lists. Every v2 site has an expanded collection start timestamp and a successful connection check newer than activation. Monitor restart refreshed all five connections. Anonymous access returned401, foreign-origin login403, authorized secure-cookie login and logout revocation passed. Health, both locales, representative product/help/blog/privacy routes and all five PWA assets returned200. No original referral URLs, target addresses, identities or private values were exposed in test output; acceptance did not fabricate real visitor records. Earlier pending states above describe preparation and are superseded by this entry. Uncollected historical sources/clicks cannot be reconstructed.

Application validations: Masáže132tests; Studio91tests; Kalorie553unit/44browser scenarios; COP36bridge/release tests plus451verified artifact files; Městem hrou861tests and container/browser checks. The deployment retained each application's private exclusions and ordinary release guards. Native apps and private STRATOS/AKB remain excluded.


Subsequent COP release: its owner-authorized static SEO deployment uses source 26a10485cc75aec1448bf1a8bfebba4ee9a8f179 and image 27ac815207d0130a2b434aa8142d789bfa39e66c6c847e69e9a93d9d2ead9908. COP's handoff confirmed the original a607666 compiled JavaScript/assets, v2 configuration, empty event allowlist, SRI and notice are preserved byte-for-byte; API/SIM/configuration unchanged. This supersedes only the currently running COP web image identity in the table above; analytics deployment/acceptance remains valid. The added static landing has no analytics script and does not expand the approved route allowlist.

## TikTok revision — 5 October 2026

The owner approved adding only the TikTok service category. The original v2 runtime and SRI remain immutable for existing clients. The collector also provides `/v2/tracker-tiktok.js`; applications may vendor its exact bytes as a versioned static asset and pin `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5`. This permits coordinated gradual rollout without a privileged edge change. Event routes, exact public allowlists, private-session suppression and prior approvals remain unchanged.

Server enum support is deployed; TikTok becomes only the canonical public `https://tiktok.com/` source. Runtime tests reject lookalike domains, omit profile/video/query/fragment information and suppress DNT/GPC/offline collection. Collector production checks confirmed both immutable SRI values, DNT/GPC 204 suppression and raw-source 400 rejection for all five integrations without storing accepted test visits. VCode's existing legacy source collection already supports TikTok origins; the dashboard revision displays these as TikTok. Per-site frontend rollout is coordinated in the existing application chats and production registry is updated only after deployed asset and bridge verification.

Central validation: `pnpm check`, all 42 tests and `pnpm build` passed. Both required public image types and analytics images built. Public collector image `sha256:aa34a5861c15217830c96ee571f965e33f49ee4ef58250881629b551350096d9` and dashboard image `sha256:8cf89811e3a2e50d68196ad513e70817fbe1be8c5a52ea3eba719de946527324` are deployed. Public health, both locales/products/guides/blogs and dashboard/PWA assets returned 200; deployed dashboard and service worker matched source byte-for-byte. PWA shell cache is v7; remembered-session storage remains preserved.
