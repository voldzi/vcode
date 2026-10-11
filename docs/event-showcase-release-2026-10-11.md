# Event showcase production release — 11 October 2026

## Accepted production state

The bilingual Event presentation was deployed and accepted at
**12:36:24 Europe/Prague (10:36:24 UTC)**. Publication was authorised by the
direct human request in the Event thread to prepare the VCode presentation and
coordinate its deployment. The deployed source is
`9efb15e69ab9232b8cc32d9bff8653a8aa89f498`.

- Czech: https://vcode.zeleznalady.cz/aplikace/event/
- English: https://vcode.zeleznalady.cz/en/apps/event/
- Public organisation entrance: https://events.zeleznalady.cz/o/vcode

The presentation contains reviewed bilingual benefits, three workflow steps,
five FAQs, six main interface captures and three style cards. Studio reuses the
first capture, so there are **eight unique captures and nine gallery cards**.
Screenshots show the real interface with fictional demo data and are labelled
accordingly. Full frames are preserved, with small previews and links to the
complete images. Original provenance and pixel checks are recorded in
`event-showcase-assets-2026-10-11.md`.

Both contact links select Event and private deployment in the existing VCode
form. The selections remain editable. No message was submitted for acceptance.
The public organisation entrance was checked without an account; private work
requires the existing authorised account and organisation membership.

## Release identities and scope

- New web image:
  `sha256:408fe45a413ecc7b7fca12370063b1a7cb351c998a134dac2626d184da612273`
- Previous web image retained for rollback:
  `sha256:b8f1e8819bd93cf9001cde676e17e10c63a3d136d2707a9f806a70d0e390ac0d`
- Required blog image built and checked, without changing the running blog:
  `sha256:40b2faacc9c8986a067198b41916fead37b2cf027e259a550535b9f5864dc706`
- Dashboard PWA image preserved:
  `sha256:bde65b52b1b0e4e1a18db4bba64f144e2a4541775c1248a40d5f3193675ac921`

Only the web container was replaced. The 23 reviewed source files comprised the
Event component and copy, catalogue metadata, both product routes, 16 image
derivatives and preparation/provenance documentation. Source hashes were checked
before the release and after installation. An isolated candidate was built
before any live source replacement. Eight previously reviewed non-runtime
source differences were preserved.

The nine related services retained their exact container identity, image,
start time and runtime fingerprints. All 18 preexisting configuration-file
fingerprints remained unchanged. The web environment, process, health settings,
ports, storage, network membership and security configuration were preserved.
The private dashboard and its activated notification service were not restarted.

## Validation and public acceptance

- `pnpm check`: no errors or warnings; 31 existing hints.
- `pnpm test`: **199 passed** (62 blog, 105 analytics, 32 downloads).
- `pnpm build`: **176 static pages**, with catalogue, contact and discoverability
  checks passing.
- Both required production Docker images built successfully.
- Isolated Nginx boundary checks passed: dashboard CSP, inherited asset headers,
  static/proxy compression, anonymous 401, exact contact routes/header allowlist,
  body bounds and distribution ranges.
- Public health, both home and blog locales, representative Studio Balance,
  Masáže and Městem hrou guide pages returned 200.
- Both Event pages returned 200, with one H1, the correct canonical URL, public
  entrance, both contact destinations, existing tracker and CSP.
- All linked gallery image bytes matched the reviewed candidate hashes.
- Google and Seznam verification tags remained present in both home locales.
- The dashboard shell remained `no-store`; its summary, inquiry, partnership,
  attention and notification APIs returned 401 to an anonymous client. The
  internal contact path remained 404 publicly.

Local responsive acceptance covered Czech and English, 320/390 px phone widths,
desktop, 200% text enlargement, keyboard FAQ operation and visible focus. A
post-release Czech phone check confirmed one H1, nine gallery links and no
horizontal overflow at 390 px. The saved production screenshot is
`event-production-mobile-20261011.png` in this chat's visualisation directory.

No genuine visitor or inquiry records were read. No contact submission, Telegram
message or real push notification was sent. This release makes no physical
camera/offline-scanner acceptance claim and does not expand Event analytics
beyond its existing anonymous home-page contract. The catalogue's existing
development and availability metadata was preserved intentionally.

Machine-readable acceptance, candidate inputs, build logs and rollback files
are retained in the protected server release named
`event-showcase-20261011`. Private runtime overlays and
registries must remain on the server.
