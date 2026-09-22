# Operations

VCode is distributed as two container images built from `Dockerfile` and `Dockerfile.blog`. The static web image serves the Astro build through an unprivileged Nginx process. The blog image runs the request service or scheduled worker.

## Deployment contract

- The public origin is `https://vcode.zeleznalady.cz`.
- The web container exposes port `8080` inside the container network.
- `/health` verifies the static service; `/health/blog` verifies the blog and database dependency.
- A private reverse proxy terminates TLS and forwards the documented public routes only.
- PostgreSQL, OpenAI and moderation secrets are supplied through read-only secret files.
- Database, AI and private knowledge endpoints are never published to the browser.

The repository contains no production hostname, address, credential, secret path or inventory. Operators provide `VCODE_BIND_ADDRESS`, `VCODE_PORT`, `VCODE_SECRETS_DIR` and the secret-file values in their private deployment configuration. The example Compose file defaults to loopback for local use.

## Release controls

Before release, run `pnpm check`, `pnpm test` and `pnpm build`, validate `openapi/openapi.json`, build immutable container images and record their digests in the private release record. Verify both health routes, Czech and English pages, a product page, a guide in both languages, sitemap, feed, security headers and broken links.

The blog generator remains disabled until the database and a dedicated OpenAI project key have passed a controlled draft-only run. Never enable automatic publication before both language variants, citations, usage and budget enforcement have been reviewed.

## Rollback

Disable blog generation, restore the previous immutable images and repeat the same health and public smoke tests. Database migrations are additive; rollback does not remove tables or content.
