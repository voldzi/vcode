# Moje porce presentation — 2026-10-05

The owner approved Moje porce / https://mojeporce.cz and subsequently authorized completing the expanded VCode presentation and publishing it. The application chat confirmed the current Czech interface; additional languages remain a future plan without a promised date.

## Published scope

- Czech and English homepages begin with everyday services: Moje porce, Masáže and Studio Balance. All 21 products remain present exactly once in each locale.
- The existing `kaloricke-tabulky` identifier and product/help slugs remain stable.
- The product detail explains recipes, pantry, shopping and actual portion logging, free core features, Premium beta, PWA installation and FAQ.
- Both VCode guides link to the current guide maintained by the application. English copy explicitly describes the current Czech interface.
- Offline wording is limited to local diary logging. AI requires a connection and review before saving. No prices, trials or subscription purchase availability are promised.
- Analytics collection, privacy content, event handlers and application deployments were not changed.

## Verification and release

- `pnpm check`: zero errors and warnings; existing hints only.
- `pnpm test`: 37 tests passed.
- `pnpm build`: 122 static pages built. Check and build were run sequentially after an initial concurrent generated-content cache race.
- Browser checks: desktop, 390px mobile without horizontal overflow, keyboard FAQ activation, and 200% default text size without horizontal overflow. Text-size and viewport overrides were reset.
- All three production images built; only the VCode web service was recreated. Existing blog and worker stayed running.
- Deployed web image: `sha256:2ec233d769a1a429143f236316679884f629410f11a984978b5a32a275cd478b`.
- Public health, both homepages, product/help pages in both locales, representative NEST/STRATOS routes, blog locales, sitemap and analytics tracker returned HTTP 200.
- Updated static pages matched the local reviewed build byte for byte. Description, Open Graph and Twitter metadata agreed.
- All nine linked Moje porce routes returned HTTP 200. Public probes used DNT/GPC headers and did not execute collectors; browser acceptance used a local static preview.
- Previous content and web image were retained in the private production release archive for rollback.

This release does not establish English application functionality or enable self-service Premium sales.
