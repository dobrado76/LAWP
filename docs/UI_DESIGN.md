# UI design

Desktop **learning studio**, not a marketing site and not a code-editor clone of VS Code.

## Visual tone

- Dark default; light supported
- Accent: teal on indigo (matches the app icon)
- Dense enough for a 14" laptop; comfortable type (system UI + JetBrains Mono or Cascadia for code)
- Play HUD is a **thin top or corner widget**, not a cartoon theme overlaying every pane
- Icon: fox/owl geometric mark (see `build/icon.png`)

## Chrome

```
┌─ titlebar (native Windows) ─────────────────────────────────────┐
│ Home   Library   Practice   Author    [search]     XP/streak    Settings │
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
- After a pack: a numbered **tutorial path** (chapter → course → lesson). **Play next**. Later courses stay locked until the one above is done; **Skip ahead** if you want
- Do not dump every “beginner” lesson into one grid — values and the first commands come before lists
- Lesson cards: height follows the blurb; every card on a row matches the tallest. Darker title bar and thin footer; lighter body with a 2–3 sentence blurb; takeaway pills pin to the bottom above the footer. Title bar has a relevant Lucide icon (color on the icon only). Footer is one line: status + step, then module · minutes. The 2px border clips the inner bands to the same radius.
- Filters: all / to do / done
- Primary action: **Install from ZIP** (subject *or* lesson). Copy explains that a zip is one folder of JSON + files
- Per pack: **Export ZIP**, open in Library tree
- Per lesson: overflow menu for **Export lesson ZIP**, **Restart lesson** (keep history), **Clear lesson history** (stronger confirm). Titles and progress stay on the card.
- A course with `diagnosticLessonId` (placement quiz) is a compact intro row, not a tall card grid, so the first teaching lessons sit higher
- Invalid zip: which file / Zod path / zip safety rule failed; rest of library unchanged

## Studio

- Left: Markdown explain + predict prompt
- Right: **activity view** (`world-v1` graph/list/grid) **or** the shared `CodeEditor` (gutter, highlighting, click-to-error) **or** check UI
- React: tabs for files + Preview pane
- Top studio bar: icon Back / title / **Run** (code preview) · icon Hint · icon Restart / icon Next (tooltips). **Submit lives only in the right (work) pane.** After a **correct** Submit, that same control becomes Next; an incorrect grade keeps Submit so they can change the answer and try again. On the last lesson the control is **Return to library** (never a dead Next), and the left pane shows Congratulations plus a first-try score (wrong then fixed is not 100%)
- Code lessons attach a **Console** under the editor (`console.log` / `print` / errors). Opening the lesson runs the starter once so that output is visible; SUCCESS / FAIL only after the learner presses Run or Submit. Cartridge paths (`files/main.js`) are not shown
- Grade result lives in the **left** teach pane: large green check **Correct!** or red X **Incorrect!** — so the right-hand Submit control can become Next without moving
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
