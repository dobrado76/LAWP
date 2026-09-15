# Changelog

All notable changes to **LAWP** go here. Keep this file current as you develop — do not wait for a release.

Versioning is `MAJOR.MINOR.PATCH` (`package.json`).

- **PATCH** — fix or small tweak. Update this file only.
- **MINOR** — user-visible capability. Update this file **and** [RELEASE_NOTES.md](RELEASE_NOTES.md) (what changed since the last minor). The app shows those notes once per minor.
- **MAJOR** — breaking change to cartridges, progress, or AppData. Same as minor, plus a clear migration note.

## 0.2.0 — 2026-09-15

First product minor. Package/spec numbering was previously `0.3.3`; this release is **0.2.0**.

### Grading and progress (D49–D54)

- **Submit is one atomic act.** The click freezes the editor files and every answer into one submission; a single `submitLesson` handler in main grades all required blocks in one pass and commits them in one write, so evidence never shows half a submission. The old per-block `grade:block` channel is gone
- Clicking Submit twice no longer grades twice: the button reads **Checking…** while main holds an in-flight submission per learner/lesson and the second call joins the first
- Edit code while grading runs and the verdict stays honest — the pass is recorded against the version that earned it, and Next waits until the text now in the editor is submitted and passes
- **A graded question now shows its answer and why.** The pick turns green or red on the choice itself and the explanation sits underneath. On a **diagnostic**, where you move on whether you were right or not, the answer you missed is marked in amber — before this a wrong answer was a red banner with no indication of what the right answer was, so you could only click Next and never learn it. A graded check you will retry still withholds the answer; that is the hint ladder's job
- **One tally instead of a column of banners.** The placement quiz stacked eight identical Correct/Incorrect banners in the left pane, none of them attached to the question they judged. It now reads `3 correct · 5 to review`, and the marks live on the questions
- **You can change an answer and submit again.** Editing any answer after grading returns the CTA from Next to Submit. Diagnostics were the worst case: they are excluded from the pass gate, so Next appeared as soon as the quiz was graded and there was no way back
- Every placement question carries an explanation now, not just the first; a curriculum test fails the build if a diagnostic check ships without one
- **Submit waits for an unanswered question.** Whether the code works still needs a run, but a question with nothing selected is visible without grading, so Submit greys out and says why ("Answer the question on the left first") rather than spending an attempt that could only come back "still unanswered". The keyboard shortcut is held by the same gate (D55)
- **Runner trouble is no longer a wrong answer.** A crash, a DOM deadline, a trust refusal, or an IPC failure shows a retry note and writes no grade row and no misconception hit
- **Completion survives the rolling grade ledger.** Per-block evidence (`blockState`) is kept apart from the 50-row history, so a 51st submission cannot un-finish a course. Existing learners are migrated from their old grades on load. Current score, completion, and mastery are now three separate values, and mastery never goes down after an assisted retry
- **Diagnostics measure without punishing.** Answering a placement question completes it even when the answer is wrong, the wrong answer and its verdict come back on revisit, and Next is never blocked. Skipping is now an explicit **Skip ahead — this lesson stays unfinished**, which awards nothing
- Run and preview never grade: no hidden tests, no grade row, no harness noise in the Console. Inspecting a page (Preview / HTML / CSS, selector highlight) no longer remounts the iframe, so typed input survives
- Creations export as the learner's own files plus a small manifest, not as a single wrapper document

### Library

- The pack header now wears that pack's **cover art** with the blurb from its shelf card, so opening a pack no longer drops you from an illustrated shelf onto a bare line of text. The art sits under a gradient that keeps it behind the title rather than competing with it, and a pack with no cover just gets the plain bar as before
- Card blurbs are short learning objectives (two-line clamp); the fuller text stays inside the lesson. Cards prefer the lesson's short `description` over the longer `LESSON_CARDS` copy
- Border colour means **selection only** (Play next / current). Progress and completion no longer paint the card edge — that was why yellow looked like a "transfer" colour. Transfer and debug get an amber/coral left stripe and a type chip instead
- Status badges say **Passed** or **Mastered**, matching the grading model; the filter that covers both is **Finished**
- Section time is the sum of lesson minutes (section 1.2 no longer claims 4 h when the lessons add up to ~2 h 50)
- **names-let-const** prompt now says plainly: declare a `const`, return that binding — a bare `return "locked"` fails. Hidden test rejects a string-literal return. Studio no longer hides the overall **Incorrect** when questions pass but code fails (that was why two Correct banners could sit next to 67% with no lesson verdict); Why then says the questions are right and the code task is still open

