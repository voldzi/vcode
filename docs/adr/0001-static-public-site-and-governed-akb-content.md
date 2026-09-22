# ADR 0001: Static public site and governed AKB content

## Status

Accepted for the first implementation.

## Decision

Serve the VCode portfolio and public help as a static site. Keep public guides as versioned Markdown and mirror reviewed revisions into a dedicated `vcode-help` application space in the existing AKB platform. Do not add PostgreSQL or S3 to the public runtime until a real writable workflow requires them.

## Why

This keeps the main site fast, cacheable and available independently of AKB. It preserves a human-reviewable source and lets AKB provide governed versions, retrieval and citations without exposing internal services to browsers.

## Consequences

Publishing is an explicit promotion, not live editing. Future forms, uploads or conversational search require a server-side boundary and separate threat review.
