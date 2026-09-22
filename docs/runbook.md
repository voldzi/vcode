# Runbook

This public runbook defines the safe sequence without exposing the production inventory. Substitute the private deployment values maintained by the operator.

## Release

1. Validate content, API schema, tests and the production build.
2. Review public text, links, language alternates, structured data and legal routes.
3. Record the reviewed Git commit and immutable image digests.
4. Supply database URL, comment-hash secret and OpenAI key as read-only secret files; begin with `BLOG_GENERATION_ENABLED=false`. Keep `BLOG_TELEGRAM_ENABLED=false` until its three dedicated secrets and reviewer IDs are installed.
5. Deploy the static, blog and worker services from `compose.yml` using the private environment configuration.
6. Wait for healthy containers and verify `/health` and `/health/blog` from inside the service network.
7. Validate and reload the private TLS reverse proxy configuration.
8. Verify the public Czech and English homepages, one product, one guide per language, blog routes, feed, sitemap, privacy page, security headers and mobile rendering.
9. Confirm external monitoring sees both health routes.
10. Run `pnpm blog:validate-sources`; disable any source that no longer returns a valid bounded feed.
11. Run one draft-only generation. Inspect it with `articles.mjs show`, then record a named review. Check both languages, claim citations, disclosure, usage and budget records before publishing it.
12. Keep automatic publication disabled during the initial 10-20 draft evaluation.
13. If Telegram review is enabled, verify webhook status, an allowlisted two-step rejection on a disposable draft and that an unauthorized callback cannot change article state.

## Rollback

1. Set `BLOG_GENERATION_ENABLED=false`.
2. Set `BLOG_TELEGRAM_ENABLED=false` and delete the Telegram webhook if the incident concerns editorial access.
3. Restore the previous immutable images and wait for health.
4. Restore the previous edge configuration if it changed.
5. Repeat private and public probes.

Do not drop blog tables during rollback. Migrations are additive and the static site can continue while the blog is unavailable.

## Common diagnosis

- `/health` fails: inspect the web container state and logs.
- `/health` works but `/health/blog` fails: inspect the blog service, secret mounts and PostgreSQL connectivity.
- A worker run is `skipped`: check its reason; configured interval, disabled generation and hard budgets are expected safe states.
- A worker run is `failed`: keep generation disabled until the feed, OpenAI or database error is resolved.
- Private health works but public HTTPS fails: inspect DNS, TLS and reverse-proxy routing.
- Public health works but monitoring is down: inspect the probe configuration and monitoring pipeline.
