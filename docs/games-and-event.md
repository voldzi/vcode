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
