# Content model (generalized LMS)

Packs are **data**. The app is an engine. A history pack and a Python pack share the same shells; only `engine` and block types differ.

A **cartridge** is a self-contained folder (or a `.zip` of that folder). The Library installs and exports cartridges. Learner progress never lives inside a cartridge.

## Principles

1. **JSON is the authoring format.** Manifests, tracks, courses, skills, and lessons are JSON. Prose is a string field (`md`, `promptMd`, …), not a parallel `.md` tree. Binary media stay as files and are **referenced** from JSON.
2. **One folder, everything it needs.** Each subject-matter (pack) is an independent folder. Each lesson is an independent folder inside that pack, holding its JSON plus code, tests, images, video, and fixtures.
3. **Cartridges are immutable at runtime.** The app copies a zip into `userData/packs/` (or reads bundled `resources/packs/`). It never writes progress, notes, drafts, or XP into those folders.
4. **Progress is per learner.** Attempts, mastery, notes, and editor drafts live under `userData/learners/<learnerId>/`. Several local learners can share the same installed cartridges. Restart/redo does not delete history by default; clear/overwrite is explicit.

## On-disk layout

Bundled demo packs and user-installed packs use the **same shape**:

```
<packId>/                          # subject-matter cartridge
  pack.json                        # required — start here
  skills.json                      # optional skill graph
  tracks/
    <trackId>.json
  courses/
    <courseId>.json                # modules + lesson id lists live here
  lessons/
    <lessonId>/                    # one folder per lesson — zip-able on its own
      lesson.json                  # required — start here
      files/                       # starter code, fixtures, hidden tests
      assets/                      # images, webm/mp4, audio, diagrams
```

User installs copy into `%APPDATA%\LAWP\packs/<packId>/`. Bundled packs stay under `resources/packs/<packId>/` (read-only). If the same `packId` exists in both places, the **user copy wins**.

Do **not** put `body.md` beside JSON. Put Markdown in the JSON fields. Do **not** put `progress.json`, notes, or workspaces inside a pack or lesson folder.

### Lesson folder (independent)

A lesson folder is a complete teaching unit. Someone can zip just this folder and send it to another machine.

```
lessons/values-and-names/
  lesson.json
  files/
    main.py
    tests/
      test_hidden.py
  assets/
    names-diagram.png
```

`lesson.json` points at those files with **paths relative to the lesson folder** (`files/main.py`, `assets/names-diagram.png`). Small snippets may still use inline `contents` on a file entry; prefer real files once a lesson has more than a few lines.

### Standalone lesson zip

A lesson zip is that folder at the archive root (or one wrapping folder with the same name). It must contain `lesson.json` with `kind: "lesson"` and a `packId` so install knows where to place it.

If the destination pack does not exist yet, main creates a **minimal pack shell** from the lesson’s pack metadata (`packId`, `packTitle`, `engines`, …). Unlisted lessons show in Library under that pack as **Unfiled** until a course/module JSON includes their id.

## Zip contract

Recommended filenames: `{packId}.zip` or `{packId}__{lessonId}.zip`. The file picker also accepts any `.zip`. Optional filter alias: `*.lawp.zip`.

| Kind | Detected by | Installs as |
| --- | --- | --- |
| Subject-matter | `pack.json` with `kind: "pack"` | `userData/packs/<packId>/` (replace whole pack after confirm) |
| Lesson | `lesson.json` with `kind: "lesson"` | `userData/packs/<packId>/lessons/<lessonId>/` (replace that lesson after confirm) |

Detection looks at the archive root **or** a single top-level directory (zipping a folder in Explorer is the usual case). Mixed archives (two packs, or pack + stray files) are rejected with `zip-invalid`.

**Export** zips the folder as-is. It never includes learner progress, notes, drafts, or `userData` files. Bundled packs can be exported the same way (a copy, not a move).

**Install** is copy-then-validate: extract to a temp dir, Zod-validate, then move into `userData/packs/`. Failure leaves the previous cartridge untouched.

Overwrite: same `packId` / `lessonId` → confirm in the UI. Replacing a cartridge **does not** wipe progress. If `taskRev` rose, that lesson’s mastery may reset (see Identifiers); the learner can also reset by hand.

### Zip safety (main)

