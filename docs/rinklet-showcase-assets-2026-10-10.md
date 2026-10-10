# Rinklet presentation assets — 10 October 2026

## Source and transformation

The canonical data module is `src/lib/game-showcases/rinklet.ts`. Public display assets are under `public/showcases/rinklet/2026-10-10/` in separate Czech and English sets.

All 17 accepted raw PNGs were checked against the source manifest SHA-256 and dimensions. All were visually reviewed in contact sheets; the selected iPhone Classic and Duo controller sources were also inspected at full size. Four scene types were selected in both languages: iPhone Classic, iPhone Night, Duo controller and iPad Classic.

Source manifest: `/Users/voldzi/Developer/Games/Rinklet/docs/app-store/1.0.0/screenshots/manifest.json`. Its SHA-256 is `5220022f208a643d00877db350ef0969fa0711c1b9b2d85b22bca509d7b471b3`.

Source captures show Rinklet 1.0.0 (6), captured on 9 October 2026. They remain authentic captures of the running game; they are not described as new build-7 captures. This provenance belongs in release documentation, not in public marketing copy.

The full-resolution WebPs preserve decoded RGB pixels exactly. There is no crop, retouching, framing, generated content or overlay. The `-540.webp` gallery variants retain the complete screenshot and are resized to 540 px width with Lanczos, then encoded losslessly; their pixels were verified against the resized image. System UI remains intact. The small variants are for ordinary lazy-loaded gallery rendering; the full files are available through normal enlargement links.

## Selected files

Paths below are relative to the source screenshot directory or the public presentation directory.

| Source PNG | Public WebP | Dimensions | Raw PNG SHA-256 | Full WebP SHA-256 |
| --- | --- | --- | --- | --- |
| `ordinary-accepted/iphone-medium/cs/01-classic.png` | `cs/iphone-classic.webp` | 1206 × 2622 | `0a203724a7ed88ff3c15eb38ab8950d3d7313622c36def0d4e7ea825e3c8f4b7` | `701a2cef977934005f09e4397b04465361566a8ba547b5596c64914c1d6ab24b` |
| `ordinary-accepted/iphone-medium/en/01-classic.png` | `en/iphone-classic.webp` | 1206 × 2622 | `c2885a1fc081df0c51dfaeb7c10de4292699578a53da75d52978d2aebdde525d` | `c80266d654d3c6ba1b2a43e36a10366611de4cf51f18d8a5373412cfd9647487` |
| `ordinary-accepted/iphone-medium/cs/02-night.png` | `cs/iphone-night.webp` | 1206 × 2622 | `b82984a7ad3aa89142bf83f5596d860fe5c6078530335a45bae0190015359378` | `3d3b2459f04ea3002eac3513e77bb40ccbc4fb4a5bbc36801549e18ddf68efea` |
| `ordinary-accepted/iphone-medium/en/02-night.png` | `en/iphone-night.webp` | 1206 × 2622 | `b3503e85aac14f4124cd66c557997a388e26572fe99f101c653993722be83410` | `e4af902e79dd03aa4515e79eb596842f5074c109a43624fa8951090a49f12659` |
| `duo-accepted/cs/03-control-pad.png` | `cs/duo-control-pad.webp` | 1398 × 2034 | `e81ec916ef06cdc2aec63969a4c2a88086720a1fc373ba0f93d13a58f681a6a9` | `abcb50652e7a370e0f5c59de4af3f7da28407598247f736525d790013a89a845` |
| `duo-accepted/en/03-control-pad.png` | `en/duo-control-pad.webp` | 1398 × 2034 | `2c0d0170a3e813d4015b33301579ff21e8fe56f47ae94904aafb149d44f4a867` | `914f09b9631e4e3948f6d5392ac7c69d01d71ae8108b1f41958da0124caffdf3` |
| `ordinary-accepted/ipad-13/cs/01-classic.png` | `cs/ipad-classic.webp` | 2064 × 2752 | `fb9934a0fe1b70117419522a9809b221e4bf9b2747dffda6cc6f5c348b331cd8` | `9848f59e912143c5eae44f940a7d6a99c2fc785630dfcdf6d98f91c726c90e24` |
| `ordinary-accepted/ipad-13/en/01-classic.png` | `en/ipad-classic.webp` | 2064 × 2752 | `1768a92d1c69dbf2b7c05bac235a168f157027a9a9b343f715f3e78bb87d9bb7` | `5348868e26700eafaea56d4a321955b2718892cc65bd51d61b4650fe5bd9100e` |

