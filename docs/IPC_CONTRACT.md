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

Import **merges**. Existing `settings.json` keys are replaced only after confirm. Existing `userData/packs/<packId>` is skipped or replaced only after confirm — never silent overwrite. If an imported Python path does not exist on this machine, keep the value but flag `runtime-missing` and re-detect when possible.

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
| `packs:importZip` | — | file picker → validate zip → copy into `userData/packs`; `{ kind: "pack" \| "lesson", packId, lessonId? }` |
| `packs:exportZip` | `{ packId, lessonId? }` | save dialog → zip cartridge only; `{ cancelled, path? }` |
| `packs:reload` | — | summaries[] |

`packs:import` is an alias of `packs:importZip` if kept for older notes.

Overwrite of the same `packId`/`lessonId` is a confirm in the renderer, then the same channel with `{ replace: true }` or a follow-up `packs:replaceZip`. Conflict without replace → `cartridge-conflict`.

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

`progress:reset` `history` defaults to **`keep`** (restart/redo). `clear` deletes the attempt log **and snapshots** in scope and resets evidence in that scope. `delete-last` drops the newest attempt only. Durable **best** is not removed by log truncation — only by `clear` or delete of that evidence.

## Run / grade

| Channel | In | Out |
| --- | --- | --- |
| `run:start` | `{ packId, lessonId, blockId }` | `{ runId, learnerId }` — bind before spawn or activity step |
| `run:code` | `{ runId, packId, lessonId, blockId, files: {path, contents}[], replaceLast?: boolean }` | `{ stdout, stderr, exitCode, timedOut, durationMs, compare? }` |
| `run:activity` | `{ runId, packId, lessonId, blockId, actionId, payload? }` | `{ world, goalMet, constraintOk, misconceptionIds?, compare? }` |
| `run:cancel` | `{ runId }` | ok |
| `grade:block` | `{ runId, packId, lessonId, blockId, files?, answers?, world?, replaceLast?: boolean }` | `{ passed, checks[], hintEligible, misconceptionIds?, diagnostic?, compare, snapshotId? }` |
| `hint:get` | `{ packId, lessonId, blockId, level }` | `{ md, level, kind: "concept" \| "assist" }` records usage |

`run:code` / `grade:block` that would spawn on an **untrusted** imported pack → `sandbox`.

## Author

| Channel | In | Out |
| --- | --- | --- |
| `author:templates` | — | `{ id, title }[]` |
| `author:create` | `{ templateId, packId, lessonId }` | lesson draft in `userData/packs` (or a drafts tree) |
| `author:validate` | `{ packId, lessonId }` | `{ ok, issues: { path, message }[] }` |
| `author:preview` | `{ packId, lessonId }` | same shape as `packs:lesson` |
| `author:exportZip` | `{ packId, lessonId? }` | save dialog; `{ cancelled, path? }` |
| `author:draftAi` | `{ objectives, sources[] }` | draft lesson (`needs-review`) or `{ cancelled }` / `not-configured` |

## Creations

| Channel | In | Out |
| --- | --- | --- |
| `creation:get` | `{ packId, creationId }` | tree listing |
| `creation:export` | `{ packId, creationId, kind: "folder" \| "zip" }` | `{ cancelled, path? }` |

Events (main → renderer):

| Event | Payload |
| --- | --- |
| `run:output` | `{ stream: "stdout" \| "stderr", chunk: string }` (throttled) |
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
