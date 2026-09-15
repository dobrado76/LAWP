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
  fence,
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
          [
            '## Where values live',
            '',
            'The **stack** is the list of function calls that are running now. The **heap** is the bag of objects those frames point at. A frame is a short-lived slot: it appears when you enter a function and vanishes when that function returns. The object the frame pointed at is a different thing, and it lives on the heap until nothing still points at it.',
            '',
            'Why it bites: the fox calls `outer()`, which calls `inner()`. While `inner` runs it sits on top of the stack and holds a pointer at a beacon record. If you treat that record as “owned by the frame,” you expect it to vanish the instant `inner` returns. A later closure, or another variable, can still point at the same record — so a walk log the desk thought was gone is still live, and a later stamp rewrites yesterday’s heading.',
            '',
            fence(
              'javascript',
              `function outer() {
  const slip = { key: "north" } // heap object
  function inner() {
    return slip.key
  }
  return inner
}
const later = outer()
later() // "north" — slip still alive after outer returns`
            ),
            '',
            'The common mistake is thinking a heap object dies when its creating frame returns. The quizzes here ask which name sits on top of the stack while `inner` runs, and where the beacon record lives. There is no Try function to write — answer from the picture: the running call is on top, the object stays on the heap while anything still points at it.'
          ].join('\n')
        ),
        predict(
          'stack-top',
          'While `inner()` is running, called from `outer()`, the top of the stack is…',
          [
            { id: 'outer', md: '`outer`' },
            { id: 'inner', md: '`inner`' }
          ],
          'inner',
          { explainMd: 'The running function is on top. outer waits under it until inner returns.' }
        ),
        predict(
          'heap-home',
          'The beacon record `inner` points at lives on…',
          [
            { id: 'stack', md: 'The stack — it dies when `inner` returns' },
            { id: 'heap', md: 'The heap — it stays while something still points at it' }
          ],
          'heap',
          { explainMd: 'Objects live on the heap. The stack frame only holds the pointer. A later closure can keep that record alive after inner returns.' }
        ),
        tf(
          'frame-owns-object',
          'When `inner` returns, the heap object it pointed at is always gone.',
          false,
          { explainMd: 'The frame is gone. The object stays if anything still points at it — another variable, or a closure.' }
        ),
        cloze(
          'stack-heap-life',
          'A stack frame is {{a}}. A heap object stays {{b}}.',
          [
            { id: 'a', choices: ['short-lived', 'forever', 'the operating system'] },
            { id: 'b', choices: ['while something points at it', 'only while the frame runs', 'until the next timeout'] }
          ],
          { a: 'short-lived', b: 'while something points at it' },
          { explainMd: 'Calls come and go. Objects live until nothing points at them.' }
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
          [
            '## Sync, then the timeout tray',
            '',
            '`setTimeout(fn, 0)` does **not** mean “run now.” It means “put `fn` on the macrotask queue.” Sync work already on the stack finishes first. Only after that stack is empty does the desk look at the timeout tray. Zero is a delay of “as soon as this tray is served,” not “jump the line.”',
            '',
            'Why it bites: a fox walk that schedules `setTimeout(..., 0)` and then keeps doing sync work will not stamp the timeout until that work is done. If you fire the timeout lamp while the sync lamp is still dark, you invent an order the runtime cannot produce — the desk records a fault, and a heading that should have been filed first is missing when the later slip arrives.',
            '',
            fence(
              'javascript',
              `console.log("sync")
setTimeout(() => {
  console.log("timeout") // after the stack is empty
}, 0)
console.log("still-sync")
// prints: sync, still-sync, timeout`
            ),
            '',
            'The common mistake is reading `0` as “now, on top of the running function.” On Try, the desk has two lamps: **1 Sync work** and **2 setTimeout(fn, 0)**. Light them in that order. The third tray — `promise.then` — arrives in the next lesson and does not wait its turn behind timeouts.'
          ].join('\n')
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
          [
            '## `then` is not a timeout',
            '',
            'After the stack clears, JavaScript empties the **microtask** queue — `promise.then`, `queueMicrotask` — *before* the next timer. A `then` is a note on a faster tray than `setTimeout`. They are not two names for the same list. The runtime drains every waiting microtask, then serves one macrotask such as a timeout, then checks microtasks again.',
            '',
            'Why it bites: the fox files a promise and also asks the desk to wait zero ticks. If you treat those as the same tray, you light the timeout lamp first and stamp a heading that the live page would not have written yet. A signal board that paints “ready” from `setTimeout(0)` can flash before the `then` that actually holds the beacon list, and the fox walks on stale names.',
            '',
            fence(
              'javascript',
              `console.log("sync")
Promise.resolve().then(() => {
  console.log("then") // microtask — before the timer
})
setTimeout(() => {
  console.log("timeout")
}, 0)
// prints: sync, then, timeout`
            ),
            '',
            'The common mistake is lining `then` up behind `setTimeout` because both “feel later.” On Try, light the desk in real event-loop order: sync, then `then`, then timeout. The predict question asks which queue should light next after the sync call. Do not invent a fourth lamp — three trays, that order.'
          ].join('\n')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Pending, fulfilled, rejected',
            '',
            'A Promise starts **pending**. It becomes **fulfilled** with a value or **rejected** with a reason. After that, the state sticks. You cannot send it back to pending, and you cannot fulfill it a second time with a different stamp. `Promise.resolve("locked")` is already fulfilled — the desk already stamped the slip before you held it.',
            '',
            'Why it bites: a beacon key that is already locked is still a promise. If you treat “already resolved” as “not a promise,” you return a bare string and a later `.then` explodes, or you wait for a tick that will never come because you expected pending forever. Night shift then files the key as `open` because nobody read the slip that was already on the desk.',
            '',
            fence(
              'javascript',
              `const slip = Promise.resolve("locked")
// slip is fulfilled now — not pending
slip.then((v) => {
  console.log(v) // locked
})`
            ),
            '',
            'The common mistake is returning a plain string from `label` because the value is already known. On Try, `label()` must return a Promise — for example `Promise.resolve("locked")` — not a bare string. Print the fulfilled value with `.then`. `await` comes next; this lesson only reads the already-stamped slip.'
          ].join('\n')
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
          prompt:
            '> `label()` must return a Promise (e.g. `Promise.resolve("locked")`), not a bare string. Print the fulfilled value.',
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
      'hidden.test.js': asyncAssert(`  const p = m.label()
  assert.ok(p instanceof Promise, 'label must return a Promise')
  const v = await p
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Sugar over promises',
            '',
            'An `async function` always returns a Promise. `await` pauses **that** function until the promise settles, then continues with the value. Other JavaScript on the page can still run. The operating system is not frozen. The spelling is sugar over the same trays you already lined up: the function yields, microtasks drain, and later this function picks up again.',
            '',
            'Why it bites: the fox can `await` a wait on the field while the desk still lights other lamps. If you believe `await` freezes the machine, you stop scheduling anything else — or you skip `await` and treat the return as a string. Then `label` hands back a promise you never opened, and the board prints `[object Promise]` instead of the keyed stamp.',
            '',
            fence(
              'javascript',
              `async function label() {
  await Promise.resolve() // pauses only this function
  return "keyed"
}
label().then((v) => {
  console.log(v) // keyed
})`
            ),
            '',
            'The common mistake is `return "keyed"` with no `await`, or thinking the whole page stops. On Try, `async function label()` must `await` a real promise such as `Promise.resolve()`, then return `"keyed"`. Do not just `return "keyed"`. Print the result. Only the fox’s function is paused; when the promise settles, that function continues with the value.'
          ].join('\n')
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
          prompt:
            '> `async function label()` must `await` a real promise (e.g. `Promise.resolve()`), then return `"keyed"`. Do not just `return "keyed"`. Print it.',
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
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/await\\s+/.test(src), 'await a promise inside label')
  assert.ok(/Promise\\.resolve|new\\s+Promise/.test(src), 'await a real Promise, not only the return word')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## `await` a rejection inside `try`',
            '',
            '`await Promise.reject(new Error("lost"))` throws into the async function. `try/catch` works the same as a sync throw. The rejection becomes an exception at the `await` line. If you do not catch it, the function’s own promise rejects — it does not quietly become `undefined`.',
            '',
            'Why it bites: a lost key is a failed slip. If you skip `try` and assume a rejected `await` is `undefined`, the fox walk continues as if the key were in the drawer. Night shift then stamps `ok` on a desk that never held the key, or the rejection leaks out and the whole page shows an unhandled rejection instead of the word `lost`.',
            '',
            fence(
              'javascript',
              `async function readKey() {
  try {
    await Promise.reject(new Error("lost"))
  } catch (e) {
    return e.message // lost
  }
}`
            ),
            '',
            'The common mistake is `return "lost"` with no reject, or letting the await reject and hoping the value is empty. On Try, `readKey()` must `await Promise.reject(...)` inside `try/catch` and return `e.message`. Do not hard-code `return "lost"`. Print that message. Handle the failed slip in the same function.'
          ].join('\n')
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
          prompt:
            '> `readKey()` must `await Promise.reject(...)` inside `try/catch` and return `e.message`. Do not hard-code `return "lost"`. Print it.',
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
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/Promise\\.reject/.test(src), 'await Promise.reject')
  assert.ok(/await\\s+/.test(src), 'await the rejection')
  assert.ok(/try\\s*\\{/.test(src) && /catch\\s*\\(/.test(src), 'use try/catch around the await')
  assert.ok(!/return\\s+[\"']lost[\"']/.test(src), 'return e.message from catch, not a hardcoded string')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Three waits, one `Promise.all`',
            '',
            '`await Player.wait(1)` three times in a row is **sequence**. Each pause starts after the last one finishes, so three one-tick waits cost three ticks. `Promise.all([Player.wait(1), Player.wait(1), Player.wait(1)])` starts them together. They overlap. The whole group finishes when the slowest one finishes — three equal waits cost about one tick of wall time, not the sum.',
            '',
            'Why it bites: the fox needs three radio checks before it walks east to the beacon at (3, 0). Await-in-a-loop makes the yard sit still three times as long. A signal desk that polls three lamps in sequence misses the window, and the walk starts late. Trees and a wall sit off the path so the yard looks like a field, not a blank strip — staying on y = 0 is the honest path.',
            '',
            fence(
              'javascript',
              `// sequence: three ticks, one after another
await Player.wait(1)
await Player.wait(1)
await Player.wait(1)
// overlap: one Promise.all, then the walk
await Promise.all([
  Player.wait(1),
  Player.wait(1),
  Player.wait(1)
])`
            ),
            '',
            'The common mistake is three awaited waits in a row, or walking before the group finishes. On Try, `go()` must use `Promise.all` with three `Player.wait(1)` calls, then walk east to (3, 0). The source must include `Promise.all`. Finish the waiting before the walking.'
          ].join('\n')
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
          prompt:
            '> Use `Promise.all` with three `Player.wait(1)` calls, then walk east to (3, 0). The source must include `Promise.all`.',
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
            'One `Promise.all` of three waits, then three east moves.',
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
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(/Promise\\.all\\s*\\(/.test(src), 'overlap the waits with Promise.all')
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
          [
            '## Three ways to wait for a group',
            '',
            '`Promise.all([a, b, c])` resolves with an array of results in the order you passed them — **or** rejects the moment any one of them rejects. You do not get the results that did arrive. Use it when every part is required. `Promise.allSettled` never rejects: it resolves with one row per promise, fulfilled or rejected. `Promise.race` settles with whichever settles first, win or lose — that is how a timeout is built.',
            '',
            'Why it bites: four beacons are polled and one is dark. `Promise.all` throws on that failure and the desk learns nothing about the three that answered. Night shift then marks the whole field dead. `race` is the other trap: a fast rejection wins, so a flaky lamp can cancel a good read that was one tick away.',
            '',
            fence(
              'javascript',
              `const rows = await Promise.allSettled([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.reject(new Error("no"))
])
// rows[0].status === "fulfilled"
// rows[2].status === "rejected"
const ok = rows.filter((r) => r.status === "fulfilled").length
// ok === 2`
            ),
            '',
            'The common mistake is using `all` when you wanted a report, or counting `rows.length` as successes. On Try, `report(jobs)` awaits every job with `Promise.allSettled` and returns a string like `ok:2 failed:1`. Print `report` of two resolved jobs and one rejected one. Filter on `status`, do not assume the group is all-or-nothing.'
          ].join('\n')
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
          [
            '## A stream of steps',
            '',
            '`async function* steps() { yield "east"; yield "south" }` is a function that hands you one direction at a time. Each `yield` can wait. You do not get the whole list up front. `for await (const d of steps())` waits for each yield, then continues. It is for async iterables — and it can walk a sync iterable too — not only ordinary arrays you already hold in memory.',
            '',
            'Why it bites: the fox reads east, then south, then joins the two words. If you `return` the first yield and skip `for await`, the board prints `east` and the south slip never files. If you treat the generator as an array and call `.map` on it, you get a silent empty walk because the values were never pulled. Each slip arrives when it is ready; you file the next one after that.',
            '',
            fence(
              'javascript',
              `async function* steps() {
  yield "east"
  yield "south"
}
const out = []
for await (const d of steps()) out.push(d)
out.join("-") // "east-south"`
            ),
            '',
            'The common mistake is joining only the first yield, or using a plain `for...of` on an async generator and missing the wait. On Try, `async function* steps` yields `east` then `south`. `join` should `for await` each yield into an array, then `join("-")`, and print `east-south`. Export both `steps` and `join`.'
          ].join('\n')
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
          [
            '## Wait, then walk',
            '',
            '`Player.wait(ticks)` logs a pause. Studio replay honors it. The world does not move during `wait`. Time passes. The fox stays in the same cell. Wait is a clock, not a step: `x` and `y` do not change until you write `Player.move` after the await. The beacon is already at (2, 1). The wait is not a step toward it.',
            '',
            'Why it bites: if you treat wait as a slide toward the lamp, the fox never leaves (0, 0) and the timed walk fails the transfer. If you skip the await, the moves fire at once and the log shows walking during the pause the desk asked for. A flag and a tree sit off that path so the yard is a field, not an empty box — stay on two east cells, then one south.',
            '',
            fence(
              'javascript',
              `async function go() {
  await Player.wait(2) // still at (0, 0)
  Player.move("east")
  Player.move("east")
  Player.move("south") // now (2, 1)
}`
            ),
            '',
            'The common mistake is walking first, or expecting `wait` to change the cell. On Try, `go()` must `await Player.wait(2)` then walk east, east, south onto the beacon. The hidden test checks that a wait of two ticks is in the log. Write the moves after the await, not instead of it.'
          ].join('\n')
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
          [
            '## The key is “collected” too late',
            '',
            '`Player.wait` **logs when the timer finishes**, not when you call it. If you forget `await`, the next `move` is written at once. The wait line appears later, when the timer resolves. The story says: say `keyed` only after the wait, *then* walk onto the key. The honest log is wait → say → move.',
            '',
            'Why it bites: the fox stands just north of the key at (2, 4). A missing `await` makes the walk happen before the desk stamps the wait. The stage shows the key taken while the pause is still pending, so the replay says the fox grabbed the key during the radio check. Night shift then files “collected” on a slip that was not yet stamped.',
            '',
            fence(
              'javascript',
              `async function collect() {
  Player.wait(1) // forgot await — move is logged first
  Player.say("keyed")
  Player.move("south")
}
// broken log: say, move, then wait
// fixed: await Player.wait(1), then say, then move`
            ),
            '',
            'The common mistake is calling `wait` like a sync pause. On Try, fix `collect()` so you await the wait, `Player.say("keyed")`, then move south onto the key at (2, 4). The starter already calls `wait` without awaiting it. One south step is enough — the key and beacon share that cell.'
          ].join('\n')
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
          [
            '## Nodes, not one long string',
            '',
            'The page is a tree of nodes. `document.body` is an element. Changing `textContent` changes a node. You do not rebuild the whole HTML string to rename a heading. `document.querySelector("h1")` returns that heading node, or `null` if it is missing — it does not return the tag as a string you later paste back.',
            '',
            'Why it bites: the channel plate still says “Old radio.” If you treat the document as one long string and rewrite `index.html` in memory, you drop listeners, lose the rest of the tree, and the plate flickers. A later filter or click handler was hanging on a node you threw away. The heading is a node on this board; rename that node.',
            '',
            fence(
              'javascript',
              `const title = document.querySelector("#title")
title.textContent = "Signal desk"
// the h1 node is still the same node
// only its text changed`
            ),
            '',
            'The common mistake is thinking `querySelector` hands you markup text, or rebuilding the page as one string. On Try, set the `h1#title` text to `Signal desk`. Find the heading node and write `textContent`. Do not rewrite the HTML file as a string. The plate should read Signal desk after you change the node.'
          ].join('\n')
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
          [
            '## Find, then write text',
            '',
            '`querySelector` takes a CSS selector: `#id`, `.class`, `li`. It returns one node or `null`. A miss is `null`, not `""`. It does not return the HTML as a string. You find the node, then you write the word. For plain text, use `textContent`, not `innerHTML` — you are labeling a tag, not parsing markup.',
            '',
            'Why it bites: the beacon tag on the desk is already a node. If you skip the null check and call `textContent` on a miss, the page throws and the live name never updates. If you stuff the word into `innerHTML`, a later typed name can become a node. Filing `North` as markup is how a call sign turns into an unexpected element on the plate.',
            '',
            fence(
              'javascript',
              `const tag = document.querySelector("#beacon-name")
// querySelector("#nope") would be null — check before you write
tag.textContent = "North"
// tag now reads North; still the same p node`
            ),
            '',
            'The common mistake is treating a miss as an empty string, or using `innerHTML` for a plain name. On Try, `#beacon-name` should read `North`. Find it with a selector, then set `textContent`. Do not use `innerHTML` for this word. The name field is already a node — you only write the label.'
          ].join('\n')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Grow the tree',
            '',
            '`document.createElement("li")` makes a node that is not on the page yet. Set `textContent`, then `ul.append(li)` to hang it on the list. After that, `li.parentNode` is the `ul`, not `document`. `li.remove()` takes a node off. You grow the tree one node at a time. You do not concatenate HTML strings to add one item.',
            '',
            'Why it bites: the beacon log starts empty. If you assign `innerHTML` to paste `<li>East</li>`, you throw away any later listeners on that list and you parse the name as markup. A heading that someone typed with a `<` becomes a broken row. Night shift then cannot remove one slip because there is no `li` node they created — only a rebuilt string.',
            '',
            fence(
              'javascript',
              `const li = document.createElement("li")
li.textContent = "East"
document.querySelector("#list").append(li)
// li.parentNode is the ul, not document`
            ),
            '',
            'The common mistake is building the list with `innerHTML`, or creating the `li` and never appending it. On Try, create an `li` with `createElement`, set text `East`, and `append` it to `#list`. Do not build the list with `innerHTML`. One node is enough. The log tray starts empty; hang the row on it.'
          ].join('\n')
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
          prompt:
            '> Create an `li` with `createElement`, set text `East`, and `append` it to `#list`. Do not build the list with `innerHTML`.',
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
assert.ok(/createElement\\s*\\(/.test(__learnerSource), 'use createElement')
assert.ok(/\\.append\\s*\\(|appendChild\\s*\\(/.test(__learnerSource), 'append the node')
assert.ok(!/innerHTML\\s*=/.test(__learnerSource), 'do not build the list with innerHTML')
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
          [
            '## target vs currentTarget',
            '',
            'The event starts at the clicked node (`target`) and bubbles up. `currentTarget` is the node whose listener is running. They are often different. One listener on a parent can hear a click on a child because the event travels. The inner ping is the target. The outer nest is the listener.',
            '',
            'Why it bites: you click the inner button and write `event.currentTarget.id` thinking it is the ping. The board prints `outer` and the relay nest looks like the parent was clicked. Or you listen only on `#inner` and a later nested control never reports. The desk then files the wrong nest id, and the fox walk log says the outer plate was pressed when the inner ping was the actual hit.',
            '',
            fence(
              'javascript',
              `document.querySelector("#outer").addEventListener("click", (e) => {
  // click #inner: e.target.id is "inner"
  // e.currentTarget.id is "outer"
  const line = e.target.id + ">" + e.currentTarget.id
  document.querySelector("#out").textContent = line // inner>outer
})`
            ),
            '',
            'The common mistake is swapping target and currentTarget, or binding only the child. On Try, listen on `#outer`. On click, write `targetId>currentId` into `#out`. The hidden test clicks `#inner`. Join the two ids with `>`. The nest listener should still hear the inner ping.'
          ].join('\n')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Delegation',
            '',
            'One listener on `ul#list` can handle clicks on any `button` inside, including buttons you add later. The click still bubbles to the parent. Check `event.target.matches("button")` or use `closest("button")` so a click on the button text still counts. You do not bind each button by hand. New children are covered without a new listener.',
            '',
            'Why it bites: North and East are already listed. If you `querySelectorAll("button")` and bind each one, a West button appended after bind is silent. The pick board then leaves `#picked` blank when night shift adds a channel. The fox files no heading, and the live list looks broken even though the new button is visible.',
            '',
            fence(
              'javascript',
              `document.querySelector("#list").addEventListener("click", (e) => {
  const b = e.target.closest("button")
  if (!b) return
  document.querySelector("#picked").textContent = b.getAttribute("data-name")
})`
            ),
            '',
            'The common mistake is binding each button, or reading `e.target` when the click landed on text inside the button. On Try, one listener on `#list`: clicking a button sets `#picked` to that button’s `data-name`. The hidden test also clicks a button appended *after* your bind. Clicking East should write `East`. Use `closest("button")` so the text click still counts.'
          ].join('\n')
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
          prompt:
            '> One listener on `#list`: clicking a button sets `#picked` to that button’s `data-name`. Hidden test also clicks a button appended *after* your bind.',
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
const late = document.createElement('button')
late.type = 'button'
late.setAttribute('data-name', 'West')
late.textContent = 'W'
document.querySelector('#list').append(late)
document.querySelector('#picked').textContent = ''
late.dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#picked').textContent, 'West', 'parent listener must hear buttons added after bind')
assert.ok(/#list|getElementById\\(\\s*['\"]list['\"]\\s*\\)|querySelector\\(\\s*['\"]ul/.test(__learnerSource) || /addEventListener/.test(__learnerSource), 'bind the parent')
assert.ok(!/querySelectorAll\\(\\s*['\"]button/.test(__learnerSource), 'do not bind each button by hand')
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
          [
            '## The live value',
            '',
            'The `input` event fires as the person types. Read `event.target.value` (or the input’s `.value`). That string is the live field. A text input does not keep its typed words on `innerHTML`. The echo plate should follow each key: every letter the fox types appears on the line below as it is typed, not after a submit.',
            '',
            'Why it bites: if you copy `innerHTML` of the input, you get an empty string or leftover markup and the echo line stays blank. If you listen for `change` only, the plate updates when the field blurs, so a call sign the fox is still typing never shows. Night shift then files a stale sign, or no sign, while the field on the desk already says Beacon.',
            '',
            fence(
              'javascript',
              `document.querySelector("#name").addEventListener("input", (e) => {
  document.querySelector("#echo").textContent = e.target.value
})
// each key updates #echo from .value, not innerHTML`
            ),
            '',
            'The common mistake is reading `innerHTML` of the field, or binding `click` instead of `input`. On Try, mirror `#name` into `#echo` on `input`. Listen on `#name`, read `e.target.value` each time, and write that string into `#echo` with `textContent`. Type a call sign — the echo line should follow each key.'
          ].join('\n')
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
          [
            '## Submit does not have to leave',
            '',
            'A form’s default submit reloads or leaves the page. `event.preventDefault()` stops that default. The listener still runs. You keep the typed words on this desk. `preventDefault` does not copy the value for you — it only stops the leave. You still read `#q` and write `#out` yourself, with `textContent` for plain words.',
            '',
            'Why it bites: the fox files a query and the board goes blank because submit navigated away. The echo of `North` vanishes, listeners die, and the desk looks empty. If you skip `preventDefault` and only write `#out`, a real browser still leaves before anyone reads the line. Night shift finds no query on the plate.',
            '',
            fence(
              'javascript',
              `document.querySelector("#desk").addEventListener("submit", (e) => {
  e.preventDefault() // stay on this board
  document.querySelector("#out").textContent =
    document.querySelector("#q").value
})`
            ),
            '',
            'The common mistake is thinking `preventDefault` copies the field, or listening for `click` on the button instead of `submit` on the form. On Try, listen for `submit` on `#desk`. Prevent the default. Copy `#q` into `#out` with `textContent`. File the query on this desk. Do not let submit leave the board.'
          ].join('\n')
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
          [
            '## A button should be a button',
            '',
            'A `div` with a click is a trap for keyboard and screen readers. It has no button role, no default keyboard activation, and often no accessible name. Use `<button>`. The **accessible name** is often the text content, or `aria-label`. The call switch on the desk needs a name a reader can speak. `#call` is already a real button — do not replace it with a div.',
            '',
            'Why it bites: a fox who tabs the page never reaches a click-only `div`, so Call north never fires and the north lamp stays dark. A reader that speaks the control says “div” or nothing. Filing a nameless switch is how night shift presses the wrong plate. `innerHTML` for this phrase is the other trap: a later edited name can become markup.',
            '',
            fence(
              'html',
              `<button type="button" id="call">Call north</button>
<!-- a real button: role, keyboard, spoken name from its text -->
<div onclick="...">Call</div>
<!-- not a button: no role, no Enter/Space, weak name -->`
            ),
            '',
            'The common mistake is swapping the button for a `div` with `onclick`, or using `innerHTML` for a plain label. On Try, `#call` is a button. Set its accessible name (text) to `Call north` with `textContent`. Do not replace it with a div. The spoken name here is the button’s text.'
          ].join('\n')
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
          [
            '## The fixture tries a payload',
            '',
            '`#raw` starts with a fake script payload in a data attribute. Put that string into `#safe` with **`textContent`**. If you use `innerHTML`, you are practicing the bug: the browser parses the string as markup. Untrusted text can become elements. The page should show the characters, not run them. A lesson is not a license to parse a payload.',
            '',
            'Why it bites: the fox files the raw string as text so it cannot become a new node. If you assign `innerHTML`, an `img` with `onerror` can appear under `#safe`. The safe-copy plate then grows a node the fixture never meant to render. Night shift thinks the payload was “just a string” and the board already executed it.',
            '',
            fence(
              'javascript',
              `const raw = document.querySelector("#raw")
const payload = raw.getAttribute("data-payload")
document.querySelector("#safe").textContent = payload
// characters show; querySelector("img") under #safe is null`
            ),
            '',
            'The common mistake is `innerHTML` because “it is only a lesson.” On Try, copy `#raw`’s `data-payload` into `#safe` using `textContent`. The characters should show. No `img` node should appear. Read the attribute, write the text. Do not parse it as markup.'
          ].join('\n')
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
          [
            '## Filter in the page',
            '',
            'The list is already in the tree. On `input` of `#q`, hide `li` nodes whose text does not include the query (case-insensitive). Use a class or `hidden`. Do not rebuild `innerHTML` from a string of names. The honest filter shows or hides existing nodes. Rebuilding the list throws the tree away and drops any state those rows had.',
            '',
            'Why it bites: typing `ea` should hide `North` and leave `East` visible. If you rewrite `innerHTML` each key, a later click listener on a row dies, and a name with a `<` becomes a broken tag. The filter tray already holds the names. Night shift then sees a flicker and a list that forgot which row was picked.',
            '',
            fence(
              'javascript',
              `const q = document.querySelector("#q")
q.addEventListener("input", () => {
  const needle = q.value.toLowerCase()
  for (const li of document.querySelectorAll("#list li")) {
    li.hidden = !li.textContent.toLowerCase().includes(needle)
  }
})
// "ea" hides North, leaves East`
            ),
            '',
            'The common mistake is writing a new innerHTML string of the matches, or comparing without lower case so `ea` misses `East`. On Try, typing `ea` in `#q` should hide `North` and leave `East` visible. Listen for `input` on `#q`. For each `li` in `#list`, set `hidden` if its text does not include the query. Keep the nodes.'
          ].join('\n')
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
          [
            '## A board you keep',
            '',
            'Add one `li` for each starter name already in `#seeds` (comma-separated), then keep the filter from the last lesson: `#q` hides non-matches. Split the seed line, trim each name, grow the list as nodes. The board is yours — export later from Studio. Starter names should become one `li` per name, not one paragraph of comma text.',
            '',
            'Why it bites: if you paste `North,East,West` as one `innerHTML` string, you get a single blob or parsed markup, and the filter cannot hide `West` alone. If you skip the filter, typing `w` still shows every row. Night shift opens the kept board and cannot find the west lamp because the seeds never became rows.',
            '',
            fence(
              'javascript',
              `const list = document.querySelector("#list")
const names = document.querySelector("#seeds").textContent
  .split(",")
  .map((s) => s.trim())
for (const name of names) {
  const li = document.createElement("li")
  li.textContent = name
  list.append(li)
}`
            ),
            '',
            'The common mistake is leaving `#list` empty, or dumping the seed line into one element. On Try, build `#list` from `#seeds` text, and filter with `#q`. Create an `li` for each trimmed name and append it. Then bind the same hide-on-input filter: typing `w` should leave `West` visible. Do not paste the names as one innerHTML string.'
          ].join('\n')
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
          [
            '## Method, URL, status',
            '',
            'A request is a **method** (`GET`, `POST`…) plus a **URL**. A response is a **status** (200, 404, 500) plus a body. The desk sends a slip. The other side sends a slip back. `GET /beacons.json` asking for a list is a message, not a magic tunnel. This pack never opens the real network. You still describe the same shape the live desk will use later.',
            '',
            'Why it bites: if you treat HTTP as a live tunnel that throws when a URL is missing, you never look at a 404 body and the fox walk log says “the network never answered.” A missing beacon list is still a slip: the stamp says 404, this URL was not found. Night shift then retries forever, or assumes JavaScript always threw before a body existed.',
            '',
            fence(
              'javascript',
              `const request = { method: "GET", url: "/beacons.json" }
const response = { status: 404, body: '{"ok":false}' }
// 404 is an answer — the URL was not found
// fetch throws on network failure, not on this stamp`
            ),
            '',
            'The common mistake is thinking 404 means JavaScript always throws before you see a body. There is no Try function here — the questions ask what a request is, and what HTTP 404 means. Answer: a method plus a URL, and the server answered that this URL was not found. `fetch` throws on network failure or abort, not on a found-but-missing path.'
          ].join('\n')
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
          [
            '## Method and labels',
            '',
            '`GET` asks to read — a body is not required. `POST` sends a body. The method is the verb on the slip. Headers are labels on that slip. `Content-Type` tells the other side how to read the body. Missing that header is not an error in this lesson: you describe it as `none`. This lesson does not open the network. You only describe a request object.',
            '',
            'Why it bites: a POST of JSON with no content-type label leaves the other desk guessing. Night shift parses the body as text and the beacon names stay strings inside a string. A GET that you describe as if it must store a body also lies about the verb. The fox files `POST` when the slip was a read, and the log cannot be replayed.',
            '',
            fence(
              'javascript',
              `function describe(req) {
  return req.method + " " + (req.headers["content-type"] || "none")
}
describe({ method: "POST", headers: { "content-type": "application/json" } })
// "POST application/json"
describe({ method: "GET", headers: {} })
// "GET none"`
            ),
            '',
            'The common mistake is returning only `req.method`, or crashing when the header is missing. On Try, `describe(req)` returns the method, a space, and the `content-type` header or `none`. Print `describe` of a POST with `application/json`. A GET with no content-type label must print `GET none`.'
          ].join('\n')
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
          [
            '## 404 does not throw',
            '',
            'The app stub answers `/missing` with status 404. `fetch` still resolves. `res.ok` is false. You throw *if you choose* after you look. A missing beacon list is still a response. The desk got a slip back. The stamp says 404. That is not the same as the runner crashing. `fetch` throws on network failure or abort, not on this status.',
            '',
            'Why it bites: if you `return res.json()` without looking at `res.ok`, `read("/missing")` returns `{ ok: false }` and the fox walk continues as if the list arrived. Night shift then paints an empty board and calls it success. The other trap is expecting `await fetch("/missing")` to throw immediately — you never write the status check because you thought the runtime already failed.',
            '',
            fence(
              'javascript',
              `async function read(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}
// /beacons.json → { ok: true, ... }
// /missing → throw after you look, status 404`
            ),
            '',
            'The common mistake is skipping the `ok` check, or assuming fetch throws on 404. On Try, `read("/beacons.json")` returns parsed JSON and prints `true` (`ok` field). Hidden: `/missing` throws. After `await fetch(url)`, throw if `!res.ok`. On success, return `res.json()`. The stub still returns a response; you decide what a bad stamp means.'
          ].join('\n')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Bad JSON is a throw from `res.json()`',
            '',
            '`/broken` returns `{` — not valid JSON. `res.json()` rejects. Catch that and return `"bad-json"`. The fetch itself succeeded. The status was fine; the body was torn. **Run the starter first.** It crashes, and the stack trace is the lesson: the rejection came out of `res.json()`, not out of `fetch`. Good `/beacons.json` still parses. Do not invent `{}` for a torn body.',
            '',
            'Why it bites: the fox asked for a record and got a torn slip. If you let the parse throw, the whole page dies. If you always return `"bad-json"`, the good list never paints. If you swallow the error and return `{}`, night shift files an empty beacon object and the walk log looks complete. Handle the tear. Do not pretend the body was empty.',
            '',
            fence(
              'javascript',
              `async function safeRead(url) {
  const res = await fetch(url)
  try {
    return await res.json()
  } catch {
    return "bad-json" // torn body, not a missing URL
  }
}`
            ),
            '',
            'The common mistake is wrapping `fetch` and not `res.json()`, or always returning `"bad-json"`. On Try, the starter throws on a torn body. Make `safeRead("/broken")` return `"bad-json"`. Good JSON (for example `/beacons.json`) must still parse. Print the broken case. Guard the parse step — that is the line that crashes.'
          ].join('\n')
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
          prompt:
            '> The starter throws on a torn body. Make `safeRead("/broken")` return `"bad-json"`. Good JSON (e.g. `/beacons.json`) must still parse — do not always return `"bad-json"`. Print the broken case.',
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
  const good = await m.safeRead('/beacons.json')
  assert.strictEqual(good.ok, true, 'good JSON must still parse')
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
      taskRev: 3,
      blocks: [
        explain(
          [
            '## Cancel the wait',
            '',
            '`/slow` is delayed. `AbortController` plus `fetch(url, { signal })` rejects with an error named `AbortError` when you `abort()`. The wait ends because you said so, not because the body arrived. It is not a 404 slip. On the desk, you pull the slip back before the slow tray answers. The fetch never becomes a normal response.',
            '',
            'Why it bites: if you let `/slow` run, the fox sits on the field until the mock delay finishes and a later heading is late. If you `return "aborted"` with no controller, the hidden test fails and you never practiced cancel. Night shift then thinks the body arrived, or that abort is a 404, and retries the wrong path.',
            '',
            fence(
              'javascript',
              `async function race() {
  const c = new AbortController()
  const p = fetch("/slow", { signal: c.signal })
  c.abort()
  try {
    await p
    return "ok"
  } catch (e) {
    return e.name === "AbortError" ? "aborted" : "other"
  }
}`
            ),
            '',
            'The common mistake is hard-coding `return "aborted"` without `AbortController`, or treating abort as a 404 response. On Try, start `/slow` with an `AbortController` `signal`, abort, print `aborted`. Pass `{ signal: c.signal }` to `fetch`. Return `aborted` from the `AbortError` path, not a hardcoded string. Pull the slip back; do not wait for the slow tray.'
          ].join('\n')
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
          prompt:
            '> Start `/slow` with an `AbortController` `signal`, abort, print `aborted`. Do not hard-code `return "aborted"` without the controller.',
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
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/AbortController/.test(src), 'use AbortController')
  assert.ok(/signal/.test(src), 'pass signal to fetch')
  assert.ok(!/return\\s+[\"']aborted[\"']/.test(src), 'return aborted from the AbortError path, not a hardcoded string')
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
          [
            '## Not Node, not this sandbox',
            '',
            'The **browser** asks: may this page’s origin read that response? CORS is an HTTP header conversation the *browser* enforces. A server can send `Access-Control-Allow-Origin`. The browser decides whether page JS may read the body. Node `fetch` and this lesson stub do **not** simulate CORS. `capabilities.network: false` also does not claim to be an OS firewall.',
            '',
            'Why it bites: the fox’s board in a browser is not the same as a Node script on the desk. If you believe Node enforces CORS on every `fetch`, you skip the header work and ship a page that cannot read another origin’s beacon list. The desk script worked. The live page fails, and night shift thinks the server is down when the browser simply refused the body.',
            '',
            fence(
              'javascript',
              `// browser: may this origin read the body?
// server may send Access-Control-Allow-Origin
// Node fetch and this stub do not simulate that check
await fetch("/beacons.json")
// here: no CORS conversation — do not treat this as a browser`
            ),
            '',
            'The common mistake is blaming Node, or this sandbox, for a rule only the browser applies. There is no Try function here — the questions ask who decides whether page code may read another origin’s body, and who enforces CORS. Answer: the browser, for that page’s origin. The idea still matters when you later ship a page. Name the gap; do not expect this stub to reproduce it.'
          ].join('\n')
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
          [
            '## Search, then render',
            '',
            '`GET /catalog.json` returns `{ items: [{ name, kind }] }`. On button click, fetch, filter names that include the query, and put matching names into `#results` as `li` nodes using `textContent`. Build each row as a node. Do not write a raw HTML string of names. Each result name should be set with `textContent` on each `li`, not `innerHTML` of the `ul`.',
            '',
            'Why it bites: the catalog desk already holds the query `bea`. If you dump matches into `innerHTML`, a later name can parse as markup and `Rock` might vanish for the wrong reason — or a crafted name becomes a node. If you skip the filter, both Beacon and Rock appear. Night shift then files a rock as a light, or the results list grows script-shaped children.',
            '',
            fence(
              'javascript',
              `const res = await fetch("/catalog.json")
const data = await res.json()
const ul = document.querySelector("#results")
ul.replaceChildren()
for (const item of data.items) {
  if (!item.name.toLowerCase().includes("bea")) continue
  const li = document.createElement("li")
  li.textContent = item.name
  ul.append(li)
}
// #results lists Beacon, not Rock`
            ),
            '',
            'The common mistake is setting `innerHTML` of the `ul`, or forgetting to clear old rows. On Try, click `#go` with query `bea` should list `Beacon` (from the fixture), not `Rock`. Read `#q`, fetch `/catalog.json`, filter `data.items`, then append one `li` per match with `textContent`. Render matches as list nodes. Search the fixture; do not invent names.'
          ].join('\n')
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
