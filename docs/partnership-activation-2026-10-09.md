# Moje porce partnership activation — 9 October 2026

## Owner decision

The owner directly approved **“Schvaluji znění i zapnutí příjmu”** in this
VCode chat on 9 October 2026. The approval covers the exact Czech Moje porce
intake notice in `partnership-privacy-review.md`, the types výrobce / obchod /
autor receptu / jiné, and intake activation. It does not approve English
publication, other applications' notices or partner promotion.

The approved composed Czech text digest is
`e51f75f34afd247d2ec6ed64282d7b9655865bf330736e308d4e9539c45bca1a`.
Publication/read-back route:
`https://mojeporce.cz/ochrana-soukromi#nabidky-spoluprace`.
Source publication and intake activation remain pending. The central production
deployment and verification are recorded below.

## Owned release boundary

Central tested implementation: `dc52ebfcaa2d6b7d578324dd4a6a62abd1365a01`.
Moje porce owns its clean source commit, public notice, relay, DMZ ingress and
application deployment. Existing unrelated Apple and Rinklet/Foldlight work
must not enter this change without its own approval and release evidence.

Production web has advanced since the earlier copy release. Preserve its
current image and static pages. Build the required web candidate from the
actual current production source with the owned partnership delta; deploy
only the required blog/dashboard services. Preserve the blog worker, analytics
collector, Umami/database/retention/backup services and Recall downloads.

## Private HTTPS route

Moje porce requires HTTPS. The chosen gateway uses only the two existing private
Docker networks and publishes no host ports, public DNS or public Nginx paths.
It exposes only two exact POST intake paths, not the private inbox or dashboard.
TLS identity is `vcode-partnership-intake`; app origin is
`https://vcode-partnership-intake:8443`. Application authentication remains
mandatory. Browser context continues to be rejected by the service.

Use a dedicated private CA and gateway certificate. The CA signing key remains
only in the protected operator directory. Gateway runtime receives only its
certificate and server key, owned by UID 101 with mode 0600. The app receives
only a read-only public CA bundle: its existing geo CA **plus** the partnership
CA. Do not overwrite or remove the existing geo trust/mount. Certificate expiry
and renewal must be recorded before activation.

The application key and challenge/fingerprint secret must be different and
privately generated. Store the central registry/key files with UID 1000, mode
0600, and keep them off the web/dashboard containers. Deliver the app key only
through protected server configuration. Never print credentials or put them in
release documentation, browser data, command arguments or source commits.

Only registry, application-key and challenge-secret files live in the directory
mounted into blog. The sibling `partnership-operator` directory contains operator
configuration and CA signing material and is never mounted into blog or dashboard.
The sibling `partnership-tls` directory contains only the gateway's three required
TLS runtime files, owned by UID 101. This separation was independently reviewed.

The gateway preserves unknown fetch metadata so that the central browser-context
guard can reject it; raw address, forwarding, referral, user-agent and administration
headers are explicitly suppressed. Its full isolated acceptance verifies both.

## Central production receipt

On **9 October 2026 at 16:05 UTC**, the central blog, dashboard and private HTTPS
gateway were installed and passed health checks. Exact deployed image identities:

- Blog: `sha256:225e62dcedcc9496bad35a7911123f9e8d5eb4d84fba19b30ec0c7b535d5f16e`.
- Dashboard: `sha256:e648039c66a86a0cf6d6a153cda0c4cf73a182ec5daa35d48c9446271f703a2a`.
- Gateway image configuration: `sha256:6e01bfae6f7971512a5765fe2f52ca4267a4773c7f8b357a2d39e5300787cece`;
  pinned distribution digest `sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46`.
- Exact gateway configuration: `8e37d96b6315a1d9510152d7e878d7b54d8242652609472acba80e1d95bd58cd`.

The authenticated dashboard feature is enabled. **Intake remains disabled**, all
three application entries are disabled, and partner promotion is disabled.
These are actual runtime/config-loader read-backs, not assumed template values.
The existing owner, inbox, challenge and Telegram inputs are configured; existing
VCode contact intake remains enabled. No partnership offer has been submitted for
production acceptance and no real Telegram notification was sent by the tests.

