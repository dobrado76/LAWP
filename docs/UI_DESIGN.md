# UI design

Desktop **learning studio**, not a marketing site and not a code-editor clone of VS Code.

## Visual tone

- Dark default; light supported
- Accent: teal on indigo (matches the app icon)
- Dense enough for a 14" laptop; comfortable type (system UI + JetBrains Mono or Cascadia for code)
- Inline code in prose is sized in **em, not px** (`0.92em`, which matches the sans x-height because mono reads small at equal px) so a token scales with the text it sits in — body copy, a heading, a card blurb. Tint only, no border: a token is a word in the sentence, not a button
- Play HUD is a **thin top or corner widget**, not a cartoon theme overlaying every pane
- Icon: fox/owl geometric mark (see `build/icon.png`)

## Chrome

```
┌─ LAWP 0.2.0 (native Windows title) ─────────────────────────────┐
│ icon Home · Library · Studio · Practice · Author        icon Settings │
│ (Lucide icons + tooltips; active route keeps the teal border)         │
├──────────────┬──────────────────────────────────────────────────┤
│ Quest / TOC  │  Studio (teach | work)                           │
│              │                                                  │
│              ├──────────────────────────────────────────────────┤
│              │  Console / Preview / Why                         │
└──────────────┴──────────────────────────────────────────────────┘
```

- Restore **splitter positions** in `session.json`
- Studio is 50/50 default; user-adjustable; min widths
- Keyboard: `Ctrl+Enter` run, `Ctrl+Shift+Enter` check, `Esc` focus TOC, `Alt+Left` back

## Home

- Continue card (pack, lesson title, progress bar, **creation** thumbnail if any)
- Daily quest (time estimate)
- Weak skills **and open misconceptions** (practice)
- Quest map thumbnail of current course

## Library

- First screen: illustrated pack cards grouped by category (Electricity, Programming, Learning…). Each card shows cover art, a status tag (Not started / In progress / Complete), and `2/8  (25%)`. Opening a pack is a **second screen** of lessons. Back returns to the pack list
- Return to library from Studio opens that pack’s lesson list (not the pack list) and restores scroll
- Inside a pack the header is that pack's **cover as a backdrop**, with the same blurb the shelf card carries, so the page you browse in looks like the card you clicked. The art is held back under a gradient — a backdrop for a title, not an illustration to read — and the header falls back to a plain bar when a pack has no cover
- After a pack: a numbered **tutorial path** (chapter → course → lesson). **Play next**. Later courses stay locked until the one above is done; **Skip ahead** if you want
- That path is long, so it has to break into blocks you can scan. A chapter is the coarsest division and is titled like one — **`Chapter 3 — The page` on one 21px line**, the number in accent and the name in full-strength text, then its intro as supporting text (never the reverse). Sections read the same way: `1.2 — Values you can see`. A hairline rule and a wide gap open each chapter, a lighter rule separates the numbered sections inside it. No banner heading over the list: the pack title is already above it and the filter pills already carry the counts
- Do not dump every “beginner” lesson into one grid — values and the first commands come before lists
- Lesson cards: height follows the blurb (short learning objective); every card on a row matches the tallest. Darker title bar and thin footer; lighter body; takeaway pills pin to the bottom above the footer. Title bar has a relevant Lucide icon (color on the icon only). Footer is **status · minutes** only — no path index and no module label (the section header already says where you are). The 2px border clips the inner bands to the same radius
- **Border colour means selection only** (next / current = teal). Status lives in the footer badge. Transfer and debug lessons get an amber or coral left stripe plus a type chip — never reuse the status colours for kind
- Status labels match grading: **Passed** (`checked`) and **Mastered** (`mastered`), not a single "Done". The filter that covers both is labelled **Finished**
- Section time is the **sum of its lesson minutes**, not a separate authored total that can drift high
- Filters: all / to do / finished — in the title row next to Export, not on a row of their own. Three pills and one button do not each earn a full-width band
- Primary action: **Install from ZIP** (subject *or* lesson). Copy explains that a zip is one folder of JSON + files
- Per pack: **Export ZIP**, open in Library tree
- Per lesson: overflow menu for **Export lesson ZIP**, **Restart lesson** (keep history), **Clear lesson history** (stronger confirm). Titles and progress stay on the card.
- A course with `diagnosticLessonId` (placement quiz) is a compact intro row, not a tall card grid, so the first teaching lessons sit higher. It still carries its section number (`1.1`) — a different shape, not a different kind of thing, and an unnumbered first section makes the chapter look like it begins at 1.2
- Invalid zip: which file / Zod path / zip safety rule failed; rest of library unchanged

