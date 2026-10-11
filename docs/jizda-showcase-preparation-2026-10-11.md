# Jízda presentation and App Store handoff — 11 October 2026

## State

The full Czech and English presentation is prepared and verified **locally**.
This is not a production release. The Jízda owner requested a web presentation
following the VCode Masáže page and coordination with VCode. The source team
explicitly limited this handoff to local preparation, including the approved
new icon and authentic screenshots with fictional records. Publication of the
selected images and any legal changes remains a separate gate.

The production website was not deployed or reconfigured. The Jízda application,
App Store Connect, Apple entitlements, COP services, credentials, private
dashboard, notification services and analytics registry were not modified.
No messages or forms were submitted and no genuine visitor or inquiry records
were used for acceptance.

## Verified availability and factual boundaries

On 11 October, the public Apple page and a bounded Apple lookup both confirmed
Jízda, ID **6744852413**, bundle `cz.voldzi.jizda`, publicly listed version
**1.01**, for iPhone, iPad and Apple Watch:

https://apps.apple.com/cz/app/j%C3%ADzda/id6744852413

The UI and lookup exposed different release dates; the presentation does not
repeat either date. The available version supplies the core journey, vehicle,
passenger, expense, statistics and export functionality. Its map/navigation
feature is described by Apple as experimental. No price or guaranteed automatic
trip detection is promised.

The next version is separate. The supplied `AppStoreMedia/Release-1.2/`
description and screenshot manifest describe a candidate, not an accepted
public release. Expanded vehicle records include charging; personal and COP
shared vehicles, COP routes with an alternative Apple route, and optional COP
communication are all labelled in preparation. Access and coverage are
conditional. No source UI or simulator capture proves operational COP delivery.

CarPlay wording in both languages says that it is in development, requires
Apple approval and is not yet available. It does not assert that an entitlement
request has been submitted, is being reviewed or has been approved.

## Canonical URLs for the Jízda team

All eight existing product, support and legal destinations below returned
HTTP 200 in production on 11 October. The richer product presentation in this
change is still local; production currently retains its previous presentation.
Existing support/privacy/terms URLs are preserved.

| App Store field / purpose | Czech | English |
| --- | --- | --- |
| Marketing URL / full product presentation | `https://vcode.zeleznalady.cz/aplikace/jizda/` | `https://vcode.zeleznalady.cz/en/apps/jizda/` |
| Support URL | `https://vcode.zeleznalady.cz/podpora/jizda/` | `https://vcode.zeleznalady.cz/en/support/jizda/` |
| Privacy Policy URL | `https://vcode.zeleznalady.cz/jizda/privacy/` | `https://vcode.zeleznalady.cz/en/jizda/privacy/` |
| Terms | `https://vcode.zeleznalady.cz/jizda/terms/` | `https://vcode.zeleznalady.cz/en/jizda/terms/` |
| Guide hub | `https://vcode.zeleznalady.cz/navody/aplikace/jizda/` | `https://vcode.zeleznalady.cz/en/guides/apps/jizda/` |
| Existing App Store landing page | `https://vcode.zeleznalady.cz/app-store/jizda/` | `https://vcode.zeleznalady.cz/en/app-store/jizda/` |

The current Apple listing still links to the historical developer website and
privacy destination on `voldzi.cz`. Updating those App Store Connect fields is
work for the Jízda release team; this preparation does not submit such changes.
Use the product presentation as the Marketing URL and the dedicated support
and privacy URLs for their own fields. This preserves the shared VCode route
conventions without inventing new addresses.

The four existing privacy and terms source pages are byte for byte unchanged
against the starting VCode commit. This URL check does not constitute a new
legal review or an App Store privacy-label review for the next Jízda release.

## Implementation

- `src/lib/products.ts`: correct the catalogue's outdated App Store preparation
  status and keep upcoming COP features distinct from the public core.
- `src/lib/appStore.ts`: add the verified direct Apple link, platform text and
  `iOS, watchOS` metadata. Existing localized official Apple badges and credits
  are reused without modification.
- `src/lib/catalog.ts`: recognise verified watchOS Store metadata so Jízda's
  Apple Watch version is listed as available rather than upcoming. Required
  catalogue checks now enforce the verified Jízda platform boundaries.
- `src/lib/jizda-showcase.ts` and `src/components/JizdaShowcase.astro`: six core
  benefits, three steps, a distinct upcoming section, four preview images,
  five FAQs, help/legal links and an application-specific collaboration CTA.
- Both dynamic product routes render one Jízda heading and suppress the former
  generic sections. Canonical URLs, reciprocal language links, structured
  application data, sitemap and the AI reference are preserved. The social
  preview uses the prepared icon.
- Four existing public guides intentionally distinguish the next version.
  The first-time setup names the actual Czech `GPS záznam` and
  `Spustit GPS záznam` actions and places vehicle selection in the form.
  English describes the actions without inventing an unverified translation
  of the new control labels.

The hero's abstract route is decorative SVG, not a fabricated application
screenshot or an actual GPS map. The gallery is explicitly a preview of the
upcoming version with fictional records; English identifies the Czech UI.
Only three iPhone images and the iPad journey overview are selected. Asset
hashes, dimensions, pixel checks and the two unused tablet alternatives are in
`jizda-showcase-assets-2026-10-11.md`.

The collaboration links use only the existing `app=jizda` and
`area=partnership` choices. Both remain editable by a visitor. Browser
verification confirmed those values were preselected; no submission occurred.
The existing pageview, App Store and collaboration-click contracts are reused.
There is no new event name, collector, site registration, private path or scope
extension. Global layouts, CSP and the tracker are unchanged.

## Verification completed

| Check | Result |
| --- | --- |
| `pnpm check` | 0 errors, 0 warnings; 31 existing hints |
| `pnpm test` | 199 passed: 62 blog, 105 analytics, 32 downloads |
| `pnpm build` | 176 pages; Recall signed publication proof, catalogue, contact and discoverability checks passed |
| Catalogue | Both locales list verified iOS and watchOS availability; other private/upcoming platform gates remain intact |
| Local routes | Product, Store and revised first-time guide pages in both languages returned 200 |
| Gallery | All 12 prepared images returned 200 with bytes matching source derivatives; real full-size image opened at 1206 × 2622 |
| Layout | 1280px desktop and 360px mobile, both locales; no horizontal overflow; one product h1 |
| Text enlargement | At 360px, root font changed temporarily from 16px to 32px; document width remained 360px; readable wrapping inspected |
| Keyboard | Enter on the native CarPlay FAQ summary opened its answer |
| Contact link | Jízda and partnership preselection confirmed; no message sent |
| Legal sources | Four existing privacy/terms files unchanged |
| Assets | Original manifest hashes verified; full-size WebP decoded pixels match supplied JPEGs; files 0644 and directories 0755 |

The first plain build lacked the existing private Recall proof inputs. The
established accepted proof and publisher trust were then supplied as build
inputs, and the unchanged gate passed. No substitute attestation, proof output
or relaxed validation was introduced. Private proof inputs never enter `dist/`.
The final build and subsequent browser verification include the source team's
precise CarPlay wording. Temporary browser text scaling and viewport overrides
were reset after inspection.

## Next publication step

Review the complete CZ/EN presentation, the new icon and four selected preview
frames for publication. Any requested privacy/legal amendment requires its
own product-owner review. Once publication is authorised, use a scoped static
release with both Docker builds, existing health/blog/product/guide smoke
checks, authenticated/public analytics boundaries and the retained rollback
image. Local preparation and this document do not activate a production release
or establish App Store/CarPlay acceptance.
