# Content model (generalized LMS)

Packs are **data**. The app is an engine. A circuits pack and a Python pack share the same shells; only `engine` and block types differ.

A **cartridge** is a self-contained folder (or a `.zip` of that folder). The Library installs and exports cartridges. Learner progress never lives inside a cartridge.

## Principles

1. **JSON is the interchange format — and the AI format.** Humans use **Author** (forms; [AUTHORING.md](AUTHORING.md)). Manifests, tracks, courses, skills, misconceptions, creations, and lessons on disk are JSON with a **small closed vocabulary**. An author or a model should be able to emit a valid lesson from a template without inventing keys or embedding code. Prose is a string field (`md`, `promptMd`). Binary media are files **referenced** from JSON.
2. **Flexible subject, rigid shape.** Any subject is a sequence of known block types plus one reusable **activity** engine (`world-v1`). Do not add per-subject runtimes or `eval` of pack strings. Unknown block `type` values **soft-fail** (“update the app”).
3. **One folder, everything it needs.** Each subject-matter (pack) is an independent folder. Each lesson is an independent folder: `lesson.json` plus `files/`, `assets/`.
4. **Cartridges are immutable at runtime.** Progress, notes, drafts, snapshots, and creations live under `userData/learners/<learnerId>/`.
5. **The subject is playable.** The important loop is **predict → action → visible consequence → explanation**, not XP after a quiz. Quizzes and code editors are tools, not the product.

## AI-generable shape (keep this small)

A model (or a human) can produce a lesson if it follows these rules:

- Use only keys documented in this file. Extra keys are rejected by Zod (`strip` or fail-closed on unknown *required* shapes).
- Enums are closed (`type`, `kind`, `engine`, `op`, `reviewStatus`). No free-form engine names in v1.
- **No JavaScript/Python in JSON** for rules, graders, or views. `world-v1` is parts + connections + actions + `when`/`set` rules. Code lessons put source in `files/`, not in `eval` strings.
- Prefer a **template** (`authoring.templateId`) and fill prompts, answers, hints, assets, and a `world` object.
- One teaching idea per lesson. Typical length: 4–10 blocks.
- Ids: `kebab-case`, unique within the pack.

Minimal valid lesson (any subject):

```json
{
  "kind": "lesson",
  "schemaVersion": 1,
  "id": "brighter-lamp",
  "packId": "lawp.circuits.basics",
  "title": "Make the lamp brighter",
  "skillIds": ["circuits.series.current"],
  "estimatedMinutes": 8,
  "taskRev": 1,
  "blocks": []
}
```

Fill `blocks` from the catalog below. If a generator cannot express a simulation as `world-v1` rules, it must not invent a new engine — it should use `explain` + `check` + `predict` instead.

## On-disk layout

Bundled demo packs and user-installed packs use the **same shape**:

```
<packId>/
  pack.json
  skills.json                      # optional
  misconceptions.json              # optional; why answers go wrong
  tracks/<trackId>.json
  courses/<courseId>.json
  creations/<creationId>.json      # optional continuing artifact
  lessons/<lessonId>/
    lesson.json
    files/
    assets/
```

User installs land under `%APPDATA%\LAWP\packs/<packId>/`. Bundled demos stay under the **app** `resources/packs/<packId>/` (read-only, may change when the app is upgraded).

The Library is **not** a list compiled into the installer. Main **resolves** each `packId` every launch (below). `npm run dist` / the NSIS installer must not copy bundled packs into AppData and must not overwrite `settings.json`, `packs/`, or `learners/`.

### Resolve pack: overlay vs full override (D37)

Two user-side shapes. `pack.json` on disk in `userData/packs/<packId>/` **must** include `overlay: boolean`.

| User `pack.json` | How it got there | Resolved catalog |
| --- | --- | --- |
| `overlay: true` | Standalone **lesson** zip, or Author “add lesson to bundled pack” | **Merge at lesson grain:** bundled pack is the base (tracks, courses, other lessons). If `userData/.../lessons/<id>/` exists, that **entire lesson folder is atomic** — resolve **all** of that lesson’s files from the user folder only (no fall-through of leftover bundled tests/assets). Sibling bundled lessons **stay visible** |
| `overlay: false` | Full **subject** zip, or a shell created because **no** bundled pack exists | **Replace:** ignore bundled tree for this `packId`. Confirm on install: “This hides the bundled pack until you remove the user copy” |
| (no user dir) | — | Bundled pack as-is |

**Standalone lesson zip** (has `lesson.json`, no `pack.json` in the archive):

