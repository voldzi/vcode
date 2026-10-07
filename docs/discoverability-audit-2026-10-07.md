# Public discovery audit — 7 October 2026

The pre-release live XML sitemap audit checked 162 canonical static and published-blog URLs. All returned successfully, had matching canonical links, Czech/English alternates, a title and description, one H1 and no noindex directive. It used plain HTTP retrieval with DNT/GPC and did not execute analytics or inspect visitor records. All static internal links in the final 138-page build resolve; blog and authenticated dashboard routes were excluded from that static-file check because they are served separately.

The release adds Czech/English STRATOS Voice and Myslopis product pages plus four approved public Voice privacy/support pages. Astro generates their sitemap entries. The llms product reference now includes both products and corrects the obsolete Kalorické tabulky name to Moje porce. Canonical origin and crawler rules preserve the exclusion of /prehled/ and dedicated training crawlers. Public retrieval/search crawlers remain allowed.

A public search query returned no matching results in the available search provider; this cannot establish complete Google/Seznam/Bing index coverage. Technical accessibility and sitemap submission are not proof of indexing, rankings or inclusion in AI answers. Actual coverage requires the owner's verified Search Console and Webmaster properties; no credentials or verified-property access were available in this task. Do not claim every page is indexed. After production smoke, submit live canonical URLs through the existing IndexNow script and record the response.

Myslopis root returned 200; its robots.txt and sitemap.xml returned 404 at the initial check. Its chat received the explicit owner-authorised request to provide public discovery metadata and the shared privacy-constrained analytics interface. VCode listing does not activate Myslopis measurement. Questionnaires, answers, results, PDF files and tokens must be excluded from indexing and collection. New site collection requires exact site-specific privacy approval and independent acceptance.

## Post-release verification

The final live audit passed all 172 public canonical URLs with zero findings. IndexNow accepted all 172 URLs with HTTP 200. Health, blog health, CS/EN product/help/blog and all four Voice privacy/support URLs returned 200. All six vendored Flow assets matched source bytes. The 138-page static build, pnpm check and all 42 tests passed. The Voice chat received the verified final URLs for its own iOS and App Store Connect handoff; VCode did not modify that native repository or perform distribution.
