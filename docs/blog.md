# Technology blog

## Editorial flow

Every six hours the worker reads an allowlisted registry of RSS/Atom feeds using conditional HTTP requests. It stores titles, publisher summaries, publication time, canonical links, trust metadata and a deterministic title fingerprint. Feed redirects remain inside explicitly allowed public HTTPS hosts; private, loopback and link-local destinations are rejected. A feed failure is isolated and never stops collection from the remaining publishers.

Collection and generation have separate schedules. Collection runs every six hours; generation is attempted at 06:20 Europe/Prague every day, including daylight-saving changes. A restart after 06:20 catches up if no draft was created that Prague calendar day. Generation runs no more than once per Prague calendar day. Deterministic relevance scoring and near-duplicate headline clustering create one evidence pack. A cluster is eligible when it includes an official primary/authority source or at least two independent publications. This avoids forcing an official release or authority warning through a second-hand article merely to satisfy a source count.

The model receives only the bounded evidence pack, never browser credentials, database access, tools or arbitrary web access. Structured output must contain matching Czech and English editions, three to six sections, key points, a claim ledger and IDs of cited inputs. Deterministic validation rejects unknown sources, unsupported claims and text outside the editorial length limits.

The published page clearly links every input used to create the briefing. VCode writes an original synthesis and does not republish full source articles. Generated illustrations are deterministic VCode SVG compositions and do not create additional API cost. Every generated article is a draft by default. Publication records a named reviewer and an immutable editorial event after both language versions, claims and sources have been checked. Public articles clearly disclose the assisted newsroom process.

## Source registry

The first registry contains Root.cz, Zdroják, Vzhůru dolů, Blog CZ.NIC, NÚKIB, CSIRT.CZ, Lupa.cz, CESNET CyberFeed, Hugging Face, OpenAI, Ollama and Anthropic Engineering. Anthropic remains disabled until a stable official machine-readable feed is verified. Each source records language, trust tier, content kind, allowed hosts, topics, retention policy and a licensing note. Operators can disable an active source in PostgreSQL without a release.

Only publisher-provided metadata and summaries are retained. Docling/AKB ingestion is reserved for individually selected official documents whose retention and processing terms have been reviewed. News pages are not bulk-copied into AKB or object storage.

## Hard limits

Production defaults:

- interval: 360 minutes;
- maximum generations: 1 per Prague calendar day;
- maximum input: 28,000 characters;
- maximum output: 6,000 tokens for the complete bilingual draft and claim ledger;
- daily total token ceiling: 80,000 tokens;
- monthly model-cost ceiling: USD 5;
- default model: `gpt-6-luna` with low reasoning effort;
- OpenAI response storage: disabled.

The worker holds a PostgreSQL advisory lock while checking and recording the budget, so restarts or duplicate containers cannot generate concurrently. It reserves worst-case tokens and cost before calling OpenAI, then reconciles the reservation with actual usage. A failed or uncertain request retains the conservative reservation. Hitting any ceiling produces a recorded skipped run and no API call. The OpenAI project must also have its own independent usage limit.

## Comments

Comment submission uses a same-origin form, a 16 KiB body limit, a hidden spam field and a limit of three attempts per hashed IP address per hour. The application stores no plaintext email or IP address. OpenAI Moderation can approve clean comments when enabled; unavailable or uncertain moderation leaves the comment pending. Flagged content is not displayed. Pending, rejected and spam entries are removed after 90 days.

Public removal requests go through `podpora@zeleznalady.cz`.

Comments default to pending. Pending comments are reviewed from the private Docker host; no moderation endpoint is exposed publicly:

```bash
docker compose -p vcode-prod run --rm blog node services/blog/moderate.mjs list
docker compose -p vcode-prod run --rm blog node services/blog/moderate.mjs approve <id>
docker compose -p vcode-prod run --rm blog node services/blog/moderate.mjs reject <id>
```

Draft review also stays private:

```bash
docker compose -p vcode-prod run --rm blog node services/blog/articles.mjs list-drafts
docker compose -p vcode-prod run --rm blog node services/blog/articles.mjs show <id>
docker compose -p vcode-prod run --rm blog node services/blog/articles.mjs review <id> <reviewer>
docker compose -p vcode-prod run --rm blog node services/blog/articles.mjs publish <id> <reviewer>
docker compose -p vcode-prod run --rm blog node services/blog/articles.mjs reject <id> <reviewer>
```

## Activation checklist

1. Provision the dedicated PostgreSQL database and least-privilege role.
2. Mount database URL, comment hash secret and the dedicated VCode OpenAI key as Docker secret files.
3. Start with `BLOG_GENERATION_ENABLED=false` and verify `/health/blog`, empty blog pages, source collection and comment moderation queue.
4. Run one controlled generation, review both language versions, source links, usage and cost.
5. Evaluate at least 20 historical clusters and review the first 10-20 generated drafts.
6. Keep `BLOG_AUTO_PUBLISH=false` until a separately approved low-risk publication policy exists.