1. If a bundled pack exists for `lesson.packId` → write **only** `userData/packs/<packId>/pack.json` `{ kind, id, overlay: true, schemaVersion: 1 }` (create if missing; **do not** write a fake full manifest that omits courses) and `lessons/<lessonId>/`. Do **not** copy the rest of the bundled pack into AppData.
2. If no bundled pack and no user pack → create a **minimal full pack** (`overlay: false`) with that lesson **Unfiled**.
3. If a user full pack (`overlay: false`) already exists → add/replace `lessons/<lessonId>/` inside it (confirm if id exists). The full pack remains the whole catalog.

**Full subject zip** (has `pack.json`): always install as `overlay: false` (confirm if a user dir or bundled pack already exists).

`packs:get` / Library / Studio always see the **resolved** tree. Export lesson = that user (or bundled) lesson folder. **Export pack** and **setup-bundle pack zips** = the same **resolved** tree (`overlay: false` in the zip’s `pack.json`) so the archive is playable alone and re-imports as a full pack. Do **not** zip a raw overlay directory (that would install as a hollow replacement). Removing the user overlay directory restores the bundled pack in full.

Do **not** put `body.md` beside JSON. Do **not** put progress, notes, snapshots, or workspaces inside a pack or lesson folder.

### Lesson folder (independent)

```
lessons/brighter-lamp/
  lesson.json
  files/                 # optional (code / fixtures)
  assets/
    lamp.svg
```

Paths in JSON are **lesson-relative**.

### Standalone lesson zip

Archive root (or one wrapping folder) contains `lesson.json` with `kind: "lesson"` and `packId`. Install follows **Resolve pack** above (overlay onto bundled, or minimal full pack if nothing exists). A new lesson id that no course lists appears as **Unfiled** in Library.

## Zip contract

Recommended filenames: `{packId}.zip` or `{packId}__{lessonId}.zip`. Picker accepts any `.zip`. Optional filter: `*.lawp.zip`.

| Kind | Detected by | Installs as |
| --- | --- | --- |
| Subject-matter | `pack.json` with `kind: "pack"` | `userData/packs/<packId>/` |
| Lesson | `lesson.json` with `kind: "lesson"` | `userData/packs/<packId>/lessons/<lessonId>/` |

Detect archive root **or** a single top-level directory. Mixed archives → `zip-invalid`.

Export never includes learner progress, snapshots, or creations-in-progress (the **cartridge** export is author material only). Learner **creation export** is a separate action (see Creations).

Install: extract to temp → Zod-validate → move. Failure leaves the previous cartridge untouched.

Overwrite same id → confirm. Replacing a cartridge does **not** wipe progress.

### Zip safety (main)

- Reject `..`, absolute paths, and symlinks (`zip-unsafe`)
- Cap entry count, uncompressed size, and compression ratio
- After extract, every path must stay inside the temp root
- Unknown `schemaVersion` → refuse with a clear message

Packs that declare a **code** capability require a **trust** step on import (see [SECURITY.md](SECURITY.md)). `world-v1` / `engines: ["none"]` packs do not spawn processes.

## Identifiers

Stable `kebab-case` ids, unique within a pack. Progress keys **`learnerId + packId + lessonId`** (+ `blockId` / `creationId`). Breaking task changes bump `taskRev`.

## Manifest (`pack.json`)

```ts
{
  kind: "pack"
  id: string
  schemaVersion: 1
  title: string
  description: string
  subjects: string[]          // e.g. ["science", "circuits"] or ["programming"]
  category?: string           // Library shelf: Electricity, Programming, Learning…
  cover?: string              // pack-relative photo, default assets/cover.png
  engines: Array<"none" | "python" | "javascript" | "react">
  overlay?: boolean           // user copies only; see Resolve pack
  capabilities?: {            // must match lessons — see SECURITY
    execute: "none" | "python" | "javascript" | "react"
    network: false            // v1: always false
  }
  version: string             // semver
  locale: "en"
  authors: string[]
  tracks: string[]
  authoring?: AuthoringMeta
}
```

`engines: ["none"]` is first-class (circuits, probability, languages, history). Coding engines are optional.

## Track / course / module

```ts
// tracks/<trackId>.json
{ id, title, courseIds: string[], intro?: string }

// courses/<courseId>.json
{
  id, title, level: "beginner" | "intermediate" | "advanced"
  estimatedMinutes: number
  modules: { id, title, lessonIds: string[] }[]   // chapter = module
  skillIds: string[]
  diagnosticLessonId?: string
  creationId?: string         // one continuing creation for this course
}
```

## Lesson (`lesson.json`)

