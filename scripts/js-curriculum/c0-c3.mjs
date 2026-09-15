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
  exportAssert,
  fence
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
          [
            '## Kinds you can print',
            '',
            'Every value in JavaScript has a **kind**. The operator that reports it is `typeof`. A later desk will ask “what kind of signal is this?” before it files the record — the same question this lesson asks of a number and a string that look alike.',
            '',
            'That is why `"3"` and `3` are not interchangeable. Quotes make text. A bare numeral is a number. Filing the wrong kind is how a lamp current of `"2"` sits in a drawer that expected `2` and then fails a later add.',
            '',
            fence(
              'javascript',
              `typeof 3      // "number"
typeof "3"    // "string"
typeof null   // "object"  — leftover language bug`
            ),
            '',
            '`typeof null` answering `"object"` is a leftover bug, not a license to poke fields on `null`. Do not treat `null` as a bag. Write `kindOf` so a hidden test can call it, and print the kind of the number `3`.'
          ].join('\n')
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
      taskRev: 4,
      blocks: [
        explain(
          [
            '## A name is a box',
            '',
            '`let` names a box you can refill. `const` names a box you cannot **rebind** — the sticker on the box stays. That is all `const` locks. If the value is an object, the stuff *inside* can still change.',
            '',
            'Learners often hear “const means immutable” and then freeze when a desk asks them to flip a lamp. The name must stay. The field can move.',
            '',
            fence(
              'javascript',
              `const signal = { on: false }
signal.on = true   // legal — same box, flipped field
// signal = {}     // TypeError — that would peel the sticker off`
            ),
            '',
            'On this desk, `flipLamp` already has `const signal = { on: false }`. Turn the lamp on by writing the field. Do not write `signal = …`.'
          ].join('\n')
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
          id: 'flip-const-field',
          prompt:
            '> `flipLamp` already has `const signal = { on: false }`. Turn the lamp on by changing the **field** (`signal.on = true`), then return `signal.on`. Do not write `signal = …` — `const` locks the name, not the fields. Print the result (`true`).',
          equals: 'true',
          ast: 'const',
          hidden: true,
          hints: ladder(
            'The name `signal` must stay the same box. Flip the field inside that box.',
            '`const` stops `signal = {}`. It does not stop `signal.on = true`.',
            '`signal.on = true` then `return signal.on`.',
            'function flipLamp() {\n  const signal = { on: false }\n  signal.on = true\n  return signal.on\n}\nconsole.log(flipLamp())\nmodule.exports = { flipLamp }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function flipLamp() {
  const signal = { on: false }
  return signal.on
}
console.log(flipLamp())
module.exports = { flipLamp }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.flipLamp(), true)
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\\bconst\\b/.test(src), 'keep the record in a const binding')
assert.ok(/signal\\.on\\s*=/.test(src), 'change the field on the existing object')
assert.ok(!/\\bsignal\\s*=/.test(src.replace(/const\\s+signal\\s*=\\s*\\{\\s*on:\\s*false\\s*\\}/, '')), 'do not rebind signal')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'strings-immutable',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Text does not mutate',
      skillIds: ['js.values'],
      estimatedMinutes: 15,
      taskRev: 2,
      blocks: [
        explain(
          [
            '## Text does not mutate in place',
            '',
            'A JavaScript string is a finished strip of letters. You cannot scratch a character off and write another in its place. `"east".toUpperCase()` therefore returns a **new** string. The original stays `"east"`.',
            '',
            'That surprises people who have watched arrays mutate. `push` rewrites the list you already have. String methods never do that. They build a second strip and hand it back. Forget to keep both, and you either shout over the heading or you return the quiet original.',
            '',
            fence(
              'javascript',
              `let d = "east"
const shouted = d.toUpperCase()
// shouted is "EAST"
// d is still "east"`
            ),
            '',
            'The next lesson builds a new label with a template. This one only asks you to keep both strings: the new shout, and the original heading. `shoutKeep("east")` must be `EAST|east`.'
          ].join('\n')
        ),
        predict(
          'string-immutable',
          'After `let d = "east"; d.toUpperCase()`, what is `d`?',
          [
            { id: 'EAST', md: '`"EAST"` — the letters flipped in place' },
            { id: 'east', md: '`"east"` — the method returned a new string' }
          ],
          'east',
          {
            explainMd:
              '`toUpperCase` builds a new string and hands it back. It never rewrites the one you called it on. `d` stays `"east"` unless you assign the result back: `d = d.toUpperCase()`.'
          }
        ),
        tf(
          'upper-rewrites',
          '`"east".toUpperCase()` rewrites the original string to `"EAST"`.',
          false,
          { explainMd: 'Strings are immutable. The method returns a new string. The original stays "east".' }
        ),
        stdoutCode({
          id: 'shout-keep',
          prompt:
            '> `shoutKeep(dir)` must call `toUpperCase` and return both strings as `SHOUT|original` — so `shoutKeep("east")` is `EAST|east`. Do not hard-code `"EAST|east"`. Print `shoutKeep("east")`.',
          equals: 'EAST|east',
          ast: 'toUpperCase',
          hidden: true,
          hints: ladder(
            'Call `toUpperCase` to get the shout. Then glue it to the original with `|`.',
            'The original `dir` is unchanged after `toUpperCase`. Use that. Do not assign over `dir` unless you saved a copy first.',
            '`const shouted = dir.toUpperCase()` then `return shouted + "|" + dir`.',
            'function shoutKeep(dir) {\n  const shouted = dir.toUpperCase()\n  return shouted + "|" + dir\n}\nconsole.log(shoutKeep("east"))\nmodule.exports = { shoutKeep }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function shoutKeep(dir) {
  return dir
}
console.log(shoutKeep("east"))
module.exports = { shoutKeep }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.shoutKeep('east'), 'EAST|east')
assert.strictEqual(m.shoutKeep('north'), 'NORTH|north')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/toUpperCase/.test(src), 'call toUpperCase to build the new string')
assert.ok(!/return\\s+[\"']EAST\\|east[\"']/.test(src), 'build both sides from dir, do not hard-code the result')
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
      estimatedMinutes: 16,
      taskRev: 4,
      blocks: [
        explain(
          [
            '## Backticks insert a value',
            '',
            'Ordinary quotes keep `${name}` as letters — the dollar, the braces, and the word name. A **template literal** uses backticks. Only then does `${name}` become the value.',
            '',
            'This is a different idea from last lesson. Immutability said a method returns a new string. Interpolation says *how* you build that new string when a name has to sit inside it. Quotes will not do that job, even if the text looks like a template.',
            '',
            fence(
              'javascript',
              'const name = "north"\n"beacon:${name}"   // the characters beacon:${name}\n`beacon:${name}`   // beacon:north'
            ),
            '',
            'A template builds a new label. It does not rewrite `name`. `tagBeacon` must use backticks so `tagBeacon("north")` is `beacon:north`.'
          ].join('\n')
        ),
        predict(
          'quotes-vs-ticks',
          'What does `"beacon:${name}"` return when `name` is `"north"`?',
          [
            { id: 'lit', md: 'The characters `beacon:${name}` — quotes do not interpolate' },
            { id: 'val', md: '`"beacon:north"`' }
          ],
          'lit',
          {
            explainMd:
              'Double quotes (and single quotes) do not run `${…}`. You get the dollar, the braces, and the word name. Backticks are what insert the value.'
          }
        ),
        cloze(
          'tick-insert',
          'Interpolation needs {{a}}. `"beacon:${name}"` is {{b}}.',
          [
            { id: 'a', choices: ['backticks', 'double quotes', 'plus signs'] },
            { id: 'b', choices: ['literal text', 'beacon:north', 'an error'] }
          ],
          { a: 'backticks', b: 'literal text' },
          { explainMd: 'Only a template literal (backticks) replaces ${name}. Quotes keep those characters as text.' }
        ),
        stdoutCode({
          id: 'tag-name',
          prompt:
            '> `tagBeacon(name)` must return a template literal: backtick `beacon:` then `${name}` backtick — so `tagBeacon("north")` is `beacon:north`. Quotes will print the letters `${name}`. Do not hard-code `"beacon:north"`. Print `tagBeacon("north")`.',
          equals: 'beacon:north',
          ast: '`',
          hidden: true,
          hints: ladder(
            'If you used double quotes, `${name}` stays letters. Switch the string to backticks.',
            'A template is wrapped in backticks. `${name}` drops the argument in.',
            'With `kind = "low"`, backtick `signal:${kind}` backtick builds `signal:low`.',
            'function tagBeacon(name) { return `beacon:${name}` }\nconsole.log(tagBeacon("north"))\nmodule.exports = { tagBeacon }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function tagBeacon(name) {
  return "beacon:\${name}"
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
          [
            '## Not a Number is still a number kind',
            '',
            '`Number("fox")` is `NaN`. That value is the language saying “this failed to become a number.” It is still a number *kind*: `typeof NaN` is `"number"`. A desk that stores lamp current must catch it, or it files a broken reading as if it were a real zero.',
            '',
            'You cannot find it with `===`. `NaN === NaN` is **false**. Comparing against the word `"fox"` only catches one bad input. The operator that asks the real question is `Number.isNaN`.',
            '',
            fence(
              'javascript',
              `Number("fox")           // NaN
typeof NaN              // "number"
NaN === NaN             // false
Number.isNaN(Number("fox"))  // true`
            ),
            '',
            '`failedNumber(text)` must use `Number.isNaN`. Hard-coding `text === "fox"` is the mistake this lesson removes.'
          ].join('\n')
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
          [
            '## `===` does not convert',
            '',
            '`==` converts before it compares. That is why `0 == ""` is `true`: empty string becomes `0`. `===` refuses that conversion. A signal of `0` (off) is not a missing name `""`. A desk that treats those as the same name files a dark lamp as an unnamed beacon.',
            '',
            'Prefer `===` and `!==` unless you can name the coercion you want. The starter on this desk still uses `==`. That is the habit to drop.',
            '',
            fence(
              'javascript',
              `0 == ""    // true  — == converted the string
0 === ""   // false — different kinds
0 !== ""   // true`
            ),
            '',
            'The common mistake is keeping `==` because it “looks like equals.” On Try, print whether `0` and `""` are **not** strictly equal. Use `===` or `!==`. Do not keep `==`.'
          ].join('\n')
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
          [
            '## Some values act as “no”',
            '',
            'An `if` does not ask “is there a value here.” It asks “is this value truthy.” Six values are falsy: `0`, `""`, `null`, `undefined`, `NaN`, and `false`. A lamp at brightness `0` is off. An empty name is missing.',
            '',
            '`[]` and `"0"` are truthy. An empty list is still a list. The string zero is still text. Treating them as “no” is how a desk skips a real reading.',
            '',
            fence(
              'javascript',
              `if (0) { "go" } else { "stop" }     // "stop"
if ([]) { "go" } else { "stop" }    // "go"
if ("0") { "go" } else { "stop" }   // "go"`
            ),
            '',
            'The common mistake is listing the six falsy values by hand, or treating `[]` as shut because it looks empty. On Try, `gate(value)` returns `"open"` when the value is truthy, otherwise `"shut"`. `gate(0)` must print `shut`. Let the `if` do the work.'
          ].join('\n')
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
          [
            '## `&&`, `||`, and `??`',
            '',
            '`a && b` returns `a` if `a` is falsy, otherwise `b`. `a || b` returns `a` if `a` is truthy, otherwise `b`. They stop as soon as they know the answer — that is the short circuit.',
            '',
            '`??` is narrower: it only skips `null` or `undefined`. A lamp at brightness zero is still a reading. `||` would throw that zero away and write a default name on top of it.',
            '',
            fence(
              'javascript',
              `0 || "north"   // "north"  — || treats 0 as no
0 ?? "north"   // 0        — ?? keeps a real zero
"" || "anon"   // "anon"
null ?? "anon" // "anon"`
            ),
            '',
            '`label(name)` must return `name` if it is truthy, otherwise `"anon"`. Use `||` in the source. `??` would keep `""`, which this desk treats as missing.'
          ].join('\n')
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
          [
            '## `?.` asks first',
            '',
            '`signal.beacon.name` throws the moment `signal.beacon` is `undefined`. `signal?.beacon?.name` stops at the first missing link and hands back `undefined` instead of throwing. That is all it does.',
            '',
            '`?.` does **not** supply a default. An empty name `""` is a real reading, not a missing beacon. Pair the chain with `??` when you want a fallback only for `null` or `undefined`. `||` would hide `""` and `0`.',
            '',
            fence(
              'javascript',
              `const s = {}
s.beacon.name              // TypeError
s?.beacon?.name            // undefined
s?.beacon?.name ?? "unknown"  // "unknown"`
            ),
            '',
            'The common mistake is `signal.beacon.name` and a crash, or using `||` so an empty name becomes `unknown`. On Try, `beaconName(signal)` must use `?.` and `??`. Missing signal or missing beacon gives `"unknown"`. An empty name stays empty.'
          ].join('\n')
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
          [
            '## Name the kind, honestly',
            '',
            'This transfer uses everything from the chapter. `classify(value)` must label a signal without trusting `typeof` alone. `typeof null` is `"object"` — that leftover bug will file an empty reading as a bag of fields if you check kind first.',
            '',
            'Check `null` and `undefined` before anything else. Then `0` and `""` as `"zero"`. Then `Array.isArray` for `"list"`. Then other strings as `"text"`. Everything else is `"other"`.',
            '',
            fence(
              'javascript',
              `typeof null          // "object" — do not trust this
classify(null)       // "empty"
classify(0)          // "zero"
classify([])         // "list"
classify("east")     // "text"`
            ),
            '',
            'The common mistake is `return typeof value`, which labels `null` as `object` and `[]` as `object` too. On Try, walk the labels in order and print `classify(null)` (`empty`). Hidden tests cover the other labels.'
          ].join('\n')
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
          [
            '## A name is not a call',
            '',
            'A function is a recipe sitting under a name. Writing `ping` points at that recipe. Writing `ping()` runs it and hands you the result. Those two expressions are different values: one is the function itself, the other is `"pong"`.',
            '',
            'Why it bites: a desk that logs the recipe instead of the result files a blob of source where a signal word should be. The fox never hears `pong`. A later checker that calls your export still works, because the function is fine — only the print line never asked it to run.',
            '',
            fence(
              'javascript',
              `function ping() {
  return "pong"
}
console.log(ping)    // the function text
console.log(ping())  // "pong"`
            ),
            '',
            'The starter already returns `"pong"` and already exports `ping`. The last line, `module.exports = { ping }`, is harness plumbing so the checker can reach your function — leave it. Modules are taught in the Node track. On Try, call `ping` and print the returned string `pong`.'
          ].join('\n')
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
          [
            '## Call, then see',
            '',
            '`Player.move` is a call that walks the fox one cell. The name without parentheses does nothing on the field. Each call takes a heading string. `"east"` increases **x**. `"south"` increases **y**. The beacon stays put — you walk onto it.',
            '',
            'Why it bites: one leftover `move` from a previous attempt leaves the fox on a tree or a rock. Those cells block. The coin on the way is optional scenery. A fox that never reaches (3, 2) never lights the beacon, even if the heading list looks right on paper.',
            '',
            fence(
              'javascript',
              `Player.move("east")   // x goes up by 1
Player.move("south")  // y goes up by 1
// start (0, 0) → three east, two south → (3, 2)`
            ),
            '',
            'On Try, walk the fox onto the beacon at `(3, 2)`. You need three east calls and two south calls. Order does not matter as long as you stay off the trees and rocks. The owl is scenery. The starter already takes one east step — keep calling until the fox stands on the lamp.'
          ].join('\n')
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
          [
            '## The stage hears `say`, not `console.log`',
            '',
            '`return` hands a value to the caller. `console.log` writes a notebook line and hands back `undefined`. `status()` should **return** `"locked"`. Then `Player.say(status())` shows that word on the fox. The stage never reads the console. Printing is a notebook, not the result the next function can use.',
            '',
            'Why it bites: a fox that only logged `"locked"` says `undefined` on the field. The beacon walk can still succeed, so the board looks almost done, but the speech bubble is empty. A hidden test that calls `status()` also gets `undefined` and fails.',
            '',
            fence(
              'javascript',
              `function status() {
  return "locked"   // the caller receives this
}
Player.say(status())  // the fox says "locked"
// console.log("locked") would print, then return undefined`
            ),
            '',
            'The starter logs inside `status` and then says `"?"`. On Try, return `"locked"` from `status`, pass that call into `Player.say`, and walk south onto the beacon. Leave the export so the checker can call `status` on its own.'
          ].join('\n')
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
          [
            '## A function that walks `n` steps',
            '',
            '`function walk(n = 1)` names a parameter and a default in the same list. When you write `walk(3)`, `n` is `3`. When you write `walk()` with nothing in the parentheses, `n` becomes `1`. The default lives in the signature, not in an `if` inside the body. Then call `Player.move("east")` that many times.',
            '',
            'Why it bites: five pasted `Player.move("east")` lines drift the moment the beacon moves. A `walk` that ignores `n` always takes one step, so `walk(3)` stops short of x=3 and `walk()` with no args is indistinguishable from a hardcoded single move.',
            '',
            fence(
              'javascript',
              `function walk(n = 1) {
  for (let i = 0; i < n; i++) {
    Player.move("east")
  }
}
walk(3)  // three steps
walk()   // one step — the default filled in`
            ),
            '',
            'On Try, write `walk(n = 1)` that moves east `n` times, then call `walk(3)` to reach x=3. The hidden test also calls `walk()` with no arguments and expects one move. Put the default in the parameter list — do not copy-paste five `move` lines if a parameter will do.'
          ].join('\n')
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
          [
            '## One idea, many steps',
            '',
            'A `for` loop is a counter that writes the path. The header names a start, a stop test, and a step. `for (let i = 0; i < 3; i++)` runs the body three times, with `i` equal to 0, then 1, then 2. The test `i < 3` is what makes it three, not the number written after the plus-plus.',
            '',
            'Why it bites: three copy-pasted `Player.move("east")` calls look fine until the beacon slides to x=5. One line gets edited and two stay stale. The fox stops short or walks through a wall that was not there last week.',
            '',
            fence(
              'javascript',
              `for (let i = 0; i < 3; i++) {
  Player.move("east")
}
// i is 0, 1, 2 — three east steps, fox at (3, 0)`
            ),
            '',
            'On Try, use a `for` loop to walk east onto the beacon at (3, 0). The starter already pastes two moves. Do not grow a third paste — one loop should write the whole path. The hidden test refuses a file that keeps adding `Player.move` lines.'
          ].join('\n')
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
          [
            '## Stop when the counter says so',
            '',
            '`while` keeps going while a condition is true. `break` leaves early when you have a *reason* — here, when you have taken 2 south steps toward the beacon. A `while (true)` without `break` is a runaway. The runner will time out.',
            '',
            'Why it bites: `while (false)` never enters the body, so the fox never leaves (1, 0). The opposite bug, a loop with no exit, walks south forever and the desk kills the run. Either way the fox misses the beacon at (1, 2).',
            '',
            fence(
              'javascript',
              `let steps = 0
while (true) {
  Player.move("south")
  steps += 1
  if (steps === 2) break
}
// two south steps, then leave`
            ),
            '',
            'There is a sibling worth knowing: `do { … } while (cond)` checks the condition **after** the body, so the body always runs at least once. Reach for it when the first attempt is unconditional — read a line, then keep reading while there are more. On Try, walk south with `while` until you have moved twice. Use `break` or a counter.'
          ].join('\n')
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
          [
            '## `switch` routes a command',
            '',
            'A dispatch table reads one value and picks a branch. `switch (cmd)` compares with `===`, runs the matching `case`, and keeps running **into the next case** until it meets `break`. That fall-through is a feature when you group spellings. `default` catches anything you did not plan for.',
            '',
            'Why it bites: forgetting `break` on a branch that has its own body is the classic bug. The fox hears `"east"` and then also runs the south case, so one command walks two cells. An unknown `"beep"` with no `default` is silently ignored, and the speech bubble never says `skip`.',
            '',
            fence(
              'javascript',
              `switch (cmd) {
  case "east":
  case "e":
    Player.move("east")
    break
  case "south":
    Player.move("south")
    break
  default:
    Player.say("skip")
}`
            ),
            '',
            'Both `east` and `e` share one body because the first label has no `break` of its own. On Try, walk the plan with a `switch`. `east` and `e` both go east, `south` goes south, and anything else falls to `default` and says `skip`. The beacon is at (2, 2). The starter already has the plan array.'
          ].join('\n')
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
          [
            '## The grid is the test',
            '',
            'Your file is the controller. **Run** plays the level on the stage. `Player.move` walks one cell; rocks are solid and the step is refused. Tokens vanish when you walk onto them. The win is not only standing on the beacon — you must also face, grow, and speak.',
            '',
            'Why it bites: a fox that reaches (2, 0) but still faces 0°, still at scale 1, or still silent has not finished. `Player.scale(3)` is rejected. Walking east from `(2, 3)` into the rock at `(3, 3)` leaves you in place, so a route that ignores walls looks right on paper and fails on the field.',
            '',
            fence(
              'javascript',
              `Player.move("north")  // one cell; rocks block
Player.rotate(90)     // face 90°
Player.scale(2)       // grow; scale(3) is rejected
Player.say("ready")   // the win word`
            ),
            '',
            'Calls you will use: `Player.move("north"|"south"|"east"|"west")`, `Player.rotate(90)`, `Player.scale(1)` or `Player.scale(2)`, and `Player.say("ready")`. On Try, collect every token, stand on the beacon, face **90°**, scale **2**, and say **ready**. The stage is the map — discover the route, and open Hint if you need a compass.'
          ].join('\n')
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
          [
            '## The fox stops early',
            '',
            'Off-by-one is a counting story, not a mystery. `for (let i = 0; i < 2; i++)` runs the body when `i` is 0 and 1 — two steps. `i < 3` (or `i <= 2`) runs three. The author meant three east steps from x=0 to the beacon at x=3, and wrote the tighter bound by habit.',
            '',
            'Why it bites: the fox stops on (2, 0), one cell short of the lamp. The walls on the row below never get touched, so the board looks open, and it is easy to blame the stage instead of the comparison. Inclusive `<=` and exclusive `<` are both legal; they just count differently.',
            '',
            fence(
              'javascript',
              `for (let i = 0; i < 2; i++) {  // i = 0, 1 — two moves
  Player.move("east")
}
// need i < 3 so i = 0, 1, 2 — fox at (3, 0)`
            ),
            '',
            'On Try, the starter walks only to x=2. Fix the bound so the fox reaches x=3. Keep the `for` loop. Stay on y=0; the walls sit on the row below. Count on your fingers: `i` of 0, 1, 2 is three moves when the test is `i < 3`.'
          ].join('\n')
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
      taskRev: 4,
      blocks: [
        explain(
          [
            '## A list of directions',
            '',
            'An array is a numbered row. Index `0` is the first item. `dirs.length` is how many items sit in the row. The last item is at `length - 1`, not at `length`. Asking for `dirs[dirs.length]` is asking for a slot that was never written — you get `undefined`, not a wrap-around.',
            '',
            'Why it bites: a fox that reads `dirs[3]` from `["east", "east", "south"]` tries to `Player.move(undefined)` and stands still, one step short of the beacon at (2, 1). Hard-coding `"south"` as the last heading also fails the moment a hidden test hands you `["west"]`.',
            '',
            fence(
              'javascript',
              `const dirs = ["east", "east", "south"]
dirs[0]                // "east"
dirs.length            // 3
dirs[dirs.length - 1]  // "south"
dirs[dirs.length]      // undefined`
            ),
            '',
            '`lastDir(dirs)` must return the last heading with `dirs[dirs.length - 1]` — not a hardcoded `"south"`. Then walk every string in `dirs` with a for…of, forEach, or indexed loop. Do not paste three separate `Player.move("…")` calls.'
          ].join('\n')
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
            '> `lastDir(dirs)` returns the last heading with `dirs[dirs.length - 1]` — not a hardcoded `"south"`. Then walk every string in `dirs` (for…of / forEach / indexed loop). Do not paste three separate `Player.move("…")` calls.',
          world: gridWorld([fox(0, 0), beacon(2, 1)]),
          goal: { all: [at('fox', 'x', 2), at('fox', 'y', 1)] },
          hidden: true,
          hints: ladder(
            'The last slot is `length - 1`, not `length`. Then walk the list instead of one pasted move.',
            'Write `lastDir` first so the hidden test can call it with other lists.',
            '`for (const dir of dirs) { … }` hands you each string in turn.',
            'const dirs = ["east", "east", "south"]\nfunction lastDir(list) {\n  return list[list.length - 1]\n}\nfor (const dir of dirs) Player.move(dir)\nmodule.exports = { dirs, lastDir }'
          )
        })
      ]
    }),
    files: {
      'main.js': `const dirs = ["east", "east", "south"]
function lastDir(list) {
  return list[0]
}
Player.move("east")
module.exports = { dirs, lastDir }
`,
      'hidden.test.js':
        exportAssert(`assert.strictEqual(m.lastDir(['east', 'south']), 'south')
assert.strictEqual(m.lastDir(['west']), 'west')
assert.strictEqual(m.lastDir(m.dirs), 'south')
`) +
        playLogOk() +
        `;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(/length\\s*-\\s*1/.test(src), 'last index is length - 1')
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
          [
            '## map does not rewrite the original',
            '',
            '`map` walks a list and builds a **new** array of the same length, one transformed item per slot. `names.map(n => n.toUpperCase())` is a second list. The list you started from is untouched — that is the whole point, and the hidden test checks it by handing you `["ada"]` and asserting the first letter stayed lowercase.',
            '',
            'Why it bites: learners reach for `push` inside a loop, or they assign back into `names[i]`, and a later desk that still needed the quiet originals files shouted labels on the wrong drawer. `map` is the method that refuses that rewrite.',
            '',
            fence(
              'javascript',
              `const names = ["ada", "grace"]
const shouted = names.map(n => n.toUpperCase())
// shouted is ["ADA", "GRACE"]
// names is still ["ada", "grace"]
shouted.join(",")  // "ADA,GRACE"`
            ),
            '',
            'On Try, `uppers` must map `ada, grace` to uppercase and join them with a comma: `ADA,GRACE`. Use `map` in the source. Joining the original list without mapping leaves the letters lowercase, which is what the starter does.'
          ].join('\n')
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
      title: 'filter and find',
      skillIds: ['js.arrays'],
      estimatedMinutes: 20,
      taskRev: 4,
      blocks: [
        explain(
          [
            '## Keep matches, or pick the first',
            '',
            '`filter` returns **every** match as a new list. `find` returns the **first** match, or `undefined` if none. They look similar because both take a test function, but the results are different kinds: a list versus one item. An empty filter is `[]`. A missed find is `undefined`, not an empty list.',
            '',
            'Why it bites: treating `find` as if it returned a list makes `.join` throw, because `undefined` has no join. Treating `filter` as if it returned one string silently drops the second east, so a log that should read `east,east` files a single heading and a later desk thinks only one beacon fired.',
            '',
            fence(
              'javascript',
              `const dirs = ["east", "south", "east"]
dirs.filter(d => d === "east")  // ["east", "east"]
dirs.find(d => d === "east")    // "east"
["south"].filter(d => d === "east")  // []
["south"].find(d => d === "east")    // undefined`
            ),
            '',
            'Two exports. `onlyEast(dirs)` uses `filter` and joins remaining easts as `east,east`. `firstEast(dirs)` uses `find` and returns that string, or `""` if none. Print `onlyEast(["east", "south", "east"])`. The starter joins every direction and reads `dirs[0]` for the first — both habits this lesson removes.'
          ].join('\n')
        ),
        predict(
          'filter-empty',
          '`["south"].filter(d => d === "east")` is…',
          [
            { id: 'empty', md: '`[]` — no matches' },
            { id: 'undef', md: '`undefined`' }
          ],
          'empty',
          { explainMd: '`filter` always returns a list. No matches means `[]`, not `undefined`. `find` is the one that returns `undefined`.' }
        ),
        predict(
          'find-miss',
          '`["south"].find(d => d === "east")` is…',
          [
            { id: 'empty', md: '`[]`' },
            { id: 'undef', md: '`undefined` — no first match' }
          ],
          'undef',
          { explainMd: '`find` hands back the item, or `undefined` when nothing matched. It does not hand back an empty list.' }
        ),
        stdoutCode({
          id: 'only-east',
          prompt:
            '> Two exports. `onlyEast(dirs)` uses `filter` and joins remaining easts as `east,east`. `firstEast(dirs)` uses `find` and returns that string, or `""` if none. Print `onlyEast(["east", "south", "east"])`.',
          equals: 'east,east',
          ast: 'filter',
          hidden: true,
          hints: ladder(
            'The starter joins every direction. `filter` drops the ones that are not east. `find` is a separate function.',
            '`filter` keeps every match as a list. `find` keeps only the first match, or `undefined`.',
            '`dirs.filter((d) => d === "east")` then `join(",")`. `dirs.find((d) => d === "east") ?? ""`.',
            'function onlyEast(dirs) { return dirs.filter(d => d === "east").join(",") }\nfunction firstEast(dirs) { return dirs.find(d => d === "east") ?? "" }\nconsole.log(onlyEast(["east", "south", "east"]))\nmodule.exports = { onlyEast, firstEast }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function onlyEast(dirs) {
  return dirs.join(",")
}
function firstEast(dirs) {
  return dirs[0]
}
console.log(onlyEast(["east", "south", "east"]))
module.exports = { onlyEast, firstEast }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.onlyEast(['south', 'east', 'east']), 'east,east')
assert.strictEqual(m.onlyEast(['south']), '')
assert.strictEqual(m.firstEast(['south', 'east', 'east']), 'east')
assert.strictEqual(m.firstEast(['south']), '')
`) + srcIncludes('filter', 'find')
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
          [
            '## reduce when you are building one value',
            '',
            '`map` and `filter` already make lists. `reduce` is for **one** accumulator that walks the row. Here that value is a path string: `["east", "south"]` becomes `"east-south"`. The second argument to `reduce` is the seed. `["east"].reduce((acc, d) => acc + d, "")` starts `acc` as `""`, not as `"east"`.',
            '',
            'Why it bites: `join(",")` is the easy answer and the starter already does it, so a desk files `east,south` when the signal board expected dashes. Hiding a `for` loop inside `reduce` for style also misses the point — you are building one string, not proving you know the method name.',
            '',
            fence(
              'javascript',
              `["east", "south"].reduce((acc, d) => {
  return acc ? acc + "-" + d : d
}, "")
// seed is ""
// after east: "east"
// after south: "east-south"`
            ),
            '',
            '`pathOf(["east", "south"])` must return `east-south` using `reduce`. Print it. If the list has one heading, the answer is that heading with no dash. The hidden test also calls `pathOf(["west"])`.'
          ].join('\n')
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
          [
            '## Fields, not a mystery bag',
            '',
            'A record stores named numbers. `{ east: 3, south: 2 }` is a route. You read `route.east` and loop that many moves. Objects do not walk themselves. A missing field is `undefined`, not `0` — `({ east: 3 }).south` is `undefined`, so a loop `i < route.south` would not run and you would never notice the south leg was absent.',
            '',
            'Why it bites: one hardcoded `Player.move("east")` ignores both counts. The fox stops at (1, 0) while the beacon sits at (3, 2). Changing the record to `{ east: 4, south: 1 }` would not move the fox, because the file never asked the record what it held.',
            '',
            fence(
              'javascript',
              `const route = { east: 3, south: 2 }
route.east    // 3
route.south   // 2
route.west    // undefined — not 0
// loop each count; the object does not walk itself`
            ),
            '',
            'On Try, walk `east` then `south` using `route.east` and `route.south` in the source — loop each count. The beacon is at (3, 2). Keep the `route` export. The gem on the east edge is optional scenery.'
          ].join('\n')
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
          [
            '## Three ways to walk, one you should reach for',
            '',
            '`Object.keys(route)` gives the **own** key names as an array. `Object.values` gives the values. `Object.entries` gives `[key, value]` pairs. All three skip anything inherited from a prototype. `for (const k in route)` also walks **inherited** keys. That is why a record built with `Object.create(base)` leaks `base`\'s keys into your loop.',
            '',
            'Why it bites: a summary that uses `for…in` on a child record files a ghost heading from the prototype, so a desk prints `ghost=9;east=1` when only `east` was written on the child. `for (const v of list)` is for arrays. A plain object is not iterable — `for…of` on one throws.',
            '',
            fence(
              'javascript',
              `const route = { east: 3, south: 2 }
Object.keys(route)     // ["east", "south"]
Object.entries(route)  // [["east", 3], ["south", 2]]
// for (const k in child) also sees inherited keys
// for (const v of route) throws — objects are not iterable`
            ),
            '',
            '`summary(route)` must return each own key and value as `key=value`, joined with `;`. Print `summary({ east: 3, south: 2 })` (`east=3;south=2`). Inherited keys must not appear. `Object.entries` is the walk that hands you both sides without the prototype leak.'
          ].join('\n')
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
          [
            '## Unique names, keyed lookup',
            '',
            'A `Set` keeps each value once. `new Set(["east", "east", "south"])` has size `2`. First-seen order is kept. A `Map` stores a value under a key you choose — not only a string field on an object. `map.get("north")` is `undefined` when the key was never set. It does not throw. `map.has` is the honest test.',
            '',
            'Why it bites: joining a raw log files `east-east-south` when the board only fired two headings. Looking up a missing beacon with a throw crashes the desk; treating the missing key as the key string itself (the starter) files `"ghost"` as if it were a real name.',
            '',
            fence(
              'javascript',
              `new Set(["east", "east", "south"]).size  // 2
const beacons = new Map([["n", "north"]])
beacons.get("n")      // "north"
beacons.get("ghost")  // undefined
beacons.has("ghost")  // false`
            ),
            '',
            'Two jobs. `unique(dirs)` uses a `Set` and returns unique headings joined with `-`. `nameOf(map, key)` uses `Map` `.get` / `.has` and returns the value, or `"none"` when the key was never set. Print `unique(["east","east","south"])` (`east-south`).'
          ].join('\n')
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
          [
            '## Two names, one list',
            '',
            '`const b = a` does not copy items. It hangs a second name on the same list. Change `b[0]` and `a[0]` changes too. Copy with `a.slice()` or `[...a]` when you mean a second list. This lesson is about the shared case: you *want* the mutation to show up under both names.',
            '',
            'Why it bites: a fox walks a surprise path when a helper mutates a route you thought you had copied. The opposite mistake, on this desk, is refusing to mutate: `also` stays a second name but nobody `push`es, so `shared` is still `["east", "east"]` and the fox never turns south toward (2, 1).',
            '',
            fence(
              'javascript',
              `const shared = ["east", "east"]
const also = shared        // same list, two names
also.push("south")
// shared is now ["east", "east", "south"]
// const copy = [...shared] would have been a second list`
            ),
            '',
            '`shared` starts as `["east","east"]`. Another name mutates it to add `"south"`. Walk `shared` to (2, 1). The hidden test checks that the list itself gained the south step — do not add a lone `Player.move("south")` by hand.'
          ].join('\n')
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
          [
            '## Copy, then extend',
            '',
            '`const { east, south } = route` pulls fields out into names. `{ ...route, south: 2 }` copies every own field into a **new** object, then overrides `south`. The original record stays honest. That is the opposite of `route.south = 2`, which writes through the same object the caller still holds.',
            '',
            'Why it bites: a desk that mutates the argument files the new south count back onto the live route. The next walk uses `south: 2` when the board still believed the path was `south: 0`. Spread is how you keep both records: the one you were handed, and the one you meant to change.',
            '',
            fence(
              'javascript',
              `const a = { east: 3, south: 0 }
const b = { ...a, south: 2 }
// b.south is 2
// a.south is still 0
const { east } = a  // east is 3`
            ),
            '',
            '`extendSouth({ east: 3, south: 0 })` must return a new object with `south: 2`. Print that south value. Use `...` in the source. The hidden test keeps the original `src.south` at `0` and asserts the returned record is `2`.'
          ].join('\n')
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
          [
            '## Text in, object out, text again',
            '',
            '`JSON.parse` turns a string into an object. Bad text throws a `SyntaxError` — there is no quiet `{}` fallback. `JSON.stringify` goes the other way. Here the JSON arrives as a string already, held in `raw`. Reading files comes later, in the Node track; today the only question is what the text becomes.',
            '',
            'Why it bites: returning the raw string prints `{ "name": "north", "kind": "beacon" }` instead of the name. A later desk that expected `"north"` files the whole blob. Swallowing a parse error and returning `undefined` hides a broken payload. A round-trip is also not always lossless: `undefined`, functions, and `Map` values do not survive `stringify`.',
            '',
            fence(
              'javascript',
              `const raw = '{ "name": "north", "kind": "beacon" }'
JSON.parse(raw).name     // "north"
JSON.parse("{")          // throws SyntaxError
JSON.stringify({ a: undefined })  // "{}" — field dropped`
            ),
            '',
            '`readName(text)` must parse the JSON in `text` and return the `name` field. Print `readName(raw)` (`north`). Hidden tests also send `{"name":"west"}` and a broken `"{"` that must throw, not return undefined.'
          ].join('\n')
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
          [
            '## A log you keep',
            '',
            '`logBeacon(name)` should return `beacon:name` — a tagged line, not a side effect. Print is how you *see* the line. Return is how a later caller *keeps* it. Hidden tests call your function with other names. Two literal `console.log("beacon:north")` lines would paint the notebook and still fail those tests.',
            '',
            'Why it bites: a function that only prints and returns nothing hands `undefined` to the next desk. The creation step that stores the line files an empty slot. A function that returns the bare name files `west` when the board expected `beacon:west`.',
            '',
            fence(
              'javascript',
              'function logBeacon(name) {\n  return `beacon:${name}`\n}\nlogBeacon("north")  // "beacon:north"\nlogBeacon("east")   // "beacon:east"'
            ),
            '',
            'On Try, `logBeacon(name)` returns `beacon:name`. Print north then east, one per line. Use the argument — do not only print two literals. A template literal does the tag in one expression; quotes would keep the letters `${name}` if you are not careful.'
          ].join('\n')
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
