# Locked decisions

Change only with an explicit amendment. Prefer editing this table over silent drift.

| ID | Decision | Why |
| --- | --- | --- |
| D1 | **Windows-first** Electron + React desktop app. Linux/macOS not a v1 product matrix | Matches the author’s machine and the reference architecture they want |
| D2 | **All learner/app state in Electron `userData`**. Cartridges (packs/lessons) may be bundled or copied into `userData/packs`. Progress, notes, drafts, and workspaces live under `userData/learners/<learnerId>/` only. Never write sidecars into a cartridge or an arbitrary folder | Backup and reset are obvious; the same zip works for every learner |
| D3 | **`userData` is always `%APPDATA%\LAWP`** for `npm run dev` **and** `npm run dist` / installed builds. Same folder, no “dev profile” vs “deployed profile.” `LAWP_USER_DATA` overrides; `LAWP_ISOLATED_USER_DATA=1` uses repo `.dev-user-data/` (opt-in only). The installer **never writes, resets, or deletes** this folder | Debug the same profile you live in; reinstall is not a wipe |
| D4 | **Window bounds + maximized state persist** (`window-state.json`); clamp to visible displays; ignore minimized bounds | “Start where I left it” |
| D5 | Renderer has **no Node integration**; `contextIsolation: true`; sandbox the BrowserWindow | Security default |
| D6 | **Typed preload IPC + Zod**; Result `{ ok, value } \| { ok: false, error }` | Fail closed with codes |
| D7 | **Main grades and runs**; renderer displays | Keep answers and spawn out of the UI process |
| D8 | Content is **versioned cartridges**: JSON manifests + a folder of assets/code/tests per lesson, schemaVersion 1, generalized blocks. Coding is an engine, not the product | LMS for anything; a lesson is understandable on disk |
| D9 | v1 demo engines: **`none` (`world-v1`)**, then **Python, JavaScript, React**. First shipped learning experience is a non-code cartridge | Prove the LMS before proving three code runtimes |
| D10 | **Original curricula** — no Codefinity text, assets, or task cloning | Legal + better pedagogy |
| D11 | **No subscription, no cloud account, no telemetry** in v1. Local learner names on this PC are not accounts (D27). Optional later crash reports must be opt-in | Learning tool, not a funnel |
| D12 | Themes = **CSS variables**; dark / light / system | Comfort |
| D13 | Every new preference lives on **`settingsSchema`**. Settings export/import round-trips that document (minus window geometry, session, and secrets by default) so another PC can match this setup | Move house without re-clicking every toggle |
| D14 | **Single-instance** app | Avoid split profiles / double runners |
| D15 | Python **3.x only**; stdlib in v1 lessons | Predictable sandbox |
| D16 | React preview in a **sandboxed iframe**; tests not in the renderer | Stop XSS via learner JSX |
| D17 | Hints are **authored ladders**. Levels 1–3 are **free conceptual help**. Levels 4–5 are **assist** (scaffold/solution) and mark the attempt assisted. Mastery requires a later independent pass. AI tutor is **not** required to learn | Teach without a vendor or a spoiler |
| D18 | Mastery ≠ one green submit; transfer or mixed check required where the lesson says so | Beat completion theatre |
| D19 | Play XP cannot be farmed (caps). **No XP tax on conceptual hints.** Tax or withhold mastery credit only for assist/reveal | Play serves learning; asking “why” is not a cheat |
| D20 | `productName` / AppUserModelID **LAWP**; custom **icon** for window, taskbar, installer | Not the Electron atom |
| D21 | TypeScript project is **three configs**, self-contained, **no** `@electron-toolkit/tsconfig` extends (that package missing = red files in the tree) | Clean IDE on a fresh clone |
| D22 | electron-vite + electron-builder; `npm run dist` bumps **PATCH** then emits `release/`. `npm run dist:nobump` emits without changing the version | Familiar scripts; every shipped build is a new patch |
| D23 | Optional OpenAI-compatible **Author draft** (and later tutor): keys in `safeStorage`, never sent pack paths automatically. Not required to learn | Privacy; AI stays out of the learner loop |
| D24 | Pack answers may live on disk (local-first). “Exam mode” if ever added still grades in main | Honest about local apps |
| D25 | **Each lesson is its own folder** (`lesson.json` + `files/` + `assets/`). Each subject-matter is a pack folder that only *lists* those lessons. No `body.md` sidecar; prose lives in JSON strings | Install, zip, and share one unit without hunting the repo |
| D26 | Library **installs from `.zip` and exports `.zip`** at pack *and* lesson grain. Zip is the interchange format. Validate then copy; never extract into the cartridge in place | Adding a lesson is a file-picker, not a developer ritual |
| D27 | **Local learner profiles** (name on this PC, no account). First launch creates a default learner. Cartridges are shared; progress is not | Several people can use the same installed material |
| D28 | **Restart/redo** (default reset) restores starters and current status at exercise / chapter / lesson / course / subject. It **keeps the attempt log** so the next run can be compared to the last. Confirm. Optional keep-notes. Never deletes the cartridge | Redo without erasing how you did before |
| D29 | **Activity log** appends every run/check (last 200 / lesson). **Evidence** stores durable mastery and historical bests and is **not** dropped with the log. Optional replace-last / delete-last / clear-history. Restart keeps both | Compare this vs last without losing “best I ever did” |
| D30 | **Best** = highest correctness, then independent over assisted. Duration is shown but does not win ties unless `speedMatters` | Learning performance ≠ execution speed |
| D31 | Graded submits store a **local snapshot** (size-capped) so the learner can inspect what changed | Compare artifacts, not only scores |
| D32 | Each run/grade is bound to **`runId` + initiating `learnerId`**. Switching learner mid-run cannot write the result onto someone else | No cross-profile leaks |
| D33 | First-class **`activity`** blocks (`experiment` / `diagnose` / `construct` / `decide`) on one engine **`world-v1`** (data + rules, no pack `eval`). Loop: predict → action → visible consequence → explanation | The subject is playable; not a general simulator |
| D34 | **Misconceptions** are authored (distractor / failed check / world property → id). Why panel is central. Ambiguous evidence → diagnostic question, never a fake diagnosis | Practice targets *why*, not another generic skill tag |
| D35 | Courses may have a **continuing creation** the learner keeps and can export out of LAWP | Progression is “it can do something new” |
| D36 | **Author is form-first**: metadata, blocks, every `check` kind, `world-v1` parts/actions/rules/goal, and code files are edited as fields. JSON is an optional inspector. Template or blank → forms → save → validate → play in Studio → export zip. Optional AI draft (Author only, user endpoint, `needs-review` + `sources`). Schema stays AI-generable (closed enums, no embedded code) | Authors should not have to write a cartridge by hand |
| D37 | The **Library is assembled at runtime**, not baked as a fixed catalog at `npm run dist`. Bundled demos live read-only in the app (`resources/packs`). User cartridges live in `%APPDATA%\LAWP\packs`. Dist/installer/upgrade must not copy bundled packs on top of user packs or touch `settings.json` / `learners/`. **Full user pack** (`overlay: false`) hides the bundled pack. **Lesson install** writes an **overlay** (`overlay: true`) and **merges** onto the bundled tree — it must not hide sibling bundled lessons | Installing one lesson is not “delete the rest of the course” |
| D38 | **Setup portability:** Settings → Export / Import. Default file is prefs only. Optional **setup bundle** (same export, include installed cartridges) for an identical library on another PC. Import **merges**; overwrite of existing settings or packs is confirm-only. Never include window geometry, session, progress, or snapshots. Setup import **does not** grant execution trust (D39) | New machine, same setup — without clobbering what is already there |
| D39 | Execution **trust is bound to a content fingerprint** of executable surface (engines, capabilities, `files/`, code/debug blocks). Same `packId` with different bytes does not inherit trust. Edit/replace of executable content invalidates it. Setup import never grants spawn. Declared `capabilities` must match the lessons | Trust the bits, not the id |
| D40 | `world-v1` semantics are those of the **brighter-lamp** reference (rule order, payloads, `run.calcFault`, constraint `final`/`always`, view bind). Implement that example’s transitions (success, over-limit, recovery, fault) before adding engine features | One specified machine, not a folklore interpreter |
| D41 | Durable **grades ledger** (last 50 grades / lesson) plus a high-water **best value**. Activity-log truncation does not drop the ledger. Delete/replace mutates the ledger, then derives current/previous/best from it. `taskRev` bump **archives then clears** current `best` / `bestEver` / `fastest` / grades; old scores live only in `prior` | Recompute cannot need discarded runs; new rev does not inherit old best |
| D42 | Author IPC includes **save** and **import asset**. `hint:get` and `run:output` carry `runId`. Activity **grade uses main’s world** for that `runId`, not a client-supplied world | The contract matches the features we promoted |
| D43 | Graphical coding uses an app-owned **`player-v1`** harness (`Player.move` / `rotate` / `scale` / `say` / **`wait(ticks)`**). Stubs inject into the sandbox; main applies `play-log.json` to `world-v1` and grades **that** world. `wait` is a no-op on the world and logs `{ op: "wait", ticks }`; Studio replay delays that many ticks. Stubs stay write-only (no pack `look` / `eval`). Bundled stubs are app code, not pack-fingerprint prose | One reusable play API; same trust gate as other spawned code |
| D44 | Library is a **tutorial path**: track order from the pack, then each course in that track, then that course’s lessons. Do not group by `level` or by filename. Later courses stay closed until the previous course is done. **Skip ahead** is session-only. Home continue opens the first incomplete lesson on that path | A list of “beginner” cards will teach index before “what is a value” |
| D45 | `check.kind` is the closed list in `CHECK_KINDS` (`src/shared/check.ts`). Main grades every kind. Adding a kind requires a grader case, Studio widget, Author fields, **and** a lesson in `lawp.learning.questions` | A schema-only kind is not a product feature |
| D46 | Grid puzzles use the **bundled play kit** of AI-generated **PNG** sprites (`resources/play/assets` + `src/shared/playKit.ts`). Studio falls back to kit files by part `type`. `view.grid.floor` picks the default cell floor (stone if omitted). Grid is any rectangle **1–64**. The stage **scales down only** so the board fits; native cell size is never enlarged. Author picks kit pieces; pack-local `assets/` still override via `assetMap` | One visual language; large maps stay readable |
| D47 | A code block with `preview.kind: "iframe"` is a **DOM page**. Studio shows **Preview / HTML / CSS** tabs (fixture source is inspectable, not hidden behind the renderer). The JS editor uses **`dom-v1`** completions (`document`, `querySelector` and the element it returns, plus selectors from that page). Completions follow the **selected node** (an `h1` does not offer `checked`). The cursor’s selector **highlights** that node in Preview. Fox grids stay `player-v1` | Learners can see the markup they are selecting |
| D48 | Code lessons show a **Console** under the editor (stdout / stderr). Opening a lesson **runs the starter once** so `console.log` / `print` appear without a SUCCESS / FAIL overlay. Cartridge paths (`files/main.js`) are authoring metadata and stay off the learner editor | Return-vs-print is unteachable if the log is invisible |

## Deferred

- Classroom server, SSO, LTI, roster sync (local profiles are in-scope: D27)
- Pack marketplace
- Native mobile
- Local LLM bundle (user-provided API in Author is D23/D36)
- Marketplace-grade CMS / collaborative cloud authoring (in-app workbench is D36)
- Leaderboards
- A general physics/simulation platform (use `world-v1` lookups/rules)
- SQL / Java / etc. engines (the **model** already allows `engines: ["none"]`)
