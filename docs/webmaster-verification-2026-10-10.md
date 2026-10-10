# Google and Seznam ownership verification — 10 October 2026

The owner explicitly approved registration in the currently authenticated Google
Search Console and Seznam Webmaster accounts, publication of their verification
proofs and sitemap submission. No other account or user was added.

## Production release

- Source: `2a8cb38`; release `webmaster-20261010`.
- Accepted at **21:19:00 Europe/Prague**, 10 October 2026.
- Web image: `sha256:b8f1e8819bd93cf9001cde676e17e10c63a3d136d2707a9f806a70d0e390ac0d`.
- Previous web: `sha256:e7281033afc753200048969b9691400ac228575c0ed086216064a3dcc14fd415`.
- Only the public static web service was replaced. Nine related service containers,
  including blog/worker, dashboard, collectors, database, downloads and relay,
  retained their identities, images and start times.
- Effective runtime environment, mounts, networks, ports, resource limits, security
  and process identity were checked before replacement. Runtime environment and
  mounts matched after replacement. Rollback source and immutable image selection
  remain in the protected release directory.
- Google and Seznam proof tags were read back from both live home locales.
- `pnpm check`: no errors/warnings, 15 existing hints. `pnpm test`: 177 passed.
  `pnpm build`: 176 static pages and all publication/discovery gates passed.
- Both required Docker images built. Isolated Nginx boundary checks and live health,
  both home/blog locales, representative product/guide and private API smoke passed.
- No genuine visitor/inquiry records, submissions or Telegram messages were used.

## Provider acceptance

- Google displayed **Vlastnictví ověřeno**, using the HTML meta tag.
- Google accepted `/sitemap-index.xml` and `/blog-sitemap.xml` submissions. Initial
  sitemap status was **Nelze načíst**; successful submission is not successful
  sitemap processing. The published files and child sitemap return 200, parse as
  valid Sitemap XML and are advertised in public `robots.txt`.
- Google's live test of `/sitemap-index.xml` subsequently also reported that the
  URL is accessible. No request to index the XML as a search-result page was made.
- Google's actual live homepage test reported **Adresa URL je Googlu dostupná**
  and **Stránku lze indexovat**. Google accepted the homepage indexing request into
  its priority crawl queue. The existing index snapshot reported that the homepage
  was not yet known. New-property aggregate reports are still processing.
- Seznam registered `https://vcode.zeleznalady.cz/` and opened its verified private
  Webmaster overview. The homepage reindex operation returned **200 OK** with
  `{"status":200}`. The current daily overview still reports zero indexed pages.
- Seznam discovers sitemap locations through `robots.txt`, as described in its
  [official sitemap documentation](https://o-seznam.cz/napoveda/vyhledavani/seznambot/sitemap-xml/).
  Both canonical sitemap URLs are present there. No separate Seznam sitemap-upload
  confirmation is claimed. Its experimental fetch UI produced no result, so it is
  not acceptance evidence.

Google sitemap processing and actual index coverage require a subsequent provider
readback. Ownership, crawl accessibility, accepted notifications, indexing and
ranking remain separate states. Bing owner-account verification was not part of
this approval and remains unverified. Provider API credentials and account evidence
stay in private operations storage; public HTML ownership proofs must remain deployed
to preserve verification.
