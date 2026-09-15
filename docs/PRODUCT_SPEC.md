# Product specification

**App:** LAWP (Learn Anything While Playing)  
**Platform:** Windows-first Electron desktop  
**Version of this spec:** 0.3.3 (reference activity + resolved setup export + atomic lessons)

## Problem

Interactive platforms like Codefinity prove that **short explanation + in-place exercise + instant feedback** works. They also show the failure mode: catalog-as-product, subscription gates, repetition without diagnosis, certificates as the goal, and weak transfer to work you invent yourself.

LAWP is a **local learning studio**: any subject can be a pack; the **subject itself is playable** (predict → act → see → explain); mastery is how you proceed.

## Audience

- One or more **local learners** on the same PC (no account). They share installed cartridges; each has a private progress folder
- Authors who write **JSON cartridges** (or use the in-app workbench / optional AI draft): one folder per subject-matter, one folder per lesson. Install and share as `.zip`. Schema is small enough to generate, strict enough to validate
- First proof of “anything”: a **basic circuits** cartridge (`world-v1`, no code runtime). Then Python, JavaScript, React

## Core loop

1. Pick a **quest** (a skill you can demonstrate, often on a creation you already have).
2. **Predict** what will happen.
3. **Act** in an activity world, editor, or quiz.
4. See a **visible consequence** (lamp brightness, test output, scene branch).
5. **Explain** / read the Why panel (misconception if evidence is clear; otherwise a short diagnostic).
6. Use **free conceptual help** if needed; assist hints cost mastery credit, not curiosity.
7. Pass a **mastery gate** (independent pass + transfer where authored).
8. The **creation** can do something new; optionally export it out of LAWP.

## Primary surfaces

| Surface | Job |
| --- | --- |
| **Home / Continue** | Resume last lesson, daily quest, streak, “weak skills” recap |
| **Library** | Installed subject-matters and lessons; **Install from ZIP** / **Export ZIP**; filters (subject, level, runtime) |
| **Studio** | Teach + **playable work** (activity / editor / quiz) + Why. Predict → act → see → explain |
| **Play** | Quest map, run history, optional low-pressure challenge mode |
| **Practice** | Queue from **misconceptions** first, then weak skills / spacing |
| **Projects / Creations** | One artifact that grows across a course; export out of LAWP |
| **Author** | Template → visual edit → live preview → validate → export zip. Optional AI draft + source/review metadata |
| **Settings** | Theme, editor, runtimes (Python path), **local learners**, privacy, export/import prefs |
| **Progress** | Skills graph, **attempt timeline** (this vs last vs best), certificates; **restart** (keep history) or **clear history** at exercise / chapter / lesson / course / subject |

## Functional requirements

### Catalog and navigation

- Hierarchical browse: **Subject → Track → Course → Module (chapter) → Lesson**
- Search titles, skills, and lesson text in installed packs
- Resume exact lesson + editor buffer + scroll (session) for the **current learner**
- Bookmarks and notes **per lesson**, stored under that learner’s folder (not in the cartridge)
- **Install from ZIP** (subject-matter or a single lesson) and **Export ZIP** of either, from Library — no extra tools
- Replacing a cartridge does not delete another learner’s progress; restart and clear are explicit

### Lesson types (general LMS)

Every lesson is a sequence of **blocks**. Coding is one block family.

| Block | Use |
| --- | --- |
| `explain` | Markdown (figures, callouts). Optional short video file in the pack |
| `predict` | Lock in a forecast **before** the world or code runs |
| `activity` | Playable subject: `experiment` / `diagnose` / `construct` / `decide` on **`world-v1`** |
| `check` | MCQ, multi, short, numeric, cloze, match, order — distractors may name a misconception |
| `code` | Editor + run + tests (Python / JS / React) |
| `debug` | Broken artifact; learner fixes; tests (and misconceptions) prove the fix |
| `trace` | Step/mental-model: “what is `x` after this line?” |
| `project` | One-off workspace **or** a step on a continuing creation |
| `play` | `world-v1` grid skin (fox/beacons) — not a second platform |
| `reflect` | “Explain why that happened”; stored in the learner profile |

Non-code subjects use `explain` / `predict` / `activity` / `check` / `reflect` with `engines: ["none"]`. The first demo pack is **circuits**, not a code hello-world.

### Code studio (Python, JS, React)

Parity with Codefinity’s useful bits:

