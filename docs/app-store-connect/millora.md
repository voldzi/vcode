# MILLORA — App Store Connect handoff

Prepared 5 October 2026. The owner approved the concrete bilingual privacy wording and publication, including the 90-day retention for resolved support messages. After the initial automatic approval rejection, the owner explicitly confirmed “VCode je právní název firmy” on 5 October 2026. VCode is therefore recorded as the legal company name and public brand. This clarification must accompany the renewed deployment review. The retention limit is an operational commitment, not an email-server deletion configuration. See millora-privacy-review.md for the complete approved wording.

| Field | Czech | English |
| --- | --- | --- |
| Marketing URL | https://vcode.zeleznalady.cz/app-store/millora/ | https://vcode.zeleznalady.cz/en/app-store/millora/ |
| Support URL | https://vcode.zeleznalady.cz/podpora/millora/ | https://vcode.zeleznalady.cz/en/support/millora/ |
| Privacy Policy URL | https://vcode.zeleznalady.cz/millora/privacy/ | https://vcode.zeleznalady.cz/en/millora/privacy/ |

The application's existing `/soukromi/#millora` and `/en/privacy/#millora` links display the same shared policy component as the canonical pages. General support URLs remain valid and will link to the game-specific help. A future app build may adopt the canonical URLs; changing the app is outside this VCode release.

Product pages keep “In development” and have no App Store badge or download claim until an actual public listing is verified. Features are taken from the owner-supplied handoff and current game code: optional turn-based Game Center, 11 languages, material selection and independent reflections/sound/haptics controls. Support answers were checked against the application's Czech rules.

The complete bilingual privacy draft is rendered from `src/components/MilloraPrivacy.astro`; owner facts and approval are centralized in `src/lib/milloraLegal.ts`. The source handoff explains local storage, up to 200 results, recovery files, online drafts, Game Center and motion samples. The approved 90-day support limit is stated in both locales. Operator: VCode; contact: podpora@zeleznalady.cz; effective date: 5 October 2026. The approval flag is true following owner approval and the explicit legal-name clarification.

Release validation: run project check/test/build and container builds, then verify canonical URLs, legacy anchor contents, locale switches and support FAQ without login on a mobile viewport. App Privacy answers in App Store Connect remain a separate check against the final shipped game and Apple rules.

## Production release — 5 October 2026

Renewed automatic approval accepted deployment after the owner's explicit legal-name clarification. Both web and blog image types were built; only web was restarted. Production web image: `sha256:d584d6b199a6d7e0eb31e8de81505bf47e05e38afd5107a6220d503916e74797`. Web and blog health checks passed.

`pnpm check`, all 40 tests and `pnpm build` passed. The first sandboxed test attempt could not bind localhost; the required suite passed with socket permission. Production smoke returned HTTP 200 for all six canonical MILLORA URLs, both old privacy pages with the MILLORA anchor, both locales/product pages, representative guides, both blog locales and the dashboard. Published MILLORA and privacy HTML matched the tested build byte-for-byte. Requests used DNT/GPC and did not execute analytics or inspect visitor records. Prior local browser acceptance covered mobile layout, keyboard FAQ expansion and 200% text zoom; no physical-device acceptance is claimed.
