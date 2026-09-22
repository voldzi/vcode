# App Store public pages

VCode provides stable, bilingual public URLs for the fields required in App Store Connect. These pages are static, indexable and do not depend on login.

## Jízda

| App Store Connect field | Czech URL | English URL |
| --- | --- | --- |
| Marketing URL | `https://vcode.zeleznalady.cz/app-store/jizda/` | `https://vcode.zeleznalady.cz/en/app-store/jizda/` |
| Support URL | `https://vcode.zeleznalady.cz/podpora/jizda/` | `https://vcode.zeleznalady.cz/en/support/jizda/` |
| Privacy Policy URL | `https://vcode.zeleznalady.cz/jizda/privacy/` | `https://vcode.zeleznalady.cz/en/jizda/privacy/` |

## COP Mobile

| App Store Connect field | Czech URL | English URL |
| --- | --- | --- |
| Marketing URL | `https://vcode.zeleznalady.cz/app-store/cop-mobile/` | `https://vcode.zeleznalady.cz/en/app-store/cop-mobile/` |
| Support URL | `https://vcode.zeleznalady.cz/podpora/cop-mobile/` | `https://vcode.zeleznalady.cz/en/support/cop-mobile/` |
| Privacy Policy URL | `https://vcode.zeleznalady.cz/cop-mobile/privacy/` | `https://vcode.zeleznalady.cz/en/cop-mobile/privacy/` |

The website does not claim that either application is already available in the App Store. Update `src/lib/products.ts` only after the corresponding public listing is live.

## Release check

Before submitting a version, verify all six URLs return HTTP 200, their language switch points to the matching locale, product claims still match the shipped version, and the privacy text reflects the current permission and data flows.

