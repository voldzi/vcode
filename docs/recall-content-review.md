# VCode Recall — content and publication review

Date: 2026-10-08. Scope: source review of the bilingual product draft, beginner guide and draft publication boundaries. This review does not certify a release artifact, signing, notarization, installation, runtime quality or actual client reconnection.

## Source-backed content

The review used only public product documentation and relevant public localization keys in the Recall source repository. It did not inspect a user's project contents, private index, credentials, installed settings, live service or client configuration.

| Claim or instruction | Public source | Treatment in VCode |
| --- | --- | --- |
| Product name VCode Recall; compatible technical names remain ChromaStatusBar | `apps/ChromaStatusBar/README.md`, `distribution/RELEASE.md` | Display name is VCode Recall. Existing installations must not be renamed in Finder. |
| Standalone native distribution targets Apple Silicon and macOS 26+ | `distribution/NATIVE.md`; application maintainer confirmation on 2026-10-08 | The current build target is confirmed; the exact public package must still be checked against its final manifest. No Intel, Windows or App Store promise. |
| Runtime, database, MCP and offline embedding model are bundled | `distribution/NATIVE.md`, `distribution/runtime-readme.md` | No end-user Docker, Python, Homebrew or Ollama installation in the normal native flow. Optional Ollama diagnostics are separate. |
| Preparation, activation and indexing are separate actions | `distribution/NATIVE.md`, public `setup.strings` | Beginner guide describes each step and does not equate a running service with verified retrieval. |
| App launch and service supervision at login are independent | `README.md`, public `ui.strings`, `setup.strings`, `monitor.strings` | Both controls are explained separately. Enabling one is not presented as enabling both. |
| Select folders and use incremental indexing | `README.md`, public `setup.repositories.*`, `monitor.action.reindex*` | First-project steps use an explicitly selected folder, completion check and known-file retrieval check. Refreshing status is distinguished from reindexing. |
| MCP uses the installed frozen STDIO helper with only `mcp-bridge` | `distribution/NATIVE.md`, `distribution/runtime-readme.md`, public `setup.runtime.*` | User copies actual installed configuration; no fabricated helper path, network address, private credential or project path is supplied. JSON/TOML formats are not treated as interchangeable. |
| Interface language follows macOS's app preferences | `README.md`, public `ui.language.caption` | Exact system route, safe restart, Czech/English and independent regional formatting are described. |
| Updates are manual; own service must be paused before bundle replacement | `distribution/NATIVE.md`, public `setup.distribution.*` | Guide preserves the prior whole package, separates new runtime activation and distinguishes supervision recovery from binary rollback. |
| Quitting the GUI alone may leave the service running | `distribution/NATIVE.md` | Removal and update instructions first pause the owned service. |
| Separate settings and indexes remain outside the app | `README.md`, `distribution/runtime-readme.md` | Removing the bundle is not described as deleting all data. No unverified “erase everything” UI or destructive command is invented. |
| Native indexing/retrieval are local; clients receive project context | `distribution/runtime-readme.md` | Guide and product copy explain that an attached AI client's handling of that context follows its own settings/provider terms. No universal “nothing can leave this Mac” claim. |

CZ and EN guides intentionally cover the same actions. Their status remains `draft`; neither has been approved as a final installed-user procedure.

## Publication boundaries reviewed

- Canonical product data includes `publication: "draft"` for `vcode-recall`.
- Public homepages, app routes, related-product groups, help listings and App Store metadata use `getPublicProducts()`.
- Public guide discovery and routes require `classification: public`, `status: published` and a public product. Publishing a guide alone cannot expose a draft product's guide.
- Local Recall preview routes under `/preview-local/recall/` return static paths only in development. They are marked `noindex`, omit analytics and omit structured discovery data.
- Sitemap excludes `/preview-local/`. Production Nginx denies that prefix independently of generated files.
- The production output validator rejects private preview paths and unpublished Recall text in HTML/XML/TXT, and removes the draft visual assets and download client script from distributable output.
- Product download links and final version/build/hash values are absent from the current draft. Product visuals explicitly use fictional data and do not claim measured performance or operational readiness.

These are source-level findings. Root validation must separately confirm a production build with no Recall routes/assets and verify the localhost-only preview's rendering in both languages.

## Before public release

