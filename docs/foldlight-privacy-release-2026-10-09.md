# Foldlight privacy publication — 9 October 2026

The product owner approved the exact Czech and English wording with “Schvaluji zveřejnění těchto zásad”. The approved copy and hashes are recorded in `app-store-connect/foldlight-privacy-review.md`.

## Live routes

- Czech: https://vcode.zeleznalady.cz/foldlight/privacy/
- English: https://vcode.zeleznalady.cz/en/foldlight/privacy/

Both dedicated pages identify VCode and podpora@zeleznalady.cz, use the actual publication date, describe the twelve offline puzzles, local saved progress and preferences, on-device fold/tilt processing, retention/deletion and optional external links/support. This publication does not establish an App Store upload, Apple approval or public availability of the game.

## Scope and validation

Three new source files were added: `FoldlightPrivacy.astro` and one route per language. Shared layouts, legal notices, analytics, application catalogue, blog, downloads, authentication and databases were not changed. The candidate used the then-live production public-source baseline and preserved the four Rinklet privacy/support pages published concurrently; unrelated partnership work in the local checkout was not activated by this release.

- Content/API/public-boundary and Astro checks passed with zero errors and warnings. Fifteen existing hints remain.
- All 122 existing tests passed: 33 blog, 57 analytics, 32 downloads; acceptance used only synthetic records and temporary local servers.
- The final static build produced 162 pages and passed the signed Recall-publication, catalogue and contact gates.
- Both Docker image types were built; only the static web was activated. The candidate Nginx image passed its boundary test, including strict dashboard CSP, inherited asset headers, compression, anonymous 401, contact-route limits and distribution byte ranges.
- Browser QA verified both languages at 390 × 844 pixels and the equivalent 200% text rendering. The support email initially clipped at 200%; the new component now wraps long words. At 200%, the contact's right edge is 340.14 pixels within the 390-pixel viewport. Each page has one h1 and correct language/canonical/alternate/support/product links.
- Live browser verification confirmed both approved pages and the language switch. No horizontal overflow was observed. Temporary viewport overrides were reset.
- Public checks passed for both policy pages, health/blog health, both home/blog locales, representative product/guide/support pages, sitemap and security headers. Existing public legal text and the actual tracker/site/download-script bytes remained unchanged; the private summary still returns 401 with no-store.
- Eight related runtime identities and start times remained unchanged: blog, worker, downloads, analytics dashboard/collector/monitor/database and Umami. No genuine visitor or support records were used.

## Deployment identity and recovery

Final healthy static image: `sha256:4428b85131988daba5aad971c5837ebb2c15db6ccf34c11325a72f1d33121428`.

Previous healthy image retained for rollback: `sha256:1149e0f0c3873a7cc2c7a6147abf98a7f8b68fb1a26aecf6ba7136409c167e4d`.

Before activation, all public-source baseline hashes and owned file hashes were checked, the prior image was retained and the existing legal/asset baselines were recorded. An earlier preflight safely stopped when the concurrent Rinklet image changed. One intermediate activation was automatically rolled back because an auxiliary check incorrectly treated the proxied analytics script as a static web file; the check was corrected to compare its actual public bytes before and after. The final activation passed all checks.

Private release evidence contains the exact reviewed policy hashes, public-source snapshot, immutable candidate IDs, owned-file backup, before/after runtime identities, build/acceptance logs and rollback script. No private host values, signing material, registry values or visitor data are included here. Preserve the existing contact/Recall overlays on any future affected-service deployment.
