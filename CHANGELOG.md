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
- JavaScript working-expert curriculum on `lawp.javascript.foundations` (placement through craft/capstone; fox/beacon grid, DOM harness, mock fetch)
- JavaScript courses 7–9 deepened (event loop, DOM, HTTP): longer explains, follow-up cloze/true-false, field scenery on timed walks; new lessons `prevent-default` and `method-and-headers`
- JavaScript courses 4–6 (scope, errors, internals): deeper fox/desk explains, cloze or true/false after each predict, grass-field scenery off the required path, and four-rung hint ladders
- Code runner: ESM boot, hidden `js-assert` after the learner entry, `Player.wait(ticks)`, happy-dom DOM grade in main, fixture `fetch` stub

- Library is a numbered tutorial path: Play next, then values and the fox before lists; later courses stay locked until the one above is done (Skip ahead if you want)
- Check kinds: pick one, multi, odd-one-out, true/false, image choices, short text, numeric, fix-this, cloze dropdowns, word bank, match, order, place-on-diagram, hotspot, graphic order, bins, Venn, hot text, table, two-step why, slider, number line, listen
- **Question types** pack (`lawp.learning.questions`) plays every kind; tests fail if a kind has no lesson
- Author is a lesson workspace: New/Open start, block outline, one focused editor, Add-block palette; Save / Play on the bar (Ctrl+S)
- Studio Back / Next / Hint / Restart are icons with tooltips; after a **correct** Submit the same button becomes Next (same place); incorrect keeps Submit so they can change the answer and try again; Correct / Incorrect shows in the left pane
- Last lesson: that control is **Return to library** (not a grayed Next); left pane shows Congratulations and a **first-try** score (later fixes do not become 100%)
- Library is two screens: pick a pack, then its lessons. Return from Studio reopens that pack’s lesson list and restores scroll
- Pack cards: cover art, category (Electricity / Programming / Learning), `done/total (pct)`, and Not started / In progress / Complete
- Bundled pack covers are generated photographs (`assets/cover.png`), not SVG drawings
- `select` (Choose the word): dropdown in the sentence, sibling of type-the-word; more than one choice can be right
- `short` / `fix` accept several answers and close spellings (punctuation and case ignored)
- Put-in-order: drag to rearrange; Up / Down are icon buttons with tooltips
- Library lists lessons as cards with Done and To do marks
- Lesson cards: height follows the blurb, equal on a row; darker title and footer around a lighter body; 2px border clips the inner bands to the same radius
- Built-in play kit is AI-generated **PNG** sprites (floors, terrain, items, characters, hazards). Item/character plates are knocked out so sprites sit on the floor. Grid boards are any rectangle up to 64×64; the stage shrinks to fit and never scales sprites up
- Each lesson card has a relevant Lucide icon in the title bar (color on the icon only)
- Bundled lessons have an authored card description (plain prose, no code) and takeaway pills above the footer (number, array, function, …). Author has a Card description field. Library reads that copy from `LESSON_CARDS` so a UI reload shows it
- Overflow menu for Export / Restart / Clear history
- Placement (and other diagnostic courses) is a compact intro row, not an empty card grid
- Lesson card blurbs keep the words inside `` `code` `` spans
- **Question types** pack copy is for learners (try every kind of question), not for adding a kind in source
- JavaScript pack: `short-circuit`, `set-and-map`, `prevent-default`, `method-and-headers`
- DOM lessons: Preview / HTML / CSS tabs so the page source is inspectable; JavaScript editor labeled **JavaScript · DOM** with completions for `document`, `querySelector`, the element it returns, and selectors from that page

### Fixed

- JavaScript lessons from **The page is a tree** onward: DOM preview is a styled page (not a raw browser default or a blank white box); `jsdoc-contracts` hidden test no longer redeclares `assert`; capstone hint is real code
- JavaScript expert pack is deeper: longer explain, a second check after most predicts, play-kit scenery on fox grids, four-rung hints, and a continuing signal-desk story
- Hidden `js-assert` on a fox lesson now has `Player` in scope, so a correct walk is not failed when the test reloads `main.js`
- Library no longer lists courses by filename, so Craft no longer appears before Placement
- A crashing program can no longer pass a play goal (exit code 0 required)
- Runtime output and errors show on grid lessons
- Player API lint ignores comments and strings
- Stale run/grade results cannot update a newly opened lesson
- DOM preview no longer stays blank until you leave and return: wait for the lesson draft, remount per lesson, and paint the iframe from a blob URL

### Docs

- Product docs in present tense. Implementation plan and `START_HERE.md` removed.

## 0.1.x

Spec/bootstrap labels only (last package id `0.3.3`). No separate release notes.
