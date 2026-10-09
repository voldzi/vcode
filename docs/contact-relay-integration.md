# Contact forms inside portfolio applications

Status: **integration contract and deployment templates**. A site's intake stays
disabled until its concrete privacy notice has been approved by its owner,
published on that site, and recorded in the protected registry. Preparation or
deployment of these files alone does not authorize activation.

## User experience and ownership

The visitor remains inside the application's own form and domain. The application
does not store a second copy: an authenticated server relay submits the enquiry
to the existing private VCode contact inbox and existing durable Telegram outbox.
The Telegram notification contains only the reference, application and general
topic; it contains no name, email address, organisation or message.

For Městem hrou, the server credential fixes `application=mestem-hrou` and
`area=partnership`. Those properties are never accepted from browser input.
There is no separately stored originating site, referring URL, game data,
location, new inbox, database or analytical event. The existing private Moje
porce partnership workflow is a different interface and remains unchanged.

The form displays name, email, optional organisation, message, the concrete
privacy information, and an invisible empty `website` honeypot. It requests a
short-lived challenge only when online. It never sends automatically, queues
messages offline, uses local storage for field values, or forwards form contents
to website analytics. The source application's existing analytics boundary and
published CSP for HTML remain unchanged.

## Frozen browser and server contract

The browser uses only its own origin. No CORS permission, internal endpoint,
server key or private inbox permission enters HTML, JavaScript, URLs or public
error messages.

| Browser request on `https://mestemhrou.cz` | Private authenticated request | Body |
| --- | --- | --- |
| `GET /api/partner-contact/challenge` | `GET /internal/contact-relays/v1/challenge` | None |
| `POST /api/partner-contact` | `POST /internal/contact-relays/v1/submissions` | Strict JSON below |

Both routes reject query strings, including an empty query marker and encoded
aliases. Other methods and related paths do not become API endpoints. Submission
is UTF-8 JSON, at most **16384 bytes**, including chunked requests. Accept
`application/json` with optional `charset=utf-8`; compressed bodies are rejected
by the application proxy. Cookies, browser Authorization, administration,
forwarding and referral headers are not forwarded. The proxy injects only its
own Bearer credential, fixed canonical Origin, same-origin fetch metadata and
the verified trusted ingress client address.

### Challenge

Successful challenge response: **200**, JSON, `Cache-Control: no-store`:

```json
{
  "enabled": true,
  "token": "<opaque signed challenge>",
  "minimumDelayMs": 1500,
  "expiresAt": "<ISO UTC timestamp>",
  "privacyVersion": "contact-20261009"
}
```

When the authenticated application entry is disabled, return **200**:

```json
{"enabled": false, "privacyVersion": "contact-20261009"}
```

Do not show an enabled submit action for that response, unexpected response
fields, an invalid expiry, mismatched privacy version or an unavailable service.
The challenge lasts ten minutes and requires at least 1500 ms before submission.
It binds the credential, canonical application, area, origin, privacy version and
verified ingress address. A fresh challenge is necessary if that address changes.
Never decode the token to obtain or infer user information.

### Submission

The browser creates one UUID per intentional enquiry and retains it with the
unchanged in-memory business payload while resolving an uncertain submission.
No application, area, source, consent flag, game field or extra property is valid.

```json
{
  "token": "<challenge token>",
  "requestId": "<UUID>",
  "locale": "cs",
  "name": "<name>",
  "email": "<email address>",
  "organization": null,
  "message": "<enquiry>",
  "website": "",
  "privacyVersion": "contact-20261009"
}
```

`locale` is `cs` or `en`. `organization` is optional and may be a string or null.
Limits after NFC, newline normalization and trimming are: name **2–100**, email
**3–254**, organisation **0–160**, message **30–4000** Unicode characters. Controls
are rejected; ordinary message line breaks are allowed. The email must be valid.
The honeypot must be exactly the empty string.

Only **202** confirms an atomic inbox and outbox commit:

```json
{"ok": true, "reference": "<UUID>"}
```

