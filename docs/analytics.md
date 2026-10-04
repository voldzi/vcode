# Private portfolio metrics

The static public portfolio remains independent of the analytics service. `/prehled/` provides a bilingual login and a read-only cross-site dashboard with charts, filters and an installable PWA. `/prehled/api/*` is served by the isolated dashboard service, not the blog service. The dashboard uses the official Umami 3.4.0 API and its native password authentication; no Umami token reaches the browser. Analytics database access remains inside the private container network.

## Protection

- One-hour server-side sessions with random opaque cookies, HttpOnly, Secure and SameSite=Strict.
- Same-origin checks on login/logout, bounded request bodies and login rate limiting.
- Every metrics request checks the current Umami website permissions. A site registry does not grant access.
- No public share links, arbitrary upstream URLs, browser database access or admin API proxy.
- No index/follow and no cache for private pages and responses. Login shell is public; metrics require authentication.
- Restart invalidates sessions. Account credentials and site registry stay in private operations configuration.

## Collection

Collection is disabled by default and requires the product owner's reviewed privacy notice. The tracker is a no-op while disabled. Public website pageviews and App Store/contact clicks are accepted only for registered domains and known paths. Only safe campaign labels survive URL filtering. Referrers retain only the origin; fragments, other URL parameters and arbitrary properties are discarded. Do Not Track and GPC suppress tracking. No session replay, identified users, comments, forms or private application activity are collected. Umami uses a daily rotating anonymous session identifier; estimated visitors are not exact counts of people.

Only the trusted edge may provide the incoming client address. The web proxy sends its existing edge-supplied forwarding header to the dashboard, which takes the final address. Deployment must verify that the edge appends or overwrites this header and does not accept an arbitrary client identity. Collection routes do not create access logs in the VCode web container.

Umami and PostgreSQL are independent from the blog. Telemetry and external network calls by Umami are disabled. The retention service deletes analytical events and sessions older than 170 days every day, leaving room for daily deletion and the seven-day backup rotation within the approved 180-day maximum. Session replay is disabled on registered websites and the public collector cannot submit replay payloads.

## Deployment and recovery

Use `deploy/analytics/compose.yml` with a private env file. Set independent random database, application and 2FA secrets, the site-registry mount path and existing web-network name. Never expose the database. The Umami admin port has no host binding and is reachable only inside the private container network for provisioning/recovery. Immediately replace the default Umami account password before routing the dashboard publicly. Back up the database and configuration independently from blog backups. Record pulled image digests in private release evidence.

Run normal VCode checks, analytics HTTP/security tests, both production image builds and public smoke checks. Verify unauthenticated summary requests return 401, cross-origin login returns 403, wrong passwords fail, authenticated summaries succeed, logout revokes access and no internal token appears in browser responses.

## Connecting another public website

1. Review that site's public privacy notice and data scope.
2. Create a website in Umami under the owner/team and add its public ID/name/domain to the private registry.
3. Deploy a same-origin collector adapter and tracker to that website. Do not reuse VCode's hostname or spoof visitor IPs.
4. Enable collection only after explicit owner approval and verify an isolated test website before relying on production numbers.
5. Keep App Store installs and native app usage as separate future integrations. Outbound clicks are not installations.

Google Search Console and Bing Webmaster verification still require owner account/DNS access. IndexNow submission is not proof of indexing or ranking.

## Shared public v1 integration

`public-v1.js` provides `window.vcodePublicAnalytics` with the `vcode-public-v1` contract. It sends only explicit pageviews of pre-sanitized paths; no automatic navigation/click collection, cookies, referrers, titles, offline queues or identity. Browser requests use `credentials: omit` and `referrerPolicy: no-referrer`. Applications must also set `referrerPolicy=no-referrer` on the script element and pin its SHA-384 SRI.

The separate collector exposes only `/v1/tracker.js`, `/v1/events` and internal health. Each application's edge maps exact same-origin paths to it. Every event requires a per-site private edge key, exact HTTPS origin and an explicitly approved/enabled site with an exact allowed-path list. The edge overrides client IP and strips all incoming request headers except the reviewed allowlist. No private dashboard/admin proxy is present.

The monitor checks each registered v1 site's runtime digest and rejects malformed event payloads every five minutes, without creating fake production pageviews. Authenticated summaries show per-site collection and connection state; an expired check is not presented as success.

Daily database backups rotate after seven days (cleanup once daily). Active data is purged after 170 days to keep backup copies inside the approved 180-day ceiling. Verify a restore into a temporary database and never replace production for an acceptance test. Private configuration backups remain separate and contain no visitor records.

The analytics database enforces a privacy trigger that discards IP-derived country, region and city fields on every session write. Browser page payloads never send geographic information. Native request metadata remains transient for visit hashing; no readable IP address or geographic session attributes are stored. Reapply privacy.sql after schema migrations, before enabling collection.

## Acceptance record: 2026-10-04

The owner-authorized rollout has registered five additional public applications. All five trusted-edge paths passed isolated end-to-end ingestion, spoofed-header override, query removal, private-path/property rejection and DNT/GPC suppression. Test websites were deleted; genuine portfolio statistics were not altered. The private summary returns six permitted websites, suppresses test-only entries and exposes no registry keys. The legacy VCode event route rejects foreign website IDs so it cannot bypass their approval switches.

VCode check, 33 tests and build passed. Web, blog and worker images were built; the portfolio web was deployed with the new mestemhrou.cz links. Both health endpoints, both locales, representative product/guide routes, both blog locales and authenticated login/logout checks passed. Dashboard and collector security fixes are deployed. The monitor now uses its explicit identification on both requests: Studio Balance's edge rejected the default Node client, although browser-like isolated acceptance already passed. All five connection checks now succeed.

All five applications have deployed integrations with collection disabled. Kalorie's public-page CSP nonce repair is deployed as 4e60f6b; 549 tests, 44 browser scenarios and production browser acceptance passed. Its server lacked safe build headroom, so verified prebuilt images were transferred and deployed without changing Keycloak or shared services. Masáže is preserved on canonical main; Studio Balance and COP have adopted the bridge and guards into their normal development paths while preserving unrelated work. Městem hrou's source and release guards are synchronized. VCode's clean canonical local main includes this integration; unreviewed privacy additions have not been published to public pages.

Native applications and private STRATOS remain outside the rollout. Publication and activation of the five additions await the concrete owner review in analytics-public-webs-privacy-review.md; generic rollout authorization is already recorded in the task. Keep the registry's collectionEnabled false until each reviewed notice is visible and its frontend acceptance succeeds. The pending notice explicitly describes retained browser, operating-system and device categories; raw headers and inferred geography are not retained in analytics records.

Dashboard metric definitions, PWA privacy boundaries and acceptance requirements are documented in [analytics-dashboard.md](analytics-dashboard.md).
