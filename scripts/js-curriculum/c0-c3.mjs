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
          {
            diagnostic: true,
            skillIds: ['js.values'],
            explainMd:
              '`===` compares kind first. A number and a string are different kinds, so it answers `false` without looking at the contents. Only `==` converts one side before comparing, which is why `0 == ""` is `true` and why you will be told to avoid it.'
          }
        ),
        check(
          'truthy-zero',
          '`if (0) { "go" } else { "stop" }` yields…',
          [
            { id: 'go', md: '`go`' },
            { id: 'stop', md: '`stop`' }
          ],
          'stop',
          {
            diagnostic: true,
            skillIds: ['js.flow'],
            explainMd:
              '`if` does not ask "is there a value here", it asks "is this value truthy". `0` is one of the six falsy values (`0`, `""`, `null`, `undefined`, `NaN`, `false`), so the `else` branch runs. This is why counting code that tests `if (count)` silently skips zero.'
          }
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
          {
            diagnostic: true,
            skillIds: ['js.closures'],
            explainMd:
              '`make()` ran once, so `n` was created once. The arrow function returned from it keeps a hold on that same `n` — not a copy of its value. Two earlier calls made it 1 then 2, so this call makes it `3`. Call `make()` a second time and you get a fresh, separate counter.'
          }
        ),
        check(
          'map-vs-mutate',
          '`const xs = [1]; const ys = xs.map(n => n + 1)` — `xs[0]` is…',
          [
            { id: '2', md: '`2` — map rewrote the list', misconceptionId: 'map-mutates' },
            { id: '1', md: '`1` — map returned a new list' }
          ],
          '1',
          {
            diagnostic: true,
            skillIds: ['js.arrays'],
            explainMd:
              '`map` builds and returns a new array; it never writes into the one you called it on. `xs` still holds `[1]` and `ys` holds `[2]`. The methods that do change the original are the ones like `push`, `sort`, and `splice`.'
          }
        ),
        check(
          'promise-vs-cb',
          'A `Promise` that is waiting to finish is in which state?',
          [
            { id: 'pending', md: 'pending' },
            { id: 'callback', md: 'callback — that is the same thing' }
          ],
          'pending',
          {
            diagnostic: true,
            skillIds: ['js.async'],
            explainMd:
              'A promise is in exactly one of three states: **pending** while the work is unfinished, then **fulfilled** with a value or **rejected** with a reason. A callback is not a state — it is one way of being told the work ended. The state is what lets you hand the unfinished result around before it exists.'
          }
        ),
        check(
          'this-sniff',
          'A plain `function greet() { return this }` called as `greet()` in sloppy Node often sees `this` as…',
          [
            { id: 'undefined-strict', md: 'always `undefined`' },
            { id: 'globalish', md: 'the global object (unless `"use strict"`)' }
          ],
          'globalish',
          {
            diagnostic: true,
            skillIds: ['js.this'],
            explainMd:
              '`this` is decided by how a function is *called*, not where it was written. Called bare, with nothing before the dot, sloppy mode falls back to the global object; `"use strict"` (and every ES module) leaves it `undefined` instead. Call the same function as `obj.greet()` and `this` is `obj`.'
          }
        ),
        check(
          'dom-sniff',
          '`document.querySelector("#beacon")` returns…',
          [
            { id: 'string', md: 'the HTML as a string' },
            { id: 'node', md: 'one element node, or `null` if missing' }
          ],
          'node',
          {
            diagnostic: true,
            skillIds: ['js.dom'],
            explainMd:
              'The page is a tree of objects, not text. `querySelector` hands back the first matching element as a live object you can read and change — or `null` when nothing matches, which is why unchecked results throw "cannot read properties of null". Use `querySelectorAll` when you want every match.'
          }
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
          'object',
          {
            explainMd:
              '`typeof null` is `"object"` — a leftover language bug. Do not treat `null` as a bag of fields.'
          }
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
          hints: ladder(
            'The starter returns a placeholder. It should report the kind of whatever value arrives.',
            '`typeof` is an operator, not a function you must call with extra punctuation: `typeof v`.',
            '`function kindOf(v) { return typeof v }` makes `kindOf("3")` answer `string`.',
            'function kindOf(v) { return typeof v }\nconsole.log(kindOf(3))\nmodule.exports = { kindOf }'
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
      taskRev: 3,
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
          'south',
          {
            explainMd:
              '`const` locks the binding, not the object. `route.dir = "south"` is fine; `route = {}` is not.'
          }
        ),
        tf(
          'const-rebind',
          '`const` stops you from changing a field on an object.',
          false,
          { explainMd: 'const stops a new assignment to that name. Fields on the object can still change.', misconceptionId: 'const-means-immutable' }
        ),
        stdoutCode({
          id: 'bind-then-print',
          prompt:
            '> Inside `labelBox`, declare a `const` named binding for the string `"locked"`, then return that binding. Print the result. A bare `return "locked"` is not enough — the point of this lesson is the binding.',
          equals: 'locked',
          ast: 'const',
          hidden: true,
          hints: ladder(
            'Put `"locked"` in a `const` box first. The function should read that box, not invent the string at the return.',
            '`const` names a box you cannot rebind. Declaring it above the function, or inside it, both work — as long as the function returns the binding.',
            '`const word = "locked"` then `return word` (and `console.log(labelBox())`).',
            'const word = "locked"\nfunction labelBox() { return word }\nconsole.log(labelBox())\nmodule.exports = { labelBox }'
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
assert.ok(/\\bconst\\b/.test(src), 'declare a const binding for the word')
assert.ok(!/return\\s+[\"']locked[\"']/.test(src), 'return the binding, not the string literal')
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
      taskRev: 3,
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
          prompt:
            '> `tagBeacon(name)` must return a template literal like `` `beacon:${name}` `` — not string concatenation and not a hard-coded `"beacon:north"`. Print `tagBeacon("north")`.',
          equals: 'beacon:north',
          ast: '`',
          hidden: true,
          hints: ladder(
            'The starter hands the name back unchanged. You need the name inside a longer label.',
            'A template literal is wrapped in backticks and drops a value in with `${ }`.',
            '`` `signal:${kind}` `` with `kind = "low"` builds `signal:low`.',
            'function tagBeacon(name) { return `beacon:${name}` }\nconsole.log(tagBeacon("north"))\nmodule.exports = { tagBeacon }'
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
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\`[^\`]*\\$\\{/.test(src), 'use a template literal with \${ }')
assert.ok(!/return\\s+[\"']beacon:/.test(src), 'build the label from name, do not hard-code it')
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
          'false',
          { explainMd: 'NaN is never equal to anything, including itself. Use `Number.isNaN` to detect it.' }
        ),
        stdoutCode({
          id: 'is-nan',
          prompt: '> `failedNumber("fox")` returns `true` using `Number.isNaN`. Print it.',
          equals: 'true',
          ast: 'Number.isNaN',
          hidden: true,
          hints: ladder(
            'Comparing against the word `fox` only catches one bad input. Ask the real question instead.',
            '`Number(text)` gives `NaN` when the text is not numeric, and `Number.isNaN` asks about that on purpose.',
            '`Number.isNaN(Number("sky"))` is `true`; `Number.isNaN(Number("7"))` is `false`.',
            'function failedNumber(text) { return Number.isNaN(Number(text)) }\nconsole.log(failedNumber("fox"))\nmodule.exports = { failedNumber }'
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
          hints: ladder(
            'The starter uses `==`, which converts before it compares. That is the habit this lesson removes.',
            '`===` and `!==` compare kind and value together, so `0 === ""` is false.',
            '`function same(a, b) { return a === b }` answers "the same"; you want the opposite of that.',
            'function notStrictSame(a, b) { return !(a === b) }\nconsole.log(notStrictSame(0, ""))\nmodule.exports = { notStrictSame }'
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
          hints: ladder(
            'The starter always answers `open`. The value that arrives should decide.',
            '`if (value)` is enough on its own: `0` and `""` are falsy, `[]` and `"0"` are truthy.',
            '`return value ? "yes" : "no"` picks between two strings in one line.',
            'function gate(value) { return value ? "open" : "shut" }\nconsole.log(gate(0))\nmodule.exports = { gate }'
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
      taskRev: 3,
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
          prompt:
            '> `label(name)` returns `name` if it is truthy, otherwise `"anon"`. Use `||` or `??` in the source — do not branch with `if` alone. Print `label("")`.',
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
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\\|\\||\\?\\?/.test(src), 'use || or ?? for the default')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'optional-chaining',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Reach into a record that may be missing',
      skillIds: ['js.values', 'js.objects'],
      estimatedMinutes: 18,
      taskRev: 3,
      blocks: [
        explain(
          '## `?.` asks first\n\n`signal.beacon.name` throws the moment `signal.beacon` is `undefined`. `signal?.beacon?.name` stops at the first missing link and hands back `undefined` instead of throwing.\n\n`?.` does **not** supply a default. It only avoids the crash. Pair it with `??` when you want a fallback:\n\n```\nsignal?.beacon?.name ?? "unknown"\n```\n\nThere are two more forms: `fn?.()` calls only if `fn` exists, and `list?.[0]` indexes only if `list` exists.'
        ),
        predict(
          'chain-missing',
          '`const s = {}` — what is `s?.beacon?.name`?',
          [
            { id: 'throws', md: 'It throws a TypeError' },
            { id: 'undef', md: '`undefined` — the chain stopped early' },
            { id: 'empty', md: '`""` — it becomes an empty string', misconceptionId: 'optional-chain-defaults' }
          ],
          'undef',
          {
            explainMd:
              '`?.` stops at the first missing link and returns `undefined`. It does not throw, and it does not invent a default string.'
          }
        ),
        check(
          'chain-not-default',
          'A beacon reads `{ name: "", power: 0 }`. Which expression keeps both real readings instead of hiding them?',
          [
            { id: 'or', md: '`b?.name || "unknown"` and `b?.power || 1`', misconceptionId: 'or-eats-zero' },
            { id: 'nullish', md: '`b?.name ?? "unknown"` and `b?.power ?? 1`' },
            { id: 'chain', md: '`b?.name` alone supplies the default', misconceptionId: 'optional-chain-defaults' }
          ],
          'nullish',
          {
            explainMd:
              '`""` and `0` are real readings. `||` throws them away; `??` only steps in for `null` or `undefined`. `?.` never supplies a default at all.'
          }
        ),
        stdoutCode({
          id: 'beacon-name',
          prompt:
            '> `beaconName(signal)` returns the beacon name using `?.` and `??`. Missing signal or missing beacon gives `"unknown"`, but an empty name stays empty. Print `beaconName({ beacon: { name: "north" } })`.',
          equals: 'north',
          hidden: true,
          hints: ladder(
            'Reading `.beacon.name` on an empty object throws. You need the chain to stop instead.',
            '`?.` returns undefined at the first missing link. `??` then fills in the fallback.',
            '`const label = record?.inner?.label ?? "none"` reads two levels and defaults only when something was missing.',
            'function beaconName(signal) {\n  return signal?.beacon?.name ?? "unknown"\n}\nconsole.log(beaconName({ beacon: { name: "north" } }))\nmodule.exports = { beaconName }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function beaconName(signal) {
  return "unknown"
}
console.log(beaconName({ beacon: { name: "north" } }))
module.exports = { beaconName }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.beaconName({ beacon: { name: 'north' } }), 'north')
assert.strictEqual(m.beaconName({}), 'unknown')
assert.strictEqual(m.beaconName(null), 'unknown')
assert.strictEqual(m.beaconName(undefined), 'unknown')
assert.strictEqual(m.beaconName({ beacon: { name: '' } }), '')
`) + srcIncludes('?.', '??')
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
            { level: 3, kind: 'concept', md: 'The first line does the most work: `if (value === null || value === undefined) return "empty"`. Every other label follows the same shape.' },
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
          '## A name is not a call\n\n`ping` is the function. `ping()` runs it and gives you `"pong"`. Printing the function itself is not the same as printing its result.\n\nThe last line, `module.exports = { ping }`, is how the checker reaches your function. Leave it there and ignore it for now — it is harness plumbing, not syntax you need yet. Modules get taught properly in the Node track.'
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
          hints: ladder(
            'The file prints a question mark. Nothing has called `ping` yet.',
            'Parentheses run the function: `ping()`. Without them you are holding the function itself.',
            '`console.log(add(2, 2))` prints `4`; `console.log(add)` prints the function source.',
            'function ping() {\n  return "pong"\n}\nconsole.log(ping())\nmodule.exports = { ping }'
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
          hints: ladder(
            'The fox says a question mark because `status` logs instead of returning. The stage only hears what you hand to `Player.say`.',
            'Swap `console.log` for `return`, then pass the call into `Player.say(status())`.',
            '`function name() { return "fox" }` then `Player.say(name())` puts `fox` in the bubble.',
            'function status() { return "locked" }\nPlayer.say(status())\nPlayer.move("south")\nmodule.exports = { status }'
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
      taskRev: 3,
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
          prompt:
            '> Write `walk(n = 1)` that moves east `n` times. Call `walk(3)` to reach x=3. The default must be in the parameter list — `walk()` with no args must move once.',
          world: gridWorld([fox(0, 0), beacon(3, 0)]),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 0)] },
          hidden: true,
          ast: 'walk',
          hints: ladder(
            'The starter moves once no matter what number you pass. `n` is being ignored.',
            'Loop `n` times inside `walk`, and write the default in the parameter list: `function walk(n = 1)`.',
            '`for (let i = 0; i < n; i++) { … }` repeats the body `n` times.',
            'function walk(n = 1) {\n  for (let i = 0; i < n; i++) Player.move("east")\n}\nwalk(3)\nmodule.exports = { walk }'
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
        exportAssert(`assert.strictEqual(m.walk.length, 0, 'declare the default as walk(n = 1)')
const before = require('fs').readFileSync('play-log.json', 'utf8')
const beforeLen = JSON.parse(before).filter((row) => row.op === 'move').length
m.walk()
const after = JSON.parse(require('fs').readFileSync('play-log.json', 'utf8'))
const afterLen = after.filter((row) => row.op === 'move').length
assert.strictEqual(afterLen - beforeLen, 1, 'walk() with no args must move once')
`) +
        srcIncludes('n = 1') +
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
          hints: ladder(
            'Two pasted moves leave the fox one cell short, and the file must not grow a third paste.',
            'A `for` loop is a counter: start at 0, keep going while the counter is below the number of steps.',
            '`for (let i = 0; i < 3; i++)` runs its body three times — i is 0, 1, 2.',
            'for (let i = 0; i < 3; i++) {\n  Player.move("east")\n}'
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
          '## Stop when the counter says so\n\n`while` keeps going while a condition is true. `break` leaves early when you have a *reason* — here, when you have taken 2 south steps toward the beacon.\n\nA `while (true)` without `break` is a runaway. The runner will time out.\n\nThere is a sibling worth knowing: `do { … } while (cond)` checks the condition **after** the body, so the body always runs at least once. Reach for it when the first attempt is unconditional — read a line, then keep reading while there are more.'
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
          hints: ladder(
            '`while (false)` never runs its body, so the fox has not moved at all.',
            'Keep a `steps` counter, move inside the loop, and `break` once the counter reaches 2.',
            '`if (steps === 2) break` is the exit. Put it after the move so the second step still happens.',
            'let steps = 0\nwhile (true) {\n  Player.move("south")\n  steps += 1\n  if (steps === 2) break\n}'
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

  out.push({
    doc: lesson({
      id: 'switch-dispatch',
      courseId: 'signals',
      moduleId: 'loops',
      title: 'One command name, many branches',
      skillIds: ['js.flow', 'js.functions'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## `switch` routes a command\n\nA dispatch table reads one value and picks a branch. `switch (cmd)` compares with `===`, runs the matching `case`, and keeps running **into the next case** until it meets `break`.\n\nThat fall-through is a feature when you group spellings:\n\n```\ncase "east":\ncase "e":\n  Player.move("east")\n  break\n```\n\nBoth labels share one body. Forgetting `break` on a branch that has its own body is the classic bug: the fox does two things for one command. `default` catches anything you did not plan for.'
        ),
        predict(
          'no-break',
          'A `case "east"` moves east but has no `break`. The next case moves south. What happens on `"east"`?',
          [
            { id: 'east', md: 'Only the east move runs' },
            { id: 'both', md: 'East runs, then south runs too', misconceptionId: 'switch-without-break' },
            { id: 'error', md: 'JavaScript refuses to run it' }
          ],
          'both'
        ),
        check(
          'default-case',
          'The plan contains `"beep"`, which no case names. With a `default` branch that calls `Player.say("skip")`, what happens?',
          [
            { id: 'crash', md: 'The program throws on the unknown command' },
            { id: 'skip', md: 'The default branch runs and the fox says `skip`' },
            { id: 'last', md: 'The last case runs instead', misconceptionId: 'switch-without-break' }
          ],
          'skip',
          { explainMd: '`default` is the branch for everything you did not list. Without it, an unknown command is silently ignored.' }
        ),
        playCode({
          id: 'dispatch-plan',
          prompt:
            '> Walk the plan with a `switch`. `east` and `e` both go east, `south` goes south, and anything else falls to `default` and says `skip`. Beacon is at (2, 2).',
          world: field([fox(0, 0), beacon(2, 2), tree('t1', 5, 1), piece('barrel', 'barrel', 6, 3)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 2), at('fox', 'say', 'skip')] },
          hidden: true,
          ast: 'switch',
          hints: ladder(
            'The plan is already in the file. Loop it and branch on each command.',
            '`switch (cmd)` with one `case` per command name, and `break` at the end of each body.',
            'Two labels stacked with no body between them share the branch below: `case "east":` then `case "e":` then the move.',
            'const plan = ["east", "east", "south", "south", "beep"]\nfor (const cmd of plan) {\n  switch (cmd) {\n    case "east":\n    case "e":\n      Player.move("east")\n      break\n    case "south":\n      Player.move("south")\n      break\n    default:\n      Player.say("skip")\n  }\n}'
          )
        })
      ]
    }),
    files: {
      'main.js': `const plan = ["east", "east", "south", "south", "beep"]
for (const cmd of plan) {
  switch (cmd) {
    default:
      Player.say(cmd)
  }
}
`,
      'hidden.test.js': srcIncludes('case', 'break') + playLogOk()
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
            { level: 3, kind: 'concept', md: 'Only the bound is wrong. The fox needs three moves, so the comparison must let i reach 2.' },
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
      taskRev: 3,
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
          prompt:
            '> Walk every string in `dirs` with `Player.move` — loop over `dirs` (for…of / forEach / indexed loop). Do not hard-code three separate `Player.move("…")` calls.',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: ladder(
            'The list already holds the route. The starter ignores it and moves once by hand.',
            'Walk the list itself, so adding a direction to `dirs` changes the path with no other edit.',
            '`for (const dir of dirs) { … }` hands you each string in turn.',
            'const dirs = ["east", "east", "south"]\nfor (const dir of dirs) Player.move(dir)\nmodule.exports = { dirs }'
          )
        })
      ]
    }),
    files: {
      'main.js': `const dirs = ["east", "east", "south"]
Player.move("east")
module.exports = { dirs }
`,
      'hidden.test.js':
        playLogOk() +
        `;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(/\\bdirs\\b/.test(src), 'use the dirs list')
  assert.ok(
    /for\\s*\\(.*\\bof\\s+dirs\\b|dirs\\.forEach|for\\s*\\(.*dirs\\.length|dirs\\[/.test(src),
    'iterate dirs — do not paste three hard-coded moves'
  )
  const moveLits = src.match(/Player\\.move\\(\\s*["'](?:east|south|west|north)["']\\s*\\)/g) || []
  assert.ok(moveLits.length <= 1, 'move via the list values, not hard-coded headings for each step')
})()
`
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
          '## map does not rewrite the original\n\n`names.map(n => n.toUpperCase())` returns a **new** array of the same length, with each item transformed. The list you started from is untouched — that is the whole point, and the hidden test checks it.\n\nHere you map two lowercase names to uppercase and join them: `ADA,GRACE`.'
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
          hints: ladder(
            'The starter joins the names but never changes them, so the letters stay lowercase.',
            '`map` builds a new list from the old one; `join` turns that new list into text.',
            '`["a"].map((s) => s.toUpperCase())` is `["A"]`, and the original list is untouched.',
            'function uppers(names) { return names.map(n => n.toUpperCase()).join(",") }\nconsole.log(uppers(["ada", "grace"]))\nmodule.exports = { uppers }'
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
      title: 'filter keeps matches',
      skillIds: ['js.arrays'],
      estimatedMinutes: 20,
      taskRev: 3,
      blocks: [
        explain(
          '## Keep only what you need\n\n`filter` returns every match as a new list. From `["east", "south", "east"]`, keep only `"east"` and join them.'
        ),
        predict(
          'filter-empty',
          '`["south"].filter(d => d === "east")` is…',
          [
            { id: 'empty', md: '`[]` — no matches' },
            { id: 'undef', md: '`undefined`' }
          ],
          'empty'
        ),
        stdoutCode({
          id: 'only-east',
          prompt: '> `onlyEast(dirs)` returns only `"east"` entries, joined as `east,east`. Print that.',
          equals: 'east,east',
          ast: 'filter',
          hidden: true,
          hints: ladder(
            'The starter joins every direction, including the ones you were asked to drop.',
            '`filter` keeps the entries whose test returns true and returns a new, shorter list.',
            '`dirs.filter((d) => d === "east")` keeps only the easts; `join(",")` then makes the line.',
            'function onlyEast(dirs) { return dirs.filter(d => d === "east").join(",") }\nconsole.log(onlyEast(["east", "south", "east"]))\nmodule.exports = { onlyEast }'
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
          hints: ladder(
            'The starter joins with a comma. The lesson asks you to build the same idea with an accumulator.',
            '`reduce` carries one value across the list: the running path so far, plus the next direction.',
            'If the accumulator is still empty, the answer is just the direction; otherwise add `"-"` before it.',
            'function pathOf(dirs) {\n  return dirs.reduce((acc, d) => (acc ? acc + "-" + d : d), "")\n}\nconsole.log(pathOf(["east", "south"]))\nmodule.exports = { pathOf }'
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
      taskRev: 3,
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
          prompt:
            '> Walk `east` then `south` using `route.east` and `route.south` in the source (loop each count). Beacon is at (3, 2).',
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
          hints: ladder(
            'The record already holds both counts. The starter moves east once and ignores them.',
            'Read `route.east` and `route.south`, and loop that many times for each heading.',
            '`for (let i = 0; i < route.east; i++) Player.move("east")` walks the east leg.',
            'const route = { east: 3, south: 2 }\nfor (let i = 0; i < route.east; i++) Player.move("east")\nfor (let i = 0; i < route.south; i++) Player.move("south")\nmodule.exports = { route }'
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
`) + srcIncludes('route.east', 'route.south') + playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'object-key-iteration',
      courseId: 'data',
      moduleId: 'records',
      title: 'Walk the keys of a record',
      skillIds: ['js.objects', 'js.arrays'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Three ways to walk, one you should reach for\n\n`Object.keys(route)` gives the **own** key names as an array. `Object.values` gives the values, `Object.entries` gives `[key, value]` pairs. All three skip anything inherited from a prototype.\n\n`for (const k in route)` also walks **inherited** keys. That is why a record built with `Object.create(base)` leaks `base`\'s keys into your loop.\n\n`for (const v of list)` is for arrays and other iterables. A plain object is not iterable — `for…of` on one throws.'
        ),
        predict(
          'for-in-what',
          'In `for (const k in route)`, what is `k` on each pass?',
          [
            { id: 'key', md: 'The key name, as a string' },
            { id: 'value', md: 'The value stored under the key', misconceptionId: 'for-in-yields-values' },
            { id: 'pair', md: 'A `[key, value]` pair' }
          ],
          'key'
        ),
        cloze(
          'which-walk',
          'To get own keys only, use {{a}}. To get `[key, value]` pairs, use {{b}}.',
          [
            { id: 'a', choices: ['Object.keys', 'for…in', 'for…of'] },
            { id: 'b', choices: ['Object.entries', 'Object.values', 'JSON.parse'] }
          ],
          { a: 'Object.keys', b: 'Object.entries' },
          { explainMd: 'for…in adds inherited keys. Object.keys and Object.entries stay on the record in front of you.' }
        ),
        stdoutCode({
          id: 'route-summary',
          prompt:
            '> `summary(route)` returns each own key and value as `key=value`, joined with `;`. Print `summary({ east: 3, south: 2 })` (`east=3;south=2`).',
          equals: 'east=3;south=2',
          hidden: true,
          hints: ladder(
            'You need both the key and the value on each pass, in the order they were written.',
            '`Object.entries(route)` hands you `[key, value]` pairs you can map over.',
            '`Object.entries(o).map(([k, v]) => k + "=" + v)` builds the pieces; `join(";")` glues them.',
            'function summary(route) {\n  return Object.entries(route)\n    .map(([key, value]) => `${key}=${value}`)\n    .join(";")\n}\nconsole.log(summary({ east: 3, south: 2 }))\nmodule.exports = { summary }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function summary(route) {
  return Object.keys(route).join(";")
}
console.log(summary({ east: 3, south: 2 }))
module.exports = { summary }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.summary({ east: 3, south: 2 }), 'east=3;south=2')
assert.strictEqual(m.summary({}), '')
assert.strictEqual(m.summary({ north: 1 }), 'north=1')
const base = { ghost: 9 }
const child = Object.create(base)
child.east = 1
assert.strictEqual(m.summary(child), 'east=1', 'inherited keys must not appear')
`)
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
      taskRev: 3,
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
          prompt:
            '> Two jobs. `unique(dirs)` uses a `Set` and returns unique headings joined with `-`. `nameOf(map, key)` uses `Map` `.get` / `.has` and returns the value, or `"none"` when the key was never set. Print `unique(["east","east","south"])` (`east-south`).',
          equals: 'east-south',
          hidden: true,
          hints: ladder(
            'A Set answers "which headings appeared"; a Map answers "what is stored under this key". You need one of each.',
            '`new Set(array)` drops duplicates and keeps first-seen order; `[...set]` turns it back into a list you can join.',
            '`map.has(key)` is the honest test before `map.get(key)`, because a missing key gives `undefined` rather than throwing.',
            'function unique(dirs) {\n  return [...new Set(dirs)].join("-")\n}\nfunction nameOf(map, key) {\n  return map.has(key) ? map.get(key) : "none"\n}\nconsole.log(unique(["east", "east", "south"]))\nmodule.exports = { unique, nameOf }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function unique(dirs) {
  return dirs.join("-")
}
function nameOf(map, key) {
  return key
}
console.log(unique(["east", "east", "south"]))
module.exports = { unique, nameOf }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.unique(['east', 'east', 'south']), 'east-south')
assert.strictEqual(m.unique(['west']), 'west')
assert.strictEqual(m.unique(['south', 'south', 'south']), 'south')
const beacons = new Map([['n', 'north'], ['e', 'east']])
assert.strictEqual(m.nameOf(beacons, 'n'), 'north')
assert.strictEqual(m.nameOf(beacons, 'e'), 'east')
assert.strictEqual(m.nameOf(beacons, 'ghost'), 'none', 'a missing key is none, not undefined')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/new\\s+Set\\b|\\bSet\\s*\\(/.test(src), 'unique must use a Set')
assert.ok(/\\.get\\s*\\(|\\.has\\s*\\(/.test(src), 'nameOf must use Map get/has')
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
          hints: ladder(
            'The comment marks the missing line: `also` has to gain a south step.',
            '`also` and `shared` are two names for one list, so pushing through either name changes both.',
            '`also.push("south")` adds the step; the loop below already walks `shared`.',
            'const shared = ["east", "east"]\nconst also = shared\nalso.push("south")\nfor (const d of shared) Player.move(d)\nmodule.exports = { shared }'
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
      'hidden.test.js':
        exportAssert(`assert.ok(Array.isArray(m.shared))
assert.deepStrictEqual(m.shared, ['east', 'east', 'south'], 'the shared list itself must gain the south step')
`) +
        playLogOk(`const dirs = log.filter((row) => row.op === 'move').map((row) => row.dir)
assert.deepStrictEqual(dirs.slice(0, 3), ['east', 'east', 'south'], 'walk the shared list, do not add a move by hand')
`)
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
          hints: ladder(
            'The starter writes straight into the record it was handed, so the caller loses the original.',
            'Build a new object instead: spread the old fields in, then override the one you meant to change.',
            '`{ ...settings, volume: 3 }` copies every field and replaces only `volume`.',
            'function extendSouth(route) { return { ...route, south: 2 } }\nconsole.log(extendSouth({ east: 3, south: 0 }).south)\nmodule.exports = { extendSouth }'
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
          '## Text in, object out, text again\n\n`JSON.parse` turns a string into an object. Bad text throws a `SyntaxError` — there is no quiet `{}` fallback. `JSON.stringify` goes the other way.\n\nHere the JSON arrives as a string already, held in `raw`. Reading files comes later, in the Node track; today the only question is what the text becomes.\n\nA round-trip is not always lossless: `undefined`, functions, and `Map` values do not survive `stringify`.'
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
        tf(
          'stringify-undefined',
          '`JSON.stringify({ a: undefined })` keeps the `a` field.',
          false,
          { explainMd: 'It gives `{}`. Fields set to undefined, and functions, are dropped on the way out.' }
        ),
        stdoutCode({
          id: 'read-signal',
          prompt: '> `readName(text)` parses the JSON in `text` and returns the `name` field. Print `readName(raw)` (`north`).',
          equals: 'north',
          ast: 'JSON.parse',
          hidden: true,
          hints: ladder(
            'The starter hands the raw text straight back, so you are printing JSON instead of a name.',
            '`JSON.parse(text)` gives you an object; after that it is an ordinary field read.',
            '`JSON.parse(\'{"kind":"beacon"}\').kind` is `"beacon"`.',
            'const raw = \'{ "name": "north", "kind": "beacon" }\'\nfunction readName(text) {\n  return JSON.parse(text).name\n}\nconsole.log(readName(raw))\nmodule.exports = { readName }'
          )
        })
      ]
    }),
    files: {
      'main.js': `const raw = '{ "name": "north", "kind": "beacon" }'
function readName(text) {
  return text
}
console.log(readName(raw))
module.exports = { readName }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.readName('{ "name": "north", "kind": "beacon" }'), 'north')
assert.strictEqual(m.readName('{"name":"west"}'), 'west')
assert.throws(() => m.readName('{'), 'broken JSON must throw, not return undefined')
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
          hints: ladder(
            'The starter returns the bare name, so the printed lines are missing their tag.',
            'Build the tag inside the function, so every caller gets the same shape.',
            'A template literal does it in one line: `` return `beacon:${name}` ``.',
            'function logBeacon(name) { return `beacon:${name}` }\nconsole.log(logBeacon("north"))\nconsole.log(logBeacon("east"))\nmodule.exports = { logBeacon }'
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
