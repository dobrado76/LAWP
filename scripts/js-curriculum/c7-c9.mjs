import {
  lesson,
  explain,
  predict,
  check,
  hints,
  stdoutCode,
  playCode,
  domCode,
  activityBlock,
  asyncAssert,
  fox,
  beacon,
  token,
  gridWorld,
  at,
  playLogOk,
  exportAssert,
  srcIncludes,
  deskWorld,
  deskGoal
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
          '## Where values live\n\nThe **stack** is the list of function calls that are running now. The **heap** is the bag of objects those frames point at.\n\nA closure keeps a heap object alive after the stack frame that created it is gone. `await` *pauses that function* — it does not freeze the operating system.'
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
          '## Sync, then the timeout tray\n\n`setTimeout(fn, 0)` does **not** mean “run now.” It means “put `fn` on the macrotask queue.” Sync work finishes first.\n\nOn the desk: light **1 Sync**, then later **3 timeout**. (The `then` lamp waits for the next lesson.)'
        ),
        activityBlock({
          id: 'desk-sync-timeout',
          kind: 'experiment',
          skillIds: ['js.async'],
          prompt: 'Light sync first, then the timeout. Leave `then` off for this lesson. Wrong order sets a fault.',
          predict: {
            promptMd: 'Does `setTimeout(fn, 0)` run before the current call stack finishes?',
            kind: 'mcq',
            choices: [
              { id: 'yes', md: 'Yes — 0 means now' },
              { id: 'no', md: 'No — sync finishes first' }
            ],
            answer: 'no'
          },
          world: deskWorld(),
          goal: { all: [at('sync', 'on', 1), at('macro', 'on', 1), at('desk', 'fault', 0)] },
          constraints: [at('desk', 'fault', 0)],
          explainAfter: 'Timeouts are macrotasks. They wait until the stack is clear.',
          hints: hints(
            'Press Run the sync call, then Fire the timeout. Skip then for now — but the desk still wants then between them if you use the full order…',
            { level: 2, kind: 'concept', md: 'This desk’s full legal order is sync → then → timeout. For this lesson, light then as well so the timeout is legal — then treat that lamp as “queue gap.”' },
            { level: 4, kind: 'assist', md: 'Sync, then Flush promise.then, then Fire the timeout.' }
          ),
          misconceptionMap: [{ when: at('desk', 'fault', 1), misconceptionId: 'then-and-timeout-same-queue' }]
        })
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
          '## `then` is not a timeout\n\nAfter the stack clears, JavaScript empties the **microtask** queue (`promise.then`, `queueMicrotask`) *before* the next timer.\n\nOrder: sync → `then` → `setTimeout`.'
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
        })
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
          '## Pending, fulfilled, rejected\n\nA Promise starts **pending**. It becomes **fulfilled** with a value or **rejected** with a reason. It does not go back.\n\n`Promise.resolve("locked")` is already fulfilled. Print that value with `then` or `await` in the next lesson — here, return it from an async setup using `.then` and print `locked`.'
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
        stdoutCode({
          id: 'resolve-then',
          prompt: '> `label()` returns `Promise.resolve("locked")`. Print the fulfilled value.',
          equals: 'locked',
          hidden: true,
          timeoutMs: 4000,
          hints: hints(
            'label().then(v => console.log(v))',
            { level: 4, kind: 'assist', md: 'function label() { return Promise.resolve("locked") }\nlabel().then((v) => console.log(v))\nmodule.exports = { label }' }
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
          '## Sugar over promises\n\n`async function` always returns a Promise. `await` pauses **that** function until the promise settles. Other JavaScript on the page can still run. The OS is not frozen.'
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
        stdoutCode({
          id: 'await-label',
          prompt: '> `async function label()` returns `"keyed"` after `await Promise.resolve()`. Print it.',
          equals: 'keyed',
          ast: 'await',
          hidden: true,
          hints: hints(
            'async function label() { await Promise.resolve(); return "keyed" }',
            { level: 4, kind: 'assist', md: 'async function label() {\n  await Promise.resolve()\n  return "keyed"\n}\nlabel().then((v) => console.log(v))\nmodule.exports = { label }' }
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
          '## `await` a rejection inside `try`\n\n`await Promise.reject(new Error("lost"))` throws into the async function. `try/catch` works the same as sync throw.\n\nPrint `lost` from the catch.'
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
        stdoutCode({
          id: 'catch-lost',
          prompt: '> `readKey()` awaits a rejection `"lost"` and returns that message from `catch`. Print it.',
          equals: 'lost',
          ast: 'await',
          hidden: true,
          hints: hints(
            'try { await Promise.reject(new Error("lost")) } catch (e) { return e.message }',
            { level: 4, kind: 'assist', md: 'async function readKey() {\n  try { await Promise.reject(new Error("lost")) }\n  catch (e) { return e.message }\n}\nreadKey().then((v) => console.log(v))\nmodule.exports = { readKey }' }
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
          '## Three waits, two stories\n\n`await Player.wait(1)` three times in a row is **sequence**. `Promise.all([Player.wait(1), Player.wait(1), Player.wait(1)])` starts them together.\n\nThe fox still only moves after you say so. Use `wait` then walk east to (3, 0). Sequence is fine here — the lesson is that `all` would overlap the pauses.'
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
        playCode({
          id: 'three-waits',
          prompt: '> `await Player.wait(1)` three times (or `Promise.all`), then walk east to (3, 0).',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          hints: hints(
            'async function go() { await Player.wait(1); await Player.wait(1); await Player.wait(1); for (let i = 0; i < 3; i++) Player.move("east") }\ngo()',
            { level: 4, kind: 'assist', md: 'async function go() {\n  await Promise.all([Player.wait(1), Player.wait(1), Player.wait(1)])\n  Player.move("east")\n  Player.move("east")\n  Player.move("east")\n}\ngo()' }
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
      'hidden.test.js': playLogOk(`assert.ok(log.filter((row) => row.op === 'wait').length >= 1)
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
          '## A stream of steps\n\n`async function* steps() { yield "east"; yield "south" }`.\n\n`for await (const d of steps())` waits for each yield. Print `east-south` joined from the stream.'
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
        stdoutCode({
          id: 'await-of',
          prompt: '> `async function* steps` yields `east` then `south`. Join with `-` and print `east-south`.',
          equals: 'east-south',
          ast: 'for await',
          hidden: true,
          hints: hints(
            'for await (const d of steps()) out.push(d)',
            { level: 4, kind: 'assist', md: 'async function* steps() {\n  yield "east"\n  yield "south"\n}\nasync function join() {\n  const out = []\n  for await (const d of steps()) out.push(d)\n  return out.join("-")\n}\njoin().then((v) => console.log(v))\nmodule.exports = { steps, join }' }
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
          '## Wait, then walk\n\n`Player.wait(ticks)` logs a pause. Studio replay honors it. The world does not move during `wait`.\n\nAwait two ticks, then walk to (2, 1): east, east, south.'
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
        playCode({
          id: 'timed-walk',
          prompt: '> `await Player.wait(2)` then walk east, east, south onto the beacon.',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: hints(
            'async function go() { await Player.wait(2); ...moves }\ngo()',
            { level: 4, kind: 'assist', md: 'async function go() {\n  await Player.wait(2)\n  Player.move("east")\n  Player.move("east")\n  Player.move("south")\n}\ngo()' }
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
          '## The key is “collected” too late\n\n`Player.wait` **logs when the timer finishes**, not when you call it. If you forget `await`, the next `move` is written first. The story says: say `keyed` only after the wait, *then* walk onto the key.\n\nFix the starter so the log is wait → say → move.'
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
        playCode({
          id: 'await-key',
          debug: true,
          prompt: '> Await the wait, `Player.say("keyed")`, then move south onto the key at (2, 4).',
          world: gridWorld([fox(2, 3), token('key', 'key', 2, 4), beacon(2, 4)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 4), at('fox', 'say', 'keyed'), at('key', 'taken', true)] },
          hidden: true,
          hints: hints(
            'await Player.wait(1) before say and move.',
            { level: 4, kind: 'assist', md: 'async function collect() {\n  await Player.wait(1)\n  Player.say("keyed")\n  Player.move("south")\n}\ncollect()' }
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
          '## Nodes, not one long string\n\nThe page is a tree of nodes. `document.body` is an element. Changing `textContent` changes a node. You do not rebuild the whole HTML string to rename a heading.'
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
        domCode({
          id: 'see-tree',
          prompt: '> Set the `h1#title` text to `Signal desk`.',
          hidden: true,
          hints: hints(
            'document.querySelector("#title").textContent = "Signal desk"',
            { level: 4, kind: 'assist', md: 'document.querySelector("#title").textContent = "Signal desk"' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body><h1 id="title">Old radio</h1></body></html>`,
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
          '## Find, then write text\n\n`querySelector` takes a CSS selector. `#id`, `.class`, `li`.\n\nPut the name `North` into `#beacon-name`. Use `textContent`, not `innerHTML`, for plain text.'
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
        domCode({
          id: 'set-name',
          prompt: '> `#beacon-name` should read `North`.',
          hidden: true,
          hints: hints(
            'textContent on the node you queried.',
            { level: 4, kind: 'assist', md: 'document.querySelector("#beacon-name").textContent = "North"' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body><p id="beacon-name">?</p></body></html>`,
      'main.js': `\n`,
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
          '## Grow the tree\n\n`document.createElement("li")`, set `textContent`, `ul.append(li)`.\n\n`li.remove()` takes a node off. Do not concatenate HTML strings to add one item.'
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
        domCode({
          id: 'add-li',
          prompt: '> Create an `li` with text `East` and append it to `#list`.',
          hidden: true,
          hints: hints(
            'const li = document.createElement("li"); li.textContent = "East"; list.append(li)',
            { level: 4, kind: 'assist', md: 'const li = document.createElement("li")\nli.textContent = "East"\ndocument.querySelector("#list").append(li)' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body><ul id="list"></ul></body></html>`,
      'main.js': `\n`,
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
          '## target vs currentTarget\n\nThe event starts at the clicked node (`target`) and bubbles up. `currentTarget` is the node whose listener is running.\n\nListen on `#outer`. When `#inner` is clicked, set `#out` to `inner>outer` using target id then currentTarget id.'
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
        domCode({
          id: 'bubble-ids',
          prompt: '> On click of `#outer`, write `targetId>currentId` into `#out`. Hidden test clicks `#inner`.',
          hidden: true,
          hints: hints(
            'outer.addEventListener("click", (e) => { ... e.target.id ... e.currentTarget.id })',
            { level: 4, kind: 'assist', md: 'document.querySelector("#outer").addEventListener("click", (e) => {\n  document.querySelector("#out").textContent = e.target.id + ">" + e.currentTarget.id\n})' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body>
<div id="outer"><button type="button" id="inner">Ping</button></div>
<p id="out"></p>
</body></html>`,
      'main.js': `\n`,
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
          '## Delegation\n\nOne listener on `ul#list` can handle clicks on any `button` inside, including buttons you add later. Check `event.target.matches("button")`.'
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
        domCode({
          id: 'delegate',
          prompt: '> Clicking a button in `#list` should set `#picked` to that button’s `data-name`.',
          hidden: true,
          hints: hints(
            'list.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ... })',
            { level: 4, kind: 'assist', md: 'document.querySelector("#list").addEventListener("click", (e) => {\n  const b = e.target.closest("button")\n  if (!b) return\n  document.querySelector("#picked").textContent = b.getAttribute("data-name")\n})' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body>
<ul id="list">
  <li><button type="button" data-name="North">N</button></li>
  <li><button type="button" data-name="East">E</button></li>
</ul>
<p id="picked"></p>
</body></html>`,
      'main.js': `\n`,
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
          '## The live value\n\n`input` fires as the person types. Read `event.target.value` (or the input’s `.value`). Copy it into `#echo`.'
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
        domCode({
          id: 'echo-input',
          prompt: '> Mirror `#name` into `#echo` on `input`.',
          hidden: true,
          hints: hints(
            'name.addEventListener("input", (e) => { echo.textContent = e.target.value })',
            { level: 4, kind: 'assist', md: 'document.querySelector("#name").addEventListener("input", (e) => {\n  document.querySelector("#echo").textContent = e.target.value\n})' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body>
<input id="name" />
<p id="echo"></p>
</body></html>`,
      'main.js': `\n`,
      'hidden.test.js': `const el = document.querySelector('#name')
el.value = 'Beacon'
el.dispatchEvent(new Event('input', { bubbles: true }))
assert.strictEqual(document.querySelector('#echo').textContent, 'Beacon')
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
          '## A button should be a button\n\nA `div` with a click is a trap for keyboard and screen readers. Use `<button>`. The **accessible name** is often the text content, or `aria-label`.\n\nSet the button’s label to `Call north` using `textContent` — not `innerHTML` for this plain phrase.'
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
        domCode({
          id: 'name-button',
          prompt: '> `#call` is a button. Set its accessible name (text) to `Call north`.',
          hidden: true,
          hints: hints(
            'textContent is the name for a button with no aria-label.',
            { level: 4, kind: 'assist', md: 'document.querySelector("#call").textContent = "Call north"' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body><button type="button" id="call">Call</button></body></html>`,
      'main.js': `\n`,
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
          '## The fixture tries a payload\n\n`#raw` starts with a fake script payload in a data attribute. Put that string into `#safe` with **`textContent`**. If you use `innerHTML`, you are practicing the bug.\n\nThe page should show the characters, not run them.'
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
        domCode({
          id: 'safe-copy',
          prompt: '> Copy `#raw`’s `data-payload` into `#safe` using `textContent`.',
          hidden: true,
          hints: hints(
            'safe.textContent = raw.getAttribute("data-payload")',
            { level: 4, kind: 'assist', md: 'const raw = document.querySelector("#raw")\ndocument.querySelector("#safe").textContent = raw.getAttribute("data-payload")' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body>
<p id="raw" data-payload="<img src=x onerror=alert(1)>"></p>
<p id="safe"></p>
</body></html>`,
      'main.js': `\n`,
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
          '## Filter in the page\n\nThe list is already in the tree. On `input` of `#q`, hide `li` nodes whose text does not include the query (case-insensitive). Use a class or `hidden` — do not rebuild innerHTML from a string of names.'
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
        domCode({
          id: 'filter-li',
          prompt: '> Typing `ea` in `#q` should hide `North` and leave `East` visible.',
          hidden: true,
          hints: hints(
            'for (const li of list.querySelectorAll("li")) li.hidden = !li.textContent.toLowerCase().includes(q)',
            { level: 4, kind: 'assist', md: 'const q = document.querySelector("#q")\nq.addEventListener("input", () => {\n  const needle = q.value.toLowerCase()\n  for (const li of document.querySelectorAll("#list li")) {\n    li.hidden = !li.textContent.toLowerCase().includes(needle)\n  }\n})' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body>
<input id="q" />
<ul id="list">
  <li>North</li>
  <li>East</li>
  <li>West</li>
</ul>
</body></html>`,
      'main.js': `\n`,
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
          '## A board you keep\n\nAdd one `li` for each starter name already in `#seeds` (comma-separated), then keep the filter from the last lesson: `#q` hides non-matches.\n\nThe board is yours — export later from Studio.'
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
        domCode({
          id: 'board',
          prompt: '> Build `#list` from `#seeds` text, and filter with `#q`.',
          hidden: true,
          hints: hints(
            'Split seeds, createElement li, append, then bind input filter.',
            { level: 4, kind: 'assist', md: 'const list = document.querySelector("#list")\nconst names = document.querySelector("#seeds").textContent.split(",").map((s) => s.trim())\nfor (const name of names) {\n  const li = document.createElement("li")\n  li.textContent = name\n  list.append(li)\n}\nconst q = document.querySelector("#q")\nq.addEventListener("input", () => {\n  const needle = q.value.toLowerCase()\n  for (const li of list.querySelectorAll("li")) li.hidden = !li.textContent.toLowerCase().includes(needle)\n})' }
          )
        })
      ]
    }),
    files: {
      'index.html': `<!doctype html><html><body>
<p id="seeds">North,East,West</p>
<input id="q" />
<ul id="list"></ul>
</body></html>`,
      'main.js': `\n`,
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
          '## Method, URL, status\n\nA request is a **method** (`GET`, `POST`…) plus a **URL**. A response is a **status** (200, 404, 500) plus a body.\n\n`GET /beacons.json` asking for a list is a message, not a magic tunnel. This pack never opens the real network.'
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
      id: 'fetch-ok-and-fail',
      courseId: 'talking-servers',
      moduleId: 'messages',
      title: 'res.ok vs throw',
      skillIds: ['js.http'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## 404 does not throw\n\nThe app stub answers `/missing` with status 404. `fetch` still resolves. `res.ok` is false. You throw *if you choose* after you look.\n\nPrint `ok` for `/beacons.json` and teach `read()` to throw when `!res.ok`.'
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
        stdoutCode({
          id: 'fetch-ok',
          prompt: '> `read("/beacons.json")` returns parsed JSON and prints `true` (`ok` field). Hidden: `/missing` throws.',
          equals: 'true',
          hidden: true,
          extraFiles: [
            { path: 'files/beacons.json', role: 'fixture' },
            { path: 'files/routes.json', role: 'fixture' }
          ],
          hints: hints(
            'if (!res.ok) throw new Error(String(res.status))',
            { level: 4, kind: 'assist', md: 'async function read(url) {\n  const res = await fetch(url)\n  if (!res.ok) throw new Error(String(res.status))\n  return res.json()\n}\nread("/beacons.json").then((d) => console.log(d.ok))\nmodule.exports = { read }' }
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
          '## Bad JSON is a throw from `res.json()`\n\n`/broken` returns `{` — not valid JSON. Catch that and return `"bad-json"`.\n\nGood `/beacons.json` still parses.'
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
        stdoutCode({
          id: 'parse-safe',
          prompt: '> `safeRead("/broken")` returns `"bad-json"`. Print it.',
          equals: 'bad-json',
          hidden: true,
          extraFiles: [
            { path: 'files/beacons.json', role: 'fixture' },
            { path: 'files/routes.json', role: 'fixture' }
          ],
          hints: hints(
            'try { return await res.json() } catch { return "bad-json" }',
            { level: 4, kind: 'assist', md: 'async function safeRead(url) {\n  const res = await fetch(url)\n  try { return await res.json() }\n  catch { return "bad-json" }\n}\nsafeRead("/broken").then((v) => console.log(v))\nmodule.exports = { safeRead }' }
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
          '## Cancel the wait\n\n`/slow` is delayed. `AbortController` + `fetch(url, { signal })` rejects with `AbortError` when you `abort()`.\n\nAbort immediately and print `aborted`.'
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
        stdoutCode({
          id: 'abort-now',
          prompt: '> Start `/slow`, abort, print `aborted`.',
          equals: 'aborted',
          hidden: true,
          extraFiles: [
            { path: 'files/beacons.json', role: 'fixture' },
            { path: 'files/routes.json', role: 'fixture' }
          ],
          hints: hints(
            'const c = new AbortController(); const p = fetch("/slow", { signal: c.signal }); c.abort()',
            { level: 4, kind: 'assist', md: 'async function race() {\n  const c = new AbortController()\n  const p = fetch("/slow", { signal: c.signal })\n  c.abort()\n  try { await p; return "ok" }\n  catch (e) { return e.name === "AbortError" ? "aborted" : "other" }\n}\nrace().then((v) => console.log(v))\nmodule.exports = { race }' }
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
          '## Not Node, not this sandbox\n\nThe **browser** asks: may this page’s origin read that response? CORS is an HTTP header conversation the *browser* enforces.\n\nNode `fetch` and this lesson stub do **not** simulate CORS. `capabilities.network: false` also does not claim to be an OS firewall. The idea still matters when you later ship a page.'
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
          '## Search, then render\n\n`GET /catalog.json` returns `{ items: [{ name, kind }] }`. On submit (or button click), fetch, filter names that include the query, and put matching names into `#results` as `li` nodes using `textContent`.'
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
        domCode({
          id: 'search-ui',
          prompt: '> Click `#go` with query `bea` should list `Beacon` (from the fixture), not `Rock`.',
          hidden: true,
          extraFiles: [{ path: 'files/catalog.json', role: 'fixture' }],
          hints: hints(
            'fetch("/catalog.json") then filter, createElement li.',
            { level: 4, kind: 'assist', md: 'document.querySelector("#go").addEventListener("click", async () => {\n  const q = document.querySelector("#q").value.toLowerCase()\n  const res = await fetch("/catalog.json")\n  const data = await res.json()\n  const ul = document.querySelector("#results")\n  ul.replaceChildren()\n  for (const item of data.items) {\n    if (!item.name.toLowerCase().includes(q)) continue\n    const li = document.createElement("li")\n    li.textContent = item.name\n    ul.append(li)\n  }\n})' }
          )
        })
      ]
    }),
    files: {
      'catalog.json': `{ "items": [{ "name": "Beacon", "kind": "light" }, { "name": "Rock", "kind": "block" }] }\n`,
      'index.html': `<!doctype html><html><body>
<input id="q" value="bea" />
<button type="button" id="go">Search</button>
<ul id="results"></ul>
</body></html>`,
      'main.js': `\n`,
      'hidden.test.js': `document.querySelector('#go').dispatchEvent(new MouseEvent('click', { bubbles: true }))
await new Promise((r) => setTimeout(r, 30))
const names = [...document.querySelectorAll('#results li')].map((n) => n.textContent)
assert.deepStrictEqual(names, ['Beacon'])
`
    }
  })

  return out
}
