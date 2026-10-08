# VCode Recall — prepared release and download contract

Status: **preparation only / NOT READY TO PUBLISH**. No final app, package,
public feed, production download service or tracking activation is accepted by
this document. The app administrator must separately send READY-TO-PUBLISH.
Never substitute an old ChromaStatusBar package, a local unsigned archive or a
different build. Product and guide publication status require a separate owner
decision; a successful website build is not product release acceptance.

## Source and compatibility

The source updater consumes schema 1 at the exact URL:
https://vcode.zeleznalady.cz/downloads/chromadb-status/latest.json.
It requires a direct 200, no redirect, and at most 65,536 bytes. Downloads must
use HTTPS ZIP/DMG URLs under this prefix on the exact VCode host. Preserve this
endpoint and the older product anchor #chromadb-status unless the app
administrator explicitly changes the source compatibility contract.

New authorized public filenames use **VCodeRecall**, never ChromaStatusBar.
The bundle is VCode Recall.app; technical executable and bundle identifier
remain ChromaStatusBar and cz.home.chromadb.statusbar. Technical manifest name
ChromaStatusBar alone does not indicate an old package: exact new filenames,
bundle identity, signatures, hashes and approvals determine acceptance.
macOS minimum 26.0 and Apple Silicon / arm64 must match the final sealed app.

**Schema 2 below is the prepared VCode handoff contract, not a claim that the
final app manifest has this shape.** The inspected source writer has an earlier
package-manifest shape. Before activation reconcile the publisher's actual
final manifest. Any adapter needs explicit review, preservation of original
manifest bytes/hash, a signed binding of every normalized field, and unchanged
release gates. This preparation accepts no older schema automatically.

## Closed public handoff manifest

Schema 2 file: VCodeRecall-<version>-<build>-macos-arm64.manifest.json.

Exact fields: schemaVersion, name, version, buildNumber, build, platform,
minimumSystemVersion, bundleIdentifier, distribution, notarized, signing,
payloadTreeSHA256, artifacts, archive, sha256.

- schemaVersion: 2; name: VCode Recall or technical ChromaStatusBar.
- version: three bounded numeric components without leading zeros.
- build and buildNumber: identical nonzero numeric strings, maximum 20 digits.
- platform: macos-arm64; minimumSystemVersion: 26.0.
- bundleIdentifier: cz.home.chromadb.statusbar.
- distribution: public; notarized: true; signing: developer-id.
- payloadTreeSHA256: exact 64 lowercase hexadecimal characters.
- archive and top-level sha256: exact installer ZIP filename/hash.

Each artifact has exact fields {file,kind,sha256,sizeBytes}. Exactly two
installer records, at least one license record and at least one source record
are mandatory. Maximum ten records, no duplicates or unexpected fields.
Every file uses the same VCodeRecall-version-build-macos-arm64 base:

| Kind | Closed suffix set |
| --- | --- |
| installer | .zip, .dmg |
| license | .licenses.zip, .licenses.txt, .licenses.json |
| source | .sources.zip, .sources.tar.gz |

All exact hashes and byte sizes are mandatory. Actual license/source naming
differences require a reviewed contract change, never a catch-all file route.
The app is free to install and its own code is proprietary; third-party license,
notice and corresponding-source obligations still require complete review.

Immutable URLs:
`/downloads/chromadb-status/<version>-<build>/<exact-file>`.

Only accepted manifest files are loaded. Bounded SHA-256 checksum, public
manifest and immutable latest metadata are derived from that accepted data.
Root latest.json remains schema 1 and selects the current DMG. Private receipts,
keys, source checkout, build folders, project/index data and .env are never served.

## Trusted signed acceptance and separate human handoff

Version 1 Ed25519 envelope has exactly {schemaVersion:1,payload,signature}. Signature
is canonical-base64 of 64 bytes over UTF-8 canonical(payload): recursively
sorted object keys, unchanged array order and compact JSON. The trusted public
PEM key is separately provisioned and must not be group/world writable.
Private signing keys never enter the website repository/container/dashboard.

Payload exact fields:
schemaVersion, productId, releaseId, manifestSHA256, artifacts, app,
notarization, acceptance, licensing, ready, privacy, issuedAt.

Manifest/artifact bytes, hashes and sizes are bound exactly. App evidence:

- bundleName VCode Recall.app and exact ID/version/build/minimum system/platform;
- Team **MC3RPR926P**, Developer ID, hardened runtime and Apple timestamp;
- exact CDHash, Tooling tree hash and native-runtime tree hash;
- verified signature, self-contained native runtime and cs/en resources.

The app and DMG separately require Apple status Accepted, submission ID,
successful staple validation and Gatekeeper assessment. Installer evidence
requires exact-artifact clean install, quarantine launch, offline first run,
login/autostart, MCP clients and retrieval, real two-version replacement,
rollback, removal and both languages.

