# Jízda showcase assets — 11 October 2026

## Status and scope

Prepared **locally only** using the Jízda owner's approved icon and six authentic application captures with fictional local records. This document records local asset preparation and verification. It does not authorize or attest production publication, App Store release, COP service delivery, physical-device acceptance or CarPlay availability.

Source repository: Jizda. Screenshot sources are relative to `AppStoreMedia/Release-1.2/`; the authoritative source manifest is `screenshot-manifest.json`, SHA-256 `e5721bb89eabcdc8c9a39f20efc9c52dd5eec3ef17a47fe10158104b118dca6e`. Public derivatives are confined to `public/images/jizda/` and `public/apps/jizda.webp`. Original JPEGs, fixture sources and release artifacts are not copied into VCode.

The six captures show the real application UI from an explicitly enabled Debug simulator screenshot mode, populated with fictional in-memory records. The source manifest identifies candidate version 1.2, build 30, and explicitly says release acceptance and upload are false. The captures do not use COP, CloudKit, push, calls or live GPS. They must be presented as a preview of the prepared version, rather than screenshots of the currently released App Store version 1.01.

## Visual inspection and privacy

The VCode main agent inspected the three iPhone originals and the approved 1024px icon. The asset audit agent inspected all three iPad originals before conversion. The screenshots contain vehicle models, illustrative local journeys, amounts and fictional passenger profiles. They expose no private addresses or GPS maps, registration plates, contacts, messages, credentials, tokens or private browser endpoints. Fictional passenger names remain inside the approved original frame and are not repeated in this document.

The iPad layout preserves the application navigation and actual cards. Fuel and electricity have separate units in the vehicle overview. Some secondary labels are visually muted in the source; conversion does not retouch or increase their contrast. No test error overlay is visible. A screenshot is visual presentation evidence, not proof of the corresponding service or workflow.

## Conversion and checks

Sharp 0.35.4 produced full-size lossless WebP images preserving the whole original frame. Every full-size result was decoded to RGBA and compared byte for byte with its complete decoded JPEG source; all six matched in dimensions, channels and pixels. Source SHA-256, dimensions and alpha metadata were checked against the authoritative manifest before processing.

Small previews preserve the full aspect ratio, use WebP quality 90, effort 6, and width limits of 480px for iPhone and 640px for iPad without enlargement. The six previews total 160872 bytes. Previews are resized display derivatives; exact pixel identity applies to the full-size images. No cropping, retouching, compositing, replacement text, generated interface or artificial background was used.

The approved icon source is `Jizda/Resources/Assets.xcassets/AppIcon.appiconset/jizda-icon-1024.png`, 1024 × 1024, SHA-256 `31f17ca802d5c19ef90d32cefea8a0912003e2d7f7b7fd331fb1a613037d6ef3`. The variant “Auto v pohybu” and owner selection are documented in the source repository's `docs/archive/2026-10-07-icon-and-communication-device-check.md`. The VCode derivative is a 512 × 512 Lanczos3 resize stored as lossless WebP; its decoded RGBA matches the complete intended resized source pixel for pixel. It preserves composition and colors, with no new generation or masking. The icon belongs to the prepared version and must not establish that a new Store build is available.

The new asset directory is 0755 and all derivative files are 0644. This keeps public assets readable by the static server. No private source or configuration permissions were altered.

## Source integrity manifest

| Source | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `screenshots/iphone-17-pro/01-rides.jpg` | 1206 × 2622 | 297232 | `ec575d2e160b29a745c33904c936ae552fcfc3258250a40f4981c797b43bfa80` |
| `screenshots/iphone-17-pro/02-vehicles.jpg` | 1206 × 2622 | 356837 | `fa9c2e4c2702fcdaffe993a5379e790c7c25c20c92c1ad0ae0e0486feb2943f6` |
| `screenshots/iphone-17-pro/03-passengers.jpg` | 1206 × 2622 | 311373 | `77f48182a2f041efca318d9760a9c8c6f176722adc44a42cc31cb77ba4fef556` |
| `screenshots/ipad-13/01-rides.jpg` | 2064 × 2752 | 432623 | `193ba6b851ad4d4db99cab197bfe8fd891994691cf704b3cc9b597f81bb77ab7` |
| `screenshots/ipad-13/02-vehicles.jpg` | 2064 × 2752 | 354054 | `9fb5d623f301ff0d11668a258cd3915d94ae80add19f2241705e100c2c117781` |
| `screenshots/ipad-13/03-passengers.jpg` | 2064 × 2752 | 283684 | `b860b443e403d35ed8a649f5cba7848be4704d21725919258521c319086a5d93` |