## Studio

- Left: Markdown explain + predict prompt
- Right: **activity view** (`world-v1` graph/list/grid) **or** the shared `CodeEditor` (gutter, highlighting, click-to-error) **or** check UI
- React: tabs for files + Preview pane
- Top studio bar: icon Back / lesson title / **the pack title, centred** / icon **Run** (play) · icon Hint · icon Restart / icon Next (tooltips). The centred pack title answers "which course am I in" without going back to the Library; it ellipsises rather than pushing the controls around. **Submit lives only in the right (work) pane.** After a **correct** Submit, that same control becomes Next; an incorrect grade keeps Submit so they can change the answer and try again. On the last lesson the control is **Return to library** (never a dead Next), and the left pane shows Congratulations plus a first-try score (wrong then fixed is not 100%)
- Code lessons attach a **Console** under the editor. Empty until **Run**; then only the learner’s `console.log` / `print`. Hidden tests and Node stacks stay off that pane. Cartridge paths (`files/main.js`) are not shown
- Grade result lives in the **left** teach pane: large green check **Correct!** or red X **Incorrect!** — so the right-hand Submit control can become Next without moving. On a lesson with a question **and** a code/play task, one Submit grades both; Correct only when the question is right **and** the goals are met. While that single submission runs the control reads **Checking…** and is disabled, so a second click cannot start a second grade (D49). Submit is also held while a question on the lesson still has no answer — whether the code works is only knowable by running it, but a blank answer is visible without grading, so the button greys out and says why ("Answer the question on the left first") instead of spending an attempt (D55). If the runner itself fails, the pane says so as trouble to retry — not as a wrong answer (D50). When the lesson is not finished, the header Next reads **Skip ahead — this lesson stays unfinished**, and taking it awards nothing (D52)
- A graded question keeps its verdict **on the question**: the pick turns green or red, and the explanation sits under the choices. A missed answer is revealed in **amber** on a diagnostic only — on a graded check the learner retries, so that is the hint ladder's job. Choices stay clickable and any change puts the CTA back to Submit. A lesson of several questions (the placement quiz) gets **one tally** — `3 correct · 5 to review` — not a column of banners standing apart from the questions they judge (D56)
- Play grid: stone (or authored) floor on every cell, then kit sprites (fox, items, terrain). **SUCCESS / FAIL** overlay on the stage after Run — do not make the learner read Why to know the result
- After Check: **This · Last · Best** (score + independent/assisted). Time is secondary. Link to **snapshot**
- Check overflow: **Replace last run**
- TOC overflow: Restart lesson, Restart chapter, Clear history…, Export creation
- **Why** is a first-class pane (not a one-line toast): misconception or diagnostic question
- Do not auto-open Hint 5 (assist)

## Author

- Start: New or Open (pack cards, lesson title). Work: outline + one block + Details panel
- **Add a block** palette (Explain / Question kinds / world / code), not a type dropdown
- Top bar: title, Save, Play (Ctrl+S). JSON stays in Details
- How-to: [AUTHORING.md](AUTHORING.md)
- Optional “Draft with AI” (disabled until an endpoint is configured)

## Practice

- One item at a time, timer optional
- Prefer misconception follow-up copy (“You treated assignment as comparison”) over generic skill names
- After grade, short explain + Next

## Settings

- Appearance
- Editor (font size, tab width, keymap)
- Runtimes (Python path, show detected version)
- Play (sounds, HUD)
- Learners: current name, add, rename, switch (shared cartridges, separate progress)
- Trusted packs (imported code execution)
- Data: **Export settings**, **Import settings**, **Export setup** (settings + installed cartridges). Copy explains: another PC, same prefs/library; progress is not in this file; import will not silently overwrite; **execution trust is not imported**
- Privacy (empty)
- About: version, **userData path** (must match for `npm run dev` and the installed exe), Open userData folder, Open current learner folder

## Empty / error

- Missing Python: illustration + copy-paste install hints + Settings link
- Invalid pack: which file/Zod path failed
- Timeout: “your loop may not stop” + Restart exercise

## Motion

- Short (150ms) panel transitions
- Confetti **only** on mastery, and only if Settings allow
