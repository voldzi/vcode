# Recall: proposed existing-owner acceptance scope

Status: owner scope approval verified, implementation tested and genuine receipt
accepted in production with independent operator acknowledgments. Release
0.6.0-202610081600 is live; exact deployment evidence is in recall-final-handoff.md.

## Purpose

Test the exact notarized installer through a real update of the existing owner
account, without claiming a clean installation, fresh-user quarantine launch,
rollback or removal when those scenarios were not executed. The initial account
choice did not by itself establish approval to omit rollback and removal. A
subsequent direct human reply explicitly approved release with disclosed omitted
scenarios and was independently verified by VCode.

## Proposed receipt version 2

Envelope: exactly `schemaVersion`, `payload`, `signature`, with schemaVersion 2.
Payload keeps the version-1 fields and adds `scopeApproval`. Payload
schemaVersion is 2. Signing remains Ed25519 over the existing canonical JSON.
Version 1 remains supported without changing any of its ten mandatory checks.

`acceptance` has exactly `scope` and `checks`:

- `scope`: `existing-owner-account`.
- `checks`: the same ten named checks as version 1, each represented by the
  literal status `PASS` or `NOT-RUN` (never a fabricated boolean).
- Mandatory `PASS`: `offlineFirstRun`, `loginAndAutostart`, `mcpClients`,
  `retrieval`, `twoVersionReplacement`, `csAndEn`.
- May be `NOT-RUN` only after explicit owner approval: `cleanInstall`,
  `quarantineLaunch`, `rollback`, `removal`. If actually exercised successfully
  against the exact final installer, each can instead be `PASS`.
- No `FAIL`, `PENDING`, extra check, missing check or unknown scope is accepted.
- `twoVersionReplacement` requires actual 1131 → 1600 update evidence, including
  preservation of the existing settings and data. A previous-build MCP smoke
  does not establish final-build `mcpClients: PASS`.

`scopeApproval` has exactly `status`, `scope`, `notRunChecks`, `approvedAt`:

- `status`: `APPROVED`.
- `scope`: `existing-owner-account`.
- `notRunChecks`: the exact sorted names whose status is `NOT-RUN`.
- `approvedAt`: UTC ISO timestamp, no later than `issuedAt`.

The human approval must be independently verified by the VCode operator. A
publisher-signed assertion alone does not authorize the omission. Activation
and promotion require an additional `--ack-scope` equal to the SHA-256 of the
canonical `scopeApproval`, alongside the unchanged ready/privacy acknowledgments.

## Unchanged gates

Exact artifacts, byte sizes, SHA-256, manifest identity, application signature,
Developer ID, Team, hardened runtime, timestamp, localizations and native-runtime
integrity remain mandatory. App and DMG Apple Accepted, staple validation and
Gatekeeper acceptance remain mandatory. Licenses, corresponding sources, existing
privacy approval and truthful READY remain mandatory. No legal copy changes.

The scoped result must never be described as clean-Mac or complete installer
acceptance. The private dossier and handoff must retain all NOT-RUN scenarios.

## Required focused verification after approval

Test version-1 compatibility; version-2 exact schema and signed scope; mandatory
PASS rejection; matching NOT-RUN list; absent/mismatched independent scope
acknowledgment rejection for publication and rollback promotion; signature,
Apple, artifact, licensing and privacy failures still rejected. Run the project
checks and build after implementation. No unrelated app suites or reindexing.

## Direct owner approval and signed final scope

Source thread: `019f7987-cd92-7cf3-8503-e31bf9f8867c`.
Question: `call_74fcb2b006cc48dcaa2713b15b598841`.
Direct human reply: `01a11cb2-1dd2-7bb2-9e0f-61e70e8ce6b3`:
“Ano souhlasím zveřejnit s pravdivě uvedeným rozsahem provedených testů.”
The preceding question disclosed the existing-account update and unexecuted
clean/new-account, rollback and removal scenarios. VCode independently read the
human reply; coordinating-agent assertions alone were not used as authorization.

Signed scope approvedAt: `2026-10-08T18:07:14.000Z`.
Receipt SHA-256: `9ae61955c3878bbd2a42611500bace839f990dd7fd449c89d9953b8008a0461e`.
Scope acknowledgment: `ab65553154906e54a56c8cd210ca2a37e7eedd8b0a80f1be42b36dc9b5b68003`.
The genuine Ed25519 receipt passed the VCode validator against the independently
provisioned signer and exact final manifest, including the reviewed privacy hash.

Within this narrower scope, offlineFirstRun means bundled native prepare/activate
without dependency/model downloads, supported by frozen-runtime checks; it does
not claim a clean-account first installation. csAndEn means exact Czech/English
localization-resource checks and reported English GUI acceptance, not a complete
manual bilingual audit. Public copy retains these qualifications.

Website metadata includes only `validation.scope` and `validation.notRunChecks`,
derived from the verified signed receipt. The build rejects removal or alteration
of these disclosures. The receipt, approval details and private dossier are not
published. Updater feed fields remain unchanged.


## Validation of private implementation (2026-10-08)

`pnpm check`: 0 errors, 0 warnings, 12 existing hints. `pnpm test`: 83/83
(27 blog, 24 analytics, 32 downloads). `pnpm build`: 142 pages, draft Recall and
private previews excluded. The 32 download tests also passed with the current
read-only sources on the cached target Node.js 24 image without network access.
Only synthetic artifacts and ephemeral test signing keys were used.

The operator must verify the human scope decision independently before supplying
ackScope; the digest can be obtained through the exported `scopeApprovalDigest`
helper after validation of the genuine signed receipt. The production module and
runner were subsequently updated together with hashes verified and v1 backed up
before accepting the genuine receipt. The first private implementation check above
preceded activation; final evidence is in recall-final-handoff.md.