```ts
{
  kind: "lesson"
  schemaVersion: 1
  id: string
  packId: string
  packTitle?: string
  engines?: Array<"none" | "python" | "javascript" | "react">
  courseId?: string
  moduleId?: string
  title: string
  description?: string        // Library card: one or two sentences, no code
  skillIds: string[]
  estimatedMinutes: number
  taskRev: number
  speedMatters?: boolean      // default false — do not rank “best” by duration
  creation?: { id: string, step: number, briefMd: string }
  blocks: Block[]
  mastery?: {
    requiresTransfer: boolean
    minCorrectIndependent: number   // independent = no assist hints / no reveal
  }
  authoring?: AuthoringMeta
}
```

### Authoring metadata (cartridge, not progress)

```ts
type AuthoringMeta = {
  templateId?: string         // e.g. "activity-experiment"
  sources?: { title: string, url?: string, note?: string }[]
  reviewStatus?: "draft" | "needs-review" | "approved"
  generatedBy?: "human" | "ai"
}
```

Preserve `sources` and `reviewStatus` through AI draft → human edit → export. Ordinary learning never requires a network or a model.

## Blocks

Discriminated union `type`. Unknown types soft-fail.

File paths are **lesson-relative**.

Shared optional fields on interactive blocks: `id`, `skillIds`, `hintLadder`, `misconceptionMap`.

### Hint ladder

```ts
type Hint = {
  level: 1 | 2 | 3 | 4 | 5
  kind: "concept" | "assist"   // 1–3 default "concept"; 4–5 default "assist"
  md: string
}
```

- **Concept** (orient, rule, different example): always free. Does not mark the attempt assisted. No XP tax.
- **Assist** (scaffold, full solution): marks the attempt `assisted` / `revealed`. Mastery needs a later **independent** pass.

Never jump to level 5 on first click. The Why panel can offer the next **concept** hint without opening assist.

### `explain`

`{ type: "explain", md: string, assetIds?: string[] }`

### `check`

Closed kinds live in `src/shared/check.ts` (`CHECK_KINDS`). Adding a kind requires a grader case, an Author form, a Studio widget, **and** a lesson in pack `lawp.learning.questions`. Humans build these in Author — see [AUTHORING.md](AUTHORING.md).

```ts
{
  type: "check"
  id: string
  promptMd: string
  kind: "mcq" | "multi" | "odd" | "tf" | "image" | "short" | "select" | "numeric" | "fix"
      | "cloze" | "bank" | "match" | "order" | "place" | "hotspot" | "gorder"
      | "bins" | "venn" | "hottext" | "table" | "tier" | "slider" | "numberline" | "listen"
  choices?: { id: string, md: string, misconceptionId?: string, image?: string }[]
  left?: Choice[]             // match
  right?: Choice[]
  blanks?: { id: string, choices?: Choice[] }[]   // cloze; prompt uses {{id}}
  pieces?: Choice[]           // bank, place, bins, venn
  bins?: Choice[]
  sets?: Choice[]             // venn (two)
  rows?: Choice[]             // table
  reasons?: { id, md, when?: string[] }[]         // tier
  slots?: { id, x, y, w?, h?, label? }[]          // place, hotspot, gorder (x/y in %)
  image?: string              // assets/…
  audio?: string              // listen
  starter?: string            // fix
  unit?: string
  min?: number
  max?: number
  step?: number
  answer: unknown             // see below
  explainMd?: string
  skillIds: string[]
  diagnostic?: boolean
}
```

| Kind | `answer` |
| --- | --- |
| `mcq` `odd` `tf` `image` `hotspot` `hottext` `listen` | choice / slot / token id |
| `select` | choice id, or accepted `string[]` of ids |
| `multi` | `string[]` (order does not matter) |
| `order` `gorder` | `string[]` (order matters) |
| `match` `place` `cloze` `bank` `bins` `venn` `table` | `{ [leftOrBlankOrItem]: rightId }` |
| `tier` | `{ choice, reason }` |
| `short` `fix` | string or accepted `string[]` (folded + close spellings) |
| `numeric` `slider` `numberline` | number or `{ value, tolerance? }` |

`select` uses one dropdown (`________` or `{{a}}`) and `choices`. `cloze` / `bank` blanks in `promptMd` are `{{id}}`. `hottext` tokens are `[[id:word]]`. Main grades everything. Answers stay on disk and are stripped before the renderer.

### `predict` / `trace`

Prompt + expected value; lock in **before** the activity/code run. This is the first beat of predict → action → consequence.

### `activity` (playable subject)

One reusable engine in v1: **`world-v1`**. Not a general simulator. Enough for experiment / diagnose / construct / decide.