- Reject `..`, absolute paths, and symlinks (`zip-unsafe`)
- Cap entry count, uncompressed size, and compression ratio (zip bombs)
- After extract, every path must stay inside the temp root
- Unknown `schemaVersion` → refuse with a clear message

## Identifiers

Stable string ids, `kebab-case`, unique within a pack. Progress keys **`learnerId + packId + lessonId`** (and `blockId` where needed) so updating copy does not reset if ids hold. Breaking task changes bump `taskRev` (progress keeps history; mastery may reset that lesson).

## Manifest (`pack.json`)

```ts
{
  kind: "pack"
  id: string
  schemaVersion: 1
  title: string
  description: string
  subjects: string[]          // e.g. ["programming", "web"]
  engines: Array<"none" | "python" | "javascript" | "react">
  version: string             // semver
  locale: "en"
  authors: string[]
  tracks: string[]            // ids; files in tracks/<id>.json
}
```

## Track / course / module

These are JSON files in the pack. They **list** lesson ids; they do not embed lesson bodies.

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
}
```

`module` is the **chapter** in the UI (reset chapter = reset that module’s lessons).

## Lesson (`lesson.json`)

```ts
{
  kind: "lesson"
  schemaVersion: 1
  id: string
  packId: string
  packTitle?: string          // used when creating a pack shell on standalone install
  engines?: Array<"none" | "python" | "javascript" | "react">
  courseId?: string
  moduleId?: string
  title: string
  skillIds: string[]
  estimatedMinutes: number
  taskRev: number
  blocks: Block[]
  mastery?: {
    requiresTransfer: boolean
    minCorrectWithoutHint: number
  }
}
```

## Blocks

Discriminated union `type`. Unknown types must **soft-fail** (show “update the app”) rather than crash.

File paths on blocks are **lesson-relative**. Main resolves them against the lesson folder and rejects escapes (see [SECURITY.md](SECURITY.md)).

### `explain`

`{ type: "explain", md: string, assetIds?: string[] }`

`assetIds` are paths like `assets/loop.png` or ids mapped in an optional `assets` table on the lesson.

### `check`

```ts
{
  type: "check"
  id: string
  promptMd: string
  kind: "mcq" | "multi" | "short" | "numeric" | "cloze" | "match" | "order"
  choices?: { id: string, md: string }[]
  answer: unknown            // schema per kind; never shown to renderer until after reveal IPC
  explainMd?: string         // shown after submit
  skillIds: string[]
}
```

**Security:** correct answers live in the pack on disk (local app). Do not put secret answers in the renderer bundle separately — the user owns the machine. Still, the renderer should request `lesson:grade` from main rather than scoring MCQ in the client if we later add “honest exam” mode. v1: main grades everything.

### `predict` / `trace`

Prompt + expected value; optional reveal-run after lock-in.

### `code`

```ts
{
  type: "code"
  engine: "python" | "javascript" | "react"
  files: {
    path: string                 // lesson-relative, e.g. "files/main.py"
    role: "edit" | "ro" | "hidden-test" | "fixture"
    contents?: string            // optional inline; else read from path
  }[]
  entry?: string
  timeoutMs: number
  checks: Check[]
  hintLadder: { level: 1|2|3|4|5, md: string }[]
  preview?: { kind: "none" | "iframe" }  // react
}

type Check =
  | { type: "stdout"; equals: string }
  | { type: "stdout-regex"; pattern: string }
  | { type: "python-assert"; file: string }      // hidden test file (lesson-relative)
  | { type: "js-assert"; file: string }
  | { type: "ast"; language: "js" | "py"; query: string }  // v1: small allowlisted queries
  | { type: "react-test"; file: string }         // run in harness
