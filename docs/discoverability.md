# Discoverability

VCode publishes one canonical, bilingual information source for people, search engines and answer engines.

## Technical surface

- canonical URLs and Czech/English `hreflang` alternates;
- XML sitemaps for static pages and blog articles;
- RSS feeds at `/blog/feed.xml` and `/en/blog/feed.xml`;
- Organization, WebSite, Blog and Article structured data;
- Open Graph and large-image social previews;
- descriptive titles, summaries and semantic headings;
- `robots.txt` rules for conventional search crawlers and answer-engine search agents;
- `llms.txt` with canonical brand and product facts;
- an IndexNow key and a submission script that reads all public canonical URLs from both live sitemaps;
- a public, documented GitHub repository linked from structured data.

Search discovery does not grant a licence to train on the content. VCode allows user-requested retrieval and search crawlers while explicitly declining dedicated model-training crawlers where providers expose separate identities.

## Operator checklist

1. Deploy and verify the canonical origin, social image, sitemaps, feeds, `robots.txt`, `llms.txt` and structured data.
2. Submit the sitemap from an owner-verified property in Google Search Console and Bing Webmaster Tools.
3. Advertise both sitemap URLs in `robots.txt` for SeznamBot and request homepage reindexing in the verified Seznam Webmaster property (or use its public URL form). Create or claim a Firmy.cz profile only with the verified legal business identity.
4. Run `pnpm indexnow:submit --dry-run` to check coverage, then `pnpm indexnow:submit` after a material public release. The script includes current applications, guides and published articles from the live sitemaps.
5. Inspect coverage, crawl errors and structured-data warnings monthly; do not chase ranking through duplicated or keyword-stuffed content.

Account verification records, legal business identifiers and webmaster credentials stay in the private operations inventory.

Google and Seznam ownership was verified on 10 October 2026; see
`docs/webmaster-verification-2026-10-10.md` for submission and processing evidence.
Keep the approved public proof tags in the shared layout. Actual sitemap processing
and index coverage must be checked separately; Bing ownership remains unverified.

## Build and live regression gates

`pnpm build` runs `pnpm validate:discovery` for static metadata, sitemap coverage, reciprocal language links, public-link destinations, structured facts and generated AI-reference coverage. `pnpm verify:discovery /private/tmp/vcode-discovery-report.json` reads the live static/blog sitemaps and public pages without executing analytics; it checks provider user-agent probes and private boundaries. The optional report contains public page metadata only. User-agent probes do not prove access from a provider's verified IP or inclusion in its index.

`/llms.txt` is generated from reviewed bilingual product data and public/published guides. It is an optional reference, not an indexing requirement. Keep actual Search Console/Bing account coverage and impressions separate from build health, IndexNow acceptance and Umami visits.