An unchanged retry with the same request UUID returns the existing reference;
changed content with that UUID returns **409**. A still authentic expired token
may recover an existing retained receipt but cannot create a new enquiry. After
network uncertainty preserve the exact payload and UUID, and provide an explicit
retry. An expired token with no retained receipt requires a fresh challenge. Do
not automatically resubmit, erase typed content on failure, or imply that a
Telegram notification was already delivered when only receipt acceptance is
confirmed.

### Errors and limits

Errors contain only `{"ok":false,"error":"<finite code>"}`. Show translated
fixed client wording, never the raw upstream text or browser/network exception.
The supplied Nginx templates also produce bounded JSON for their local guards
and unavailable upstream. A source application should still safely handle a
non-JSON infrastructure failure and keep the message and UUID on uncertainty.

| Status | Finite code |
| --- | --- |
| 400 | `invalid-input` |
| 401 | `unauthorized` |
| 403 | `origin-not-allowed`, `rejected` |
| 404 | `not-found` |
| 405 | `method-not-allowed` |
| 409 | `idempotency-conflict` |
| 413 | `too-large` |
| 415 | `invalid-content-type` |
| 429 | `rate-limit` |
| 503 | `unavailable` |

The central service returns `Retry-After: 3600` for 429 and `Retry-After: 60` for
503. Do not use that header to trigger automatic submission. Limits are twelve
challenges per ten minutes and eight submissions per hour per application/address,
plus bounded per-application and service counters. Existing durable contact
capacity is shared, and retries do not create another inbox or outbox record.
Enquiries expire after **90 days from submission**, using the current contact
maintenance and owner deletion controls. Neither raw addresses nor challenge
tokens are stored in enquiries or notifications.

## Nginx installation pattern

Files are in [deploy/contact-relays](../deploy/contact-relays/). They are server
source templates, not public downloads and must not be copied into `public/` or
`dist/`.

| File | Purpose and placement |
| --- | --- |
| `app-http.conf.example` | Render the verified trusted edge CIDR; include in the existing web `http` block |
| `app-proxy.conf.example` | Include the two exact browser routes and named handlers in the canonical application `server` block |
| `app-common.conf` | Narrow request guards, own server credential, verified TLS upstream and header allowlist |
| `api-security-headers.conf` | `no-store`, no indexing, no sniffing, no referrer and API-only CSP |
| `error-handlers.conf` | Named JSON error handlers used only by the relay routes |
| `error-pages.conf` | Gateway-only error mappings and handlers; never include these server-wide mappings in the application's vhost |
| `app-compose-overlay.example.yml` | Read-only mounts on the existing application web service only |
| `tls-gateway.conf` | Private TLS gateway permitting health and the two ingestion paths only |
| `tls-gateway-compose.yml` | Pinned non-root gateway on two verified existing networks; no host ports |

The application overlay does not replace its Nginx configuration, change its
game API/database, create a network or alter other routes. Render the existing
web service name and insert the two appropriate includes into its current
configuration. Mount the rendered snippets read-only at
`/etc/nginx/contact-relays`. The proxy's protected mount at `/run/contact-relay`
contains only `authorization.conf` and the new **public** CA certificate. The
credential include is generated by the protected operator installation:

```nginx
proxy_set_header Authorization "Bearer <fresh application-only credential>";
```

Before mounting, check the actual application's parent mounts and symlinks.
An existing `/var/run` tmpfs can cover `/run` when `/var/run` resolves there.
Preserve that existing runtime configuration: render a separate protected
read-only destination such as `/etc/nginx/contact-relay-auth` and change only
the two credential/CA paths in `app-common.conf` to match it. Keep the public
snippets in their separate directory. Record the exact rendered digest and
verify `nginx -t` and the source's disabled relay on the actual image with its
original tmpfs configuration before release. A mount-path adaptation does not
authorize an intake activation or a change to the central gateway or registry.

Never commit the generated include or pass its value through Compose interpolation,
build arguments, image layers, URLs or command output. Generate the credential
inside the operator's protected directory; install only this application's
credential. Do not search for or reuse other applications' credentials. Use
owner-readable protected files, read-only mounts, and restrictive directory
permissions appropriate to the runtime UID. Do not run `nginx -T` or print full
Compose configuration with protected mounts: those can reveal the include.

