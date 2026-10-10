# SEO and answer-engine discovery — 10 October 2026

## Evidence and scope

The initial public HTTP audit checked all 216 canonical URLs found in the static and published-blog sitemaps. Every URL had a title, description, single H1, canonical, Czech/English alternates and structured data; none was marked noindex. The 40 blog pages lacked the optional x-default alternate present on the static pages. This was a consistency improvement, not evidence that those articles were unindexable. Public product retrieval returned 200 with readable HTML under Googlebot, bingbot, SeznamBot, OAI-SearchBot, Claude-SearchBot and PerplexityBot user-agent probes. These probes use our network and do not impersonate a verified provider IP or prove that the real providers have indexed the site. The available public search provider returned no results for a site query; this does not establish coverage in each named search engine.

No private analytics/enquiry records were inspected or used for acceptance. HTTP reads use DNT/GPC and do not execute scripts. This release does not expand measurement, publish private deployments, alter legal/privacy text or change blog generation, schedule, budget or manual approval.

## Implemented improvements

- Generate `/llms.txt` at build time from the canonical reviewed product data, App Store links and public/published guides. It now covers every product in both reviewed languages and inherits future catalog changes instead of drifting as a manually maintained list. Drafts/private guide entries remain excluded. This file is an optional navigation aid, not a ranking standard or admission requirement.
- Add per-page WebPage identity linked to the existing WebSite/Organization, and stable application identities with reviewed names, summaries, language, actual showcase image and existing download links. No invented ratings, offers, prices or business details.
- Add TechArticle metadata to published guides with their real review date. No invented publication timestamps.
- Permit large search-image previews and expose reciprocal social locales. Add the optional x-default alternate to the public blog renderer.
- Preserve search/user-retrieval access and existing dedicated training-crawler exclusions. Exclude private APIs, preview/internal/review routes from the crawler navigation surface; authentication remains the actual protection.
- Run `pnpm validate:discovery` after every production build. It checks all public static pages against the sitemap, canonical URLs, reciprocal language destinations, metadata, structured facts, internal links, product coverage in the AI reference and private exclusions. IndexNow rejects private URLs even if accidentally introduced into a sitemap.

## Required owner-side verification

Google Search Console and Bing Webmaster Tools require verified owner properties; no account access is assumed. Submit `https://vcode.zeleznalady.cz/sitemap-index.xml` and `https://vcode.zeleznalady.cz/blog-sitemap.xml` in the verified properties, then inspect actual indexing, errors, impressions and representative new URLs. Submit the public homepage through Seznam's official URL-add form where available. A Firmy.cz profile requires truthful verified company data and must not be invented. Link partnerships and useful original content support reputation; backlinks cannot be safely fabricated.

IndexNow acceptance is notification delivery, not a guarantee of indexing, ranking or AI citation. Google does not require a special GEO schema or AI file. Keep public content clear, accurate, specific, internally linked and useful; preserve mobile accessibility and speed. Review coverage after releases and monthly in the verified consoles. Future monitoring should report observed console coverage separately from technical checks and visits recorded by Umami.

## Primary references reviewed

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI: publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Anthropic: search and user-retrieval crawler roles](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [IndexNow: notification protocol](https://www.indexnow.org/documentation)

Production acceptance and immutable image identities are recorded after deployment below.

## Production acceptance

- Release: `seo-discovery-20261010`; implementation commits `3e5be57` and `1b8e418`.
- Accepted **10 October 2026, 20:56:25 Europe/Prague** (`2026-10-10T18:56:25.411351Z`).
- Web image: `sha256:e7281033afc753200048969b9691400ac228575c0ed086216064a3dcc14fd415`.
- Blog image: `sha256:262ff3503f38d7ec8d2f3499c4843b842f78656ebd621eefa262e3442bbd8ba0`.
- Rollback web: `sha256:0cf8595930273425b19fcc52117fd6e9cff3b857a4a219d553c2e6b7ce0ea76c`; rollback blog: `sha256:5e175b0ced4cc817c7ab10e5146b5b5810189fb9a3d9e1fedda1f66cb1e004ed`.
- `pnpm check`: zero errors/warnings, 15 existing hints. `pnpm test`: 173 passed (62 blog, 79 analytics, 32 downloads). `pnpm build`: 176 static pages, all publication/contact/catalog/discovery gates passed. Both Docker images built and isolated Nginx boundary checks passed.
- Final production audit: **216 canonical public URLs, zero findings**, reciprocal CS/EN/x-default, descriptions, titles, H1, structured data, large-image preview permission, successful search user-agent probes, public feeds and private authentication/404 boundaries. All 25 catalog products are covered in both languages by the generated reference. RFC longest-prefix, exception, specific-agent and tie cases were independently checked for the auditor.
- Existing presentation/game regression checks passed: eight exact product/App Store pages, four catalogues and 26 referenced image/badge assets matched the exact tested image. Representative guides, both health routes and both blog locales passed. Reviewed legal/contact text and four public analytics/contact scripts matched pre-release hashes; no real enquiry submitted.
- Only web and blog rendering services changed. All eight worker/analytics/database/download/gateway container identities and start times remained unchanged. Web/blog environment, mounts, ports, networks and security-policy fingerprints matched before/after. The existing private contact/partnership/relay definitions were preserved; an operator-only image override selects the immutable tested blog image.
- IndexNow accepted **all 216 canonical URLs with HTTP 200**. This confirms notification delivery only.

The initial activation attempts did not pass acceptance and restored the previous source/images. The deployment procedure now restores required interpolation values from existing read-only runtime mounts, verifies the effective blog environment without printing it, and explicitly overrides the old image pinned by the private runtime definition. The audit's original standard-library robot parser used first-match behavior; it was corrected to RFC longest-match precedence. The final full acceptance above passed with the corrected procedure. Protected receipts contain backups, source hashes, before/after identities, public metadata and validation results; they contain no genuine visitor/enquiry records. Future releases must inspect the effective image and the complete current Compose configuration set.

Google/Bing owner-account coverage is still unverified. Seznam's official [URL-add form](https://search.seznam.cz/wt/pridej-stranku) is available but requires a human verification code; it was not automatically submitted. These are owner-side follow-ups, not proof that the site is absent from search results.
