# Observability

The static service exposes `/health`. The blog exposes `/health/blog`, including a live PostgreSQL query. Container health checks cover both request-serving services independently. The scheduled worker has no listener; monitor its structured run outcomes and logs.

Production monitoring should probe both health routes through the private service network and the public HTTPS origin. The two probes matter: a healthy static site does not prove that the database-backed blog is available.

The blog service and worker emit structured JSON events. They do not log query strings, API responses, article bodies, comments, email addresses, IP addresses or secret values. Recommended alerts cover:

- a failed public or private health probe;
- three consecutive worker failures;
- a worker run that remains active for more than 15 minutes;
- unexpected AI budget exhaustion;
- a feed disabled after repeated failures or a feed redirect leaving its allowlist;
- no successful collection from an active source for 24 hours;
- a generated draft without claims, evidence policy or reviewer before publication;
- a sustained increase in rejected comments or request limits.

Monitoring hostnames, addresses, credentials, dashboard links and alert-routing destinations belong to the private operations inventory and are not stored in this public repository.
