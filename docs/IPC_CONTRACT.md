# IPC contract

Preload exposes `window.lawp` only. Channel names are constants in `src/shared/ipc`. Payloads parsed with Zod in **main**.

Envelope: `Promise<Result<T>>` unless noted as event.

## Settings

| Channel | In | Out |
| --- | --- | --- |
| `settings:get` | — | settings object |
| `settings:update` | partial | settings object |
| `settings:export` | `{ includeCartridges?: boolean }` | save dialog → `lawp-settings.json` or `lawp-setup.zip`; `{ cancelled, path? }` |
| `settings:import` | — | open dialog → merge after confirm; `{ cancelled, settings?, packsImported?: string[], skipped?: string[] }` |

Export writes **`settingsSchema`** plus `schemaVersion` / `kind`. Strip `window-state`, `session`, and secrets (`safeStorage` keys) unless the user opts into “include secrets.” `includeCartridges: true` adds each `userData/packs/<packId>` as a zip inside a **setup bundle** (`kind: "setup"`). Bundled app demos are **not** copied (the other PC already has them if they installed LAWP). Learner progress is **never** included.

Import **merges**. Existing `settings.json` keys are replaced only after confirm. Existing `userData/packs/<packId>` is skipped or replaced only after confirm — never silent overwrite. **Drop `trustedExecutions` on import** (D39). If an imported Python path does not exist on this machine, keep the value but flag `runtime-missing` and re-detect when possible.

## Session / window

Window geometry is **not** IPC from the renderer; main tracks the `BrowserWindow`.

| Channel | In | Out |
| --- | --- | --- |
| `session:get` | — | session |
| `session:set` | session patch | session |

## Learners

Local profiles only. Switching learner does not move or copy cartridges.

| Channel | In | Out |
| --- | --- | --- |
| `learners:list` | — | `{ currentId, learners: { id, displayName }[] }` |
| `learners:create` | `{ displayName }` | learner |
| `learners:switch` | `{ learnerId }` | `{ currentId }` |
| `learners:rename` | `{ learnerId, displayName }` | learner |

## Packs / catalog

Cartridges are folders of JSON + assets. Import/export are **zip** only (folder drop can wait).

| Channel | In | Out |
| --- | --- | --- |
| `packs:list` | — | summaries[] |
| `packs:get` | `{ packId }` | pack tree |
| `packs:lesson` | `{ packId, lessonId }` | lesson **without** hidden tests & answers stripped for display; `hasHiddenChecks: true` |
| `packs:importZip` | `{ replace?: boolean }` | file picker → validate → install; `{ kind: "pack" \| "lesson", packId, lessonId?, overlay: boolean }` |
| `packs:exportZip` | `{ packId, lessonId? }` | save dialog → zip cartridge only; `{ cancelled, path? }` |
| `packs:reload` | — | summaries[] |

Lesson zip + existing bundled pack → **overlay** (`overlay: true`); does not hide other bundled lessons. Full pack zip → `overlay: false` (confirm: hides bundled pack). `replace: true` only after UI confirm when a user file already exists. Conflict without replace → `cartridge-conflict`.

`packs:get` returns the **resolved** tree (merge or full user pack). See [CONTENT_MODEL.md](CONTENT_MODEL.md) Resolve pack.

## Progress

Reads default to the **current** learner. Writes from a run use the **`learnerId` captured at `run:start`**, not whoever is current when the process exits. Never accept a pack filesystem path.

| Channel | In | Out |
| --- | --- | --- |
| `progress:get` | `{ packId?, learnerId? }` | snapshot (evidence + current/previous/best ids) |
| `progress:attempts` | `{ packId, lessonId, blockId? }` | `{ attempts: Attempt[] }` |
| `progress:snapshot` | `{ packId, lessonId, attemptId }` | `{ files?: { path, contents }[], answers?: unknown, world?: unknown }` |
| `progress:note` | `{ packId, lessonId, text }` | ok |
| `progress:reset` | `{ packId, scope: "block" \| "lesson" \| "module" \| "course" \| "pack", history?: "keep" \| "delete-last" \| "clear", lessonId?, moduleId?, courseId?, blockId?, keepNotes?: boolean }` | snapshot |
| `practice:next` | — | queue items[] (misconception follow-ups first) |

