# Public presentation copy review — 9 October 2026

## Scope and standard

Public portfolio copy explains what an application does, who it helps, how to
try it and whether it is available. Capture provenance, test procedures, local
preview details and release bookkeeping belong in project documentation.
Keep necessary system requirements, availability, user instructions, meaningful
limitations, licences and privacy information. Illustrations remain labelled as
illustrations. Technical terms may be appropriate for specialist products and
help articles; use ordinary words when the term adds no useful information.
Review Czech and English together.

This was a copy review of the public homepage, game catalogue, canonical product
catalogue and specialist product components. Production browser inspection
covered the homepage, Městem hrou, Recall and Moje porce. It was not an audit of
private dashboard data, historical blog articles, legal texts or application
functionality, and it does not establish full accessibility compliance.

## Findings and changes

| Step | Surface | Finding and correction | Result |
| --- | --- | --- | --- |
| 1 | Městem hrou gallery | Removed the capture date and local/public screenshot provenance. The useful four-step captions already explain how to play. | Clearer game presentation; map attribution and language availability retained. |
| 2 | Recall presentation | Shortened the illustration caption, simplified setup instructions and replaced “final manifest” and the manifest link label with ordinary wording. | Index creation, optional startup and truthful illustration labelling retained. |
| 3 | Moje porce | Replaced PWA/native jargon with browser and home-screen wording; shortened the guide-maintenance and language explanation. | Installation steps, Apple release status, Premium and AI limitations retained. |
| 4 | Homepage and game catalogue | Removed commentary about the portfolio arrangement and the process of creating guides. | Introductions focus on what visitors can do; individual availability labels remain. |

No collection scope, account access, routes, scripts, forms or product behaviour
changed. Licence and privacy text, Recall source bundles, checksum information
and installation validation limits remain intact. The detailed source audit
also covered the STRATOS family and other catalogue products; no additional
release-provenance text was found there. Specialist vocabulary that describes
their actual function remains.

The two-language edits passed an independent source review. Screenshot
provenance for Městem hrou remains in docs/mestem-hrou-presentation.md.

Browser captures are kept in /private/tmp/vcode-public-copy-20261009. The initial
Městem hrou and Moje porce views record the original copy. Scrolled reveal
animations were allowed to settle before accepting screenshots.

## Release acceptance

- Source: baae5438ae521ddccbc25ec9571396609a8fe02e.
- `pnpm check` passed: no errors or warnings, 15 existing hints.
- All 107 tests passed (33 blog, 42 analytics, 32 downloads).
- Both Docker images built. The web build ran `pnpm build` and generated 156 pages.
- Web image: sha256:3f4a35aa3430aee629ec4c80f6a1618bac865bac62aaec6f19b79cd2334e8614.
- Candidate Nginx boundary checks passed for public assets, strict dashboard
  CSP, anonymous authentication, contact routing and download ranges.
- Public health, blog health, both locales, representative products/guides,
  both blog locales and public PWA resources passed smoke checks.
- The public copy checks passed for both languages: the screenshot provenance
  paragraph is absent, setup and installation wording is updated, illustrations
  remain identified, map attribution and licence/source links remain available.
- Visible text hashes of six public privacy/terms pages matched before and after
  deployment. No genuine visitor records were read or used in tests.
- A 390 × 844 preview of Moje porce at 200% text size had no horizontal overflow.
- Production browser inspection confirmed the Czech Městem hrou gallery and the
  updated Recall setup text. Browser-cached HTML was refreshed before acceptance.
- Only web was recreated; blog, worker, dashboard and downloads retained their
  container identities, images and start timestamps. The previous web image and
  source backups remain in the private release record.

Final screenshots in the audit folder: 05-mestem-after.png,
06-recall-after.png, 07-moje-porce-after.png and 08-home-after.png.
