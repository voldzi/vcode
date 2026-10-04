# Games and Event portfolio

The canonical catalog remains `src/lib/products.ts`. Games use `kind: "game"`,
independently of the STRATOS family. The exported `games` list defines the shared
six-title order for the homepage and `/hry/` / `/en/games/` hub.

Existing `/aplikace/` and `/en/apps/` product routes, App Store pages, support
and legal URLs remain stable. New games are Foldlight, Rinklet and MILLORA
(Nine Men's Morris / Mlýn). Event is in the professional app catalog.

Event, Foldlight, Rinklet and MILLORA use `inDevelopment: true`. Their public
pages state development availability, have no download badge and do not advertise
unwritten guides. Event's demo action leads to the existing support contact.
No customer names, private deployments or internal integration details are exposed.

Foldlight is a short light-and-fold showcase for iPhone Duo, with touch controls
on ordinary iPhone/iPad devices. The presentation does not imply an App Store
release or completed physical-device acceptance. The other prototypes likewise
do not promise unverified online matchmaking or release dates.

The three game icons are copies of the respective current development app assets,
resized to WebP for web delivery. Event has a simple original calendar/check icon.
Both languages, main/footer navigation, blog navigation, sitemap and `llms.txt`
include the new public pages. Městem hrou continues to use `mestemhrou.cz`.

The pages inherit VCode's existing approved public-page analytics. No separate
native-game or private Event measurement is introduced.

## Production acceptance — 2026-10-04

Released functional source: `ec8ab3c` (catalog in `64a418e`). Local canonical
checkout was fast-forwarded to the same source. Rollback source and all prior
service images were saved before the release, reference `20261004T113847Z`.

- `pnpm check`: 79 Astro files, no errors, warnings or hints.
- `pnpm test`: all 33 blog/analytics tests passed. The authenticated dashboard
  listener test required an environment allowing local loopback binding.
- `pnpm build`: 122 static pages; web, blog and blog-worker Docker images built.
- Web and blog services healthy. Existing scheduled worker remained running.
- 34 production routes/assets returned 200, including both health endpoints,
  both locales, all six game details, Event, store pages, a guide in each language,
  both blog locales, all new icons and the public sitemap.
- New development titles have no App Store badge; both Městem hrou details point
  to the new domain. Hub contains all six games and reciprocal language links.
- Browser verification: desktop and 390px mobile, no broken icons, working
  menu and Escape focus return. With root text increased to 200%, the game grid
  reflows without clipped headings; all mobile header controls fit in 390px.
  Temporary viewport and font overrides were removed.
- IndexNow accepted 152 public canonical URLs (200). This is submission
  acceptance, not a promise of search-engine indexing or ranking.

Runtime web image: `sha256:d52589d4c4dc3f718f625b3aed7caeead53cd827416e38fe34df52e81e38a2b0`.
Runtime blog image: `sha256:442068da97494375ef7a91e746ec780b8c907d48c5e5a50ceca24c942e923429`.
