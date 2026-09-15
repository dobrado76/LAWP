# Demonstration curricula

**Four original tracks.** The first is **not** programming: circuits prove the teaching loop and `world-v1`. Depth over breadth. Do **not** clone Codefinity chapter titles or exercises.

Estimated hours are learner-facing ranges, not marketing.

---

## Track 0 — Circuits: Cause and effect (~20–40 min)

**Pack id:** `lawp.circuits.basics`  
**Engines:** `none` (`world-v1` only — no Python/Node)  
**Level:** beginner  

### Goals

Predict how a simple series circuit behaves. Change it, **see** the lamp, explain why. Keep a circuit as a creation and export it.

### The 20-minute session

| Beat | Block | Notes |
| --- | --- | --- |
| Orient | `explain` | Battery, lamp, one knob (resistance or extra cell) |
| Predict | `predict` | “What happens to brightness if…?” |
| Experiment | `activity` `experiment` | Make the lamp brighter **without** exceeding a current constraint |
| Why | misconception or diagnostic | e.g. “more cells always means brighter” / “ignores the constraint” |
| Transfer | `activity` `experiment` or `construct` | New cover story, same properties |
| Keep | `creation` step | Export JSON + diagram snapshot |

Misconceptions (indicative): `more-cells-always-brighter`, `ignores-current-limit`, `open-loop-still-lit`.

Optional later in this pack (not required for the spike): `diagnose` a dead lamp; `decide` a fuse rating; `construct` a working series loop.

### Runtime notes

- No spawn. If `world-v1` cannot express a rule, author a lookup table — do not add a physics engine for v1.
- Conformance world and state table: **brighter-lamp** in [CONTENT_MODEL.md](CONTENT_MODEL.md).

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

### Not in this Python pack

NumPy / pandas / ML. Do not stub empty courses for them.

### Runtime notes

- Discover `python` / `py -3` on PATH; Settings can set absolute interpreter
- Refuse Python 2
- Sandbox: see [SECURITY.md](SECURITY.md)
- Stdlib only in v1 tests (no pip install from lessons)

---

## Track B — JavaScript: Working expert

**Pack id:** `lawp.javascript.foundations` (progress keys stay on this id)  
**Engine:** `javascript`  
**Level:** beginner → working expert (~80–100 h)  
**Story:** signal / fox / beacon. Never ninja-sushi. React is Track C, not this pack.

A working expert can **predict** what JS will do, **prove** it with a small program or test, and **explain why** — including coercion, `this`, the event loop, prototypes, and XSS. Not a V8 engineer. Not a React specialist.

**In scope:** language semantics, modules, async, DOM/events/fetch, Node `fs`/`path`/`process`, assertions, fixtures, basic security and performance judgment.  
**Out of scope:** writing an engine, WebGL/WebRTC/service workers as a track, TypeScript-as-product, cloud/DevOps.

The grid teaches sequence, reuse, and transformation of **write-only** `player-v1` commands (`move` / `rotate` / `scale` / `say` / `wait`). Conditionals live in JS; the stage shows the consequence. DOM, HTTP, event-loop order, modules, XSS, and prototype pollution are **not** faked as tiles.

### Course 0 — Placement (~25 min)

`js-placement` — skip-aware `check` battery: `typeof` / `===` / truthiness / closure sniff / `map` vs mutate / promise vs callback / `this` sniff / DOM query sniff. No grid.

### Course 1 — Values you can see (~4 h)

`values-and-typeof`, `names-let-const`, `strings-and-templates`, `numbers-and-nan`, `triple-equals`, `truth-and-if`, `transfer-classify-signal`.

Predict-heavy; tiny stdout; one “say the type” closer. Misconceptions: `null-is-object-ok`, `const-means-immutable`, `double-equals-is-fine`.

### Course 2 — Commands on the stage (~5 h)

`functions-call`, `beacon-call`, `return-not-print`, `parameters-and-defaults`, `loops-for`, `loops-while-break`, `keyed-beacon`, `debug-off-by-one-path`.

Grid first. Course id stays `signals`. Misconceptions: `print-is-return`, `off-by-one-inclusive`.

### Course 3 — Data that becomes a path (~6 h)

`arrays-index`, `arrays-map`, `arrays-filter-find`, `arrays-reduce-once`, `objects-props`, `reference-vs-copy`, `destructure-spread`, `json-roundtrip`, `signal-log`.

Grid + stdout. One justified `reduce`. Creation: signal log. Misconceptions: `arrays-are-copied-by-assign`, `map-mutates`.

### Course 4 — Scope and functions as tools (~6 h)

