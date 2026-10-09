# Shared partnership intake: adoption and operations

Current production/owner decision: see
[the 9 October activation receipt](partnership-activation-2026-10-09.md).
Central code, private dashboard and gateway are deployed; Moje porce's approved
Czech notice publication and client activation remain pending. Historical
preparation evidence below describes the earlier, disabled preparation state.

Status: **prepared only**. This runbook does not authorize production deployment,
publication of processing notices, intake activation or partner promotion. The
frozen interface is [partnership-intake-v1.md](partnership-intake-v1.md), with
machine-readable schemas split between the [public dashboard OpenAPI](../openapi/openapi.json)
and the [nonpublished private service OpenAPI](../services/blog/partnership-openapi.json).
The public document contains only the five browser partnership paths (six
operations); seven internal paths (eight operations) and their credentials exist
only in the separate service source contract. Neither the private contract nor
internal route metadata may be copied into `public/` or `dist/`. Both independent
documents and their local references are validated by `pnpm validate:openapi`;
the existing contact build gate also rejects internal paths in the public contract.
The existing
VCode contact form, approved `contact-20261009` wording, blog schedule and budget,
Recall distribution and website analytics remain separate and unchanged.

## Service boundaries

Each application owns its public form and same-origin relay. Visitors stay on
that application's domain and see its design. The reviewed VCode blog service
holds the private enquiries, audit, idempotency receipts and Telegram outbox in
`vcode_contacts`. No contact copy is stored in the application's database.
The authenticated VCode dashboard brokers private administration using the
existing contact inbox credential and a freshly verified administrator identity.

| Consumer | Routes | Permission |
| --- | --- | --- |
| Application server | `POST /internal/partnerships/v1/challenge`, `POST /internal/partnerships/v1/submissions` | Its own enabled, approved application key; send only |
| Private dashboard | `GET /internal/partnerships/v1/inquiries`, `PATCH` / `DELETE /internal/partnerships/v1/inquiries/{id}`, `POST /internal/partnerships/v1/inquiries/{id}/promote` | Inbox credential plus verified configured owner ID |
| Private dashboard | `GET /internal/partnerships/v1/partners`, `DELETE /internal/partnerships/v1/partners/{id}` | Same owner permission |
| Owner's browser | `GET /prehled/api/partnerships`, `PATCH` / `DELETE /prehled/api/partnerships/{id}`, `POST /prehled/api/partnerships/{id}/promote`, `GET /prehled/api/partners`, `DELETE /prehled/api/partners/{id}` | Fresh dashboard session, admin role, configured owner and canonical VCode website permission; writes additionally require same origin |

`/internal/partnerships/` must never be added to public Nginx routes. Use the
existing private same-host service network; across hosts use an explicitly restricted
TLS connection approved and configured by the operator. Never send keys or contacts
over an unprotected LAN. Do not introduce a public ingress,
wildcard CORS, new shared network, exposed port or weakened origin protection.
The application key, registry, inbox key and internal URL never enter HTML,
JavaScript, client configuration, query strings or public error messages.

Private requests reject browser `Origin`/`Cookie` and `Sec-Fetch-Site`,
`Sec-Fetch-User`, `Sec-Fetch-Dest` or unknown fetch metadata. Node/Undici's standard
server fetch may automatically add only `Sec-Fetch-Mode: cors`; the private service
permits that generated mode when all browser context is absent. Do not forward
the visitor's fetch headers to obtain this exception. Key/owner verification remains
mandatory, there is no public CORS allowance, and the same-origin browser relay
continues to enforce its full origin/session/CSRF/fetch checks.

## Final interface for application maintainers

The earlier Moje porce handoff was a proposal. The frozen v1 contract deliberately
uses `/submissions`, not its proposed submission `/inquiries`; `type`, not `area`;
and `ok` / `contractVersion` / `requestId` receipt envelopes. The challenge request
contains `requestId`, `locale` and relay-derived `clientBucket`. The approved notice
version is returned by the challenge and required on submission. No `privacyDigest`,
`enabled` or `accepted` response property is part of this v1 wire interface.
Keep approved text digests in private release evidence rather than inventing
additional wire fields. Do not reuse old contact payloads unchanged.

- Strict root JSON object, UTF-8, maximum **16384 bytes**, including chunked input.
  Accept `application/json` with optional `charset=utf-8`; no compressed body.
  Unexpected fields, malformed Unicode, query parameters and attachments fail.