```ts
{
  type: "activity"
  id: string
  kind: "experiment" | "diagnose" | "construct" | "decide"
  engine: "world-v1"
  promptMd: string
  skillIds: string[]
  predict?: {                 // required for experiment; encouraged otherwise
    promptMd: string
    kind: "short" | "mcq" | "numeric"
    choices?: { id: string, md: string, misconceptionId?: string }[]
    answer?: unknown          // graded after the world run, or left open
  }
  world: WorldV1
  goal: { all?: Property[], any?: Property[], none?: Property[] }
  constraints?: Property[]    // e.g. current must stay ≤ 2
  explainAfter: { promptMd: string }
  hintLadder?: Hint[]
  misconceptionMap?: { when: Property, misconceptionId: string }[]
}
```

| Kind | Learner demonstrates | Example |
| --- | --- | --- |
| `experiment` | Cause and effect | Change resistance; lamp brightness changes |
| `diagnose` | Applying a mental model | Find the open switch / short |
| `construct` | Relationships | Assemble a series circuit that lights |
| `decide` | Consequences | Choose a fuse rating in a branching scene |

**Loop (required in the UI):** predict (if present) → learner action → world updates visibly → goal/constraints evaluated → explanation prompt / Why panel.

#### `world-v1` (closed vocabulary)

```ts
type WorldV1 = {
  parts: { id: string, type: string, props: Record<string, string | number | boolean> }[]
  connections: { from: string, to: string, via?: string }[]
  actions: {
    id: string
    label: string
    target: string
    op: "set" | "toggle" | "connect" | "disconnect" | "add" | "remove"
    key?: string
    values?: Array<string | number | boolean>
  }[]
  rules: {
    id: string
    when: Property[]
    set: { target: string, key: string, value: ValueOrExpr }[]
  }[]
  view: {
    kind: "graph" | "list" | "grid"
    assetMap?: Record<string, string>
    grid?: { cols: number; rows: number }   // default 5×5 when kind is grid
  }
}

type Property = {
  path: string                // "lamp.brightness" or "parts.lamp.props.on"
  op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "includes"
  value: string | number | boolean
}

type ValueOrExpr =
  | string | number | boolean
  | { op: "add" | "sub" | "mul" | "div"; a: string | number; b: string | number }
```

`path` / `a` / `b` refer to part props (`lamp.brightness`) or numbers. No pack-supplied functions.

`play` with `engine: "grid-js"` is a **view skin** of `world-v1` (`view.kind: "grid"`) plus fox/beacon assets — not a second platform.

Graphical **code** lessons opt in with `play` on the `code` / `debug` block (D43). Learner Python/JS calls `Player.move` / `rotate` / `scale` / `say` / `wait(ticks)`. App stubs append a command log; **main** applies that log to `world-v1` (clamp to `view.grid`, default 5×5) and grades the resulting world. `wait` does not move the fox; Studio replay delays that many ticks. Parts with `solid: true` block a step (the player stays put). Parts with `collect: true` set `taken: true` when the player steps on their cell. Unknown methods or bad args write a `fault` command — `passed` is false. Studio draws a default floor (`view.grid.floor`, else stone), then kit **PNG** sprites from `assetMap` or the built-in play kit (`src/shared/playKit.ts`, `resources/play/assets`). Grid size is any rectangle **1–64** on each side. Cells stay at native bitmap size and **only scale down** so the whole board fits the pane. Axis labels, a facing readout, and a live checklist come from `play.goal`. `play.guided: true` keeps compass copy visible (intro). Puzzle lessons omit `guided` and put the route on Hint. Missing kit type → typed tile, no invented geometry. Circuits `view.kind: "graph"` is unchanged.

#### `world-v1` semantics (normative)

Implement these rules. The **brighter-lamp** example below is the conformance test.

**Tick after each learner action**

1. Apply the action (mutate parts/connections).
2. Clear `run.calcFault` at the **start** of the rule pass, then run `rules` **in listed order**. Each rule: if every `when` Property is true **against the world as it is now**, apply all of that rule’s `set` rows (still in order). Later rules **see** values written by earlier rules in the same tick. If any `ValueOrExpr` faults (below), set `run.calcFault` and skip that `set` row only.
3. Evaluate `goal` and `constraints` on the resulting world. Record `constraintOk` (final) and `constraintEverFailed` (true if any tick this `runId` failed a constraint).
4. Push a view model from `view` (below).

**Paths.** `lamp.brightness` means `parts` id `lamp` → `props.brightness`. Missing part or key: the Property is **false**; a `set` **creates** the key on an existing part. `set` on a missing part is a no-op (do not throw).

JavaScript `code` blocks may also: boot as **ESM** when the entry is `.mjs` or files use `import`/`export`; run a **hidden `js-assert`** after the learner entry (visible stdout or play plus hidden); grade **DOM** fixtures with happy-dom in main (`preview.kind: "iframe"` is display-only); and use an app **`fetch` stub** that reads lesson fixture JSON (no network). Optional `argv` / `env` on the block are passed to the sandbox process.

