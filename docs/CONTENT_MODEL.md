# Content model (generalized LMS)

Packs are **data**. The app is an engine. A circuits pack and a Python pack share the same shells; only `engine` and block types differ.

A **cartridge** is a self-contained folder (or a `.zip` of that folder). The Library installs and exports cartridges. Learner progress never lives inside a cartridge.

## Principles

1. **JSON is the authoring format — and the AI format.** Manifests, tracks, courses, skills, misconceptions, creations, and lessons are JSON with a **small closed vocabulary**. An author or a model should be able to emit a valid lesson from a template without inventing keys or embedding code. Prose is a string field (`md`, `promptMd`). Binary media are files **referenced** from JSON.
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

User installs copy into `%APPDATA%\LAWP\packs/<packId>/`. Bundled demos stay under the **app** `resources/packs/<packId>/` (read-only, may change when the app is upgraded). If the same `packId` exists in both places, the **user copy wins**.

The Library is **not** a list compiled into the installer. Main unions the two roots **every launch**. `npm run dist` / the NSIS installer must not copy bundled packs into AppData and must not overwrite `settings.json`, `packs/`, or `learners/`. A newer app may show newer bundled demos; it must not replace a cartridge the user already installed or authored.

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

Archive root (or one wrapping folder) contains `lesson.json` with `kind: "lesson"` and `packId`. Missing pack → main creates a **minimal pack shell**. Unlisted lessons appear as **Unfiled**.

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
  engines: Array<"none" | "python" | "javascript" | "react">
  capabilities?: {            // default: infer from engines
    execute: "none" | "python" | "javascript" | "react"
    network: false            // v1: always false; do not claim otherwise
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

```ts
{
  type: "check"
  id: string
  promptMd: string
  kind: "mcq" | "multi" | "short" | "numeric" | "cloze" | "match" | "order"
  choices?: { id: string, md: string, misconceptionId?: string }[]
  answer: unknown
  explainMd?: string
  skillIds: string[]
  diagnostic?: boolean        // ask this instead of declaring a misconception
}
```

v1: main grades everything. Answers stay on disk.

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
  view: { kind: "graph" | "list" | "grid", assetMap?: Record<string, string> }
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

`path` / `a` / `b` refer to part props (`lamp.brightness`) or numbers. Main applies rules in listed order after each action. No pack-supplied functions. If the authored rules cannot compute a physics result, the author supplies a **lookup** via `when`/`set` rows (AI-friendly).

`play` with `engine: "grid-js"` is a **view skin** of `world-v1` (`view.kind: "grid"`) plus fox/beacon assets — not a second platform.

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

“Keep every run” applies until the log cap. **Bests and mastery are not stored only in the log** — copying them into `evidence/` means a truncated log cannot erase how well they once did.

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
  firstCheckedAt?: string
  masteredAt?: string
  independentPass: boolean
  best: {                      // learning performance
    attemptId: string
    score: number
    assisted: boolean          // independent beats assisted at the same score
  }
  fastest?: {                  // only if lesson.speedMatters === true
    attemptId: string
    durationMs: number
  }
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
| **Replace last** | `replaceLast: true` on next run/grade | No | Overwrite newest attempt of that kind; evidence recomputed |
| **Delete last** | `delete-last` | No | Drop newest attempt; recompute rollup |
| **Clear history** | `clear` | No | Wipe log + snapshots in scope; evidence reset in scope. Stronger confirm |

Scopes: `block` (exercise), `lesson`, `module` (chapter), `course`, `pack` (subject). `keepNotes` defaults true for block/lesson.

Restarting Alice never touches Bob. A run started as Alice still **writes as Alice** if the UI switches learner mid-run (`runId` + `learnerId` captured at start).

## Authoring workbench (in-app)

Not a deferred “full CMS.” v1 ships a **lightweight workbench**:

1. Create a lesson from a **template** (`resources/templates/<templateId>.json`)
2. Edit prompts, answers, hints, assets, `world-v1`, misconception links
3. **Preview** the exact learner Studio (same block renderer)
4. **Validate**: Zod, broken asset paths, missing `misconceptionId`s, `followUpLessonId`, creation steps, prerequisite ids
5. **Export** zip (same contract as Library)

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
