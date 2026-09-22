# VCode project guide

## Mission

Build and operate the bilingual VCode portfolio, support and legal-information website.

## Source of truth

- Product data: `src/lib/products.ts`
- Public help: `content/guides/`
- Blog service and worker: `services/blog/`
- Public API contract: `openapi/openapi.json`
- Architecture and operations: `docs/`
- Production artifact: static `dist/` served by the checked-in Nginx configuration

## Rules

- Keep portfolio and help routes static. Blog writes must stay inside the reviewed `services/blog` boundary.
- Never expose AKB, PostgreSQL, S3 or internal endpoints and credentials to the browser.
- Publish only guide entries marked `classification: public` and `status: published`.
- Update both Czech and English experiences intentionally; do not machine-publish an unreviewed translation.
- Legal and privacy content requires product-owner review before release.
- Preserve accessible semantics, keyboard use, 200% text zoom and responsive layouts.

## Validation

Run `pnpm check`, `pnpm test` and `pnpm build`. For deployment, build both Docker images and smoke `/health`, `/health/blog`, both locales, representative product/guide pages and both blog locales.
