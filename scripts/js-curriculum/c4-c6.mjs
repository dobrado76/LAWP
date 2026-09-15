import {
  lesson,
  explain,
  predict,
  hints,
  stdoutCode,
  playCode,
  fox,
  beacon,
  gridWorld,
  at,
  srcIncludes,
  playLogOk,
  exportAssert
} from './lib.mjs'

export function lessonsC4C6() {
  const out = []

  out.push({
    doc: lesson({
      id: 'scope-and-tdz',
      courseId: 'scope-hofs',
      moduleId: 'scope',
      title: 'Scope and the TDZ',
      skillIds: ['js.closures'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A name before it is ready\n\n`let` and `const` exist in a temporal dead zone from the start of the block until the line that initializes them. Reading `label` above `let label = "east"` throws `ReferenceError`.\n\n`var` is older and hoists as `undefined`. Prefer `let`/`const` so the crash teaches you.'
        ),
        predict(
          'tdz',
          'What happens if you `console.log(x)` on the line before `let x = 1` in the same block?',
          [
            { id: 'undef', md: 'Prints `undefined`' },
            { id: 'throw', md: 'Throws ReferenceError' }
          ],
          'throw'
        ),
        stdoutCode({
          id: 'after-init',
          prompt: '> `readyLabel()` returns `"east"` from a `let` that is initialized before you read it. Print it.',
          equals: 'east',
          ast: 'let',
          hidden: true,
          hints: hints(
            'Declare, then assign or initialize, then return.',
            { level: 4, kind: 'assist', md: 'function readyLabel() {\n  let dir = "east"\n  return dir\n}\nconsole.log(readyLabel())\nmodule.exports = { readyLabel }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function readyLabel() {
  return dir
  let dir = "east"
}
console.log("?")
module.exports = { readyLabel }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.readyLabel(), 'east')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'closures-radio',
      courseId: 'scope-hofs',
      moduleId: 'scope',
      title: 'A radio that remembers',
      skillIds: ['js.closures'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## The function keeps the box\n\n`makeMover(dir)` returns a function. That inner function still sees `dir` later — that is a closure. The fox can call the returned function after you have left `makeMover`.\n\nThe closure does not copy the value onto a sticky note unless you create a new binding each time.'
        ),
        predict(
          'remembers-dir',
          '`const go = makeMover("east");` later `go()` should move…',
          [
            { id: 'east', md: 'east — it still sees `dir`' },
            { id: 'lost', md: 'nowhere — `dir` is gone', misconceptionId: 'closure-copies-value' }
          ],
          'east'
        ),
        playCode({
          id: 'radio-east',
          prompt: '> `makeMover("east")` returns a function. Call it three times to reach x=3.',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          hints: hints(
            'return function () { Player.move(dir) }',
            { level: 4, kind: 'assist', md: 'function makeMover(dir) {\n  return function go() { Player.move(dir) }\n}\nconst go = makeMover("east")\ngo(); go(); go()\nmodule.exports = { makeMover }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function makeMover(dir) {
  return function go() {}
}
const go = makeMover("east")
module.exports = { makeMover }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(typeof m.makeMover('south'), 'function')
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'callbacks-as-commands',
      courseId: 'scope-hofs',
      moduleId: 'tools',
      title: 'Commands as an object map',
      skillIds: ['js.functions', 'js.objects'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A table of functions\n\n`const cmds = { go(dir) { Player.move(dir) }, turn() { Player.rotate(90) } }`.\n\nYou look up a name and call it. That is how a small language of stage commands stays data.'
        ),
        predict(
          'lookup-call',
          '`cmds.go` without `()` is…',
          [
            { id: 'move', md: 'A move that already happened' },
            { id: 'fn', md: 'The function value — you still have to call it' }
          ],
          'fn'
        ),
        playCode({
          id: 'cmd-table',
          prompt: '> Build `cmds.go` / `cmds.turn`. go east three times, turn, stand on (3,0) facing 90°.',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0), at('fox', 'rot', 90)] },
          hidden: true,
          hints: hints(
            'cmds.go("east") three times, then cmds.turn().',
            { level: 4, kind: 'assist', md: 'const cmds = {\n  go(dir) { Player.move(dir) },\n  turn() { Player.rotate(90) }\n}\ncmds.go("east"); cmds.go("east"); cmds.go("east"); cmds.turn()\nmodule.exports = { cmds }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const cmds = {
  go(dir) {},
  turn() {}
}
module.exports = { cmds }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(typeof m.cmds.go, 'function')
assert.strictEqual(typeof m.cmds.turn, 'function')
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'arrow-vs-function',
      courseId: 'scope-hofs',
      moduleId: 'tools',
      title: 'Arrow vs function',
      skillIds: ['js.this'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Shorter is not the whole story\n\n`const add = (a, b) => a + b` is shorter. An arrow also **does not get its own `this`**. It keeps the `this` from outside.\n\nA method that needs `this.dir` should stay a `function`, or you bind it later. This lesson is syntax plus that preview — no DOM yet.'
        ),
        predict(
          'arrow-this',
          'An arrow function’s `this` is…',
          [
            { id: 'call', md: 'Whatever called it, like a method', misconceptionId: 'arrow-is-just-shorter' },
            { id: 'outer', md: 'The `this` from the scope where it was created' }
          ],
          'outer'
        ),
        stdoutCode({
          id: 'arrow-sum',
          prompt: '> Write `add` as an arrow that returns `a + b`. Print `add(2, 3)` (`5`).',
          equals: '5',
          ast: '=>',
          hidden: true,
          hints: hints(
            'const add = (a, b) => a + b',
            { level: 4, kind: 'assist', md: 'const add = (a, b) => a + b\nconsole.log(add(2, 3))\nmodule.exports = { add }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function add(a, b) {
  return a - b
}
console.log(add(2, 3))
module.exports = { add }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.add(2, 3), 5)
assert.strictEqual(m.add(0, 1), 1)
`) + srcIncludes('=>')
    }
  })

  out.push({
    doc: lesson({
      id: 'higher-order-route',
      courseId: 'scope-hofs',
      moduleId: 'tools',
      title: 'walk(steps, fn)',
      skillIds: ['js.functions', 'js.closures'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## A function that takes a function\n\n`function walk(steps, fn)` calls `fn` once per step. You pass `function () { Player.move("east") }` or an arrow.\n\nThe higher-order function owns the count. The callback owns the action.'
        ),
        predict(
          'hof-count',
          '`walk(3, fn)` should call `fn`…',
          [
            { id: 'once', md: 'Once' },
            { id: 'three', md: 'Three times' }
          ],
          'three'
        ),
        playCode({
          id: 'walk-fn',
          prompt: '> Implement `walk(steps, fn)` and pass a mover that goes east. Reach (3, 0).',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          hints: hints(
            'for (let i = 0; i < steps; i++) fn()',
            { level: 4, kind: 'assist', md: 'function walk(steps, fn) {\n  for (let i = 0; i < steps; i++) fn()\n}\nwalk(3, () => Player.move("east"))\nmodule.exports = { walk }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function walk(steps, fn) {
  fn()
}
walk(3, () => Player.move("east"))
module.exports = { walk }
`,
      'hidden.test.js': exportAssert(`let n = 0
m.walk(4, () => { n += 1 })
assert.strictEqual(n, 4)
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'stale-closure-debug',
      courseId: 'scope-hofs',
      moduleId: 'scope',
      title: 'Debug: the last direction',
      skillIds: ['js.closures'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## One binding, many callbacks\n\nA loop with `var i` (or one `let dir` you overwrite) makes every callback see the **last** value. The fox repeats the last dir.\n\nFix it: `let` in the loop, or `dirs.forEach((dir) => { ... })` so each callback has its own `dir`.'
        ),
        predict(
          'var-loop',
          'Three `var` callbacks scheduled in a loop over `east, south, west` often all see…',
          [
            { id: 'each', md: 'Their own dir from that iteration', misconceptionId: 'closure-copies-value' },
            { id: 'last', md: 'The last dir after the loop finishes' }
          ],
          'last'
        ),
        playCode({
          id: 'fix-stale',
          debug: true,
          prompt: '> The starter queues movers that all walk the last dir. Fix them so the path is east, south (1, 1).',
          world: gridWorld([fox(0, 0), beacon(1, 1)]),
          goal: { all: [at('fox', 'x', 1), at('fox', 'y', 1)] },
          hidden: true,
          hints: hints(
            'forEach gives each function its own dir parameter.',
            { level: 4, kind: 'assist', md: 'const dirs = ["east", "south"]\nconst movers = dirs.map((dir) => () => Player.move(dir))\nfor (const go of movers) go()' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const dirs = ["east", "south"]
const movers = []
for (var i = 0; i < dirs.length; i++) {
  movers.push(function () {
    Player.move(dirs[i])
  })
}
for (const go of movers) go()
`,
      'hidden.test.js': playLogOk(`assert.ok(log.some((row) => row.dir === 'east'))
assert.ok(log.some((row) => row.dir === 'south'))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-command-table',
      courseId: 'scope-hofs',
      moduleId: 'tools',
      title: 'Transfer: a new maze table',
      skillIds: ['js.functions', 'js.objects'],
      estimatedMinutes: 25,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Dispatch drives the walk\n\n`run(plan, table)` looks up each string in `table` and calls that function. A new maze is a new plan array — not a new pile of copy-paste moves.\n\nPlan: `"e"`, `"e"`, `"s"` to (2, 1).'
        ),
        predict(
          'missing-key',
          'If `plan` has `"n"` and `table` has no `n`, a careful runner should…',
          [
            { id: 'skip', md: 'Skip silently forever' },
            { id: 'throw', md: 'Throw or say the unknown key' }
          ],
          'throw'
        ),
        playCode({
          id: 'run-plan',
          prompt: '> `run(plan, table)` with table keys `e` / `s`. Reach the beacon at (2, 1).',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: hints(
            'for (const key of plan) table[key]()',
            { level: 4, kind: 'assist', md: 'function run(plan, table) {\n  for (const key of plan) {\n    if (!table[key]) throw new Error("unknown " + key)\n    table[key]()\n  }\n}\nconst table = { e: () => Player.move("east"), s: () => Player.move("south") }\nrun(["e", "e", "s"], table)\nmodule.exports = { run }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function run(plan, table) {}
const table = {
  e: () => Player.move("east"),
  s: () => Player.move("south")
}
run(["e", "e", "s"], table)
module.exports = { run }
`,
      'hidden.test.js': exportAssert(`let n = 0
m.run(['x', 'x'], { x: () => { n += 1 } })
assert.strictEqual(n, 2)
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'throw-and-catch',
      courseId: 'errors',
      moduleId: 'recover',
      title: 'throw and catch',
      skillIds: ['js.errors'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A bad dir is not the end\n\n`Player.move` already faults on a bad dir. Here **you** throw `new Error("bad dir")` if the string is not a compass word. `catch` `say`s the fault, then you still finish the walk east to the beacon.\n\nThe program continues after a handled error.'
        ),
        predict(
          'catch-continues',
          'After `catch` runs, the next line after the `try/catch`…',
          [
            { id: 'dead', md: 'Never runs' },
            { id: 'runs', md: 'Runs — you recovered' }
          ],
          'runs'
        ),
        playCode({
          id: 'catch-say',
          prompt: '> `step("up")` throws. Catch it, `Player.say("fault")`, then walk east to (2, 0).',
          world: gridWorld([fox(0, 0), beacon(2, 0)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 0), at('fox', 'say', 'fault')] },
          hidden: true,
          hints: hints(
            'try { step("up") } catch (e) { Player.say("fault") }',
            { level: 4, kind: 'assist', md: 'function step(dir) {\n  if (!["north", "south", "east", "west"].includes(dir)) throw new Error("bad dir")\n  Player.move(dir)\n}\ntry { step("up") } catch (e) { Player.say("fault") }\nstep("east"); step("east")\nmodule.exports = { step }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function step(dir) {
  Player.move(dir)
}
step("east")
module.exports = { step }
`,
      'hidden.test.js': exportAssert(`assert.throws(() => m.step('up'))
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'finally-and-rethrow',
      courseId: 'errors',
      moduleId: 'recover',
      title: 'finally and rethrow',
      skillIds: ['js.errors'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Cleanup, then fail\n\n`finally` runs whether `try` threw or not. Use it to `Player.say("clear")` after an attempt.\n\nIf you still want the caller to see the error, `throw e` again after cleanup.'
        ),
        predict(
          'finally-always',
          '`finally` runs when `try` throws?',
          [
            { id: 'no', md: 'No — catch ate it' },
            { id: 'yes', md: 'Yes — finally always runs' }
          ],
          'yes'
        ),
        stdoutCode({
          id: 'cleanup',
          prompt: '> `attempt()` tries a throw, `finally` pushes `"clear"` into `notes`, then rethrows. Print `notes[0]` by catching outside (`clear`).',
          equals: 'clear',
          ast: 'finally',
          hidden: true,
          hints: hints(
            'try { throw new Error("x") } finally { notes.push("clear") }',
            { level: 4, kind: 'assist', md: 'const notes = []\nfunction attempt() {\n  try { throw new Error("x") }\n  finally { notes.push("clear") }\n}\ntry { attempt() } catch (e) {}\nconsole.log(notes[0])\nmodule.exports = { attempt, notes }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const notes = []
function attempt() {
  throw new Error("x")
}
try { attempt() } catch (e) {}
console.log(notes[0] || "missing")
module.exports = { attempt, notes }
`,
      'hidden.test.js': exportAssert(`m.notes.length = 0
try { m.attempt() } catch (e) {}
assert.strictEqual(m.notes[0], 'clear')
`) + srcIncludes('finally')
    }
  })

  out.push({
    doc: lesson({
      id: 'custom-errors',
      courseId: 'errors',
      moduleId: 'recover',
      title: 'class RouteError',
      skillIds: ['js.errors'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Name the failure\n\n`class RouteError extends Error {}` lets `catch (e)` ask `e instanceof RouteError`. A generic `Error` is a shrug. A named class is a signal.'
        ),
        predict(
          'instanceof',
          '`throw new RouteError("blocked")` then `e instanceof Error` is…',
          [
            { id: 'false', md: 'false — it is a different type' },
            { id: 'true', md: 'true — subclasses still are Errors' }
          ],
          'true'
        ),
        stdoutCode({
          id: 'route-error',
          prompt: '> Define `RouteError`. `fail()` throws one with message `blocked`. Catch it and print `blocked`.',
          equals: 'blocked',
          ast: 'class RouteError',
          hidden: true,
          hints: hints(
            'class RouteError extends Error {}',
            { level: 4, kind: 'assist', md: 'class RouteError extends Error {}\nfunction fail() { throw new RouteError("blocked") }\ntry { fail() } catch (e) { console.log(e.message) }\nmodule.exports = { RouteError, fail }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `class RouteError extends Error {}
function fail() {
  throw new Error("blocked")
}
try { fail() } catch (e) { console.log(e.message) }
module.exports = { RouteError, fail }
`,
      'hidden.test.js': exportAssert(`assert.ok(m.RouteError.prototype instanceof Error)
try { m.fail() } catch (e) {
  assert.ok(e instanceof m.RouteError)
  assert.strictEqual(e.message, 'blocked')
}
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'debug-read-the-stack',
      courseId: 'errors',
      moduleId: 'recover',
      title: 'Debug: read the stack',
      skillIds: ['js.errors'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## The top line is the throw\n\nA stack lists calls from newest to oldest. The first `at step` line is where `throw` ran. Fix `step` so `"east"` moves and `"up"` still throws.\n\nPrint `ok` after a good step.'
        ),
        predict(
          'stack-top',
          'The first `at` line after the message is usually…',
          [
            { id: 'main', md: 'The first function in the file' },
            { id: 'throw', md: 'The function that threw' }
          ],
          'throw'
        ),
        stdoutCode({
          id: 'fix-step',
          debug: true,
          prompt: '> `step("east")` should not throw. Print `ok`. `step("up")` still throws.',
          equals: 'ok',
          hidden: true,
          hints: hints(
            'Only throw when the dir is unknown.',
            { level: 4, kind: 'assist', md: 'function step(dir) {\n  if (dir !== "east" && dir !== "west" && dir !== "north" && dir !== "south") throw new Error("bad")\n  return dir\n}\nstep("east")\nconsole.log("ok")\nmodule.exports = { step }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function step(dir) {
  throw new Error("bad at step")
}
step("east")
console.log("ok")
module.exports = { step }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.step('east'), 'east')
assert.throws(() => m.step('up'))
`)
    }
  })

  // Course 6
  out.push({
    doc: lesson({
      id: 'coercion-to-primitive',
      courseId: 'internals',
      moduleId: 'objects-deep',
      title: 'Coercion to primitive',
      skillIds: ['js.values', 'js.objects'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## `+` and `==` ask an object for a primitive\n\n`[] + []` is `""`. `[] == false` is `true` because both sides coerce. `{ valueOf() { return 1 } } + 1` is `2`.\n\nPrefer `===` and explicit `Number` / `String`. The Why is: the language has a ToPrimitive walk, not a moral about “empty”.'
        ),
        predict(
          'empty-array-eq',
          '`[] == false` is…',
          [
            { id: 'false', md: 'false — an array is an object' },
            { id: 'true', md: 'true — both coerce toward 0' }
          ],
          'true'
        ),
        stdoutCode({
          id: 'valueof',
          prompt: '> `asNumber` returns `Number(box)` where `box.valueOf` returns `2`. Print `2`.',
          equals: '2',
          hidden: true,
          hints: hints(
            'const box = { valueOf() { return 2 } }',
            { level: 4, kind: 'assist', md: 'function asNumber() {\n  const box = { valueOf() { return 2 } }\n  return Number(box)\n}\nconsole.log(asNumber())\nmodule.exports = { asNumber }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function asNumber() {
  return 0
}
console.log(asNumber())
module.exports = { asNumber }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.asNumber(), 2)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'prototypes-chain',
      courseId: 'internals',
      moduleId: 'objects-deep',
      title: 'The prototype chain',
      skillIds: ['js.proto'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Shared methods live on the prototype\n\n`Object.getPrototypeOf(obj)` is the next place JS looks for a field. Many objects share one method object. That is `[[Prototype]]`, not a copy of the function on every instance.'
        ),
        predict(
          'shared-method',
          'Two objects from the same prototype share…',
          [
            { id: 'own', md: 'A private copy of each method' },
            { id: 'one', md: 'One method function on the prototype' }
          ],
          'one'
        ),
        stdoutCode({
          id: 'read-proto',
          prompt: '> `protoName()` returns `Object.getPrototypeOf({}).constructor.name` (`Object`). Print it.',
          equals: 'Object',
          ast: 'getPrototypeOf',
          hidden: true,
          hints: hints(
            'Object.getPrototypeOf({}) is Object.prototype.',
            { level: 4, kind: 'assist', md: 'function protoName() {\n  return Object.getPrototypeOf({}).constructor.name\n}\nconsole.log(protoName())\nmodule.exports = { protoName }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function protoName() {
  return "?"
}
console.log(protoName())
module.exports = { protoName }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.protoName(), 'Object')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'new-and-create',
      courseId: 'internals',
      moduleId: 'objects-deep',
      title: 'new vs Object.create',
      skillIds: ['js.proto'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Two ways to set the prototype\n\n`new Fn()` runs `Fn` and sets the instance proto to `Fn.prototype`.\n\n`Object.create(proto)` makes an object whose proto is `proto` and does not run a constructor. Use `create` when you want a chain without `new`.'
        ),
        predict(
          'create-null',
          '`Object.create(null)` has…',
          [
            { id: 'object-proto', md: '`Object.prototype` as its proto' },
            { id: 'null-proto', md: 'No prototype — a clean dictionary' }
          ],
          'null-proto'
        ),
        stdoutCode({
          id: 'create-child',
          prompt: '> `child()` returns `Object.create({ kind: "beacon" })`. Print `child().kind`.',
          equals: 'beacon',
          ast: 'Object.create',
          hidden: true,
          hints: hints(
            'The field lives on the prototype. The child still reads it.',
            { level: 4, kind: 'assist', md: 'function child() { return Object.create({ kind: "beacon" }) }\nconsole.log(child().kind)\nmodule.exports = { child }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function child() {
  return { kind: "beacon" }
}
console.log(child().kind)
module.exports = { child }
`,
      'hidden.test.js': exportAssert(`const c = m.child()
assert.strictEqual(c.kind, 'beacon')
assert.ok(!Object.hasOwn(c, 'kind'))
`) + srcIncludes('Object.create')
    }
  })

  out.push({
    doc: lesson({
      id: 'classes-syntax',
      courseId: 'internals',
      moduleId: 'objects-deep',
      title: 'class as sugar',
      skillIds: ['js.proto'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## A route blueprint\n\n`class Route { constructor(dir) { this.dir = dir } go() { Player.move(this.dir) } }` is nicer spelling for prototype methods. The fox uses `new Route("east").go()` three times.'
        ),
        predict(
          'class-proto',
          '`new Route("east").go === new Route("east").go` is…',
          [
            { id: 'false', md: 'false — each instance gets a new go' },
            { id: 'true', md: 'true — go lives on Route.prototype' }
          ],
          'true'
        ),
        playCode({
          id: 'class-route',
          prompt: '> `class Route` with `go()`. Walk east to (3, 0).',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'class Route',
          hints: hints(
            'const r = new Route("east"); r.go(); r.go(); r.go()',
            { level: 4, kind: 'assist', md: 'class Route {\n  constructor(dir) { this.dir = dir }\n  go() { Player.move(this.dir) }\n}\nconst r = new Route("east")\nr.go(); r.go(); r.go()\nmodule.exports = { Route }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `class Route {
  constructor(dir) { this.dir = dir }
  go() {}
}
module.exports = { Route }
`,
      'hidden.test.js': exportAssert(`const r = new m.Route('south')
assert.strictEqual(typeof r.go, 'function')
assert.strictEqual(r.go, m.Route.prototype.go)
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'this-call-apply-bind',
      courseId: 'internals',
      moduleId: 'objects-deep',
      title: 'this, call, apply, bind',
      skillIds: ['js.this'],
      estimatedMinutes: 25,
      blocks: [
        explain(
          '## Four rules (plain functions)\n\n1. `obj.method()` — `this` is `obj`.\n2. `fn()` — `this` is undefined in strict / global in sloppy.\n3. `fn.call(obj)` / `apply` — you pick `this`.\n4. `fn.bind(obj)` — returns a new function with `this` locked.\n\nBind a mover so the callback still walks east.'
        ),
        predict(
          'detached',
          'After `const go = obj.go; go()` (plain function method), `this` is usually…',
          [
            { id: 'obj', md: '`obj`' },
            { id: 'lost', md: 'Not `obj` — the call site lost the receiver' }
          ],
          'lost'
        ),
        playCode({
          id: 'bind-mover',
          prompt: '> `const go = mover.go.bind(mover)` then `go()` three times east to (3, 0).',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'bind',
          hints: hints(
            'bind locks this to mover so go() still reads this.dir.',
            { level: 4, kind: 'assist', md: 'const mover = {\n  dir: "east",\n  go() { Player.move(this.dir) }\n}\nconst go = mover.go.bind(mover)\ngo(); go(); go()\nmodule.exports = { mover }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const mover = {
  dir: "east",
  go() { Player.move(this.dir) }
}
const go = mover.go
go()
module.exports = { mover }
`,
      'hidden.test.js': srcIncludes('bind') + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'descriptors-get-set',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'Getters and descriptors',
      skillIds: ['js.objects'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A `position` getter\n\n`get position() { return this.x + "," + this.y }` runs on read. `Object.getOwnPropertyDescriptor` shows `get` / `set` / `writable`.\n\nPrint `2,1` from a fox-like object.'
        ),
        predict(
          'getter-call',
          'Reading `obj.position`…',
          [
            { id: 'fn', md: 'Returns the getter function' },
            { id: 'run', md: 'Runs the getter and returns its value' }
          ],
          'run'
        ),
        stdoutCode({
          id: 'pos-get',
          prompt: '> Object with `x: 2`, `y: 1`, getter `position` → `2,1`. Print it.',
          equals: '2,1',
          ast: 'get ',
          hidden: true,
          hints: hints(
            'get position() { return this.x + "," + this.y }',
            { level: 4, kind: 'assist', md: 'const fox = {\n  x: 2,\n  y: 1,\n  get position() { return this.x + "," + this.y }\n}\nconsole.log(fox.position)\nmodule.exports = { fox }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const fox = { x: 2, y: 1, position: "0,0" }
console.log(fox.position)
module.exports = { fox }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.fox.position, '2,1')
assert.ok(Object.getOwnPropertyDescriptor(m.fox, 'position').get)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'symbols',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'Symbols as unique keys',
      skillIds: ['js.objects'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## A key that will not collide\n\n`const meta = Symbol("meta")` is unique. `obj[meta] = "hidden"` does not show up in `Object.keys` or JSON by default.\n\nPrint the hidden meta field.'
        ),
        predict(
          'keys-skip',
          '`Object.keys({ [Symbol("m")]: 1 })` is…',
          [
            { id: 'one', md: '`["Symbol(m)"]`' },
            { id: 'empty', md: '`[]` — symbols are skipped' }
          ],
          'empty'
        ),
        stdoutCode({
          id: 'hide-meta',
          prompt: '> Store `"note"` under a symbol key and print it (`note`).',
          equals: 'note',
          ast: 'Symbol',
          hidden: true,
          hints: hints(
            'const k = Symbol("meta"); obj[k] = "note"',
            { level: 4, kind: 'assist', md: 'const k = Symbol("meta")\nconst obj = { [k]: "note" }\nfunction hiddenNote() { return obj[k] }\nconsole.log(hiddenNote())\nmodule.exports = { hiddenNote, k, obj }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function hiddenNote() {
  return "visible"
}
console.log(hiddenNote())
module.exports = { hiddenNote }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.hiddenNote(), 'note')
`) + srcIncludes('Symbol')
    }
  })

  out.push({
    doc: lesson({
      id: 'weak-collections',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'WeakMap notes',
      skillIds: ['js.objects'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Private-ish notes on objects you do not own\n\n`WeakMap` keys must be objects. When the key is garbage-collected, the entry can go. You cannot iterate a WeakMap — that is the point.\n\nTiny code: remember a note on a route object.'
        ),
        predict(
          'weak-key',
          'A WeakMap key can be the string `"fox"`?',
          [
            { id: 'yes', md: 'Yes' },
            { id: 'no', md: 'No — keys must be objects' }
          ],
          'no'
        ),
        stdoutCode({
          id: 'weak-note',
          prompt: '> `noteOf(route)` reads a WeakMap. Store `"keep"` on `{}` and print it.',
          equals: 'keep',
          ast: 'WeakMap',
          hidden: true,
          hints: hints(
            'const notes = new WeakMap(); notes.set(route, "keep")',
            { level: 4, kind: 'assist', md: 'const notes = new WeakMap()\nfunction noteOf(route) { return notes.get(route) }\nconst route = {}\nnotes.set(route, "keep")\nconsole.log(noteOf(route))\nmodule.exports = { noteOf, notes, route }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const notes = new Map()
function noteOf(route) {
  return notes.get(route)
}
const route = {}
notes.set(route, "keep")
console.log(noteOf(route))
module.exports = { noteOf, notes, route }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.noteOf(m.route), 'keep')
assert.ok(m.notes instanceof WeakMap)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'iterators-for-of',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'Custom iterable of dirs',
      skillIds: ['js.iter'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## `for...of` calls `[Symbol.iterator]`\n\nAn object is iterable if that method returns `{ next() { return { value, done } } }`.\n\nBuild a tiny iterable that yields `"east"`, `"east"`, `"south"` so the fox can `for (const d of path) Player.move(d)`.'
        ),
        predict(
          'for-of-needs',
          '`for (const x of obj)` requires…',
          [
            { id: 'array', md: 'That obj is an Array' },
            { id: 'iter', md: 'That obj has Symbol.iterator' }
          ],
          'iter'
        ),
        playCode({
          id: 'iterable-path',
          prompt: '> Make `path` iterable: east, east, south. Walk to (2, 1).',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: hints(
            'You can also use dirs[Symbol.iterator] from an array. A custom next() is the lesson.',
            { level: 4, kind: 'assist', md: 'const dirs = ["east", "east", "south"]\nconst path = {\n  [Symbol.iterator]() { return dirs[Symbol.iterator]() }\n}\nfor (const d of path) Player.move(d)\nmodule.exports = { path }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const path = {}
module.exports = { path }
`,
      'hidden.test.js': exportAssert(`assert.ok(m.path[Symbol.iterator])
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'generators',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'function* yields the next step',
      skillIds: ['js.iter'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Pause, yield, resume\n\n`function* steps() { yield "east"; yield "south" }` returns a generator. `for...of` pulls each yield.\n\nThe fox walks what you yield.'
        ),
        predict(
          'yield-pause',
          'A generator function returns…',
          [
            { id: 'first', md: 'The first yielded value immediately' },
            { id: 'gen', md: 'A generator object you iterate' }
          ],
          'gen'
        ),
        playCode({
          id: 'yield-walk',
          prompt: '> `function* route()` yields east twice and south once. Walk to (2, 1).',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          ast: 'function*',
          hints: hints(
            'for (const d of route()) Player.move(d)',
            { level: 4, kind: 'assist', md: 'function* route() {\n  yield "east"\n  yield "east"\n  yield "south"\n}\nfor (const d of route()) Player.move(d)\nmodule.exports = { route }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function* route() {
  yield "east"
}
module.exports = { route }
`,
      'hidden.test.js': exportAssert(`assert.deepStrictEqual([...m.route()], ['east', 'east', 'south'])
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'proxies-reflect',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'One proxy trap',
      skillIds: ['js.objects'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Trap `get`, do not build a framework\n\n`new Proxy(target, { get(t, key) { return Reflect.get(t, key) } })` intercepts reads. Use it once to default missing dirs to `"east"`.\n\nPrint the fallback dir.'
        ),
        predict(
          'proxy-get',
          'A `get` trap runs when you…',
          [
            { id: 'write', md: 'Write a field' },
            { id: 'read', md: 'Read a field' }
          ],
          'read'
        ),
        stdoutCode({
          id: 'proxy-default',
          prompt: '> Proxy a `{}` so missing keys return `"east"`. Print `wrap.unknown`.',
          equals: 'east',
          ast: 'Proxy',
          hidden: true,
          hints: hints(
            'get(t, key) { return key in t ? t[key] : "east" }',
            { level: 4, kind: 'assist', md: 'function wrapRoute(obj) {\n  return new Proxy(obj, {\n    get(t, key) {\n      if (key in t) return Reflect.get(t, key)\n      return "east"\n    }\n  })\n}\nconsole.log(wrapRoute({}).unknown)\nmodule.exports = { wrapRoute }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function wrapRoute(obj) {
  return obj
}
console.log(wrapRoute({}).unknown || "missing")
module.exports = { wrapRoute }
`,
      'hidden.test.js': exportAssert(`const w = m.wrapRoute({ south: 'south' })
assert.strictEqual(w.south, 'south')
assert.strictEqual(w.nope, 'east')
`) + srcIncludes('Proxy')
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-model-a-part',
      courseId: 'internals',
      moduleId: 'meta',
      title: 'Transfer: model a part',
      skillIds: ['js.proto', 'js.objects'],
      estimatedMinutes: 25,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## An object graph that matches a world part\n\nBuild `{ id, type, props }` like `world-v1`. `makePart("fox", { x: 1, y: 0 })` returns that shape. `movePart(part, "east")` increments `props.x`.\n\nPrint `2` after two easts from x=0.'
        ),
        predict(
          'props-box',
          '`part.props` should be…',
          [
            { id: 'copy', md: 'A string dump of fields' },
            { id: 'obj', md: 'An object the engine can read (`x`, `y`…)' }
          ],
          'obj'
        ),
        stdoutCode({
          id: 'make-part',
          prompt: '> `makePart` + `movePart` east twice from x=0. Print the new x (`2`).',
          equals: '2',
          hidden: true,
          hints: hints(
            'part.props.x += 1 for east.',
            { level: 4, kind: 'assist', md: 'function makePart(type, props) {\n  return { id: type, type, props: { ...props } }\n}\nfunction movePart(part, dir) {\n  if (dir === "east") part.props.x += 1\n}\nconst fox = makePart("fox", { x: 0, y: 0 })\nmovePart(fox, "east")\nmovePart(fox, "east")\nconsole.log(fox.props.x)\nmodule.exports = { makePart, movePart }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function makePart(type, props) {
  return { type, props }
}
function movePart(part, dir) {}
const fox = makePart("fox", { x: 0, y: 0 })
movePart(fox, "east")
console.log(fox.props.x)
module.exports = { makePart, movePart }
`,
      'hidden.test.js': exportAssert(`const p = m.makePart('beacon', { x: 1, y: 2, label: 'B' })
assert.strictEqual(p.type, 'beacon')
assert.strictEqual(p.props.y, 2)
m.movePart(p, 'east')
assert.strictEqual(p.props.x, 2)
`)
    }
  })

  return out
}
