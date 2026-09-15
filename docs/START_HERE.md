# Start here (independent build)

Open **this folder** (`F:\Sites\LAWP`) as the workspace. These files are the only product source of truth. There is no parent repo.

## You are building

A Windows Electron + React app named **LAWP** (Learn Anything While Playing). It is a **generalized LMS**: subjects are **JSON cartridges** (small closed vocabulary — human- or AI-generable). The **subject is playable** (`world-v1` activities: predict → act → see → explain). Coding is one family of packs. **First learning milestone:** a ~20 minute **circuits** cartridge (no code runtime), then Python, JavaScript, React. Local learners share cartridges; each has a private progress folder. An in-app **Author** workbench exports the same zips.

Pedagogy and UX are inspired by Codefinity’s *good* loop (short chapter → try → instant feedback → next), then deliberately better: mastery, transfer, skip-what-you-know, no subscription wall, local-first, play that teaches.

## Non-negotiables (do these in the first scaffold)

1. **Architecture:** Electron **main** owns disk, processes, settings, cartridges, learners, `world-v1`, runners. Renderer is React + Zustand. **No Node in the renderer.** Typed preload + Zod. IPC `Result` envelope `{ ok: true, value } | { ok: false, error }`.
2. **Window restore:** size, position, and **maximized vs restored** persist in `%APPDATA%\LAWP\window-state.json`. Launch always returns the user to where they left the window (clamped to visible displays). Ignore bogus minimized bounds.
3. **Shared profile:** `npm run dev` and `npm run dist` (installed / `release/` unpackaged) use the **same** `%APPDATA%\LAWP`. Pin `app.setPath('userData', …)` **before** any store or window. Optional `LAWP_USER_DATA` (absolute path) and `LAWP_ISOLATED_USER_DATA=1` (repo `.dev-user-data/`) for rare isolation — default is shared AppData. The installer must **not** reset settings or user cartridges. Library is loaded at runtime, not frozen into the build.
4. **Icon:** Use `build/icon.png` (and generated `.ico`) for the BrowserWindow, taskbar, and electron-builder. Never ship the default Electron atom.
5. **tsconfig:** Keep `tsconfig.json` + `tsconfig.node.json` + `tsconfig.web.json` as **self-contained** configs (no `@electron-toolkit/tsconfig` extends). See [BUILD.md](BUILD.md). Stubs in this repo exist so those files stay valid in the IDE **before** `npm install`.

## Suggested first implementation slice

Follow [plans/IMPLEMENTATION.md](plans/IMPLEMENTATION.md) Phase 0 → 2:

- Scaffold + shared AppData (`dev` ≡ installed) + runtime Library + settings/setup export
- **`world-v1` + circuits 20-minute session** (experiment, Why/misconception, transfer, kept creation)
- Author: template → preview → validate → export the same lesson zip

Then code engines (Python → JS grid → React creation), still the same cartridge schema and Why/progress shells.

## Do not

- Depend on MyFileExplorer or any other app
- Put learner progress in a pack or lesson folder (it belongs under `learners/<id>/`)
- Author lessons as a pile of Markdown files with no `lesson.json`, or embed JS/Python in JSON to “simulate” a world
- Treat `NO_PROXY` / stubbed `fetch` as isolation for imported executable packs
- Call Electron’s default `userData` (`Electron` while unpackaged) — that splits settings between dev and install
- Copy bundled packs into AppData on every launch or on `npm run dist` (that overwrites user cartridges)
- Bake a fixed lesson id list into the renderer at build time
- Paywall lessons or fake “Pro” gates
- Grade only by exact stdout match when a property-based or AST check would prove understanding
