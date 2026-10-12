# STRATOS family presentation

The seven existing STRATOS product pages now explain the work each application
supports, rather than presenting only a short capability list. Both Czech and
English use the shared `StratosShowcase.astro` renderer and deliberately reviewed
copy in `stratosShowcase.ts`. The existing product catalogue remains the source
for names, availability, homepage summaries and family membership.

## Public scope

The existing slugs are `stratos`, `budget-contract`, `executive-center`,
`projectflow`, `archflow`, `akb` and `stratos-voice`. Czech pages remain under
`/aplikace/`; English pages remain under `/en/apps/`. Existing canonical URLs,
reciprocal languages and structured product metadata are retained.

Each page provides a clear purpose, intended users, five supported capabilities,
three everyday situations, three starting steps and links to the rest of the
family. The shared journey explains needs, budget planning, project preparation
and management oversight. AKB provides supporting documents; Voice is optional
and does not require a project or portfolio for recording and local transcription.

Access Center is described as central STRATOS administration. Chat is part of
the AKB presentation. Neither becomes an invented additional product entry.

## Presentation boundaries

- The six web products are available through private deployment. Demo links use
  the existing collaboration page, preserving its product and deployment-area
  query parameters and existing collaboration-interest integration.
- STRATOS Voice is being prepared for the App Store. Its actions lead to existing
  support and privacy pages, without a download badge or invented Store URL.
- Illustration cards are explicitly labelled as examples. They contain no
  customer records, organisation-specific figures, screenshots or private URLs.
- Preparation before costs are known is distinguished from authorisation to
  spend. Architectural proposals and transcript corrections remain subject to
  human confirmation.
- Model exchange is described without promising unrestricted imports, product
  parity, certification or acceptance by an external authority.
- English pages explain the products; they do not assert that every application
  interface is fully translated.

## Shared presentation

The renderer uses semantic headings, native details/summary controls, responsive
grids, visible keyboard focus and wrapping for enlarged text. It adds no custom
client script. Existing site navigation, contact activation, privacy information
and analytics remain under their existing ownership and approval rules.

The new conditional in both product routes applies only to the STRATOS family.
Other product showpieces, including the current Moje Porce conditional and its
static visibility marker, must remain intact when integrating this change.

Canonical product icons are maintained through `ProductIcon.astro`. Executive
Center requires its own approved Flow mark; it must not inherit the STRATOS mark.
STRATOS Voice retains its existing mark and must not be assigned the Chat icon.

## Verification and release

Run `pnpm check`, `pnpm test` and the complete `pnpm build`. A full build uses the
existing accepted Recall proof and publisher public trust as private inputs; those
inputs must never be committed or emitted into `dist/`. A preview-only Astro
compile does not replace this publication check.

Verify all fourteen locale/product routes, single primary headings, family links,
explicit example labels, narrow mobile layouts, enlarged text and keyboard FAQ
interaction. Follow the existing collaboration activation policy; a disabled
contact form must retain its normal email fallback. No live enquiry needs to be
submitted to validate product links.

For release, apply only the owned presentation paths onto the currently accepted
materialised source map. Preserve other product assets, held publication states,
existing privacy/terms files and the operator's separate infrastructure changes.
Build and accept the immutable web artifact using the established VCode release
procedure. The presentation is a website release, not a STRATOS application,
AKB service or App Store activation.
