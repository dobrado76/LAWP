# Product specification

**App:** LAWP (Learn Anything While Playing)  
**Platform:** Windows-first Electron desktop  
**Version of this spec:** 0.2.0 (cartridges + local learners)

## Problem

Interactive platforms like Codefinity prove that **short explanation + in-place exercise + instant feedback** works. They also show the failure mode: catalog-as-product, subscription gates, repetition without diagnosis, certificates as the goal, and weak transfer to work you invent yourself.

LAWP is a **local learning studio**: any subject can be a pack; play is how you rehearse; mastery is how you proceed.

## Audience

- One or more **local learners** on the same PC (no account). They share installed cartridges; each has a private progress folder
- Authors who write **JSON cartridges**: one folder per subject-matter, one folder per lesson (code, tests, images, video, everything related). Install and share as `.zip`
- First curricula authors: Python, JavaScript, React (proof that the LMS is not coding-only in *model*, even if the first runtimes are code)

## Core loop

1. Pick a **quest** (a track slice: one skill you can demonstrate).
2. Meet a **challenge** (lesson + exercise) in the studio: teach pane + work pane.
3. **Run** (safe local runtime for that pack’s engine).
4. Get **feedback that teaches** (what failed, why, what concept to revisit — not only “wrong”).
5. Optionally spend a **hint token** (progressive: nudge → concept → example → never the full answer on first tap).
6. Pass a **mastery gate** (not a single lucky submit): mixed items, a transfer variant, spaced follow-up.
7. Unlock the next quest. Play HUD (streaks, XP, titles) reflects **real skill**, not grind.

## Primary surfaces

| Surface | Job |
| --- | --- |
| **Home / Continue** | Resume last lesson, daily quest, streak, “weak skills” recap |
| **Library** | Installed subject-matters and lessons; **Install from ZIP** / **Export ZIP**; filters (subject, level, runtime) |
| **Studio** | Split: concept + task | editor / quiz / sandbox | run/submit | console |
| **Play** | Quest map, run history, optional low-pressure challenge mode |
| **Practice** | Spaced review queue generated from misses and decaying skills |
| **Projects** | Capstone workspaces (multi-file) that leave artifacts under userData or a chosen folder |
| **Author** | Inspect a cartridge on disk; install/export zip (v1: edit JSON/files in the folder; GUI authoring later) |
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
| `check` | Multiple choice, multi-select, short text, numeric, cloze, matching, ordering |
| `code` | Editor + run + tests (Python / JS / React as engines) |
| `predict` | Show code or a situation; ask for output/result **before** running |
| `debug` | Broken artifact; learner fixes; tests prove the fix |
| `trace` | Step/mental-model: “what is `x` after this line?” |
| `project` | Multi-file workspace, rubric + automated checks + manual checklist |
| `play` | Lightweight game overlay (e.g. collect stars by satisfying properties) — still mapped to skills |
| `reflect` | Free-text journal; optional self-rate confidence (feeds spacing) |

Non-code subjects (future packs: languages, maths, music theory, history) reuse `explain` / `check` / `trace` / `play` / `project` without a code engine.

### Code studio (Python, JS, React)

Parity with Codefinity’s useful bits:

- Side-by-side **teach + work**
- **Run** without submitting
- **Submit** / **Check** against hidden + visible tests
- Starter code, fixtures, read-only files vs editable files
- Console / preview (React: sandboxed iframe preview)
- Restart exercise (restore starter, **keep** prior runs); restart lesson / chapter from the TOC
- After Check: show this attempt vs the previous one vs best (score, time, hints)
- Diff vs starter; optional “show failing test name” immediately, implementation details after a struggle threshold

Better than Codefinity:

- **Diagnostic pretest** at course start: skip or compress chapters you already demonstrate
- **Fast-track** toggle per course
- **Transfer tasks**: same skill, new story/data (stops memorizing the sample)
- **Property tests** and **AST/semantic checks** where exact print matching is brittle
- **Why panel**: failing tests map to concept cards, not a paywalled AI dump
- Hints are **authored ladders**, not a single spoiler
- You can **always** open the next lesson; mastery gates affect *track completion* and practice queue, not a hard lock that humiliates (optional “strict campaign” mode)

### Progress

- Stored only under `userData/learners/<learnerId>/` (JSON). Cartridges stay read-only
- Per-lesson: not started / in progress / passed check / **mastered** / retrying
- Per-skill tags on every item (`python.loops.for`, `react.state.updater`, …)
- **Attempt log (default: keep everything):** every Run and every Check is appended with timestamp, passed, checks, duration, hint level. Rollups: **current**, **previous**, **best** so a redo can answer “did I do better this time?”
- Optional **replace last** (overwrite the previous run instead of appending) and **delete last**
- **Restart / redo** (default reset): restore starters, keep the log, append a restart marker
- **Clear / clean history**: wipe attempts in that scope (stronger confirm). Same scopes: exercise, chapter, lesson, course, subject. Does not uninstall the material
- Spaced review: FSRS-like or SM-2 subset — v1 can be a simple ease + interval table
- Local “certificate” PNG/PDF generated from mastery, not a vendor LinkedIn product — written in the learner folder

### Play layer

- Daily quest: 10–20 minutes of review + one new lesson
- XP for **first mastery** and **review success**, tiny XP for repeats (anti-farm)
- Streak = calendar day with a **real check** (not app open)
- Titles/badges from skill milestones (“Loop fluent”, “Hook-safe”) not paid skins
- Optional sound/particle on pass — off by default in Settings

### Settings and data

- All app state under Electron `userData` (`%APPDATA%\LAWP` by default)
- Settings schema is the export document (strip window geometry on export)
- Learner progress in JSON under `userData/learners/<id>/` (never inside a pack)
- Packs: bundled (`resources/packs/`) + user-installed zips (`userData/packs/`), both folder-per-lesson
- Local learners: add / rename / switch in Settings; default learner created on first launch

## Non-goals (v1)

- Multi-user classroom server, SSO, LMS LTI (local named learners on one PC **are** in v1)
- Marketplace / payments / subscriptions
- Hosting learner code in the cloud
- Replacing VS Code / a full IDE
- Training or shipping a local LLM (optional later: user-provided OpenAI-compatible endpoint, keys in `safeStorage`, **never required**)
- Scrape or reproduce Codefinity course text, videos, or tasks (original curricula)

## Success criteria (v1 demo)

A new user can, without an account:

1. Launch, see the last window size/position/maximized state
2. Continue a Python lesson, run code, fail a test, use one hint, then pass
3. Skip a JS chapter via diagnostic
4. Preview a React component in the studio
5. Close, reopen via `npm run dev` **or** the installed build, and find the **same** progress and window
6. Install a lesson or subject from a `.zip`, export one back out, and restart a lesson without the zip changing
7. Fail a check, pass later, and see that the new result beat the previous one; clear history only when they ask
