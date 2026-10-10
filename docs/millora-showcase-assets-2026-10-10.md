# MILLORA showcase assets — 10 October 2026

## Scope and source

The presentation data is `src/lib/game-showcases/millora.ts`. This handoff adds only that data module, the assets below and this record. Catalog availability, shared page templates, deployment and final browser acceptance belong to the VCode release owner. Existing support and approved privacy texts are unchanged. No video or Custom Product Page URL is invented.

The read-only source is `/Users/voldzi/Developer/Games/Millora/store-release/2026-10-09`. The current source `AGENTS.md` supersedes the package's older README status: iOS 1.0 (11) and tvOS 1.0 (2) are Waiting for Review on 10 October 2026, with manual release selected. The public copy therefore says that MILLORA awaits App Store review and provides no download claim. The release owner must verify availability again before enabling an App Store badge.

Selected source images were individually viewed. Source paths, sizes and SHA-256 values were verified against `package-file-manifest.json` before conversion and source hashes were rechecked afterward. The source package was not edited. English asset headings are English; the underlying genuine captured app interface is Czech in both localized sets. The presentation does not claim that these are captures of the English interface. No private contact data or App Store control-session evidence is included.

## Copy evidence

- `copy/localized/cs/IOS/description.txt` and `copy/localized/en-US/IOS/description.txt`: four on-device AI difficulties, shared local play, six interactive lessons, practice-only hints and undo, five themes, eleven languages, optional Game Center, no-account offline local play.
- `copy/localized/cs/TV_OS/description.txt`: actual TV board layout, Siri Remote space selection and two players sharing one remote.
- `docs/product-design.md`: nine pieces, placement, three-piece mills, capture protection, adjacent moves after both reserves are empty, flying with three pieces, defeat and draw conditions. The concise four-step introduction does not claim to cover every house or tournament variant.
- `assets/duo-2026-10-10/README.md` and its manifest: actual final-app Duo simulator inner-display shared board and opposed reserves. Copy describes only that visible layout, without claiming acceptance on every physical folding configuration.

The public content has six feature blocks, four rules steps and six screenshots: iPhone start, shared game, lesson, iPad themes, Duo inner display and Apple TV board. Supported mobile tilt reflections/haptics are distinguished from TV remote control. Optional online play explicitly needs Game Center sign-in and an internet connection. Offline games are not described as synchronizing across devices.

## Conversion and mobile delivery

Native-size originals are lossless WebP conversions with Sharp 0.35.4 / libwebp 1.6.0. Decoded RGBA pixels were compared byte-for-byte with each source PNG: all eleven originals passed. No crop, artwork generation, geometry changes, UI repainting, new overlays or fake device frame was added. The original native Duo display mask and existing source marketing headings remain intact.

Preview images use a uniform Lanczos3 resize, preserving the complete image and its aspect ratio, followed by lossless WebP encoding. Each preview's decoded RGBA pixels were compared byte-for-byte with the expected uniform resize: all eleven passed. Integer output dimensions follow the image library's proportional rounding. The smaller preview paths are supplied separately from original paths, so the shared component can render previews and open the full image on request.

Original assets total 10,904,336 bytes across both locales; previews total 2,326,590 bytes across both locales. A locale's six preview images total approximately 1.26 MB, with lazy gallery loading owned by the shared component. Both locales reuse the same 960 × 540 TV gallery preview. The final hero is the separate promotional composition documented below. Do not eagerly load both localized sets or every full-size original.

## Source and original manifest

Package manifest SHA-256: `741fccb13b674fd8070363daf1c4a8703ffd85577443fec4ad736f48a7e9e0bc`.

Asset root: `public/showcases/millora/2026-10-10/`.

