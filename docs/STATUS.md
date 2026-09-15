# Product status

**LAWP 0.2.0.** This is what the installed / `npm run dev` app does. Limits are stated as limits, not as a build schedule. Changelog: [CHANGELOG.md](../CHANGELOG.md). This minor: [RELEASE_NOTES.md](../RELEASE_NOTES.md).

## In the app

- Shell: Home, Library, Studio, Author, Settings; local learners; last lesson in session
- Runtime Library: bundled `resources/packs` + `%APPDATA%\LAWP\packs` (overlay lesson zip vs full pack zip, D37). Tutorial path, not a dump by difficulty (D44)
- Settings export/import and optional setup bundle (D38). Trust is a **fingerprint**; import never grants spawn (D39)
- Shared AppData for dev and installed builds (D3); window restore (D4); custom icon (D20)
- **Circuits** (`lawp.circuits.basics`): `world-v1` experiment, Why / misconceptions, hints, transfer, kept creation + export
- **Python** and **JavaScript** code lessons: spawn in a temp sandbox, stdout / AST / assert checks, Why, hints
- **JavaScript expert path** (`lawp.javascript.foundations`): placement through Node, DOM, fetch, tests, and a multi-file capstone (~80–100 h). Hidden `js-assert` on every code lesson
- **`player-v1` grid:** `Player.move` / `rotate` / `scale` / `say` / `wait(ticks)`; main applies `play-log.json` and grades that world (D43). ESM boot, happy-dom DOM grade in main, mock `fetch` from fixtures
- Studio editor: CodeMirror, language lint, Player autocomplete; learner **drafts** under `learners/<id>/drafts/`
- Progress: activity log, grades ledger, snapshots on Check, restart keeps history (D28, D41)
- Author: templates, save, import asset, validate, export zip. Preview uses the saved lesson. Optional AI draft exists as a channel; it stays unused until an endpoint is configured

## Current limits

These surfaces exist in schema or as thin shells. They are not a second product yet.

| Area | Honest state |
| --- | --- |
| React pack | Lessons load; learner JS runs through **Node**, not a sandboxed iframe preview |
| Author | JSON workbench + templates, not a full visual CMS |
| Python catalog | Course 1 material; not an expert-length catalog |
| JS catalog | Expert path is authored; React stays a separate pack |
| Practice / Play HUD | Practice queue exists; daily quest, XP, certificates are not a live loop |
| Isolation | Runner is a trimmed-env child process, not a VM; `capabilities.network: false` is a pack declaration |

## Quality bar (unchanged)

Each shipped course still owes: a diagnostic or skip path, a playable failure, a transfer, a creation or project, hint ladders, authored misconceptions, original prose.

Original curricula only. Do not scrape or reproduce Codefinity materials.