**ValueOrExpr.** `a` / `b` that are strings are paths; numbers are literals. **v1 numbers are IEEE floats.** Division by zero (or non-finite result): skip that `set` row, do not throw, set **`run.calcFault = "div-by-zero"`** (a field on the **run** in main — not a synthetic `_engine` part, not a pack-visible world prop). Other arithmetic is ordinary IEEE floats.

**Calculation fault (normative).** `run.calcFault` is `null` or `"div-by-zero"`. It is recomputed **each tick** (cleared at step 2, set if that tick faults). A later valid action that completes the rule pass with no fault **clears** it — stale derived props then update. **`passed` is always false while `run.calcFault !== null`**, even if leftover `current` / `brightness` still look like a win. Do not grade a faulted world as success.

**Actions and payloads** (`run:activity` `payload` is optional; defaults from the action)

| `op` | Requires | Effect |
| --- | --- | --- |
| `set` | `target`, `key`, `payload.value` or first of `values` | `parts[target].props[key] = value` (must be in `values` if that list is present) |
| `toggle` | `target`, `key` | Flip boolean; missing key becomes `true` |
| `connect` | `payload.from` + `payload.to` (or `target` as `from` and `payload.to`) | Append `{ from, to, via? }` if not already present |
| `disconnect` | same ends | Remove matching connection |
| `add` | `payload.part: { id, type, props }` | Append part if `id` unused; else no-op |
| `remove` | `target` or `payload.id` | Delete that part and any connection that mentions it |

Unknown `actionId` → `validation`. Payload that fails the table → `validation`.

**Constraints vs Check**

- Activity field `constraintMode`: `"final"` (default) | `"always"`.
- **Grade / Check** uses the world **and** `calcFault` main holds for this `runId` after the last tick.
- `passed` = `calcFault === null` **and** goal satisfied **and** (`constraintMode === "final"` ? constraints hold now : `constraintEverFailed === false`).
- Intermediate over-limit with `"final"` can still pass if they turn the knob back; Why may still show `constraintEverFailed` + misconception.

**View.** `view.kind: "graph"` draws each part as a node, each connection as an edge. `assetMap` keys: `"<type>"` or `"<type>@<key>=<value>"` (more specific wins). Missing asset: show `type` and all props as text. Bind brightness/position/labels **only** from `props` (`brightness`, `x`, `y`, `label` if present). Do not invent geometry.

#### Reference cartridge: brighter-lamp

Conformance: `run:start` copies `world` then runs **rules once with no action** (so derived props match). `calcFault` is `null`. Start: `ohms=2`, `current=0.5`, `brightness=1`. Experiments **must** include `predict` (this one does).

```json
{
  "type": "activity",
  "id": "brighter-lamp",
  "kind": "experiment",
  "engine": "world-v1",
  "promptMd": "Make the lamp brighter without letting current go above 2.",
  "skillIds": ["circuits.series.current"],
  "constraintMode": "final",
  "predict": {
    "promptMd": "If you lower resistance, what happens to current?",
    "kind": "mcq",
    "choices": [
      { "id": "up", "md": "Current rises" },
      { "id": "down", "md": "Current falls", "misconceptionId": "ignores-current-limit" },
      { "id": "same", "md": "Current stays the same" }
    ],
    "answer": "up"
  },
  "world": {
    "parts": [
      { "id": "battery", "type": "battery", "props": { "cells": 1 } },
      { "id": "resistor", "type": "resistor", "props": { "ohms": 2 } },
      { "id": "lamp", "type": "lamp", "props": { "brightness": 1, "label": "Lamp" } },
      { "id": "meter", "type": "meter", "props": { "current": 0.5 } }
    ],
    "connections": [
      { "from": "battery", "to": "resistor" },
      { "from": "resistor", "to": "lamp" },
      { "from": "lamp", "to": "battery" }
    ],
    "actions": [
      {
        "id": "set-ohms",
        "label": "Set resistance",
        "target": "resistor",
        "op": "set",
        "key": "ohms",
        "values": [0, 0.25, 1, 2, 4]
      }
    ],
    "rules": [
      {
        "id": "i-from-lookup",
        "when": [],
        "set": [
          { "target": "meter", "key": "current", "value": { "op": "div", "a": "battery.cells", "b": "resistor.ohms" } }
        ]
      },
      {
        "id": "bright-from-i",
        "when": [{ "path": "meter.current", "op": "gte", "value": 1 }],
        "set": [{ "target": "lamp", "key": "brightness", "value": 2 }]
      },
      {
        "id": "dim-from-i",
        "when": [{ "path": "meter.current", "op": "lt", "value": 1 }],
        "set": [{ "target": "lamp", "key": "brightness", "value": 1 }]
      }
    ],
    "view": {
      "kind": "graph",
      "assetMap": {
        "lamp@brightness=1": "assets/lamp-dim.svg",
        "lamp@brightness=2": "assets/lamp-bright.svg",
        "battery": "assets/battery.svg",
        "resistor": "assets/resistor.svg",
        "meter": "assets/meter.svg"
      }
    }
  },
  "goal": { "all": [{ "path": "lamp.brightness", "op": "eq", "value": 2 }] },
  "constraints": [{ "path": "meter.current", "op": "lte", "value": 2 }],
  "explainAfter": { "promptMd": "Why did brightness change?" },
  "misconceptionMap": [
    { "when": { "path": "meter.current", "op": "gt", "value": 2 }, "misconceptionId": "ignores-current-limit" }
  ]
}
```

