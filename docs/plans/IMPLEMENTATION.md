# Implementation plan

Work **only** in this repo. Phase 0 is already partially present (docs + tsconfig stubs + icon).

Rules from Phase 1 onward ([CONTENT_MODEL.md](../CONTENT_MODEL.md), D25–D42):

- JSON cartridges, folder-per-lesson, zip install/export. Progress only under `learners/<id>/`.
- Library is **runtime-resolved**: lesson zip **overlays** a bundled pack; a full pack zip replaces it (D37). Dist/installer never overwrite settings or user cartridges (D3).
- Settings export/import (D38). Trust is a **fingerprint**, never imported (D39).
- Grades **ledger** + activity log (D41). `world-v1` = brighter-lamp semantics (D40). IPC: save, assets, `runId` on hints/output, grade from main’s world (D42).
- First learning milestone is **one 20-minute playable experience**, not a finished three-track catalog.
- Cartridge JSON stays a small closed vocabulary so a human or a model can generate it from a template.

## Phase 0 — Bootstrap

- `package.json`: name `lawp`, productName `LAWP`, private
- electron-vite, electron, electron-builder, react, react-dom, zustand, zod
- Monaco or CodeMirror (needed later; not required to finish Phase 2 circuits)
- `electron-builder.yml` → `release/`
- `configureUserData`, window state, empty `BrowserWindow`, custom icon
- Settings schema + get/update + **export/import** (prefs file)
- `electron-builder.yml`: extraResources for demo packs **inside the app**; `deleteAppDataOnUninstall: false`; no AppData seeding
- About shows `userDataPath`
- Confirm: `npm run dev` and the installed exe print the **same** `%APPDATA%\LAWP`; a second `npm run dist` leaves existing `settings.json` and `packs/` bytes unchanged

**Exit:** two launch modes, one profile, icon not Electron’s, installer is not a wipe.

## Phase 1 — Shell + cartridge Library

- Routes: Home, Library, Studio, Author (stub), Settings
- Default local learner
- Load `resources/packs` + `userData/packs` **at runtime** (no baked catalog); resolve overlay vs full pack (D37)
- Library tree; **Install from ZIP** / **Export ZIP** (subject and lesson)
- Settings: export prefs; export **setup bundle** (prefs + user packs); import merges with confirm
- Trust dialog if an imported pack requests a code `capability` (default deny execution)
- Session: last pack/lesson + `learnerId`

**Exit:** install and re-export a zip; open a lesson’s `explain` in Studio.

## Phase 2 — First 20-minute experience (do this before filling code tracks)

Ship **one excellent session** using the same workflow another author will use.

Cartridge: `lawp.circuits.basics` — `engines: ["none"]`, **`world-v1` only** (no Python/Node spawn).

Must include, in about 20 minutes:

1. **Interactive challenge** — `activity` `kind: "experiment"` (make the lamp brighter without exceeding a current constraint): predict → change the circuit → see brightness → explain
2. **Useful diagnosis** — a wrong action or check maps to a misconception (“more batteries always means brighter” or similar); Why panel names it **or** asks a short diagnostic if ambiguous
3. **Progressive help** — concept hints free; assist hints mark `assisted`
4. **Unfamiliar transfer** — same skills, new constraint/story
5. **A creation they keep** — the circuit (or a tiny variant) lives under `learners/<id>/creations/…` and can be **exported** out of LAWP
6. **Author + export** — create that lesson from the `activity-experiment` template (or load the bundled one), preview, validate, export zip, install the zip on a clean learner and play it

Also in this phase:

- `world-v1` interpreter in **main** (data only; no `eval`)
- Progress: activity log + evidence; this vs last vs best (best = score, then independence)
- Graded snapshots (answers / world state)
- Restart keeps history; clear-history is explicit
- Bind `runId` + `learnerId` at activity start

**Exit:** a new user finishes the circuits session, sees why a failure happened, beats their previous attempt, exports their creation, and an author (or you) round-trips the same material through the workbench zip.

