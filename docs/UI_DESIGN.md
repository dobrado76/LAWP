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
│ Home   Library   Practice    [search]     XP/streak    Settings │
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

- Continue card (pack, lesson title, progress bar)
- Daily quest (time estimate)
- Weak skills (practice)
- Quest map thumbnail of current course

## Library

- Cards for installed subject-matters (packs) and their lessons
- Filters: subject, engine, level
- Primary action: **Install from ZIP** (subject *or* lesson). Copy explains that a zip is one folder of JSON + files
- Per pack: **Export ZIP**, open in Library tree
- Per lesson: **Export lesson ZIP**, **Restart lesson** (keep history), **Clear lesson history** (stronger confirm)
- Invalid zip: which file / Zod path / zip safety rule failed; rest of library unchanged

## Studio

- Left: Markdown explain + task prompt
- Right: Monaco or CodeMirror (pick one; **Monaco** preferred for Python/JS)
- React: tabs for files + Preview pane
- Footer: Run, Check, Restart exercise, Hint
- After Check (and optionally after Run): one line **This · Last · Best** (score / time / hints). Not a leaderboard — just you vs you
- Check overflow or a toggle: **Replace last run** (next submit overwrites instead of appending)
- TOC overflow: Restart lesson, Restart chapter, Clear history…
- Why panel slides up on failed check
- Do not auto-open Hint 5

## Practice

- One item at a time, timer optional
- After grade, short explain + Next

## Settings

- Appearance
- Editor (font size, tab width, keymap)
- Runtimes (Python path, show detected version)
- Play (sounds, HUD)
- Learners: current name, add, rename, switch (shared cartridges, separate progress)
- Privacy (empty)
- About: version, **userData path**, Open userData folder, Open current learner folder

## Empty / error

- Missing Python: illustration + copy-paste install hints + Settings link
- Invalid pack: which file/Zod path failed
- Timeout: “your loop may not stop” + Restart exercise

## Motion

- Short (150ms) panel transitions
- Confetti **only** on mastery, and only if Settings allow