`cells / ohms`: `1/2 = 0.5`, `1/1 = 1`, `1/0.25 = 4`, `1/4 = 0.25`, `1/0` → fault.

**Expected transitions** (from start unless “then”)

| Step | Action | After tick | `goalMet` | `constraintOk` | `calcFault` | Grade `final` | Grade `always` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | `set-ohms` `4` | `ohms=4`, `I=0.25`, `B=1` | false | true | null | fail | fail |
| B | `set-ohms` `0.25` | `ohms=0.25`, `I=4`, `B=2` | true | **false** | null | fail (constraint) | fail; `constraintEverFailed`; misconception `ignores-current-limit` |
| C | then `set-ohms` `1` | `ohms=1`, `I=1`, `B=2` | true | true | null | **pass** (recovered) | **fail** (ever-failed) |
| D | from start, `set-ohms` `1` | `ohms=1`, `I=1`, `B=2` | true | true | null | **pass** | **pass** |
| E | `set-ohms` `0` | `ohms=0`, `I` **unchanged**, `B` unchanged | (stale) | (stale) | `"div-by-zero"` | **fail** (fault) | **fail** (fault) |
| F | then `set-ohms` `1` | `ohms=1`, `I=1`, `B=2` | true | true | null | **pass** (fault cleared) | fail if B occurred on this run; else pass |

Run two Check modes in tests: same actions B→C must pass under `constraintMode: "final"` and fail under `"always"`.

Renderer shows `lamp` with `assets/lamp-bright.svg` when `brightness===2`.

### `code` / `debug`

```ts
{
  type: "code" | "debug"
  engine: "python" | "javascript" | "react"
  files: {
    path: string
    role: "edit" | "ro" | "hidden-test" | "fixture"
    contents?: string
  }[]
  entry?: string
  timeoutMs: number
  checks: CodeCheck[]
  hintLadder: Hint[]
  preview?: { kind: "none" | "iframe" }
  promptMd?: string
  play?: {
    api: "player-v1"
    playerId?: string          // default "fox"
    world: WorldV1             // view.kind: "grid"
    goal: { all?: Property[], any?: Property[], none?: Property[] }
    constraints?: Property[]
    scaleValues?: number[]
    guided?: boolean          // intro: keep compass copy visible
  }
}

type CodeCheck =
  | { type: "stdout"; equals: string; misconceptionId?: string }
  | { type: "stdout-regex"; pattern: string; misconceptionId?: string }
  | { type: "python-assert"; file: string; misconceptionId?: string }
  | { type: "js-assert"; file: string; misconceptionId?: string }
  | { type: "ast"; language: "js" | "py"; query: string; misconceptionId?: string }
  | { type: "react-test"; file: string; misconceptionId?: string }
```

`debug` is `code` with a broken starter and a narrative. Prefer mapping failing checks to `misconceptionId`.

### `project` / creation steps

A one-off workspace template in the lesson folder. For **continuing** work, set `lesson.creation` and put the durable copy under the learner’s `creations/` tree (same folder across lessons).

A creation step should usually: add a capability, or **stage a failure** that the next concept fixes, or ask for an unfamiliar adaptation.

### `reflect`

`{ type: "reflect", promptMd: string }` — stored in the learner profile (often the “explain why it happened” beat).

## Skills

`skills.json`:

```ts
{ id: "circuits.series.current", title: "Current in a series loop", prereqIds: string[] }
```

## Misconceptions

`misconceptions.json` — why an answer is wrong, not only which skill failed.

```ts
{
  id: "assign-vs-compare"
  title: "Confuses assignment with comparison"
  skillIds: ["python.control.if"]
  followUpLessonId?: string
  diagnosticBlockId?: string    // a check with diagnostic: true
}
```

