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
- Studio editor: CodeMirror, language lint, Player autocomplete on fox grids, **DOM autocomplete** (`document`, `querySelector`, element members, page selectors) on iframe lessons. Those lessons also have **Preview / HTML / CSS** tabs so the fixture source is inspectable. Learner **drafts** under `learners/<id>/drafts/`
- Studio bar: Back / Next / Hint / Restart are icons with tooltips. After a correct Submit, that same control becomes Next in place (incorrect keeps Submit so they can retry). Last lesson: **Return to library** plus Congratulations and a first-try score; Correct / Incorrect shows in the left pane
- Progress: activity log, grades ledger, snapshots on Check, restart keeps history (D28, D41)
- Library lessons: longer authored card blurbs (no code), takeaway pills, and a Lucide icon per lesson; placement / diagnostic courses are a compact intro row; export / restart / clear live in an overflow menu
- **Question types** pack (`lawp.learning.questions`): one playable lesson per `check` kind (D45), including **Choose the word** (`select`). Pack copy is learner-facing

## Current limits

These surfaces exist in schema or as thin shells. They are not a second product yet.

| Area | Honest state |
| --- | --- |
| React pack | Lessons load; learner JS runs through **Node**, not a sandboxed iframe preview |
| Author | Forms cover shipped block and check kinds; not a drag-canvas CMS |
| Python catalog | Course 1 material; not an expert-length catalog |
| JS catalog | Expert path is authored; React stays a separate pack |
| Practice / Play HUD | Practice queue exists; daily quest, XP, certificates are not a live loop |
| Isolation | Runner is a trimmed-env child process, not a VM; `capabilities.network: false` is a pack declaration |

## Quality bar (unchanged)

Each shipped course still owes: a diagnostic or skip path, a playable failure, a transfer, a creation or project, hint ladders, authored misconceptions, original prose.

Original curricula only. Do not scrape or reproduce Codefinity materials.
