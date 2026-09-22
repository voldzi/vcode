# Security

- Portfolio and help content remain read-only. The blog adds one bounded same-origin comment form and a private PostgreSQL dependency.
- The browser never receives AKB, PostgreSQL or S3 endpoints and credentials.
- Production sets CSP, clickjacking, MIME and referrer headers at Nginx and the edge.
- Public guides pass metadata validation and human review before publication.
- Privacy and legal pages are product-owned documents and require explicit review before App Store submission.
- Comment bodies are length-limited, escaped on output, rate-limited by a salted IP hash and moderated before display. Optional email and IP are never stored in plaintext.
- The feed collector accepts only HTTPS links on allowlisted publisher domains, validates every redirect and DNS result, rejects private/link-local destinations, bounds streamed responses and treats all source text as untrusted data.
- OpenAI generation has no tools, uses structured output with a source-linked claim ledger, disables response storage and is blocked by conservative daily/monthly budget reservations.
- Generated articles and comments default to pending review. Publication requires a named reviewer and creates an editorial audit event.
- Telegram editorial review is disabled by default. When enabled, Telegram authenticates the webhook with a secret header; VCode also restricts actions to one configured user and chat, signs callback payloads, deduplicates update IDs and requires a second confirmation.
- Browser review links are random, short-lived bearer capabilities. Only a hash is stored, responses are never cached or indexed, referrers are suppressed and review tokens are redacted from application logs.
# Runtime hardening

The production container runs as the unprivileged Nginx user (`101:101`) with a read-only root filesystem, all Linux capabilities dropped and `no-new-privileges` enabled. Only the Nginx cache and runtime directories are ephemeral `tmpfs` mounts owned by that user.
