# Partnership intake v1 — implementation contract

Status: preparation only. No deployment or production activation is authorized
by this document. Current VCode contact routes, consent text, limits and retention
remain unchanged. The human owner requested this shared feature in Moje porce on
9 October 2026; VCode directly checked that request before implementation.

Machine-readable definitions are deliberately split: the existing
[public OpenAPI](../openapi/openapi.json) adds only five authenticated browser
paths (six operations). The [private service contract](../services/blog/partnership-openapi.json)
contains seven server-only paths (eight operations), including challenge and
submission. It is a nonpublished source file, never a static asset or public
Nginx route. Both contracts are self-contained and checked by `pnpm validate:openapi`.

## Application relay → VCode

Private server-to-server routes in the existing reviewed blog service:

- `POST /internal/partnerships/v1/challenge`
- `POST /internal/partnerships/v1/submissions`

Both require `Authorization: Bearer <application-specific key>`. The app ID is
derived solely from the central key registry, never a body/header claim. Keys,
registry and internal service URL stay on servers. Each application supplies
same-origin relay endpoints, suggested `POST /api/partnerships/challenge` and
`POST /api/partnerships`, in its own design. Browser origin/session/CSRF checks,
an anonymous public form, request-size and local rate limits are mandatory in
the relay. Do not forward cookies, authorization from browsers or arbitrary
headers. No raw visitor IP is forwarded to VCode.
These routes are not published by public Nginx. Use the existing private same-host
service network or a separately approved restricted TLS connection across hosts;
never carry keys or contact data over an unprotected LAN. This preparation adds
no network, exposed port, firewall rule or public proxy route.
Private requests do not carry browser context: reject `Origin`, `Cookie`,
`Sec-Fetch-Site`, `Sec-Fetch-User`, `Sec-Fetch-Dest` and unknown fetch metadata.
Node's standard fetch adds `Sec-Fetch-Mode: cors` even for a server request; that
sole generated mode is permitted only when the other browser context is absent.
This transport allowance does not relax authentication or local browser protections.

Challenge JSON (no extra fields):

```json
{"requestId":"11111111-2222-4333-8444-555555555555","locale":"cs","clientBucket":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"}
```

`clientBucket` is a 43-character base64url HMAC-SHA256 computed **by the relay**
over a purpose prefix, UTC hour and its verified client address with its private
per-app key. It is never accepted from the browser. It is used only in bounded
central in-memory anti-spam counters (at most one hour), not persisted or logged.
The relay also limits requests locally using its trusted ingress address.
Submission and explicit retry use the original token's issue hour to derive the
bucket, including after that token's ten-minute expiry. The relay may decode the
untrusted token payload solely to select a well-formed non-future issue time no
more than 90 days old; decoding is not proof of validity. VCode still verifies
the signature and all bindings. New offers additionally require valid challenge
timing; only an existing retained receipt may ignore the token's ten-minute
expiry. If the verified ingress address or app key changed, obtain a fresh
challenge with the **same** request ID and unchanged business payload. Never
substitute the current-hour bucket for an original-token retry or accept a
browser bucket or timestamp as a server identity claim. Anti-spam entries expire
from current request arrival within one hour even for a historical issue hour.

Successful challenge: HTTP 200, JSON with `ok:true`,
`contractVersion:"partnership-intake-v1"`, `appId`, `requestId`, `token`,
`minimumDelayMs:1500`, ISO `expiresAt` and
`privacyVersion:"partnership-intake-20261009-1"`. Token HMAC binds app,
request ID, bucket, locale, notice version and issue time. TTL 600000 ms.
The token has two dot-separated parts: base64url JSON and its signature. The JSON
contains `appId`, `requestId`, `locale`, `privacyVersion`, `issuedAt` (Unix ms) and
`nonce`; it does not contain the client bucket. The signature binds the opaque
bucket separately. Clients treat the token as opaque except for the relay's
bounded issue-hour derivation above. Submit tokens must be nonempty strings of
at most 2048 characters; retain the original token when explicitly retrying.