The exact closed `acceptance` keys are:
`cleanInstall`, `quarantineLaunch`, `offlineFirstRun`, `loginAndAutostart`,
`mcpClients`, `retrieval`, `twoVersionReplacement`, `rollback`, `removal`,
`csAndEn`. All must be literal `true`, supported by real evidence for the exact
final installer. Extra fields such as a check count or pending reason are not
accepted in this object; keep detailed evidence in the private publisher dossier.
An isolated native 12-check pass does not establish installed frozen stdio
owner-settings discovery. While that client path remains pending, do not claim
`mcpClients: true` or issue READY. Do not relabel old candidate evidence or run
unrelated broad suites merely to satisfy this closed object.

Licensing evidence is exactly {applicationLicense:"proprietary-free",
licenseReviewComplete:true,requiredSourcesComplete:true,requiredSourceFiles:
[exact source filenames matching the manifest]}.

These are publisher-Mac checks, not operations performed by the Linux/Node
download service. The trusted signer must collect real evidence before signing.
Manifest booleans alone cannot replace evidence. A source test/build or a
synthetic fixture signature is never Apple/installation acceptance.

Ready evidence is {status:"READY-TO-PUBLISH",approvedAt}; privacy evidence is
{status:"APPROVED",noticeSHA256,approvedAt}. Times are normalized ISO UTC.
The exact approved CZ/EN notice hash and release ID also need independent
authenticated operator --ack-privacy and --ack-ready arguments. A plain uploaded
JSON, untrusted signature or matching version number does not unlock publication.
Publish the concrete reviewed notice before enabling distribution or measurement.
The build gate verifies the approved privacy/terms document hashes, compares the
privacy hash with the signed handoff, and requires all four locale privacy/terms
pages with their approved-copy markers. RecallLegal renders only the recipient
language from the reviewed Markdown, never the private review notes. Routes remain
absent while the product is a draft. Source templates and local previews exist;
the public pages are not deployed. Verify their actual HTTPS content before
activation: a valid receipt alone is not evidence of successful production delivery.

## Offline publication and atomic state

scripts/recall-release.mjs is a privileged, offline operator tool. It receives a
dedicated artifact root, owner-only private catalog, trusted public key, controlled
handoff directory, exact manifest/receipt filenames and exact acknowledgments.
It never signs evidence or runs Mac verification.

Publication acquires an exclusive lock, hash-checks source files, copies through
O_NOFOLLOW descriptors, hashes staged copies, seals artifacts read-only and
atomically replaces the private catalog. Existing immutable release IDs are
refused. Stage failure preserves the previous active release. A completed
unpublished orphan after catalog-write failure stays private for reconciliation;
an existing active release is never deleted automatically.

Catalog shape:
`{schemaVersion:1,productId:"vcode-recall",activeRelease,
releases:[{id,manifestFile,manifestSHA256,receipt}]}`.

All path components must be real directories/files, without symlinks.
Use a trusted publisher account and read-only artifact mounts; these checks are
not isolation against a privileged host administrator modifying open files.
Node UID 1000 must traverse artifacts and read its owner-only catalog. Prepare
host ownership deliberately and use a separate writable metrics directory.

--rollback <accepted-id> rechecks prior signed acceptance/hashes and exact operator
acknowledgments before atomically selecting it. Binaries never change under an
existing URL. --export-public returns null without an active release, otherwise:

`{version,buildNumber,minimumSystemVersion,platform,manifestURL,
artifacts:[{file,sha256,sizeBytes,url}],
complianceArtifacts:[{file,kind,sha256,sizeBytes,url}]}`.

This public subset excludes receipts, evidence, keys and private paths.
After owner READY/notice approval, export on the trusted host, intentionally set
product/guide publication status, then build the static website. Do not COPY
private artifact/evidence directories into the general website Docker context.

--export-private-build-proof returns a bounded private document
{schemaVersion:1,manifestBase64:<exact original accepted manifest bytes>,
receipt:<original signed acceptance envelope>}. It first re-verifies the catalog,
trusted signature and actual artifact hashes. No proof is generated in this
preparation. A future published web build receives this proof (maximum 131,072
bytes) and the trusted Ed25519 public key as BuildKit secrets, never COPY files.
The build gate independently decodes/parses/hash-checks the manifest, verifies
the signature and compares publicMetadata with the requested public metadata.
BuildKit secrets must not be copied to output, printed or committed. The broker
separately verifies actual ZIP/DMG/license/source files in its runtime root.

## HTTP, monitoring and deployment boundaries

Default configuration is healthy but disabled: downloads 404, intent 503,
metrics unavailable. Compose profile and proxy activation remain off.
GET/HEAD require exact raw allowlisted URLs; encoded aliases, queries, traversal,
unknown files and multipart/invalid ranges are refused. Single byte ranges use
206/416, precise length and Content-Range. HEAD has no body. 304 omits fabricated
Content-Length. MIME, attachment filename, SHA-256 ETag, immutable version cache
and latest revalidation are explicit; errors are no-store.

