# Game presentations — 10 October 2026

## Scope

Bilingual public presentations for NEST, Rinklet, MILLORA, Foldlight and Šibenice on their existing portfolio and App Store pages. The shared presentation includes actual gameplay galleries, first-game instructions, support, privacy links, localized official Apple badges and a collaboration link using the existing approved analytics contract. Rinklet includes an 18-second silent gameplay clip with ordinary controls and no autoplay. Foldlight has practical bilingual support instead of an empty guide destination and five real captures per language, including the clean open-layout scene. NEST and Šibenice support links lead to the new rules.

The source projects authorized implementation and coordination with VCode. The five asset manifests document source captures, reviewed copy, conversions and checksums. Full gallery images preserve the actual interface; promotional art is identified as illustration in alternative text. Optimized previews load separately from full-size images.

## Availability and release boundaries

Official Apple public lookup checked on 10 October 2026:

| Game | Public version | Website action |
| --- | --- | --- |
| NEST | 1.5 | Main App Store download link |
| Rinklet | 1.0.0 | Main App Store download link |
| Foldlight | 1.0.0 | Main App Store download link |
| Šibenice | 1.3 | Main App Store link; new gallery marked as an upcoming update |
| MILLORA | No public result | Presentation only; App Store review is pending |

Pending Custom Product Pages are not linked publicly. They can replace the appropriate main-store link only after Apple approval and public verification. Publication of this website does not release an Apple app or establish physical Duo acceptance.

## Preserved boundaries

Only the public static website is activated. Both required Docker images are built, while blog, worker, analytics, downloads and contact relay runtimes remain unchanged. Existing reviewed legal/privacy text, public analytics assets, private dashboard authentication and contact activation gates were verified before and after release. Four existing Rinklet privacy/support source files are recorded byte for byte from the already-published production source, so a fresh checkout reproduces those routes; their wording has not changed. No genuine visitor or enquiry records are used in acceptance checks.

## Validation

- `pnpm check`: zero errors, zero warnings; 15 existing hints.
- `pnpm test`: 171 tests passed.
- `pnpm build`: 172 static pages; private-content, catalog and contact-boundary checks passed.
- Browser: all five Czech and English portfolio pages at 390px width, no missing images or horizontal scrolling; all five Czech pages with 200% text; desktop presentation, full gallery navigation and Foldlight support checked.
- Deployment: both Docker images built; isolated Nginx boundary check passed, including HTML revalidation, unchanged private `no-store`, security headers, synthetic contact limits and exact download ranges.
- Production: all 20 Czech/English portfolio and App Store pages, 94 exact media files, both locale home/blog/guide/support routes, health endpoints, sitemap, canonical/social metadata and video byte ranges passed. All nine related service runtimes remained unchanged.
- Browser readback: Rinklet’s complete 18-second video played without errors; Foldlight’s five-image CS/EN galleries and NEST’s full CS/EN App Store marketing galleries were verified at 390px width. Existing browser copies needed one reload; static HTML now uses `Cache-Control: no-cache`, including conditional 304 responses, while hashed assets remain immutable and proxied services retain their policies.

## Live release

- Release identifier: `game-showcases-20261010-r2`.
- Final production acceptance: **10 October 2026, 16:05:13 Europe/Prague** (`2026-10-10T14:05:13Z`).
- Active web image: `sha256:371033bd4856093b8564359da4803cda343607effdf3574ef0546bf902cd1412`.
- Required blog image built: `sha256:5e175b0ced4cc817c7ab10e5146b5b5810189fb9a3d9e1fedda1f66cb1e004ed`; blog runtime was not replaced.
- The initial presentation activation passed at `2026-10-10T13:55:59Z` with web image `sha256:ff5b95a64970f975c089019d6ece591fbfab3c5000b257db8810cc0a46dd70f2`. The final release adds the clean Foldlight open-layout pair and static HTML revalidation.
- The protected operator receipt contains source hashes, scoped backups, rollback instructions, exact image identities, public acceptance results and unchanged related runtime identities. No credentials or visitor/enquiry records are in this document.

### Public presentation addresses

| Game | Czech portfolio | English portfolio | Czech App Store marketing | English App Store marketing |
| --- | --- | --- | --- | --- |
| NEST | [/aplikace/nest/](https://vcode.zeleznalady.cz/aplikace/nest/) | [/en/apps/nest/](https://vcode.zeleznalady.cz/en/apps/nest/) | [/app-store/nest/](https://vcode.zeleznalady.cz/app-store/nest/) | [/en/app-store/nest/](https://vcode.zeleznalady.cz/en/app-store/nest/) |
| Rinklet | [/aplikace/rinklet/](https://vcode.zeleznalady.cz/aplikace/rinklet/) | [/en/apps/rinklet/](https://vcode.zeleznalady.cz/en/apps/rinklet/) | [/app-store/rinklet/](https://vcode.zeleznalady.cz/app-store/rinklet/) | [/en/app-store/rinklet/](https://vcode.zeleznalady.cz/en/app-store/rinklet/) |
| MILLORA | [/aplikace/millora/](https://vcode.zeleznalady.cz/aplikace/millora/) | [/en/apps/millora/](https://vcode.zeleznalady.cz/en/apps/millora/) | [/app-store/millora/](https://vcode.zeleznalady.cz/app-store/millora/) | [/en/app-store/millora/](https://vcode.zeleznalady.cz/en/app-store/millora/) |
| Foldlight | [/aplikace/foldlight/](https://vcode.zeleznalady.cz/aplikace/foldlight/) | [/en/apps/foldlight/](https://vcode.zeleznalady.cz/en/apps/foldlight/) | [/app-store/foldlight/](https://vcode.zeleznalady.cz/app-store/foldlight/) | [/en/app-store/foldlight/](https://vcode.zeleznalady.cz/en/app-store/foldlight/) |
| Šibenice | [/aplikace/sibenice/](https://vcode.zeleznalady.cz/aplikace/sibenice/) | [/en/apps/sibenice/](https://vcode.zeleznalady.cz/en/apps/sibenice/) | [/app-store/sibenice/](https://vcode.zeleznalady.cz/app-store/sibenice/) | [/en/app-store/sibenice/](https://vcode.zeleznalady.cz/en/app-store/sibenice/) |

## Asset provenance

- [NEST](nest-showcase-assets-2026-10-10.md)
- [Rinklet](rinklet-showcase-assets-2026-10-10.md)
- [MILLORA](millora-showcase-assets-2026-10-10.md)
- [Foldlight](foldlight-showcase-assets-2026-10-10.md)
- [Šibenice](sibenice-showcase-assets-2026-10-10.md)