Submit JSON (no extra fields; `organization` optional/null):

```json
{"requestId":"11111111-2222-4333-8444-555555555555","locale":"cs","clientBucket":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","token":"synthetic-token-replaced-by-challenge","privacyVersion":"partnership-intake-20261009-1","name":"Synthetic Partner","email":"synthetic@example.invalid","organization":"Synthetic organisation","type":"vyrobce","message":"Synthetic partnership offer for isolated testing only.","website":""}
```

Name 2–100 Unicode characters, email 3–254 with conservative address validation,
organisation 0–160, message 30–4000. NFC normalization, CRLF normalization,
trim and control-character rejection. `website` is a honeypot and must be empty.
Type is a fixed per-app registry whitelist, not free text. Moje porce uses
`vyrobce`, `obchod`, `autor-receptu`, `jine`, app ID `kaloricke-tabulky`.
Městem hrou/Myslopis receive their own reviewed type lists before activation.
Locales are `cs`/`en`; the relay deliberately passes a supported notice locale.

Both request bodies are strict JSON/UTF-8, at most 16384 bytes, no compression.
Reject appId/domain/source/account fields. No attachments or phone numbers.
The notice version must match the authenticated app's approved registry version.

HTTP 202 only after atomic commit of inquiry, idempotency receipt and outbox:
`{"ok":true,"contractVersion":"partnership-intake-v1","requestId":"…","reference":"…"}`.
Same app/requestId/normalized payload returns the same reference throughout the
original 90-day retention, without a second message/outbox, even if a response
was lost and the original token expired. Changed content is HTTP 409. Reuse of
a token for another app, request ID, bucket or locale is rejected. Deletion
leaves only a minimal non-contact idempotency tombstone until original expiry;
retry is then HTTP 410, never message resurrection. After expiry a new message
requires a new valid challenge and deliberate user submission.

All errors: `{"ok":false,"code":"…","message":"safe fixed text","requestId":"…"}`.
Invalid/missing request ID is represented by null; no field values or internal
errors are echoed. Codes: 400 `invalid-input` / `privacy-version-mismatch`,
401 `unauthorized`, 403 `rejected`, 404 `not-found`,
405 `method-not-allowed`, 409 `idempotency-conflict`, 410 `request-closed`,
413 `too-large`, 415 `invalid-content-type`, 429 `rate-limit`,
503 `unavailable`. `Retry-After` is 1–3600 seconds for 429 and 60 seconds for 503.
The relay exposes these safe responses only, with its own fixed error copy,
no-store, a 64 KiB response bound, redirect:error and an 8-second total timeout.

Central counters: per app/bucket 12 challenges/10 minutes, 8 submissions/hour;
per app 120 challenges/10 minutes and 60 submissions/hour. Persistent daily
capacity: 30 new inquiries/app and 100 total, including deletion tombstones.
Retries do not consume a new daily slot. Counters contain keyed opaque buckets,
never raw addresses. Registered apps must be catalogued; disabled/revoked apps
cannot send. Duplicate/malformed keys or incomplete approval/publication metadata
for an enabled app fail closed. A disabled entry may have no key file, so revoking
it does not disable other valid apps. Registry files are re-read per request.
Notice URLs are fixed same-origin HTTPS values, permitting a bounded approved
query such as Městem hrou's `?zobrazit=soukromi`; maximum URL length is 2048
characters and query length 512. The service never fetches them.

## Private dashboard → VCode

Browser routes: `/prehled/api/partnerships` (GET list),
`/prehled/api/partnerships/{id}` (PATCH workflow, DELETE),
`/prehled/api/partnerships/{id}/promote` (POST),
`/prehled/api/partners` (GET list), `/prehled/api/partners/{id}` (DELETE).
Private service equivalents: `/internal/partnerships/v1/inquiries`,
`/internal/partnerships/v1/inquiries/{id}` and `…/{id}/promote`,
`/internal/partnerships/v1/partners` and `…/partners/{id}`.

