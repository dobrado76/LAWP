# IPC contract

Preload exposes `window.lawp` only. Channel names are constants in `src/shared/ipc`. Payloads parsed with Zod in **main**.

Envelope: `Promise<Result<T>>` unless noted as event.

## Settings

| Channel | In | Out |
| --- | --- | --- |
| `settings:get` | — | settings object |
| `settings:update` | partial | settings object |
| `settings:export` | — | `{ cancelled, path? }` |
| `settings:import` | — | `{ cancelled, settings? }` |

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

All reads/writes use the **current learner**. Never accept a pack filesystem path.

| Channel | In | Out |
| --- | --- | --- |
| `progress:get` | `{ packId? }` | snapshot (rollups: status, current, previous, best, attemptCount) |
| `progress:attempts` | `{ packId, lessonId, blockId? }` | `{ attempts: Attempt[] }` |
| `progress:note` | `{ packId, lessonId, text }` | ok |
| `progress:reset` | `{ packId, scope: "block" \| "lesson" \| "module" \| "course" \| "pack", history?: "keep" \| "delete-last" \| "clear", lessonId?, moduleId?, courseId?, blockId?, keepNotes?: boolean }` | snapshot |
| `practice:next` | — | queue items[] |

`progress:reset` `history` defaults to **`keep`** (restart/redo). `clear` deletes the attempt log in scope. `delete-last` drops the newest attempt only.

## Run / grade

| Channel | In | Out |
| --- | --- | --- |
| `run:code` | `{ packId, lessonId, blockId, files: {path, contents}[], replaceLast?: boolean }` | `{ stdout, stderr, exitCode, timedOut, durationMs, compare?: { current, previous?, best? } }` |
| `run:cancel` | — | ok |
| `grade:block` | `{ packId, lessonId, blockId, files?, answers?, replaceLast?: boolean }` | `{ passed, checks: { id, passed, message }[], hintEligible, compare: { current, previous?, best? } }` |
| `hint:get` | `{ packId, lessonId, blockId, level }` | `{ md, level }` records usage |

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
