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
- an IndexNow key and a bounded submission script;
- a public, documented GitHub repository linked from structured data.

Search discovery does not grant a licence to train on the content. VCode allows user-requested retrieval and search crawlers while explicitly declining dedicated model-training crawlers where providers expose separate identities.

## Operator checklist

1. Deploy and verify the canonical origin, social image, sitemaps, feeds, `robots.txt`, `llms.txt` and structured data.
2. Submit the sitemap from an owner-verified property in Google Search Console and Bing Webmaster Tools.
3. Submit the homepage to Seznam's public URL form and create or claim a Firmy.cz profile only with the verified legal business identity.
4. Run `pnpm indexnow:submit` after a material public release.
5. Inspect coverage, crawl errors and structured-data warnings monthly; do not chase ranking through duplicated or keyword-stuffed content.

Account verification records, legal business identifiers and webmaster credentials stay in the private operations inventory.
