# MILLORA — public iOS release and pending Apple TV review

Prepared on 11 October 2026 for the owner's instruction in the MILLORA thread
to complete the presentation in coordination with the VCode owner. The direct
human instruction and Apple's approval notice were read in source thread
`01a10163-c8da-7240-acb4-d7a4aabe2ff9` before acting.

## Verified status and public detail

The MILLORA team recorded App Store Connect readback at **13:01:39 Prague**:
iOS/iPadOS 1.0 (11) Ready for Distribution with automatic release;
tvOS 1.0 (2) Waiting for Review. App ID: **6821033229**.
The human supplied Apple's iOS approval notice directly in the source thread.
The application used automatic release; no manual release click is claimed.

Root independently opened the public Czech product detail in the in-app browser
at **13:09:53 Prague**:
`https://apps.apple.com/cz/app/vcode-millora-morris/id6821033229`.
The visible page initially displayed **An error occurred.** The saved screenshot is
`millora-app-store-detail-check-20261011.png` in this chat's visualisation folder.

The MILLORA team independently confirmed the complete public product detail at
**13:26 Prague**, including the correct application ID, screenshots, free price,
iPhone/iPad and VCode developer website. Root then opened the actual Czech
detail at `https://apps.apple.com/cz/app/millora/id6821033229?l=cs` and confirmed
the visible **MILLORA**, **Mlýn v novém světle**, **Zdarma** and **iPhone, iPad**.
The screenshot was saved at **13:31:07 Prague** as
`millora-app-store-live-20261011.png`. The earlier error is historical.
Public product availability is verified; a physical device download was not
performed. Apple TV and Custom Product Pages still await review.

## Public copy and release scope

The catalogue and both shared showcase locales state that iPhone and iPad are
available in the App Store and Apple TV awaits review. The Apple TV
gallery caption repeats that limitation. The game introduction describes its
features without the stale claim that the entire application awaits review.

The verified public App Store URL is
`https://apps.apple.com/cz/app/vcode-millora-morris/id6821033229`.
The existing official Czech and English badge components use this application
ID; store platform and structured-data metadata specify only iOS, iPhone and
iPad. No Apple TV download or Custom Product Page link is activated. The complete
gallery, rules and support remain. The owner separately approved the exact CZ/EN Apple TV
privacy refinement directly in this thread; it is recorded in
`app-store-connect/millora-tvos-privacy-review.md` and uses the existing shared
MILLORA privacy component with an effective date of 11 October. Game Center,
operator, contact and support retention remain unchanged. Other products, private
services, notification settings and public analytics scope are unchanged.

The existing development flag is retained because removing it would also
generate an empty basic-guide route. Explicit verified store metadata controls
the public iPhone/iPad availability independently; tvOS remains upcoming.

Mandatory local checks, both Docker builds, boundary checks and scoped production
acceptance passed on **11 October 2026 at 13:54:04 Prague**. The accepted source
commit is `f35501ef17490385cb4522fc22ee6cdc67efcd76`. Publication and validation
are recorded in [the release record](millora-status-release-2026-10-11.md).
Acceptance did not read genuine visitor or inquiry records and made no real
form submissions or notification deliveries.

## Static artifact readability

Earlier attempts returned HTTP 403 for unchanged Event images and safely restored
the previously accepted web. Exact remote readback established the cause: an
Event asset was mode 0600 in the installed source, copied candidate and newly
built image, while the same asset in the previous image was mode 0644. Bytes and
hashes were unchanged. Restrictive source installation and mode-preserving file
copies carried those permissions into the subsequent public artifact.

The final Docker runtime stage normalizes only the built public HTML tree:
directories 0755 and files 0644. Before synthetic fixtures replace the static
tree, the existing Nginx boundary check now exhaustively verifies the actual
artifact as the unprivileged nginx user in an isolated container without network
access. Its root filesystem is read-only and temporary output is bounded.
The new gate rejected the earlier faulty image and accepted the previous working
image. The final corrected image must pass this gate and public byte checks.
Protected release evidence, keys, registries, private records and running service
settings are outside this permission normalization. Public check pacing and
response reuse remain to avoid unnecessary requests; the diagnosed cause is
artifact permissions, and no external protection rule was established.
