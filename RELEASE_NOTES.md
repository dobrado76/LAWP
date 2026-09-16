# Release notes

This file is **what changed since the last MINOR bump**. Rewrite or prepend a new `## MAJOR.MINOR.0` section when `package.json` minor increases. The app shows that section once per learner profile session after the bump.

Patch releases do **not** belong here — use [CHANGELOG.md](CHANGELOG.md).

## 0.3.0 — 16 September 2026

Python grew from seven lessons into a full path, and every coding exercise now sits in a real editor.

### Python, zero to hero

114 lessons across six chapters: names and values, the fox on the grid, functions and closures, collections, errors you can recover from, text and regex, files and `pathlib`, the process, modules, objects, generators and decorators, async — then tests, logging, and a capstone field-station tool you keep.

Every coding lesson starts from a program that runs but does not yet work, and has a hidden test, a four-step hint ladder, and an answer that is checked against the real interpreter before it ships. No NumPy, pandas, machine learning, or web frameworks — this is the language itself.

### A real editor

Syntax highlighting, autocomplete, and a linter that names the fix rather than the symptom. A missing colon says which statement needs one. A single `=` in a condition says to use `==`. `print "x"` tells you to wrap the message in parentheses. A half-typed last line is treated as unfinished, not wrong, so the editor stops shouting while you type.

Autocomplete follows the language, so a Python lesson never suggests JavaScript's `await`. Files a lesson gives you to **read** — a module you are told to import, a log you are told to open — now appear under the editor instead of being invisible.

### Electricity, taught with pictures

23 circuits lessons: charge and current, open and closed loops, voltage, Ohm's law, series and parallel, power and heat, shorts and fuses, switches, and meters. Diagrams do the teaching, and the pictures used in questions no longer label the answer.

### Learn, then Try

A lesson that teaches and sets a task now opens on the theory, with worked examples as proper highlighted code blocks rather than loose backticks, and moves to the editor when you are ready.

### Fixed

Python grid lessons could not run at all — they failed on a missing module before your first line. Submitting a circuits question could blank the window. **Alt** shows the menu bar again, so Developer Tools is reachable.

### Honest limits

React lessons still run as Node — no iframe preview — and that pack is still a six-lesson stub. Author is a JSON workbench. Practice, XP, and certificates are not a live loop yet.

## 0.2.0 — 15 September 2026

LAWP is a local Windows learning studio. No account. Install it, or run `npm run dev`.

### Learn

Circuits: brighten a lamp without breaking the current limit.

JavaScript and Python: walk the fox to the beacon with `Player.move`, `rotate`, `scale`, and `say`. Edits persist when you change lessons. Restart puts starters back and keeps your history.

### See why

Misses map to a misconception or a diagnostic. Concept hints are free. Assist hints mark the attempt.

### Author and share

JSON cartridges. Zip install and export. Overlay a lesson or replace a full pack. Settings and an optional setup bundle move to another PC without taking progress.

### Stay local

Several named learners. `%APPDATA%\LAWP` is the same in `npm run dev` and the installed app. Reinstall does not wipe it.

### Editor

Highlighting, teaching diagnostics, Player autocomplete. A program that throws after reaching a goal does **not** pass. Grid lessons show stdout and stderr.

### Honest limits

React lessons still run as Node — no iframe preview. Author is a JSON workbench. Practice, XP, and certificates are not a live loop.
