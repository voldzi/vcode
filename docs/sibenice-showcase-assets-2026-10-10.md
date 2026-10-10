# Šibenice showcase asset and copy review — 2026-10-10

## Public scope

Prepared Czech and English presentation data for the existing VCode pages. This change does not modify the game, support/privacy text, contact services, analytics or App Store configuration.

Publicly available version: **1.3**, App Store ID **1436866698**, per the coordinator's live Apple lookup on 2026-10-10. The gallery is explicitly an **upcoming update** preview of **1.4**, not a representation of the current downloadable version. iPhone and iPad availability is retained. No Apple TV availability or physical Duo acceptance is claimed. The normal App Store product remains the download target; no unapproved custom product-page link is used.

## Source evidence

- `/Users/voldzi/Developer/Games/Sibenice/README.md`: current feature scope and remaining language/physical-device release checks.
- `/Users/voldzi/Developer/Games/Sibenice/Sibenice/Helper/Helper.swift`: eight `GameLanguage` cases (Czech, Slovak, Polish, German, French, English, Spanish, Simplified Chinese), independent word decks and translated interface. These additions are described as upcoming; native-speaker review and fuller word decks remain source-project release checks.
- `/Users/voldzi/Developer/Games/Sibenice/docs/dictionary-audit.md`: word-deck distinctions and limits; no unsupported universal child-safe dictionary claim.
- `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/README.md`: normally launched and played real app, clean final captures, no debug screen launch or added overlays. Simulator app reports **1.4 (2)**; distribution **1.4 (3)** changes the build number only, using the same UI source. These captures are not a physical-device acceptance or the signed distribution binary.

Only the six clean `final/{cs,en}` captures are exported. Rejected captures and older 1.3 screenshots are excluded. The source project was read only. No video is invented.

## Visual and copy decisions

- Three paired CS/EN gallery items: portrait gameplay, landscape gameplay, result.
- The third Czech capture shows a two-player win and score. The third English capture shows a solo win and elapsed time. Each locale has its own accurate caption and alternative text.
- The visible clock is elapsed time, not a countdown. Copy explains solving the word before the drawing is complete, avoiding the former unsupported time-limit wording.
- Artwork is the game's `PastoralLandscape` illustration. It is a decorative hero, separate from the gallery of actual interface captures. Its alternative text explicitly calls it an illustration.
- Full screenshots are lossless WebP without cropping, compositing, recolouring or added text. The 540px thumbnails preserve the complete frame and use lossless WebP after resizing. Decorative hero exports are quality-90 WebP at 1280px and 540px, preserving the whole illustration.
- All six originals, the illustration and representative generated exports were visually inspected. All 14 exports pass `webpinfo`; screenshots report lossless encoding with no error. Dimensions and hashes below come from the exported files.

## Source SHA-256

| Source | SHA-256 |
| --- | --- |
| `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/cs/01-duo-outer-progress.png` | `49669f1c172a044a736a447cb0b802cf476ac7f71c250eb4ef41c999e42f61aa` |
| `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/en/01-duo-outer-progress.png` | `d1e262062160283120a1bd0bcadba544a4aee524d2a1bd18287022b8c1f34dc9` |
| `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/cs/02-duo-inner-open-progress.png` | `860dbd1ee3a81db80feb96b6113eeb717ca022302224af30a1e11e3e8ddd146a` |
| `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/en/02-duo-inner-open-progress.png` | `ff4f8367fa009a26acdb4ae07b99a8cb89e1eebc155ca53078106eeaa81e6cad` |
| `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/cs/03-duo-inner-two-player-win.png` | `3bf582f45ed182a6d90428d66651e7741f48fa0379f533200f4c3b0d7734b29d` |
| `/Users/voldzi/Developer/Games/Sibenice/AppStore/Screenshots/iOS-1.4-build3-Duo/final/en/03-duo-inner-win.png` | `91572e9a973fa23ef7282418de9d7f5a9a0b40df23c2c4b24a3004bf6fe6e5ae` |
| `/Users/voldzi/Developer/Games/Sibenice/Sibenice/Resources/Assets.xcassets/PastoralLandscape.imageset/PastoralLandscape.png` | `957ae4b15521fd0f9cf5005128d30b24df3f2e8183426171a6e7f1b28602cff6` |