Use current contact inbox service credential plus canonical lower-case UUID
`X-VCode-Admin-Id` derived
from a fresh upstream admin verification. Only the configured inbox owner with
VCode website permission is allowed initially. An application key cannot read,
change, delete or promote anything. Browser cannot choose its actor/role.
Writes require same origin; no private content in PWA/offline caches or logs.
For PATCH/promotion, the broker re-verifies owner role and website permission
after reading the body and immediately before forwarding, requires the same
verified actor and uses the current credential/context. A revoked role cannot
complete a write using an earlier pre-body verification.

Workflow stages: `new`, `reviewing`, `waiting`, `pilot`, `active`, `closed`.
PATCH body: required positive `expectedVersion`, plus one or more of `stage`,
`managerId` (configured owner only, or null), `nextAction` (0–500 chars, single-line,
trim/NFC normalized, or null),
`nextActionDueAt` (UTC ISO instant ending in `Z`, with optional three-digit
milliseconds, or null, strictly before original expiry).
At most these fields. Optimistic conflict returns 409 without changing data.
Item fields: id, appId, type, locale, name, email, organization, message,
privacyVersion, stage, managerId, nextAction, nextActionDueAt, version,
createdAt, updatedAt, expiresAt, audit[]; no hashes, keys or tokens.
Audit entries: id, actorId, action, changedFields[], fromStage, toStage, createdAt;
no historical copies of message/contact/next-action text. Actions are `created`,
`workflow-updated` and `promoted`; return the latest 200 audit entries per inquiry.
Audit and outbox expire with the inquiry. GET list parameters `limit` 1–100
(default 50), `stage`, `appId`; no other or repeated query fields are accepted.
Service response:
`{items,summary:{new,reviewing,waiting,pilot,active,closed,total},notifications:{pending,sent,failed},applications:[{id,name,types}],promotionEnabled:[{appId,policyVersion}]}`.
Counts cover retained entries matching app/stage filters, independently of item
limit; they decrease on deletion/expiry. Browser broker adds `managerId` from its
freshly verified configured owner context, never from the service or browser input.
PATCH returns `{ok:true,item}`; DELETE returns `{ok:true,reference}`.
New anonymous inquiries start with `audit:[]`; receipt does not invent an admin
actor. Current writes record `workflow-updated` or `promoted`. The reserved
`created` action, if used in a future compatible implementation, must retain
the same non-null actor and stage fields.

Promotion is default-disabled and separately owner-reviewed per app. Its body
is `{"expectedVersion":1,"displayName":"Synthetic organisation","policyVersion":"synthetic-approved-policy"}`.
It must not copy the inquiry, contact address or message. Approved minimal
partner fields: id, appId, type, displayName, policyVersion, createdBy,
createdAt, expiresAt (bounded 1–365 days by the separately approved policy).
An optional source inquiry link is set null on source deletion; partner is not
an indefinitely retained inquiry. Promotion never authorizes data imports,
contracts or licences. No legal agreement or data-import automation is added.
Promotion returns `{ok:true,partner}`. Partner GET supports `limit` 1–100
(default 50) and optional `appId`, with no stage filter; response `{items}`.
Partner DELETE returns `{ok:true,reference}`. Internal source inquiry IDs are
not exposed in the minimal partner response.

## Activation boundary

New backend and per-app registry flags default false. Prepare exact public
processing notices per application and have owner review/publication recorded
before enabling any intake. This preparation does not change analytics scope.
Telegram sends only a generic reference, canonical application name and a
private inbox link. Never message/name/email/body/visitor IP or a public token.
Outbox is transactional, retries bounded and lease guarded across replicas.
Retention is exactly 90 days from original receipt, unaffected by stage,
assignment, retry, promotion or further workflow edits. Active partners have a
separate reviewed bounded expiry and can be explicitly deleted.
Keep the global challenge/fingerprint secret compatible with retained idempotency
receipts for their original 90-day lifetime; per-app key rotation is independent.
Rollback must preserve partnership retention maintenance with intake disabled if
any accepted records exist. Restoring an old image without a compatible purge
task does not meet that retention rule. See `partnership-operations.md`.
