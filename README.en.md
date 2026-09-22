# VCode

**Technology you can rely on.**

[![Website](https://img.shields.io/badge/web-vcode.zeleznalady.cz-00B4FF)](https://vcode.zeleznalady.cz/en/)
[![CI](https://github.com/voldzi/vcode/actions/workflows/ci.yml/badge.svg)](https://github.com/voldzi/vcode/actions/workflows/ci.yml)
[![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-0B2D5B)](https://nodejs.org/)
[![Astro 7](https://img.shields.io/badge/Astro-7-0B2D5B)](https://astro.build/)

[Česká verze](README.md)

VCode is a Czech digital product brand focused on mobility, safety, health and organisational management. This repository contains the public bilingual website, help centre and governed technology blog at [vcode.zeleznalady.cz](https://vcode.zeleznalady.cz/en/).

## Products

| Product | Focus | Availability |
| --- | --- | --- |
| **Jízda** | Journey logging, navigation, vehicles, passengers and communication | Preparing for the App Store |
| **COP Mobile** | Mobile situational awareness, field reports and secure communication | In preparation |
| **[COP](https://cop.zeleznalady.cz/)** | Public situation map, traffic, warnings and routes | Web app |
| **[Masáže Železná Lady](https://masaze.zeleznalady.cz/)** | Services, appointments and booking | Live |
| **[Studio Balance](https://studio-balance.cz/)** | Classes, schedules, booking and client self-service | Live |
| **[STRATOS](https://stratos.zeleznalady.cz/)** | Strategy, projects, finance, risk and governed knowledge | Private deployment |
| **[Kalorické tabulky](https://kaloricketabulky.zeleznalady.cz/)** | Food diary, recipes and nutritional context | PWA |

## What is included

- a bilingual static Astro website;
- product pages, legal pages and an accessible help centre;
- a small server-side blog and moderated comment service;
- a governed publishing pipeline with source provenance and hard AI budgets;
- container images, health checks and public deployment templates;
- the OpenAPI contract for the single public write endpoint.

Internal network topology, credentials, secrets and the production inventory are deliberately excluded. Deployment supplies private configuration through the environment and mounted secret files.

## Quick start

Requirements: Node.js 24+, pnpm 11+.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Astro prints the local website address. The blog requires PostgreSQL and the secret files described in [.env.example](.env.example); the static site can be developed and built without them.

## Quality checks

```bash
pnpm check
pnpm test
pnpm build
```

Public CI runs the same checks. Help content also passes metadata, classification and secret scanning checks.

## Architecture

```text
browser
   │
   ├── static Astro site ── product pages and help centre
   │
   └── blog service ────── articles and moderated comments
              │
              └── PostgreSQL
```

The portfolio remains available if the blog or database is unavailable. The browser never receives database, AI provider or internal knowledge-service access. See [architecture](docs/architecture.md), [security](docs/security.md) and the [ADRs](docs/adr/) for details.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/` | Astro pages, components and styles |
| `content/guides/` | public guides with governed metadata |
| `services/blog/` | blog, public-feed collection and moderation |
| `openapi/` | public API contract |
| `deploy/` | portable configuration templates |
| `docs/` | architecture, security, operations and decisions |

## Security and privacy

Do not disclose security issues in public GitHub issues. Follow the responsible disclosure process in [SECURITY.md](SECURITY.md). The public privacy notice is available on the [VCode website](https://vcode.zeleznalady.cz/en/privacy/).

## Contributing and licence

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. The source is public for transparency and trust; it is not offered under a general open-source licence. See [LICENSE](LICENSE).
