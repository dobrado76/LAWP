# Locked decisions

Change only with an explicit amendment. Prefer editing this table over silent drift.

| ID | Decision | Why |
| --- | --- | --- |
| D1 | **Windows-first** Electron + React desktop app. Linux/macOS not a v1 product matrix | Matches the author’s machine and the reference architecture they want |
| D2 | **All learner/app state in Electron `userData`**. Cartridges (packs/lessons) may be bundled or copied into `userData/packs`. Progress, notes, drafts, and workspaces live under `userData/learners/<learnerId>/` only. Never write sidecars into a cartridge or an arbitrary folder | Backup and reset are obvious; the same zip works for every learner |
| D3 | **`userData` is always `%APPDATA%\LAWP`** for `npm run dev` and installed/`release` builds. `LAWP_USER_DATA` overrides; `LAWP_ISOLATED_USER_DATA=1` uses repo `.dev-user-data/` | Debug the same profile you live in |
| D4 | **Window bounds + maximized state persist** (`window-state.json`); clamp to visible displays; ignore minimized bounds | “Start where I left it” |
| D5 | Renderer has **no Node integration**; `contextIsolation: true`; sandbox the BrowserWindow | Security default |
| D6 | **Typed preload IPC + Zod**; Result `{ ok, value } \| { ok: false, error }` | Fail closed with codes |
| D7 | **Main grades and runs**; renderer displays | Keep answers and spawn out of the UI process |
| D8 | Content is **versioned cartridges**: JSON manifests + a folder of assets/code/tests per lesson, schemaVersion 1, generalized blocks. Coding is an engine, not the product | LMS for anything; a lesson is understandable on disk |
| D9 | v1 demo engines: **Python, JavaScript, React** only | Prove three runtimes |
| D10 | **Original curricula** — no Codefinity text, assets, or task cloning | Legal + better pedagogy |
| D11 | **No subscription, no cloud account, no telemetry** in v1. Local learner names on this PC are not accounts (D27). Optional later crash reports must be opt-in | Learning tool, not a funnel |
| D12 | Themes = **CSS variables**; dark / light / system | Comfort |
| D13 | Every new preference lives on **`settingsSchema`**. Settings export = that document minus window-like keys | Round-trip prefs |
| D14 | **Single-instance** app | Avoid split profiles / double runners |
| D15 | Python **3.x only**; stdlib in v1 lessons | Predictable sandbox |
| D16 | React preview in a **sandboxed iframe**; tests not in the renderer | Stop XSS via learner JSX |
| D17 | Hints are **authored ladders** (5 levels). AI tutor is **not** required for v1 | Teach without a vendor |
| D18 | Mastery ≠ one green submit; transfer or mixed check required where the lesson says so | Beat completion theatre |
| D19 | Play XP cannot be farmed (caps, taxes on spoilers) | Play serves learning |
| D20 | `productName` / AppUserModelID **LAWP**; custom **icon** for window, taskbar, installer | Not the Electron atom |
| D21 | TypeScript project is **three configs**, self-contained, **no** `@electron-toolkit/tsconfig` extends (that package missing = red files in the tree) | Clean IDE on a fresh clone |
| D22 | electron-vite + electron-builder; `npm run dist` emits `release/` | Familiar scripts |
| D23 | Optional OpenAI-compatible tutor later: keys in `safeStorage`, never sent pack paths automatically | Privacy |
| D24 | Pack answers may live on disk (local-first). “Exam mode” if ever added still grades in main | Honest about local apps |
| D25 | **Each lesson is its own folder** (`lesson.json` + `files/` + `assets/`). Each subject-matter is a pack folder that only *lists* those lessons. No `body.md` sidecar; prose lives in JSON strings | Install, zip, and share one unit without hunting the repo |
| D26 | Library **installs from `.zip` and exports `.zip`** at pack *and* lesson grain. Zip is the interchange format. Validate then copy; never extract into the cartridge in place | Adding a lesson is a file-picker, not a developer ritual |
| D27 | **Local learner profiles** (name on this PC, no account). First launch creates a default learner. Cartridges are shared; progress is not | Several people can use the same installed material |
| D28 | **Restart/redo** (default reset) restores starters and current status at exercise / chapter / lesson / course / subject. It **keeps the attempt log** so the next run can be compared to the last. Confirm. Optional keep-notes. Never deletes the cartridge | Redo without erasing how you did before |
| D29 | **Every run and every check is appended** to that learner’s attempt log. Current / last / best are rollups. Optional: replace the last attempt on submit, delete last, or **clear history** in the same scopes. Clearing history is a separate, stronger confirm — not the default | See whether this time was better; still allow a clean slate |

## Deferred

- Classroom server, SSO, LTI, roster sync (local profiles are in-scope: D27)
- Pack marketplace
- Native mobile
- Local LLM bundle
- Full GUI pack author
- Leaderboards
- SQL / Java / etc. engines (the **model** already allows `engines: ["none"]` for non-code)
