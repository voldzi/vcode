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