| Output | Dimensions | Bytes | Source path relative to package | Source SHA-256 | Output SHA-256 |
| --- | --- | ---: | --- | --- | --- |
| `apple-tv-board.webp` | 1920 × 1080 | 737926 | `assets/apple-tv-1920x1080/cs/02-board.png` | `5d90246cc701b1c398249009de9499cc2d59434b1dd99ed07fd7b9ca195eeccc` | `3aa8a3ef36879d22e74c4cb71fbd1f79192013580589966df760a688c7103d6f` |
| `cs-iphone-home.webp` | 1320 × 2868 | 556472 | `assets/iphone-1320x2868/cs/01-classic.png` | `b5621dba779586de57c59b5b68d7f7ce0b92ec528717776344216b03e6c7dd0d` | `e93ce662ac6e868c2e872cdb35a04ab1db72c5de5578698ad9decbc5aaa2b641` |
| `cs-iphone-two-players.webp` | 1320 × 2868 | 1125620 | `assets/iphone-1320x2868/cs/02-two-players.png` | `89ce3146e22a65ed4771873ddf20c7081b833849bfefd3ae03884a78cd74a181` | `8fb056141c51d3eb9c6d78417308bf3b0aee6885a2afd7d24e66fe2a69c2c1f8` |
| `cs-iphone-lessons.webp` | 1320 × 2868 | 1028174 | `assets/iphone-1320x2868/cs/03-learn.png` | `78f4ede123fa49240174ddbaef3de755fff601c8b729c0893fb7bf07b65fb88d` | `c43147001afac48324ff91ca7735b21fc352beb62845356fa5e03e5d963d8f96` |
| `cs-ipad-themes.webp` | 2064 × 2752 | 1126282 | `assets/ipad-2064x2752/cs/04-themes.png` | `2baa815c6a30225c7b8621fb96d5df7798db7b622d1e24185ff268917d846aa2` | `4a1872af970225f2e161c2d5993514654d69bc11c5cc6a74176b8ed0e4505cc9` |
| `cs-duo-inner.webp` | 2007 × 2853 | 1247226 | `assets/duo-2026-10-10/cs/02-twoPlayers-inner.png` | `fd1901e6277bbfa6321d3f2d14c2f1c9bacb29cde224a6678d12d4266d1048a7` | `ac76b6e22cf6567a354d442bca63f8672177c2a5d90a58d7d3a7cacc84805135` |
| `en-iphone-home.webp` | 1320 × 2868 | 555908 | `assets/iphone-1320x2868/en-US/01-classic.png` | `25677926f6eaa328a91e0a4c2b1313d17d6fd9577d013f0c3e766f5bc1a46675` | `b4a96bb13a47c74cf4e80a75e8d9995495cd4c3e0685f065b1523f14d37f41d6` |
| `en-iphone-two-players.webp` | 1320 × 2868 | 1124148 | `assets/iphone-1320x2868/en-US/02-two-players.png` | `c400136d69761cd1ca89b0bf5c878bc1431a009089b100b7eccef9d78f7fb044` | `4b5131403f8801b0a2e422458a07b06876ab0bc224dfa41d81b0f51c64b9ed64` |
| `en-iphone-lessons.webp` | 1320 × 2868 | 1030398 | `assets/iphone-1320x2868/en-US/03-learn.png` | `b3a0a893c46d78dfbf3e2af18963fe3ca7813f72df533fecd76d8766a892afe6` | `1a28d3fd1669a986ffd7965611e59d9dea42b095fce947b135e15d6547577901` |
| `en-ipad-themes.webp` | 2064 × 2752 | 1126896 | `assets/ipad-2064x2752/en-US/04-themes.png` | `a2bd31094351634d2d9b8759447eaa7e76317583aede68ed54f8cfd131099332` | `6474a8d30a876961dafe2bae5a79d76cb184473dc8127d6912e7222566e0528d` |
| `en-duo-inner.webp` | 2007 × 2853 | 1245286 | `assets/duo-2026-10-10/en-US/02-twoPlayers-inner.png` | `4749b754bd94a57b4aae1d7a8973c81ffcad7daf537077153b4f4baba7556b97` | `5635d70976e7cfd5cd65947cca8bd5cb42ed02360254f32a018e58d62e50ebc1` |

## Preview manifest

Each source below is the full-size WebP from the preceding table. All decoded previews exactly match the specified uniform resize.