## Export manifest

Assets reside under `public/showcases/sibenice/2026-10-10/`. Full images are for deliberate enlargement; the gallery should load their 540px thumbnail fields. The hero should use its 1280px export rather than an original PNG.

| Export | Pixels | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `public/showcases/sibenice/2026-10-10/game-portrait-cs.webp` | 1398 × 2034 | 2236120 | `583e801e1466f619f803944416806aceab9f8782a48d3e028a28daefe9b12353` |
| `public/showcases/sibenice/2026-10-10/game-portrait-cs-540.webp` | 540 × 786 | 395958 | `eef9f736f7ee620fab044946b19ae86c75160162dccd79afcea08723849240e5` |
| `public/showcases/sibenice/2026-10-10/game-portrait-en.webp` | 1398 × 2034 | 2248438 | `d6ee81ee86481c0447dbaefcaf3dfb4524f3d972e3f4e87706182c11be93e396` |
| `public/showcases/sibenice/2026-10-10/game-portrait-en-540.webp` | 540 × 786 | 396232 | `3faab7dc8a5624075191e29face2d9fd7ebdf96da20ebe31d15b5887d898f48a` |
| `public/showcases/sibenice/2026-10-10/game-wide-cs.webp` | 2853 × 2007 | 3951246 | `3baeffe62d95eb97bcfa89fe4b5ea69c93dd9d99991cbbd3a3a8c5ffc4f3febc` |
| `public/showcases/sibenice/2026-10-10/game-wide-cs-540.webp` | 540 × 380 | 211916 | `7c1767b00d4bb20bfa49fe56fb8add214185fed04fbb678cce0308de57ef40b9` |
| `public/showcases/sibenice/2026-10-10/game-wide-en.webp` | 2853 × 2007 | 3910372 | `a61f930d9afa29ed246976edec741e350eb4212d34d9309843f40ebe9b33ceeb` |
| `public/showcases/sibenice/2026-10-10/game-wide-en-540.webp` | 540 × 380 | 210784 | `b8d5e3766e112922391503e84756607675b26ee7af82368bd045720fa55ba49e` |
| `public/showcases/sibenice/2026-10-10/result-wide-cs.webp` | 2853 × 2007 | 2958318 | `22e5d65bd15b7110f922afd842cccfdb83626a45efbf16ca01d6e31f3338d84c` |
| `public/showcases/sibenice/2026-10-10/result-wide-cs-540.webp` | 540 × 380 | 162016 | `ad11e9fdc98fc58e55d683f06c128e07271b97bb9d8c72b3f2150826db74a708` |
| `public/showcases/sibenice/2026-10-10/result-wide-en.webp` | 2853 × 2007 | 3014720 | `999e6b82ab8c127ea4c9e16be32c41c9ae783a5e2f65e62fa725783b6bad3746` |
| `public/showcases/sibenice/2026-10-10/result-wide-en-540.webp` | 540 × 380 | 161912 | `b3f8453a27b8ffba48ef41de0973898966c0c27bf780fa4c46b6a52f97a7ba00` |
| `public/showcases/sibenice/2026-10-10/pastoral-hero-1280.webp` | 1280 × 721 | 141940 | `a397bba39c4b55008e5b4a42f293e3c9419df4d066592f062c0a58111ed7cc80` |
| `public/showcases/sibenice/2026-10-10/pastoral-hero-540.webp` | 540 × 304 | 36086 | `f8b731dc590baa809fffc528478e452bccf2baf811511cea9b992fdf1d082a05` |

## Integration

`src/lib/game-showcases/sibenice.ts` exports `sibeniceShowcase`. Its optional `galleryKickerCs/En` and `galleryTitleCs/En` fields must be rendered by the shared component so the upcoming-update status is visible immediately above the screenshots. The availability sentence also distinguishes the downloadable game from the preview. Shared routing, catalog text, style, legal links, required validation and production release are owned by the VCode coordinator.
