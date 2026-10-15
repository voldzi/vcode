# Tomato Harvest: outbound clicks and discovery audit

Checked on 15 October 2026, Europe/Prague. Scope: the existing public VCode
presentation and its discovery/analytics integration. The game developer owns
the separate CS/EN game implementation and release. This audit does not activate
new collection, change privacy notices, submit indexing requests or change
network/proxy settings.

## Production click measurement: missing

The two presentation pages have an ordinary external `Hrát zdarma` / `Play for
free` anchor to `https://games.zeleznalady.cz/tomato/`. Home and games catalogues
link to the respective internal product detail; following those internal links
is distinguishable only through destination pageviews, not a recorded click.

The actual public `/analytics/tracker.js` was fetched without executing it. Its
SHA256 is `80cde68501940726c2bf0e3469a05233560879ead1f30ddb8cd17687ae2f00f5`.
It sends pageviews and recognizes only App Store, mail contact and collaboration
clicks. It has no outbound-game event. The running dashboard service's
`security.mjs` also only accepts `pageview`, `app-store-click`, `contact-click`
and `collaboration-click`. Its legacy metadata declares the same three click
capabilities. The server-only VCode registration is legacy; no v2 event approval
or explicit outbound allowlist is present. Only selected non-secret metadata and
deployed source were read, never visitor records or raw registry contents.

Both published VCode privacy pages describe App Store/email contact clicks,
not generic game/outbound clicks. The expanded-metrics approval for separately
integrated public applications must not be assumed to have migrated the VCode
legacy collector or updated VCode's own published notice.

**Result:** pageviews do not establish that the free-play CTA was clicked.
Tomato play clicks are currently not collected or exposed as a dedicated metric.

### Concrete follow-up proposal, not activated

1. Review a precise CS/EN notice for counting the designated free-play link on
   `/aplikace/rajcatova-sklizen/` and `/en/apps/rajcatova-sklizen/` only. Preserve
   DNT/GPC, no identity or form content, maximum 180-day retention, and no
   destination URL, link text, query string, fragment or game state in events.
2. Implement an explicit `outbound-click` binding and a matching route/event
   allowlist at the collector, then expose that capability in dashboard metadata.
   The source presentation route identifies the product; a click is not a player,
   game start, installation or leaderboard submission. Preserve existing legacy
   pageviews and other approved events without duplicate collection.
3. Verify browser, collector and dashboard in isolation with synthetic fixtures,
   verify publication of the reviewed notice, then activate only that scope.
   Do not send synthetic acceptance events into production.

## Technical discovery: passes

The full live audit read **238 public canonical URLs** from both static and blog
sitemaps at 15:57 UTC. No metadata, canonical, reciprocal CS/EN/x-default,
noindex, structured-data or private-boundary findings were reported. The six
Tomato URLs (two details, two guide hubs, two first-game guides) are in the live
static sitemap. Actual public HTML contains useful content without JavaScript.

The homepages, games catalogues, guide indexes, Tomato details and guide hubs
link into the corresponding public content. Product details have `VideoGame`
structured data plus the shared Organization/WebSite/WebPage entities, reviewed
descriptions and the real gameplay image. Optional enhancements must not invent
ratings, reviews, operating systems or pricing offers.

The generated `/llms.txt` directly includes both product details and both
published first-game guides. It does not directly list the two per-product guide
hubs; these are linked from public navigation and included in the sitemap. This
is not an indexing blocker: llms.txt is an optional navigation aid, not proof of
search inclusion or an admission requirement.

The live robots policy permits Googlebot, bingbot, SeznamBot, OAI-SearchBot,
Claude-SearchBot and PerplexityBot on the presentation paths, and permits the
corresponding user-requested retrieval agents. Dedicated GPTBot/ClaudeBot training
exclusions remain separate. Public HTTP user-agent probes are not requests from
verified provider IP ranges and do not prove real provider crawling or citation.

## Actual provider evidence

### Google Search Console: verified account, not yet indexed

Read from the owner's existing authenticated property; no access grants changed.

- Aggregate report updated **12 October**: **0 indexed**, 216 not indexed;
  215 discovered but not indexed, one crawled but not indexed. This delayed
  report is not a real-time count of today's 238 sitemap URLs.
