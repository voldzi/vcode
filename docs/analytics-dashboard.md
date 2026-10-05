# Private VCode dashboard

The bilingual dashboard at `/prehled/` presents authorized public website aggregates from self-hosted Umami. It supports 7/30/90-day rolling windows, a website filter, daily page-view charts with pointer and keyboard readouts and an alternative values table, previous-period comparisons, website ranking, connection status, page/source/event details and CSV download. Refresh is manual. Light/dark appearance and language are the only persistent browser preferences.

## Definitions and provenance

The server uses Umami 3.4's website stats (`compare=prev`), daily pageviews (`unit=day`, `timezone=Europe/Prague`) and metrics endpoints. See [pageviews](https://docs.umami.is/docs/api-reference/get-website-pageviews) and [stats](https://docs.umami.is/docs/api-reference/get-website-stats). Windows and comparisons have equal elapsed duration. The first and last daily buckets may be partial. Bucket stamps use their date component as returned by Umami. Days before recorded collection start are null; website registration is the conservative fallback when no collection timestamp exists. Registration alone does not establish active tracking.

Visitor estimates are summed across websites and are not deduplicated people. Clicks are interest signals, not installations. New public-v1 integrations do not collect referrers or click events; these fields say "not measured" rather than zero. Unavailable upstream responses produce null statistics and a partial-data warning. Disabled websites may show historical records, accompanied by an explicit disabled status. Permission filtering excludes inaccessible websites and test-only registrations. Details are bounded to 200 paths and 10 referrers/events; displayed lists show ten entries.

## PWA and privacy

The manifest has a dedicated application scope, standalone display and brand icons. Installation uses the browser prompt where supported and instructions for Safari otherwise. The service worker caches only five public shell resources: the generic offline page, stylesheet, script and two icons. API requests, POSTs and live HTML navigation are never cached. No passwords, upstream tokens, analytics responses or visitor records are written to offline browser storage. Authentication uses a protected HttpOnly cookie. Offline, logout, expiry and page exit clear rendered private data. Offline navigation displays a generic connection notice. Future shell changes must bump the service worker cache version; updates require the visible update action.

The authenticated API remains network-only and no-store; upstream tokens remain server-side. Existing privacy content and collection approvals are unchanged. Private applications remain outside measurement scope. The dashboard container has an independent health check.

## Acceptance

Use synthetic data for chart calculations, filters, unavailable/disabled states, responsive rendering and keyboard interaction. Run the project checks, tests and static build. Security tests verify authentication, origin checks, cookie protection, token isolation, revocation and the service worker cache allowlist. Browser checks include Czech/English, themes, a 390px viewport and 200% text zoom. Production checks verify authentication and aggregate response shape without retaining visitor records, together with public health and representative bilingual routes.

### Release verification — 2026-10-04

`pnpm check`, `pnpm test` (27 blog + 8 analytics tests) and `pnpm build` (122 static pages) passed. Browser verification covered bilingual filters, dark/light appearance, keyboard chart readouts, the 390px viewport and 200% text without horizontal overflow. The synthetic preview contained a visible test-data label. All three public application images and the dashboard image were built; the dashboard service was replaced and reported healthy. Public portfolio/blog containers remained healthy.

Production verification confirmed anonymous 401, cross-origin login 403, authorized login with a protected session cookie, six authorized website summaries with daily series and no incomplete upstream responses, logout revocation, both locale health/product/guide/blog checks and all PWA assets. The production login and install instructions rendered without browser errors. Installation onto a physical phone was not part of this verification.

Dashboard image: `sha256:6e55978b98967e79d54bd82f71feaac6fca033ce0d953bd82ab92390939cb5e5`.

### Metric scope clarification — 2026-10-04

All six public websites have active page-view collection. Details show source and event panels only when the selected site's approved integration supports them. Otherwise a single explicit notice explains that traffic is collected while sources and clicks are outside scope. Application-interest panels appear only when matching portfolio paths exist. A site without click collection has no misleading empty App Store summary card. This changes presentation only, with no expanded tracking or new privacy terms.