The existing web, blog worker, downloads, collector, monitor, Umami, analytics
database, retention and backup container identities were preserved. Existing
environments, secrets, bind/named volumes, networks, commands, security options and
resource limits were compared before replacement. The central release includes
automatic restoration of owned sources/images on deployment/health failure, with
the additive schema retained. The web candidate was built and validated to satisfy
the release gate; the current static web image was intentionally preserved.

Checks passed: `pnpm check`, all **159** tests, `pnpm build`, both web/blog Docker
images, dashboard image, isolated Nginx boundaries and PostgreSQL acceptance.
`scripts/verify-partnership-relay.mjs` also passed actual Moje porce handler/transport
HTTP → native TLS → exact gateway → actual VCode handler → disposable PostgreSQL,
including concurrent/expired retries, changed payload, deletion/tombstone, size/query
limits, certificate rejection, header suppression and a generic notification mock.
All synthetic containers, networks and the TLS volume were removed afterward.
This fixture does **not** replace the source application's Next/browser release gate.

Live GET checks passed `/health`, `/health/blog`, both home/product/guide/blog
locales, both collaboration pages and the dashboard shell. Both partnership inbox
APIs return 401 anonymously and internal paths return 404 publicly. Private TLS
health passed from the actual client network using only the public combined CA.
No genuine visitor records, live application key or live intake were used.

Protected production evidence is under
the private release directory `partnership-activation-20261009`:
`runtime-preflight.json`, `central-deployment.json`, `live-verification.json`,
`private-config-evidence.json` and the per-gate logs. Local isolated relay evidence
is `/private/tmp/vcode-partnership-relay-20261009.json`.

## Client handoff and remaining activation

Moje porce's active chat is also fixing its Apple release. Its prepared partnership
files are not yet a clean deployed source release. Do not deploy that dirty checkout
or include unrelated Apple privacy edits under this partnership approval.
The owner has approved the exact Czech intake text and activation; another privacy
approval is not needed for that unchanged text. Messaging the source chat still
awaits the separately requested direct human permission required by that tool.

After coordination is authorized, the source maintainer must:

1. Isolate its partnership change in a clean commit, run its full release gates and
   Next/browser synthetic acceptance, and supply the exact commit/release receipt.
2. Publish only the approved Czech section at the route above, preserve surrounding
   legal text, and return the exact composed text digest. Keep English unavailable.
3. Preserve its existing geo CA and mount the prepared combined **public** CA file
   read-only. Protected inputs are server-only in
   the private operator directory, as `moje-porce-runtime.env` and
   `moje-porce-ca-bundle.pem`; never print the token or put it in source/browser data.
   The initial env file deliberately leaves local intake, publication and trusted
   ingress flags false.
4. Verify its trusted DMZ ingress, including absence of a reachable spoofed-header
   bypass, before asserting `PARTNERSHIP_TRUSTED_INGRESS=true`. Deploy its relay/form
   with intake off and provide its production notice/readiness evidence.
5. Coordinate activation: verify the published notice, enable only the Moje porce
   central registry entry and intake flag, then enable the source form. Check public
   form availability without submitting acceptance offers under its real key.
   Keep other apps and partner promotion false.

The private gateway leaf expires **9 October 2027 at 15:50 UTC**. Renew at least
30 days before expiry (by 9 September 2027), using the protected operator CA;
verify the key/certificate pair, chain and `vcode-partnership-intake` hostname,
install only leaf/key/public CA as UID 101 mode 0600, reload the gateway, then repeat
the public-CA-only private TLS health check. Keep the combined app trust bundle and
existing geo trust. The CA signing key never enters runtime containers.

## Evidence required before intake activation

- Exact client commit and full client release gates.
- Public notice exact read-back; surrounding privacy text preserved.
- Trusted DMZ ingress without an accessible spoofed-header bypass.
- Explicit one-app registry and application activation; other apps/promotion off.
- Public form availability and production health without live acceptance offers.

After any real offer is accepted, a rollback must keep the compatible new pruning
code running with intake off; returning to the historical blog image alone would
lose partnership retention. The automatic old-image rollback above was restricted
to this first, intake-disabled deployment, before partnership data could be accepted.

No new backup or indefinite contact copy is introduced. The existing notice's
90-day statement concerns the live dashboard. Infrastructure recovery retention
is not claimed verified; preserve the operator-governed policy and mandatory
purge-before-restored-access procedure from the existing contact runbook.