## Public derivative manifest

| Public path | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `/images/jizda/iphone-01-rides-ec575d2e160b.webp` | 1206 × 2622 | 392754 | `d0226078f95e5ba0b480a9523aaa4dd0ec1d0b52a40162d0681787fbac72a827` |
| `/images/jizda/iphone-01-rides-ec575d2e160b-preview.webp` | 480 × 1044 | 28806 | `3fc5766dcf33954c2f6028fe6577082bff5997ea2eb276d8d78283380ebba1c3` |
| `/images/jizda/iphone-02-vehicles-fa9c2e4c2702.webp` | 1206 × 2622 | 564704 | `e7e894afa2e95b29b3acb2ff249778650d3f7be8a83f749f0b627d65f215473d` |
| `/images/jizda/iphone-02-vehicles-fa9c2e4c2702-preview.webp` | 480 × 1044 | 38312 | `0031cc204205aa872c6dae54466b39785fd4fb93c9883bfa63de3439bb7495b1` |
| `/images/jizda/iphone-03-passengers-77f48182a2f0.webp` | 1206 × 2622 | 433074 | `8b921887b5b62f6c72f057bf9889180ea35d003e53db93739fc6f5c26e2173b6` |
| `/images/jizda/iphone-03-passengers-77f48182a2f0-preview.webp` | 480 × 1044 | 32584 | `bf9a204e4c7473bd8c9bd2370249c1f70c4e53cf8213c92d3a3a689884d6acc0` |
| `/images/jizda/ipad-01-rides-193ba6b851ad.webp` | 2064 × 2752 | 392022 | `3ed9fdc4384a6e987a20c53e9f22514839725491f2848519cfe201cbe98a568a` |
| `/images/jizda/ipad-01-rides-193ba6b851ad-preview.webp` | 640 × 853 | 25638 | `b9a7436eda1ff5c533d5de2e19aaecab7aba748f3322beb004ff3bdaf950c2d4` |
| `/images/jizda/ipad-02-vehicles-9fb5d623f301.webp` | 2064 × 2752 | 412618 | `1e8623f86c669a5e2f96eceba23fee029568b6aa0b2097c51ec19826be7ff28c` |
| `/images/jizda/ipad-02-vehicles-9fb5d623f301-preview.webp` | 640 × 853 | 20728 | `68e08bf3e1e369b5c69910c684f0503e285719167a7ea371a9a7ac1621a740b0` |
| `/images/jizda/ipad-03-passengers-b860b443e403.webp` | 2064 × 2752 | 263184 | `6869390c12b893fae5e22c155e3930cb1efafaf0e8190bbfa01f8fbc48a226a5` |
| `/images/jizda/ipad-03-passengers-b860b443e403-preview.webp` | 640 × 853 | 14804 | `eacd7ac97f7e0d6a04c9b28c0cb99b42bd092e4b7e135240b5cdfad29e525341` |
| `/apps/jizda.webp` | 512 × 512 | 161296 | `8220e857509dddc0294d22d8caa0059e1e214b766c46073207953c17f23c094f` |

## Editorial use

The presentation selects the three iPhone frames and the iPad journey overview: four gallery cards. The remaining two tablet frames are prepared as optional source-team alternatives and are not linked from the presentation. The visible interface is Czech; the English presentation states this in its preview introduction. Captions cover only the visible history, vehicle/fuel/charging summaries and passenger overview. Do not infer actual shared COP records, delivered calls, live navigation or approved CarPlay from these frames.

Before any production publication, review both localized pages, preview wording, icon use and selected images together with the product owner. Privacy/legal changes remain a separate owner-review gate. Retain the source manifest and exact derivative identities for the later scoped release check.