- Challenge TTL **600000 ms**, minimum delay **1500 ms**. It binds the authenticated
  app, UUID, opaque bucket, locale, notice version and issue time.
- `clientBucket` is a 43-character base64url HMAC-SHA256 generated on the relay
  from a purpose prefix, UTC hour and its trusted ingress address, using its
  private application key. Do not accept a bucket or forwarded IP from the browser.
  Never send the raw address to VCode. Central buckets live only in bounded memory
  for at most one hour; no bucket, raw address or token is persisted or logged.
  Submission and explicit retry derive the bucket using the original token's issue
  hour, also after its ten-minute expiry. Decode only a well-formed, non-future issue
  time at most 90 days old. Reading it does not establish validity: VCode verifies
  the signature and all bindings; only a known retained receipt can ignore expiry.
  Never use a current-hour bucket with an original token. If the trusted address
  or app key changed, obtain a fresh challenge with the same UUID and unchanged
  business payload. No bucket comes from the browser; historical bucket counters
  still expire from current arrival within one hour, not from historical issuance.
- Field limits after NFC/CRLF normalization and trimming: name 2–100, email 3–254,
  optional organisation 0–160, message 30–4000 Unicode characters. Reject controls;
  allow ordinary line breaks in the message. `website` is an empty honeypot.
  `type` comes from the per-app registry whitelist; app ID comes only from the key.
- Success is **202 after atomic database commit** of enquiry, receipt and outbox.
  The same app and request UUID with unchanged normalized content returns the same
  reference, even after an uncertain response or expired token. Changing content
  under that UUID returns 409. Deleted entries return 410 during the original
  retention; retry cannot recreate them. A fresh intentional offer needs a new UUID.
- Errors contain only `ok:false`, finite `code`, fixed safe `message` and validated
  `requestId` (null when absent/invalid), without field values or dependency details.
  429/503 have bounded `Retry-After`. See the frozen contract/OpenAPI for codes.
- Per app/bucket: 12 challenges/10 minutes and 8 submissions/hour. Per app:
  120 challenges/10 minutes and 60 submissions/hour. Durable capacity is 30 new
  enquiries/app/day and 100 across the partnership intake; receipts/tombstones
  still count against capacity and retries do not use new slots. Existing contact
  intake retains its own limit. Ephemeral counters are per service process;
  persistent quotas and idempotency are enforced transactionally across replicas.

### Relay implementation pattern

These steps describe server code, not browser code. Use synthetic data for tests.

```text
public POST /api/partnerships/challenge:
  require exact same origin + CSRF/fetch protections + confirmed anonymous context
  apply trusted-ingress local limit; read strict bounded JSON {requestId,locale}
  choose fixed app config and allowed notice locale; derive current clientBucket
  POST /internal/partnerships/v1/challenge with own server key and whitelisted fields
  require matching contract/app/requestId/privacyVersion; expose safe token receipt

public POST /api/partnerships:
  repeat anonymous/origin/size/type/local-limit checks; reject extra fields
  derive clientBucket on server; never forward cookies/browser Authorization/IP
  POST /internal/partnerships/v1/submissions with own key and whitelisted form fields
  expose only bounded validated receipt or safe finite error; do not store contact copy
```

Every upstream request uses an **8-second total timeout**, `redirect:error`, no
automatic submission retry and an upper bound of **64 KiB** on upstream responses.
Reject non-JSON, unexpected statuses/fields or mismatched contract metadata with
fixed local unavailable wording. Return `Cache-Control: no-store`. Never forward
the raw upstream body on failure. Suppress individual form access/error logs at
the relay and proxy, and omit payloads, email, IP, tokens and cookies from APM.
No form values or submission callbacks enter website analytics.

Generate a UUID once for the immutable offer before requesting its challenge.
Keep the same UUID and normalized offer for an explicit retry after a timeout;
keep its original nonempty token (maximum 2048 characters) and derive its original
issue-hour bucket. A fresh challenge required by an address/key change keeps that
same UUID and offer. Editing the offer starts a new challenge/UUID. Use an explicit user submit action,
not a background queue or offline replay. Losing the network must not claim success.
Show a reference after 202 and explain that Telegram delivery is asynchronous.
Do not require an application login, telephone or attachments. Preserve keyboard
navigation, visible field labels, error associations, focus and 200% text zoom.

## Private configuration and revocation

