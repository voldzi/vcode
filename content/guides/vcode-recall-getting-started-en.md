---
title: "VCode Recall: installation and your first project"
summary: "Install on your Mac, create a first index, connect Codex or Claude Code, update safely and remove the app."
application_id: vcode-recall
external_ref: DOC-VCODE-RECALL-GETTING-STARTED-EN
translation_key: vcode-recall-getting-started
language: en
classification: public
status: published
document_type: manual
documentation_profile: akb-application-docs-1
document_revision: "1.0"
reviewed_on: 2026-10-08
slug: vcode-recall-first-time-setup
order: 10
---

## Status of this guide

This guide applies to VCode Recall **0.6.0, build 202610081600**. Find installers, verified checksums, licences and corresponding sources on the [product page](/en/apps/vcode-recall/). Do not substitute an older ChromaStatusBar package or a development build.

The native build targets **Apple Silicon Macs running macOS 26 or later**. Download sizes and requirements on the product page match the final manifest. Intel, Windows and App Store availability have not been announced.

The installer is free of charge. The application's own source code is not published; bundled open source components retain their own licences. Settings includes **Licenses and components**; the licence inventory and corresponding sources can also be downloaded from the product page.

This release was verified through an update in an existing account with data and settings preserved, local startup without downloading dependencies or a model, automatic startup, MCP and retrieval. Czech and English localization resources were checked. Clean installation and first quarantined launch in a new account, actual rollback to an earlier version and uninstallation were not run for this release. The instructions below do not claim these installation scenarios passed testing.

## What you need

- A Mac meeting the published version's requirements, with enough storage for the application and your selected projects' indexes.
- A folder containing documentation or source files that your AI client is authorised to use.
- Codex or Claude Code with support for a local MCP connection, if you want to use retrieval in those clients.

The standalone native installation contains the local database, runtime libraries, MCP service and a multilingual embedding model for retrieval. The model is already part of the application. **You do not need to install Docker, system Python, Homebrew or Ollama.** Ollama is only used for optional supplementary diagnostics and is not part of normal first-time setup.

## 1. Install the app

1. On the product page, choose an approved Apple Silicon version. Check that you are downloading from the VCode HTTPS link. Its size and SHA-256 will be listed alongside the package.
2. For a **DMG**, open the disk image and drag **VCode Recall.app** to **Applications**, then eject the image. For a published **ZIP** option, extract the archive and move the app to **Applications**.
3. Open the app from Applications. Confirm the normal macOS notice about an app downloaded from the internet. If macOS reports a damaged package or an unverified developer, stop and contact support; do not bypass system protection.
4. VCode Recall lives in the menu bar at the top of the screen. It normally has no persistent Dock icon. Open the dashboard or **Settings** from its menu.

Installing the app does not index projects. Preparing its local runtime does not require an administrator account.

## 2. Follow the setup assistant

The assistant opens on first installation. If you close it, open it again from Settings using **Setup assistant**.

1. On a new Mac, choose **Prepare a new native environment…** and read the summary of changes.
2. Confirm preparation. The app verifies the bundled files and prepares its runtime in your user library. Wait for the result; preparation and activation are separate steps.
3. Choose **Activate the prepared environment…** and confirm the summary. The app starts and verifies its own local service.
4. When finished, continue to monitoring. A running service does not yet mean retrieval is ready: first add and index a project.

## 3. Choose what starts at login

There are two separate options:

- **Settings → Launch at Login** opens the application when you log in to macOS.
- **Enable monitoring after login…** in the assistant configures automatic supervision of the local service. It requires its own confirmation and can later be disabled using **Uninstall Autostart**.

Enabling one option does not establish that both are enabled. After your next login, check the menu-bar icon and service status in the dashboard. Closing a window or quitting the app may leave the service running.

## 4. Add your first project

1. In Settings, open **Repositories to index** and choose **Add repository folders**.
2. Select a specific project folder. For your first attempt, use a small project with familiar documentation. Do not select your whole home directory, backups or folders you are not authorised to make available to clients.
3. Open **Repositories** in the dashboard, select the project and choose **Reindex**. Confirm the scope and follow operation progress.
4. Wait for completion. Initial indexing can take longer depending on the number of files and your Mac's performance; indexes also require disk space.
5. Check project status and run a retrieval check on a familiar topic. Verify that the result refers to the expected file and its current content.

Use incremental reindexing for new or changed files. **Refresh** updates the displayed status; it does not replace indexing of changed sources. Removing a folder from the indexing configuration does not delete its source files and does not promise physical removal of previously created index data.

