# Event showcase assets — 11 October 2026

## Status and source

Prepared locally from the Event owner’s approved synthetic screenshot package. This records asset and copy preparation, not a production release.

- Source package: `/Users/voldzi/Developer/18 2026/Event/tmp/vcode-event-showcase-20261011`.
- Authoritative metadata and captions: `README.md` (SHA-256 `0611408c114d8cdc19c6822e44f1c8addd5aff68c55a95b1a6b998d841741206`).
- Captured frontend source: `ee7a687d35eeec9d87b03e61f712a14e29a4b23d`.
- Feature copy: the source owner’s product document `54-vcode-event-presentation-handoff.md`.
- Public page destinations: `/aplikace/event/` and `/en/apps/event/`.
- Asset data: `src/lib/event-showcase.ts`; public derivatives only: `public/images/event/`.
- Original JPEG captures and fixture materials are not copied into the public repository.

## Visual inspection and publication boundaries

All eight original JPEG files were opened and visually inspected before conversion. They show the actual Event interface populated by a read-only synthetic fixture. UI labels are Czech; the programme includes English secondary text. The English gallery identifies the Czech interface.

The Studio, Editorial and Focus frames show the same fictional VCODE Demo organisation. The programme and dates are a fictional demonstration, not a published invitation, available video meeting or created production event.

The participant screens show the control for opening a QR pass; no working QR image, token, password, personal contact or private browser address is displayed. The mobile scanner frame shows a selected meeting and an unopened camera. It is not evidence of a successful camera scan, physical PWA installation or offline capture. The attendance report shows three fictional rows: two present and one without a record. These are illustrative states, not real attendance evidence.

The first six images form the main application gallery. Editorial and Focus are separately exported as `alternateStyleScreenshots`; the existing first Studio screenshot completes the three-style gallery.

Approved public notice (CS): **Skutečné rozhraní Eventu se smyšlenými ukázkovými údaji. Termíny, organizace a účastníci nejsou skutečnou pozvánkou.**

Approved public notice (EN): **The real Event interface with fictional example data. Dates, organizations and participants do not represent a real invitation.**

No public demo credentials are published. The external organisation page is not an anonymous event catalogue or an open registration service. The primary action stays the existing VCode enquiry form with `app=event&area=private-deployment`; private workspaces are shown through an authorised guided demonstration.

## Conversion and verification

Sharp 0.35.4 produced a full-size lossless WebP and a preview WebP at quality 90, effort 6, for every original. Preview width is limited to 960 px without enlargement. Whole frames and aspect ratios are preserved: no cropping, retouching, compositing, replacement text or invented interface.

Each source SHA-256 matched the authoritative README before processing. Every full-size output was decoded to RGBA and compared with the complete decoded source frame, including dimensions and channels; all eight matched pixel for pixel. Output digests, dimensions and byte counts were checked against the final files.

Original JPEG bytes: 650512. Full-size WebP bytes: 1780532. Preview WebP bytes: 335762. The complete preview set is about 328 KiB; full-size images are reached only through gallery links.

## Original integrity manifest

| Source | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `01-public-vcode.jpg` | 1280 × 720 | 69929 | `5afba7e85b8212129a75c101bb27adef905ac6674500f2423af7551777e92cb7` |
| `02-program-admin.jpg` | 1280 × 1499 | 149319 | `5699d5a1f5c968de126513a7c8df0a0b0bb8760cd737e2480756bc866f5f9c28` |
| `03-program-attendee.jpg` | 1280 × 1535 | 131549 | `94f67cbc235ae99f13f1739fca4682fb82446b3f605a087ed988ac76e8797b81` |
| `04-mobile-enrollment.jpg` | 390 × 901 | 41002 | `cc11e843cdb4094a998226bf3484fb53d20f8353c61f4d47120227177fc8e4ab` |
| `05-mobile-scanner.jpg` | 390 × 844 | 42395 | `3388815581d39854058c4c244c7d84c8a2489bbb4b2a04ea1b7603768dccaeb7` |
| `06-attendance-report.jpg` | 1280 × 920 | 76481 | `6ac9837c93c902934d8a38ded33a6ffe60966e3a277504cb4c4f269835286b47` |
| `07-public-editorial.jpg` | 1280 × 720 | 86817 | `c3c16c6b1bc3f82d57a6864293e48dad2e4851ac548806e052ce91fa88fcca7a` |
| `08-public-focus.jpg` | 1280 × 720 | 53020 | `fb56462bff076c185367134bd838b8463098bdf3314a6a2a1d220ae978020878` |

## Public derivative manifest

