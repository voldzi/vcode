# ADR 0002: Governed automated technology blog

## Status

Accepted.

## Context

VCode needs a bilingual technology blog that can collect public Czech technology feeds every six hours, create one original briefing and accept reader comments. The existing portfolio remains a static Astro build served by a hardened Nginx container.

## Decision

- Keep the portfolio static and add a small server-rendered blog service behind the same Nginx origin.
- Collect only publisher-provided RSS/Atom metadata and summaries. Do not copy full articles or bypass publisher controls.
- Maintain a typed source registry. The initial catalog has twelve Czech and primary English sources; a source stays disabled until its official machine-readable feed and collection terms are verified.
- Collect every six hours and generate at most one draft per UTC day.
- Build a deterministic evidence cluster before generation. Accept either an official primary/authority source or at least two independent publications and show direct source links.
- Generate one Czech and one English version in one structured OpenAI Responses API call.
- Default to `gpt-5.6-luna`, low reasoning effort, no tools and no stored response; model choice remains configurable and must be quality-evaluated before changing tiers.
- Enforce one run per day, fixed input/output limits, a daily token ceiling and a monthly cost ceiling in PostgreSQL before any generation call. Reserve worst-case usage before the call and reconcile it afterward.
- Keep generation disabled until the dedicated VCode project key is mounted and an explicit production smoke test passes.
- Use deterministic branded SVG artwork instead of paid image generation in the first release.
- Store public articles, source provenance, run history, usage and comments in a dedicated PostgreSQL database reached through a private deployment-time endpoint.
- Hash optional commenter email and source IP with a private application secret. Display only approved comments.
- Default articles and comments to pending human review. Record a named reviewer and editorial audit event for every publication or rejection.
- Use AKB/Docling only for individually approved primary documents; do not bulk-ingest third-party news articles.

## Consequences

The main website remains fast and cacheable. Blog pages and comments depend on PostgreSQL, but their failure does not remove the portfolio or help pages. The blog has a writable surface and therefore needs database backup, moderation, retention, rate limiting and a separate dependency health check.
