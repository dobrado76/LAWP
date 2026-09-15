# Demonstration curricula

v1 ships **three original tracks**. They prove the LMS is general (same shells) and that code engines work. Depth over breadth. Do **not** clone Codefinity chapter titles or exercises.

Estimated hours are learner-facing ranges, not marketing.

---

## Track A — Python: Think, then run

**Pack id:** `lawp.python.foundations`  
**Engine:** `python`  
**Level:** beginner → early intermediate  

### Goals

Write small programs with real control flow, data, functions, errors, and files. Finish a **text adventure** and a **data-cleaning script** you could actually reuse.

### Diagnostic

15 items: types, `if`, `for`/`while`, lists vs dicts, function signatures, traceback reading. Skip or compress modules accordingly.

### Course 1 — The REPL in your pocket (~3–5 h)

| Module | Lessons (indicative) | Skills |
| --- | --- | --- |
| Values and names | Expressions vs statements; types; assignment; truthiness | `python.types.*` |
| Decisions | `if/elif/else`; compare vs assign; early return | `python.control.if` |
| Messages | f-strings; input; print as a *tool* not the program | `python.io.stdio` |
| First program | Mini: greeting bot with validation | transfer |

**Play block:** fox on a 5×5 grid; Python functions `move(dir)` — win by reaching beacons (teaches calling functions, not JS ninja IP).

### Course 2 — Loops and collections (~4–6 h)

| Module | Focus | Must include |
| --- | --- | --- |
| `for` over iterables | ranges, strings, lists | off-by-one predict blocks |
| `while` and exits | `break`/`continue` with a real reason | debug a runaway loop (timeout) |
| Lists | index, slice, mutate vs copy | |
| Dicts | keys, grouping | |
| Nested | list of dicts | transfer: gradebook |

Hidden tests: property “order independent when specified”.

### Course 3 — Functions and errors (~3–4 h)

Pure vs side-effect; arguments; defaults; `return` vs print; `try/except` that *handles*; raising.  
Capstone: `parse_int_safe`.

### Course 4 — Files and small tools (~3–4 h)

Read/write UTF-8 text under the **sandbox root only**. CSV-as-text.  
Project: clean a messy names list (fixtures in pack).

### Course 5 — Structure (~4 h)

Modules as files; simple classes (when state is natural); when *not* to use classes.  
Project: text adventure (rooms dict, parser). Mastery = new room added by learner without breaking tests.

### Out of v1 Python (leave as pack TODOs)

NumPy/pandas/ML. Mention in Library as “future pack”, do not stub empty courses.

### Runtime notes

- Discover `python` / `py -3` on PATH; Settings can set absolute interpreter
- Refuse Python 2
- Sandbox: see [SECURITY.md](SECURITY.md)
- Stdlib only in v1 tests (no pip install from lessons)

---

## Track B — JavaScript: Language of the web (without the framework)

**Pack id:** `lawp.javascript.foundations`  
**Engine:** `javascript`  
**Level:** beginner → intermediate  

### Goals

Values, equality, functions, arrays/objects, modules (ESM), DOM *ideas* in a tiny harness, async `fetch` against a **local mock**.

Avoid “Ninja collects sushi”. Use **signal beacons / fox** play engine (`grid-js`) for early functions/loops.

### Diagnostic

literals, `===` vs `==`, closures sniff, `map`/`filter`, promise vs callback sniff.

### Course 1 — Values and flow (~3 h)

`let`/`const`; primitives; strict equality; `if`; loops; truthy pitfalls (`0`, `""`). Predict-the-output heavily.

### Course 2 — Functions as values (~3 h)

Declarations vs expressions; arrow functions; scope; closures with a *purpose* (makeCounter).  
Play: commands as functions in an object map.

### Course 3 — Data (~4 h)

Arrays (immutability habit: `map`/`filter`/`reduce` with one reduce that is justified); objects; spread; destructure; JSON.parse/stringify errors.

### Course 4 — The DOM as a tree (~3 h)

Not a full browser unit: sandboxed HTML fixture + JS that queries/updates. Events: click, input.  
Transfer: filter a list UI.

### Course 5 — Async (~3 h)

`Promise`, `async/await`, error paths. Mock `fetch` in the harness.  
Project: tiny “library search” against fixture JSON.

### Course 6 — Modules and hygiene (~2 h)

ESM import/export; why bundlers exist (concept `explain`); `===` lint-ish AST check for `==` in learner file.

---

## Track C — React: UI as a function of state

**Pack id:** `lawp.react.foundations`  
**Engine:** `react`  
**Level:** assumes JS Course 1–3 (soft prereq; diagnostic can unlock)  

### Goals

Components, props, state, lists/keys, effects *when needed*, simple forms, lifting state. Preview iframe. Tests via a small harness (React Testing Library–style queries in the runner, or a LAWP wrapper).

**Not in v1:** Redux, MUI, Tailwind-as-curriculum (optional CSS modules only), React Router (one bonus lesson max).

### Course 1 — UI = f(data) (~3 h)

JSX; one component; props; composing. Predict: “what renders?”

### Course 2 — State (~4 h)

`useState`; updater form; lists; keys (why index is a trap — debug lesson); immutable updates.

### Course 3 — Interaction (~3 h)

Forms (controlled); lifting state; pass callbacks down.  
Project: todo with filter — transfer: “notes” app same skills.

### Course 4 — Effects, carefully (~2 h)

`useEffect` for syncing document title / fetch mock. Lesson on **when not to**.

### Course 5 — Mini app (~4 h)

Multi-file project: search + detail panel from fixture data. Mastery checklist + tests.

### React runner

- Compile learner files with an in-main or utility-process transform (esbuild) 
- Serve preview to a **sandboxed iframe** (`sandbox` + no node, no file://)
- Tests run in the same transform + jsdom-like or happy-dom in main/utility, **not** in the renderer

---

## Shared quality bar

Each course has:

- Diagnostic or explicit “skip to module”
- ≥1 debug lesson
- ≥1 transfer lesson
- ≥1 project
- Hint ladders on every `code` block
- Original prose at ~grade-8 clarity, no slang walls, no hustle-bro copy

## Authoring order when implementing

1. Python Course 1 fully playable (prove engine)
2. JS Course 1 + grid-js play
3. React Course 1 preview
4. Fill remaining courses behind the same shells