- Dropped the **Your path** heading. The pack title is already above it and the filter pills already carry the counts, so the row was restating what the page had just said. The pills moved up beside **Export pack ZIP** in the title row, which removes a second near-empty row and opens the pack page straight onto Play next
- A chapter now reads as a chapter: **`Chapter 3 — The page` on one 21px line**, the number in accent and the name in full-strength text, with its one-line intro underneath as supporting text. It was the reverse before — the chapter name was the smallest type on the page while its description was the largest. Sections read the same way, `1.2 — Values you can see`
- Hairline rules and real gaps between chapters and between the numbered sections inside them, so the page breaks into blocks you can scan instead of one continuous wall of cards
- The placement row is numbered `1.1` like every other section. It is a compact row rather than a card grid, but it is still the first section of the chapter, and leaving it unnumbered made the chapter look like it started at 1.2
- Dropped the `Tutorial N.` prefix from every chapter intro. It was a leftover from before these were called chapters, and it sat one line under a `Chapter N` kicker giving the same section two different numbers

### JavaScript path

- Studio header now shows the **pack title, centred**, next to the lesson title
- Inline code in lesson text now sizes itself relative to the prose around it (0.92em) instead of a fixed 12px, and the hard border is replaced by a soft tint, so a token reads as part of the sentence rather than a button dropped into it. Code in the goal banner is toned down so it does not inherit that line's bold
- Reordered the path so scope, errors, and the event loop come before the first page lesson, and the dense language-internals course comes after the page and the process. The whole module story (CommonJS vs ESM, bundlers, multi-file ESM) sits together in the Node course, ahead of testing and the capstone
- Five new lessons: `optional-chaining`, `switch-dispatch`, `object-key-iteration`, `promise-combinators`, `regex-lines`
- Widened existing lessons instead of adding cards: `do…while`, `extends` / `super`, the capture phase, `FormData`, `URL` / `URLSearchParams`, and dynamic `import()`. `functions-call` now names `module.exports` as harness plumbing and defers modules to the Node course
- Repairs: `macrotasks-timeout` has its own two-lamp desk instead of asking for an order the old desk called a fault; `arrays-map` teaches the transformation it grades; `set-and-map` exercises both; `json-roundtrip` no longer uses `fs` before the Node track; `measure-then-change` counts real operations from two runs; `closures-radio`, `reference-vs-copy`, and `parallel-vs-sequence` have hidden tests that can actually fail; `json-body` is now a debug lesson whose starter really throws
- Filled 22 thin hint ladders out to orient → concept → different example → assist, with no 1→4 jumps
- New tests hold the bar: exact path order, complete file and skill/misconception graphs, every assist solving its lesson, every assessed starter failing its assessment while still running cleanly, no play lesson opening with its objectives ticked, and every lesson teaching and asking something

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
- DOM completions follow the selected node (`h1` does not offer `checked`); the cursor’s selector outlines that node in Preview
- Every graded step (predict, question, fox walk, circuit, DOM) uses the same Submit → Correct! / Incorrect! → Next control on the **right** pane only; the header Check button is gone so you do not have to hunt for the Next arrow after SUCCESS
- Play goals cannot start already ticked: `return-not-print` no longer places the fox on the beacon; a catalog test fails if any bundled play objective is true at start
- Code editor includes a **Console**. Empty until **Run**; then only the learner’s `console.log` / `print` (not hidden-test stacks or `Player` harness logs). Cartridge paths such as `files/main.js` are hidden from learners
- Lesson Done / mastered waits until every required question and code task has a pass; one correct answer no longer completes the whole lesson
- DOM harness times out timers and promises against the lesson deadline (not only the sync VM slice)
- Leaving a lesson flushes the pending editor draft instead of dropping the last 400 ms
- DOM Preview no longer reloads when the cursor moves in the editor; highlight updates stay on the live page
- Submit on a question-plus-code lesson grades the question **and** runs the code; Correct / SUCCESS only when the goals are met, not from the multiple-choice alone
- Editor drafts stay bound to the lesson they were loaded for, so leaving a lesson cannot write that code into the next starter
- Restart lesson restores that lesson’s original starter and does not write the polluted editor back over the cleared draft
- App chrome: version lives in the window title (`LAWP 0.2.x`); Settings is a gear on the right with a tooltip
- Studio **Export** only appears after a kept creation exists; the save dialog uses the app window so the click is not a silent no-op

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