## Gallery derivatives

| Public thumbnail | Dimensions | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `cs/iphone-classic-540.webp` | 540 × 1174 | 441594 | `db6971d142fe8c880847395f769a3fbe543a479f0c7a9392dd1013e9412b17c8` |
| `en/iphone-classic-540.webp` | 540 × 1174 | 441756 | `cd7451c78866bdd3eac2eddba31b12db82798306ac7280bfbc16aff9636e4a5d` |
| `cs/iphone-night-540.webp` | 540 × 1174 | 240026 | `85f848871af3414dda83b9539ed5dc248b496ae90f6dbea1fafc14010c2db157` |
| `en/iphone-night-540.webp` | 540 × 1174 | 240050 | `5d0133f4c698934b0c87db024f52db8490ff55768ac0b7f6c464205224bb0ee2` |
| `cs/duo-control-pad-540.webp` | 540 × 786 | 130888 | `97b91ef61d1c8c624908eec2d3bee549f05fa11146f2d5b8462bde18e25fb125` |
| `en/duo-control-pad-540.webp` | 540 × 786 | 132234 | `bbba8a5d3139d196ddaa97b0246961ec13346a65b6e2233232751e9d4ae232f2` |
| `cs/ipad-classic-540.webp` | 540 × 720 | 232192 | `00c23184732858d8fc1660f3efa315b6f0bbe3433b5c0b2b661d33113f1a47ef` |
| `en/ipad-classic-540.webp` | 540 × 720 | 231958 | `f094c227b803fbefaf1ca48297ce99f4cbbcdde2e360b7f658616dd20879cec4` |

Four gallery thumbnails total 1044700 bytes for Czech and 1045998 bytes for English. Full-resolution screenshots should not load as ordinary gallery previews.

## Content evidence and limits

The bilingual presentation uses the current game metadata, `docs/product-design.md`, `docs/iphone-duo.md`, `docs/localization.md`, `docs/online-duel.md`, and the implemented winning-score/difficulty choices in `Sources/RinkletCore/GameTypes.swift`.

- Three computer difficulties, practice, local two-player play and Game Center online duel are implemented modes. Local play is offline without an account; online play requires internet and Game Center.
- Winning scores are 5, 7 or 10; practice does not end with a winner. Each mallet stays on its own half of the table.
- Split controls are for solo, practice and online. Local two-player play uses a continuous table. The same manually selected arrangement works on ordinary iPhone and iPad.
- Eight implemented languages are Czech, Slovak, Polish, German, French, English, Spanish and Simplified Chinese.
- The current version has no advertising or in-app purchases. No privacy, support, collection, analytics or backend behavior was changed by this task.
- The first four screenshot types show games against the computer. The additional build-7 local-duel screenshots show the actual local two-player mode. No screenshot is described as an online match.
- Physical Duo posture/ergonomics and a full two-account Game Center match are not established by these simulator screenshots. The public copy does not promise flawless Duo or network behavior.
- Source metadata originally stated Waiting for Review for 1.0.0 (7), manual release. On 10 October 2026 the release coordinator independently confirmed the public Apple lookup for Rinklet 1.0.0, App ID 6821032563. The presentation now states availability on the App Store for iPhone and iPad. The screenshot capture build remains 6; the public listing version does not change capture provenance.
- A corresponding local two-player gameplay recording was supplied and verified in the follow-up below. No online gameplay, physical fold demonstration or additional video was invented. Custom product-page links remain separate follow-up material.

## Validation

All 17 original hashes/dimensions match the source manifest. All eight full WebP decodes exactly match their original RGB pixels. All eight thumbnail decodes exactly match their complete resized RGB images. Public paths and bilingual alt/caption fields are present. Full route, accessibility and production validation are owned by the release coordinator.

## Supplied promotional hero

Source: `/Users/voldzi/Developer/Games/Rinklet/docs/app-store/marketing-2026-10-10/creative/rinklet-web-hero-1600x900.webp`. Public copy: `public/showcases/rinklet/2026-10-10/rinklet-web-hero-1600x900.webp`. Dimensions: 1600 × 900. Size: 80,870 bytes. SHA-256: `47e749415c30e703907f15ae4b34dca3421c053798ee0fb663405a932d3de08d`. The public copy is byte-for-byte identical to the supplied file and its source creative manifest.