```

### `debug`

Same as `code` with `broken` starter and a narrative.

### `project`

Workspace **template** lives in the lesson folder. Learner copies go under the **learner** tree (`userData/learners/<id>/workspaces/<packId>/<lessonId>/`), never back into the cartridge.

### `play`

```ts
{
  type: "play"
  engine: "grid-js" | "custom-iframe"
  win: Check[]
  world: unknown              // engine-specific, schema in pack
}
```

v1 implement `grid-js` (2D grid, learner functions called by harness) as the spiritual successor to “ninja/sushi” **without copying that IP**. Use original sprites/themes (e.g. fox collecting signal beacons). Sprite sheets live in the lesson (or pack) `assets/`.

### `reflect`

`{ type: "reflect", promptMd: string }` — stored in the learner profile.

## Skills

`skills.json` in the pack:

```ts
{ id: "python.loops.for", title: "for loops", prereqIds: string[] }
```

Practice queue is a function of **this learner’s** skill stats, not of course order.

## Learner progress (not a cartridge)

See also [ARCHITECTURE.md](ARCHITECTURE.md). Shape:

```
%APPDATA%\LAWP\learners\<learnerId>\
  profile.json                 # display name, createdAt
  progress\
    <packId>\
      pack-progress.json       # course/module rollups, XP for this pack
      lessons\
        <lessonId>.json        # rollup: status, current, previous, best, taskRev
      attempts\
        <lessonId>.json        # append-only list of runs and checks
  notes\
    <packId>\
      <lessonId>.json
  drafts\                      # editor buffers if not in session.json
  workspaces\
    <packId>\<lessonId>\
```

v1 stores these as **JSON**. The attempt file is the source of truth for “how did I do?”; the lesson file is a **rollup** for the Library and Home. SQLite is allowed later if the log is huge; the **folder contract** stays (nothing in the cartridge).

### Attempt log (keep every run by default)

Every **Run** and every **Check** appends one record. Restart/redo appends a `restart` marker. Do not overwrite a previous record unless the learner asked to.

```ts
type Attempt = {
  id: string
  at: string                   // ISO
  blockId: string
  kind: "run" | "grade" | "restart"
  taskRev: number
  passed?: boolean             // grade
  checksPassed?: number
  checksTotal?: number
  score?: number               // 0–1, checksPassed / checksTotal
  durationMs?: number
  hintLevel?: number           // highest hint opened for this attempt
  revealed?: boolean
  timedOut?: boolean
}

type LessonRollup = {
  status: "not-started" | "in-progress" | "checked" | "mastered" | "retrying"
  taskRev: number
  attemptCount: number
  current?: Attempt            // latest grade (or latest run if never graded)
  previous?: Attempt           // grade before current — for “this vs last”
  best?: Attempt               // highest score, then shortest durationMs
}
```

Cap: keep the last **200** attempts per lesson (oldest dropped; set `truncated: true` on the rollup). Comparison always uses the remaining current / previous / best.

**Compare** after a check: this attempt vs previous vs best (score, checks, time, hint level). Same data on the Progress screen as a short timeline. Do not store full source dumps in the attempt log (size + privacy); drafts already hold the editor buffer.

### Restart vs overwrite vs clear

Writes only under that learner’s folder. The cartridge is untouched. Confirm in the UI.

| Action | IPC `history` | Default? | What happens |
| --- | --- | --- | --- |
| **Restart / redo** | `keep` | **Yes** | Restore starters; status `retrying` / not-started; append `restart`; **log stays** so the next check compares to the last one |
| **Replace last** | (on next `run` / `grade`) `replaceLast: true` | No | Overwrite the most recent attempt of that kind on that block instead of appending |
| **Delete last** | `delete-last` | No | Drop the most recent attempt in scope; recompute rollup |
| **Clear history** | `clear` | No | Delete attempts + rollup in scope (clean slate). Stronger confirm |

Scopes for restart and for clear are the same:

| Scope | UI name |
| --- | --- |
| `block` | Exercise |
| `lesson` | Lesson |
| `module` | Chapter |
| `course` | Course |
| `pack` | Subject |

`keepNotes` defaults true for block/lesson; ask for course/pack. Clearing history never uninstalls the cartridge.

Several local learners share `userData/packs/`. Restarting or clearing Alice never touches Bob.

## Authoring rules

- One teaching idea per lesson
- Every `code` lesson has at least one **visible** check and one **hidden** check
- At least one transfer lesson per module
- No third-party copyrighted exercises
- Pack and lesson JSON validated with Zod on load; invalid cartridge = error card, rest of library still works
- A lesson folder must run after being copied alone into another pack with the same `packId` (no reaching into sibling lessons)

## Versioning

App supports `schemaVersion: 1` only in v1. Future versions migrate or refuse with a clear message.
