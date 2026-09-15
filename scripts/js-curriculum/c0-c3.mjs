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
  fox,
  beacon,
  rock,
  tree,
  wall,
  token,
  piece,
  gridWorld,
  field,
  at,
  srcIncludes,
  playLogOk,
  exportAssert
} from './lib.mjs'

export function lessonsC0C3() {
  const out = []

  out.push({
    doc: lesson({
      id: 'js-placement',
      courseId: 'placement',
      moduleId: 'diagnostic',
      title: 'Placement: what JS already does in your head',
      skillIds: ['js.values', 'js.flow', 'js.functions', 'js.arrays', 'js.closures', 'js.async', 'js.this', 'js.dom'],
      estimatedMinutes: 25,
      blocks: [
        explain(
          '## No fox yet\n\nEight short questions about what JavaScript actually does. Wrong answers do not lock you out — they mark which later lessons to take slowly.\n\nPick the result you expect the language to produce, not the result you wish it produced. Later, the same ideas show up as a fox on a field and as a signal board on a page.'
        ),
        check(
          'typeof-null',
          '`typeof null` is…',
          [
            { id: 'null', md: '`"null"`' },
            { id: 'object', md: '`"object"`', misconceptionId: 'null-is-object-ok' },
            { id: 'undefined', md: '`"undefined"`' }
          ],
          'object',
          { diagnostic: true, skillIds: ['js.values'], explainMd: '`typeof null` is the string `"object"`. That is a lie the language kept. Later you will treat `null` as its own empty value, not as an object you can poke.' }
        ),
        check(
          'strict-eq',
          '`0 === ""` is…',
          [
            { id: 'true', md: 'true — they feel empty', misconceptionId: 'double-equals-is-fine' },
            { id: 'false', md: 'false — different kinds' }
          ],
          'false',
          { diagnostic: true, skillIds: ['js.values'] }
        ),
        check(
          'truthy-zero',
          '`if (0) { "go" } else { "stop" }` yields…',
          [
            { id: 'go', md: '`go`' },
            { id: 'stop', md: '`stop`' }
          ],
          'stop',
          { diagnostic: true, skillIds: ['js.flow'] }
        ),
        check(
          'closure-sniff',
          '`function make() { let n = 0; return () => ++n } const a = make(); a(); a();` — `a()` now returns…',
          [
            { id: '1', md: '`1` — each call starts over', misconceptionId: 'closure-copies-value' },
            { id: '3', md: '`3` — `n` is still the same box' },
            { id: '2', md: '`2`' }
          ],
          '3',
          { diagnostic: true, skillIds: ['js.closures'] }
        ),
        check(
          'map-vs-mutate',
          '`const xs = [1]; const ys = xs.map(n => n + 1)` — `xs[0]` is…',
          [
            { id: '2', md: '`2` — map rewrote the list', misconceptionId: 'map-mutates' },
            { id: '1', md: '`1` — map returned a new list' }
          ],
          '1',
          { diagnostic: true, skillIds: ['js.arrays'] }
        ),
        check(
          'promise-vs-cb',
          'A `Promise` that is waiting to finish is in which state?',
          [
            { id: 'pending', md: 'pending' },
            { id: 'callback', md: 'callback — that is the same thing' }
          ],
          'pending',
          { diagnostic: true, skillIds: ['js.async'] }
        ),
        check(
          'this-sniff',
          'A plain `function greet() { return this }` called as `greet()` in sloppy Node often sees `this` as…',
          [
            { id: 'undefined-strict', md: 'always `undefined`' },
            { id: 'globalish', md: 'the global object (unless `"use strict"`)' }
          ],
          'globalish',
          { diagnostic: true, skillIds: ['js.this'] }
        ),
        check(
          'dom-sniff',
          '`document.querySelector("#beacon")` returns…',
          [
            { id: 'string', md: 'the HTML as a string' },
            { id: 'node', md: 'one element node, or `null` if missing' }
          ],
          'node',
          { diagnostic: true, skillIds: ['js.dom'] }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'values-and-typeof',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Values and typeof',
      skillIds: ['js.values'],
      estimatedMinutes: 12,
      taskRev: 2,
      blocks: [
        explain(
          '## Kinds you can print\n\nEvery value has a kind. `typeof 3` is `"number"`. `typeof "3"` is `"string"`. A later desk will ask “what kind of signal is this?” before it files the record.\n\n`typeof null` is `"object"` — that answer is a leftover bug. Do not treat `null` as a bag of fields. Export `kindOf` so a hidden test can call it. Print the kind of the number 3.'
        ),
        predict(
          'typeof-null',
          '`typeof null` prints which string?',
          [
            { id: 'null', md: '`null`' },
            { id: 'object', md: '`object`', misconceptionId: 'null-is-object-ok' },
            { id: 'undefined', md: '`undefined`' }
          ],
          'object'
        ),
        cloze(
          'kind-words',
          '`typeof 3` is {{a}}. `typeof "3"` is {{b}}.',
          [
            { id: 'a', choices: ['number', 'string', 'object'] },
            { id: 'b', choices: ['number', 'string', 'object'] }
          ],
          { a: 'number', b: 'string' },
          { explainMd: 'A numeral is a number. Quotes make text, even when the text looks like a digit.' }
        ),
        stdoutCode({
          id: 'typeof-number',
          prompt: '> Return and print `typeof 3` (`number`).',
          equals: 'number',
          ast: 'typeof',
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: '`typeof` is an operator, not a function you must call with extra punctuation.' },
            { level: 2, kind: 'concept', md: 'Export `kindOf` so the hidden test can call `kindOf(3)`.' },
            { level: 4, kind: 'assist', md: 'function kindOf(v) { return typeof v }\nconsole.log(kindOf(3))\nmodule.exports = { kindOf }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function kindOf(v) {
  return "?"
}
console.log(kindOf(3))
module.exports = { kindOf }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.kindOf(3), 'number')
assert.strictEqual(m.kindOf('3'), 'string')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'names-let-const',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Names, let, and const',
      skillIds: ['js.values'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A name is a box\n\n`let` names a box you can refill. `const` names a box you cannot *rebind* — the sticker on the box stays. If the value is an object, the stuff *inside* can still change.\n\nOn the desk: `const signal = { on: false }; signal.on = true` is legal. `signal = {}` is not. The name still points at the same record. The lamp field flipped.'
        ),
        predict(
          'const-object',
          'After `const route = { dir: "east" }; route.dir = "south"`, what is `route.dir`?',
          [
            { id: 'east', md: '`"east"` — const froze the object', misconceptionId: 'const-means-immutable' },
            { id: 'south', md: '`"south"` — the binding stayed, the field changed' }
          ],
          'south'
        ),
        tf(
          'const-rebind',
          '`const` stops you from changing a field on an object.',
          false,
          { explainMd: 'const stops a new assignment to that name. Fields on the object can still change.', misconceptionId: 'const-means-immutable' }
        ),
        stdoutCode({
          id: 'bind-then-print',
          prompt: '> `labelBox` should return the string `locked` from a `const` binding. Print that word.',
          equals: 'locked',
          ast: 'const',
          hidden: true,
          hints: hints(
            'const names a binding. You can still read it.',
            { level: 4, kind: 'assist', md: 'const word = "locked"\nfunction labelBox() { return word }\nconsole.log(labelBox())\nmodule.exports = { labelBox }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function labelBox() {
  return "open"
}
console.log(labelBox())
module.exports = { labelBox }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.labelBox(), 'locked')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(src.includes('const'))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'strings-and-templates',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Strings and templates',
      skillIds: ['js.values'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Text does not mutate in place\n\n`"east".toUpperCase()` returns a **new** string. The original stays `"east"`. A beacon tag is the same idea: you build a new label; you do not scratch the old letters off.\n\nA template literal drops a value into a string: `` `beacon:${name}` ``. The result is still text.'
        ),
        predict(
          'string-immutable',
          'After `let d = "east"; d.toUpperCase()`, what is `d`?',
          [
            { id: 'EAST', md: '`"EAST"`' },
            { id: 'east', md: '`"east"` — the method returned a new string' }
          ],
          'east'
        ),
        stdoutCode({
          id: 'tag-name',
          prompt: '> `tagBeacon("north")` returns `beacon:north`. Print that.',
          equals: 'beacon:north',
          ast: '`',
          hidden: true,
          hints: hints(
            'Use a template literal, not + if you can help it.',
            { level: 4, kind: 'assist', md: 'function tagBeacon(name) { return `beacon:${name}` }\nconsole.log(tagBeacon("north"))\nmodule.exports = { tagBeacon }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function tagBeacon(name) {
  return name
}
console.log(tagBeacon("north"))
module.exports = { tagBeacon }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.tagBeacon('east'), 'beacon:east')
assert.strictEqual(m.tagBeacon('north'), 'beacon:north')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'numbers-and-nan',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Numbers and NaN',
      skillIds: ['js.values'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Not a Number is still a number kind\n\n`Number("fox")` is `NaN`. `typeof NaN` is `"number"`. `NaN === NaN` is **false**. A desk that stores lamp current as a number must catch that — otherwise it files a broken reading as if it were zero.\n\nUse `Number.isNaN(x)` when you mean “this failed to become a number.”'
        ),
        predict(
          'nan-equals',
          '`NaN === NaN` is…',
          [
            { id: 'true', md: 'true' },
            { id: 'false', md: 'false' }
          ],
          'false'
        ),
        stdoutCode({
          id: 'is-nan',
          prompt: '> `failedNumber("fox")` returns `true` using `Number.isNaN`. Print it.',
          equals: 'true',
          ast: 'Number.isNaN',
          hidden: true,
          hints: hints(
            'Number("fox") is NaN. Number.isNaN tells you that on purpose.',
            { level: 4, kind: 'assist', md: 'function failedNumber(text) { return Number.isNaN(Number(text)) }\nconsole.log(failedNumber("fox"))\nmodule.exports = { failedNumber }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function failedNumber(text) {
  return text === "fox"
}
console.log(failedNumber("fox"))
module.exports = { failedNumber }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.failedNumber('fox'), true)
assert.strictEqual(m.failedNumber('3'), false)
`) + srcIncludes('Number.isNaN')
    }
  })

  out.push({
    doc: lesson({
      id: 'triple-equals',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Triple equals',
      skillIds: ['js.values'],
      estimatedMinutes: 15,
      taskRev: 2,
      blocks: [
        explain(
          '## `===` does not convert\n\n`0 == ""` is true because `==` coerces. `0 === ""` is false. A signal of `0` (off) is not the same as a missing name `""`.\n\nPrefer `===` and `!==` unless you can name the coercion you want. Print whether `0` and `""` are **not** strictly equal (`true`).'
        ),
        predict(
          'double-trap',
          '`0 == ""` is true. Is `0 === ""` also true?',
          [
            { id: 'yes', md: 'Yes — empty is empty', misconceptionId: 'double-equals-is-fine' },
            { id: 'no', md: 'No — different kinds stay different' }
          ],
          'no'
        ),
        stdoutCode({
          id: 'strict',
          prompt: '> Print `true` because `0` and `""` are not strictly equal. Use `!==` or `===`.',
          equals: 'true',
          ast: '===',
          misconceptionId: 'double-equals-is-fine',
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: 'Use === or !==. Do not use ==.' },
            { level: 4, kind: 'assist', md: 'function notStrictSame(a, b) { return !(a === b) }\nconsole.log(notStrictSame(0, ""))\nmodule.exports = { notStrictSame }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function notStrictSame(a, b) {
  return a == b
}
console.log(notStrictSame(0, ""))
module.exports = { notStrictSame }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.notStrictSame(0, ''), true)
assert.strictEqual(m.notStrictSame(0, 0), false)
`) + `const fs = require('fs')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes('==='), 'use === or !==')
assert.ok(!/[^!=]==[^=]/.test(src), 'do not use ==')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'truth-and-if',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Truth and if',
      skillIds: ['js.flow'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Some values act as “no”\n\nIn an `if`, these are falsy: `0`, `""`, `null`, `undefined`, `NaN`, `false`. A lamp at brightness `0` is off. An empty name `""` is missing.\n\n`[]` and `"0"` are truthy. An empty list is still a list. The string zero is still text. Do not treat them as “no.”'
        ),
        predict(
          'empty-array',
          '`if ([]) { "go" } else { "stop" }` yields…',
          [
            { id: 'stop', md: '`stop` — empty means false' },
            { id: 'go', md: '`go` — an array object is truthy' }
          ],
          'go'
        ),
        cloze(
          'falsy-set',
          'In an `if`, {{a}} is falsy and {{b}} is truthy.',
          [
            { id: 'a', choices: ['0', '[]', '"0"'] },
            { id: 'b', choices: ['0', '[]', 'null'] }
          ],
          { a: '0', b: '[]' },
          { explainMd: 'Zero is falsy. An empty array is still an object, so it is truthy.' }
        ),
        stdoutCode({
          id: 'label-truth',
          prompt: '> `gate(value)` returns `"open"` if the value is truthy, otherwise `"shut"`. Print `gate(0)`.',
          equals: 'shut',
          hidden: true,
          hints: hints(
            'if (value) is enough. 0 is falsy.',
            { level: 4, kind: 'assist', md: 'function gate(value) { return value ? "open" : "shut" }\nconsole.log(gate(0))\nmodule.exports = { gate }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function gate(value) {
  return "open"
}
console.log(gate(0))
module.exports = { gate }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.gate(0), 'shut')
assert.strictEqual(m.gate(''), 'shut')
assert.strictEqual(m.gate('0'), 'open')
assert.strictEqual(m.gate([]), 'open')
assert.strictEqual(m.gate(1), 'open')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'short-circuit',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Stop at the first yes or no',
      skillIds: ['js.flow', 'js.values'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## `&&`, `||`, and `??`\n\n`a && b` returns `a` if `a` is falsy, otherwise `b`. `a || b` returns `a` if `a` is truthy, otherwise `b`. They stop as soon as they know the answer.\n\n`??` is narrower: it only skips `null` or `undefined`. `0 || "north"` becomes `"north"`. `0 ?? "north"` stays `0`. A lamp at brightness zero is still a reading — do not replace it with a default name.'
        ),
        predict(
          'or-zero',
          '`0 || "north"` is…',
          [
            { id: 'zero', md: '`0` — zero is a real value' },
            { id: 'north', md: '`"north"` — `||` treats 0 as no' },
            { id: 'true', md: '`true`' }
          ],
          'north'
        ),
        cloze(
          'nullish',
          '`0 ?? "north"` is {{a}}. `null ?? "north"` is {{b}}.',
          [
            { id: 'a', choices: ['0', '"north"', 'null'] },
            { id: 'b', choices: ['0', '"north"', 'null'] }
          ],
          { a: '0', b: '"north"' },
          { explainMd: '?? only replaces null or undefined. Zero is kept. || would have thrown zero away.' }
        ),
        stdoutCode({
          id: 'label-or',
          prompt: '> `label(name)` returns `name` if it is a non-empty string, otherwise `"anon"`. Print `label("")`.',
          equals: 'anon',
          hidden: true,
          hints: ladder(
            'Empty string is falsy. || can supply a default.',
            'Do not use ?? here — "" is not null.',
            'function label(name) { return name || "anon" }',
            'function label(name) {\n  return name || "anon"\n}\nconsole.log(label(""))\nmodule.exports = { label }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function label(name) {
  return name
}
console.log(label(""))
module.exports = { label }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.label(''), 'anon')
assert.strictEqual(m.label('east'), 'east')
assert.strictEqual(m.label(0), 'anon')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-classify-signal',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Transfer: classify a signal',
      skillIds: ['js.values', 'js.flow'],
      estimatedMinutes: 25,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Name the kind, honestly\n\n`classify(value)` should return:\n\n- `"empty"` for `null` or `undefined`\n- `"zero"` for `0` or `""`\n- `"list"` for arrays\n- `"text"` for other strings\n- `"other"` for everything else\n\n`typeof null` is `"object"` — do not trust it. Use `value == null` or check `null` / `undefined` first.'
        ),
        predict(
          'null-first',
          'If you write `typeof value === "object"` first, `null` is labelled…',
          [
            { id: 'object', md: 'as an object — that is the trap', misconceptionId: 'null-is-object-ok' },
            { id: 'empty', md: 'empty only if you checked null first' }
          ],
          'object'
        ),
        stdoutCode({
          id: 'classify',
          prompt: '> Print `classify(null)` (`empty`). Hidden tests cover the other labels.',
          equals: 'empty',
          hidden: true,
          hints: hints(
            'Check null and undefined before typeof.',
            'Array.isArray tells lists apart from plain objects.',
            { level: 4, kind: 'assist', md: 'function classify(value) {\n  if (value === null || value === undefined) return "empty"\n  if (value === 0 || value === "") return "zero"\n  if (Array.isArray(value)) return "list"\n  if (typeof value === "string") return "text"\n  return "other"\n}\nconsole.log(classify(null))\nmodule.exports = { classify }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function classify(value) {
  return typeof value
}
console.log(classify(null))
module.exports = { classify }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.classify(null), 'empty')
assert.strictEqual(m.classify(undefined), 'empty')
assert.strictEqual(m.classify(0), 'zero')
assert.strictEqual(m.classify(''), 'zero')
assert.strictEqual(m.classify([]), 'list')
assert.strictEqual(m.classify('east'), 'text')
assert.strictEqual(m.classify(3), 'other')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'functions-call',
      courseId: 'signals',
      moduleId: 'call',
      title: 'Call the function',
      skillIds: ['js.functions'],
      estimatedMinutes: 12,
      taskRev: 2,
      blocks: [
        explain(
          '## A name is not a call\n\n`ping` is the function. `ping()` runs it and gives you `"pong"`. Printing the function itself is not the same as printing its result.'
        ),
        predict(
          'call-vs-name',
          'What does `console.log(ping)` print (not `ping()`)?',
          [
            { id: 'pong', md: '`pong`' },
            { id: 'fn', md: 'The function text — you never called it', misconceptionId: 'print-is-return' }
          ],
          'fn'
        ),
        stdoutCode({
          id: 'call-ping',
          prompt: '> Call `ping` and print the returned string `pong`.',
          equals: 'pong',
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: 'Parentheses run the function: ping()' },
            { level: 4, kind: 'assist', md: 'function ping() {\n  return "pong"\n}\nconsole.log(ping())\nmodule.exports = { ping }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function ping() {
  return "pong"
}
console.log("?")
module.exports = { ping }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.ping(), 'pong')
`) + srcIncludes('ping()')
    }
  })

  out.push({
    doc: lesson({
      id: 'beacon-call',
      courseId: 'signals',
      moduleId: 'call',
      title: 'Reach the beacon',
      skillIds: ['js.functions'],
      estimatedMinutes: 15,
      taskRev: 3,
      blocks: [
        explain(
          '## Call, then see\n\n`Player.move` walks the fox one cell. The beacon stays put — you walk onto it.\n\n- `"east"` increases **x**\n- `"south"` increases **y**'
        ),
        predict(
          'where-after-east',
          'The fox starts at (0, 0). After one `Player.move("east")`, where is it?',
          [
            { id: 'same', md: 'Still at (0, 0)' },
            { id: 'east', md: 'At (1, 0)' }
          ],
          'east'
        ),
        playCode({
          id: 'reach-beacon',
          prompt: '> Walk the fox onto the beacon at `(3, 2)`.',
          guided: true,
          world: field(
            [
              fox(0, 0),
              beacon(3, 2),
              token('coin', 'coin', 1, 0),
              tree('t1', 5, 0),
              tree('t2', 6, 4),
              piece('owl', 'owl', 6, 1),
              rock('r1', 5, 3)
            ],
            { floor: 'floor-grass' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 2)] },
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: 'Beacon is at x=3, y=2. One move changes one coordinate by 1. Trees and rocks block; walk around them.' },
            { level: 2, kind: 'concept', md: 'You need three east calls and two south calls. Order does not matter. The coin on the way is optional.' },
            { level: 3, kind: 'concept', md: 'east increases x. south increases y. The owl is scenery.' },
            { level: 4, kind: 'assist', md: 'Player.move("east")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("south")\nPlayer.move("south")' }
          )
        })
      ]
    }),
    files: {
      'main.js': `Player.move("east")
`,
      'hidden.test.js': playLogOk(`assert.ok(log.filter((row) => row.op === 'move' && row.dir === 'east').length >= 3)
assert.ok(log.filter((row) => row.op === 'move' && row.dir === 'south').length >= 2)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'return-not-print',
      courseId: 'signals',
      moduleId: 'call',
      title: 'Return is not print',
      skillIds: ['js.functions'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## The stage hears `say`, not `console.log`\n\n`status()` should **return** `"locked"`. Then `Player.say(status())` shows that word on the fox. Printing to the console is a notebook, not the result the next function can use.'
        ),
        predict(
          'say-return',
          'If `status` only `console.log`s `"locked"` and returns nothing, `Player.say(status())` says…',
          [
            { id: 'locked', md: '`locked`' },
            { id: 'undef', md: '`undefined` — log is not a return', misconceptionId: 'print-is-return' }
          ],
          'undef'
        ),
        playCode({
          id: 'say-status',
          prompt: '> Return `"locked"` from `status`, then `Player.say` that string. Walk south onto the beacon.',
          world: gridWorld([fox(2, 1), beacon(2, 2)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 2), at('fox', 'say', 'locked')] },
          hidden: true,
          hints: hints(
            'return the string. Then pass it to Player.say. The fox starts one cell north of the beacon.',
            { level: 4, kind: 'assist', md: 'function status() { return "locked" }\nPlayer.say(status())\nPlayer.move("south")\nmodule.exports = { status }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function status() {
  console.log("locked")
}
Player.say("?")
module.exports = { status }
`,
      'hidden.test.js':
        exportAssert(`assert.strictEqual(m.status(), 'locked')
`) + playLogOk(`assert.ok(log.some((row) => row.op === 'say' && row.text === 'locked'))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'parameters-and-defaults',
      courseId: 'signals',
      moduleId: 'call',
      title: 'Parameters and defaults',
      skillIds: ['js.functions'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A function that walks `n` steps\n\n`function walk(n = 1)` uses `1` when you omit `n`. Call `Player.move("east")` that many times. Do not copy-paste five `move` lines if a parameter will do.'
        ),
        predict(
          'default-n',
          '`function walk(n = 1)` then `walk()` walks how many steps?',
          [
            { id: 'zero', md: 'Zero — missing means do nothing' },
            { id: 'one', md: 'One — the default fills in' }
          ],
          'one'
        ),
        playCode({
          id: 'walk-n',
          prompt: '> Write `walk(n = 1)` that moves east `n` times. Call `walk(3)` to reach x=3.',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'walk',
          hints: hints(
            'A for loop from 0 to n works. Default n = 1.',
            { level: 4, kind: 'assist', md: 'function walk(n = 1) {\n  for (let i = 0; i < n; i++) Player.move("east")\n}\nwalk(3)\nmodule.exports = { walk }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function walk(n) {
  Player.move("east")
}
walk(3)
module.exports = { walk }
`,
      'hidden.test.js':
        srcIncludes('function walk') +
        playLogOk(`assert.ok(log.filter((row) => row.op === 'move' && row.dir === 'east').length >= 3)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'loops-for',
      courseId: 'signals',
      moduleId: 'loops',
      title: 'for writes the path',
      skillIds: ['js.flow', 'js.functions'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## One idea, many steps\n\nA `for` loop is a counter that writes the path. Three east steps should be one loop, not three copy-pasted calls that will drift when the beacon moves.'
        ),
        predict(
          'for-count',
          '`for (let i = 0; i < 3; i++)` runs the body how many times?',
          [
            { id: 'two', md: '2', misconceptionId: 'off-by-one-inclusive' },
            { id: 'three', md: '3' },
            { id: 'four', md: '4 — it includes 3' }
          ],
          'three'
        ),
        playCode({
          id: 'for-east',
          prompt: '> Use a `for` loop to walk east onto the beacon at (3, 0).',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'for',
          hints: hints(
            'i < 3 with i starting at 0 runs three times.',
            { level: 4, kind: 'assist', md: 'for (let i = 0; i < 3; i++) {\n  Player.move("east")\n}' }
          )
        })
      ]
    }),
    files: {
      'main.js': `Player.move("east")
Player.move("east")
`,
      'hidden.test.js':
        srcIncludes('for') +
        playLogOk(`assert.ok((require('fs').readFileSync('main.js', 'utf8').match(/Player\\.move/g) || []).length <= 2)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'loops-while-break',
      courseId: 'signals',
      moduleId: 'loops',
      title: 'while and break',
      skillIds: ['js.flow'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Stop when the counter says so\n\n`while` keeps going while a condition is true. `break` leaves early when you have a *reason* — here, when you have taken 2 south steps toward the beacon.\n\nA `while (true)` without `break` is a runaway. The runner will time out.'
        ),
        predict(
          'break-why',
          'Why does `break` exist in a `while (true)`?',
          [
            { id: 'style', md: 'Only to look fancy' },
            { id: 'reason', md: 'To leave when a real condition happens inside the body' }
          ],
          'reason'
        ),
        playCode({
          id: 'while-south',
          prompt: '> Walk south with `while` until you have moved twice. Use `break` or a counter.',
          world: gridWorld([fox(1, 0), beacon(1, 2)]),
          goal: { all: [at('fox', 'x', 1), at('fox', 'y', 2)] },
          hidden: true,
          ast: 'while',
          hints: hints(
            'Keep a steps variable. break when it reaches 2.',
            { level: 4, kind: 'assist', md: 'let steps = 0\nwhile (true) {\n  Player.move("south")\n  steps += 1\n  if (steps === 2) break\n}' }
          )
        })
      ]
    }),
    files: {
      'main.js': `let steps = 0
while (false) {
  Player.move("south")
}
`,
      'hidden.test.js': srcIncludes('while') + playLogOk()
    }
  })

  const keyedParts = [
    fox(2, 3, { scale: 1 }),
    beacon(2, 0),
    { id: 'coin', type: 'coin', props: { x: 2, y: 4, collect: true, taken: false, label: 'Coin' } },
    { id: 'glint', type: 'glint', props: { x: 0, y: 1, collect: true, taken: false, label: 'Glint' } },
    { id: 'key', type: 'key', props: { x: 4, y: 1, collect: true, taken: false, label: 'Key' } },
    { id: 'r00', type: 'rock', props: { x: 0, y: 0, solid: true } },
    { id: 'r10', type: 'rock', props: { x: 1, y: 0, solid: true } },
    { id: 'r30', type: 'rock', props: { x: 3, y: 0, solid: true } },
    { id: 'r40', type: 'rock', props: { x: 4, y: 0, solid: true } },
    { id: 'r02', type: 'rock', props: { x: 0, y: 2, solid: true } },
    { id: 'r12', type: 'rock', props: { x: 1, y: 2, solid: true } },
    { id: 'r32', type: 'rock', props: { x: 3, y: 2, solid: true } },
    { id: 'r42', type: 'rock', props: { x: 4, y: 2, solid: true } },
    { id: 'r03', type: 'rock', props: { x: 0, y: 3, solid: true } },
    { id: 'r33', type: 'rock', props: { x: 3, y: 3, solid: true } },
    { id: 'r43', type: 'rock', props: { x: 4, y: 3, solid: true } },
    { id: 'r04', type: 'rock', props: { x: 0, y: 4, solid: true } },
    { id: 'r14', type: 'rock', props: { x: 1, y: 4, solid: true } },
    { id: 'r34', type: 'rock', props: { x: 3, y: 4, solid: true } },
    { id: 'r44', type: 'rock', props: { x: 4, y: 4, solid: true } }
  ]

  out.push({
    doc: lesson({
      id: 'keyed-beacon',
      courseId: 'signals',
      moduleId: 'loops',
      title: 'The keyed beacon',
      skillIds: ['js.functions'],
      estimatedMinutes: 20,
      taskRev: 2,
      blocks: [
        explain(
          '## The grid is the test\n\nYour file is the controller. **Run** plays the level on the stage.\n\n### Calls\n\n- `Player.move("north"|"south"|"east"|"west")` — one cell. Rocks block.\n- `Player.rotate(90)` — turn\n- `Player.scale(1)` or `Player.scale(2)` — grow\n- `Player.say("ready")` — speak\n\n### Win\n\nCollect every token. Stand on the beacon. Face **90°**, scale **2**, say **ready**.'
        ),
        predict(
          'rock-blocks',
          'Fox starts at `(2, 3)`. A rock sits at `(3, 3)`. After `Player.move("east")`, where is the fox?',
          [
            { id: 'through', md: 'At (3, 3) — it walked through the rock' },
            { id: 'stay', md: 'Still at (2, 3) — the rock blocked the step' },
            { id: 'clamp', md: 'Off the board' }
          ],
          'stay'
        ),
        playCode({
          id: 'solve-keyed-beacon',
          prompt: 'The stage is the map. Discover the route — Hint if you need a compass.',
          scaleValues: [1, 2],
          world: gridWorld(keyedParts, 5, 5, 'floor-stone'),
          goal: {
            all: [
              at('fox', 'x', 2),
              at('fox', 'y', 0),
              at('fox', 'rot', 90),
              at('fox', 'scale', 2),
              at('fox', 'say', 'ready'),
              at('coin', 'taken', true),
              at('glint', 'taken', true),
              at('key', 'taken', true)
            ]
          },
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: 'Rocks stop a step. Tokens vanish when you walk onto them. Read x and y on the stage.' },
            { level: 2, kind: 'concept', md: 'Coin is south of the fox. After that, go north to the open row. Glint is far west. Key is far east. Beacon is one step north of the middle of that row.' },
            { level: 3, kind: 'concept', md: 'On the beacon you still need Player.rotate(90), Player.scale(2), and Player.say("ready"). scale(3) is rejected.' },
            { level: 4, kind: 'assist', md: 'Player.move("south")\nPlayer.move("north")\nPlayer.move("north")\nPlayer.move("north")\nPlayer.move("west")\nPlayer.move("west")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("west")\nPlayer.move("west")\nPlayer.move("north")\nPlayer.rotate(90)\nPlayer.scale(2)\nPlayer.say("ready")' }
          )
        })
      ]
    }),
    files: {
      'main.js': `// The stage is the puzzle. Watch the fox — do not print your way out.
Player.move("south")
`,
      'hidden.test.js': playLogOk(`assert.ok(log.some((row) => row.op === 'say' && row.text === 'ready'))
assert.ok(log.some((row) => row.op === 'scale' && row.n === 2))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'debug-off-by-one-path',
      courseId: 'signals',
      moduleId: 'loops',
      title: 'Debug: one cell short',
      skillIds: ['js.flow'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## The fox stops early\n\nThe loop was written as `i <= 2` when the author meant three steps from 0, or `i < 2` when they needed three. Off-by-one is a counting story, not a mystery.\n\nFix the loop so the fox stands on the beacon at (3, 0).'
        ),
        predict(
          'lte-vs-lt',
          '`for (let i = 0; i <= 2; i++)` runs how many times?',
          [
            { id: 'two', md: '2', misconceptionId: 'off-by-one-inclusive' },
            { id: 'three', md: '3' }
          ],
          'three'
        ),
        playCode({
          id: 'fix-loop',
          debug: true,
          prompt: '> The starter walks only to x=2. Fix the bound so the fox reaches x=3.',
          world: field(
            [
              fox(0, 0),
              beacon(3, 0),
              wall('w1', 1, 1),
              wall('w2', 2, 1),
              wall('w3', 3, 1),
              piece('flag', 'flag', 6, 0)
            ],
            { cols: 7, rows: 3, floor: 'floor-path' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'for',
          hints: hints(
            'Count on your fingers: i = 0, 1, 2 is three moves if the test is i < 3.',
            { level: 2, kind: 'concept', md: 'The walls sit on the row below. Stay on y=0 and walk east.' },
            { level: 4, kind: 'assist', md: 'for (let i = 0; i < 3; i++) Player.move("east")' }
          )
        })
      ]
    }),
    files: {
      'main.js': `for (let i = 0; i < 2; i++) {
  Player.move("east")
}
`,
      'hidden.test.js': srcIncludes('for') + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'arrays-index',
      courseId: 'data',
      moduleId: 'lists',
      title: 'Index vs length',
      skillIds: ['js.arrays'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## A list of directions\n\n`const dirs = ["east", "east", "south"]`. Index `0` is the first item. `dirs.length` is `3`. The last item is at `length - 1`, not `length`.'
        ),
        predict(
          'last-index',
          'For `["east", "south"]`, the last index is…',
          [
            { id: '2', md: '`2` — same as length', misconceptionId: 'off-by-one-inclusive' },
            { id: '1', md: '`1` — length minus one' }
          ],
          '1'
        ),
        playCode({
          id: 'walk-dirs',
          prompt: '> Walk every string in `dirs` with `Player.move`. Do not hard-code four moves.',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: hints(
            'for (const dir of dirs) Player.move(dir)',
            { level: 4, kind: 'assist', md: 'const dirs = ["east", "east", "south"]\nfor (const dir of dirs) Player.move(dir)\nmodule.exports = { dirs }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const dirs = ["east", "east", "south"]
Player.move("east")
module.exports = { dirs }
`,
      'hidden.test.js': srcIncludes('dirs') + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'arrays-map',
      courseId: 'data',
      moduleId: 'lists',
      title: 'Map makes a new list',
      skillIds: ['js.arrays'],
      estimatedMinutes: 18,
      taskRev: 2,
      blocks: [
        explain(
          '## map does not rewrite the original\n\n`names.map(n => n.toUpperCase())` returns a **new** array. Print `ADA,GRACE`.\n\nThen walk: map `"E"`/`"S"` labels into `"east"`/`"south"` and move those dirs to (2, 1).'
        ),
        predict(
          'map-original',
          'After `const ys = xs.map(n => n + 1)`, `xs` is…',
          [
            { id: 'changed', md: 'Changed in place', misconceptionId: 'map-mutates' },
            { id: 'same', md: 'The same list as before' }
          ],
          'same'
        ),
        stdoutCode({
          id: 'upper-map',
          prompt: '> Map `ada, grace` to uppercase and join with a comma: `ADA,GRACE`.',
          equals: 'ADA,GRACE',
          ast: 'map',
          misconceptionId: 'map-mutates',
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: 'Use map, then join with a comma.' },
            { level: 4, kind: 'assist', md: 'function uppers(names) { return names.map(n => n.toUpperCase()).join(",") }\nconsole.log(uppers(["ada", "grace"]))\nmodule.exports = { uppers }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const names = ["ada", "grace"]
function uppers(list) {
  return list.join(",")
}
console.log(uppers(names))
module.exports = { uppers }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.uppers(['ada', 'grace']), 'ADA,GRACE')
const src = ['ada']
m.uppers(src)
assert.strictEqual(src[0], 'ada')
`) + srcIncludes('map')
    }
  })

  out.push({
    doc: lesson({
      id: 'arrays-filter-find',
      courseId: 'data',
      moduleId: 'lists',
      title: 'filter and find',
      skillIds: ['js.arrays'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Keep only what you need\n\n`filter` returns every match. `find` returns the first match or `undefined`.\n\nFrom `["east", "south", "east"]`, keep only `"east"`. Find the first beacon name that starts with `"N"`.'
        ),
        predict(
          'find-missing',
          '`["south"].find(d => d === "east")` is…',
          [
            { id: 'empty', md: '`""`' },
            { id: 'undef', md: '`undefined`' }
          ],
          'undef'
        ),
        stdoutCode({
          id: 'only-east',
          prompt: '> `onlyEast(dirs)` returns only `"east"` entries, joined as `east,east`. Print that.',
          equals: 'east,east',
          ast: 'filter',
          hidden: true,
          hints: hints(
            'dirs.filter(d => d === "east").join(",")',
            { level: 4, kind: 'assist', md: 'function onlyEast(dirs) { return dirs.filter(d => d === "east").join(",") }\nconsole.log(onlyEast(["east", "south", "east"]))\nmodule.exports = { onlyEast }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function onlyEast(dirs) {
  return dirs.join(",")
}
console.log(onlyEast(["east", "south", "east"]))
module.exports = { onlyEast }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.onlyEast(['south', 'east', 'east']), 'east,east')
assert.strictEqual(m.onlyEast(['south']), '')
`) + srcIncludes('filter')
    }
  })

  out.push({
    doc: lesson({
      id: 'arrays-reduce-once',
      courseId: 'data',
      moduleId: 'lists',
      title: 'One justified reduce',
      skillIds: ['js.arrays'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## reduce when you are building one value\n\n`map` and `filter` already make lists. Use `reduce` here to **join a path string**: `["east", "south"]` becomes `"east-south"`.\n\nThat is one accumulator, not a loop you hide for style.'
        ),
        predict(
          'reduce-seed',
          '`["east"].reduce((acc, d) => acc + d, "")` starts `acc` as…',
          [
            { id: 'east', md: '`"east"` — the first item' },
            { id: 'empty', md: '`""` — the seed you passed' }
          ],
          'empty'
        ),
        stdoutCode({
          id: 'join-path',
          prompt: '> `pathOf(["east", "south"])` returns `east-south` using `reduce`. Print it.',
          equals: 'east-south',
          ast: 'reduce',
          hidden: true,
          hints: hints(
            'If acc is empty, return the dir. Else return acc + "-" + dir.',
            { level: 4, kind: 'assist', md: 'function pathOf(dirs) {\n  return dirs.reduce((acc, d) => (acc ? acc + "-" + d : d), "")\n}\nconsole.log(pathOf(["east", "south"]))\nmodule.exports = { pathOf }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function pathOf(dirs) {
  return dirs.join(",")
}
console.log(pathOf(["east", "south"]))
module.exports = { pathOf }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.pathOf(['east', 'south']), 'east-south')
assert.strictEqual(m.pathOf(['west']), 'west')
`) + srcIncludes('reduce')
    }
  })

  out.push({
    doc: lesson({
      id: 'objects-props',
      courseId: 'data',
      moduleId: 'records',
      title: 'A route record',
      skillIds: ['js.objects'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Fields, not a mystery bag\n\n`{ east: 3, south: 2 }` is a route record. Read `route.east` and loop that many moves. Objects store named numbers; they do not walk themselves.'
        ),
        predict(
          'dot-vs-missing',
          '`({ east: 3 }).south` is…',
          [
            { id: 'zero', md: '`0`' },
            { id: 'undef', md: '`undefined`' }
          ],
          'undef'
        ),
        playCode({
          id: 'walk-record',
          prompt: '> Walk `east` then `south` using the numbers on `route`. Beacon is at (3, 2).',
          world: field(
            [
              fox(0, 0),
              beacon(3, 2),
              token('gem', 'gem', 3, 0),
              tree('t1', 5, 1),
              piece('chest', 'chest', 6, 4)
            ],
            { floor: 'floor-dirt' }
          ),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 2)] },
          hidden: true,
          hints: hints(
            'for (let i = 0; i < route.east; i++) Player.move("east")',
            { level: 4, kind: 'assist', md: 'const route = { east: 3, south: 2 }\nfor (let i = 0; i < route.east; i++) Player.move("east")\nfor (let i = 0; i < route.south; i++) Player.move("south")\nmodule.exports = { route }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const route = { east: 3, south: 2 }
Player.move("east")
module.exports = { route }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.route.east, 3)
assert.strictEqual(m.route.south, 2)
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'set-and-map',
      courseId: 'data',
      moduleId: 'records',
      title: 'Set and Map',
      skillIds: ['js.arrays', 'js.objects'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Unique names, keyed lookup\n\nA `Set` keeps each value once. `new Set(["east", "east", "south"])` has size `2`. A `Map` stores a value under a key you choose — not only a string field on an object.\n\nThe desk uses a set to scrub a log (`east` twice is still one heading) and a map to look up a beacon by name. `map.get("north")` is missing when the key was never set — that is `undefined`, not a throw.'
        ),
        predict(
          'set-size',
          '`new Set(["east", "east", "south"]).size` is…',
          [
            { id: '3', md: '`3` — it kept every push' },
            { id: '2', md: '`2` — the second east was already there' },
            { id: '1', md: '`1`' }
          ],
          '2'
        ),
        tf(
          'map-missing',
          '`map.get("ghost")` throws if the key is missing.',
          false,
          { explainMd: 'get returns undefined. has tells you whether the key exists.' }
        ),
        stdoutCode({
          id: 'unique-join',
          prompt: '> `unique(dirs)` returns the unique headings joined with `-`. Print `unique(["east","east","south"])` (`east-south`).',
          equals: 'east-south',
          hidden: true,
          hints: ladder(
            'new Set(array) drops duplicates and keeps first-seen order.',
            '[...set] turns the set back into a list you can join.',
            'function unique(dirs) { return [...new Set(dirs)].join("-") }',
            'function unique(dirs) {\n  return [...new Set(dirs)].join("-")\n}\nconsole.log(unique(["east", "east", "south"]))\nmodule.exports = { unique }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function unique(dirs) {
  return dirs.join("-")
}
console.log(unique(["east", "east", "south"]))
module.exports = { unique }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.unique(['east', 'east', 'south']), 'east-south')
assert.strictEqual(m.unique(['west']), 'west')
assert.strictEqual(m.unique(['south', 'south', 'south']), 'south')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'reference-vs-copy',
      courseId: 'data',
      moduleId: 'records',
      title: 'Reference vs copy',
      skillIds: ['js.objects', 'js.arrays'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Two names, one list\n\n`const b = a` does not copy items. Change `b[0]` and `a[0]` changes too. The fox will walk the surprise path if you mutate a shared route.\n\nCopy with `a.slice()` or `[...a]` when you mean a second list.'
        ),
        predict(
          'assign-copy',
          'After `const b = a; b[0] = "south"` (and `a` was `["east"]`), `a[0]` is…',
          [
            { id: 'east', md: '`"east"` — assign copied', misconceptionId: 'arrays-are-copied-by-assign' },
            { id: 'south', md: '`"south"` — both names point at one list' }
          ],
          'south'
        ),
        playCode({
          id: 'shared-route',
          prompt: '> `shared` starts as `["east","east"]`. Another name mutates it to add `"south"`. Walk `shared` to (2, 1).',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: hints(
            'Mutate the shared array, then walk it. The lesson is that both names see south.',
            { level: 4, kind: 'assist', md: 'const shared = ["east", "east"]\nconst also = shared\nalso.push("south")\nfor (const d of shared) Player.move(d)\nmodule.exports = { shared }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const shared = ["east", "east"]
const also = shared
// mutate also so the fox also walks south
for (const d of shared) Player.move(d)
module.exports = { shared }
`,
      'hidden.test.js': exportAssert(`assert.ok(Array.isArray(m.shared))
`) + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'destructure-spread',
      courseId: 'data',
      moduleId: 'records',
      title: 'Destructure and spread',
      skillIds: ['js.objects'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Copy, then extend\n\n`const { east, south } = route` pulls fields out. `{ ...route, south: 2 }` copies then overrides. That is how you keep the original record honest.'
        ),
        predict(
          'spread-copy',
          'After `const b = { ...a, south: 2 }` with `a = { east: 3, south: 0 }`, `a.south` is…',
          [
            { id: '2', md: '`2`' },
            { id: '0', md: '`0` — spread copied, then b changed' }
          ],
          '0'
        ),
        stdoutCode({
          id: 'extend-route',
          prompt: '> `extendSouth({ east: 3, south: 0 })` returns a new object with `south: 2`. Print that south value.',
          equals: '2',
          ast: '...',
          hidden: true,
          hints: hints(
            'return { ...route, south: 2 }',
            { level: 4, kind: 'assist', md: 'function extendSouth(route) { return { ...route, south: 2 } }\nconsole.log(extendSouth({ east: 3, south: 0 }).south)\nmodule.exports = { extendSouth }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function extendSouth(route) {
  route.south = 2
  return route
}
console.log(extendSouth({ east: 3, south: 0 }).south)
module.exports = { extendSouth }
`,
      'hidden.test.js': exportAssert(`const src = { east: 3, south: 0 }
const next = m.extendSouth(src)
assert.strictEqual(next.south, 2)
assert.strictEqual(src.south, 0)
`) + srcIncludes('...')
    }
  })

  out.push({
    doc: lesson({
      id: 'json-roundtrip',
      courseId: 'data',
      moduleId: 'records',
      title: 'JSON round-trip',
      skillIds: ['js.objects'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Text in, object out\n\n`JSON.parse` reads a string. Bad text throws. `JSON.stringify` writes a string. A fixture file in this lesson is `signal.json` — parse it and print the `name` field.'
        ),
        predict(
          'parse-throw',
          '`JSON.parse("{")` does what?',
          [
            { id: 'empty', md: 'Returns `{}`' },
            { id: 'throw', md: 'Throws a SyntaxError' }
          ],
          'throw'
        ),
        stdoutCode({
          id: 'read-fixture',
          prompt: '> Parse `signal.json` and print the `name` field (`north`).',
          equals: 'north',
          hidden: true,
          extraFiles: [{ path: 'files/signal.json', role: 'fixture' }],
          hints: hints(
            'fs.readFileSync("signal.json", "utf8") then JSON.parse.',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nfunction readName() {\n  return JSON.parse(fs.readFileSync("signal.json", "utf8")).name\n}\nconsole.log(readName())\nmodule.exports = { readName }' }
          )
        })
      ]
    }),
    files: {
      'signal.json': `{ "name": "north", "kind": "beacon" }\n`,
      'main.js': `function readName() {
  return "?"
}
console.log(readName())
module.exports = { readName }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.readName(), 'north')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'signal-log',
      courseId: 'data',
      moduleId: 'records',
      title: 'Signal log',
      skillIds: ['js.functions', 'js.arrays'],
      estimatedMinutes: 20,
      taskRev: 2,
      creation: { id: 'signal-log', step: 1, briefMd: 'logBeacon returns a tagged line the hidden tests also run.' },
      blocks: [
        explain(
          '## A log you keep\n\n`logBeacon(name)` should return `beacon:name`. Print `beacon:north` then `beacon:east`.\n\nHidden tests call your function with other names. Do not only print two literals.'
        ),
        predict(
          'return-tag',
          'If `logBeacon` only prints and returns nothing, a later test that reads the return gets…',
          [
            { id: 'line', md: 'The printed line' },
            { id: 'undef', md: '`undefined`', misconceptionId: 'print-is-return' }
          ],
          'undef'
        ),
        stdoutCode({
          id: 'log-fn',
          prompt: '> `logBeacon(name)` returns `beacon:name`. Print north then east, one per line.',
          equals: 'beacon:north\nbeacon:east',
          hidden: true,
          hints: hints(
            { level: 1, kind: 'concept', md: 'return `beacon:${name}`' },
            { level: 4, kind: 'assist', md: 'function logBeacon(name) { return `beacon:${name}` }\nconsole.log(logBeacon("north"))\nconsole.log(logBeacon("east"))\nmodule.exports = { logBeacon }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function logBeacon(name) {
  return name
}
console.log(logBeacon("north"))
console.log(logBeacon("east"))
module.exports = { logBeacon }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.logBeacon('west'), 'beacon:west')
assert.strictEqual(m.logBeacon('south'), 'beacon:south')
`)
    }
  })

  return out
}