Templates are in `deploy/partnerships/`. Do not treat examples as live secrets.
For future production releases, preserve the installed contact/partnership/Recall
overlays and the current protected runtime environment. Read the running service's
Compose configuration-file labels and the activation receipt; do not recreate it
from the base Compose file and default false flags alone. The private gateway is
its own project and has no public port. Renewal, deployment and rollback must keep
its certificate/CA separation and the application's existing geo trust.

All top-level and per-app flags remain false initially. Copy the registry into an
operator-owned directory, mode 0700, with files mode 0600 owned by service UID 1000.
Create empty credential files only as a disabled preparation step; empty, missing,
symlinked, malformed or shared keys must not produce a working integration.
Before an approved isolated trial, the operator generates an independent secret
from at least 32 random bytes for each application, plus a different challenge
secret. Keep every application key unique and different from the challenge secret,
existing inbox token and existing form secret. Use protected file/secret delivery,
never chat, documentation, shell output or a source commit.

The example's `jine` list for Městem hrou and Myslopis is **not an approved business
taxonomy**; those apps need an owner-reviewed whitelist before activation. Preserve
canonical ID `kaloricke-tabulky` for Moje porce. The registry maps each key to one
catalogued app and one fixed public domain. Record exact version, approval and
publication timestamps and public notice URL. Approval/publication metadata is a
gate, not evidence by itself: independently inspect the published text before enabling.
The fixed notice URL must be HTTPS on that app's exact origin, without credentials;
maximum total length is 2048 characters and query length 512. A query-based public
notice such as Městem hrou's is allowed; VCode never fetches that registry URL.

Apply the blog overlay alongside the existing contact overlay; the latter still
provides `/run/contact/inbox-token`, `/run/contact/form-secret` and `/run/contact/owner-id`.
The partnership overlay adds `/run/partnerships` and the owner-ID path, without changing
existing credential values. The dashboard overlay adds only its feature flag and
continues to use `CONTACT_SERVICE_URL`, existing inbox token and owner file. Keep
Recall overlays, analytics registry and session mounts unchanged. Do not mount the
application key directory in the dashboard or public web container.

For revocation, disable that registry entry first and verify its challenge/submission
refusal; the registry is read on each request. A disabled entry may have its key file
removed without disabling other valid apps. An enabled entry with a missing or invalid
key fails the entire registry closed. Environment flag changes require the existing
service release/restart procedure.
For rotation, disable the app, replace only its key through protected files, update
its relay configuration and verify the disabled synthetic path before re-enabling.
No shared fallback or automatic switch to another app is allowed. A whole malformed
registry or duplicate key fails closed. Intake failure does not disable ordinary blog
operation or the existing contact form. Record identities and aggregate results,
never actual secret bytes or contact records, in evidence.

The store's keyed payload fingerprint needs the same compatible secret for the
original receipt lifetime. Preserve that private secret with a compatible database
recovery plan; rotating it while retained receipts exist would change retry identity.
Per-app key rotation does not change the fingerprint secret. Do not rotate the global
challenge/fingerprint secret with live receipts without a separately verified
compatibility procedure. Never place its recovery copy in public release evidence.

## Administration and partner promotion

Initial access is limited to the configured inbox owner, with a freshly verified
admin role and canonical VCode website permission on **every request**. The broker
derives canonical lower-case UUID `X-VCode-Admin-Id`; browser-supplied actor/role claims
are ignored. The service
also compares that ID to the same configured owner. An application key has no read,
write, delete or promotion permission. Private responses are no-store, noindex and
excluded from service-worker/offline caches. Clear private UI data on logout/session
failure; render message content as text, never HTML.
PATCH/promotion re-verifies the same owner after reading the request body and uses
the fresh credential/context before forwarding. Role or permission revocation
during that read prevents the internal write. New namespace failures, including
anonymous or wrong-origin requests, use the finite safe JSON envelope.

Stages are `new`, `reviewing`, `waiting`, `pilot`, `active`, `closed`. Workflow writes
require the current positive `expectedVersion`; competing updates return 409. Manager
is the configured owner or null, next action is a single line of at most 500
characters after trimming/NFC normalization, and its UTC `Z` due date is before
original expiry. These edits never extend expiry. Read responses
expose the latest 200 audit entries per enquiry (no historic contact/message/task-text
copies), grouped live counts and aggregate pending/sent/failed notifications.
New anonymous offers have an empty audit; their receipt does not name an administrator
as the submitting actor. Current audit writes are workflow updates and promotion.
`promotionEnabled` is an array of approved app/policy pairs. The browser broker adds
`managerId` identifying the freshly verified configured owner; that field is absent
from the service list. Counts decrease on deletion/expiry and are not lifetime counts.

