# Security

- Portfolio and help content remain read-only. The blog adds one bounded same-origin comment form and a private PostgreSQL dependency.
- The browser never receives AKB, PostgreSQL or S3 endpoints and credentials.
- Production sets CSP, clickjacking, MIME and referrer headers at Nginx and the edge.
- Public guides pass metadata validation and human review before publication.
- Privacy and legal pages are product-owned documents and require explicit review before App Store submission.
- Comment bodies are length-limited, escaped on output, rate-limited by a salted IP hash and moderated before display. Optional email and IP are never stored in plaintext.
- The feed collector accepts only HTTPS links on allowlisted publisher domains, caps responses at 2 MB and treats all source text as untrusted data.
- OpenAI generation has no tools, uses structured output, disables response storage and is blocked by transactional daily/monthly budgets.
# Runtime hardening

The production container runs as the unprivileged Nginx user (`101:101`) with a read-only root filesystem, all Linux capabilities dropped and `no-new-privileges` enabled. Only the Nginx cache and runtime directories are ephemeral `tmpfs` mounts owned by that user.
