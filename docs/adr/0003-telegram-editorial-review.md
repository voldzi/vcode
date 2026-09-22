# ADR 0003: Telegram-assisted editorial review

## Status

Accepted

## Decision

VCode may notify one allowlisted reviewer about a generated draft through a dedicated Telegram bot. The notification contains a brief summary, a short-lived private browser link and signed inline actions. Publishing or rejection requires a second explicit confirmation. The first completed action atomically consumes the review request; repeated Telegram deliveries and actions are idempotent.

The browser page renders both language variants, sources and generation metadata without client-side scripts. It uses a random bearer token whose keyed hash is stored in PostgreSQL. Review pages are not indexed, cached or included in referrers. Telegram secrets are server-side files and the integration is off by default.

## Consequences

Editors can review from a phone without exposing an administration panel. A leaked unexpired review link grants the ability to publish or reject its single draft, so links expire, logs redact tokens and operators can disable the integration immediately. `BLOG_AUTO_PUBLISH` remains false.
