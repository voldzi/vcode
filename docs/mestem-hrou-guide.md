# Městem hrou first-trail guide

The guide hub previously had no published content for this application. Two
reviewed public manuals now use the existing content/guides collection and
akb-application-docs-1 metadata. Product IDs are validated against the canonical
public product catalog rather than a second, incomplete hard-coded list.

- Czech: /navody/mestem-hrou-prvni-vyprava/
- English: /en/guides/mestem-hrou-first-trail/
- Both existing app-guide hubs automatically list their corresponding manual.
- Product presentation links directly to the manual via Jak se hraje / How to play.
- Global help indexes, automatic sitemap and llms.txt expose the new resources.

## Content review — 9 October 2026

Reviewed against current Městem hrou sources, not an assumed translation of the
Czech interface. App.tsx covers selection, route preflight, offered play modes,
arrival, task answers, hints, ending, resume, installation and limited offline
preparation. EnglishApp.tsx has its own selected game catalog and labels.

A separate source review checked both drafts. Corrections for English cover typed
cipher answers, the compass/manual arrival difference, hidden unsolved location
identity and the stronger hint available only in cipher games. English has no
show-solution or skip control. Czech offline-preparation and report/settings
controls are not advertised as English controls. The guide does not disclose
answers, personal data or a player's progress and does not assert field approval.

No product behavior, privacy notice, data scope, account access or collector
configuration changes. The existing public analytics sanitizer accepts both new
static guide paths. No genuine visitor data is used for acceptance.

## Rendering

Guide titles, metadata and links wrap at large text sizes. Long guide bodies are
excluded from the percentage-based reveal observer so text remains visible on
phones at 200% text zoom. Native links need no client-side enhancement.

## Production acceptance — 9 October 2026

- Source: bda87e9a1e20f5a03b38cbd56bb5d150c5c0eb0b.
- `pnpm check`: no errors or warnings; 15 existing hints.
- `pnpm test`: all 107 tests passed (33 blog, 42 analytics, 32 downloads).
- Both Docker images built; the web build ran `pnpm build` and generated 156 pages.
- Web image: sha256:8b64ff7b3b4a4470489146d5fc28ef78ec7602f10f37297d0865dcc2181170d5.
- Blog build retained sha256:fe6ddbca464b0a8859953bd3ef7385feb0cbc66ed09d37f75befb7568587ea7d.
- Candidate Nginx boundary checks passed, including strict dashboard CSP,
  inherited asset headers, anonymous 401, contact routing and download ranges.
- Production health, blog health, both locales, representative product and
  existing guide pages, both blog locales and public PWA assets returned 200.
- Both new manuals, their hubs, global indexes and product links passed public
  checks. Sitemap and llms.txt include both manuals; served site.js matches the
  candidate. Guide security headers and the private summary's 401/no-store/strict
  CSP were checked without reading genuine visitor records.
- Mobile preview at 390 × 844 passed for both manuals and the Czech hub at 200%
  text size, with no horizontal overflow and visible long guide content. Keyboard
  navigation from the hub and the article language switch worked.
- Production Czech hub and manual were visited; the empty placeholder is gone.
  Captures: /private/tmp/vcode-mestemhrou-guide-20261009/production-guide-hub.png
  and /private/tmp/vcode-mestemhrou-guide-20261009/production-guide.png.
- Only web was recreated. Blog, worker, dashboard and downloads retained their
  container identities, images and start timestamps. Rollback files and the
  preceding web image remain in /srv/vcode/releases/mestemhrou-guide-20261009.

This checks documentation and rendering, not a physical trail walk or an actual
installation on a phone.
