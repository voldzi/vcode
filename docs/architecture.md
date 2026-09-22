# Architecture

VCode combines a statically generated bilingual portfolio with a bounded server-rendered technology blog.

## Runtime

- Astro produces immutable HTML, CSS and JavaScript assets.
- Nginx serves the build and `/health` from an unprivileged, read-only container.
- The public reverse proxy terminates TLS and forwards only to the web container.
- Nginx proxies only `/blog`, `/en/blog`, `/blog-assets`, `/api/blog` and `/health/blog` to the internal blog service.
- The blog service and six-hour worker share a least-privilege PostgreSQL role through a private database endpoint supplied at deployment time.
- Portfolio and help pages remain available when the blog or database is unavailable.
- S3/SeaweedFS is deliberately absent from the first release. Future public media gets a dedicated bucket and write identity; the browser never receives storage credentials.

## Knowledge and guides

Markdown in `content/guides` is the reviewable authoring source. Metadata follows `akb-application-docs-1`. The website publishes only entries with `classification: public` and `status: published`.

AKB remains the governed knowledge authority. The intended production flow is:

1. Author and review a stable document revision.
2. Validate metadata and secrets locally.
3. Import the same source into the dedicated AKB application space `vcode-help` as a draft.
4. Human-review and publish one immutable AKB version.
5. Promote the matching Git revision to the website.
6. Verify the public page, AKB citation and revocation behavior.

The website never calls Registry, object storage, Qdrant or the LLM directly from the browser. A later search assistant must use a bounded server-side VCode bridge and the AKB public-delivery contract.

## Technology blog

The blog pipeline and its trust boundaries are documented in [blog.md](blog.md). OpenAI, PostgreSQL and feed requests originate only from server-side containers. The browser receives rendered pages and the same-origin comment form; it never receives provider endpoints or credentials.
