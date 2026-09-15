# Start here (independent build)

Open **this folder** (`F:\Sites\LAWP`) as the workspace. These files are the only product source of truth. There is no parent repo.

## You are building

A Windows Electron + React app named **LAWP** (Learn Anything While Playing). It is a **generalized LMS**: subjects are **JSON cartridges** (one folder per subject-matter, one folder per lesson, install/export as `.zip`). Coding is one family of packs. v1 ships three demonstration runtimes and curricula: **Python**, **JavaScript**, **React**. Local learners share cartridges; each has a private progress folder.

Pedagogy and UX are inspired by Codefinity’s *good* loop (short chapter → try → instant feedback → next), then deliberately better: mastery, transfer, skip-what-you-know, no subscription wall, local-first, play that teaches.

## Non-negotiables (do these in the first scaffold)

1. **Architecture:** Electron **main** owns disk, processes, settings, cartridges, learners, runners. Renderer is React + Zustand. **No Node in the renderer.** Typed preload + Zod. IPC `Result` envelope `{ ok: true, value } | { ok: false, error }`.
2. **Window restore:** size, position, and **maximized vs restored** persist in `%APPDATA%\LAWP\window-state.json`. Launch always returns the user to where they left the window (clamped to visible displays). Ignore bogus minimized bounds.
3. **Shared profile:** `npm run dev` and `npm run dist` (installed / `release/` unpackaged) use the **same** `%APPDATA%\LAWP`. Pin `app.setPath('userData', …)` **before** any store or window. Optional `LAWP_USER_DATA` (absolute path) and `LAWP_ISOLATED_USER_DATA=1` (repo `.dev-user-data/`) for rare isolation — default is shared AppData.
4. **Icon:** Use `build/icon.png` (and generated `.ico`) for the BrowserWindow, taskbar, and electron-builder. Never ship the default Electron atom.
5. **tsconfig:** Keep `tsconfig.json` + `tsconfig.node.json` + `tsconfig.web.json` as **self-contained** configs (no `@electron-toolkit/tsconfig` extends). See [BUILD.md](BUILD.md). Stubs in this repo exist so those files stay valid in the IDE **before** `npm install`.

## Suggested first implementation slice

Follow [plans/IMPLEMENTATION.md](plans/IMPLEMENTATION.md) Phase 0 → 1:

- `package.json`, electron-vite, electron-builder, React, Zustand, Zod
- Main: `configureUserData()`, window state, single instance
- Empty shell UI + Settings stub that round-trips `settingsSchema`
- Load the Python “Hello, run” lesson as proof of the **folder-per-lesson JSON** cartridge + runner pipeline
- Library: install/export `.zip`; progress only under `userData/learners/` (keep every run; restart ≠ erase history)

Then Phase 2–5: studio layout, graders, JS/React runtimes, play layer, three demo tracks — still JSON cartridges, progress only in the learner folder.

## Do not

- Depend on MyFileExplorer or any other app
- Put learner progress in a pack or lesson folder (it belongs under `learners/<id>/`)
- Author lessons as a pile of Markdown files with no `lesson.json`
- Call Electron’s default `userData` (`Electron` while unpackaged) — that splits settings between dev and install
- Paywall lessons or fake “Pro” gates
- Grade only by exact stdout match when a property-based or AST check would prove understanding
