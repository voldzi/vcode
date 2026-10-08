# VCode Recall — visual provenance

Status: unpublished preparation. These assets do not prove release readiness, installation success, availability, service health or performance.

## Approved identity

The icon comes from the public branding source in the Recall project:

`apps/ChromaStatusBar/Resources/AppIcon-vcode-recall.png`

Source SHA-256: `9ea1de87121098db65dbe606855fddaa8a486c84e60742fdfc9f55c3556ad7d1`.

The original is a 1254 × 1254 PNG with transparency. The 512 × 512 website exports preserve its shape, proportions, colour and transparent background. No regeneration, recolouring, retouching or alternate logo was used.

| Asset | Dimensions | Bytes | Use |
| --- | --- | --- | --- |
| `public/images/products/recall-icon.webp` | 512 × 512 | 29,812 | Portfolio icon |
| `public/images/products/recall-icon.png` | 512 × 512 | 367,932 | Lossless resized fallback |
| `public/images/products/recall-overview-cs.webp` | 1600 × 1120 | 92,112 | Czech product illustration |
| `public/images/products/recall-overview-en.webp` | 1600 × 1120 | 90,300 | English product illustration |
| `public/images/products/recall-overview-cs.svg` | 1600 × 1120 | 53,134 | Editable Czech vector source |
| `public/images/products/recall-overview-en.svg` | 1600 × 1120 | 53,095 | Editable English vector source |

## Synthetic interface illustrations

The illustrations use hand-authored SVG geometry and exact text, rendered with the project's pinned Sharp dependency. The app was not launched. No screenshot, index, user settings, diagnostic endpoint or project content was accessed.

Public source references in the Recall repository:

- `Sources/ChromaStatusBar/Views/StatusWindowView.swift`: split view, toolbar and Overview / Repositories / Operations navigation.
- `Sources/ChromaStatusBar/Views/DashboardViews.swift`: readiness cards, embedding profile, repository status and recent operations.
- `Sources/ChromaStatusBar/Views/SetupAssistantView.swift`: public product icon and native runtime concept.
- `Sources/ChromaStatusBar/Support/ProductBranding.swift`: exact `VCode Recall` name.
- `Sources/ChromaStatusBar/Resources/{cs,en}.lproj/{monitor,ui}.strings`: reviewed public Czech and English terminology.

These are illustrative compositions based on the current views, **not screenshots or pixel-exact promises about the final release interface**. Each has a permanent label inside the image and a disclaimer beneath the illustrated window. The fictitious project names Lumen, Atlas and Orion were authored for the illustration. No user path, private project name, token, endpoint, version, build identifier or real metric is shown.

The fictional `3 / 3` readiness status, green badges and progress bar are examples of presentation only. They do not report test outcomes or measured speed. No latency, memory, CPU, download, installation or adoption claim is encoded in the art.

## Accessibility and integration

- SVG sources include localised `title`, `desc`, `xml:lang` and a labelled image role.
- The product page must supply a localised image alternative and a visible **synthetic illustration** caption when using WebP. The prepared product page includes both.
- All installation instructions, limitations, release state and primary benefits remain normal HTML text. No action or essential instruction depends on reading the illustration.
- Website images retain their aspect ratio and use intrinsic dimensions to avoid layout jumps. Text zoom is handled by the HTML presentation; the illustration is supplemental and can be opened at its full 1600-pixel width for detail.
- There are no scripts, animations, remote fonts or external resources in either SVG. The official icon is embedded as a small PNG; all other elements are vector shapes and text.

## Reproduction and quality review

From the VCode repository, run:

```sh
node scripts/generate-recall-visuals.mjs /path/to/approved/AppIcon-vcode-recall.png
```

The generator reads only that explicit public icon file. It does not inspect the app bundle, run a service or enumerate any directory. It rejects a source name other than the approved icon filename.

Both rendered WebP illustrations were visually inspected at their full 1600 × 1120 resolution. Czech diacritics and English labels render correctly, no text intersects the cards or window edges, the official icon remains recognisable, and the illustrative labels and fictional-data disclaimer remain visible. Small secondary text uses a minimum 4.5:1 contrast against its card background. The generation process also verified image format, dimensions, file size and hashes. Responsive website acceptance is a separate final page check by the coordinator.

| Export | SHA-256 |
| --- | --- |
| `recall-icon.png` | `9183e461bd6b8adb8a36b42fefaa685a1d4af8227f8a6db572b45b143ed658d5` |
| `recall-icon.webp` | `1a203daa651cada9185cb7f311734aebed66223de4e0cd5d744247a01b0b8515` |
| `recall-overview-cs.svg` | `9117d7d480fe5391a3a3b9d5a521d6aa875cef972e81ed3038013d0008431fcd` |
| `recall-overview-cs.webp` | `183073787674219e671ccdfa4d0bfe7c17b8bf62997f33f9a7d5a60b07ea2095` |
| `recall-overview-en.svg` | `67e3181ab4959b054c46c1a90eb4f49b07f4c7ca44c39e4d9d949ea6fc18e51e` |
| `recall-overview-en.webp` | `f135078338ca35ba30637f23f17e32a580f509795df3edca17c1a01bed37afdf` |