Partner promotion is a separate default-disabled per-app policy. A reviewed policy
must specify a version, purpose, published notice and expiry of 1–365 days. An explicit
owner action creates only app/type/display name/policy/creator/timestamps; no email,
message or full enquiry copy. Its internal source link becomes null when the enquiry
is deleted. Promotion, stage `active`, or receipt of an offer does not approve a
contract, licence, advertising, data import or access to another application's data.
The proposed 365-day policy in `partnership-privacy-review.md` is not approved.

## Retention, notifications and recovery

Enquiries, their audit and notification jobs expire exactly **90 days from original
receipt**, regardless of stage, manager, retry or promotion. Startup, periodic
maintenance, submission and reads prune expired data; reads also exclude it. Deleting
an enquiry removes its content/audit/outbox and retains only its non-contact UUID,
app, reference, payload digest and original expiry as a replay tombstone until that
same 90-day boundary. An expired tombstone is also removed. Bounded partner records
follow their independently approved expiry and can be deleted sooner.

Telegram outbox is committed with the offer, uses leases across replicas and at most
six delivery attempts. Telegram receives only generic reference, canonical app name
and a fixed private inbox link. Never a name, email, organisation, message, visitor IP
or public access token. Failed delivery does not undo an accepted offer. Investigate
aggregate job status; do not copy genuine messages into tests, logs or release evidence.

Migration `services/blog/migrations/003_partnerships.sql` is additive and idempotent.
All new tables stay in `vcode_contacts`, already excluded from routine logical blog
dumps (`--exclude-schema=vcode_contacts`). Do not introduce independent unbounded
backups or an application-DB copy. Existing infrastructure recovery copies have a
separate operator-governed retention; verify that policy before activation. Before
exposing any restored inbox or resuming Telegram, run retention on the restored
contact, partnership, receipt and partner tables in isolation and verify expiry.

## Verification and activation checklist

Prepared configuration was also checked against the actual loader in an isolated
temporary directory: all three disabled examples load with missing key files and
the Městem hrou query notice; enabling an app without a key fails the registry closed.
No key was provisioned, no network request made and no enquiry or visitor record used.

### Moje porce draft read-back, 9 October 2026

The prepared `src/lib/partnership-privacy.ts` in the Moje porce handoff uses
`partnership-intake-20261009-1`. Its introduction and five Czech paragraphs match
the VCode draft exactly. The SHA-256 of the composed text (introduction, heading,
then five paragraphs, separated by blank lines) is
`e51f75f34afd247d2ec6ed64282d7b9655865bf330736e308d4e9539c45bca1a`;
the SHA-256 of the TypeScript source file is
`92bbb61f0919524185e0a751391884538bd7c69870e4ed01b6cc61705c16afa3`.
These identify different artifacts; do not confuse a source hash with a published
notice digest. This read-back proves prepared Czech wording only. It is **not**
owner approval, a public notice, a deployment receipt or intake activation.
That source file contains no English counterpart yet.

Activation gaps remain: explicit review of each concrete published-language notice,
actual publication/read-back at the agreed route, final type list, local form/relay
release and synthetic acceptance, approved private connectivity/key provisioning,
and deliberate app-specific central enablement. Keep an unsupported notice locale
unavailable rather than substituting unreviewed copy. Partner policy is independently
unapproved and stays disabled. Current public legal pages are unchanged.

1. Record exact source and previous web/blog/dashboard image identities, owned paths
   and rollback evidence. Build both web/blog images, dashboard image, and run
   `pnpm check`, `pnpm test`, `pnpm build` plus isolated PostgreSQL/Nginx acceptance.
2. Use synthetic fixtures and local notification sinks only: cross-app authorization,
   challenge expiry/delay/locale/bucket, malformed or compressed JSON, size limits,
   replay, simultaneous retries, changed content, tombstone/no resurrection, spam,
   transactional outbox/leases, owner RBAC, optimistic workflow conflict, retention,
   bounded promotion and isolated restore. Never send acceptance submissions through
   a live application key or a live production intake.
3. Confirm old contact routes/wording, dashboard login/logout/PWA, Recall and analytics
   still work. Smoke health, both locales, product/guide pages and both blog locales.
4. App maintainer supplies exact built relay/form, synthetic browser evidence, public
   notice text/version/digest and published notice URL. Owner reviews each concrete
   CZ/EN notice and final type whitelist. No flag is enabled on source readiness alone.
