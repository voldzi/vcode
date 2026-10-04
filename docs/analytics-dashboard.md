# Private VCode dashboard

The bilingual dashboard at `/prehled/` presents authorized public website aggregates from self-hosted Umami. It supports 7/30/90-day rolling windows, a website filter, daily page-view charts with pointer and keyboard readouts and an alternative values table, previous-period comparisons, website ranking, connection status, page/source/event details and CSV download. Refresh is manual. Light/dark appearance and language are the only persistent browser preferences.

## Definitions and provenance

The server uses Umami 3.4's website stats (`compare=prev`), daily pageviews (`unit=day`, `timezone=Europe/Prague`) and metrics endpoints. See [pageviews](https://docs.umami.is/docs/api-reference/get-website-pageviews) and [stats](https://docs.umami.is/docs/api-reference/get-website-stats). Windows and comparisons have equal elapsed duration. The first and last daily buckets may be partial. Bucket stamps use their date component as returned by Umami. Days before recorded collection start are null; website registration is the conservative fallback when no collection timestamp exists. Registration alone does not establish active tracking.

Visitor estimates are summed across websites and are not deduplicated people. Clicks are interest signals, not installations. New public-v1 integrations do not collect referrers or click events; these fields say "not measured" rather than zero. Unavailable upstream responses produce null statistics and a partial-data warning. Disabled websites may show historical records, accompanied by an explicit disabled status. Permission filtering excludes inaccessible websites and test-only registrations. Details are bounded to 200 paths and 10 referrers/events; displayed lists show ten entries.

## PWA and privacy

The manifest has a dedicated application scope, standalone display and brand icons. Installation uses the browser prompt where supported and instructions for Safari otherwise. The service worker caches only five public shell resources: the generic offline page, stylesheet, script and two icons. API requests, POSTs and live HTML navigation are never cached. No credentials, analytics responses or visitor records are written to browser storage. Offline, logout, expiry and page exit clear rendered private data. Offline navigation displays a generic connection notice. Future shell changes must bump the service worker cache version; updates require the visible update action.

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