The public listener has no health/metrics route and no identity/cookie response.
Private health: container loopback 127.0.0.1:8097/health, never publicly proxied.
Catalog changes trigger a full streaming hash check. Availability/file identity
probes run each minute; independent full hash reconciliation each six hours.
Drift removes public resources and fails private health. Every opened artifact is
also identity-checked before a response. Use infrastructure private health alarms.

Disable per-request access logs at both proxy tiers for downloads and intent.
Intent accepts POST /analytics/download-intent, exact same origin/site,
application/json, maximum 128 bytes and only {product:"vcode-recall"}. It
rejects Cookie/Authorization and arbitrary fields. DNT/GPC suppress counting;
a bounded global allowance creates no address/device keyed records.
Frontend fetch uses credentials:"omit" and referrerPolicy:"no-referrer", DNT/GPC,
offline and public-route/query/hash guards. No deferred offline intent queue.

## Aggregate metrics contract

DOWNLOAD_METRICS_PATH stays private. The dashboard separately authorizes the
signed-in user's access to the VCode website before reading it. Missing config/file means unavailable, not
zero. No metrics file is created until an approved active release exists.

Exact document fields:
schemaVersion:1, product:"vcode-recall", measurement:"service-to-proxy",
retentionDays:30, timezone:"UTC", coverageStart, updatedAt, releases, days.

Release records: {id,version,buildNumber,artifacts:[exact installer ZIP/DMG names]}.
Day records: {date,release,artifact,getRequests,headRequests,fullResponses,
rangeResponses,errorResponses,abortedResponses,bytesWritten,clickIntents}.
artifact:null groups metadata/latest/checksums/license/source and click intention.
It is excluded from installer-delivery KPI totals. Unknown URL labels are not stored.

GET, HEAD, completed 200 full-file responses, completed 206 partial responses,
errors, interrupted responses, click intentions and written bytes remain distinct.
Bytes mean the service response stream toward its proxy, not confirmed browser
receipt. Server finish is not TCP/client acknowledgment. Bots, proxy retries/caches
and aborted buffered writes affect totals. Never label them people, installations,
unique visitors or app launches.

Counts are merged immediately in memory and durably written by one coalescing
atomic writer, without a per-request promise/raw-record queue. Keep current UTC
day +29 preceding days; prune on write/read and a minute idle timer. Existing
validated private state is also pruned at startup and while publication is
disabled, including an empty catalog or missing publication configuration.
Disabling collection never authorizes new counts or creates a missing state file.
Exclude this state from backups or apply the same 30-day retention to them. Before
fully stopping the service, remove the aggregate file or arrange independent
private cleanup: a stopped container cannot run its retention timer. Bound to
32 published identities, 2,910 day buckets and 2 MiB. No IP, user agent, referrer,
identifiers, project/prompt contents, raw URLs or cookies. Write/read failure
reports unavailable instead of replacing genuine counts with invented zeros.

Tests: node --test services/downloads/test/*.test.mjs uses only disposable
synthetic bytes and ephemeral Ed25519 keys. It never launches or inspects an
installed app, model, index, Apple account or genuine visitor. A sandbox may
require normal local loopback-test permission. Dockerfile.downloads builds only
this prepared, disabled service; publication remains a separate release gate.


## Privately implemented version 2: existing-owner-account

Version 1 remains unchanged. A separately versioned envelope and payload with
schemaVersion 2 can represent an explicitly owner-approved, narrower installer
scope. The payload has the same exact fields as v1 plus `scopeApproval`.
`acceptance` becomes `{scope:"existing-owner-account",checks:{...}}`, with all ten
original check names present and literal PASS/NOT-RUN statuses. Mandatory PASS:
offlineFirstRun, loginAndAutostart, mcpClients, retrieval, twoVersionReplacement,
csAndEn. Only cleanInstall, quarantineLaunch, rollback and removal may be
NOT-RUN; the corresponding omission list must exactly match the signed approval.

`scopeApproval` is exactly `{status:"APPROVED",scope:"existing-owner-account",
notRunChecks:[sorted exact omitted check names],approvedAt:<UTC ISO>}`. Its approval
time must not follow issuedAt. All unchanged application, notarization, licensing,
manifest, ready and privacy gates still apply. Real data/settings preservation
is part of the existing-owner two-version update evidence. Earlier-build client
tests cannot establish PASS for the final build.

Publication and promotion additionally require independently verified operator
`--ack-scope` equal to SHA-256 of UTF-8 canonical(scopeApproval). The publisher
signature alone cannot authorize omitted checks. A load/export of an already
accepted private catalog does not perform a new publication or promotion.
The signed receipt and approval details are not public. Website release metadata
includes only validation.scope and validation.notRunChecks, bound to the signed
proof, so the public disclosure cannot silently omit unexecuted scenarios. The
updater feed continues to contain only updater fields.

Concrete coverage review and test results:
`docs/recall-existing-owner-acceptance-review.md`. Direct owner approval is verified;
the v2 runner and genuine receipt were subsequently accepted in production.
Final evidence is in recall-final-handoff.md. Do not describe scoped acceptance
as clean-Mac acceptance or mark unexecuted scenarios PASS.