### Trusted ingress address

`X-Real-IP` is security-sensitive: both challenge binding and temporary spam limits
use it. The source maintainer must identify the actual HTTPS edge that overwrites
that header, verify a client-supplied spoof cannot survive it, and render only
that edge's narrow CIDR into `app-http.conf.example`. The `geo` guard uses
`$realip_remote_addr`, the original TCP peer even if an existing realip module
configuration rewrites `$remote_addr`.

A request from an unverified peer, missing address or malformed address fails
closed. The application proxy does not trust a forwarded chain or a value merely
because it is present. No direct publicly reachable web port may bypass the
trusted edge guard. Verify the selected Nginx build includes the realip module;
do not weaken the guard to get a configuration test to pass. The actual edge
must enforce canonical HTTPS `mestemhrou.cz`, overwrite Host and X-Real-IP, and
keep individual form paths/body values out of logs and tracing.

### Private gateway and TLS

The separate gateway uses the pinned official Nginx digest from its Compose
file, UID/GID 101, a read-only filesystem, dropped capabilities, no new privileges,
bounded memory/CPU and a small `/tmp` tmpfs covering all Nginx temporary paths.
Its only networks are `vcode-prod_default` and the application's **already
existing, verified web network**, selected by
`CONTACT_RELAY_APP_EXISTING_NETWORK`. Do not create a broad shared network or
attach the game database network merely for convenience.

Create a dedicated new CA and a leaf with hostname `vcode-contact-relay`; record
their fingerprints, expiry and renewal date in protected release evidence. Keep
the CA signing key in the operator directory only. The gateway's own protected
mount contains its leaf certificate, leaf key and public CA. The application
receives only the public CA and its own intake credential. It verifies TLS and
the hostname on every upstream connection; no `insecure` option or plain LAN
fallback is permitted. The gateway publishes no host port and never exposes the
private inbox, administration or existing partnership service.

The gateway and application both disable access and error logs for this intake,
discard browser cookies, authorization, referral, forwarding and administrator
identity, and forward only the explicitly configured intake headers. The gateway
does not mint a credential or trust the browser directly: the central registry
authenticates the specific per-application key and its bound origin. It forwards
only the two finite internal paths to the reviewed blog boundary.

## Activation and acceptance

1. Review and publish the concrete **application-local** privacy notice covering
   the central VCode inbox, fields, spam protection, generic Telegram and 90-day
   retention. Record owner approval and actual publication timestamps. Approval
   of VCode's own form alone is not proof that the source notice is published.
2. Capture the current web/API/database identities and existing network/edge
   trust. Prepare owned rollback files and full current runtime settings. Preserve
   unrelated source changes, secrets and services.
3. Render only this application's proxy/mount settings. Provision a fresh protected
   credential and TLS material; add a disabled registry entry. Run `nginx -t`
   without exposing the generated credential and validate the Compose overlay.
4. Run isolated acceptance against the actual reviewed central image, application
   proxy and TLS gateway, with a disposable database, new synthetic credentials
   and synthetic contacts. Cover acceptance, uncertain retries, expired receipt
   recovery, wrong origin/fetch metadata, spoofed ingress, forbidden headers,
   query/method/body guards, disabled registry, API-only CSP and no CORS. Never
   use visitor records, the production key, a real submission or actual Telegram
   to test these paths.
5. Build and run the project checks required by each application's `AGENTS.md`.
   Deploy only the owned web/relay and reviewed central changes. Confirm public
   forms, privacy notices and both intended locales; retain the game API/database
   identities, website analytics/CSP and existing private intake behavior.
6. Enable only the approved, published registry entry. Verify challenge availability
   without posting a live enquiry. Confirm all private inbox and internal routes
   remain unreachable publicly. Record the exact images, script/config digests,
   notice/version, activation state, tests, health and rollback in release evidence.

For another application, repeat the same bounded pattern with its canonical
origin, catalog application ID, fresh credential, verified existing web network
and concrete reviewed notice. Never widen CORS or let browser input choose the
application, topic or privileged destination.