### Detail units verified against Umami 3.4.0

The ranked path and referrer rows from this deployed version count distinct daily session identifiers (visitor estimates), rather than raw pageviews. Custom event rows count events. The UI labels these units explicitly; application rows sum estimates across matching paths and are not deduplicated people. Timeline, totals and website ranking continue to use pageview statistics. Definitions verified in official source [page metrics](https://github.com/umami-software/umami/blob/v3.4.0/src/queries/sql/pageviews/getPageviewMetrics.ts) and [event metrics](https://github.com/umami-software/umami/blob/v3.4.0/src/queries/sql/events/getEventMetrics.ts). Isolated public v2 acceptance on all five proxy pairs confirmed source and click storage, edge header override and privacy rejection, without adding real visitor records.


## Final expanded metrics acceptance — 2026-10-04

Source `420a74a` / image e23fd9a0830ed52a13b005c40457fb6ffe7b8bca41a2f7ad142d3730f1ce2fca is deployed; browser script `20261004-5` and PWA cache v5. The detail displays the expanded metric start date, uses accurate per-row units and shows only supported sections. A synthetic browser preview verified sources, explicit click rows and the absence of irrelevant application-interest rows. Final authenticated production smoke confirmed six active/available sites, exact source/event capabilities, successful connections newer than their v2 activations, login/logout and public/PWA health. The common owner-approved expanded scope is operational on all five additional public websites; COP intentionally has no click metric.

## Remembered devices — 2026-10-05

The owner authorized a longer optional sign-in for personal phones/computers. The unchecked default retains the one-hour absolute lifetime. Selecting “Remember this device for 30 days” issues a Secure, HttpOnly, SameSite=Strict opaque cookie with a fixed 30-day expiry; activity does not extend it. Sign-out revokes the session immediately and durably. Reauthentication replaces the previous browser session.

Only remembered sessions survive dashboard restarts. Server-side upstream tokens are encrypted with AES-256-GCM in a dedicated private Docker volume; session lookup identifiers are SHA-256 hashes. The key and encrypted file have mode 0600 in a 0700 directory. Passwords are never persisted, tokens never reach the browser, and API responses remain network-only/no-store. Corrupt storage prevents startup instead of bypassing authentication. Normal upstream authorization and password-change invalidation still apply. Expired entries are pruned. Losing the private volume requires signing in again.

PWA shell v6 updates the bilingual login instructions. Installing the PWA can require an initial sign-in in its separate browser context. Physical-phone installation remains a user acceptance step.

### Mobile presentation and release acceptance

The updated header, blue/violet/teal metric cards, area chart, animated rankings and per-site sparklines use the existing data and preserve missing series gaps. Entry/reveal animations are brief and disabled with prefers-reduced-motion; there is no background animation or extra collection. Charts retain keyboard readouts and the values table.

Project validation passed: check (zero errors/warnings), 40 tests (27 blog + 13 analytics) and 122-page build. Browser checks used explicitly synthetic data: 390px, both themes/locales, keyboard chart navigation and actual 32px root text (200%) without horizontal overflow; reduced motion disabled animations. The preview overrides were restored.

All web/blog/worker/dashboard images built; only the dashboard service was recreated. Production image `sha256:39484f2ba2f69c040be35f1646127bf6872e884fc0500a219459e70802d3fc0d` passed five isolated HTTP/session/PWA tests inside a network-isolated container. These included remembered login across server restart, durable logout, expiry, encryption integrity and the 30-day browser timer overflow regression. Production was healthy, private volume directory/key permissions were 0700/0600, dashboard assets matched reviewed source, anonymous summary was 401 and cross-origin login 403. Public health/locales/product/guide/blog/tracker/PWA routes returned 200. No genuine visitor records were used for acceptance.

The initial deployment attempt omitted the existing private Compose environment file and stopped before replacing the service. The corrected deployment used the existing operator-provided configuration without changing its secrets. Rollback source/image were retained in the private release archive. A one-time sign-in is needed after this deployment because the previous sessions were memory-only.
