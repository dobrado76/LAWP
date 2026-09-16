# Demonstration curricula

**Four original tracks.** The first is **not** programming: circuits prove the teaching loop and `world-v1`. Depth over breadth. Do **not** clone Codefinity chapter titles or exercises.

These are the tracks that exist. The rules a **new** subject must follow are in [COURSE_SPEC.md](COURSE_SPEC.md).

Estimated hours are learner-facing ranges, not marketing.

---

## Track 0 — Electricity: From charge to circuits (~3–6 h)

**Pack id:** `lawp.circuits.basics`  
**Engines:** `none` (`world-v1` only — no Python/Node)  
**Level:** thorough beginner (not electrical-engineer expert)  

### Goals

Build a durable mental model of charge, current, voltage, resistance, Ohm’s law, series and parallel, power/heat, opens and shorts, fuses, switches, and meters. Predict, change a live loop, **see** the lamp, explain why. Keep a circuit as a creation and export it.

Out of scope: Maxwell, phasors, Laplace, three-phase power, transmission lines, semiconductor physics, motor design.

### Path (locked by `tests/circuits-curriculum.test.ts`)

| Course | Lessons |
| --- | --- |
| Where you are | `circuits-placement` |
| Charge and the loop | `what-is-charge`, `current-is-flow`, `what-is-a-loop`, `open-means-dark`, `diagnose-dead-lamp` |
| Voltage as a difference | `voltage-is-a-difference`, `battery-as-push` |
| Resistance and Ohm’s law | `resistance-as-squeeze`, `ohms-law`, `brighter-lamp` (play-first experiment), `why-the-limit` |
| Series and parallel | `series-same-current`, `parallel-split`, `series-vs-parallel` |
| Power, shorts, and fuses | `power-and-heat`, `open-vs-short`, `why-a-short-hurts`, `transfer-fuse` |
| Control and keep | `switches-break`, `what-meters-do`, `series-parallel-mix`, `keep-your-circuit` |

