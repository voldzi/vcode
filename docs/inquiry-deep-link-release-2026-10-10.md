# Dashboard inquiry link release — 10 October 2026

## Cause and repair

Telegram already linked to `/prehled/#inquiries`. The dashboard and inquiry section
were hidden during the browser's initial fragment navigation. Authentication and
asynchronous rendering subsequently revealed them without retrying navigation.

Source commit: `08ecd2a`. Section navigation now waits for authentication, visible
content and preceding asynchronous sections before scrolling once and focusing
the destination heading. It also supports repeated clicks, fragment history and
restored pages. Manual scrolling cancels a pending jump; refreshes do not pull the
reader back to a previously visited section. Unknown fragments are ignored.

## Validation

- `pnpm check`: no errors or warnings; 15 existing hints.
- `pnpm test`: 177 passing tests (62 blog, 83 analytics, 32 downloads).
- `pnpm build`: 176 static pages and existing catalog, contact and discovery gates.
- Both required web/blog Docker images and the dashboard image built successfully.
- Isolated Nginx integration smoke passed, including CSP and anonymous access denial.
- Browser acceptance at 390 × 844 used only synthetic data: both a fresh login and
  an existing session opened Poptávky, focused its heading approximately 32 pixels
  below the viewport top and produced no horizontal overflow.
- Four navigation regression tests cover delayed rendering, repeat links, history,
  restored pages, manual cancellation, invalid fragments and asynchronous ordering.

No physical Telegram/iPhone acceptance is claimed. The browser verification used
the actual dashboard assets with a local synthetic API, not genuine visitor or
inquiry records. No real inquiry or Telegram notification was generated.

## Production acceptance

Accepted at **21:08:20 Europe/Prague**, 10 October 2026.

- Release: `inquiry-link-20261010`.
- Dashboard image: `sha256:7e1f228dcf01ac278aca850fdbce4a436aa23e451577e203e6c7271835abf5bd`.
- Previous image: `sha256:5ac55c8c11946daef31460ffe4bcaa800c4abec52914c3d614ddfe26874bae06`.
- Published asset: `/prehled/dashboard.js?v=c5ebd35c21eca1d26d34`.
- Both versioned and unversioned public JavaScript matched the tested candidate.
- The service worker references the new asset identity.
- Health, blog health, both home/blog locales and representative product/guide
  pages returned 200. The anonymous summary/inquiry/partnership APIs returned 401;
  the internal contact route remained 404. The dashboard shell remains no-store.
- Existing session volume, runtime environment, mounts, networks, process identity,
  security settings and resource limits were verified before replacement.
- Nine related containers retained their IDs, images and start times, including
  web, blog, worker, collector, monitor, database, Umami and contact relay.

Only the dashboard was replaced using the complete existing Compose configuration
and a private release image override. Rollback source and the prior immutable
image override are retained in the protected server release directory. Future
deployments must inspect the current container's configuration-file labels rather
than use the base Compose file alone. Authentication duration, privacy notices and
measurement scopes were not changed.