| Public path | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `/images/event/01-public-vcode-5afba7e85b82.webp` | 1280 × 720 | 257864 | `1148cabebfdea19ec4ed938f91874b9d7d24b4e0267ecb8b37412894ff251c5f` |
| `/images/event/01-public-vcode-5afba7e85b82-preview.webp` | 960 × 540 | 34796 | `4f33b0b3c699d0cc30803f73177a560c2be7fc4c3bf3613d28dae090ba6f0682` |
| `/images/event/02-program-admin-5699d5a1f5c9.webp` | 1280 × 1499 | 388380 | `57b345b7d7618a971e3be6388211e73eb96bb24960745baf545533d690b7c0a3` |
| `/images/event/02-program-admin-5699d5a1f5c9-preview.webp` | 960 × 1124 | 70538 | `77b3211fa3ac282bd6dd8710a3e9a42cd7a4605238b30ee917f87a44da0abfff` |
| `/images/event/03-program-attendee-94f67cbc235a.webp` | 1280 × 1535 | 326966 | `861e1d7c8c331691987330025f5698eb7c13dd7cbbc3b4469ee8b9527c9860a3` |
| `/images/event/03-program-attendee-94f67cbc235a-preview.webp` | 960 × 1151 | 58642 | `c72278e1850ff31c6264a168d347ffb9c1d790179366bdc073db98f7719b286d` |
| `/images/event/04-mobile-enrollment-cc11e843cdb4.webp` | 390 × 901 | 105426 | `31c09b795b032a3472fa4c2d85fa08fbad4809f02ca12a4c4eaf250293e6f284` |
| `/images/event/04-mobile-enrollment-cc11e843cdb4-preview.webp` | 390 × 901 | 33718 | `3ca3716dd77fa7e682e7347074408dd00304c0b9b9ba08dbba35494301927586` |
| `/images/event/05-mobile-scanner-3388815581d3.webp` | 390 × 844 | 108440 | `d570cb75e3fa18145d21ad4b47fc056290a937ecd61f098224cd332cc6ae0a3e` |
| `/images/event/05-mobile-scanner-3388815581d3-preview.webp` | 390 × 844 | 33754 | `f36335ecf66c6ffc28c22085049d264c411e2d4d876df7a12b5e6fe83aab424a` |
| `/images/event/06-attendance-report-6ac9837c93c9.webp` | 1280 × 920 | 163806 | `e56565ecd5ec0907a2467f7937a239e52eedb18f3a8a24a0a94b25dc5074c1bc` |
| `/images/event/06-attendance-report-6ac9837c93c9-preview.webp` | 960 × 690 | 33312 | `679bea83217753fb74f8e1b1d4b64152cce77345ed7522fd7c81d0a552d836d2` |
| `/images/event/07-public-editorial-c3c16c6b1bc3.webp` | 1280 × 720 | 305974 | `cfd29d320673002516bd5369ec7cdb9759a869c341885783dbe25dce540db393` |
| `/images/event/07-public-editorial-c3c16c6b1bc3-preview.webp` | 960 × 540 | 48314 | `5868a0cd90fa2e601ac9f36057fbd59572848905af553c38818b86c6b6f019b8` |
| `/images/event/08-public-focus-fb56462bff07.webp` | 1280 × 720 | 123676 | `67202b0d807998da29b7d829a87c78e6d3ec4cea07bb5c87d35f26e86ec1165f` |
| `/images/event/08-public-focus-fb56462bff07-preview.webp` | 960 × 540 | 22688 | `5b77a10fd6089b3b47d1477c58894a0aac8a8168ff1eae780b601c4a025dc86b` |

## Captions and scope

| Source | Scope | Czech caption | English caption |
| --- | --- | --- | --- |
| `01-public-vcode.jpg` | Desktop Studio, 1280px | Vlastní veřejný vstup organizace ve vzhledu Studio. | Your organization's public entrance in the Studio style. |
| `02-program-admin.jpg` | Desktop administration, full page | Dvoujazyčný program a další krok na jednom místě. | The bilingual programme and your next step in one place. |
| `03-program-attendee.jpg` | Desktop participant, full page | Účastník vidí program a stav své přihlášky. | Participants can see the programme and enrollment status. |
| `04-mobile-enrollment.jpg` | Mobile, 390px | Přihláška v telefonu a jasná cesta k QR průkazu. | Enrollment on your phone with a clear route to the QR pass. |
| `05-mobile-scanner.jpg` | Mobile, 390px; camera not opened | Kompaktní skener dává na první místo správné setkání. | A compact scanner puts the correct meeting first. |
| `06-attendance-report.jpg` | Desktop report, all 3 synthetic rows | Souhrn rozlišuje přítomnost a nezaznamenaný stav. | The summary distinguishes attendance from missing records. |
| `07-public-editorial.jpg` | Desktop Editorial, 1280px | Stejná organizace v klidném vzhledu Editorial. | The same organization in the calm Editorial style. |
| `08-public-focus.jpg` | Desktop Focus, 1280px | Vzhled Focus pro přehledný a soustředěný vstup. | The Focus style for a clear, focused entrance. |

## Copy decisions

The six verified benefits and three-step workflow are retained in both locales. The first four FAQ subjects cover visual identity, account requirements, prepared offline capture and duplicate scans. The fifth question explains the guided demonstration. Internal permission codes, release details and platform administration language are absent from public marketing copy. No reminders, background push, competition tools, fabricated results or delivery guarantees are promised.

Bilingual screenshot titles are concise editorial labels for visible screens. Approved caption wording and fictional-data notices are preserved exactly. The scanner caption describes meeting selection, not camera success.
