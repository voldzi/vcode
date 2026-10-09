# Collaboration inbox release — 9 October 2026

## Released scope

The Czech `/spoluprace/` and English `/en/work-with-us/` pages now accept collaboration enquiries with an area and optional canonical application. Messages appear in the owner's authenticated dashboard, with read/closed status, reply through the owner's mail client and explicit deletion. Telegram receives only a generic notification, never the visitor's identity or message contents.

The dashboard separates collaboration-link clicks from received messages and shows retained enquiry counts by area/application. These are event/message counts, not unique people. Spam controls use signed short-lived challenges, a minimum delay, a hidden field and bounded limits without an external CAPTCHA. Dashboard messages expire within 90 days.

The owner expressly approved both notice languages and activation on 9 October 2026. The approved version is `contact-20261009`; the `ContactPrivacy.astro` SHA-256 is `7f88a9df16c954a3c31fa68734ac6e393f689f4b0cee1e2c2e031f3d128fe637`.

## Release identity

Baseline: `ae56bf5`. Reviewed implementation: `34b796c`, `5b40589`, `5fba824`, `b9d05e3`. The last change bounds website selectors at enlarged mobile text sizes.

| Runtime | Verified image identity |
| --- | --- |
| Static web | `sha256:2b0d1b124e9af5c6ee6efe945cb0229eb1e508ca1bb6292fb8003441a0267fab` |
| Blog/contact service | `sha256:fe6ddbca464b0a8859953bd3ef7385feb0cbc66ed09d37f75befb7568587ea7d` |
| Private dashboard | `sha256:4831dbd55a1d615fd4a14045a3f8173a4e6ed19e93c36057ac681006b04ac0d4` |
| Preserved Recall downloads | `sha256:5c3e6b98053109b065e4f2f08e7edaea28e6bf23601801c4485266698a628a6f` |

All four services were healthy after deployment. The blog worker's runtime identity, morning schedule, budget and manual publication settings were preserved. Private rollback evidence includes the previous owned source files, immutable image identities and edge configuration. Source replacement checked baseline hashes before writing and final hashes afterwards. The additive contact schema is retained on rollback.

## Verification

- `pnpm check`: zero errors and warnings; 13 existing hints.
- `pnpm test`: 102 passing tests (33 blog, 37 analytics, 32 downloads).
- `pnpm build`: 154 static pages; bilingual contact and 25-product catalogue validators passed.
- Web, blog and dashboard images built. Isolated Nginx acceptance passed CSP/security headers, public exact contact routes, trusted proxy headers, 16 KiB limit, internal route isolation and the existing download boundary.
- Disposable PostgreSQL acceptance passed repeatable migrations, atomic message/outbox writes, concurrent idempotency, bounded Telegram retries, deletion cascade and exact 90-day retention. No production records or secrets were used as fixtures.
- Synthetic browser acceptance passed both languages, mobile layout, 200% text, challenge retry without lost input, accessible status-change focus and clearing of inbox contents after logout.
- Production smoke passed both health endpoints, homepages, collaboration/privacy pages, representative products/guides, both blog locales, PWA assets and tracker. Anonymous inbox access returned 401; unknown public contact/internal paths returned 404.
- One synthetic production enquiry was accepted durably. An exact retry retained one reference and one notification job. Owner verification, canonical VCode permissions and existing Recall integration passed. The enquiry could be marked read.
- Telegram's API accepted the generic test notification. This confirms API delivery; viewing it on a physical phone was not part of acceptance.
- The exact synthetic enquiry and its outbox job were removed. Logout revoked inbox access. No genuine enquiry or visitor records were copied into acceptance evidence.
- The enabled empty production form was inspected at 390 px: no horizontal overflow, all 25 application choices and the approved privacy link present, submission control enabled. No additional enquiry was sent through the browser.

## Continued operation

Preserve both contact overlays and the existing Recall overlay in future deployments; see `docs/runbook.md` and `docs/contact-operations.md`. Independent secrets and the pinned verified owner ID are held in private operator files. Existing public collector contracts remain unchanged; the legacy VCode tracker gained only the approved collaboration event and routes, preserving DNT/GPC.

Routine logical blog dumps must exclude `vcode_contacts`. No existing VCode logical backup schedule was found on the application host. Database-cluster recovery-copy retention could not be independently verified with the available infrastructure access; it remains an operator responsibility. The published 90-day statement is specifically about messages in the dashboard. Restores must run contact retention before enabling inbox access or notification delivery.
