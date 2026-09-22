# Technology blog

## Editorial flow

Every six hours the worker reads allowlisted RSS/Atom feeds using conditional HTTP requests. It stores titles, publisher summaries, publication time and canonical links. A feed failure is isolated and never stops collection from the remaining publishers.

When generation is enabled, one run selects recent unused items from at least two publishers. The model receives only bounded feed metadata, never browser credentials, database access, tools or arbitrary web access. Structured output must contain matching Czech and English editions, three to six sections, key points and IDs of cited inputs. Deterministic validation rejects unknown sources, single-publisher articles and text outside the editorial length limits.

The published page clearly links every input used to create the briefing. VCode writes an original synthesis and does not republish full source articles. Generated illustrations are deterministic VCode SVG compositions and do not create additional API cost. The first production article remains a draft until both language versions and their sources have been reviewed with the private `articles.mjs` command. Public articles clearly disclose the automated newsroom process.

## Hard limits

Production defaults:

- interval: 360 minutes;
- maximum generations: 4 per UTC day;
- maximum input: 28,000 characters;
- maximum output: 2,200 tokens;
- daily total token ceiling: 80,000 tokens;
- monthly model-cost ceiling: USD 5;
- default model: `gpt-5.6-luna` with low reasoning effort;
- OpenAI response storage: disabled.

The worker holds a PostgreSQL advisory lock while checking and recording the budget, so restarts or duplicate containers cannot generate concurrently. Hitting any ceiling produces a recorded skipped run and no API call.

## Comments

Comment submission uses a same-origin form, a 16 KiB body limit, a hidden spam field and a limit of three attempts per hashed IP address per hour. The application stores no plaintext email or IP address. OpenAI Moderation can approve clean comments when enabled; unavailable or uncertain moderation leaves the comment pending. Flagged content is not displayed. Pending, rejected and spam entries are removed after 90 days.

Public removal requests go through `podpora@zeleznalady.cz`.

Pending comments are reviewed from the private Docker host; no moderation endpoint is exposed publicly:

```bash
docker compose -p vcode-prod run --rm blog node services/blog/moderate.mjs list
docker compose -p vcode-prod run --rm blog node services/blog/moderate.mjs approve <id>
docker compose -p vcode-prod run --rm blog node services/blog/moderate.mjs reject <id>
```

## Activation checklist

1. Provision the dedicated PostgreSQL database and least-privilege role.
2. Mount database URL, comment hash secret and the dedicated VCode OpenAI key as Docker secret files.
3. Start with `BLOG_GENERATION_ENABLED=false` and verify `/health/blog`, empty blog pages, source collection and comment moderation queue.
4. Run one controlled generation, review both language versions, source links, usage and cost.
5. Enable scheduling and verify that a second run inside the interval is skipped.