- Side-by-side **teach + work**
- **Run** without submitting
- **Submit** / **Check** against hidden + visible tests
- Starter code, fixtures, read-only files vs editable files
- Console / preview (React: sandboxed iframe preview)
- Restart exercise (restore starter, **keep** prior runs); restart lesson / chapter from the TOC
- After Check: show this attempt vs the previous one vs **best** (correctness, then independence — not speed unless the lesson says so)
- Open the **snapshot** of a previous graded submit
- Conceptual hints are free; assist hints mark assisted success
- Diff vs starter; optional “show failing test name” immediately, implementation details after a struggle threshold

Better than Codefinity:

- **Diagnostic pretest** at course start: skip or compress chapters you already demonstrate
- **Fast-track** toggle per course
- **Transfer tasks**: same skill, new story/data (stops memorizing the sample)
- **Property tests** and **AST/semantic checks** where exact print matching is brittle
- **Why panel** (central): failing checks / world properties map to **misconceptions** or a diagnostic question — not a paywalled AI dump
- Hints are **authored ladders**; concept vs assist (D17)
- You can **always** open the next lesson; mastery gates affect *track completion* and practice queue, not a hard lock that humiliates (optional “strict campaign” mode)

### Progress

- Stored only under `userData/learners/<learnerId>/` (JSON). Cartridges stay read-only
- Per-lesson: not started / in progress / passed check / **mastered** / retrying
- Per-skill tags on every item (`python.loops.for`, `react.state.updater`, …)
- **Activity log** (last 200 / lesson) plus **durable evidence** (mastery, historical best, misconception counts) that is not dropped when the log truncates
- Optional **replace last**, **delete last**, **clear history**
- **Restart / redo** (default): restore starters, keep log and evidence
- Graded **snapshots** so “what I submitted” can be compared
- Each run is bound to the **initiating learner** (`runId`)
- Practice prefers a misconception follow-up over another generic skill drill
- Spaced review: FSRS-like or SM-2 subset — v1 can be a simple ease + interval table
- Local “certificate” PNG/PDF generated from mastery, not a vendor LinkedIn product — written in the learner folder

### Play layer

- Daily quest: 10–20 minutes of review + one new lesson
- XP for **first independent mastery** and **review success**, tiny XP for repeats (anti-farm). No tax on conceptual hints
- Streak = calendar day with a **real check** (not app open)
- Titles/badges from skill milestones (“Loop fluent”, “Hook-safe”) not paid skins
- Optional sound/particle on pass — off by default in Settings

### Settings and data

- All app state under Electron `userData` (`%APPDATA%\LAWP` for **both** `npm run dev` and the installed build)
- Library is **runtime-resolved**: overlay lesson zips **merge** onto bundled packs; a full user pack (`overlay: false`) hides the bundled pack after confirm. Not a catalog frozen at `npm run dist`. Installer/upgrade never overwrites settings or user cartridges
- **Export / import settings** (prefs) and optional **setup bundle** (prefs + user-installed cartridge zips) for the same setup on another PC. Merge on import; confirm before replace. No window geometry, no learner progress
- Every new preference lives on `settingsSchema` so export round-trips it. Strip secrets by default
- Learner progress in JSON under `userData/learners/<id>/` (never inside a pack or a settings export)
- Local learners: add / rename / switch in Settings; default learner created on first launch
- Per-pack **execution trust** for imported code cartridges (default deny)

## Non-goals (v1)

- Multi-user classroom server, SSO, LMS LTI (local named learners on one PC **are** in v1)
- Marketplace / payments / subscriptions
- Hosting learner code in the cloud
- Replacing VS Code / a full IDE
- Training or shipping a local LLM (optional Author draft / later tutor: user-provided OpenAI-compatible endpoint, keys in `safeStorage`, **never required to learn**)
- A general physics engine or treating imported executable packs as safe without an explicit trust step
- Scrape or reproduce Codefinity course text, videos, or tasks (original curricula)

## Success criteria (v1 demo)

A new user can, without an account:

1. Launch, see the last window size/position/maximized state
2. Finish the **~20 minute circuits** session: experiment, Why after a miss, transfer, keep/export a creation
3. Author (or load) that lesson from a template, validate, export zip, play the zip
4. Continue a Python lesson, fail, see a misconception or diagnostic, pass independently
5. Skip a JS chapter via diagnostic; play a `world-v1` grid level
6. Grow a React creation across lessons and export it
7. Close, reopen via `npm run dev` **or** the installed build, same `%APPDATA%\LAWP` (settings, packs, progress, window)
8. Run `npm run dist` / reinstall: settings and previously installed cartridges still there
9. Export setup, import on a second machine (or after confirm-merge): same prefs and user library
10. Two learners, same pack, independent evidence; restart keeps history; best survives a truncated log
