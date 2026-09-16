# Python cartridge generator

`node scripts/author-py-expert.mjs` rewrites the whole `lawp.python.foundations` pack from
these files. Add `--partial` while a track is still being written: it keeps existing lesson
folders and only warns about ids that have no author yet.

| File | Owns |
| --- | --- |
| `structure.mjs` | The locked path: tracks, courses, modules, skills, misconceptions, creations |
| `write-pack.mjs` | `pack.json`, `tracks/`, `courses/`, `skills.json`, `misconceptions.json`, `creations/` |
| `lib.mjs` | Block builders shared by every track file |
| `foundations.mjs` … `craft.mjs` | One file per track, exporting one `lessonsX()` function |

`tests/py-curriculum.test.ts` holds an independent copy of the path order. If you change
`structure.mjs`, that test is supposed to fail until you change it too.

## The shape of a lesson

```js
out.push({
  doc: lesson({
    id: 'dicts-keys',          // must match structure.mjs exactly
    courseId: 'collections',
    moduleId: 'mappings',
    title: 'Look it up by name',
    skillIds: ['python.collections.dict'],
    estimatedMinutes: 16,
    blocks: [teach({ ... }), predict(...), pyCode({ ... })]
  }),
  files: { 'main.py': starter, 'hidden_test.py': importAssert('...') }
})
```

Every lesson owes three things: one `teach()` explain, at least one retrieval block
(`predict` / `check` / `cloze` / `tf`), and — unless the lesson is genuinely discussion-only —
one `pyCode()` or `playCode()` task.

## Rules the tests enforce

- **Explain**: `teach()` only. `idea` and `bites` are two or more sentences each, the fence is
  runnable Python, and `mistake` names the trap and hands off to the exercise. At least 90
  words of prose outside the fence.
- **Review copy**: every `check` / `predict` needs `explainMd` of 100+ characters that teaches
  the answer rather than announcing it.
- **Hint ladder**: always `ladder(orient, rule, other_example, assist)`. The level-4 assist rung
  is the **complete working `main.py`** — the solutions test pastes that string into the file
  and runs it, so it must pass on its own.
- **Starter**: `files['main.py']` must run cleanly (exit 0) and still fail the checks. A
  `debug: true` block is the only kind allowed to raise.
- **One edit file.** Always `files/main.py`. Read-only companions go through `roFiles`, and fixtures
  through `fixtures` — Studio shows both under the editor as named read-only panes, so a lesson may
  tell the learner to `import station` and they can read `station.py` (D60).
- **Hidden test**: pass `hidden: true` and provide `files['hidden_test.py']`. Use
  `importAssert()` for behaviour, `srcIncludes()` when the *how* is the point, `playLogOk()`
  for fox lessons. On a play lesson the hidden test may `import main`; the runner injects
  `Player` for it.
- **Misconceptions**: only ids already listed in `structure.mjs`, always attached to the
  **wrong** choice. Every id there must be used by someone.
- `transfer-*` lessons carry `mastery: { requiresTransfer: true }`. Creation steps carry
  `creation: { id, step, briefMd }` matching `CREATIONS`.

## Things that make a lesson fail in the sandbox

No `input()`. No network. No `pip`. No wall-clock or randomness without a fixed seed. Write
only relative paths inside the sandbox directory. Keep `stdout` `equals` tiny — it is compared
trimmed, so trailing newlines are safe but multi-line output is fragile.

## Voice

A field station with a fox, a grid, and a messy log. Not ninjas, not sushi, not Codefinity.
Write the theory as if the learner has never seen the idea, and never reveal the exercise
answer in the explain.
