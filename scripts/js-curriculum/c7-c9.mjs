import {
  lesson,
  explain,
  predict,
  check,
  cloze,
  tf,
  hints,
  ladder,
  stdoutCode,
  playCode,
  domCode,
  activityBlock,
  asyncAssert,
  fox,
  beacon,
  token,
  tree,
  piece,
  wall,
  field,
  at,
  playLogOk,
  exportAssert,
  deskWorld,
  deskGoal,
  timeoutDeskWorld,
  timeoutDeskGoal,
  pageHtml
} from './lib.mjs'

export function lessonsC7C9() {
  const out = []

  out.push({
    doc: lesson({
      id: 'stack-vs-heap',
      courseId: 'event-loop',
      moduleId: 'queues',
      title: 'Stack vs heap',
      skillIds: ['js.async'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Where values live\n\nThe **stack** is the list of function calls that are running now. The **heap** is the bag of objects those frames point at. A stack frame is short-lived. A heap object stays as long as something still points at it.\n\nA closure keeps a heap object alive after the stack frame that created it is gone. `await` *pauses that function* — it does not freeze the operating system.\n\nOn the desk: the fox calls `outer()`, which calls `inner()`. While `inner` runs, it sits on top of the stack. The beacon record it points at lives on the heap. A later `then` can still read that record after `inner` has returned.'
        ),
        predict(
          'await-os',
          '`await` inside one function…',
          [
            { id: 'os', md: 'Stops the whole computer until the promise finishes', misconceptionId: 'await-blocks-the-os' },
            { id: 'fn', md: 'Pauses that function and lets other JS run' }
          ],
          'fn'
        ),
        tf(
          'await-not-os',
          '`await` freezes the whole computer until the promise finishes.',
          false,
          {
            explainMd: 'Only that async function pauses. Other JavaScript on the page can still run. The operating system is not frozen.',
            misconceptionId: 'await-blocks-the-os'
          }
        ),
        check(
          'stack-frame',
          'While `inner()` is running, called from `outer()`, the top of the stack is…',
          [
            { id: 'outer', md: '`outer`' },
            { id: 'inner', md: '`inner`' }
          ],
          'inner',
          { explainMd: 'The running function is on top. outer waits under it until inner returns.' }
        )
      ]
    }),
    files: {}
  })

  const deskPredict = {
    promptMd: 'After the sync call finishes, which queue should light next: `then` or `setTimeout(0)`?',
    kind: 'mcq',
    choices: [
      { id: 'timeout', md: 'setTimeout — they are the same queue', misconceptionId: 'then-and-timeout-same-queue' },
      { id: 'then', md: 'promise.then — microtasks first' }
    ],
    answer: 'then'
  }

  out.push({
    doc: lesson({
      id: 'macrotasks-timeout',
      courseId: 'event-loop',
      moduleId: 'queues',
      title: 'Macrotasks: timeout',
      skillIds: ['js.async'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Sync, then the timeout tray\n\n`setTimeout(fn, 0)` does **not** mean “run now.” It means “put `fn` on the macrotask queue.” Sync work on the stack finishes first. Only then does the desk look at the timeout tray.\n\nThis desk has two lamps: **1 Sync work** and **2 setTimeout(fn, 0)**. Light them in that order. Firing the timeout while the sync lamp is dark records a fault, because that is not an order the runtime can produce.\n\nThe third tray — `promise.then` — arrives in the next lesson, and it does not wait its turn behind timeouts.'
        ),
        activityBlock({
          id: 'desk-sync-timeout',
          kind: 'experiment',
          skillIds: ['js.async'],
          prompt: 'Two trays, in order: run the sync call, then fire the timeout. Firing the timeout first sets a fault.',
          predict: {
            promptMd: 'Does `setTimeout(fn, 0)` run before the current call stack finishes?',
            kind: 'mcq',
            choices: [
              { id: 'yes', md: 'Yes — 0 means now' },
              { id: 'no', md: 'No — sync finishes first' }
            ],
            answer: 'no'
          },
          world: timeoutDeskWorld(),
          goal: timeoutDeskGoal,
          constraints: [at('desk', 'fault', 0)],
          explainAfter: 'Timeouts are macrotasks. They wait until the stack is clear.',
          hints: hints(
            'The desk has exactly two buttons. One of them has to go first.',
            { level: 2, kind: 'concept', md: 'Sync work runs on the stack that is already going. The timeout waits for a tray that is only served once that stack is empty.' },
            { level: 3, kind: 'concept', md: 'Firing the timeout while the sync lamp is dark is the fault this desk records.' },
            { level: 4, kind: 'assist', md: 'Press Run the sync call, then Fire the timeout.' }
          ),
          misconceptionMap: [{ when: at('desk', 'fault', 1), misconceptionId: 'then-and-timeout-same-queue' }]
        }),
        tf(
          'timeout-zero-now',
          '`setTimeout(fn, 0)` runs `fn` before the current call stack finishes.',
          false,
          { explainMd: 'Zero means “as soon as this macrotask tray is served,” not “now, on top of the running function.”' }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'microtasks-then',
      courseId: 'event-loop',
      moduleId: 'queues',
      title: 'Microtasks: then before timeout',
      skillIds: ['js.async'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## `then` is not a timeout\n\nAfter the stack clears, JavaScript empties the **microtask** queue (`promise.then`, `queueMicrotask`) *before* the next timer. A `then` is a note on a faster tray than `setTimeout`.\n\nOrder on the desk: sync → `then` → `setTimeout`. The fox files a promise, then asks the desk to wait zero ticks. The promise lamp still lights first.'
        ),
        activityBlock({
          id: 'desk-full',
          kind: 'experiment',
          skillIds: ['js.async'],
          prompt: 'Light the desk in real event-loop order: sync, then `then`, then timeout.',
          predict: deskPredict,
          world: deskWorld(),
          goal: deskGoal,
          constraints: [at('desk', 'fault', 0)],
          explainAfter: 'Microtasks run before the next macrotask. then and setTimeout are not the same tray.',
          hints: hints(
            '1 Sync work, 2 promise.then, 3 setTimeout.',
            { level: 4, kind: 'assist', md: 'Click the three buttons in numbered order.' }
          ),
          misconceptionMap: [{ when: at('desk', 'fault', 1), misconceptionId: 'then-and-timeout-same-queue' }]
        }),
        cloze(
          'queue-order',
          'After sync work, JavaScript runs {{a}} before the next {{b}}.',
          [
            { id: 'a', choices: ['promise.then', 'setTimeout', 'the operating system'] },
            { id: 'b', choices: ['promise.then', 'setTimeout', 'stack frame'] }
          ],
          { a: 'promise.then', b: 'setTimeout' },
          { explainMd: 'Microtasks (then) drain before the next macrotask (timeout). They are not the same tray.' }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'promises-states',
      courseId: 'event-loop',
      moduleId: 'queues',
      title: 'Promise states',
      skillIds: ['js.async'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Pending, fulfilled, rejected\n\nA Promise starts **pending**. It becomes **fulfilled** with a value or **rejected** with a reason. After that, the state sticks. You cannot send it back to pending.\n\n`Promise.resolve("locked")` is already fulfilled. The desk already stamped the slip. Print that value with `.then` here — `await` comes next.\n\nOn the board: a beacon key that is already locked is still a promise. You just do not wait for a later tick to settle it.'
        ),
        predict(
          'no-unfulfill',
          'Can a fulfilled promise become pending again?',
          [
            { id: 'yes', md: 'Yes' },
            { id: 'no', md: 'No — the state sticks' }
          ],
          'no'
        ),
        tf(
          'promise-reset',
          'A fulfilled promise can become pending again.',
          false,
          { explainMd: 'Pending, then fulfilled or rejected. The state does not go backward.' }
        ),
        stdoutCode({
          id: 'resolve-then',
          prompt: '> `label()` returns `Promise.resolve("locked")`. Print the fulfilled value.',
          equals: 'locked',
          hidden: true,
          timeoutMs: 4000,
          hints: ladder(
            '`label` should return an already-fulfilled promise.',
            'Use `Promise.resolve("locked")`, then print the value from `then`.',
            'The desk already stamped locked. You only need to read the slip.',
            'function label() { return Promise.resolve("locked") }\nlabel().then((v) => console.log(v))\nmodule.exports = { label }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function label() {
  return Promise.resolve("open")
}
label().then((v) => console.log(v))
module.exports = { label }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.label()
  assert.strictEqual(v, 'locked')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'async-await',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'async / await',
      skillIds: ['js.async'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Sugar over promises\n\nAn `async function` always returns a Promise. `await` pauses **that** function until the promise settles. Other JavaScript on the page can still run. The operating system is not frozen.\n\nThe fox can `await` a wait on the field while the desk still lights other lamps. Only the fox’s function is paused. When the promise settles, that function continues with the value.'
        ),
        predict(
          'await-scope',
          '`await` blocks…',
          [
            { id: 'os', md: 'The operating system', misconceptionId: 'await-blocks-the-os' },
            { id: 'fn', md: 'Only the async function you are in' }
          ],
          'fn'
        ),
        tf(
          'await-os-again',
          '`await` blocks the operating system.',
          false,
          {
            explainMd: 'Only the async function waits. Other work on the page can still run.',
            misconceptionId: 'await-blocks-the-os'
          }
        ),
        stdoutCode({
          id: 'await-label',
          prompt: '> `async function label()` returns `"keyed"` after `await Promise.resolve()`. Print it.',
          equals: 'keyed',
          ast: 'await',
          hidden: true,
          hints: ladder(
            '`label` must be `async` so you can `await` inside it.',
            'Await a resolved promise, then return the word `keyed`.',
            'Print the returned value from `then`, and export `label`.',
            'async function label() {\n  await Promise.resolve()\n  return "keyed"\n}\nlabel().then((v) => console.log(v))\nmodule.exports = { label }'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function label() {
  return "open"
}
label().then((v) => console.log(v))
module.exports = { label }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.label()
  assert.strictEqual(v, 'keyed')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'async-errors',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'Rejected await in try',
      skillIds: ['js.async', 'js.errors'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## `await` a rejection inside `try`\n\n`await Promise.reject(new Error("lost"))` throws into the async function. `try/catch` works the same as a sync throw. The rejection becomes an exception at the `await` line.\n\nPrint `lost` from the catch. On the desk, a lost key is a failed slip — you still handle it in the same function. It does not become `undefined` just because you skipped `try`.'
        ),
        predict(
          'await-reject',
          'A rejected `await` without `try`…',
          [
            { id: 'undef', md: 'Becomes `undefined`' },
            { id: 'throw', md: 'Rejects the async function (an exception in that function)' }
          ],
          'throw'
        ),
        tf(
          'reject-undef',
          'A rejected `await` without `try` becomes `undefined`.',
          false,
          { explainMd: 'The await throws into that async function. The function’s promise rejects unless you catch it.' }
        ),
        stdoutCode({
          id: 'catch-lost',
          prompt: '> `readKey()` awaits a rejection `"lost"` and returns that message from `catch`. Print it.',
          equals: 'lost',
          ast: 'await',
          hidden: true,
          hints: ladder(
            'Await a rejected promise inside `try`.',
            'In `catch`, return `e.message`.',
            'The desk stamp is the string `lost`. Export `readKey` and print it.',
            'async function readKey() {\n  try { await Promise.reject(new Error("lost")) }\n  catch (e) { return e.message }\n}\nreadKey().then((v) => console.log(v))\nmodule.exports = { readKey }'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function readKey() {
  return "ok"
}
readKey().then((v) => console.log(v))
module.exports = { readKey }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.readKey()
  assert.strictEqual(v, 'lost')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'parallel-vs-sequence',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'Promise.all vs await-in-loop',
      skillIds: ['js.async'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Three waits, two stories\n\n`await Player.wait(1)` three times in a row is **sequence**. Each pause starts after the last one finishes. `Promise.all([Player.wait(1), Player.wait(1), Player.wait(1)])` starts them together. They overlap. The whole group finishes when the slowest one finishes.\n\nThe fox still only moves after you say so. Use `wait` then walk east to (3, 0). Sequence is fine here — the lesson is that `all` would overlap the pauses. Trees and a wall sit off the path so the yard looks like a field, not a blank strip.'
        ),
        predict(
          'all-overlap',
          '`Promise.all` of three waits…',
          [
            { id: 'sum', md: 'Always adds the times' },
            { id: 'max', md: 'Finishes when the slowest finishes (they overlap)' }
          ],
          'max'
        ),
        tf(
          'all-adds',
          '`Promise.all` of three equal waits always adds the three times.',
          false,
          { explainMd: 'The waits overlap. The group finishes when the slowest one finishes, not when the sum of the times has passed.' }
        ),
        playCode({
          id: 'three-waits',
          prompt: '> `await Player.wait(1)` three times (or `Promise.all`), then walk east to (3, 0).',
          world: field([
            fox(0, 0),
            beacon(3, 0),
            tree('t1', 5, 2),
            tree('t2', 6, 4),
            wall('w1', 1, 3),
            piece('owl', 'owl', 6, 1)
          ]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          hints: ladder(
            'Wait first, then walk. The beacon is three cells east.',
            'Three `Player.wait(1)` calls in a row, or one `Promise.all` of three waits, then three east moves.',
            'Trees and the wall are off the east path. Stay on y = 0.',
            'async function go() {\n  await Promise.all([Player.wait(1), Player.wait(1), Player.wait(1)])\n  Player.move("east")\n  Player.move("east")\n  Player.move("east")\n}\ngo()'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function go() {
  Player.move("east")
}
go()
`,
      'hidden.test.js': playLogOk(`const waits = log.filter((row) => row.op === 'wait')
assert.ok(waits.length >= 3, 'the yard expects three waits, not one')
const ops = log.map((row) => row.op)
const moves = log.filter((row) => row.op === 'move' && row.dir === 'east')
assert.ok(moves.length >= 3, 'walk east onto the beacon after the waits')
assert.ok(ops.lastIndexOf('wait') < ops.indexOf('move'), 'finish the waiting before the walking')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'promise-combinators',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'all, allSettled, and race',
      skillIds: ['js.async'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Three ways to wait for a group\n\n`Promise.all([a, b, c])` resolves with an array of results, in the order you passed them — **or** rejects the moment any one of them rejects. You do not get the results that did arrive. Use it when every part is required.\n\n`Promise.allSettled([a, b, c])` never rejects. It resolves with one row per promise: `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. Use it when you want a report of what worked.\n\n`Promise.race([a, b])` settles with whichever settles first, win or lose. That is how a timeout is built: race the real work against a promise that rejects after N milliseconds.'
        ),
        predict(
          'all-rejects',
          'Two reads succeed and the third rejects. What does `await Promise.all([r1, r2, r3])` give you?',
          [
            { id: 'partial', md: 'An array with the two results that arrived', misconceptionId: 'all-settles-partly' },
            { id: 'throws', md: 'It throws — the whole group rejects' },
            { id: 'undefined', md: 'An array with `undefined` in the third slot', misconceptionId: 'all-settles-partly' }
          ],
          'throws'
        ),
        check(
          'pick-combinator',
          'You want a report of which of four beacons answered, including the ones that failed. Which do you reach for?',
          [
            { id: 'all', md: '`Promise.all`', misconceptionId: 'all-settles-partly' },
            { id: 'settled', md: '`Promise.allSettled`' },
            { id: 'race', md: '`Promise.race`' }
          ],
          'settled',
          {
            explainMd:
              '`allSettled` waits for every promise and reports each outcome. `all` would throw on the first failure and tell you nothing about the rest. `race` only reports the first one to settle.'
          }
        ),
        tf(
          'race-rejects',
          '`Promise.race` ignores a rejection and waits for the first success.',
          false,
          {
            explainMd:
              'Race settles with the first promise to settle either way. A fast rejection wins the race, which is exactly what makes it useful as a timeout.'
          }
        ),
        stdoutCode({
          id: 'settle-report',
          prompt:
            '> `report(jobs)` awaits every job with `Promise.allSettled` and returns a string like `ok:2 failed:1`. Print `report` of two resolved jobs and one rejected one.',
          equals: 'ok:2 failed:1',
          ast: 'allSettled',
          hidden: true,
          hints: ladder(
            'One failing job must not stop you from counting the others, so `all` is the wrong tool here.',
            '`Promise.allSettled` resolves with a row per job. Each row has a `status` of `"fulfilled"` or `"rejected"`.',
            'Count with a filter: `rows.filter((r) => r.status === "fulfilled").length`.',
            'async function report(jobs) {\n  const rows = await Promise.allSettled(jobs)\n  const ok = rows.filter((r) => r.status === "fulfilled").length\n  return `ok:${ok} failed:${rows.length - ok}`\n}\nreport([Promise.resolve(1), Promise.resolve(2), Promise.reject(new Error("no"))]).then((v) => console.log(v))\nmodule.exports = { report }'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function report(jobs) {
  const rows = await Promise.allSettled(jobs)
  return \`ok:\${rows.length} failed:0\`
}
report([Promise.resolve(1), Promise.resolve(2), Promise.reject(new Error("no"))]).then((v) => console.log(v))
module.exports = { report }
`,
      'hidden.test.js': asyncAssert(`  const mixed = await m.report([Promise.resolve(1), Promise.resolve(2), Promise.reject(new Error('no'))])
  assert.strictEqual(mixed, 'ok:2 failed:1')
  const allOk = await m.report([Promise.resolve(1)])
  assert.strictEqual(allOk, 'ok:1 failed:0')
  const allBad = await m.report([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])
  assert.strictEqual(allBad, 'ok:0 failed:2')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'async-iterators',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'for await of a step stream',
      skillIds: ['js.async', 'js.iter'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A stream of steps\n\n`async function* steps() { yield "east"; yield "south" }` is a function that hands you one direction at a time. Each `yield` can wait. You do not get the whole list up front.\n\n`for await (const d of steps())` waits for each yield. Print `east-south` joined from the stream.\n\nOn the desk, each slip arrives when it is ready, then you file the next one. The fox reads east, then south, then joins the two words.'
        ),
        predict(
          'for-await',
          '`for await` is for…',
          [
            { id: 'sync', md: 'Only ordinary arrays' },
            { id: 'async', md: 'Async iterables (and sync ones too)' }
          ],
          'async'
        ),
        tf(
          'for-await-arrays-only',
          '`for await` is only for ordinary arrays.',
          false,
          { explainMd: 'It is for async iterables. It can also walk a sync iterable. It is not limited to arrays.' }
        ),
        stdoutCode({
          id: 'await-of',
          prompt: '> `async function* steps` yields `east` then `south`. Join with `-` and print `east-south`.',
          equals: 'east-south',
          ast: 'for await',
          hidden: true,
          hints: ladder(
            'Make `steps` an async generator that yields two words.',
            'In `join`, `for await` each yield into an array, then `join("-")`.',
            'Export both `steps` and `join`, and print the joined string.',
            'async function* steps() {\n  yield "east"\n  yield "south"\n}\nasync function join() {\n  const out = []\n  for await (const d of steps()) out.push(d)\n  return out.join("-")\n}\njoin().then((v) => console.log(v))\nmodule.exports = { steps, join }'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function* steps() {
  yield "east"
}
async function join() {
  return "east"
}
join().then((v) => console.log(v))
module.exports = { steps, join }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.join()
  assert.strictEqual(v, 'east-south')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-beacon-dispatch',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'Transfer: timed walk',
      skillIds: ['js.async'],
      estimatedMinutes: 25,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Wait, then walk\n\n`Player.wait(ticks)` logs a pause. Studio replay honors it. The world does not move during `wait`. Time passes. The fox stays in the same cell.\n\nAwait two ticks, then walk to (2, 1): east, east, south. The beacon is already there. The wait is not a step toward it. A flag and a tree sit off that path so the yard is a field, not an empty box.'
        ),
        predict(
          'wait-world',
          'During `Player.wait(2)` the fox’s cell…',
          [
            { id: 'slides', md: 'Slides toward the beacon' },
            { id: 'stays', md: 'Stays put — wait is time, not a move' }
          ],
          'stays'
        ),
        tf(
          'wait-slides',
          '`Player.wait(2)` slides the fox toward the beacon.',
          false,
          { explainMd: 'Wait logs time. It does not change x or y. You still write the moves after the await.' }
        ),
        playCode({
          id: 'timed-walk',
          prompt: '> `await Player.wait(2)` then walk east, east, south onto the beacon.',
          world: field([
            fox(0, 0),
            beacon(2, 1),
            tree('t1', 5, 0),
            wall('w1', 0, 3),
            piece('flag', 'flag', 6, 4)
          ]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: ladder(
            'Await two ticks first. The fox does not move during the wait.',
            'Then walk east, east, south onto (2, 1).',
            'The tree and wall are off that path. Stay on the two east cells, then one south.',
            'async function go() {\n  await Player.wait(2)\n  Player.move("east")\n  Player.move("east")\n  Player.move("south")\n}\ngo()'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function go() {
  Player.move("east")
}
go()
`,
      'hidden.test.js': playLogOk(`assert.ok(log.some((row) => row.op === 'wait' && row.ticks === 2))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'debug-forgotten-await',
      courseId: 'event-loop',
      moduleId: 'async-code',
      title: 'Debug: forgotten await',
      skillIds: ['js.async'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## The key is “collected” too late\n\n`Player.wait` **logs when the timer finishes**, not when you call it. If you forget `await`, the next `move` is written first. The story says: say `keyed` only after the wait, *then* walk onto the key.\n\nFix the starter so the log is wait → say → move. The fox stands just north of the key. A missing `await` makes the walk happen before the desk stamps the wait.'
        ),
        predict(
          'order',
          'If `wait` logs on resolve, forgetting `await` before `move` puts `move`…',
          [
            { id: 'after', md: 'After wait in the log' },
            { id: 'before', md: 'Before wait in the log' }
          ],
          'before'
        ),
        tf(
          'forgot-after',
          'If you forget `await` on `wait`, `move` still appears after `wait` in the log.',
          false,
          { explainMd: 'Without await, move is written at once. Wait logs later, when the timer finishes.' }
        ),
        playCode({
          id: 'await-key',
          debug: true,
          prompt: '> Await the wait, `Player.say("keyed")`, then move south onto the key at (2, 4).',
          world: field([
            fox(2, 3),
            token('key', 'key', 2, 4),
            beacon(2, 4),
            tree('t1', 0, 0),
            tree('t2', 6, 0),
            wall('w1', 5, 2),
            piece('owl', 'owl', 0, 4)
          ]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 4), at('fox', 'say', 'keyed'), at('key', 'taken', true)] },
          hidden: true,
          hints: ladder(
            'The starter calls `wait` but does not await it.',
            'Await the wait, then say `keyed`, then move south.',
            'The key and beacon share (2, 4). One south step is enough.',
            'async function collect() {\n  await Player.wait(1)\n  Player.say("keyed")\n  Player.move("south")\n}\ncollect()'
          )
        })
      ]
    }),
    files: {
      'main.js': `async function collect() {
  Player.wait(1)
  Player.say("keyed")
  Player.move("south")
}
collect()
`,
      'hidden.test.js': playLogOk(`const ops = log.map((row) => row.op)
const waitAt = ops.indexOf('wait')
const sayAt = ops.indexOf('say')
const moveAt = ops.indexOf('move')
assert.ok(waitAt >= 0 && waitAt < sayAt && sayAt < moveAt)
`)
    }
  })

  // Course 8 DOM
  out.push({
    doc: lesson({
      id: 'tree-not-string',
      courseId: 'the-page',
      moduleId: 'tree',
      title: 'The document is a tree',
      skillIds: ['js.dom'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Nodes, not one long string\n\nThe page is a tree of nodes. `document.body` is an element. Changing `textContent` changes a node. You do not rebuild the whole HTML string to rename a heading.\n\n`document.querySelector("h1")` returns that heading node, or `null` if it is missing. On this board, the channel plate still says “Old radio.” Change the `h1#title` node to `Signal desk`.'
        ),
        predict(
          'query-type',
          '`document.querySelector("h1")` returns…',
          [
            { id: 'html', md: 'The tag as a string' },
            { id: 'node', md: 'An element node (or null)' }
          ],
          'node'
        ),
        tf(
          'query-string',
          '`document.querySelector("h1")` returns the tag as a string.',
          false,
          { explainMd: 'It returns an element node, or null if nothing matches. The HTML string is not the return value.' }
        ),
        domCode({
          id: 'see-tree',
          prompt: '> Set the `h1#title` text to `Signal desk`.',
          hidden: true,
          hints: ladder(
            'Find the heading node. Do not rewrite the HTML file as a string.',
            'Use `querySelector("#title")`, then set `textContent`.',
            'The plate should read Signal desk after you change the node.',
            'document.querySelector("#title").textContent = "Signal desk"'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Plate 1 · rename the channel. The heading is a node on this board.</p><h1 id="title">Old radio</h1><p>Change its text. Do not rebuild the page as one string.</p>',
        'Channel plate'
      ),
      'main.js': `// Change the heading node. Do not rewrite the HTML file as a string.\n`,
      'hidden.test.js': `assert.strictEqual(document.querySelector('#title').textContent, 'Signal desk')\n`
    }
  })

  out.push({
    doc: lesson({
      id: 'query-and-update',
      courseId: 'the-page',
      moduleId: 'tree',
      title: 'querySelector and textContent',
      skillIds: ['js.dom'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Find, then write text\n\n`querySelector` takes a CSS selector. `#id`, `.class`, `li`. It returns one node or `null`. It does not return the HTML as a string.\n\nPut the name `North` into `#beacon-name`. Use `textContent`, not `innerHTML`, for plain text. The tag on the desk is a node. You find it, then you write the word.'
        ),
        predict(
          'missing',
          '`querySelector("#nope")` is…',
          [
            { id: 'empty', md: '`""`' },
            { id: 'null', md: '`null`' }
          ],
          'null'
        ),
        tf(
          'missing-empty',
          '`querySelector("#nope")` is the empty string.',
          false,
          { explainMd: 'A miss is null, not "". You must check before you set textContent.' }
        ),
        domCode({
          id: 'set-name',
          prompt: '> `#beacon-name` should read `North`.',
          hidden: true,
          hints: ladder(
            'Find `#beacon-name` with a selector.',
            'Set `textContent` to `North`. Do not use `innerHTML` for this word.',
            'The beacon tag is already a node on the plate.',
            'document.querySelector("#beacon-name").textContent = "North"'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Tag the live beacon. The name field is already a node.</p><label for="beacon-name">Beacon</label><p id="beacon-name">?</p>',
        'Beacon tag'
      ),
      'main.js': `// Find #beacon-name, then set textContent.\n`,
      'hidden.test.js': `assert.strictEqual(document.querySelector('#beacon-name').textContent, 'North')\n`
    }
  })

  out.push({
    doc: lesson({
      id: 'create-and-remove',
      courseId: 'the-page',
      moduleId: 'tree',
      title: 'createElement and append',
      skillIds: ['js.dom'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Grow the tree\n\n`document.createElement("li")` makes a node that is not on the page yet. Set `textContent`, then `ul.append(li)` to hang it on the list. `li.remove()` takes a node off.\n\nDo not concatenate HTML strings to add one item. On this tray, the beacon log starts empty. Create an `li` that says `East` and append it to `#list`.'
        ),
        predict(
          'append-parent',
          'After `ul.append(li)`, `li.parentNode` is…',
          [
            { id: 'doc', md: '`document`' },
            { id: 'ul', md: 'The `ul`' }
          ],
          'ul'
        ),
        tf(
          'append-doc',
          'After `ul.append(li)`, `li.parentNode` is `document`.',
          false,
          { explainMd: 'append hangs the node on that ul. The parent is the list, not the whole document.' }
        ),
        domCode({
          id: 'add-li',
          prompt: '> Create an `li` with text `East` and append it to `#list`.',
          hidden: true,
          hints: ladder(
            'Create an `li` node first. It is not on the page yet.',
            'Set `textContent` to `East`, then append it to `#list`.',
            'The log tray starts empty. One node is enough.',
            'const li = document.createElement("li")\nli.textContent = "East"\ndocument.querySelector("#list").append(li)'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Empty log. Grow it with nodes, not a pasted HTML string.</p><label>Beacon log</label><ul id="list"></ul>',
        'Log tray'
      ),
      'main.js': `// Create an li, set its text, append it to #list.\n`,
      'hidden.test.js': `const items = [...document.querySelectorAll('#list li')].map((n) => n.textContent)
assert.ok(items.includes('East'))
`
    }
  })

  out.push({
    doc: lesson({
      id: 'events-bubble',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'Events bubble',
      skillIds: ['js.events'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## target vs currentTarget\n\nThe event starts at the clicked node (`target`) and bubbles up. `currentTarget` is the node whose listener is running. One listener on a parent can hear a click on a child.\n\nBubbling is the second half of the trip. The event first travels **down** from the document to the target — the capture phase — and `addEventListener(type, fn, { capture: true })` takes a seat on that leg instead. Same event, earlier seat. `stopPropagation()` ends the trip wherever you call it.\n\nListen on `#outer`. When `#inner` is clicked, set `#out` to `inner>outer` using the target id, then the currentTarget id. The inner ping is the target. The outer nest is the listener.'
        ),
        predict(
          'target',
          'You click the inner button. `event.target` is…',
          [
            { id: 'outer', md: 'The parent with the listener' },
            { id: 'inner', md: 'The inner button' }
          ],
          'inner'
        ),
        tf(
          'target-parent',
          'A click on the inner button makes `event.target` the parent with the listener.',
          false,
          { explainMd: 'target is the node that was clicked. currentTarget is the node whose listener is running.' }
        ),
        domCode({
          id: 'bubble-ids',
          prompt: '> On click of `#outer`, write `targetId>currentId` into `#out`. Hidden test clicks `#inner`.',
          hidden: true,
          hints: ladder(
            'Listen on `#outer`, not on the inner button alone.',
            'Inside the listener, read `e.target.id` and `e.currentTarget.id`.',
            'Join them with `>` and write that into `#out`.',
            'document.querySelector("#outer").addEventListener("click", (e) => {\n  document.querySelector("#out").textContent = e.target.id + ">" + e.currentTarget.id\n})'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Click the inner ping. The nest listener should still hear it.</p><div id="outer"><button type="button" id="inner">Ping</button></div><p id="out"></p>',
        'Relay nest'
      ),
      'main.js': `// Listen on #outer. Write targetId>currentId into #out.\n`,
      'hidden.test.js': `document.querySelector('#inner').dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#out').textContent, 'inner>outer')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'delegation',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'One listener on the parent',
      skillIds: ['js.events'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Delegation\n\nOne listener on `ul#list` can handle clicks on any `button` inside, including buttons you add later. Check `event.target.matches("button")` or use `closest("button")`.\n\nYou do not bind each button by hand. On this pick board, North and East are already listed. Clicking East should write `East` into `#picked` from `data-name`.'
        ),
        predict(
          'later-child',
          'A parent listener (bubble) hears clicks on a button appended after bind?',
          [
            { id: 'no', md: 'No — you had to bind that button' },
            { id: 'yes', md: 'Yes — the click bubbles to the parent' }
          ],
          'yes'
        ),
        tf(
          'later-no',
          'A parent bubble listener misses buttons appended after you bound it.',
          false,
          { explainMd: 'The click still bubbles to the parent. New children are covered without a new listener.' }
        ),
        domCode({
          id: 'delegate',
          prompt: '> Clicking a button in `#list` should set `#picked` to that button’s `data-name`.',
          hidden: true,
          hints: ladder(
            'One listener on `#list` is enough.',
            'Use `closest("button")` so a click on the button text still counts.',
            'Write that button’s `data-name` into `#picked`.',
            'document.querySelector("#list").addEventListener("click", (e) => {\n  const b = e.target.closest("button")\n  if (!b) return\n  document.querySelector("#picked").textContent = b.getAttribute("data-name")\n})'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>One listener on the list. Read the channel from the button that was clicked.</p><ul id="list"><li><button type="button" data-name="North">N</button></li><li><button type="button" data-name="East">E</button></li></ul><p id="picked"></p>',
        'Channel pick'
      ),
      'main.js': `// One listener on #list. Set #picked from the button's data-name.\n`,
      'hidden.test.js': `document.querySelector('[data-name="East"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#picked').textContent, 'East')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'forms-and-input',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'input event and value',
      skillIds: ['js.events', 'js.dom'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## The live value\n\nThe `input` event fires as the person types. Read `event.target.value` (or the input’s `.value`). That string is the live field, not `innerHTML`.\n\nFor a whole form at once, `new FormData(formEl)` collects every named control: `data.get(\"name\")` reads one field and `Object.fromEntries(data)` turns the lot into a plain record. Controls without a `name` attribute are not collected, which is the usual reason a field goes missing.\n\nCopy it into `#echo`. On the echo plate, each letter the fox types should appear on the line below as it is typed.'
        ),
        predict(
          'value-field',
          'The text in a text field lives on…',
          [
            { id: 'html', md: '`innerHTML` of the input' },
            { id: 'value', md: '`.value`' }
          ],
          'value'
        ),
        tf(
          'value-html',
          'The text in a text field lives on `innerHTML`.',
          false,
          { explainMd: 'A text input holds its string on .value. innerHTML is the wrong place to read it.' }
        ),
        domCode({
          id: 'echo-input',
          prompt: '> Mirror `#name` into `#echo` on `input`.',
          hidden: true,
          hints: ladder(
            'Listen for `input` on `#name`.',
            'Read `e.target.value` each time.',
            'Write that string into `#echo` with `textContent`.',
            'document.querySelector("#name").addEventListener("input", (e) => {\n  document.querySelector("#echo").textContent = e.target.value\n})'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Type a call sign. The echo line should follow each key.</p><label for="name">Call sign</label><input id="name" /><p id="echo"></p>',
        'Live echo'
      ),
      'main.js': `// On input of #name, copy .value into #echo.\n`,
      'hidden.test.js': `const el = document.querySelector('#name')
el.value = 'Beacon'
el.dispatchEvent(new Event('input', { bubbles: true }))
assert.strictEqual(document.querySelector('#echo').textContent, 'Beacon')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'prevent-default',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'preventDefault on submit',
      skillIds: ['js.events', 'js.dom'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Submit does not have to leave\n\nA form’s default submit reloads or leaves the page. `event.preventDefault()` stops that default. The listener still runs. You keep the typed words on this desk.\n\nListen for `submit` on `#desk`. Prevent the default. Copy `#q` into `#out` with `textContent`. The fox files a query without the board going blank.'
        ),
        predict(
          'why-prevent',
          'Why call `preventDefault` on this form submit?',
          [
            { id: 'copy', md: 'It copies the value by itself' },
            { id: 'stay', md: 'It stops the default leave/reload so your listener can keep the words on the board' }
          ],
          'stay'
        ),
        tf(
          'prevent-is-copy',
          '`preventDefault` copies the input into `#out` for you.',
          false,
          { explainMd: 'preventDefault only stops the default leave. You still read #q and write #out yourself.' }
        ),
        cloze(
          'submit-steps',
          'On `submit`, call {{a}}, then copy `#q` into `#out` with {{b}}.',
          [
            { id: 'a', choices: ['preventDefault', 'stopImmediatePropagation', 'blur'] },
            { id: 'b', choices: ['textContent', 'innerHTML', 'outerHTML'] }
          ],
          { a: 'preventDefault', b: 'textContent' },
          { explainMd: 'Stop the default leave, then write the typed words as text, not as markup.' }
        ),
        domCode({
          id: 'hold-submit',
          prompt: '> Listen for `submit` on `#desk`. Prevent the default. Copy `#q` into `#out` with `textContent`.',
          hidden: true,
          hints: ladder(
            'The form id is `#desk`. Listen for `submit`, not `click`.',
            'Call `e.preventDefault()` first so the board does not leave.',
            'Then set `#out` text to `#q`’s `.value`.',
            'document.querySelector("#desk").addEventListener("submit", (e) => {\n  e.preventDefault()\n  document.querySelector("#out").textContent = document.querySelector("#q").value\n})'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>File the query on this desk. Do not let submit leave the board.</p><form id="desk"><label for="q">Query</label><input id="q" /><button type="submit">File</button></form><p id="out"></p>',
        'Submit desk'
      ),
      'main.js': `// Listen for submit on #desk. Prevent the default, then copy #q into #out.\n`,
      'hidden.test.js': `const q = document.querySelector('#q')
q.value = 'North'
const ev = new Event('submit', { bubbles: true, cancelable: true })
document.querySelector('#desk').dispatchEvent(ev)
assert.ok(ev.defaultPrevented)
assert.strictEqual(document.querySelector('#out').textContent, 'North')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'a11y-name-and-role',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'Accessible name and role',
      skillIds: ['js.dom'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A button should be a button\n\nA `div` with a click is a trap for keyboard and screen readers. Use `<button>`. The **accessible name** is often the text content, or `aria-label`.\n\nSet the button’s label to `Call north` using `textContent` — not `innerHTML` for this plain phrase. The call switch on the desk needs a name a reader can speak.'
        ),
        predict(
          'div-click',
          'A `div` with `onclick` is a good button?',
          [
            { id: 'yes', md: 'Yes — click is enough' },
            { id: 'no', md: 'No — it misses role, keyboard, and name by default' }
          ],
          'no'
        ),
        tf(
          'div-ok',
          'A `div` with `onclick` is a good button.',
          false,
          { explainMd: 'A div has no button role, no default keyboard activation, and often no accessible name.' }
        ),
        domCode({
          id: 'name-button',
          prompt: '> `#call` is a button. Set its accessible name (text) to `Call north`.',
          hidden: true,
          hints: ladder(
            '`#call` is already a real button. Do not replace it with a div.',
            'The accessible name here is the button’s text.',
            'Set `textContent` to `Call north`.',
            'document.querySelector("#call").textContent = "Call north"'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>This control must be a real button with a spoken name.</p><button type="button" id="call">Call</button>',
        'Call switch'
      ),
      'main.js': `// Set the button's textContent to Call north.\n`,
      'hidden.test.js': `const b = document.querySelector('#call')
assert.strictEqual(b.tagName, 'BUTTON')
assert.strictEqual(b.textContent, 'Call north')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'xss-text-vs-html',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'XSS: textContent vs innerHTML',
      skillIds: ['js.security', 'js.dom'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## The fixture tries a payload\n\n`#raw` starts with a fake script payload in a data attribute. Put that string into `#safe` with **`textContent`**. If you use `innerHTML`, you are practicing the bug.\n\nThe page should show the characters, not run them. On the safe-copy plate, the fox files the raw string as text so it cannot become a new node.'
        ),
        predict(
          'innerhtml',
          'Putting untrusted text into `innerHTML`…',
          [
            { id: 'fine', md: 'Is fine if you trust the lesson', misconceptionId: 'innerhtml-for-text' },
            { id: 'xss', md: 'Can turn text into elements / script' }
          ],
          'xss'
        ),
        tf(
          'innerhtml-fine',
          'Putting untrusted text into `innerHTML` is fine in a lesson.',
          false,
          {
            explainMd: 'innerHTML parses markup. Untrusted text can become elements. Use textContent for words.',
            misconceptionId: 'innerhtml-for-text'
          }
        ),
        domCode({
          id: 'safe-copy',
          prompt: '> Copy `#raw`’s `data-payload` into `#safe` using `textContent`.',
          hidden: true,
          hints: ladder(
            'Read the payload from the `data-payload` attribute on `#raw`.',
            'Write it onto `#safe` with `textContent`, not `innerHTML`.',
            'The characters should show. No `img` node should appear.',
            'const raw = document.querySelector("#raw")\ndocument.querySelector("#safe").textContent = raw.getAttribute("data-payload")'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Copy the payload as text. Do not parse it as markup.</p><p id="raw" data-payload="&lt;img src=x onerror=alert(1)&gt;">Payload is on data-payload</p><p id="safe"></p>',
        'Safe copy'
      ),
      'main.js': `// Copy data-payload onto #safe with textContent, not innerHTML.\n`,
      'hidden.test.js': `const safe = document.querySelector('#safe')
assert.ok(safe.textContent.includes('onerror'))
assert.strictEqual(safe.querySelector('img'), null)
`
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-filter-list-ui',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'Transfer: filter a beacon list',
      skillIds: ['js.dom', 'js.events'],
      estimatedMinutes: 25,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Filter in the page\n\nThe list is already in the tree. On `input` of `#q`, hide `li` nodes whose text does not include the query (case-insensitive). Use a class or `hidden` — do not rebuild innerHTML from a string of names.\n\nTyping `ea` should hide `North` and leave `East` visible. The filter tray already holds the names. You only show or hide them.'
        ),
        predict(
          'hide-not-rebuild',
          'The honest filter…',
          [
            { id: 'html', md: 'Writes a new innerHTML string of the matches' },
            { id: 'nodes', md: 'Shows/hides existing `li` nodes' }
          ],
          'nodes'
        ),
        tf(
          'filter-html',
          'The honest filter writes a new innerHTML string of the matches.',
          false,
          { explainMd: 'Keep the nodes. Hide the ones that do not match. Rebuilding innerHTML throws the tree away.' }
        ),
        domCode({
          id: 'filter-li',
          prompt: '> Typing `ea` in `#q` should hide `North` and leave `East` visible.',
          hidden: true,
          hints: ladder(
            'Listen for `input` on `#q`.',
            'For each `li` in `#list`, set `hidden` if its text does not include the query.',
            'Compare in lower case so `ea` matches `East`.',
            'const q = document.querySelector("#q")\nq.addEventListener("input", () => {\n  const needle = q.value.toLowerCase()\n  for (const li of document.querySelectorAll("#list li")) {\n    li.hidden = !li.textContent.toLowerCase().includes(needle)\n  }\n})'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Hide rows that do not match. Keep the nodes.</p><label for="q">Filter</label><input id="q" /><ul id="list"><li>North</li><li>East</li><li>West</li></ul>',
        'Filter tray'
      ),
      'main.js': `// On input of #q, hide li nodes that do not include the query.\n`,
      'hidden.test.js': `const q = document.querySelector('#q')
q.value = 'ea'
q.dispatchEvent(new Event('input', { bubbles: true }))
const vis = [...document.querySelectorAll('#list li')].filter((li) => !li.hidden).map((li) => li.textContent.trim())
assert.deepStrictEqual(vis, ['East'])
`
    }
  })

  out.push({
    doc: lesson({
      id: 'creation-signal-board',
      courseId: 'the-page',
      moduleId: 'live',
      title: 'Creation: signal board',
      skillIds: ['js.dom', 'js.events'],
      estimatedMinutes: 25,
      creation: { id: 'signal-board', step: 1, briefMd: 'A live list you can filter and keep.' },
      blocks: [
        explain(
          '## A board you keep\n\nAdd one `li` for each starter name already in `#seeds` (comma-separated), then keep the filter from the last lesson: `#q` hides non-matches.\n\nThe board is yours — export later from Studio. Split the seed line, grow the list as nodes, then let the filter hide what does not match. Do not paste the names as one innerHTML string.'
        ),
        predict(
          'seeds',
          'Starter names should become…',
          [
            { id: 'one-p', md: 'One paragraph of comma text' },
            { id: 'lis', md: 'One `li` per name' }
          ],
          'lis'
        ),
        tf(
          'seeds-p',
          'Starter names should become one paragraph of comma text.',
          false,
          { explainMd: 'Split the seed line. Create one li per name. Then filter those nodes.' }
        ),
        domCode({
          id: 'board',
          prompt: '> Build `#list` from `#seeds` text, and filter with `#q`.',
          hidden: true,
          hints: ladder(
            'Read `#seeds`, split on commas, and trim each name.',
            'Create an `li` for each name and append it to `#list`.',
            'Then bind the same hide-on-input filter you used on the last board.',
            'const list = document.querySelector("#list")\nconst names = document.querySelector("#seeds").textContent.split(",").map((s) => s.trim())\nfor (const name of names) {\n  const li = document.createElement("li")\n  li.textContent = name\n  list.append(li)\n}\nconst q = document.querySelector("#q")\nq.addEventListener("input", () => {\n  const needle = q.value.toLowerCase()\n  for (const li of list.querySelectorAll("li")) li.hidden = !li.textContent.toLowerCase().includes(needle)\n})'
          )
        })
      ]
    }),
    files: {
      'index.html': pageHtml(
        '<p>Grow the list from the seed line, then filter it.</p><p id="seeds">North,East,West</p><label for="q">Filter</label><input id="q" /><ul id="list"></ul>',
        'Signal board'
      ),
      'main.js': `// Build #list from #seeds, then filter with #q.\n`,
      'hidden.test.js': `assert.strictEqual(document.querySelectorAll('#list li').length, 3)
const q = document.querySelector('#q')
q.value = 'w'
q.dispatchEvent(new Event('input', { bubbles: true }))
const vis = [...document.querySelectorAll('#list li')].filter((li) => !li.hidden).map((li) => li.textContent.trim())
assert.deepStrictEqual(vis, ['West'])
`
    }
  })

  // Course 9
  out.push({
    doc: lesson({
      id: 'http-as-messages',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'HTTP as messages',
      skillIds: ['js.http'],
      estimatedMinutes: 15,
      blocks: [
        explain(
          '## Method, URL, status\n\nA request is a **method** (`GET`, `POST`…) plus a **URL**. A response is a **status** (200, 404, 500) plus a body. The desk sends a slip. The other side sends a slip back.\n\n`GET /beacons.json` asking for a list is a message, not a magic tunnel. This pack never opens the real network. A 404 is still an answer: this URL was not found.'
        ),
        predict(
          'request-parts',
          'A request is…',
          [
            { id: 'tunnel', md: 'A live tunnel that throws if the URL is missing' },
            { id: 'message', md: 'A method plus a URL (a message you send)' }
          ],
          'message'
        ),
        cloze(
          'http-bits',
          'A request has a {{a}} and a URL. HTTP 404 means {{b}}.',
          [
            { id: 'a', choices: ['method', 'promise', 'stack'] },
            { id: 'b', choices: ['the URL was not found', 'JavaScript always throws', 'the network never answered'] }
          ],
          { a: 'method', b: 'the URL was not found' },
          { explainMd: '404 is a normal response. fetch throws on network failure, not on a found-but-missing URL.' }
        ),
        check(
          'status-404',
          'HTTP 404 means…',
          [
            { id: 'throw-js', md: 'JavaScript always throws before you see a body', misconceptionId: 'res-ok-throws' },
            { id: 'not-found', md: 'The server answered: this URL was not found' }
          ],
          'not-found',
          { explainMd: 'fetch only throws on network failure or abort. 404 is a normal response with res.ok === false.' }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'method-and-headers',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'Method and headers',
      skillIds: ['js.http'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Method and labels\n\n`GET` asks to read. `POST` sends a body. The method is the verb on the slip. Headers are labels on that slip. `Content-Type` tells the other side how to read the body.\n\nThe address has structure too. `new URL(\"/beacons?kind=lamp\", \"https://desk.test\")` splits into `pathname` and `searchParams`, and `url.searchParams.set(\"kind\", \"beacon\")` edits a query safely — it escapes spaces and symbols so you never glue a broken address together by hand.\n\nThis lesson does not open the network. You only describe a request object. `describe({ method: \'POST\', headers: { \'content-type\': \'application/json\' } })` should print `POST application/json`. A GET with no content-type label prints `GET none`.'
        ),
        predict(
          'get-vs-post',
          '`GET` is for…',
          [
            { id: 'body', md: 'Sending a body the other side must store' },
            { id: 'read', md: 'Asking to read — a body is not required' }
          ],
          'read'
        ),
        cloze(
          'header-label',
          '`Content-Type` is a {{a}} on the message. If that header is missing, write {{b}}.',
          [
            { id: 'a', choices: ['label', 'status', 'URL'] },
            { id: 'b', choices: ['none', 'POST', '404'] }
          ],
          { a: 'label', b: 'none' },
          { explainMd: 'Headers are labels. Missing content-type is not an error here — describe it as none.' }
        ),
        stdoutCode({
          id: 'describe-req',
          prompt:
            '> `describe(req)` returns `` `${req.method} ${req.headers[\'content-type\'] || \'none\'}` ``. Print `describe` of a POST with `application/json`.',
          equals: 'POST application/json',
          hidden: true,
          hints: ladder(
            '`describe` reads `req.method` and the `content-type` header.',
            'If that header is missing, use the word `none`.',
            'Print a POST whose content-type is `application/json`.',
            "function describe(req) {\n  return `${req.method} ${req.headers['content-type'] || 'none'}`\n}\nconsole.log(describe({ method: 'POST', headers: { 'content-type': 'application/json' } }))\nmodule.exports = { describe }"
          )
        })
      ]
    }),
    files: {
      'main.js': `function describe(req) {
  return req.method
}
console.log(describe({ method: "POST", headers: { "content-type": "application/json" } }))
module.exports = { describe }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.describe({ method: 'GET', headers: {} }), 'GET none')
assert.strictEqual(m.describe({ method: 'POST', headers: { 'content-type': 'application/json' } }), 'POST application/json')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'fetch-ok-and-fail',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'res.ok vs throw',
      skillIds: ['js.http'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## 404 does not throw\n\nThe app stub answers `/missing` with status 404. `fetch` still resolves. `res.ok` is false. You throw *if you choose* after you look. A missing beacon list is still a response.\n\nPrint `ok` for `/beacons.json` and teach `read()` to throw when `!res.ok`. The desk got a slip back. The stamp says 404. That is not the same as the runner crashing.'
        ),
        predict(
          'fetch-404',
          '`await fetch("/missing")` on this stub…',
          [
            { id: 'throws', md: 'Throws immediately', misconceptionId: 'res-ok-throws' },
            { id: 'res', md: 'Resolves to a response with status 404' }
          ],
          'res'
        ),
        tf(
          'fetch-throws-404',
          '`await fetch("/missing")` throws immediately on this stub.',
          false,
          {
            explainMd: 'The stub still returns a response. res.ok is false. You throw after you look, if you choose.',
            misconceptionId: 'res-ok-throws'
          }
        ),
        stdoutCode({
          id: 'fetch-ok',
          prompt: '> `read("/beacons.json")` returns parsed JSON and prints `true` (`ok` field). Hidden: `/missing` throws.',
          equals: 'true',
          hidden: true,
          extraFiles: [
            { path: 'files/beacons.json', role: 'fixture' },
            { path: 'files/routes.json', role: 'fixture' }
          ],
          hints: ladder(
            '`fetch` resolves even when the status is 404.',
            'After `await fetch(url)`, throw if `!res.ok`.',
            'On success, return `res.json()` and print `d.ok` for `/beacons.json`.',
            'async function read(url) {\n  const res = await fetch(url)\n  if (!res.ok) throw new Error(String(res.status))\n  return res.json()\n}\nread("/beacons.json").then((d) => console.log(d.ok))\nmodule.exports = { read }'
          )
        })
      ]
    }),
    files: {
      'beacons.json': `{ "ok": true, "names": ["North"] }\n`,
      'routes.json': `{ "/missing": { "status": 404, "body": "{\\"ok\\":false}" } }\n`,
      'main.js': `async function read(url) {
  const res = await fetch(url)
  return res.json()
}
read("/beacons.json").then((d) => console.log(d.ok))
module.exports = { read }
`,
      'hidden.test.js': asyncAssert(`  const d = await m.read('/beacons.json')
  assert.strictEqual(d.ok, true)
  await m.read('/missing').then(
    () => { throw new Error('should reject') },
    () => undefined
  )
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'json-body',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'JSON body parse errors',
      skillIds: ['js.http'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Bad JSON is a throw from `res.json()`\n\n`/broken` returns `{` — not valid JSON. `res.json()` rejects. Catch that and return `"bad-json"`.\n\n**Run the starter first.** It crashes, and the stack trace is the lesson: the rejection came out of `res.json()`, not out of `fetch`. The status was fine; the body was torn.\n\nGood `/beacons.json` still parses. The fox asked for a record and got a torn slip. Handle the tear. Do not pretend the body was `{}`.'
        ),
        predict(
          'json-throw',
          '`res.json()` on `{` …',
          [
            { id: 'obj', md: 'Returns `{}`' },
            { id: 'throw', md: 'Rejects / throws a parse error' }
          ],
          'throw'
        ),
        tf(
          'json-empty',
          '`res.json()` on `{` returns `{}`.',
          false,
          { explainMd: 'A torn body is a parse error. Catch it. Do not invent an empty object.' }
        ),
        stdoutCode({
          id: 'parse-safe',
          debug: true,
          prompt: '> The starter throws on a torn body. Make `safeRead("/broken")` return `"bad-json"` instead. Print it.',
          equals: 'bad-json',
          hidden: true,
          extraFiles: [
            { path: 'files/beacons.json', role: 'fixture' },
            { path: 'files/routes.json', role: 'fixture' }
          ],
          hints: ladder(
            'The crash happens at the parse step, so that is the line to guard.',
            'Wrap `res.json()` in `try/catch`. The fetch itself succeeded.',
            '`try { return await res.json() } catch { return "bad-json" }` turns the throw into an answer.',
            'async function safeRead(url) {\n  const res = await fetch(url)\n  try { return await res.json() }\n  catch { return "bad-json" }\n}\nsafeRead("/broken").then((v) => console.log(v))\nmodule.exports = { safeRead }'
          )
        })
      ]
    }),
    files: {
      'beacons.json': `{ "ok": true }\n`,
      'routes.json': `{ "/broken": { "status": 200, "body": "{" } }\n`,
      'main.js': `async function safeRead(url) {
  const res = await fetch(url)
  return res.json()
}
safeRead("/broken").then((v) => console.log(v))
module.exports = { safeRead }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.safeRead('/broken')
  assert.strictEqual(v, 'bad-json')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'abort-and-timeout',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'AbortController against the mock',
      skillIds: ['js.http'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Cancel the wait\n\n`/slow` is delayed. `AbortController` + `fetch(url, { signal })` rejects with `AbortError` when you `abort()`. The wait ends because you said so, not because the body arrived.\n\nAbort immediately and print `aborted`. On the desk, you pull the slip back before the slow tray answers.'
        ),
        predict(
          'abort-name',
          'A fetch aborted via `signal` rejects with…',
          [
            { id: '404', md: 'A 404 response' },
            { id: 'abort', md: 'An error named `AbortError`' }
          ],
          'abort'
        ),
        tf(
          'abort-404',
          'A fetch aborted via `signal` rejects as a 404 response.',
          false,
          { explainMd: 'Abort rejects the fetch with an error named AbortError. It is not a 404 slip.' }
        ),
        stdoutCode({
          id: 'abort-now',
          prompt: '> Start `/slow`, abort, print `aborted`.',
          equals: 'aborted',
          hidden: true,
          extraFiles: [
            { path: 'files/beacons.json', role: 'fixture' },
            { path: 'files/routes.json', role: 'fixture' }
          ],
          hints: ladder(
            'Make an `AbortController` and pass `{ signal: c.signal }` to `fetch`.',
            'Call `c.abort()` right after you start `/slow`.',
            'In `catch`, return `aborted` when `e.name` is `AbortError`.',
            'async function race() {\n  const c = new AbortController()\n  const p = fetch("/slow", { signal: c.signal })\n  c.abort()\n  try { await p; return "ok" }\n  catch (e) { return e.name === "AbortError" ? "aborted" : "other" }\n}\nrace().then((v) => console.log(v))\nmodule.exports = { race }'
          )
        })
      ]
    }),
    files: {
      'beacons.json': `{ "ok": true }\n`,
      'routes.json': `{ "/slow": { "file": "beacons.json", "delayMs": 400 } }\n`,
      'main.js': `async function race() {
  return "ok"
}
race().then((v) => console.log(v))
module.exports = { race }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.race()
  assert.strictEqual(v, 'aborted')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'cors-mental-model',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'CORS is a browser rule',
      skillIds: ['js.http'],
      estimatedMinutes: 12,
      blocks: [
        explain(
          '## Not Node, not this sandbox\n\nThe **browser** asks: may this page’s origin read that response? CORS is an HTTP header conversation the *browser* enforces. A server can send `Access-Control-Allow-Origin`. The browser decides whether page JS may read the body.\n\nNode `fetch` and this lesson stub do **not** simulate CORS. `capabilities.network: false` also does not claim to be an OS firewall. The idea still matters when you later ship a page. The fox’s board in a browser is not the same as a Node script on the desk.'
        ),
        predict(
          'cors-who',
          'Who decides whether page code may read another origin’s body?',
          [
            { id: 'node', md: 'Node.js, on every `fetch`' },
            { id: 'browser', md: 'The browser, for that page’s origin' }
          ],
          'browser'
        ),
        tf(
          'cors-node',
          'Node.js enforces CORS on every `fetch`.',
          false,
          { explainMd: 'CORS is a browser rule for front-end origins. Node and this stub do not simulate it.' }
        ),
        check(
          'who-enforces',
          'Who enforces CORS?',
          [
            { id: 'node', md: 'Node.js on every `fetch`' },
            { id: 'browser', md: 'The browser, for front-end origins' }
          ],
          'browser',
          { explainMd: 'A server can send Access-Control-Allow-Origin. The browser decides whether page JS may read the body.' }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'transfer-library-search',
      courseId: 'talking-servers',
      moduleId: 'transfer',
      title: 'Transfer: search fixture JSON',
      skillIds: ['js.http', 'js.dom'],
      estimatedMinutes: 30,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Search, then render\n\n`GET /catalog.json` returns `{ items: [{ name, kind }] }`. On button click, fetch, filter names that include the query, and put matching names into `#results` as `li` nodes using `textContent`.\n\nClick `#go` with query `bea` should list `Beacon`, not `Rock`. Build each row as a node. Do not write a raw HTML string of names. The catalog desk already holds the query `bea`.'
        ),
        predict(
          'no-innerhtml',
          'Each result name should be set with…',
          [
            { id: 'html', md: '`innerHTML` of the ul', misconceptionId: 'innerhtml-for-text' },
            { id: 'text', md: '`textContent` on each `li`' }
          ],
          'text'
        ),
        tf(
          'results-html',
          'Each result name should be set with `innerHTML` of the ul.',
          false,
          {
            explainMd: 'Create an li per match and set textContent. innerHTML would parse names as markup.',
            misconceptionId: 'innerhtml-for-text'
          }
        ),
        domCode({
          id: 'search-ui',
          prompt: '> Click `#go` with query `bea` should list `Beacon` (from the fixture), not `Rock`.',
          hidden: true,
          extraFiles: [{ path: 'files/catalog.json', role: 'fixture' }],
          hints: ladder(
            'On click of `#go`, read `#q` and fetch `/catalog.json`.',
            'Filter `data.items` whose names include the query.',
            'Clear `#results`, then append one `li` per match with `textContent`.',
            'document.querySelector("#go").addEventListener("click", async () => {\n  const q = document.querySelector("#q").value.toLowerCase()\n  const res = await fetch("/catalog.json")\n  const data = await res.json()\n  const ul = document.querySelector("#results")\n  ul.replaceChildren()\n  for (const item of data.items) {\n    if (!item.name.toLowerCase().includes(q)) continue\n    const li = document.createElement("li")\n    li.textContent = item.name\n    ul.append(li)\n  }\n})'
          )
        })
      ]
    }),
    files: {
      'catalog.json': `{ "items": [{ "name": "Beacon", "kind": "light" }, { "name": "Rock", "kind": "block" }] }\n`,
      'index.html': pageHtml(
        '<p>Search the fixture. Render matches as list nodes.</p><label for="q">Query</label><input id="q" value="bea" /> <button type="button" id="go">Search</button><ul id="results"></ul>',
        'Catalog desk'
      ),
      'main.js': `// Click #go: fetch /catalog.json, put matching names into #results as li nodes.\n`,
      'hidden.test.js': `document.querySelector('#go').dispatchEvent(new MouseEvent('click', { bubbles: true }))
await new Promise((r) => setTimeout(r, 30))
const names = [...document.querySelectorAll('#results li')].map((n) => n.textContent)
assert.deepStrictEqual(names, ['Beacon'])
`
    }
  })

  return out
}
