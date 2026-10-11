# Event presentation preparation — 11 October 2026

## State

The final reviewed screenshot package has been delivered and integrated: six
main interface captures and three visual styles, reusing the first Studio frame.
Asset provenance and checks are in `event-showcase-assets-2026-10-11.md`.
Publication is authorised by the direct human request in the Event thread to
prepare the VCode presentation and coordinate deployment with the VCode owner.
Final local checks and scoped release acceptance must still finish before a
production claim. No changes to Event itself, private access, analytics scope
or the contact service are part of this work.

## Source and destinations

The Event team provided the hero, six benefits, three-step workflow and FAQ in
`docs/product/54-vcode-event-presentation-handoff.md` in its isolated
`tmp/release-guided-redesign-20261010` tree. The working version was read on
11 October. The final handoff then delivered the reviewed gallery and confirmed
the limited publication scope.

- Czech page: `https://vcode.zeleznalady.cz/aplikace/event/`.
- English page: `https://vcode.zeleznalady.cz/en/apps/event/`.
- Copy and screenshot metadata: `src/lib/event-showcase.ts`.
- Presentation: `src/components/EventShowcase.astro`.
- Catalogue metadata remains in `src/lib/products.ts`.
- Whole-frame screenshot derivatives: `public/images/event/`.

The fifth FAQ is a practical question about arranging a guided demo, as requested
in the handoff. Draft reminders, Web Push, surveys and competitions are absent
from public copy. Internal role codes, test procedures, TLS/release notes and
capture provenance are kept out of the presentation.

## Contact and public entrance

The current live VCode pages were checked without submitting a message:

- CZ: `/spoluprace/?app=event&area=private-deployment#poptavka`.
- EN: `/en/work-with-us/?app=event&area=private-deployment#poptavka`.

Both returned 200 and contained the Event and private-deployment choices and
approved `contact-20261009` notice. The live contact script matched the reviewed
local source. Do not add other query parameters; they invalidate preselection.
Selection is editable, and only the visitor can submit a message to the existing
private inquiry inbox.

The proposed public entrance is `https://events.zeleznalady.cz/o/vcode`.
According to the Event handoff, it needs no account. Workspaces and enrollment
require an authorised account and organisation membership. It is not a public
event catalogue or open signup. The presentation labels it as the public
organisation page and offers a guided demo through the VCode contact form.

The Event analytics contract currently allows only its anonymous home page.
Linking the organisation entrance does not expand that collection scope.

## Gallery and final acceptance

Eight real interface captures, including mobile views, have been reviewed for
privacy. They use fictional demo data and no usable passwords, QR tokens,
personal contacts or private browser addresses. The scenario date supplied by
Event is 12 November 2026, 09:00–12:00, with 50 fictional places. It is an
illustrative scenario, not an invitation; label this clearly in gallery copy.

The original images were inspected, and their hash/dimensions/source and captions
checked. Full frames were preserved in lossless WebP with full-size links and
small previews. Each full-size image was verified pixel for pixel against its
decoded original. No interface evidence was fabricated or retouched.

Before publication: inspect both locales, mobile and 200% text layouts, keyboard
interaction, public entrance and both contact targets. Run `pnpm check`,
`pnpm test`, `pnpm build`; build both Docker images and run the project deployment
smokes. Preserve private dashboard authentication, public analytics boundaries,
existing services and a rollback image. Use only synthetic acceptance data.