When a distractor or failed check has `misconceptionId` and evidence is **clear**, the Why panel names that misconception and offers the follow-up.

When evidence is **ambiguous** (several ids, or none), do **not** declare a diagnosis — queue the `diagnostic` check instead.

Practice queue prefers: misconception follow-up → weak skill → spaced review. Repeating another generic “loops” item is the fallback, not the first choice.

## Creations (continuing artifact)

`creations/<creationId>.json`:

```ts
{
  id: string
  title: string
  briefMd: string
  exportKinds: Array<"folder" | "zip">
  steps: { lessonId: string, addsMd: string }[]
}
```

Learner files: `userData/learners/<id>/creations/<packId>/<creationId>/`.

Export **out of LAWP** (folder or zip the learner chooses) is a first-class Studio/Projects action. The session should end with a visible new capability (“the lamp is now dimmable”), not only a progress bar.

v1 example (React later): one personal app that gains filter → edit → persist → errors. v1 spike (circuits): a circuit the learner keeps and exports as JSON + a simple diagram snapshot.

## Learner progress (not a cartridge)

```
%APPDATA%\LAWP\learners\<learnerId>\
  profile.json
  progress\
    <packId>\
      pack-progress.json
      evidence\
        <lessonId>.json        # durable mastery + historical bests (never dropped)
      attempts\
        <lessonId>.json        # bounded activity log (last 200)
      misconceptions.json      # counts + last diagnostic
  snapshots\
    <packId>\<lessonId>\<attemptId>\   # graded submissions only
  notes\
  drafts\
  workspaces\                  # one-off project copies
  creations\                   # continuing artifacts
```

### Two stores (do not conflate)

| Store | Bound | Purpose |
| --- | --- | --- |
| **Activity log** | Last **200** attempts per lesson; oldest dropped; `truncated: true` | This vs last, recent timeline |
| **Evidence** | Durable; not truncated | First check, independent mastery, historical **best**, misconception hits, creation step |

“Keep every run” applies until the activity-log cap. **Grades and bests are not stored only in that log.**

### Grades ledger (durable, D41)

`evidence/<lessonId>.json` holds a **compact ledger** of graded submits (not every Run):

```ts
type GradeRow = {
  attemptId: string
  at: string
  blockId: string
  taskRev: number
  score: number
  assisted: boolean
  revealed: boolean
  passed: boolean
}

// last 50 grades for this lesson (evict oldest grade row only)
grades: GradeRow[]
```

Activity-log truncation **must not** delete `grades[]` rows. Every `grade:block` appends a row (or replaces the last row if `replaceLast`).

**Derive, do not invent**

- `current` / `previous` = last two rows in `grades[]` (same `taskRev` as the lesson, else last two of that rev).
- After **delete-last**: remove that attempt from the activity log **and** from `grades[]` if present; then derive current/previous from remaining `grades[]`.
- After **replace-last**: overwrite that ledger row; derive again.
- **`best` is a stored value** `{ score, assisted, taskRev, attemptId? }`. After each ledger mutation: if `grades[]` is empty, clear `best`. Else set `best` to the D30 winner among **remaining `grades[]`**. Deleting the attempt that was best therefore yields the next-best **still in the ledger**, not a ghost from a discarded log line.
- High-water: if you need “best I ever did” after the 50th grade evicts an old row, keep `bestEver` as a **copy of the value** (score, assisted, taskRev) updated only when a new grade **beats** it (D30). `bestEver` is **not** cleared when `grades[]` evicts a row. `bestEver` **is** cleared on `history: clear`, or when delete/replace removes the attempt **and** `bestEver.attemptId` matches **and** no remaining `grades[]` row equals that value — then set `bestEver` to the D30 winner of `grades[]` (or clear).
- UI “Best” = `best` (from current ledger / current `taskRev`). Show `bestEver` as “best on record” if it differs.
- **First-try score** (end-of-path Congratulations) = `firstTries`: the first submit per check block. A later correct answer does not raise it to 100%. Persist this map so a trimmed `grades[]` cannot forget a miss.

**`taskRev` bump** (breaking task change on the lesson):

- Copy `{ taskRev, best, bestEver, fastest, independentPass, masteredAt, firstCheckedAt, firstTries, grades }` into `evidence.prior[oldRev]`.
- Set `evidence.taskRev` to the new rev.
- **Clear every current-revision achievement field:** `grades = []`, `best = undefined`, `bestEver = undefined`, `firstTries = {}`, `fastest = undefined`, `independentPass = false`, `masteredAt` / `firstCheckedAt` cleared, `currentGradeId` / `previousGradeId` cleared. `status = retrying` if it was checked/mastered, else `not-started`.
- Do **not** compare a new grade against `prior[oldRev].bestEver`. Old results stay readable only via `prior`.
- Old activity-log lines keep their `taskRev`. Mastery for the new rev requires a new independent pass. Compare “this vs last” only among grades with the **current** `taskRev`.

