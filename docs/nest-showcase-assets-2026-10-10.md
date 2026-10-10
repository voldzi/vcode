# NEST showcase assets — 2026-10-10

## Scope

Public presentation data: `src/lib/game-showcases/nest.ts`. Public assets: `public/showcases/nest/2026-10-10/`.

The Czech and English copy covers the shared hexagonal nest, surrounding the opposing chick on all six sides, local two-player play, on-device AI, Game Center multiplayer, and basic/advanced/expert rules. It does not change support, privacy, gameplay, analytics or App Store metadata.

## Source and visual review

Source root: `/Users/voldzi/Developer/18 2026/NEST/release-assets/ios-1.5/duo-20261010/`.

All five permitted source PNGs were inspected visually. They are original application framebuffer captures, as documented in the source README. The wide game capture shows an actual local AI match with six deployed pieces. The two menu views have separate Czech and English originals. Their black and white bird/hexagon identity is retained. No generated illustration, mock device frame, retouching or crop was added.

The native-resolution WebP copies preserve every decoded RGBA pixel and original width/height. Each result was decoded and compared byte-for-byte against the corresponding source PNG RGBA buffer. Display derivatives use proportional LANCZOS resampling and then lossless WebP encoding; their decoded RGBA buffers were compared with the resampled buffers. Full-size WebP copies remain available for enlargement.

### Original capture hashes

| Source PNG | Pixels | SHA-256 |
| --- | --- | --- |
| `cs/01-closed-menu.png` | 1398 × 2034 | `478e07c89b504fdd9ea98b217caa13055ab271c829766ab02d07ddfe90da9994` |
| `cs/02-open-menu.png` | 2853 × 2007 | `4af0efaf32bc875aef42d5fa7064fb6666c969610d7d4e95fe4eab1fbe8de134` |
| `cs/03-open-game.png` | 2853 × 2007 | `ff001c2d272b5609620d0c64fd2b8fa85f473e0c7243a5deec2cf7018ecdacb5` |
| `en/01-closed-menu.png` | 1398 × 2034 | `f2cd40cf470fd3a24df019c28a2ae8a2ff72375f6224d4b443a87d7524c975d6` |
| `en/02-open-menu.png` | 2853 × 2007 | `ee54fb9c3784120fbc6406704a638cb546d7b5d6fad8f4fc74352570da56fcf8` |

### Native-resolution WebP copies

| Public file | Pixels | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `menu-portrait-cs.webp` | 1398 × 2034 | 340856 | `988149cb95ce2da4367f4c33fd1f3dcc3adaba7ae4c381c2a0ca91634a4a573d` |
| `menu-wide-cs.webp` | 2853 × 2007 | 516720 | `680905335a78db7afe68a90802ca13823fff8f6e4089505e0dadbfd2be9e4867` |
| `game-wide.webp` | 2853 × 2007 | 2368644 | `41a75728007ac5173bb219d9219232f3a64dc39d70958f49038ed9d71ad18624` |
| `menu-portrait-en.webp` | 1398 × 2034 | 340822 | `99f92f46052e85cbf8bf4887c3626fb9dd7e7c3c2e47c425f14886ff4cc4b234` |
| `menu-wide-en.webp` | 2853 × 2007 | 516076 | `2f4a487651ef165e7665f0dead235a4d6b10b5c9d6d27225724765033594143f` |

### Display derivatives

| Public file | Pixels | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `menu-portrait-cs-640.webp` | 640 × 931 | 109938 | `fa4bac6896b51129d26e6ee140e713754c80c00683c30714dd996a89357045de` |
| `menu-wide-cs-960.webp` | 960 × 675 | 114716 | `715e0738db561472b5a20701da78093cf867be2b119b4e904fd0c2214222f629` |
| `menu-wide-cs-1280.webp` | 1280 × 900 | 181106 | `fb604951363b7e65e0c3b1b157acb68b09ef4685942fcad0af3532ab40f932ac` |
| `game-wide-960.webp` | 960 × 675 | 421478 | `ec7d0a93bd071a1ad1237efc5eb1c7a0d1e93ac2da6de321a4e769caacb8d63b` |
| `menu-portrait-en-640.webp` | 640 × 931 | 109544 | `e767d113b8e0e65f60ae88a18c6accbde71bf3cb7ff7c040ef8fb758920e87fc` |
| `menu-wide-en-960.webp` | 960 × 675 | 114286 | `3cd1f6e30b09b5589b9c7222ffb877392a1b5cfb9963e9d8646f529fe6685017` |
| `menu-wide-en-1280.webp` | 1280 × 900 | 180992 | `71899c09fbfca16c86447f11f1524032c0a5e68937e696f20a9e601c0f28ee3a` |

## Presentation choices

- Hero: locale-specific wide menu, displayed with its 1280 px derivative (about 181 kB).
- Gallery: real match, wide menu and portrait menu. Menu sources and display derivatives switch to their English originals in the English experience.
- Full images: the same unretouched screenshots at their native resolutions, encoded losslessly as WebP.
- Public captions describe gameplay. Capture dates, local build paths, QA history and acquisition details are kept out of marketing copy.

## Correctness and remaining gates

- Gameplay and mode descriptions were checked against source `README.md`, `docs/app-store-listing-1.4.md`, `docs/app-store-listing-tvos-1.0.md` and the retrieval results for those documents.
- The source README explicitly states that the active AI uses heuristic search and that no neural model is bundled. Public copy says on-device AI without claiming a neural model, cloud AI or benchmarked strength.
- The source capture README identifies the pictured release application as iOS 1.5 (7) and reports released iOS 1.5. Older upload/AGENTS text still records iOS 1.5 / tvOS 1.1 as Waiting for Review on 2026-10-09. Exact current release status must be checked live before publishing version-specific claims. No version/build numbers were added to marketing prose.
- No Apple TV screenshot is substituted by an iPhone capture. Platform support is described in copy; the actual gallery is from the iOS application.
- The QA-only `qa/04-closed-game.png` is excluded. Its documented unused right-hand strip is not hidden by cropping. The presentation does not claim fully accepted or perfect iPhone Duo gameplay.
- No matching video exists among the inspected release assets, so no video or simulated gameplay was added.
- These local assets and data have not themselves been deployed. Shared page integration, bilingual browser review, the required VCode checks and release verification belong to the root release task.