- Both Tomato detail inspections: **Google does not know this URL**, no recorded
  crawl, neither detail indexed.
- Actual live tests of both details on 15 October at **17:58 CS / 18:00 EN**:
  **URL available to Google; page can be indexed**. Live availability is distinct
  from indexing. No request-indexing button was activated in this audit.
- `/sitemap-index.xml`: submitted 10 October, last read 13 October, **Successful**,
  176 discovered pages in that stored report.
- `/blog-sitemap.xml`: submitted 10 October, last read 14 October, **Successful**,
  46 discovered pages in that stored report.

The earlier sitemap-fetch problem has therefore cleared. Today's new presentation
is newer than the stored static-sitemap read. A sensible next step after the final
bilingual game/presentation release is notifying the changed URLs and requesting
indexing of the two product details, then checking actual coverage later.

### Seznam, Bing and answer engines

- Seznam: earlier ownership/reindex receipt is recorded in
  `webmaster-verification-2026-10-10.md`. Today's Webmaster session required
  renewed sign-in after selecting the existing account. No credentials were read,
  changed or entered. **Current Seznam index coverage is unverified.** The two
  sitemap locations remain correctly advertised in public robots.txt.
- Bing: the previous verified release accepted 216 URLs through IndexNow on
  10 October. This predates Tomato and is not a receipt for its new URLs.
  No current authenticated Bing coverage evidence or new notification receipt is
  claimed. The submission tool reads current public sitemaps and rejects private
  URLs; a successful submission would still be notification, not index inclusion.
- ChatGPT Search, Claude and Perplexity: search/retrieval access is permitted;
  **actual index inclusion, recommendation or citation is not established**.
  No paid ads, backlinks or ranking guarantees were created or implied.

## Follow-up when the bilingual game is publicly accepted

Completed later the same day: the presentation update was accepted at 18:18
Europe/Prague; see `rajcatova-sklizen-language-release.md`. The missing free-play
click collection and the provider-indexing limitations above remain unchanged.

After the game developer supplies the final language URL contract and successful
public-release evidence, update the intentional CS/EN product/showcase/guide copy
and English CTA together. Remove the obsolete Czech-only UI warning. Keep the
real screenshot's alt text accurate if the pictured interface is still Czech.
Run the prescribed checks/builds and verify the affected public and analytics
boundaries before deploying the presentation update. This audit alone is not a
bilingual game or presentation release receipt.

## Evidence

Final local validation passed: `pnpm check`, **201 tests** (62 blog, 107 analytics,
32 downloads) and `pnpm build` with the existing exact signed Recall acceptance
proof/trusted public key. The build verified 188 static pages and 27 products.
The first test attempt could not open isolated loopback ports in the sandbox;
the authorized retry passed. The first build correctly refused absent private
Recall build inputs; supplying the existing verified inputs passed without
weakening the publication gate. These initial logs are retained separately.
The focused public audit passed for 12 route/link/schema checks and 18
provider-user-agent requests against both product languages, with four direct
Tomato entries in llms.txt. No source, runtime or production configuration was
changed by this documentation-only audit.

Private local acceptance artifacts are under
`/private/tmp/vcode-tomato-discovery-20261015/`: full public metadata report,
specific link/schema/UA checks, fetched public script/privacy snapshots, and
Google index/live-test/sitemap screenshots. No genuine visitor or enquiry records
were used; no synthetic production analytics events were sent.

The focused audit initially assumed the English page should contain the Czech
title, then over-assumed llms coverage of guide hubs. Those audit assumptions were
corrected to the actual language and explicit four-page llms coverage; neither
failure was evidence of an HTTP or indexing failure. Provider evidence above
remains separate from those local checks.

## Official references checked on 15 October 2026

- [Google: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google: AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)
- [Seznam: sitemap discovery](https://o-seznam.cz/napoveda/vyhledavani/seznambot/sitemap-xml/)
- [Bing: IndexNow and its limits](https://www.bing.com/indexnow/IndexNowView/IndexNowGetStartedView)
- [OpenAI: crawler roles](https://developers.openai.com/api/docs/bots)
- [Anthropic: crawler roles](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