`scope-and-tdz`, `closures-radio`, `callbacks-as-commands`, `arrow-vs-function`, `higher-order-route`, `stale-closure-debug`, `transfer-command-table`.

Grid for HOFs; predict for `this` / TDZ. Misconceptions: `closure-copies-value`, `arrow-is-just-shorter`.

### Course 5 — Errors you can recover from (~3 h)

`throw-and-catch`, `finally-and-rethrow`, `custom-errors`, `debug-read-the-stack`.

Bad dir: catch, `say` the fault, still finish the goal.

### Course 6 — The language under the hood (~10 h)

`coercion-to-primitive`, `prototypes-chain`, `new-and-create`, `classes-syntax`, `this-call-apply-bind`, `descriptors-get-set`, `symbols`, `weak-collections`, `iterators-for-of`, `generators`, `proxies-reflect`, `transfer-model-a-part`.

Predict + small objects; grid only where a part can be an instance.

### Course 7 — Time: the event loop (~8 h)

`stack-vs-heap`, `macrotasks-timeout`, `microtasks-then`, `promises-states`, `async-await`, `async-errors`, `parallel-vs-sequence`, `async-iterators`, `transfer-beacon-dispatch`, `debug-forgotten-await`.

Dispatch-desk `world-v1` first; timed fox walks use `Player.wait(ticks)` (D43). Misconceptions: `await-blocks-the-os`, `then-and-timeout-same-queue`.

### Course 8 — The page is a tree (~8 h)

`tree-not-string`, `query-and-update`, `create-and-remove`, `events-bubble`, `delegation`, `forms-and-input`, `a11y-name-and-role`, `xss-text-vs-html`, `transfer-filter-list-ui`, `creation-signal-board`.

Sandboxed fixture HTML + learner JS. Grade in main (happy-dom). Visual iframe is display-only.

### Course 9 — Talking to servers (~5 h)

`http-as-messages`, `fetch-ok-and-fail`, `json-body`, `abort-and-timeout`, `cors-mental-model`, `transfer-library-search`.

App `fetch` stub + fixture JSON. `capabilities.network: false` stays honest — no real network.

### Course 10 — The process (~8 h)

`process-argv-env`, `fs-read-write`, `paths-and-encoding`, `buffers-vs-strings`, `streams-idea`, `cjs-vs-esm-node`, `error-first-and-promises`, `transfer-clean-a-log`, `creation-log-scrubber`.

Node sandbox already real. Files stay under the run cwd. ESM lessons use the ESM boot.

### Course 11 — Craft (~8 h) + capstone

`assert-and-aaa`, `fixtures-and-hidden-tests`, `mocking-time-and-fs`, `why-bundlers`, `modules-esm-files`, `ast-and-lint`, `proto-pollution`, `measure-then-change`, `jsdoc-contracts`, `transfer-test-the-fox`, `capstone-signal-ops`.

`ast` checks are substring stand-ins; the lint lesson says so. Capstone is multi-file: route module + log cleaner + hidden tests + Why writeup.

### Skills

`js.values`, `js.flow`, `js.functions`, `js.arrays`, `js.objects`, `js.closures`, `js.errors`, `js.proto`, `js.this`, `js.iter`, `js.async`, `js.modules`, `js.dom`, `js.events`, `js.http`, `js.node.fs`, `js.test`, `js.security`.

### Runtime notes

- Hidden `js-assert` on every `code` lesson (visible check + hidden check)
- ESM boot for `import` / `.mjs` (not `require()` only)
- `Player.wait(ticks)` is app-owned; stubs log `{ op: "wait", ticks }`; Studio replay delays
- DOM grade uses happy-dom **in main**; iframe is preview
- Mock `fetch` reads lesson fixtures; no internet
- Node `fs` is the existing sandbox — not an OS firewall
- Do not stub empty courses. A course is not in the Library until its lessons validate.

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
- ≥1 `activity` or `debug` (playable failure)
- ≥1 transfer lesson
- ≥1 creation step or project
- Hint ladders on interactive blocks (concept vs assist)
- Authored misconceptions on common wrong answers
- Original prose at ~grade-8 clarity, no slang walls, no hustle-bro copy

## Pack order (as shipped)

1. **Circuits** — playable non-code + Author zip round-trip
2. **Python Course 1** — same Why / progress / creation shells
3. **JavaScript** — working-expert path (values through Node, DOM, tests) on the fox/beacon grid plus DOM/fetch harnesses
4. **React** — continuing creation (preview is still Node-backed; see [STATUS.md](STATUS.md))