## 5. Connect Codex or Claude Code

MCP lets a client ask Recall to retrieve context. Configure it only for a trusted client running under the same user account on your Mac.

1. In VCode Recall Settings, find **Connect Codex or Claude Code**.
2. Choose **Copy MCP configuration**. Copy values from your actual installed app, rather than a path from an example or an older project.
3. In your client's MCP configuration, add a local **STDIO** server using these values. The command refers to the installed app's bundled program and its only argument is `mcp-bridge`. Use the configuration format required by that client; JSON and TOML are not interchangeable.
4. Do not add private credentials, a service network address, a project path or environment overrides to the client configuration. The bundled program discovers the required local settings itself.
5. Reopen the client or refresh its MCP connection. An existing session may not reload configuration automatically.
6. In your first request, select the project and ask to find a familiar topic. Check the retrieved file and its context. A connected server without an indexed project is not verified retrieval.

Indexing and retrieval happen locally. Content passed to Codex or Claude Code is then governed by that client's settings and its AI provider's terms; it may be sent to that provider. Add only projects for which this use is permitted. Recall does not replace your client's data protection settings.

## 6. Choose the interface language

VCode Recall supports English and Czech and follows macOS's language preferences. To select a language just for the app, open **System Settings → General → Language & Region → Applications**, add VCode Recall and choose a language.

Quit and reopen the app when no indexing or runtime preparation is running. Dates and numbers follow the macOS region. Project names, paths and original diagnostic logs are not translated. If the preferred-language list contains no supported language, the app uses English.

## 7. Update safely

1. In Settings, open **Installation and updates → Check for updates**. This is a manual check; it does not automatically download or install anything.
2. Download the approved new package and keep the complete previous verified package for rollback.
3. Wait for indexing to finish. In the still-installed application, choose **Prepare safe replacement** and confirm **Pause own service**. Simply quitting the app is insufficient: its helper may still be running.
4. Verify that preparation succeeded and quit the app. Only then manually replace it in Applications.
5. Open the new app, prepare its bundled runtime in the assistant and activate it separately. Updating the runtime is separate from copying the application.
6. Verify actual retrieval and then re-enable supervision at login if you use it. Refresh client connections if the helper's path changed.

An ordinary native update preserves the data store, project registry and embedding profile. A model change or Docker migration is a separate confirmed migration requiring new indexing, rather than an automatic effect of updating. If replacement has only been prepared and you have not replaced the app, **Restore operation** cancels the pause. After actual replacement, restoring supervision alone does not restore the previous application package; contact support if recovery fails.

## 8. Remove the app

1. Wait for operations to finish, or use their cancellation controls and wait for confirmed termination.
2. Remove Recall's MCP connection from your clients and refresh their sessions.
3. Disable **Launch at Login** in Settings. Use **Prepare safe replacement → Pause own service** and verify that its automatic supervision is disabled and its own service is stopped.
4. Quit the app, then move **VCode Recall.app** from Applications to the Trash.

Removing the application does not delete source projects. Separate settings, indexes and local history may remain in your user library; for compatibility they use the **ChromaStatusBar** directory under **Library/Application Support**. To remove this data too, first verify that the service has stopped and that you have a backup, then agree on the specific scope with support. This guide does not establish an in-app button that deletes all data. Do not delete the whole Library directory or your project folders.

## If you already use ChromaStatusBar or Docker

This first-time installation guide does not replace a controlled migration of an existing environment. **Do not rename a running ChromaStatusBar.app in Finder**, or switch profiles arbitrarily. Changing the bundle's name can change the absolute path used by services and MCP clients.

A Docker migration prepares a separate native data store, does not convert existing vectors and requires fresh indexing and client verification. Preparation does not delete existing Docker data. Confirm a procedure for your actual installation with support before making this change.

## Troubleshooting

- **Service is not running:** open the assistant, check status and review the activation result. Do not expose the service over a network.
- **Project is unindexed or stale:** check the selected folder and run incremental reindexing for that project.
- **Client cannot see the server:** copy current configuration from the installed app, check STDIO support and refresh the client's MCP connection.
- **Retrieval returns old content:** check that indexing completed for the specific project and compare results with the source file.
- **Low storage or an interrupted operation:** check the dashboard and the confirmed operation result. Do not start with a destructive rebuild when the state is unclear.

Support: [podpora@zeleznalady.cz](mailto:podpora@zeleznalady.cz). Include the app version, build, macOS version and a short description of the step. Do not automatically send private source code, index contents or complete diagnostic logs; first agree on the minimum information needed.