Diagrams teach: pack `assets/*.svg` in explain (`![alt](assets/name.svg)`), image / hotspot / place checks, and `world-v1` graph view. Learn diagrams may label parts. Graded picture questions use unlabeled `*-quiz.svg` variants so the graphic does not name the answer. Monospace ` ```text ` loops when a picture is enough.

Misconceptions (authored, each used, each has a follow-up): current used up; voltage as stuff in the wire; open loop still lit; more cells always brighter; series/parallel swap; short as extra useful power; two metals required; fuse optional; switch as dimmer; and the original current-cap pair.

### Runtime notes

- No spawn. If `world-v1` cannot express a rule, author a lookup table — do not add a physics engine for v1.
- Conformance world and state table: **brighter-lamp** in [CONTENT_MODEL.md](CONTENT_MODEL.md).
- Graph view binds `assetMap` images and draws connections (D58). Pack `assets/` is the fallback when a lesson folder has no copy of the file.

---

## Track A — Python: Zero to hero

**Pack id:** `lawp.python.foundations` (progress keys stay on this id)  
**Engine:** `python`  
**Level:** absolute beginner → working Python developer (~80–100 h)  
**Story:** a field station with a fox, a grid, and a messy station log. Never ninja-sushi; that is not this product’s voice or anyone else’s IP.

A working Python developer can **predict** what the interpreter will do, **prove** it with a small program or a test, and **explain why** — including references and mutability, lazy iteration, decorators, the import system, and why a bare `except` is not error handling. Not a CPython contributor. Not a data scientist.

**In scope:** language semantics, collections, functions and scope, errors, text and regex, files and paths, the process, modules and packages, objects, iterators and generators, decorators, context managers, type hints, async, tests, logging, measurement, and basic security judgment.  
**Out of scope:** NumPy / pandas / ML, web frameworks, native extensions, packaging to PyPI as a project. Do not stub empty courses for them.

### Path (locked by `tests/py-curriculum.test.ts`)

Six tracks, 13 courses, 114 lessons. Values → flow → functions comes before any collection; errors and files come before anything that writes to disk; the lazy version of an idea is always taught after the eager one.

| Track | Courses |
| --- | --- |
| Foundations | Where you are · Values you can see · Decisions and the grid · Functions you can reuse |
| Fluency | Data that becomes a path · Errors you can recover from · Text you can trust |
| Files and the machine | Files and the filesystem · The process your script lives in |
| Structure | Modules and packages · Objects that hold state |
| The language under the hood | How Python actually runs it · Waiting without blocking |
| Craft | Prove it, then ship it |

**Course 0 — Where you are.** `py-placement`: a ten-item skip-aware `check` battery (`type`, true division, string immutability, `range`, list aliasing, missing keys, `return` vs `print`, the mutable default, `is` vs `==`, generator exhaustion). No grid. Every question is `diagnostic`: attempting one completes it, a wrong answer never blocks Next.

**Course 1 — Values you can see.** Names, kinds, `int`/`float`, string immutability, f-strings, truthiness and `None`, `=` vs `==`, `==` vs `is`, boolean logic, and a classify transfer.

**Course 2 — Decisions and the grid.** `if`/`elif`/`else`, chained comparison, then the fox: `Player.move("east")` on a 5×5 grid. `for`/`range`, `while`/`break`, `continue` and `for…else`, nested loops, an off-by-one debug, and a patrol transfer.

**Course 3 — Functions you can reuse.** `def`/`return` vs `print`, defaults, keyword arguments, the **mutable default trap**, `*args`/`**kwargs`, scope and `global`, closures and `nonlocal`, `lambda` as a `key=`. Creation: the greeting bot.

**Course 4 — Data that becomes a path.** Lists and slices, aliasing vs copying, tuples and unpacking, `sorted` vs `.sort()`, dicts, `.get`/`setdefault`, sets, `Counter`, list and dict comprehensions, `zip`/`enumerate`, a list-of-dicts gradebook, and a grouping transfer.

**Course 5 — Errors you can recover from.** Read the last frame first; catch the exception you expect; `else`/`finally`; `raise` and a domain error; EAFP vs LBYL; a swallowed-error debug; `parse_int_safe` as the transfer.

**Course 6 — Text you can trust.** String methods, `split`/`join`, slicing, format specs, `re.search`, groups and `re.sub`, `str` vs `bytes`. Transfer: normalise the messy station log (creation step 1 of the log scrubber).

**Course 7 — Files and the filesystem.** `with open`, line-by-line reading, safe writes, `pathlib`, JSON round-trip, `csv`, globs. Creation: the log scrubber reads a file and writes a report.

**Course 8 — The process your script lives in.** `sys.argv` and the environment, exit codes and stderr, `datetime`, and what running another program means. Transfer: a reporting command (creation step 1 of the capstone).

**Course 9 — Modules and packages.** A file is a module; import forms; **importing runs the module**, which is what `if __name__ == "__main__":` is for; packages and `__init__.py`; a stdlib tour; virtual environments and dependency declaration (concept only — the sandbox has no network).

**Course 10 — Objects that hold state.** Class and instance, `__init__`, `self` as the first parameter, class vs instance attributes, `__str__`/`__repr__`, `__eq__`/`__hash__`, dataclasses, `@property`, inheritance, `super()` and the MRO, composition over inheritance, and a modelling transfer.

**Course 11 — How Python actually runs it.** References and `id`, mutability and aliasing, shallow vs deep copy, the iterator protocol, `yield`, generator pipelines, `itertools`, decorators (plain and parameterised), context managers, type hints as documentation rather than enforcement, and a lazy-reader transfer.

**Course 12 — Waiting without blocking.** Blocking vs waiting, `async def`/`await`, `asyncio.gather`, threads vs processes and the GIL, and a forgotten-`await` debug.

**Course 13 — Prove it, then ship it.** Arrange/act/assert on the **returned** value, fixtures and the hidden test as a contract, injecting the clock and the reader, docstrings as contracts, `logging` over `print`, measure before you optimise, `eval` and path traversal. Then the transfer and the **capstone**: the field station, assembled and tested.

### Authoring

The pack is generated: `node scripts/author-py-expert.mjs`. The path, skills, misconceptions, and creations live in `scripts/py-curriculum/structure.mjs`; one file per track holds the lessons. See [`scripts/py-curriculum/README.md`](../scripts/py-curriculum/README.md) for the contract the tests enforce — hidden test on every code block, a four-rung ladder whose assist rung is the whole working file, and a starter that runs cleanly while still failing.

`tests/py-lessons.test.ts` runs every assist solution and every starter through the real interpreter, so a lesson cannot ship with an unreachable answer or a starter that already passes.

### Runtime notes

- Discover `python` / `py -3` on PATH; Settings can set absolute interpreter
- Refuse Python 2
- Sandbox: see [SECURITY.md](SECURITY.md). The sandbox directory is the only one on `sys.path` (D59)
- Stdlib only (no pip install from lessons), no network, no `input()`

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

**Path order (locked, asserted by `tests/js-curriculum.test.ts`):** Foundations → Fluency → The page → The process → Language → Craft. Scope, errors, and the event loop are taught **before** the first page lesson, and the dense `internals` course comes **after** the web-facing work, so nobody meets proxies and weak collections before their first document tree.

### Course 0 — Placement (~25 min)

`js-placement` — skip-aware `check` battery: `typeof` / `===` / truthiness / closure sniff / `map` vs mutate / promise vs callback / `this` sniff / DOM query sniff. No grid. Every question is marked `diagnostic`: attempting one completes it, a wrong answer never blocks Next, and the wrong answer is restored on revisit.

### Course 1 — Values you can see (~4 h)

`values-and-typeof`, `names-let-const`, `strings-immutable`, `strings-and-templates`, `numbers-and-nan`, `triple-equals`, `truth-and-if`, `short-circuit`, `optional-chaining`, `transfer-classify-signal`.

Predict-heavy; tiny stdout; one “say the type” closer. String immutability and template interpolation are **two lessons**. Misconceptions: `null-is-object-ok`, `const-means-immutable`, `double-equals-is-fine`, `optional-chain-defaults`, `or-eats-zero`.

### Course 2 — Commands on the stage (~5 h)

`functions-call`, `beacon-call`, `return-not-print`, `parameters-and-defaults`, `loops-for`, `loops-while-break`, `switch-dispatch`, `keyed-beacon`, `debug-off-by-one-path`.

Grid first. Course id stays `signals`. `functions-call` names `module.exports` as harness plumbing in one line and defers modules to Course 10. `loops-while-break` also names `do…while`. Misconceptions: `print-is-return`, `off-by-one-inclusive`, `switch-without-break`.

### Course 3 — Data that becomes a path (~6 h)

`arrays-index`, `arrays-map`, `arrays-filter-find`, `arrays-reduce-once`, `objects-props`, `object-key-iteration`, `set-and-map`, `reference-vs-copy`, `destructure-spread`, `json-roundtrip`, `signal-log`.

Grid + stdout. One justified `reduce`. `arrays-filter-find` exercises both. `set-and-map` exercises both a Set and a Map. `json-roundtrip` parses a string held in the lesson — no `fs` before the Node track. Creation: signal log. Misconceptions: `arrays-are-copied-by-assign`, `map-mutates`, `for-in-yields-values`.

### Course 4 — Scope and functions as tools (~6 h)

`scope-and-tdz`, `closures-radio`, `stale-closure-debug`, `callbacks-as-commands`, `arrow-vs-function`, `higher-order-route`, `transfer-command-table`.

Grid for HOFs; predict for TDZ and arrow **syntax**. Arrow `this` is graded later, in `this-call-apply-bind`. Misconceptions: `closure-copies-value`. `arrow-is-just-shorter` follows up on the `this` lesson.

### Course 5 — Errors you can recover from (~3 h)

`throw-and-catch`, `finally-and-rethrow`, `custom-errors`, `debug-read-the-stack`.

Bad dir: catch, `say` the fault, still finish the goal.

### Course 6 — The language under the hood (~10 h) — taught **after** Courses 8–10

`coercion-to-primitive`, `prototypes-chain`, `new-and-create`, `classes-syntax`, `this-call-apply-bind`, `descriptors-get-set`, `symbols`, `weak-collections`, `iterators-for-of`, `generators`, `proxies-reflect`, `transfer-model-a-part`.

Predict + small objects; grid only where a part can be an instance. `classes-syntax` also names `extends` and `super`.

### Course 7 — Time: the event loop (~8 h)

`stack-vs-heap`, `macrotasks-timeout`, `microtasks-then`, `promises-states`, `async-await`, `async-errors`, `parallel-vs-sequence`, `promise-combinators`, `async-iterators`, `transfer-beacon-dispatch`, `debug-forgotten-await`.

Dispatch-desk `world-v1` first; timed fox walks use `Player.wait(ticks)` (D43). `macrotasks-timeout` has its own **two-lamp** desk (sync, then timeout) so the lesson never asks for an order its own desk calls a fault; the three-lamp desk belongs to `microtasks-then`. Misconceptions: `await-blocks-the-os`, `then-and-timeout-same-queue`, `all-settles-partly`.

### Course 8 — The page is a tree (~8 h)

`tree-not-string`, `query-and-update`, `create-and-remove`, `events-bubble`, `delegation`, `forms-and-input`, `prevent-default`, `a11y-name-and-role`, `xss-text-vs-html`, `transfer-filter-list-ui`, `creation-signal-board`.

Sandboxed fixture HTML + learner JS. Grade in main (happy-dom). Visual iframe is display-only. `events-bubble` also names the capture phase; `forms-and-input` also names `FormData`.

### Course 9 — Talking to servers (~5 h)

`http-as-messages`, `method-and-headers`, `fetch-ok-and-fail`, `json-body`, `abort-and-timeout`, `cors-mental-model`, `transfer-library-search`.

App `fetch` stub + fixture JSON. `capabilities.network: false` stays honest — no real network. `method-and-headers` also names `URL` / `URLSearchParams`. `json-body` is this course's productive failure: its starter is a **debug** block that really throws out of `res.json()`.

### Course 10 — The process (~8 h)

`process-argv-env`, `fs-read-write`, `paths-and-encoding`, `buffers-vs-strings`, `streams-idea`, `cjs-vs-esm-node`, `why-bundlers`, `modules-esm-files`, `error-first-and-promises`, `regex-lines`, `transfer-clean-a-log`, `creation-log-scrubber`.

Node sandbox already real. Files stay under the run cwd. ESM lessons use the ESM boot. The whole module story — CommonJS vs ESM, bundlers, multi-file ESM, dynamic `import()` — lives here, ahead of testing and the capstone. `regex-lines` comes before the log cleaner so the cleaner does not use patterns as unexplained magic.

### Course 11 — Craft (~8 h) + capstone

`assert-and-aaa`, `fixtures-and-hidden-tests`, `mocking-time-and-fs`, `ast-and-lint`, `proto-pollution`, `measure-then-change`, `jsdoc-contracts`, `transfer-test-the-fox`, `capstone-signal-ops`.

`ast` checks are substring stand-ins; the lint lesson says so. `measure-then-change` counts real operations from two runs rather than asking for a wall-clock guess. Capstone is multi-file: route module + log cleaner + hidden tests + Why writeup.

### Skills

`js.values`, `js.flow`, `js.functions`, `js.arrays`, `js.objects`, `js.closures`, `js.errors`, `js.proto`, `js.this`, `js.iter`, `js.async`, `js.modules`, `js.text`, `js.dom`, `js.events`, `js.http`, `js.node.fs`, `js.test`, `js.security`.

### Runtime notes

- Hidden `js-assert` on every `code` lesson (visible check + hidden check)
- ESM boot for `import` / `.mjs` (not `require()` only)
- `Player.wait(ticks)` is app-owned; stubs log `{ op: "wait", ticks }`; Studio replay delays
- DOM grade uses happy-dom **in main**; iframe is preview
- Mock `fetch` reads lesson fixtures; no internet
- Node `fs` is the existing sandbox — not an OS firewall
- Do not stub empty courses. A course is not in the Library until its lessons validate.

### Authoring bar for this pack (enforced by tests)

- Every assessed starter **fails its assessment** while **running cleanly** (exit 0, no uncaught error). Only lessons whose block is `debug` may throw, and those must.
- Every assist hint is the working solution; the suite runs all of them.
- No play lesson opens with every objective already satisfied.
- Every code block carries a four-rung hint ladder (orient → concept → different example → assist) with no 1→4 jump.
- Every lesson teaches (`explain`) and asks (`check` / `predict` / `activity`).
- Every explain (except the thin placement quiz) names the idea, why it bites, a **language-tagged fenced snippet**, the common mistake, and what Try asks — 90+ words of prose excluding the fence. Never a bare ` ``` ` with no language.
- Every authored misconception is reachable from a wrong answer, and every skill/misconception/creation reference resolves.
- **Concept-enforced assessment:** the prompt and hidden checks must require the lesson’s target construct (not a bare hardcoded return or a puzzle from another topic). Prefer signature/API contracts and banned shortcuts over opaque hash-only gates when the learner is still building the concept.
- **Topic-aligned puzzle:** the heading, the questions, and the code task must practice the same idea. If two ideas cannot share one puzzle, they are separate lessons (string immutability vs template interpolation).
- **Guided prompt:** state the return shape, the exact export name, and one concrete example so the Player can attempt without opening Hint 1.

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

1. **Circuits** — thorough-beginner electricity (diagrams + `world-v1`) + Author zip round-trip
2. **Python Course 1** — same Why / progress / creation shells
3. **JavaScript** — working-expert path (values through Node, DOM, tests) on the fox/beacon grid plus DOM/fetch harnesses
4. **React** — continuing creation (preview is still Node-backed; see [STATUS.md](STATUS.md))
5. **Question types** (`lawp.learning.questions`) — one lesson per `check` kind so widgets stay honest

How to add a lesson: [AUTHORING.md](AUTHORING.md).
