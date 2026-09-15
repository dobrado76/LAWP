# Implementation plan

Work **only** in this repo. Phase 0 is already partially present (docs + tsconfig stubs + icon).

Content rules that apply from Phase 1 onward (see [CONTENT_MODEL.md](../CONTENT_MODEL.md), D25–D29):

- Learning materials are **JSON cartridges** (pack + per-lesson folders). No progress inside a pack.
- Library can **install a `.zip`** (subject or lesson) and **export a `.zip`**.
- Progress lives under `userData/learners/<learnerId>/`. Every run/check is **appended** (compare this vs last vs best). Restart/redo keeps history; overwrite and clear-history are explicit (D28–D29).

## Phase 0 — Bootstrap (first coding session)

- `package.json`: name `lawp`, productName `LAWP`, private
- electron-vite, electron, electron-builder, react, react-dom, zustand, zod
- Monaco or CodeMirror
- `electron-builder.yml` → `release/`
- Implement `configureUserData`, `windowState`, empty `BrowserWindow` loading renderer
- Custom icon on the window
- Settings schema + get/update
- About line with `userDataPath`
- Confirm: run `npm run dev`, move/maximize, quit, relaunch → same window; then `npm run dist`, run the built exe → **same** `%APPDATA%\LAWP`

**Exit:** two launch modes, one profile, icon not Electron’s.

## Phase 1 — Shell + cartridge Library

- Routes: Home, Library, Studio (placeholder), Settings
- Create **default local learner** on first launch (`userData/learners/<id>/profile.json`)
- Load `resources/packs` + `userData/packs` with the folder-per-lesson layout; Zod-validate `pack.json` / `lesson.json`
- Library: pack cards → courses → chapters → lessons
- **Install from ZIP** (file picker): subject zip *or* standalone lesson zip → validate → copy into `userData/packs`
- **Export ZIP** on a pack and on a lesson (save dialog; cartridge files only)
- Invalid zip / zip-slip → error card, existing library intact
- Session: last pack/lesson id + current `learnerId`

**Exit:** install a sample lesson zip, see it in Library, export it back out, click a lesson title into Studio (static JSON `explain` md). Bundled demo pack uses the same folder shape.

## Phase 2 — Python engine + Course 1 + progress isolation

- `run:code` / `grade:block`
- Sandbox cwd, timeout; lesson files resolved from **that lesson’s folder**
- First lessons of Python Course 1 including one play or code check
- Hint ladder IPC
- Persist **rollup + attempt log** as JSON under `learners/<id>/progress/<packId>/` (never beside `lesson.json`)
- Append every Run and Check; expose current / previous / best
- **Restart exercise** and **Restart lesson** (default: keep history, restore starter)
- Optional **replace last** on the next check; **clear history** behind a second confirm

**Exit:** fail, hint, pass, relaunch — attempts are still there (dev and dist). Restart lesson → starter + retrying, previous scores still listed. A second check shows “this vs last”. A second local learner sees the same pack with an empty log. Clear history wipes only that learner’s log.

## Phase 3 — Studio UX

- Splitters persisted
- Editor buffers in the **learner** session/drafts tree
- Why panel
- Reset starter = restart exercise (`history: keep`)
- **Restart chapter** (module) from the TOC
- After Check: compact **this / last / best** line
- Progress screen: attempt timeline + delete-last / clear-history
- Practice queue v0 (failed skills for **this** learner)

**Exit:** a full Python Course 1 playable end-to-end. Restart chapter, redo a lesson, see whether the new check beat the previous one.

## Phase 4 — JavaScript + grid-js play

- Node harness for JS checks
- `play` block engine (fox/beacons); sprites in the lesson `assets/`
- JS Course 1

**Exit:** play level + JS lesson graded.

## Phase 5 — React engine

- esbuild in main/utility
- sandboxed preview
- react-test harness
- React Course 1

**Exit:** component preview + failing then passing test.

## Phase 6 — Fill curricula + diagnostics

- Remaining courses per [CURRICULA.md](../CURRICULA.md)
- Course diagnostic + skip/compress
- Transfer lessons, projects (project copies under the learner `workspaces/` tree)
- Daily quest + XP/streak (D19)
- **Restart** and **Clear history** for course and subject from Library / Progress

**Exit:** three tracks demo-complete at the quality bar. Restart subject keeps the log; clear subject wipes that learner’s pack attempts only.

## Phase 7 — Polish

- Certificates (local PNG) written under the learner folder
- Learner switcher UX (add / rename / switch) if not already comfortable in Phase 2
- Missing runtime UX
- Accessibility (contrast, keyboard)
- `typecheck` / `test` / `lint` green
- Tests: zip slip rejected; export zip has no `learners/` files; restart does not modify pack bytes; default grade appends (does not replace); clear-history removes attempts in scope only

## Definition of done (product v1)

- [ ] D3 shared AppData verified by hand
- [ ] D4 window restore including maximized
- [ ] Custom icon on taskbar for dev and installed
- [ ] tsconfigs not red; `npm run typecheck` passes
- [ ] Python / JS / React each have at least one full course, not a single hello-world
- [ ] Demo packs are folder-per-lesson JSON cartridges (no progress files inside)
- [ ] Install subject zip and lesson zip; export both
- [ ] Two local learners, same pack, independent progress
- [ ] Restart exercise, chapter, and lesson; cartridge unchanged; attempt log kept
- [ ] After a second check, UI shows this vs last (and best)
- [ ] Replace-last and clear-history work; they are not the default
- [ ] No network required to learn the demo packs
- [ ] No dependency on any other local project
