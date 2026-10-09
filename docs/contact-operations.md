# Collaboration enquiries

## Boundaries and approval

The portfolio and the two collaboration pages stay static. Only the reviewed blog service accepts and stores messages, in the separate `vcode_contacts` schema. The analytics dashboard acts as an authenticated broker; the browser receives neither the broker key nor the internal service URL. The contact service does not call AI or SMTP.

Activation requires owner approval of the exact CZ/EN notice in `docs/contact-privacy-review.md`, publication of both notice fragments, and the approved version `contact-20261009`. Missing configuration disables the form while preserving the email fallback and ordinary blog operation.

## Private configuration

Use the optional `deploy/contact/blog-overlay.yml` and `deploy/contact/analytics-overlay.yml`, alongside the existing base Compose files and Recall downloads overlay. `VCODE_CONTACT_CONFIG` points to an operator-owned private directory, never to a repository file. Its files must be readable only by service UID 1000:

- `form-secret`: independent random secret of at least 32 characters.
- `inbox-token`: a different random base64url secret, at least 32 characters.
- `owner-id`: the UUID from the existing owner's verified Umami token. A submitted username is not an identity proof.

Set `CONTACT_FORM_ENABLED=true` and `CONTACT_FORM_PRIVACY_VERSION=contact-20261009` only after approval. Existing Telegram bot/chat configuration is reused. Keep the blog worker's morning schedule, budget and manual publication settings unchanged.

The verified owner must currently have the admin role and permission to the canonical VCode website. Every inbox request checks all three conditions. The inbox token alone is never a public login credential.

## Proxy and abuse controls

Expose only exact `/api/contact/challenge` and `/api/contact` paths. Preserve exact same-origin and `Sec-Fetch-Site` checks, the 16 KiB body limit and the trusted edge's overridden `X-Real-IP`. Disable individual contact access/error logs at both proxy layers; omit cookies and browser authorization headers when forwarding public submissions. `/internal/contacts` is accessible only inside the service network with the independent bearer key.

The form uses a short-lived signed challenge, a minimum delay, a honeypot, ephemeral rotating IP fingerprints and bounded local/global limits. The durable limit is 100 accepted messages per day. These controls reduce automated abuse; they do not establish a visitor's identity.

A submission receives 202 only after an atomic transaction stores both the message and its notification job. A UUID idempotency key protects retries of the same message; changed content under the same key returns 409. Telegram delivery is asynchronous, retried at most six times, and contains only a reference, general subject/app name and the fixed dashboard link. Investigate failed jobs using aggregate statuses, without copying message text into logs or Telegram.

## Inbox, retention and backups

Messages are retained in the dashboard for at most 90 days from receipt, regardless of new/read/closed status. The service prunes at startup, every minute and when reading/submitting; list queries also exclude expired records. Removal cascades to notification jobs. Deletion is permanent; the UI requires an explicit confirmation. The reply action opens the owner's mail client; it does not send mail from VCode.

Do not add indefinite contact copies to blog release evidence, logs, test fixtures or routine logical blog dumps. For every logical dump of the blog database use `--exclude-schema=vcode_contacts`; a contact backup, if separately introduced, requires a documented bounded retention and restore procedure. Existing database-cluster or infrastructure recovery copies must be governed separately by their operator. A restore must run contact retention before exposing the inbox or restarting notifications. The public notice's 90-day promise specifically applies to dashboard messages.

## Metrics and verification

`collaboration-click` counts clicks on marked public collaboration links. It contains no chosen subject/application, link text or form values. The legacy sanitizer strips arbitrary query parameters and fragments; DNT/GPC suppress the analytics event. Received enquiries are operational counts from the private database, independently of analytics consent, and grouped only by the approved subject/app IDs. These counts are messages/events, not unique people or a conversion rate. Deleting or expiring a message also removes it from the live inbox aggregates; do not label these as lifetime counts.

Before release run `pnpm check`, `pnpm test`, `pnpm build`, build web/blog/dashboard images, and run isolated Nginx and PostgreSQL acceptance against the exact images. Verify both locales and mobile/200% text, disabled/failure fallback, idempotent retry, owner authorization, logout/offline clearing, retention, generic Telegram content, and existing PWA/Recall integration. All acceptance data must be synthetic. Never export genuine visitor or enquiry records as fixtures.

Rollback disables the new form and restores the previous web/blog/dashboard images and owned source files. The additive contact schema is not dropped. Preserve the existing Recall overlay and collector registry. Before activation, save exact source/image identities and private rollback evidence; after activation smoke both health endpoints, both locales, representative products/guides and both blog locales.
