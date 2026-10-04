# Private portfolio metrics

The static public portfolio remains independent of the analytics service. `/prehled/` provides a Czech login and a read-only cross-site view. `/prehled/api/*` is served by the isolated dashboard service, not the blog service. The dashboard uses the official Umami 3.4.0 API and its native password authentication; no Umami token reaches the browser. Analytics database access remains inside the private container network.

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

Umami and PostgreSQL are independent from the blog. Telemetry and external network calls by Umami are disabled. The retention service deletes analytical events and sessions older than 180 days every day. Session replay is disabled on registered websites and the public collector cannot submit replay payloads.

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
