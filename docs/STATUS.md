# Product status

**LAWP 0.2.0.** This is what the installed / `npm run dev` app does. Limits are stated as limits, not as a build schedule. Changelog: [CHANGELOG.md](../CHANGELOG.md). This minor: [RELEASE_NOTES.md](../RELEASE_NOTES.md).

## In the app

- Shell: Home, Library, Studio, Author, Settings; local learners; last lesson in session
- Runtime Library: bundled `resources/packs` + `%APPDATA%\LAWP\packs` (overlay lesson zip vs full pack zip, D37). Pack cards by category with cover, progress, and status; then that pack’s lessons (scroll restored). Tutorial path, not a dump by difficulty (D44). Diagnostic courses are a compact intro row; lesson housekeeping sits in an overflow menu. Lesson cards use authored prose plus a Lucide icon (color on the icon only)
- Settings export/import and optional setup bundle (D38). Trust is a **fingerprint**; import never grants spawn (D39)
- Shared AppData for dev and installed builds (D3); window restore (D4); custom icon (D20)
- **Circuits** (`lawp.circuits.basics`): `world-v1` experiment, Why / misconceptions, hints, transfer, kept creation + export
- **Python** and **JavaScript** code lessons: spawn in a temp sandbox, stdout / AST / assert checks, Why, hints
- **JavaScript expert path** (`lawp.javascript.foundations`): placement through Node, DOM, fetch, tests, and a multi-file capstone. Hidden `js-assert` on every code lesson. Fox grids use play-kit scenery. DOM lessons preview a styled page. Four extra lessons: short-circuit, Set/Map, preventDefault, method/headers
- **`player-v1` grid:** `Player.move` / `rotate` / `scale` / `say` / `wait(ticks)`; main applies `play-log.json` and grades that world (D43). Built-in play kit (floors, terrain, items, characters, hazards) under `resources/play/assets`; Author picks pieces; Studio paints a floor tile on every cell
- Author: form-first lesson maker (every check kind, world parts/actions/rules, code files, **play-kit picker** on grid worlds). Save, validate, import picture/audio, play in Studio, export zip. JSON inspector is optional. How-to: [AUTHORING.md](AUTHORING.md)
- Studio editor: CodeMirror, language lint, Player autocomplete on fox grids, **DOM autocomplete** (`document`, `querySelector`, members for *that* node, page selectors) on iframe lessons. The cursor’s selector outlines the match in Preview. Those lessons also have **Preview / HTML / CSS** tabs so the fixture source is inspectable. A **Console** under the editor stays empty until Run, then shows only `console.log` / `print`. Cartridge file paths stay hidden. Learner **drafts** under `learners/<id>/drafts/` are per lesson; a flush on leave cannot write one starter into the next. **Restart lesson** reloads the authored starter and will not save the old buffer on top of that
- Studio bar: Back / Next / Hint / Restart are icons with tooltips; **Run** previews code. Every graded step uses one **Submit → Correct! / Incorrect! → Next** control on the **right** pane (never on the teach pane). A lesson with a question and a fox/code task is graded together — Correct only when the question is right and the goals are met. Last lesson: **Return to library** plus Congratulations and a first-try score; Correct / Incorrect shows in the left pane. Grid SUCCESS / FAIL overlay stays.
- Progress: activity log, grades ledger, snapshots on Check, restart keeps history (D28, D41). Library Done requires every graded block in the lesson, not one lucky submit
- **Submit is one atomic act** (D49): the click freezes the files and the answers, main grades every required block in a single pass, and all of it commits together. A second click joins the first instead of grading twice. Edit the code while grading runs and the pass is still recorded, but Next waits for the text you can actually see to pass. Runner crashes, DOM deadlines, and trust refusals read as trouble to retry, never as a wrong answer (D50)
- **Completion survives the ledger** (D51): per-block evidence is kept separately from the rolling 50-row grade history, so the 51st submission cannot un-finish a course. Current score, completion, and mastery are three different numbers; an assisted retry never removes a mastery you already earned
- **Placement is measured, not punished** (D52): answering a diagnostic completes it even when the answer is wrong, the wrong answer comes back on revisit, and Next is never blocked. **Skip ahead** is offered by name on an unfinished lesson and awards nothing
- Library lessons: longer authored card blurbs (no code), takeaway pills, and a Lucide icon per lesson; placement / diagnostic courses are a compact intro row; export / restart / clear live in an overflow menu
- **Question types** pack (`lawp.learning.questions`): one playable lesson per `check` kind (D45), including **Choose the word** (`select`). Pack copy is learner-facing

## Current limits

These surfaces exist in schema or as thin shells. They are not a second product yet.

| Area | Honest state |
| --- | --- |
| React pack | Lessons load; learner JS runs through **Node**, not a sandboxed iframe preview |
| Author | Forms cover shipped block and check kinds; not a drag-canvas CMS |
| Python catalog | Course 1 material; not an expert-length catalog |
| JS catalog | 103 lessons on the locked path (Foundations → Fluency → The page → The process → Language → Craft). Tests assert path order, that every starter fails honestly while running cleanly, that every assist solves its lesson, and that hint ladders are complete. React stays a separate pack |
| Placement report | Diagnostics are recorded per skill and drive `followUpLessonId`; there is no summary screen after the battery yet |
| Practice / Play HUD | Practice queue exists; daily quest, XP, certificates are not a live loop |
| Isolation | Runner is a trimmed-env child process, not a VM; `capabilities.network: false` is a pack declaration |

## Quality bar (unchanged)

Each shipped course still owes: a diagnostic or skip path, a playable failure, a transfer, a creation or project, hint ladders, authored misconceptions, original prose.

Original curricula only. Do not scrape or reproduce Codefinity materials.