`progress:reset` `history` defaults to **`keep`** (restart/redo). `clear` deletes the attempt log, snapshots, and grades ledger in scope. `delete-last` drops the newest attempt from the log **and** the grades ledger, then derives current/previous/best from remaining ledger rows (D41). Activity-log truncation must not delete ledger rows.

## Run / grade

| Channel | In | Out |
| --- | --- | --- |
| `run:start` | `{ packId, lessonId, blockId }` | `{ runId, learnerId }` — copies activity `world` into the run; bind before spawn or activity step |
| `run:code` | `{ runId, packId, lessonId, blockId, files: {path, contents}[], replaceLast?: boolean }` | `{ stdout, stderr, exitCode, timedOut, durationMs, compare? }` |
| `run:activity` | `{ runId, packId, lessonId, blockId, actionId, payload? }` | `{ world, goalMet, constraintOk, constraintEverFailed, misconceptionIds?, compare? }` |
| `run:cancel` | `{ runId }` | ok |
| `grade:block` | `{ runId, packId, lessonId, blockId, files?, answers?, replaceLast?: boolean }` | `{ passed, checks[], hintEligible, misconceptionIds?, diagnostic?, compare, snapshotId? }` |
| `hint:get` | `{ runId, packId, lessonId, blockId, level }` | `{ md, level, kind: "concept" \| "assist" }` records usage on **that** run |

`run:code` / `grade:block` that would spawn without a matching **fingerprint** grant → `sandbox`.

**Authoritative world:** `grade:block` for an `activity` **must not** accept a client `world`. Main grades the world it holds for `runId` (last `run:activity` tick, or the `run:start` copy if no tick). Unknown / foreign `runId` → `not-found`. `files` / `answers` are only for `code` / `check`. Snapshot stores main’s world, not a renderer-invented one.

## Author

| Channel | In | Out |
| --- | --- | --- |
| `author:templates` | — | `{ id, title }[]` |
| `author:create` | `{ templateId, packId, lessonId }` | lesson draft in `userData/packs` (overlay if bundled pack exists) |
| `author:save` | `{ packId, lessonId, lesson }` | Zod-validate + write `lesson.json` (and only declared relative files). Executable-surface change **drops** that pack’s trust grant |
| `author:importAsset` | `{ packId, lessonId }` | file picker → copy into `assets/` (type/size allowlist); `{ path }` lesson-relative |
| `author:validate` | `{ packId, lessonId }` | `{ ok, issues: { path, message }[] }` including capabilities vs engines (D39) |
| `author:preview` | `{ packId, lessonId }` | same shape as `packs:lesson` (resolved overlay) |
| `author:exportZip` | `{ packId, lessonId? }` | save dialog; `{ cancelled, path? }` |
| `author:draftAi` | `{ objectives, sources[] }` | draft lesson (`needs-review`) or `{ cancelled }` / `not-configured` |

`author:save` is the only way the workbench persists JSON. Preview without save uses the last saved file (or a temp buffer in main keyed by session — if used, `author:save` still required before export). `author:importAsset` refuses `..` and non-media/code extensions.

## Creations

| Channel | In | Out |
| --- | --- | --- |
| `creation:get` | `{ packId, creationId }` | tree listing |
| `creation:export` | `{ packId, creationId, kind: "folder" \| "zip" }` | `{ cancelled, path? }` |

Events (main → renderer):

| Event | Payload |
| --- | --- |
| `run:output` | `{ runId, stream: "stdout" \| "stderr", chunk: string }` (throttled; drop if `runId` is not the listener’s run) |
| `progress:changed` | `{ packId, learnerId }` |

## App

| Channel | In | Out |
| --- | --- | --- |
| `app:info` | — | `{ version, userDataPath, isPackaged }` |

`userDataPath` is for display in Settings → About (helps confirm D3). Do not expose arbitrary fs.

## Rules

- No generic `fs:read` / `fs:write` from the renderer
- Editor buffers persist via `session:set` (size-capped) or learner `drafts/`
- All paths in payloads are **lesson-relative** (`files/main.py`), never `C:\...`
- Cap `files[]` size (e.g. 256 KiB per file, 32 files)