This is the product proof that LAWP is not “a code school with a fox skin.”

## Phase 3 — Author workbench v1

- Templates: `activity-experiment`, `activity-diagnose`, `activity-construct`, `activity-decide`, `explain-check`, `creation-step`
- Visual forms + live preview (same Studio renderer)
- Validate references, goals, misconceptions, assets
- Export zip
- Optional AI draft (user endpoint, `needs-review`, copy `sources`) — not required for the Phase 2 exit

**Exit:** a person who did not hand-write the circuits JSON can still produce a valid lesson zip.

## Phase 4 — Python engine + Course 1

- `run:code` / `grade:block` with **enforced** spawn policy ([SECURITY.md](../SECURITY.md))
- Run bound to initiating `learnerId`
- Python Course 1; `debug` + misconception ids on common failures
- Why panel is the same component as circuits
- Hint policy: concept free, assist ≠ mastery
- Creation thread: greeting-bot (or similar) grows across the course where it fits

**Exit:** fail, diagnose, hint, independent pass, relaunch; progress isolated per learner.

## Phase 5 — Studio UX + practice

- Splitters, drafts, Why as a primary pane
- Restart chapter; attempt timeline; snapshots “what I submitted”
- Practice queue: misconception follow-up first

**Exit:** Python Course 1 playable end-to-end with purposeful practice.

## Phase 6 — JavaScript + grid (`world-v1` grid view)

- Node harness; trust gate for imported JS packs
- Fox/beacons as `view.kind: "grid"` — not a second platform
- JS Course 1

**Exit:** playable grid + graded JS lesson.

## Phase 7 — React engine + continuing creation

- esbuild + sandboxed preview + react-test harness
- React Course 1 as **one creation** that gains filter / edit / persist / errors
- Export the app folder out of LAWP

**Exit:** preview + tests + a creation that does something new each module.

## Phase 8 — Fill curricula + diagnostics

- Remaining Python / JS / React courses per [CURRICULA.md](../CURRICULA.md)
- Course diagnostic + skip/compress
- Daily quest + XP (no tax on concept hints)
- More `world-v1` activities inside code tracks (diagnose a program = activity or `debug`)

**Exit:** four demo packs at the quality bar: circuits + three code tracks.

## Phase 9 — Polish

- Certificates under the learner folder
- Learner switcher mid-run does not steal the in-flight result
- Accessibility; `typecheck` / `test` / `lint`
- Tests: zip slip; cartridge/settings export has no `learners/`; evidence ledger survives log truncation; delete-last of the best uses remaining `grades[]` (D41); best ignores duration unless `speedMatters`; trust is fingerprint-bound and setup import grants none; overlay lesson does not hide bundled siblings; brighter-lamp transitions match CONTENT_MODEL; `grade:block` ignores client world; `hint:get` / `run:output` require `runId`; `world-v1` never calls `eval`; settings import does not write window-state

## Definition of done (product v1)

- [ ] D3 shared AppData (`npm run dev` and installed exe show the same path); D4 window restore; custom icon; tsconfigs clean
- [ ] `npm run dist` / reinstall does not overwrite `settings.json` or `userData/packs`
- [ ] Settings export/import and setup bundle (prefs + user cartridges) merge with confirm
- [ ] **20-minute circuits experience** (activity, Why/misconception, free concept hints, transfer, kept creation, author/export round-trip)
- [ ] Python / JS / React each have at least one full course
- [ ] Folder-per-lesson JSON; zip install/export; two local learners
- [ ] Activity log vs durable evidence; snapshots on graded submits
- [ ] Restart keeps history; clear/overwrite are explicit
- [ ] Overlay lesson install leaves other bundled lessons visible; full pack install hides bundled after confirm
- [ ] Trust is per fingerprint; setup import does not grant spawn; capabilities must match lessons
- [ ] brighter-lamp `world-v1` transitions pass
- [ ] `author:save` + `author:importAsset`; grade uses main’s world
- [ ] Learning works offline; AI draft is Author-only and optional
- [ ] No dependency on any other local project
