# Městem hrou presentation — 9 October 2026

The canonical product remains in src/lib/products.ts. Both existing product
routes include MestemHrouShowcase.astro. The homepage and games hub use the
updated short catalog copy and the direct public trail catalogue URL.

## Source and scope

Owner-provided package: vcode-ukazky-2026-10-09.zip. Reviewed README, texty.md,
manifest.json, zdroje-a-licence.md and the supplied HTML handoff. All 15
source/declared PNG and WebP hashes match the source manifest. Copy was reviewed
in both languages; only selected games are available in English. No Instagram
publication, route count promise, partnership or field verification is implied.

Original WebP artwork and four complete screenshot files are retained. The task
screen was captured in an isolated local preview with the same catalogue; the
other screens came from the public app. The public caption states that distinction
and the capture date. No player identity or solved answer is displayed.

The app owner supplies the screens, brand and artwork. No font files or commercial
tourism content are redistributed. Map screenshot attribution is retained without
cropping, with a visible link to © OpenStreetMap contributors and ODbL 1.0.

## Rendering and privacy

Images are self-hosted and versioned. Proportional 640/1200px compositions and
270px screenshots were created with Sharp 0.35.4, WebP quality 85, without crop
or content edits. The original screenshots remain the full-size link targets.
All images have dimensions, lazy loading, localized alternatives and responsive
source hints. Gallery links work without JavaScript. Motion respects reduced
motion; the long showcase is excluded from the percentage-based reveal observer
so it remains visible at large text sizes.

Existing VCode pageview tracking remains. Game links are ordinary public links;
no new event, identifier, collector scope, privacy wording or private application
tracking is introduced. No iframe, remote font or extra runtime library is added.

## Published assets

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `01-vyber-vyprav-270.webp` | 15,670 | `e1c4e1847d8022f300113d7530bd98c9a0bc182972a7c50c9d31b373b0745c40` |
| `01-vyber-vyprav.webp` | 178,692 | `9ddc9e7eced1342831339afe4385a99411257137eb3aa8ce339dc90354cd8f03` |
| `01-web-hlavni-ukazka-1200.webp` | 47,488 | `ff7ffd403e9a8f8d782616adbe1ef63d6bd173eb0fba430457bb20014fda0274` |
| `01-web-hlavni-ukazka-640.webp` | 19,278 | `4b4108d46b8f43c7844187edcb60f160d4e21057bfe84719b8c065e86ff6ebfe` |
| `01-web-hlavni-ukazka.webp` | 152,560 | `fd9ec5f420bf76ab92f254a0d6acb1f78c84806c908c08ab85bbb9c9a9a4c1d2` |
| `02-detail-vypravy-270.webp` | 16,158 | `3f7208f1d11d16bd3eec8503ad4611c8057afe79c1925ec5dce0e1b1fdd35ba6` |
| `02-detail-vypravy.webp` | 177,756 | `2c8f1c1c410038f2efcbf2b6f3f73c4a8165c50381f62ba9d96010b2650c4521` |
| `02-web-mapa-vypravy-1200.webp` | 49,446 | `e5d10272ff08abe18e56a23b403b58fd7ccddf08ee3c56d14e5340b8f0291dac` |
| `02-web-mapa-vypravy-640.webp` | 20,544 | `f79e0a162d04700e39241b9862c7fb4e71677d0b3c5f92d8e19dd75902b3f94b` |
| `02-web-mapa-vypravy.webp` | 98,808 | `3c5afae30c8432ed00bf8f0d7b2a85faa6218f2d43f365017d29aaebce19b9ca` |
| `03-mapa-vypravy-270.webp` | 23,776 | `7de591b1e4c20d053f422377618077acec4e170de1d1e532659a03f00ec8f7a2` |
| `03-mapa-vypravy.webp` | 291,644 | `58d86775a4b84b21b19464f51c3d5954ab921876e64ef1a712afbd33bbf9a5c0` |
| `04-herni-ukol-270.webp` | 11,850 | `5eddfe96f0a6c7510b4a673adb024be7d1ffa8c02b37c789b7a1bebfb4e340d2` |
| `04-herni-ukol.webp` | 120,782 | `cbc4ec440b6538723ffacb4abcc99e34c185853fea69ffba2269cf7c1e6490d1` |

## Acceptance — 9 October 2026

Released functional source: `822414a` (presentation in `bd3c0e9`).

- `pnpm check`: no errors or warnings; 15 existing hints.
- `pnpm test`: 107 passed (33 blog, 42 analytics, 32 downloads).
- `pnpm build` in the exact web image: 154 static pages; signed Recall build
  proof remained required and verified. Both web and blog images built.
- Isolated Nginx boundary validation passed: dashboard CSP, gzip, anonymous 401,
  contact boundary and distribution ranges preserved.
- Browser: desktop and 390px phone; gallery opens with Enter without JavaScript
  enhancement. At 200% text, the final English candidate had no product content
  extending beyond the viewport. The long gallery remained visible; the Czech
  title was also checked at enlarged text. All temporary overrides were reset.
- Public acceptance passed for health/blog health, both main/game/product/guide/
  blog locales, analytics tracker, public PWA resources and both game targets.
  All 14 served image hashes matched the exact release source.
- Production gallery visually verified: all four images loaded, no horizontal
  overflow, visible captions, accessible full-size links and map attribution.
- Only the static web runtime changed. Blog, scheduled worker, dashboard and
  download service container identities and start times were preserved.
- The first deployment automatically rolled back when the acceptance script
  incorrectly classified the relative RSS alternate as a language link. After
  correcting the check to inspect hreflang links, the same candidate passed
  acceptance and was released. Rollback evidence is retained privately.

Runtime web image:
`sha256:cf15f55f311e9dc2c828b621c839e26c6342a13af7a6d662911d1469f70e46b6`.
Runtime blog image (unchanged):
`sha256:fe6ddbca464b0a8859953bd3ef7385feb0cbc66ed09d37f75befb7568587ea7d`.