1. Receive the specific final manifest, artifact and explicit **READY-TO-PUBLISH**. Confirm requirements, version, build, exact public filenames, size and SHA-256 against that manifest.
2. Independently accept the exact installer signature, publisher Team, successful notarization and staple, and fresh-install/update/migration attempts. Historical source test counts are not evidence for this artifact.
3. Verify the actual beginner flow in the final installed app, including its displayed labels, independently configured app/service login startup and retrieval on an indexed project.
4. Verify both supported client connections against the installed frozen helper. Finish provider-specific placement instructions only from the actual copied configuration and current client support. Do not ship a guessed executable path or assume JSON and TOML share syntax.
5. Confirm removal and any promised permanent-data removal scope. The draft currently documents bundle removal with retained user data; it does not certify complete data erasure.
6. Have the product owner review the concrete CZ/EN privacy and download-metrics notice. Explain client handling separately from local indexing, and server transfer counters separately from client analytics or installation counts.
7. Remove the private-draft preamble only after release acceptance. Confirm both translations and their publication states together; provide working published product, guide, support and privacy links.
8. Activate only the accepted immutable download manifest and version/latest pointers, with rollback and monitoring. Keep source, build directories, signatures' private keys, settings and index data outside serving roots.

No final release requirements, build, package size, signature outcome, notarization outcome or install count can be inferred from this content review.

## Maintainer-confirmed distribution policy

The directly authorised handoff on 2026-10-08 confirms a free installer, closed application source, and separately supplied open source notices/required corresponding sources. The bilingual drafts now explain this distinction. They do not assert that the license inventory is complete and do not link to a nonexistent license artifact. The final public archive naming is `VCodeRecall-<version>-<build>-macos-arm64`; historical ChromaStatusBar artifact names are not a substitute for the forthcoming manifest.

## Independent distribution review

The additional review read the prepared download service, publisher, static build gate, proxy configuration, client click collector and aggregate metrics contract. It did not read or execute a real installer, inspect private indexes, contact an installed service, use an Apple account or generate a real publication attestation.

- Public metadata uses the same immutable `VCodeRecall-<version>-<build>-macos-arm64` filenames as the publisher. ZIP/DMG installers, original manifest, license information and required source archives are separate allowlisted resources.
- Activation requires the exact manifest and artifact hashes, a separately trusted signed acceptance receipt, literal READY-TO-PUBLISH and privacy approval, plus an explicit operator acknowledgement. This is a prepared contract; it does not establish that the final application manifest already has that shape.
- A published static build must match public metadata to the original manifest bytes and signed acceptance through private BuildKit inputs. Private proof/key inputs are not copied into the static output. Docker context exclusions cover `.secrets`, distribution state, key material and private proof exports.
- Catalog updates, minute availability probes and independent six-hour hash reconciliation remove invalid public resources. Each opened artifact is checked again. Private loopback health reports unavailable when integrity or aggregate persistence fails; no public health or aggregate route is exposed by the download listener.
- Versioned responses have SHA-256 ETags and immutable cache policy; latest metadata revalidates. Error responses are `no-store`, invalid ranges return 416, and 304 does not invent a Content-Length value.
- Both checked-in proxy tiers disable individual access and error logging only on distribution and download-intent locations. They strip request headers and forward only the required representation or intent headers. The default proxy switch remains disabled.
- Click intent sends the product constant only, with omitted credentials and referrer, and respects DNT/GPC, offline state and public route/query/hash limits. Daily service counters contain merged numeric buckets rather than raw requests or visitor identifiers. The coalescing writer has one active write and a dirty flag rather than a queue per request.
- Counters mean responses and bytes written from the service toward its proxy. They do not prove delivery to a browser, unique people, installation or application use. License/source/metadata responses do not contribute to installer full-response totals.

An independent execution of the then-current 18 synthetic hosting tests passed 18/18. Later test additions and the final full project/Docker validation belong to the root release report; this review does not infer that they passed from reading their source. The identified context-exclusion and inherited-error-log issues were corrected in source. No unresolved blocking source finding remains in this preparation scope.

The actual accepted package, complete licensing, installed beginner/client flows and product-owner approval and publication of the concrete CZ/EN privacy notice remain separate release gates. Neither a synthetic test nor a successful VCode build fulfils those gates.
