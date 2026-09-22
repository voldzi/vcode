# API

The binding public contract is `openapi/openapi.json`.

- `GET /health/blog` checks the blog service and database dependency.
- `POST /api/blog/{slug}/comments` accepts the same-origin HTML form and redirects back to the article.
- `POST /api/blog/telegram/webhook` accepts authenticated Telegram callback updates and is unavailable while the editorial integration is disabled.

Article list and detail routes return server-rendered HTML rather than JSON. No internal feed, moderation, database or OpenAI endpoint is public.

Private review pages under `/blog/review/` are short-lived capability pages rather than a reusable API. They are excluded from indexing and caching.

The browser must not call AKB Registry, PostgreSQL, S3/SeaweedFS, Qdrant or an LLM endpoint. A future knowledge search or support workflow requires a documented server-side contract, authentication and rate limits before implementation.
