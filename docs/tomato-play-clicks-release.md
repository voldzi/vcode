# Tomato Harvest: free-play clicks

## Authorization and reviewed scope

The owner's direct request in the game chat, message
`01a14082-e2f0-7b70-be52-f89b26526e56`, on 15 October 2026 at 19:01:22
Europe/Prague explicitly authorizes implementing and activating the free-play
click counter, publishing Czech/English privacy information, testing, deployment,
and requesting Google/Bing indexing of the two presentation URLs. This follows
the concrete narrow proposal in `tomato-traffic-discovery-audit-2026-10-15.md`.
The original approved analytics retention, DNT/GPC, no cookies/signed-in identity
and private-statistics boundaries remain in place. No broader click or game
activity measurement is authorized.

The intentional Czech and English notice is held together in
`src/components/TomatoClickPrivacy.astro`, version `tomato-play-2026-10-15`.
Both descriptions were reviewed against that explicitly authorized scope; no
claim of a separate word-for-word owner response to this new component is made.
Existing privacy paragraphs are preserved. The published notices are
`/soukromi/#tomato-play-clicks` and `/en/privacy/#tomato-play-clicks`.

## Contract

- Event: `outbound-click`, VCode's existing public website registration only.
- Source paths: `/aplikace/rajcatova-sklizen/` and
  `/en/apps/rajcatova-sklizen/` exactly.
- Designated links: `Hrát zdarma` to `/tomato/?lang=cs`, `Play for free` to
  `/tomato/?lang=en`. No catalogue/home/other-game click is added.
- The browser sends only `website`, `name` and the canonical public presentation
  URL. No incoming/destination link URL, query/hash, referrer, text, account data
  or game state. One passive click listener handles native mouse/touch/keyboard
  clicks; no parallel pointer/touch/key counter is installed.
- No pageviews, cookies, retry/offline queue or credential transmission in the new
  script. DNT/GPC/offline is checked before sending; navigation is never prevented.
- The static versioned runtime is integrity-pinned on only the two details.
  The legacy pageview/App Store/contact/collaboration runtime remains unchanged.
- The collector rejects any extra payload fields, other routes, relative or
  noncanonical URLs and missing/incomplete publication approval. The private
  registration is reloaded per request, enabling revocation without another code
  deployment. Notices must be read back before activation.
- Dashboard capability identifies the event as Tomato play clicks, with its own
  actual `collectionStartedAt`; it does not inherit the earlier pageview date.
  A click is not a count of players, started rounds or installations.

## Acceptance and rollout

Isolated tests use mock Umami, synthetic data and local ports only. They cover
accepted and rejected HTTP bodies, foreign origin, DNT/GPC, disabled approval,
authenticated dashboard capabilities, preserved legacy counters, blocked fetch,
single binding, exact destinations and integrity. No synthetic valid production
event or genuine visitor record is an acceptance input.

Build both mandatory web/blog images and a narrow analytics overlay over the
actual running image. Preserve runtime environment, process, volumes, sessions,
networks, CSP and private boundaries; replace only the web and dashboard service.
Publish notices first, read their exact bytes, then atomically enable only the
scoped registry object. Keep other site registrations exact. Hold the VCode
deployment lock and register the accepted generation for retention afterward.

Google URL-inspection requests are owned by the game chat, after the final public
release signal. VCode owns one IndexNow request containing precisely the two
canonical details. Submission acceptance is not indexing, ranking or AI citation.
Final runtime identities, times and provider receipts are recorded after actual
acceptance, not inferred from this preparation document.

## Accepted production result

**Active since 15 October 2026, 19:42:37 Europe/Prague**
(`collectionStartedAt=2026-10-15T17:42:37.773481+00:00`); accepted at 19:42:38.
Both notices were read back before activation. Deployed source:
`0b8516539c737a398b51987957ada02b0daea115`.

- Web: `sha256:2d27a3a9ceaa353ca4bfafba2290a3d76b50b57f86d30dbee6e1eb122bae1cee`.
- Dashboard: `sha256:b5ddb78deb951c0c1f9ce264e73d7857b9a800c3666627b04486e89ab21a54fb`.
  Its original configuration/base layers and an explicitly tagged return image
  are preserved. The actual image passed isolated HTTP tests with no external network.
- Both mandatory Docker builds passed; the blog candidate was not activated.
  Actual blog `da133e46…` and the other twelve services remained unchanged.
- Check, **209 Node tests**, the 188-page build and seven selected asset matches
  passed. Only two details and two notices changed; 184 HTML pages stayed identical.
- The versioned client is SHA256 `48128fced125d18a41c80da0c0704b1d4c306081b9201f492c43852078ad2f75`,
  pinned with `sha384-Z5G0P72Z3Btw/f8JeS0XpbXPytuWLKAYzKeMXNLFGvgO14ik2x/bNraAF4/W8mvz`.
  The legacy tracker is unchanged, SHA256 `80cde685…`.
- Real IAB checks covered native CS/EN navigation, integrity/markers, 390px layout
  and notices at 16/32px root text. Initial QA found the fragment heading obscured
  by the fixed header; that candidate was not promoted. Scoped scroll margin
  fixed it before final tests/build. Physical-device/WCAG conformance is not claimed.
- **36 public HTTP checks passed** including anonymous private 401s, notice
  hashes and held media 404s. Actual runtime confirmed the active gate and
  capabilities. All eight other registrations and registry inode/permissions
  were preserved. Read-only Umami heartbeat returned 200 at 19:50.
- No genuine visitor records, valid synthetic production events, scores,
  enquiries or Telegram messages were acceptance inputs. A separate chat also
  independently checked actual container/image identities, notices, client/SRI,
  scope and 14 client fixtures without sending production events.

Published full-HTML SHA256: CS `bdd401869fda8fef5bc2ebb47407ad3d25b30fb395224af1581aeffca8a60b5b`;
EN `8a8882ecc9698ab8f639ada7000e98c34c19f06cab910b67201846f26b98f72d`.
Retention now protects this release, `tomato-languages-20261015` and
`tomato-showcase-20261015`. No images, release trees, backups or user data were
removed; X5 limitations remain in the separate retention audit.

## Actual indexing-request receipts

The game chat performed both Google requests once through the existing property:
CS **19:30:51**, EN **19:31:46 Europe/Prague**, each with an explicit priority-crawl
queue confirmation and actual screenshot. The canonical URLs were already final;
no new account, permission grant, CAPTCHA interaction or duplicate request occurred.
IndexNow returned **HTTP 200 at 19:44:12** for exactly the two canonical details,
using the existing public key. No sitemap or additional URL was submitted.
These are accepted requests/notifications, **not proof of indexing, ranking or
AI citation**.

Safe receipts/screenshots are in this chat's private `tomato-clicks-20261015`
artifact archive. Server release identity: `tomato-clicks-20261015-r2`. Raw registry
backups and runtime configuration stay server-only. Later documentation edits do
not replace the accepted image or mutate its immutable acceptance receipt.