The source team generated this promotional key art with the built-in image generator, using the Night screenshot’s colours and objects as a reference. It depicts a dark air hockey table, teal and coral mallets and a puck. It is not a screenshot or evidence of actual gameplay UI. The Czech and English alternative text explicitly identify it as a promotional illustration. It has been visually reviewed; no source image was changed in this VCode task.

The same 80 KB file supplies heroSrc and heroThumbnailSrc; an additional derivative is unnecessary. Hero dimensions are explicit at 1600 × 900 for a stable layout. The gallery continues to use genuine localized screenshots.

## Additional local two-player capture and video

Source capture root: `/private/tmp/rinklet-marketing-20261010/captures`. Source manifest: `capture-manifest.json`, SHA-256 `3ae720d082684d6e8e516a53c7846967d8342dac2878bc6227d7df1b5d5c265a`. The manifest identifies Rinklet **1.0.0 (7)** running on the dedicated **Rinklet QA Duo** simulator and a GUI-only `UITests/MarketingCaptureTests.swift` capture test, with no production source change. Its result bundle is `/private/tmp/rinklet-marketing-20261010/duo-marketing.xcresult`. It explicitly records simulated UI input and `physicalQAProven: false`. These new captures do not inherit the earlier build-6 screenshot provenance.

Both supplied PNG hashes were verified against that manifest. Both screenshots were visually checked: Player 1 / Player 2 labels, two mallets, a moving puck and a continuous table are visible. The English source clips a small part of the top score/header; this source framing is preserved without retouching, and the player labels and table remain readable. No physical hinge posture or real two-person physical-device acceptance is claimed.

| Source PNG | Dimensions | Raw PNG SHA-256 | Full WebP SHA-256 | Gallery thumbnail SHA-256 |
| --- | --- | --- | --- | --- |
| `cs/01-local-two.png` | 1398 × 2034 | `dd212987286a32a4181e0e4935ddaf9b80fbfde6be6b8bbde038b4c6d19ebd9d` | `4d18910cef19cc035668c4a8c445b3a53b397fc9eea5f57a98014eec53c9e7c9` | `dc73df9f6cb50f4b94da8b48b153d191c455d8cb0e676b3ecc94376fbbf748b1` |
| `en/01-local-two.png` | 1398 × 2034 | `31264083aa4a3a1cf6edb96d7ae3d4182e226c4af3fb4a9dd19d1224b9485ba0` | `dc364dc28a9c51714a8c4a6672d808c2e2aee76d70fe60c7e384c617cbfd6753` | `c92d53e42b166b845662dbd05c6e2ab15f2bde372d64386dc4492e9db6741b5e` |

Public full files are `cs/local-two.webp` and `en/local-two.webp`, relative to the presentation asset directory. Their decoded RGB pixels exactly match the supplied PNGs. The complete-image 540 × 786 gallery variants `cs/local-two-540.webp` and `en/local-two-540.webp` are only resized with Lanczos and encoded losslessly, with decoded pixels verified against the resized images.

The new thumbnails are 275606 bytes (CS) and 276122 bytes (EN). The five-image gallery now totals 1320306 bytes (CS) and 1322120 bytes (EN).

The supplied MP4 was copied byte-for-byte to `public/showcases/rinklet/2026-10-10/duo-local-two-gameplay.mp4`. SHA-256: `4d01eb5b0745661ed13672e68ee59fba088c49b446025d1c480d6b086ecf8050`. Size: 1,829,314 bytes. It is 18.000 seconds, 1398 × 2034, H.264 High / yuv420p, 30 fps, 540 frames, with one video stream and **no audio stream**. The complete copied video decoded without error. Actual copied-MP4 frames at 2, 9 and 15 seconds were visually reviewed and show a moving puck and mallets in the local two-player mode. The recording uses the English interface.

The unmodified source raw recording is `duo-local-two-raw.mov`, retained by the source team. VCode publishes only the supplied compressed MP4. It does not generate new gameplay, add audio or change frame content. The poster is the verified small Czech local-two screenshot, as requested.

The data module exports `video` with source, poster, dimensions and bilingual title/caption. The shared template must use user controls, inline playback and `preload="none"`, with no autoplay. Shared-component/browser acceptance is the release coordinator’s responsibility.
