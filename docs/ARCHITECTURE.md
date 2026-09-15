# Architecture

Standalone **Electron + React** desktop app. Clear process boundaries; **no Node APIs in the renderer**.

This document is self-contained. There is no parent repository.

## Process model

```
Renderer (React + Zustand)
        │  typed preload (contextIsolation + sandbox + no nodeIntegration)
Main (settings, session, packs, progress, runners, window state)
        │
   Electron userData (learners + imported packs)  +  bundled resources/packs
        │
   world-v1 (in-process, data only)  +  Child processes only if pack is trusted to execute
```

| Concern | Owner |
| --- | --- |
| Navigation, editor buffers, UI chrome | Renderer Zustand |
| Pack / lesson load, zip install/export, validate, trust | Main `packs` |
| `world-v1` activity step | Main `activities` (no spawn) |
| Grade / run code | Main `runners` (trusted packs only) |
| Progress, evidence, snapshots, reset | Main `progress` |
| Author templates / validate / AI draft | Main `author` |
| Local learner profiles | Main `learners` |
| Settings / theme | Main `settings` |
| Window bounds | Main `windowState` |
| Session (last lesson, splits, buffers) | Main `session` |

## Repository layout

```
src/
├─ main/
│  ├─ index.ts              entry; configureUserData first
│  ├─ userData.ts
│  ├─ windowState.ts
│  ├─ ipc/                  register handlers
│  ├─ settings/
│  ├─ session/
│  ├─ packs/                zip install/export + folder-per-lesson loader
│  ├─ activities/           world-v1 interpreter
│  ├─ author/               templates, validate, optional draft
│  ├─ learners/
│  ├─ progress/             log + evidence + snapshots under learners/<id>/
│  ├─ runners/              code spawn (Python / Node) + trust
│  ├─ security/             path + spawn guards
│  └─ logging/
├─ preload/                 window.lawp
├─ renderer/
│  ├─ components/
│  ├─ screens/              Home, Library, Studio, Practice, Author, Settings
│  ├─ store/
│  └─ styles/
├─ shared/
│  ├─ schemas/              zod (settings, packs, ipc)
│  └─ ipc/                  channel names + types
└─ tests/
resources/packs/            demo curricula
build/                      icon.png, icon.ico
docs/
```

electron-vite splits **main / preload / renderer**. Renderer root: `src/renderer/`.

## Error model

IPC returns:

```ts
type Ok<T> = { ok: true, value: T }
type Err = { ok: false, error: { code: string, message: string, remediation?: string } }
type Result<T> = Ok<T> | Err
```

Codes: `validation`, `not-found`, `timeout`, `runtime-missing`, `sandbox`, `cancelled`, `io`, `pack-invalid`, `zip-invalid`, `zip-unsafe`, `cartridge-conflict`, `not-configured`.

## User data (dev ≡ installed)

**Decision:** both `npm run dev` (unpackaged) and `npm run dist` / installed builds use:

`%APPDATA%\LAWP`

Main pins the path before anything else touches disk:

1. First lines of main: `configureUserData()`
2. `app.getPath('appData')` + folder name `LAWP` (not `Electron`, not `lawp` lowercase unless you set it once and never change)
3. `app.setPath('userData', resolved)` **before** `app.ready` stores, `singleInstanceLock`, or `BrowserWindow`
4. Env:
   - `LAWP_USER_DATA` = absolute override
   - `LAWP_ISOLATED_USER_DATA=1` → `<repo>/.dev-user-data/` (opt-in only)
5. `electron-builder` `productName`: `LAWP`. Still **pin** the path so unpackaged Electron cannot silently use `%APPDATA%\Electron`.

Files under userData (v1):

| File / dir | Role |
| --- | --- |
| `settings.json` | prefs (zod), including `currentLearnerId` |
| `window-state.json` | bounds + maximized |
| `session.json` | last route, splits, open lesson, library scroll per pack (not learner progress) |
| `packs/` | **imported cartridges only** (same folder shape as `resources/packs`) |
| `learners/<learnerId>/` | `profile.json` + `progress/` (evidence + attempts), `snapshots/`, `notes/`, `drafts/`, `workspaces/`, `creations/` |
| `sandboxes/` | ephemeral runner cwd |
| `logs/` | runner logs (no pack secrets beyond learner code) |

Cartridges are shared across local learners. Progress is never stored next to `pack.json` or `lesson.json`. Project working copies belong under that learner’s `workspaces/`, not `userData/workspaces/` at the root (legacy path: do not use).

**Runtime library (not a build-time catalog):** on each launch, main **resolves** each `packId` (overlay merge vs full user pack — [CONTENT_MODEL.md](CONTENT_MODEL.md) D37). There is no blanket “user pack wins.” Launch, `npm run dist`, and the installer never copy bundled trees into `userData/packs` and never rewrite `settings.json` if it already exists (create defaults only when the file is missing).

**Dev ≡ installed:** `npm run dev` and the installed exe resolve the same `%APPDATA%\LAWP`. About must show that path. Do not use Electron’s default unpackaged `userData` (`%APPDATA%\Electron`).

## Window state

Persist `{ x, y, width, height, isMaximized }`.

- Save on `resize` / `move` / `maximize` / `unmaximize` / `close` (flush)
- If **minimized**, do not save (Win32 reports garbage like `-32000`)
- When maximized, persist `getNormalBounds()` plus `isMaximized: true` so restore can `show` then `maximize`
- If saved `x,y` not on any display workArea (tolerance ~50px), discard position and keep size
- Minimum size ~960×640
- Default first launch: 1280×800, centered, not maximized

## Session vs settings

- **Settings:** theme, font, runtime paths, play HUD on/off, strict campaign, `currentLearnerId`, `trustedExecutions[]` (**fingerprint + packId**, not bare ids) — exportable **except** trust grants (D39: import does not grant spawn)
- **Session:** where you were in the studio — not part of settings export
- **Window geometry:** `window-state.json` only; strip from settings export
- **Learner progress:** `learners/<id>/` only; settings/setup export must not embed it
- **Setup bundle (optional):** settings + **resolved** pack zips (same exporter as Library export) — see D38

## Activities vs runners

- `world-v1`: apply actions + rules in main; never `eval` pack strings; never spawn
- Code runners: only if the pack is bundled or **trusted**; see [SECURITY.md](SECURITY.md)
- Bind `runId` + `learnerId` at start; write results only there
- Spawn with `shell: false`, absolute interpreter, `cwd` = temp sandbox dir unique per `runId`
- Copy only declared files from **that lesson folder** into cwd
- Kill on timeout / cancel
- Capture stdout/stderr (cap bytes)
- Never `eval` learner code in the renderer or in main’s own context

## Concurrency

- One active **run** per window (queue or cancel previous)
- Pack validation on a worker/utility thread if it ever blocks UI (v1 sync on load is OK under ~20ms)

## Single instance

Second launch focuses the first window. Optional CLI `--lesson packId/lessonId` forwarded via `second-instance`.
