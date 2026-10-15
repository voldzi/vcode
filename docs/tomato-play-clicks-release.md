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