| Preview | Source | Dimensions | Bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| `apple-tv-board-preview.webp` | `apple-tv-board.webp` | 960 × 540 | 191504 | `087700ea37b693728648fb891250279cbbeb739f7ae7bd4295682e52c988a12c` |
| `cs-iphone-home-preview.webp` | `cs-iphone-home.webp` | 660 × 1434 | 157474 | `0201b2d67fe7828d643c2e8e4c7cecd5a001fe7d097b952cdb022340b2608816` |
| `cs-iphone-two-players-preview.webp` | `cs-iphone-two-players.webp` | 660 × 1434 | 295240 | `be5cca095cce3c1d12e51add40a4a7567d0bd37690a1e5a65b77f09afefcc9de` |
| `cs-iphone-lessons-preview.webp` | `cs-iphone-lessons.webp` | 660 × 1434 | 270390 | `4761cb7b14428128a70e4f4a8adc1ebe2f0a8629f523cfc8b28a8557dfb0502e` |
| `cs-ipad-themes-preview.webp` | `cs-ipad-themes.webp` | 768 × 1024 | 174302 | `93b93de2e2d1ea7888ab3f49c81dcb1c041d20106c466e654804fc24653ffc25` |
| `cs-duo-inner-preview.webp` | `cs-duo-inner.webp` | 720 × 1023 | 171644 | `b462dc55896156a4587fdff52ab8f673b21f2c1c37b632059e6910a6941db8f1` |
| `en-iphone-home-preview.webp` | `en-iphone-home.webp` | 660 × 1434 | 157744 | `7c176f31cbdc5794c01708dbdaa5ada171ee4eb56049fb8e6b1156a4875889e1` |
| `en-iphone-two-players-preview.webp` | `en-iphone-two-players.webp` | 660 × 1434 | 294428 | `e2d9d57f7b30b4452bf55598b728361a4fdb42d6eb58eb243e58814dbed5da82` |
| `en-iphone-lessons-preview.webp` | `en-iphone-lessons.webp` | 660 × 1434 | 266932 | `6a140db33578269b5d6c0b78e8c9df759fabde2473e74a6d7e50af00d6113005` |
| `en-ipad-themes-preview.webp` | `en-ipad-themes.webp` | 768 × 1024 | 173390 | `cbf8d32fd96d63ea4601e6c15f4e25ff2caf07f15da69cd926327779ff534958` |
| `en-duo-inner-preview.webp` | `en-duo-inner.webp` | 720 × 1023 | 173542 | `c43cae43857845b599b5521deeeda645119f057cd11599df857cc848b2ca01ab` |

## Verification and remaining release work

Asset checks: eleven package hashes, eleven native decoded-pixel comparisons, eleven resized decoded-pixel comparisons, intrinsic dimensions, source stability and module path existence passed. Czech and English feature/rule copy was intentionally written and checked against the supplied descriptions and rule specification.

No app build, device install, native acceptance, backend deployment or analytics change was performed by this asset handoff. Project-wide checks, responsive/keyboard/zoom/reduced-motion inspection, current store status and safe web-only release remain the parent VCode task's responsibility. Preserve the pending-review state until actual public availability is verified. Source marketing images contain only genuine application pixels plus their existing editorial headings; no motion asset exists in this handoff.

## Final promotional hero

The source application's marketing owner supplied `assets/creative/millora-universal-5244x2950.png` from `/private/tmp/millora-marketing-20261010`. This language-neutral image is a promotional composition: the actual app board and its original ivory/dark stone artwork on a matching light background. It is explicitly distinct from a native application screenshot. The bilingual alt text identifies it as a promotional composition; unchanged genuine game screens remain in the gallery, including Apple TV.

The complete input was visually reviewed. It contains no text, device mock-up, award, price or availability claim. Its board geometry and off-grid material details match the supplied creative manifest. The manifest's source iPad capture and two original stone files were independently checked by SHA-256. The source composition SHA-256 is `c7ef08e6f3f797cc673eb96d31cb518535726f67bf158042d9514d702c0ff264`; native dimensions are 5244 × 2950. Creative manifest SHA-256 is `190401ad07499028ee1daf7ca92820f31138fbaad5e1613b32b443a64fd2a7b7`.

Both output sizes retain the entire composition with uniform Lanczos3 resizing, no additional crop or overlay, and lossless WebP encoding. Decoded outputs exactly match the expected resized source pixels. `heroSrc` uses 1600 × 900 and `heroThumbnailSrc` uses 1280 × 720. `heroWidth`/`heroHeight` describe the 1600 × 900 full image. Gallery assets and their original checks are unchanged.

| Hero asset | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `millora-hero-1280.webp` | 1280 × 720 | 273052 | `c804defa90765a1b170fd18738cdb5ec7d37133217a36017ce5717d7744b5753` |
| `millora-hero-1600.webp` | 1600 × 900 | 431932 | `338e23213f96b4a82f28626897726d16965f8eca9aa9a663aa4f5cda3aeabf1c` |

Accuracy was also checked against `copy/vcode-marketing-handoff-cs.txt`: the proposed shared-device and on-device-training themes agree with existing page features. Hint/undo remain specific to practice; Game Center remains optional online play. The handoff's two Custom Product Page URLs are derived candidates with no independently confirmed public availability, so neither was added. There is still no App Store download claim, release date, fabricated video, physical Duo acceptance claim or legal-content change.
