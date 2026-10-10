# Studio Balance and Masáže presentations — production release

## Scope and approval

The product owner explicitly approved production publication in the VCode chat on 10 October 2026. This release publishes both reviewed Czech/English portfolio presentations, six real management captures per application, FAQ, collaboration links and four new operator guides. Existing client-facing guides remain available. Screenshots contain fictional demonstration records, and full images preserve the actual interfaces.

The implementation is recorded in commit `85fd9d8e1092d4d4ba7d77286c508e6b7f7ef8f1`. The source teams independently reviewed application claims, simple instructions and the local previews before publication. EET in Masáže is explicitly in preparation, and Studio Balance instructor pay is explicitly entered manually.

## Live release

- Release identifier: `operator-presentations-20261010`.
- Production acceptance: **10 October 2026, 19:53:27 Europe/Prague** (`2026-10-10T17:53:27.922009Z`).
- Active web image: `sha256:5dc9d8fd1e0262ae649134d0a16d7ef61544039f4e032e980aa93926d992a47d`.
- Required blog image built: `sha256:5e175b0ced4cc817c7ab10e5146b5b5810189fb9a3d9e1fedda1f66cb1e004ed`.
- Previous web image retained for rollback: `sha256:371033bd4856093b8564359da4803cda343607effdf3574ef0546bf902cd1412`.

Only the static web service was replaced. The identities, images and start times of all nine related blog, worker, analytics, database, downloads and Moje porce gateway services remained unchanged. Existing private configuration, registries, contact/Recall integrations, morning schedule, manual publication and budgets were preserved.

The protected operator record includes exact before/after hashes for the 40 owned files, scoped backups, automatic rollback on failed activation checks, immutable image identities and the current production public-source snapshot. Eight non-runtime differences between the local checkout and the previous production source were explicitly reviewed: prior scoped releases had not copied several documentation files, unused examples/helper and the Git ignore file. These files were preserved as found; all runtime/build inputs and all owned before hashes matched the review. No credentials or visitor/enquiry records are included here.

## Validation

- `pnpm check`: zero errors and warnings; 15 existing hints.
- `pnpm test`: 171 passed (60 blog, 79 analytics, 32 downloads). The complete final rerun passed after an earlier synthetic fixture had a temporary local port collision.
- `pnpm build`: 176 static pages; public-content, Recall publication, catalog and contact-boundary validation passed.
- Both required Docker images built. The web candidate passed the isolated Nginx checks for strict private CSP, inherited headers, static/proxy compression, anonymous authentication, exact contact routes and body/header limits, and unchanged download ranges.
- Production: all eight new product/guide routes returned 200 with one H1, canonical/alternate links, exact expected social metadata, one existing analytics tracker and correct product-specific collaboration links.
- All 24 new images matched the output extracted from the exact tested web image. Home, blog, guide hubs and representative existing product/guide pages passed in both languages; both health routes passed.
- Reviewed privacy/contact page text and all four existing public analytics/contact/site/download scripts matched their pre-release hashes. The anonymous dashboard API remains 401 with `no-store`; internal and private-preview paths remain 404. The public contact challenge remains enabled with the approved `contact-20261009` version. No real submission was sent.
- Sitemap includes all eight pages. Static HTML revalidation and security headers passed. The actual running Nginx configuration validated and the new web container is healthy.
- Local interactive checks cover phone/desktop layouts, 200% text zoom, FAQ keyboard/pointer interaction, full-image navigation and guide links. Actual built form choices and client script were exercised with a mock challenge and zero submissions in both languages.
- Production browser readback verified the published phone layout of Studio Balance, loaded Masáže screenshot, native FAQ control and the actual operator-guide destination. This readback temporarily disabled JavaScript in the agent-owned tab to avoid creating analytics events; normal JavaScript behavior was tested locally and unchanged script bytes were verified in production. Temporary controls were removed before leaving the local preview available.

## Public addresses

| Application | Czech presentation | English presentation | Czech operator guide | English operator guide |
| --- | --- | --- | --- | --- |
| Studio Balance | [Presentation](https://vcode.zeleznalady.cz/aplikace/studio-balance/) | [Presentation](https://vcode.zeleznalady.cz/en/apps/studio-balance/) | [Studio management](https://vcode.zeleznalady.cz/navody/studio-balance-sprava-studia/) | [Managing your studio](https://vcode.zeleznalady.cz/en/guides/studio-balance-managing-your-studio/) |
| Masáže | [Presentation](https://vcode.zeleznalady.cz/aplikace/masaze/) | [Presentation](https://vcode.zeleznalady.cz/en/apps/masaze/) | [Practice management](https://vcode.zeleznalady.cz/navody/masaze-sprava-provozovny/) | [Managing your practice](https://vcode.zeleznalady.cz/en/guides/masaze-managing-your-practice/) |

## Preparation evidence

- [Studio Balance](studio-balance-presentation-preparation-2026-10-10.md)
- [Masáže](masaze-showcase-assets-2026-10-10.md)