### Attempt record

```ts
type Attempt = {
  id: string
  runId: string                // bound at start; see IPC
  learnerId: string            // initiator — not “whoever is current at write time”
  at: string
  blockId: string
  kind: "run" | "grade" | "restart" | "activity"
  taskRev: number
  passed?: boolean
  checksPassed?: number
  checksTotal?: number
  score?: number               // 0–1 correctness
  assisted?: boolean
  revealed?: boolean
  hintLevel?: number
  durationMs?: number          // recorded, not used for default “best”
  timedOut?: boolean
  misconceptionIds?: string[]
  snapshotId?: string          // graded only
}
```

### Evidence / “best”

```ts
type LessonEvidence = {
  status: "not-started" | "in-progress" | "checked" | "mastered" | "retrying"
  taskRev: number
  grades: GradeRow[]           // last 50 graded; see D41
  firstCheckedAt?: string
  masteredAt?: string
  independentPass: boolean
  best?: { score: number, assisted: boolean, taskRev: number, attemptId?: string }
  bestEver?: { score: number, assisted: boolean, taskRev: number, attemptId?: string }
  firstTries: Record<string, { passed: boolean, score: number, attemptId?: string }>  // first submit per block; later pass does not overwrite
  prior?: Record<string, unknown>  // old taskRev snapshots
  fastest?: { attemptId: string, durationMs: number }
  previousGradeId?: string
  currentGradeId?: string
  misconceptionHits: { id: string, count: number }[]
}
```

**Best** = highest `score`, then **independent** over assisted. Do **not** break ties with `durationMs` unless `speedMatters`. Time can still be shown as “this vs last” information.

### Snapshots

On each **graded** submit (check, activity goal, code grade), store a local snapshot of answers / editable files (size-capped, e.g. 256 KiB total). Learners can open “what I submitted last time” vs “this time.” Not included in cartridge export. Optional delete with clear-history.

### Restart vs overwrite vs clear

| Action | IPC `history` | Default? | What happens |
| --- | --- | --- | --- |
| **Restart / redo** | `keep` | **Yes** | Restore starters; append `restart`; **log + evidence stay** |
| **Replace last** | `replaceLast: true` on next run/grade | No | Overwrite newest attempt of that kind **and** its ledger row; derive current/previous/best from `grades[]` |
| **Delete last** | `delete-last` | No | Drop newest attempt from log + ledger; derive from remaining `grades[]` (see D41). Never ask the truncated activity log for a missing best |
| **Clear history** | `clear` | No | Wipe log, snapshots, `grades[]`, `best`, `bestEver` in scope. Stronger confirm |

Scopes: `block` (exercise), `lesson`, `module` (chapter), `course`, `pack` (subject). `keepNotes` defaults true for block/lesson.

Restarting Alice never touches Bob. A run started as Alice still **writes as Alice** if the UI switches learner mid-run (`runId` + `learnerId` captured at start).

## Authoring workbench (in-app)

A **lightweight workbench** (not a full CMS):

1. Create a lesson from a **template** (`resources/templates/<templateId>.json`)
2. Edit prompts, answers, hints, assets, `world-v1`, misconception links
3. **`author:save`** persists the draft; **`author:importAsset`** copies into `assets/`
4. **Preview** the exact learner Studio (same block renderer)
5. **Validate**: Zod, broken asset paths, missing `misconceptionId`s, `followUpLessonId`, creation steps, prerequisite ids, capabilities vs engines
6. **Export** zip (same contract as Library)

Visual editor: form + live preview for all v1 block types (including activity view). Raw JSON remains available for power users and AI paste-in.

Optional **AI draft** (Author only, D23): user-provided endpoint; input = sources + objectives; output = draft `lesson.json` with `generatedBy: "ai"`, `reviewStatus: "needs-review"`, `sources` copied in. Learning stays offline. Never send pack filesystem paths automatically.

## Authoring rules

- One teaching idea per lesson
- Playable lessons include predict → action → consequence → explain (activity or code+predict)
- Every `code` lesson: ≥1 visible check and ≥1 hidden check
- ≥1 transfer lesson per module; ≥1 creation step per course that has a `creationId`
- Map common wrong answers to misconceptions; add a diagnostic when unsure
- No third-party copyrighted exercises
- Invalid cartridge = error card; rest of library still works
- A lesson folder must stand alone (no sibling-lesson imports)

## Versioning

App supports `schemaVersion: 1` only in v1. Future versions migrate or refuse with a clear message.