5. Keep promotion false. Enable one app only after the separately authorized release,
   published notice proof and synthetic isolated trial. Verify the real public form
   availability without accepting test messages under its real key. Record prepared,
   tested, deployed and activated as separate states. No whole-fleet activation.

## Rollback

Disable `PARTNERSHIP_INTAKE_ENABLED`, the affected app registry entries and its local
form flag first. Disable `PARTNERSHIP_DASHBOARD_ENABLED` if the private UI is affected.
Revert only owned source/images/overlays through the verified release procedure;
preserve existing contact/Recall overlays and all unrelated services. Keep the additive
schema; do not drop tables or delete genuine data to make an old image start.

**If partnership data has already been accepted, returning to an old image that lacks
partnership pruning is insufficient.** Keep the compatible new maintenance code
running with intake disabled, or first prepare and verify an isolated, compatible
retention task under the same 90-day/partner-expiry rules. Only then restore a previous
blog image. Preserve outbox lease/expiry semantics and do not restart notifications
from a stale backup before pruning. Re-verify old contact operation, private access,
health and published availability after rollback. Record the required purge coverage
as a release gate; this runbook does not authorize new infrastructure or data deletion.

## Preparation acceptance — 9 October 2026

Preparation and tests are complete. **Nothing in this partnership change has been
deployed or activated.** No application key, private connection or processing
notice was provisioned or published. The separate public presentation-copy
release excluded these files and retained existing blog/dashboard identities.

- `pnpm check`: no errors or warnings, 15 existing hints.
- `pnpm test`: 159 passed (52 blog, 75 analytics, 32 downloads), no failures.
- `pnpm build`: passed all gates, 156 pages; reused the existing signed Recall
  build acceptance through protected temporary inputs. Public legal copy and
  the existing contact form's reviewed notice remain unchanged.
- The public API contains five new dashboard paths with six operations. Seven
  internal paths with eight operations are confined to the separate nonpublished
  service contract. Both documents have validated local references and credentials
  boundaries. Existing public paths/schemas/security are unchanged except the
  optional summary capability. The original build prohibition on internal paths
  remains intact; built static output contains no private partnership metadata.
- Blog candidate: `vcode-partnership-prep:20261009`, image configuration identity
  `sha256:2e19d71cd862de36573d4e1a784815c3a4e8294c880d0a82c27bfe801116a5a4`.
- Dashboard candidate: `vcode-partnership-dashboard-prep:20261009`, image
  configuration identity
  `sha256:414fc5c0b89bb1d073fafe0be15cf81e5e252312b9743bf4ab455066fa483284`.
- The exact dashboard image passed all 18 new inbox tests on Node 24.20.0 in an
  isolated container without external networking. The complete local suite also
  covered session/permission checks, legacy contact compatibility, public shell
  identity and private-data exclusion from PWA caches. Synthetic mobile previews
  at 360 px and 200% text size had no horizontal overflow; this is not a full
  accessibility certification.
- `scripts/verify-partnership-postgres.mjs` passed against the exact blog candidate,
  Node 24.20.0 and disposable PostgreSQL 17: repeatable migrations, real atomic
  rollback, concurrent retries, fixed retention, tombstones, bounded audit and
  promotion, durable quotas, cross-worker notification leases and stale callbacks.
  Actual server fetch exercised private-file registration, cross-app rejection,
  committed receipt, admin workflow, generic mocked Telegram, revocation and
  expired-token retry. A real cold blog process with intake off and no intake
  secrets preserved health and pruned expired records. The test database and
  network were removed; no genuine visitor/contact records or Telegram were used.

Moje porce's prepared relay follows frozen v1. Its `.env.example` keeps the flags
`PARTNERSHIP_ENABLED`, `PARTNERSHIP_PRIVACY_APPROVED`,
`PARTNERSHIP_PRIVACY_PUBLISHED` and `PARTNERSHIP_TRUSTED_INGRESS` remain false;
upstream origin, client credential and approved privacy digest remain empty.
Central intake/dashboard flags and every example registry entry/promotion policy
also remain false in the prepared configuration. This is source/configuration
evidence, not a read-back of private production settings. Do not turn any on from
this acceptance record alone.

The activation checklist above remains mandatory: exact per-language notice
approval and published read-back, reviewed type list, application form/relay
acceptance, separately authorized private connectivity and key provisioning,
compatible rollback/retention coverage, production candidate Nginx checks and
an explicit per-app release/activation decision. Partner promotion needs its own
approved policy. Readiness of the draft does not satisfy these publication gates.
