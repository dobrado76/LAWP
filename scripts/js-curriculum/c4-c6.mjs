import {
  lesson,
  explain,
  predict,
  cloze,
  tf,
  ladder,
  stdoutCode,
  playCode,
  fox,
  beacon,
  rock,
  tree,
  token,
  piece,
  wall,
  field,
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
      taskRev: 3,
      blocks: [
        explain(
          '## A name before it is ready\n\n`let` and `const` exist from the start of the block, but you cannot read them until the line that sets them. That empty stretch is the temporal dead zone. `console.log(label)` above `let label = "east"` throws `ReferenceError`.\n\n`var` is older: it hoists as `undefined`, so a read before the assign is quiet and wrong. Prefer `let` and `const` so the crash teaches you.\n\nOn the desk, the fox cannot read a heading sticker that is still blank. Write the heading first, then walk.'
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
        cloze(
          'tdz-name',
          'Reading a `let` before it is set throws {{a}}.',
          [{ id: 'a', choices: ['undefined', 'ReferenceError', 'TypeError'] }],
          { a: 'ReferenceError' },
          { explainMd: 'The name is reserved in the block, but it is not ready. The language throws ReferenceError, not a quiet undefined.' }
        ),
        stdoutCode({
          id: 'after-init',
          prompt:
            '> Inside `readyLabel`, declare a `let` binding for `"east"`, then return that binding. Print it. A bare `return "east"` is not enough — the point is reading the binding after init.',
          equals: 'east',
          ast: 'let',
          hidden: true,
          hints: ladder(
            'A `let` is safe to read only after the line that sets it.',
            'Declare the name, give it `"east"`, then return that name.',
            'function readyLabel() { let dir = "east"; return dir }',
            'function readyLabel() {\n  let dir = "east"\n  return dir\n}\nconsole.log(readyLabel())\nmodule.exports = { readyLabel }'
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
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\\blet\\b/.test(src), 'declare a let binding for the word')
assert.ok(!/return\\s+[\"']east[\"']/.test(src), 'return the binding, not the string literal')
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
          '## The function keeps the box\n\n`makeMover(dir)` returns a function. That inner function still sees `dir` later — that is a closure. The fox can call the returned function after you have left `makeMover`.\n\nThe closure keeps a live binding, not a sticky-note copy, unless you create a new binding each time.\n\nAt the signal desk, you hand the fox a radio tuned to `"east"`. Three later calls still walk east, even though `makeMover` has finished.'
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
        cloze(
          'closure-binding',
          'After `makeMover` returns, the inner function still sees {{a}}.',
          [{ id: 'a', choices: ['dir', 'undefined', 'a printed copy'] }],
          { a: 'dir' },
          { explainMd: 'The inner function keeps the binding named dir. It does not lose the heading when makeMover ends.', skillIds: ['js.closures'] }
        ),
        playCode({
          id: 'radio-east',
          prompt: '> `makeMover("east")` returns a function. Call it three times to reach x=3.',
          world: field(
            [
              fox(0, 0),
              beacon(3, 0),
              tree('t1', 5, 0),
              tree('t2', 6, 4),
              rock('r1', 5, 3),
              piece('owl', 'owl', 6, 1),
              token('coin', 'coin', 0, 3),
              piece('chest', 'chest', 6, 3)
            ],
            { floor: 'floor-grass' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          hints: ladder(
            'Return a function that still sees the `dir` parameter.',
            'Inside that function, call `Player.move(dir)`.',
            'Call the returned function three times after `makeMover("east")`.',
            'function makeMover(dir) {\n  return function go() { Player.move(dir) }\n}\nconst go = makeMover("east")\ngo(); go(); go()\nmodule.exports = { makeMover }'
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
      'hidden.test.js':
        exportAssert(`assert.strictEqual(typeof m.makeMover('south'), 'function')
assert.strictEqual(m.makeMover.length, 1, 'makeMover takes the heading as a parameter')
`) +
        playLogOk(`const moves = log.filter((row) => row.op === 'move')
assert.ok(moves.length >= 3, 'call the returned function three times')
assert.ok(moves.every((row) => row.dir === 'east'), 'every step comes from the radio you tuned')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(!/Player\\.move\\(\\s*["']east["']\\s*\\)/.test(src), 'move through the closure, not a hard-coded heading')
`)
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
      taskRev: 3,
      blocks: [
        explain(
          '## A table of functions\n\n`const cmds = { go(dir) { Player.move(dir) }, turn() { Player.rotate(90) } }` stores functions under names. You look up a name and call it. That is how a small language of stage commands stays data.\n\nThe name without `()` is the function value. You still have to call it.\n\nThe desk files `go` and `turn` on a clipboard. The fox only moves when you say `cmds.go("east")`, not when you glance at `cmds.go`.'
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
        cloze(
          'lookup-kind',
          '`cmds.go` without `()` is {{a}}.',
          [{ id: 'a', choices: ['the function value', 'a finished move', 'undefined'] }],
          { a: 'the function value' },
          { explainMd: 'Looking up the name gives you the function. Parentheses are what run it.' }
        ),
        playCode({
          id: 'cmd-table',
          prompt:
            '> Build `cmds.go` / `cmds.turn`. Drive the walk only through `cmds.go("east")` and `cmds.turn()` — not bare `Player.move` / `Player.rotate` at the call site. Reach (3,0) facing 90°.',
          world: field(
            [
              fox(0, 0),
              beacon(3, 0),
              wall('w1', 0, 2),
              wall('w2', 1, 2),
              wall('w3', 2, 2),
              tree('t1', 6, 0),
              rock('r1', 5, 4),
              piece('owl', 'owl', 6, 3),
              token('coin', 'coin', 4, 4),
              piece('chest', 'chest', 6, 4)
            ],
            { floor: 'floor-dirt' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0), at('fox', 'rot', 90)] },
          hidden: true,
          hints: ladder(
            'Put the move and the rotate on the same object under names.',
            '`go` should call `Player.move(dir)`. `turn` should call `Player.rotate(90)`.',
            'Call `cmds.go("east")` three times, then `cmds.turn()`.',
            'const cmds = {\n  go(dir) { Player.move(dir) },\n  turn() { Player.rotate(90) }\n}\ncmds.go("east"); cmds.go("east"); cmds.go("east"); cmds.turn()\nmodule.exports = { cmds }'
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
`) +
        playLogOk(`const src = fs.readFileSync('main.js', 'utf8')
assert.ok(/cmds\\.go\\s*\\(/.test(src), 'call through cmds.go')
assert.ok(/cmds\\.turn\\s*\\(/.test(src), 'call through cmds.turn')
const withoutTable = src.replace(/const\\s+cmds\\s*=\\s*\\{[\\s\\S]*?\\n\\}/, '')
assert.ok(!/Player\\.move\\s*\\(/.test(withoutTable), 'do not call Player.move outside the cmds table')
assert.ok(!/Player\\.rotate\\s*\\(/.test(withoutTable), 'do not call Player.rotate outside the cmds table')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'arrow-vs-function',
      courseId: 'scope-hofs',
      moduleId: 'tools',
      title: 'Arrow function syntax',
      skillIds: ['js.functions'],
      estimatedMinutes: 20,
      taskRev: 3,
      blocks: [
        explain(
          '## A shorter function shape\n\n`const add = (a, b) => a + b` is an **arrow function**: parameters on the left of `=>`, expression (or block) on the right. No `function` keyword.\n\nArrows also keep the outer `this` instead of getting a new one at the call site — that matters later when you write methods. This lesson grades the syntax: write `add` as an arrow that returns the sum.'
        ),
        predict(
          'arrow-this',
          'An arrow function’s `this` is…',
          [
            { id: 'call', md: 'Whatever called it, like a method', misconceptionId: 'arrow-is-just-shorter' },
            { id: 'outer', md: 'The `this` from the scope where it was created' }
          ],
          'outer',
          {
            explainMd:
              'Arrows do not get a new `this` at the call site. They keep the `this` from where they were written. Methods that need their own `this` stay as `function`.'
          }
        ),
        cloze(
          'arrow-keeps',
          "An arrow's `this` is {{a}}.",
          [{ id: 'a', choices: ['from the outer scope', 'whatever called it', 'always the global'] }],
          { a: 'from the outer scope' },
          { explainMd: 'Arrows do not get a new this at the call site. They keep the this from where they were written.', skillIds: ['js.this'] }
        ),
        stdoutCode({
          id: 'arrow-sum',
          prompt: '> Write `add` as an arrow that returns `a + b`. Print `add(2, 3)` (`5`).',
          equals: '5',
          ast: '=>',
          hidden: true,
          hints: ladder(
            'Use `=>` so the hidden check can see an arrow.',
            'Two parameters, then the sum. No `function` keyword.',
            'const add = (a, b) => a + b',
            'const add = (a, b) => a + b\nconsole.log(add(2, 3))\nmodule.exports = { add }'
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
          '## A function that takes a function\n\n`function walk(steps, fn)` calls `fn` once per step. You pass `function () { Player.move("east") }` or an arrow.\n\nThe higher-order function owns the count. The callback owns the action.\n\nThe desk says “three steps.” The fox decides what a step is. `walk(3, goEast)` walks east three times without hard-coding the loop at the call site.'
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
        cloze(
          'hof-times',
          '`walk(3, fn)` calls `fn` {{a}}.',
          [{ id: 'a', choices: ['once', 'three times', 'zero times'] }],
          { a: 'three times' },
          { explainMd: 'The first argument is how many times to run the callback. Three means three calls.' }
        ),
        playCode({
          id: 'walk-fn',
          prompt: '> Implement `walk(steps, fn)` and pass a mover that goes east. Reach (3, 0).',
          world: field(
            [
              fox(0, 0),
              beacon(3, 0),
              tree('t1', 5, 1),
              rock('r1', 4, 3),
              piece('owl', 'owl', 6, 0),
              token('coin', 'coin', 1, 4),
              piece('chest', 'chest', 6, 4),
              wall('w1', 0, 2)
            ],
            { floor: 'floor-path' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          hints: ladder(
            '`walk` should run the callback once per step, not once in total.',
            'A counted `for` loop from `0` to `steps` is enough.',
            'for (let i = 0; i < steps; i++) fn()',
            'function walk(steps, fn) {\n  for (let i = 0; i < steps; i++) fn()\n}\nwalk(3, () => Player.move("east"))\nmodule.exports = { walk }'
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
          '## One binding, many callbacks\n\nA loop with `var i` (or one `let dir` you overwrite) makes every callback see the **last** value. The fox repeats the last heading.\n\nFix it: `let` in the loop, or `dirs.forEach((dir) => { ... })` so each callback has its own `dir`.\n\nThe plan was east, then south. After the loop, every queued mover still reads the last cell of `dirs`, so the fox walks the last heading twice and misses the beacon.'
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
        cloze(
          'stale-last',
          'Callbacks from a `var` loop often all see the {{a}} value.',
          [{ id: 'a', choices: ['last', 'first', 'each own'] }],
          { a: 'last' },
          { explainMd: 'var is one binding for the whole function. After the loop, i (or the shared dir) is the last value.' }
        ),
        playCode({
          id: 'fix-stale',
          debug: true,
          prompt: '> The starter queues movers that all walk the last dir. Fix them so the path is east, south (1, 1).',
          world: field(
            [
              fox(0, 0),
              beacon(1, 1),
              tree('t1', 4, 0),
              rock('r1', 5, 2),
              piece('owl', 'owl', 6, 0),
              token('coin', 'coin', 0, 3),
              piece('chest', 'chest', 6, 4),
              wall('w1', 3, 3)
            ],
            { floor: 'floor-sand' }
          ),
          goal: { all: [at('fox', 'x', 1), at('fox', 'y', 1)] },
          hidden: true,
          hints: ladder(
            'Each queued function needs its own `dir`, not one shared `var i`.',
            '`map` or `forEach` gives each callback its own parameter.',
            'const movers = dirs.map((dir) => () => Player.move(dir))',
            'const dirs = ["east", "south"]\nconst movers = dirs.map((dir) => () => Player.move(dir))\nfor (const go of movers) go()'
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
      taskRev: 3,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Dispatch drives the walk\n\n`run(plan, table)` looks up each string in `table` and calls that function. A new maze is a new plan array — not a new pile of copy-paste moves.\n\nIf a key is missing, a careful runner throws or names the unknown key. A silent skip hides a typo forever.\n\nPlan `"e"`, `"e"`, `"s"` should put the fox on the beacon at (2, 1). A stray `"n"` should not vanish.'
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
        cloze(
          'missing-plan',
          'A missing plan key should {{a}}.',
          [{ id: 'a', choices: ['throw or name it', 'skip forever', 'walk east'] }],
          { a: 'throw or name it' },
          { explainMd: 'Unknown commands are faults. Name them or throw so a typo cannot hide.' }
        ),
        playCode({
          id: 'run-plan',
          prompt:
            '> `run(plan, table)` with table keys `e` / `s`. Reach the beacon at (2, 1). A missing key must `throw` (hidden test uses `assert.throws`).',
          world: field(
            [
              fox(0, 0),
              beacon(2, 1),
              tree('t1', 5, 0),
              rock('r1', 4, 3),
              piece('owl', 'owl', 6, 2),
              token('coin', 'coin', 0, 4),
              piece('chest', 'chest', 6, 4),
              wall('w1', 3, 4)
            ],
            { floor: 'floor-brick' }
          ),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: ladder(
            'Walk the plan in order. Each string is a key in `table`.',
            'If `table[key]` is missing, throw. If it exists, call it.',
            'for (const key of plan) table[key]()',
            'function run(plan, table) {\n  for (const key of plan) {\n    if (!table[key]) throw new Error("unknown " + key)\n    table[key]()\n  }\n}\nconst table = { e: () => Player.move("east"), s: () => Player.move("south") }\nrun(["e", "e", "s"], table)\nmodule.exports = { run }'
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
assert.throws(() => m.run(['missing'], { x: () => {} }), /./, 'missing plan keys must throw')
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
          '## A bad dir is not the end\n\n`Player.move` already faults on a bad dir. Here **you** throw `new Error("bad dir")` if the string is not a compass word. `catch` `say`s the fault, then you still finish the walk east to the beacon.\n\nThe program continues after a handled error. The next line after the `try/catch` still runs.\n\nThe fox is told `"up"`. That is not a heading. It says `"fault"`, then walks east twice onto the lamp.'
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
        cloze(
          'after-catch',
          'After `catch` runs, the next line {{a}}.',
          [{ id: 'a', choices: ['still runs', 'never runs', 'throws again'] }],
          { a: 'still runs' },
          { explainMd: 'catch handled the error. Code after the try/catch is ordinary code again.' }
        ),
        playCode({
          id: 'catch-say',
          prompt: '> `step("up")` throws. Catch it, `Player.say("fault")`, then walk east to (2, 0).',
          world: field(
            [
              fox(0, 0),
              beacon(2, 0),
              wall('w1', 0, 2),
              wall('w2', 1, 2),
              wall('w3', 2, 2),
              tree('t1', 5, 1),
              rock('r1', 6, 3),
              piece('owl', 'owl', 6, 0),
              token('coin', 'coin', 4, 4),
              piece('chest', 'chest', 5, 4)
            ],
            { floor: 'floor-wood' }
          ),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 0), at('fox', 'say', 'fault')] },
          hidden: true,
          hints: ladder(
            '`step` should throw when the string is not a compass word.',
            'Catch the bad `"up"` call, then `Player.say("fault")`.',
            'After the catch, walk east twice with legal `step` calls.',
            'function step(dir) {\n  if (!["north", "south", "east", "west"].includes(dir)) throw new Error("bad dir")\n  Player.move(dir)\n}\ntry { step("up") } catch (e) { Player.say("fault") }\nstep("east"); step("east")\nmodule.exports = { step }'
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
          '## Cleanup, then fail\n\n`finally` runs whether `try` threw or not. Use it to push a clear note after an attempt.\n\nIf you still want the caller to see the error, throw again after cleanup. `finally` is not a catch that swallows the fault.\n\nThe desk wipes the clipboard (`"clear"`) even when the attempt fails. Then it can still rethrow so the night log shows the fault.'
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
        cloze(
          'finally-runs',
          '`finally` {{a}} when `try` throws.',
          [{ id: 'a', choices: ['always runs', 'never runs', 'runs only if catch exists'] }],
          { a: 'always runs' },
          { explainMd: 'finally is cleanup. It runs after try, whether or not a throw happened.' }
        ),
        stdoutCode({
          id: 'cleanup',
          prompt: '> `attempt()` tries a throw, `finally` pushes `"clear"` into `notes`, then rethrows. Print `notes[0]` by catching outside (`clear`).',
          equals: 'clear',
          ast: 'finally',
          hidden: true,
          hints: ladder(
            '`finally` is the place that always records cleanup.',
            'Push `"clear"` in `finally`. Let the throw leave `attempt`.',
            'Catch outside `attempt` so you can print `notes[0]`.',
            'const notes = []\nfunction attempt() {\n  try { throw new Error("x") }\n  finally { notes.push("clear") }\n}\ntry { attempt() } catch (e) {}\nconsole.log(notes[0])\nmodule.exports = { attempt, notes }'
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
          '## Name the failure\n\n`class RouteError extends Error {}` lets `catch (e)` ask `e instanceof RouteError`. A generic `Error` is a shrug. A named class is a signal.\n\nA `RouteError` is still an `Error`. `e instanceof Error` stays true.\n\nWhen the path is blocked, the fox throws `RouteError("blocked")`. The desk can tell a blocked route from a missing file.'
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
        cloze(
          'still-error',
          '`new RouteError` is {{a}} an Error.',
          [{ id: 'a', choices: ['still', 'never', 'only if you wrap it'] }],
          { a: 'still' },
          { explainMd: 'extends Error keeps the subclass in the Error family. instanceof Error is true.' }
        ),
        stdoutCode({
          id: 'route-error',
          prompt: '> Define `RouteError`. `fail()` throws one with message `blocked`. Catch it and print `blocked`.',
          equals: 'blocked',
          ast: 'class RouteError',
          hidden: true,
          hints: ladder(
            'Make a class that extends `Error`.',
            '`fail` should `throw new RouteError("blocked")`, not a plain Error.',
            'Catch it and print `e.message`.',
            'class RouteError extends Error {}\nfunction fail() { throw new RouteError("blocked") }\ntry { fail() } catch (e) { console.log(e.message) }\nmodule.exports = { RouteError, fail }'
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
          '## The top line is the throw\n\nA stack lists calls from newest to oldest. The first `at step` line is where `throw` ran. Fix `step` so `"east"` is legal and `"up"` still throws.\n\nPrint `ok` after a good step. Do not throw on a compass heading.\n\nThe fox was told `"east"` and still crashed. The stack’s first `at` line points at `step`, not at the first function in the file.'
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
        cloze(
          'stack-first',
          'The first `at` line is usually {{a}}.',
          [{ id: 'a', choices: ['the function that threw', 'the first function in the file', 'the catch block'] }],
          { a: 'the function that threw' },
          { explainMd: 'Newest call is on top. That is where throw ran, not where the file began.' }
        ),
        stdoutCode({
          id: 'fix-step',
          debug: true,
          prompt: '> `step("east")` should not throw. Print `ok`. `step("up")` still throws.',
          equals: 'ok',
          hidden: true,
          hints: ladder(
            'The crash is inside `step`. Read the first `at` line.',
            'Only throw when the dir is unknown.',
            'Return a legal dir such as `"east"` instead of throwing.',
            'function step(dir) {\n  if (dir !== "east" && dir !== "west" && dir !== "north" && dir !== "south") throw new Error("bad")\n  return dir\n}\nstep("east")\nconsole.log("ok")\nmodule.exports = { step }'
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
      taskRev: 3,
      blocks: [
        explain(
          '## `+` and `==` ask an object for a primitive\n\n`[] + []` is `""`. `[] == false` is `true` because both sides coerce. `{ valueOf() { return 1 } } + 1` is `2`.\n\nPrefer `===` and explicit `Number` / `String`. The language has a ToPrimitive walk, not a moral about “empty.”\n\nThe desk asked whether an empty tray `[]` equals `false` (lamp off). Loose `==` says yes. The fox should not treat an empty list as “off.”'
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
        cloze(
          'coerce-empty',
          '`[] == false` is {{a}} because both sides coerce.',
          [{ id: 'a', choices: ['true', 'false', 'TypeError'] }],
          { a: 'true' },
          { explainMd: 'Loose == walks both sides toward numbers. An empty array becomes 0, and false becomes 0.' }
        ),
        stdoutCode({
          id: 'valueof',
          prompt:
            '> `asNumber` builds a `box` with `valueOf` that returns `2`, then returns `Number(box)`. Print `2`. A bare `return 2` is not enough.',
          equals: '2',
          hidden: true,
          hints: ladder(
            '`Number(object)` asks the object for a primitive.',
            'Give `box` a `valueOf` that returns `2`.',
            'const box = { valueOf() { return 2 } }',
            'function asNumber() {\n  const box = { valueOf() { return 2 } }\n  return Number(box)\n}\nconsole.log(asNumber())\nmodule.exports = { asNumber }'
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
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/valueOf/.test(src), 'provide valueOf on the box')
assert.ok(/Number\\s*\\(/.test(src), 'coerce with Number(box)')
const stripped = src.replace(/valueOf\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}/g, '')
assert.ok(!/return\\s+2\\b/.test(stripped), 'return Number(box), not the literal 2')
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
          '## Shared methods live on the prototype\n\n`Object.getPrototypeOf(obj)` is the next place JS looks for a field. Many objects share one method object. That is `[[Prototype]]`, not a copy of the function on every instance.\n\nTwo foxes from the same prototype share one `go` function.\n\nThe desk does not copy `move` onto every route card. Each card looks up `go` on the shared prototype when you call it.'
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
        cloze(
          'proto-share',
          'Two objects from one prototype share {{a}}.',
          [{ id: 'a', choices: ['one method function', 'a private copy each', 'no methods'] }],
          { a: 'one method function' },
          { explainMd: 'The method lives once on the prototype. Instances look it up; they do not each get a copy.' }
        ),
        stdoutCode({
          id: 'read-proto',
          prompt: '> `protoName()` returns `Object.getPrototypeOf({}).constructor.name` (`Object`). Print it.',
          equals: 'Object',
          ast: 'getPrototypeOf',
          hidden: true,
          hints: ladder(
            'A plain `{}` has `Object.prototype` behind it.',
            'Read `Object.getPrototypeOf({})`, then `.constructor.name`.',
            'That name is the string `Object`.',
            'function protoName() {\n  return Object.getPrototypeOf({}).constructor.name\n}\nconsole.log(protoName())\nmodule.exports = { protoName }'
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
          '## Two ways to set the prototype\n\n`new Fn()` runs `Fn` and sets the instance proto to `Fn.prototype`.\n\n`Object.create(proto)` makes an object whose proto is `proto` and does not run a constructor. Use `create` when you want a chain without `new`.\n\n`Object.create(null)` has no prototype — a clean dictionary. The fox can store headings without inheriting `toString` from `Object.prototype`.'
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
        cloze(
          'create-proto',
          '`Object.create(null)` has {{a}}.',
          [{ id: 'a', choices: ['no prototype', 'Object.prototype', 'Array.prototype'] }],
          { a: 'no prototype' },
          { explainMd: 'The argument is the prototype. null means none. {} would have given you Object.prototype.' }
        ),
        stdoutCode({
          id: 'create-child',
          prompt: '> `child()` returns `Object.create({ kind: "beacon" })`. Print `child().kind`.',
          equals: 'beacon',
          ast: 'Object.create',
          hidden: true,
          hints: ladder(
            'The field should live on the prototype, not as an own field.',
            '`Object.create({ kind: "beacon" })` makes a child that can still read `kind`.',
            'Return that child. Print `child().kind`.',
            'function child() { return Object.create({ kind: "beacon" }) }\nconsole.log(child().kind)\nmodule.exports = { child }'
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
          '## A route blueprint\n\n`class Route { constructor(dir) { this.dir = dir } go() { Player.move(this.dir) } }` is nicer spelling for prototype methods.\n\n`go` lives on `Route.prototype`. Two instances share the same function.\n\nThe fox builds `new Route("east")` and calls `go` three times. The heading lives on the instance; the walk method is shared.'
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
        cloze(
          'go-lives',
          '`go` lives on {{a}}.',
          [{ id: 'a', choices: ['Route.prototype', 'each instance', 'the global object'] }],
          { a: 'Route.prototype' },
          { explainMd: 'class methods are prototype methods. Instances share one go function.' }
        ),
        playCode({
          id: 'class-route',
          prompt: '> `class Route` with `go()`. Walk east to (3, 0).',
          world: field(
            [
              fox(0, 0),
              beacon(3, 0),
              tree('t1', 5, 0),
              rock('r1', 4, 2),
              piece('owl', 'owl', 6, 1),
              token('coin', 'coin', 0, 4),
              piece('chest', 'chest', 6, 4)
            ],
            { floor: 'floor-grass' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'class Route',
          hints: ladder(
            '`constructor` stores `dir` on `this`. `go` reads it and moves.',
            'Make one `Route("east")`, then call `go` three times.',
            'const r = new Route("east"); r.go(); r.go(); r.go()',
            'class Route {\n  constructor(dir) { this.dir = dir }\n  go() { Player.move(this.dir) }\n}\nconst r = new Route("east")\nr.go(); r.go(); r.go()\nmodule.exports = { Route }'
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
          '## Four rules (plain functions)\n\n`obj.method()` sets `this` to `obj`. A bare `fn()` loses that receiver. `fn.call(obj)` / `apply` pick `this`. `fn.bind(obj)` returns a new function with `this` locked.\n\nAfter `const go = obj.go; go()`, the call site lost the receiver. Bind a mover so the callback still walks east.\n\nThe desk pulls `go` off the fox’s route card and later calls `go()`. Without `bind`, `this.dir` is gone and the fox stands still.'
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
        cloze(
          'this-lost',
          'After `const go = obj.go; go()`, `this` is {{a}}.',
          [{ id: 'a', choices: ['not obj', 'obj', 'the fox'] }],
          { a: 'not obj' },
          { explainMd: 'The method was pulled off the object. A bare call does not pass obj as this.', skillIds: ['js.this'] }
        ),
        playCode({
          id: 'bind-mover',
          prompt: '> `const go = mover.go.bind(mover)` then `go()` three times east to (3, 0).',
          world: field(
            [
              fox(0, 0),
              beacon(3, 0),
              tree('t1', 6, 0),
              rock('r1', 5, 3),
              piece('owl', 'owl', 6, 2),
              token('coin', 'coin', 1, 3),
              piece('chest', 'chest', 6, 4),
              wall('w1', 4, 4)
            ],
            { floor: 'floor-dirt' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'bind',
          hints: ladder(
            'A bare `go()` no longer has `mover` as `this`.',
            '`bind` locks `this` to `mover` so `go()` still reads `this.dir`.',
            'Call the bound function three times.',
            'const mover = {\n  dir: "east",\n  go() { Player.move(this.dir) }\n}\nconst go = mover.go.bind(mover)\ngo(); go(); go()\nmodule.exports = { mover }'
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
          '## A `position` getter\n\n`get position() { return this.x + "," + this.y }` runs on read. You do not get the getter function itself.\n\n`Object.getOwnPropertyDescriptor` shows `get` / `set` / `writable`.\n\nThe fox-like object has `x: 2`, `y: 1`. Reading `fox.position` should print `2,1` as if it were a field.'
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
        cloze(
          'getter-runs',
          'Reading `obj.position` {{a}}.',
          [{ id: 'a', choices: ['runs the getter', 'returns the getter function', 'throws'] }],
          { a: 'runs the getter' },
          { explainMd: 'A get trap is a field read. The engine calls the getter and hands you its return value.' }
        ),
        stdoutCode({
          id: 'pos-get',
          prompt: '> Object with `x: 2`, `y: 1`, getter `position` → `2,1`. Print it.',
          equals: '2,1',
          ast: 'get ',
          hidden: true,
          hints: ladder(
            'Use `get position()` in an object literal.',
            'Join `this.x` and `this.y` with a comma.',
            'get position() { return this.x + "," + this.y }',
            'const fox = {\n  x: 2,\n  y: 1,\n  get position() { return this.x + "," + this.y }\n}\nconsole.log(fox.position)\nmodule.exports = { fox }'
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
          '## A key that will not collide\n\n`const meta = Symbol("meta")` is unique. `obj[meta] = "hidden"` does not show up in `Object.keys` or JSON by default.\n\n`Object.keys({ [Symbol("m")]: 1 })` is `[]`. Symbols are skipped.\n\nThe desk pins a private note on a route card. The night log lists ordinary keys; the note stays off that list.'
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
        cloze(
          'keys-skip-sym',
          '`Object.keys` on a symbol-only object is {{a}}.',
          [{ id: 'a', choices: ['[]', '["Symbol(m)"]', '["m"]'] }],
          { a: '[]' },
          { explainMd: 'Object.keys lists string keys. Symbol keys stay off that list unless you ask for them.' }
        ),
        stdoutCode({
          id: 'hide-meta',
          prompt: '> Store `"note"` under a symbol key and print it (`note`).',
          equals: 'note',
          ast: 'Symbol',
          hidden: true,
          hints: ladder(
            'Make a `Symbol`, then use it as a key.',
            'Store `"note"` at `obj[k]`. Read it back the same way.',
            'const k = Symbol("meta"); obj[k] = "note"',
            'const k = Symbol("meta")\nconst obj = { [k]: "note" }\nfunction hiddenNote() { return obj[k] }\nconsole.log(hiddenNote())\nmodule.exports = { hiddenNote, k, obj }'
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
          '## Notes you do not own\n\n`WeakMap` keys must be objects. When the key is garbage-collected, the entry can go. You cannot iterate a WeakMap — that is the point.\n\nA string like `"fox"` cannot be a key.\n\nThe desk remembers `"keep"` on a route object it does not own. When that route is gone, the note can vanish with it.'
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
        tf(
          'weak-must',
          'A WeakMap key can be the string `"fox"`.',
          false,
          { explainMd: 'Keys must be objects (or symbols in a WeakMap of objects). A string is not allowed.' }
        ),
        stdoutCode({
          id: 'weak-note',
          prompt: '> `noteOf(route)` reads a WeakMap. Store `"keep"` on `{}` and print it.',
          equals: 'keep',
          ast: 'WeakMap',
          hidden: true,
          hints: ladder(
            'Use `WeakMap`, not `Map`, so the hidden check can see the type.',
            '`notes.set(route, "keep")` stores the string on that object key.',
            'const notes = new WeakMap(); notes.set(route, "keep")',
            'const notes = new WeakMap()\nfunction noteOf(route) { return notes.get(route) }\nconst route = {}\nnotes.set(route, "keep")\nconsole.log(noteOf(route))\nmodule.exports = { noteOf, notes, route }'
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
          '## `for...of` calls `[Symbol.iterator]`\n\nAn object is iterable if that method returns `{ next() { return { value, done } } }`. It does not have to be an Array.\n\nBuild a tiny iterable that yields `"east"`, `"east"`, `"south"` so the fox can `for (const d of path) Player.move(d)`.\n\nThe plan lives on a custom `path` object. The fox only cares that `for...of` can pull the next heading.'
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
        cloze(
          'forof-needs',
          '`for...of` needs {{a}}.',
          [{ id: 'a', choices: ['Symbol.iterator', 'an Array only', 'Object.keys'] }],
          { a: 'Symbol.iterator' },
          { explainMd: 'Arrays work because they have Symbol.iterator. Any object with that method is iterable.' }
        ),
        playCode({
          id: 'iterable-path',
          prompt: '> Make `path` iterable: east, east, south. Walk to (2, 1).',
          world: field(
            [
              fox(0, 0),
              beacon(2, 1),
              tree('t1', 5, 1),
              rock('r1', 3, 3),
              piece('owl', 'owl', 6, 0),
              token('coin', 'coin', 0, 3),
              piece('chest', 'chest', 6, 4)
            ],
            { floor: 'floor-path' }
          ),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: ladder(
            '`path` needs `[Symbol.iterator]`, not just a list field.',
            'You can also use `dirs[Symbol.iterator]` from an array. A custom `next()` is the lesson.',
            'for (const d of path) Player.move(d)',
            'const dirs = ["east", "east", "south"]\nconst path = {\n  [Symbol.iterator]() { return dirs[Symbol.iterator]() }\n}\nfor (const d of path) Player.move(d)\nmodule.exports = { path }'
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
          '## Pause, yield, resume\n\n`function* steps() { yield "east"; yield "south" }` returns a generator. It does not return the first yield immediately.\n\n`for...of` pulls each yield. The fox walks what you yield.\n\n`function* route()` yields east, east, south. The beacon sits at (2, 1) when those three steps run.'
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
        cloze(
          'gen-returns',
          'A generator function returns {{a}}.',
          [{ id: 'a', choices: ['a generator object', 'the first yield', 'undefined'] }],
          { a: 'a generator object' },
          { explainMd: 'Calling function* gives you an iterator. Values come out when you iterate it.' }
        ),
        playCode({
          id: 'yield-walk',
          prompt: '> `function* route()` yields east twice and south once. Walk to (2, 1).',
          world: field(
            [
              fox(0, 0),
              beacon(2, 1),
              tree('t1', 4, 4),
              rock('r1', 5, 0),
              piece('owl', 'owl', 6, 3),
              token('coin', 'coin', 1, 3),
              piece('chest', 'chest', 6, 4),
              wall('w1', 3, 2)
            ],
            { floor: 'floor-sand' }
          ),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          ast: 'function*',
          hints: ladder(
            '`function*` plus `yield` makes the iterator for you.',
            'Yield `"east"`, `"east"`, then `"south"`.',
            'for (const d of route()) Player.move(d)',
            'function* route() {\n  yield "east"\n  yield "east"\n  yield "south"\n}\nfor (const d of route()) Player.move(d)\nmodule.exports = { route }'
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
          '## Trap `get`, do not build a framework\n\n`new Proxy(target, { get(t, key) { return Reflect.get(t, key) } })` intercepts reads. A `get` trap runs when you read a field, not when you write one.\n\nUse it once to default missing dirs to `"east"`.\n\nThe desk wraps a blank route card. Asking for `unknown` still returns `"east"`, so the fox has a fallback heading.'
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
        cloze(
          'trap-when',
          'A `get` trap runs when you {{a}} a field.',
          [{ id: 'a', choices: ['read', 'write', 'delete'] }],
          { a: 'read' },
          { explainMd: 'get is the read trap. set would run on a write. deleteProperty would run on delete.' }
        ),
        stdoutCode({
          id: 'proxy-default',
          prompt: '> Proxy a `{}` so missing keys return `"east"`. Print `wrap.unknown`.',
          equals: 'east',
          ast: 'Proxy',
          hidden: true,
          hints: ladder(
            'Wrap the object in `new Proxy`.',
            'In `get`, return the real field when it exists, otherwise `"east"`.',
            'get(t, key) { return key in t ? t[key] : "east" }',
            'function wrapRoute(obj) {\n  return new Proxy(obj, {\n    get(t, key) {\n      if (key in t) return Reflect.get(t, key)\n      return "east"\n    }\n  })\n}\nconsole.log(wrapRoute({}).unknown)\nmodule.exports = { wrapRoute }'
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
          '## An object graph that matches a world part\n\nBuild `{ id, type, props }` like `world-v1`. `makePart("fox", { x: 1, y: 0 })` returns that shape. `movePart(part, "east")` increments `props.x`.\n\n`part.props` is an object the engine can read (`x`, `y`…), not a string dump.\n\nTwo easts from x=0 put the modeled fox at x=2, the same way the stage fox walks.'
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
        cloze(
          'props-shape',
          '`part.props` should be {{a}}.',
          [{ id: 'a', choices: ['an object with x and y', 'a string dump', 'a function'] }],
          { a: 'an object with x and y' },
          { explainMd: 'The stage reads fields on props. A printed string cannot increment x.' }
        ),
        stdoutCode({
          id: 'make-part',
          prompt: '> `makePart` + `movePart` east twice from x=0. Print the new x (`2`).',
          equals: '2',
          hidden: true,
          hints: ladder(
            '`makePart` returns `{ id, type, props }`. Copy `props` so callers cannot share one box by accident.',
            'For `"east"`, add 1 to `part.props.x`.',
            'part.props.x += 1 for east.',
            'function makePart(type, props) {\n  return { id: type, type, props: { ...props } }\n}\nfunction movePart(part, dir) {\n  if (dir === "east") part.props.x += 1\n}\nconst fox = makePart("fox", { x: 0, y: 0 })\nmovePart(fox, "east")\nmovePart(fox, "east")\nconsole.log(fox.props.x)\nmodule.exports = { makePart, movePart }'
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
