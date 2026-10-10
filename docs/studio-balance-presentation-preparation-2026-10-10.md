# Studio Balance presentation — prepared 10 October 2026

## Status

Prepared and tested locally; **not deployed**. The source application requested collaboration on a presentation for other studio operators. Source interface revision: `5816c77`. This record verifies the demonstrated source version; it does not establish that every demonstrated feature is running on the current studio production website.

## Scope

- Czech and intentionally reviewed English portfolio pages, using the canonical product catalog.
- Eight verified benefits, six real interface captures, a three-step overview, five common questions and two operator guides. Existing client guides remain available.
- Existing collaboration form, with allowlisted `studio-balance` / `private-deployment` suggestions and the already-approved collaboration-click attribute. No new analytics event or field collection.
- A clear link to the actual Studio Balance website; branding and setup for another studio are offered by arrangement.
- No changes to privacy, contact services, production runtime or private analytics configuration.

## Image provenance

The source owner captured actual management components and application styles in an isolated local demonstration with fictional people, contacts, bookings and amounts. Original hashes and dimensions matched the source manifest. The full frames were converted to WebP without cropping, redaction, invented UI or generated imagery. Separate smaller previews preserve aspect ratio and link to full images. The main screenshot and gallery identify the fictional data. The cancellation capture replaces the partly cut-off recurring-class editor for a clearer action example. Internal source evidence and the reproduction archive are not public assets.

| Source | Original SHA-256 | Full WebP SHA-256 | Dimensions |
| --- | --- | --- | --- |
| `08-studio-overview.jpg` | `71c7f3bb154cfb9e3cc768a68c99ea2c53dcaf9fefd6237238e0eaf0d5b82a3d` | `3b9cf2538b05d135c5264a0192e53fcda7100c30445cb95adee84d40e208e603` | 1440 × 1000 |
| `06-session-participants.jpg` | `406156ca3dcf2f10da87c0f9b8d70ce19ef17f9ff235f9d31e49d988169378b3` | `33fef52929f86b4a8af1116593b680ec56a2fa59ebcd408d5834710bd08dabb8` | 1440 × 1000 |
| `03-instructor-report.jpg` | `4c500e12fd49b6f248988a48150d2a3660555677c604c0ed3de845c837823b9a` | `8046fb2fe9fdbf0408ef0b8164ddbc77e4478af636793ce62703e797f4838efd` | 1440 × 1000 |
| `02-cancel-one-session.jpg` | `b1e44b0c0bac62aa375b013d5c26adef1fd65378ea123069b0819b8341734ebc` | `db88eef40d511b7be49a99063a126cac7fd895faf3651d2d997c8add9c1b662a` | 1440 × 1000 |
| `05-news.jpg` | `3fb5ec3fd2fdfe60f067f8e63c7bb1aeb828f14d2776a9673fb669a77fd20f0d` | `60f0cb530bec7089713eb35147411ca1a0a81515defebe09aa2fd02fdb8529ca` | 1440 × 1000 |
| `07-participants-mobile.jpg` | `d1684a2ed7e3060bbb0c45e11cfca05eb5da2aa78bc06c52dbb5a2fc8c8dadf5` | `2df736ba6989659557209553707f671a4b4ac39d78a9372e2f3bffb8cda694c5` | 390 × 844 |

All twelve delivered WebP files total **494506 bytes**. Public images are in `public/images/studio-balance/`.

## Content boundaries

Instructor pay is entered manually; reports describe recorded amounts, not verified payment, payroll or accounting. A rolling three-month schedule is separate from the booking opening window. Cancellation sends a message to the client account, without promises of email, SMS or push. The Czech management labels are retained and explained in the English guide. No self-service studio creation, online payment, pricing, waiting-list or automatic-pay promise is added.

## Validation

- `pnpm check`: zero errors, zero warnings; 15 existing hints.
- `pnpm test`: 171 passed (60 blog, 79 analytics, 32 downloads). The first sandbox run could not bind its temporary loopback server; the authorized isolated rerun passed.
- `pnpm build`: the combined Studio Balance / Masáže preparation built 176 static pages; all content, Recall publication, catalog and contact-boundary checks passed. The accepted Recall proof and public trust key were build inputs only, outside the repository and output.
- Existing contact UI tests cover locale-independent suggestions, allowlists, invalid/duplicate fields, preservation of manual choices and reset. A separate isolated readback of the actual built contact choices and client script verified `studio-balance` / `private-deployment` in both languages, with one mock challenge and zero submissions.
- Static local preview without a development toolbar. Its contact form intentionally falls back to email because the public preview does not provide the authenticated challenge service; this is not claimed as live contact acceptance.

## Review addresses

- `/aplikace/studio-balance/` and `/en/apps/studio-balance/`
- `/navody/studio-balance-sprava-studia/` and `/en/guides/studio-balance-managing-your-studio/`
- Existing guide hubs also include both client and operator articles.

Production publishing remains a separate coordinated step after review of this concrete presentation. No Docker deployment was performed for this preparation.

## Final integration acceptance

- Both showcases and all four new operator guide routes returned 200 from the static local preview at port 4334. Canonical and alternate language links, one H1, product-specific sharing images and existing collaboration attributes were checked in the actual built HTML.
- All 24 Studio Balance / Masáže images served by that preview matched the prepared public files byte for byte.
- Studio Balance was checked at 390 × 844 and 1280 × 720. The main desktop action remains in the first viewport. Czech and English introductory text and headings do not overflow or clip at 200% text size. The guide's long Czech cancellation labels wrap correctly on a phone.
- FAQ controls work with mouse and keyboard; a gallery link opens its full image and the operator-guide link opens the actual guide.
- A final isolated execution of the built `contact.js` using actual built choices verified both locales and both applications with the `private-deployment` suggestion. It used a mock challenge, empty contact fields and zero submissions. Local preview fallback remains distinct from production form acceptance.
- Final full test rerun: 60 blog, 79 analytics and 32 downloads tests passed. The preceding run hit a temporary local port collision (`EADDRINUSE`) in a synthetic fixture; the complete rerun passed without source changes.
- The Studio Balance source team independently reviewed the six gallery images, full views, wording, cancellation workflow and desktop/mobile layout. Publication and the new guides remain subject to the owner's review; the application production service was not changed.
- Review screenshots: `studio-balance-desktop-preview-2026-10-10.jpg` and `studio-balance-mobile-preview-2026-10-10.jpg`, saved outside the public assets in the task's visualization directory.
