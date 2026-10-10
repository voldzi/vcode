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
