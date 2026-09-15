# Changelog

All notable changes to **LAWP** go here. Keep this file current as you develop — do not wait for a release.

Versioning is `MAJOR.MINOR.PATCH` (`package.json`).

- **PATCH** — fix or small tweak. Update this file only.
- **MINOR** — user-visible capability. Update this file **and** [RELEASE_NOTES.md](RELEASE_NOTES.md) (what changed since the last minor). The app shows those notes once per minor.
- **MAJOR** — breaking change to cartridges, progress, or AppData. Same as minor, plus a clear migration note.

## 0.2.0 — 2026-09-15

First product minor. Package/spec numbering was previously `0.3.3`; this release is **0.2.0**.

### Added

- Desktop LMS shell: Home, Library, Studio, Practice, Author, Settings
- Local learners; shared `%APPDATA%\LAWP` for `npm run dev` and installed builds
- Zip install/export; overlay lesson vs full pack; fingerprint trust
- Settings export/import and optional setup bundle
- Circuits (`world-v1`): predict → experiment → Why → transfer → kept creation
- Python and JavaScript runners; `player-v1` fox/beacon grid
- CodeMirror editor: syntax, lint that teaches, Player autocomplete
- Learner drafts that survive navigation; Restart restores starters
- Grades ledger, snapshots, restart-keeps-history
- This changelog and minor-bump release notes (shown in-app)
- `npm run dist` increments PATCH; `npm run dist:nobump` keeps the version
- Tag-only GitHub workflow ships the NSIS installer to a Release (no workflow artifacts)

### Fixed

- A crashing program can no longer pass a play goal (exit code 0 required)
- Runtime output and errors show on grid lessons
- Player API lint ignores comments and strings
- Stale run/grade results cannot update a newly opened lesson

### Docs

- Product docs in present tense. Implementation plan and `START_HERE.md` removed.

## 0.1.x

Spec/bootstrap labels only (last package id `0.3.3`). No separate release notes.
