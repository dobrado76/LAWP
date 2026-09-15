import {
  lesson,
  explain,
  predict,
  check,
  hints,
  stdoutCode,
  playCode,
  esmCode,
  reflect,
  fox,
  beacon,
  gridWorld,
  at,
  srcIncludes,
  playLogOk,
  exportAssert,
  asyncAssert
} from './lib.mjs'

export function lessonsC10C11() {
  const out = []

  out.push({
    doc: lesson({
      id: 'process-argv-env',
      courseId: 'the-process',
      moduleId: 'io',
      title: 'argv and env',
      skillIds: ['js.node.fs'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Flags the process already has\n\n`process.argv` is the command line. After `node` and the script path come your flags. This lesson runs with `--scrub`.\n\n`process.env.LAWP_FLAG` is also set. Print `scrub` if the flag is present.'
        ),
        predict(
          'argv-0',
          '`process.argv[0]` is usually…',
          [
            { id: 'script', md: 'Your script path' },
            { id: 'node', md: 'The node binary' }
          ],
          'node'
        ),
        stdoutCode({
          id: 'read-flag',
          prompt: '> If `process.argv` includes `--scrub`, print `scrub`.',
          equals: 'scrub',
          argv: ['--scrub'],
          env: { LAWP_FLAG: 'scrub' },
          hidden: true,
          hints: hints(
            'process.argv.includes("--scrub")',
            { level: 4, kind: 'assist', md: 'function flag() {\n  return process.argv.includes("--scrub") ? "scrub" : "none"\n}\nconsole.log(flag())\nmodule.exports = { flag }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function flag() {
  return "none"
}
console.log(flag())
module.exports = { flag }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.flag(), 'scrub')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'fs-read-write',
      courseId: 'the-process',
      moduleId: 'io',
      title: 'Read and write UTF-8',
      skillIds: ['js.node.fs'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Files stay under the run folder\n\n`fs.readFileSync("note.txt", "utf8")` reads the fixture. `fs.writeFileSync("out.txt", text)` writes beside it.\n\nPrint the trimmed contents of `note.txt` (`north`).'
        ),
        predict(
          'encoding',
          'Passing `"utf8"` means…',
          [
            { id: 'bytes', md: 'You still get a Buffer' },
            { id: 'text', md: 'You get a string of text' }
          ],
          'text'
        ),
        stdoutCode({
          id: 'read-note',
          prompt: '> Read `note.txt` as UTF-8, trim, print it. Also write the same text to `out.txt`.',
          equals: 'north',
          hidden: true,
          extraFiles: [{ path: 'files/note.txt', role: 'fixture' }],
          hints: hints(
            'fs.readFileSync("note.txt", "utf8").trim()',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nfunction readNote() {\n  const text = fs.readFileSync("note.txt", "utf8").trim()\n  fs.writeFileSync("out.txt", text)\n  return text\n}\nconsole.log(readNote())\nmodule.exports = { readNote }' }
          )
        })
      ]
    }),
    files: {
      'note.txt': `north\n`,
      'main.js': `function readNote() {
  return "?"
}
console.log(readNote())
module.exports = { readNote }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.readNote(), 'north')
assert.strictEqual(require('fs').readFileSync('out.txt', 'utf8').trim(), 'north')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'paths-and-encoding',
      courseId: 'the-process',
      moduleId: 'io',
      title: 'path.join, no .. tricks',
      skillIds: ['js.node.fs'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Join names, do not climb out\n\n`path.join("logs", "today.txt")` builds a path for *this* folder. `..` is how people try to leave. This lesson refuses it.\n\n`safeJoin("logs", name)` should throw if `name` includes `..`.'
        ),
        predict(
          'dotdot',
          '`path.join("logs", "../secret")` in a careless tool…',
          [
            { id: 'ok', md: 'Is always safe', misconceptionId: 'path-dotdot-ok' },
            { id: 'escape', md: 'Can point outside `logs`' }
          ],
          'escape'
        ),
        stdoutCode({
          id: 'safe-join',
          prompt: '> `safeJoin("logs", "a.txt")` prints `logs/a.txt` or `logs\\\\a.txt`. Hidden: `..` throws.',
          pattern: 'logs[\\\\/]a\\.txt',
          hidden: true,
          hints: hints(
            'if (name.includes("..")) throw new Error("no")',
            { level: 4, kind: 'assist', md: 'const path = require("path")\nfunction safeJoin(root, name) {\n  if (name.includes("..")) throw new Error("no")\n  return path.join(root, name)\n}\nconsole.log(safeJoin("logs", "a.txt"))\nmodule.exports = { safeJoin }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `const path = require("path")
function safeJoin(root, name) {
  return path.join(root, name)
}
console.log(safeJoin("logs", "a.txt"))
module.exports = { safeJoin }
`,
      'hidden.test.js': exportAssert(`assert.ok(/logs[\\\\/]a\\.txt/.test(m.safeJoin('logs', 'a.txt')))
assert.throws(() => m.safeJoin('logs', '../secret'))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'buffers-vs-strings',
      courseId: 'the-process',
      moduleId: 'io',
      title: 'Bytes vs text',
      skillIds: ['js.node.fs'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## A Buffer is bytes\n\n`Buffer.from("café", "utf8")` is bytes. `.toString("utf8")` is text again. `.length` on a buffer is byte length, not character count.\n\nPrint the UTF-8 byte length of `café` (`5`).'
        ),
        predict(
          'byte-len',
          '`Buffer.byteLength("é", "utf8")` is…',
          [
            { id: 'one', md: '`1`' },
            { id: 'two', md: '`2` (typical UTF-8)' }
          ],
          'two'
        ),
        stdoutCode({
          id: 'byte-length',
          prompt: '> Print `Buffer.byteLength("café", "utf8")`.',
          equals: '5',
          ast: 'Buffer',
          hidden: true,
          hints: hints(
            'Buffer.byteLength(text, "utf8")',
            { level: 4, kind: 'assist', md: 'function bytesOf(text) { return Buffer.byteLength(text, "utf8") }\nconsole.log(bytesOf("café"))\nmodule.exports = { bytesOf }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function bytesOf(text) {
  return text.length
}
console.log(bytesOf("café"))
module.exports = { bytesOf }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.bytesOf('café'), 5)
assert.strictEqual(m.bytesOf('a'), 1)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'streams-idea',
      courseId: 'the-process',
      moduleId: 'io',
      title: 'Read a log in chunks',
      skillIds: ['js.node.fs'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Chunks, not one giant string in your head\n\n`fs.createReadStream` emits `data` chunks. For this small fixture you still practice the API: collect chunks, join, print the last non-empty line (`east`).'
        ),
        predict(
          'stream-end',
          'You know the file is finished when…',
          [
            { id: 'first', md: 'The first `data` event fires' },
            { id: 'end', md: 'The `end` event fires' }
          ],
          'end'
        ),
        stdoutCode({
          id: 'stream-last',
          prompt: '> Stream `chunk-log.txt`, print the last trimmed line (`east`).',
          equals: 'east',
          hidden: true,
          extraFiles: [{ path: 'files/chunk-log.txt', role: 'fixture' }],
          hints: hints(
            'Listen for data and end. Or readFile if you must — hidden wants createReadStream in the source.',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nfunction lastLine() {\n  return new Promise((resolve) => {\n    let raw = ""\n    const s = fs.createReadStream("chunk-log.txt", "utf8")\n    s.on("data", (c) => { raw += c })\n    s.on("end", () => {\n      const lines = raw.trim().split(/\\r?\\n/)\n      resolve(lines[lines.length - 1])\n    })\n  })\n}\nlastLine().then((v) => console.log(v))\nmodule.exports = { lastLine }' }
          )
        })
      ]
    }),
    files: {
      'chunk-log.txt': `north\nsouth\neast\n`,
      'main.js': `async function lastLine() {
  return "north"
}
lastLine().then((v) => console.log(v))
module.exports = { lastLine }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.lastLine()
  assert.strictEqual(v, 'east')
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(src.includes('createReadStream'))
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'cjs-vs-esm-node',
      courseId: 'the-process',
      moduleId: 'style',
      title: 'require vs import',
      skillIds: ['js.modules'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Two module systems\n\n`require` / `module.exports` is CommonJS. `import` / `export` is ESM. Node picks ESM for `.mjs` or `"type": "module"`.\n\nThis lesson is ESM: export `ping` and print `pong`.'
        ),
        predict(
          'which-file',
          'A `.mjs` file is treated as…',
          [
            { id: 'cjs', md: 'CommonJS' },
            { id: 'esm', md: 'ESM' }
          ],
          'esm'
        ),
        {
          type: 'code',
          id: 'esm-ping',
          engine: 'javascript',
          entry: 'main.mjs',
          promptMd: '> `export function ping()` returns `pong`. Print it.',
          files: [
            { path: 'files/main.mjs', role: 'edit' },
            { path: 'files/hidden.test.mjs', role: 'hidden-test' }
          ],
          checks: [
            { type: 'stdout', equals: 'pong' },
            { type: 'js-assert' }
          ],
          hintLadder: hints(
            'export function ping() { return "pong" }',
            { level: 4, kind: 'assist', md: 'export function ping() { return "pong" }\nconsole.log(ping())' }
          )
        }
      ]
    }),
    files: {
      'main.mjs': `export function ping() {
  return "?"
}
console.log(ping())
`,
      'hidden.test.mjs': `import assert from 'node:assert'
import { ping } from './main.mjs'
assert.strictEqual(ping(), 'pong')
`
    }
  })

  out.push({
    doc: lesson({
      id: 'error-first-and-promises',
      courseId: 'the-process',
      moduleId: 'style',
      title: 'fs.promises',
      skillIds: ['js.node.fs', 'js.async'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## From callbacks to promises\n\nOld Node: `fs.readFile(path, (err, data) => …)` — error first. New: `await fs.promises.readFile(path, "utf8")` and `try/catch`.\n\nRead `note.txt` and print `north`.'
        ),
        predict(
          'err-first',
          'In `fs.readFile(path, cb)`, the first callback argument is…',
          [
            { id: 'data', md: 'The file text' },
            { id: 'err', md: 'An error or `null`' }
          ],
          'err'
        ),
        stdoutCode({
          id: 'promises-read',
          prompt: '> `async function load()` uses `fs.promises` to read `note.txt`. Print trimmed `north`.',
          equals: 'north',
          ast: 'promises',
          hidden: true,
          extraFiles: [{ path: 'files/note.txt', role: 'fixture' }],
          hints: hints(
            'await fs.promises.readFile("note.txt", "utf8")',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nasync function load() {\n  return (await fs.promises.readFile("note.txt", "utf8")).trim()\n}\nload().then((v) => console.log(v))\nmodule.exports = { load }' }
          )
        })
      ]
    }),
    files: {
      'note.txt': `north\n`,
      'main.js': `async function load() {
  return "?"
}
load().then((v) => console.log(v))
module.exports = { load }
`,
      'hidden.test.js': asyncAssert(`  const v = await m.load()
  assert.strictEqual(v, 'north')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-clean-a-log',
      courseId: 'the-process',
      moduleId: 'style',
      title: 'Transfer: clean a names log',
      skillIds: ['js.node.fs', 'js.arrays'],
      estimatedMinutes: 25,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Scrub a messy file\n\n`messy.txt` has blank lines, spaces, and duplicate names. `clean(text)` returns unique trimmed names, sorted, one per line.\n\nPrint the cleaned text (ending with `west` on the last line).'
        ),
        predict(
          'unique',
          'Two `North` lines should become…',
          [
            { id: 'two', md: 'Two lines' },
            { id: 'one', md: 'One `North` line' }
          ],
          'one'
        ),
        stdoutCode({
          id: 'clean-text',
          prompt: '> Clean `messy.txt` and print unique sorted names.',
          equals: 'east\nnorth\nwest',
          hidden: true,
          extraFiles: [{ path: 'files/messy.txt', role: 'fixture' }],
          hints: hints(
            'trim, filter Boolean, unique with Set, sort, join newlines.',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nfunction clean(text) {\n  const names = text.split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean)\n  return [...new Set(names)].sort().join("\\n")\n}\nconsole.log(clean(fs.readFileSync("messy.txt", "utf8")))\nmodule.exports = { clean }' }
          )
        })
      ]
    }),
    files: {
      'messy.txt': `\n  north \nnorth\neast\n\nwest\n`,
      'main.js': `function clean(text) {
  return text
}
console.log(clean(require("fs").readFileSync("messy.txt", "utf8")))
module.exports = { clean }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.clean('b\\na\\nb\\n'), 'a\\nb')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'creation-log-scrubber',
      courseId: 'the-process',
      moduleId: 'style',
      title: 'Creation: log scrubber',
      skillIds: ['js.node.fs'],
      estimatedMinutes: 22,
      creation: { id: 'log-scrubber', step: 1, briefMd: 'scrub(input, output) writes unique trimmed names.' },
      blocks: [
        explain(
          '## A tool you keep\n\n`scrub(input, output)` reads UTF-8, writes unique trimmed sorted names to `output`. Use the same rules as the transfer lesson.\n\nPrint `ok` after writing `clean.txt` from `messy.txt`.'
        ),
        predict(
          'write-side',
          '`scrub` should…',
          [
            { id: 'stdout-only', md: 'Only print the names' },
            { id: 'write', md: 'Write a file the next program can open' }
          ],
          'write'
        ),
        stdoutCode({
          id: 'scrub-fn',
          prompt: '> `scrub("messy.txt", "clean.txt")` writes the clean list. Print `ok`.',
          equals: 'ok',
          hidden: true,
          extraFiles: [{ path: 'files/messy.txt', role: 'fixture' }],
          hints: hints(
            'Reuse clean(), then writeFileSync.',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nfunction clean(text) {\n  const names = text.split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean)\n  return [...new Set(names)].sort().join("\\n")\n}\nfunction scrub(input, output) {\n  fs.writeFileSync(output, clean(fs.readFileSync(input, "utf8")))\n}\nscrub("messy.txt", "clean.txt")\nconsole.log("ok")\nmodule.exports = { clean, scrub }' }
          )
        })
      ]
    }),
    files: {
      'messy.txt': `north\n north \neast\n`,
      'main.js': `function scrub(input, output) {}
console.log("ok")
module.exports = { scrub }
`,
      'hidden.test.js': exportAssert(`m.scrub('messy.txt', 'out-hidden.txt')
const got = require('fs').readFileSync('out-hidden.txt', 'utf8').trim()
assert.strictEqual(got, 'east\\nnorth')
`)
    }
  })

  // Course 11
  out.push({
    doc: lesson({
      id: 'assert-and-aaa',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'Arrange, act, assert',
      skillIds: ['js.test'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## AAA on a route helper\n\n**Arrange** a list of dirs. **Act** by calling `walkLength`. **Assert** with `assert.strictEqual`.\n\n`walkLength(["east", "south"])` is `2`. Print `pass` after your own assert in `main.js` (the hidden test also asserts).'
        ),
        predict(
          'assert-fail',
          'A failed `assert.strictEqual` …',
          [
            { id: 'log', md: 'Only prints' },
            { id: 'throw', md: 'Throws, so the process exits non-zero' }
          ],
          'throw'
        ),
        stdoutCode({
          id: 'aaa',
          prompt: '> Implement `walkLength`. Assert it. Print `pass`.',
          equals: 'pass',
          ast: 'assert',
          hidden: true,
          hints: hints(
            'const assert = require("assert"); assert.strictEqual(walkLength(["east"]), 1)',
            { level: 4, kind: 'assist', md: 'const assert = require("assert")\nfunction walkLength(dirs) { return dirs.length }\nassert.strictEqual(walkLength(["east", "south"]), 2)\nconsole.log("pass")\nmodule.exports = { walkLength }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function walkLength(dirs) {
  return 0
}
console.log("pass")
module.exports = { walkLength }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.walkLength(['east', 'south', 'west']), 3)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'fixtures-and-hidden-tests',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'Fixtures and hidden tests',
      skillIds: ['js.test'],
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## You write a test the hidden runner also runs\n\n`cases.json` is a fixture: `[{ "dirs": ["east"], "n": 1 }]`. `testWalk` reads it and asserts `walkLength`.\n\nPrint `ok` when all fixture cases pass.'
        ),
        predict(
          'hidden-role',
          'A hidden test is…',
          [
            { id: 'secret-ui', md: 'A second editor tab' },
            { id: 'grade', md: 'A file the grader runs that you cannot edit' }
          ],
          'grade'
        ),
        stdoutCode({
          id: 'fixture-cases',
          prompt: '> `walkLength` plus a loop over `cases.json`. Print `ok`.',
          equals: 'ok',
          hidden: true,
          extraFiles: [{ path: 'files/cases.json', role: 'fixture' }],
          hints: hints(
            'JSON.parse the fixture, assert each n.',
            { level: 4, kind: 'assist', md: 'const fs = require("fs")\nconst assert = require("assert")\nfunction walkLength(dirs) { return dirs.length }\nfor (const c of JSON.parse(fs.readFileSync("cases.json", "utf8"))) {\n  assert.strictEqual(walkLength(c.dirs), c.n)\n}\nconsole.log("ok")\nmodule.exports = { walkLength }' }
          )
        })
      ]
    }),
    files: {
      'cases.json': `[{ "dirs": ["east"], "n": 1 }, { "dirs": ["east", "south"], "n": 2 }]\n`,
      'main.js': `function walkLength(dirs) {
  return dirs.length
}
console.log("ok")
module.exports = { walkLength }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.walkLength(['a', 'b', 'c']), 3)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'mocking-time-and-fs',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'Fake clock, fake read',
      skillIds: ['js.test'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Do not wait on the real clock\n\n`now()` should call `deps.clock()`. In tests, pass `{ clock: () => 1000 }`.\n\n`load(deps)` should call `deps.read("log.txt")`. Fake `read` returns `"north"`.\n\nPrint `1000 north`.'
        ),
        predict(
          'why-fake',
          'You fake `read` so the test…',
          [
            { id: 'disk', md: 'Needs the real disk every time' },
            { id: 'pure', md: 'Controls the bytes without a real file' }
          ],
          'pure'
        ),
        stdoutCode({
          id: 'inject-deps',
          prompt: '> `report({ clock, read })` prints `clock() + " " + read("log.txt")`. Use 1000 and north.',
          equals: '1000 north',
          hidden: true,
          hints: hints(
            'Do not call Date.now() or fs in report — use deps.',
            { level: 4, kind: 'assist', md: 'function report(deps) {\n  return deps.clock() + " " + deps.read("log.txt")\n}\nconsole.log(report({ clock: () => 1000, read: () => "north" }))\nmodule.exports = { report }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function report(deps) {
  return "now file"
}
console.log(report({}))
module.exports = { report }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.report({ clock: () => 5, read: () => 'x' }), '5 x')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'why-bundlers',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Why bundlers exist',
      skillIds: ['js.modules'],
      estimatedMinutes: 12,
      blocks: [
        explain(
          '## The browser has no `require` of your files\n\nA page can load one script URL. `require("./walker.js")` is a Node idea. A **bundler** walks your `import` graph and emits files the browser can load.\n\nThis lesson does not run a bundler. It asks you to name the problem.'
        ),
        check(
          'browser-require',
          'Why do front-end apps use a bundler (or native ESM URLs)?',
          [
            { id: 'pretty', md: 'Only to minify for fashion' },
            { id: 'graph', md: 'The browser does not `require()` a folder of files the way Node does' }
          ],
          'graph',
          { explainMd: 'You can also ship native ESM with import maps. The gap is still: the browser is not Node’s module loader.' }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'modules-esm-files',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'export a walker, import in main',
      skillIds: ['js.modules'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Two files\n\n`walker.mjs` exports `walkLength`. `main.mjs` imports it and prints `2` for `["east", "south"]`.'
        ),
        predict(
          'export-name',
          '`export function walkLength` is…',
          [
            { id: 'global', md: 'A global in every file automatically' },
            { id: 'named', md: 'A named export you must import' }
          ],
          'named'
        ),
        {
          type: 'code',
          id: 'two-files',
          engine: 'javascript',
          entry: 'main.mjs',
          promptMd: '> Export from `walker.mjs`, import in `main.mjs`, print `2`.',
          files: [
            { path: 'files/walker.mjs', role: 'edit' },
            { path: 'files/main.mjs', role: 'edit' },
            { path: 'files/hidden.test.mjs', role: 'hidden-test' }
          ],
          checks: [
            { type: 'stdout', equals: '2' },
            { type: 'js-assert' }
          ],
          hintLadder: hints(
            'import { walkLength } from "./walker.mjs"',
            { level: 4, kind: 'assist', md: 'walker.mjs: export function walkLength(dirs) { return dirs.length }\nmain.mjs: import { walkLength } from "./walker.mjs"\nconsole.log(walkLength(["east", "south"]))' }
          )
        }
      ]
    }),
    files: {
      'walker.mjs': `export function walkLength(dirs) {
  return 0
}
`,
      'main.mjs': `console.log(0)
`,
      'hidden.test.mjs': `import assert from 'node:assert'
import { walkLength } from './walker.mjs'
assert.strictEqual(walkLength(['a', 'b', 'c']), 3)
`
    }
  })

  out.push({
    doc: lesson({
      id: 'ast-and-lint',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'A stand-in for a linter',
      skillIds: ['js.test'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Refuse `==` in the edit file\n\nLAWP’s `ast` check is a **substring** search, not a real parser pass. Treat it as a stand-in for a linter.\n\nWrite `same(a, b)` with `===`. Print `false` for `0` and `""`.'
        ),
        predict(
          'ast-honest',
          'This lesson’s `==` ban is…',
          [
            { id: 'eslint', md: 'A full ESLint run' },
            { id: 'substr', md: 'A stand-in: the file text must not use `==`' }
          ],
          'substr'
        ),
        stdoutCode({
          id: 'no-double',
          prompt: '> `same(0, "")` is false via `===`. Print `false`.',
          equals: 'false',
          ast: '===',
          hidden: true,
          hints: hints(
            'Use === only.',
            { level: 4, kind: 'assist', md: 'function same(a, b) { return a === b }\nconsole.log(same(0, ""))\nmodule.exports = { same }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function same(a, b) {
  return a == b
}
console.log(same(0, ""))
module.exports = { same }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.same(0, ''), false)
assert.strictEqual(m.same(1, 1), true)
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(!/[^!=]==[^=]/.test(src), 'do not use ==')
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'proto-pollution',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Prototype pollution',
      skillIds: ['js.security'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Do not merge untrusted keys onto Object.prototype\n\n`obj.__proto__` or a merge of `{ "__proto__": { polluted: true } }` can change **every** object.\n\nSafe dictionaries: `Object.create(null)` or `Object.assign` onto a new object **without** copying `__proto__`. `Object.freeze(Object.prototype)` is a belt.\n\n`safeMerge(target, src)` copies only own keys that are not `__proto__` or `constructor`.'
        ),
        predict(
          'proto-key',
          'Merging `src["__proto__"]` onto a shared object…',
          [
            { id: 'fine', md: 'Is a normal field merge', misconceptionId: 'proto-merge-ok' },
            { id: 'danger', md: 'Can change Object.prototype for everyone' }
          ],
          'danger'
        ),
        stdoutCode({
          id: 'safe-merge',
          prompt: '> `safeMerge({}, { __proto__: { x: 1 }, name: "n" }).name` prints `n`. Hidden: prototype stays clean.',
          equals: 'n',
          hidden: true,
          hints: hints(
            'Skip keys __proto__, constructor, prototype.',
            { level: 4, kind: 'assist', md: 'function safeMerge(target, src) {\n  const out = Object.assign(Object.create(null), target)\n  for (const key of Object.keys(src)) {\n    if (key === "__proto__" || key === "constructor" || key === "prototype") continue\n    out[key] = src[key]\n  }\n  return out\n}\nconsole.log(safeMerge({}, { name: "n" }).name)\nmodule.exports = { safeMerge }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function safeMerge(target, src) {
  return Object.assign(target, src)
}
console.log(safeMerge({}, { name: "n" }).name)
module.exports = { safeMerge }
`,
      'hidden.test.js': exportAssert(`const out = m.safeMerge({ a: 1 }, JSON.parse('{"__proto__":{"polluted":true},"name":"n"}'))
assert.strictEqual(out.name, 'n')
assert.strictEqual({}.polluted, undefined)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'measure-then-change',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Measure, then change',
      skillIds: ['js.test'],
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## Time a loop; do not guess\n\n`performance.now()` (or `Date.now()`) before and after. Print the **count** you measured (`1000`), not a made-up faster algorithm.\n\nThe point is the habit: measure the loop you have.'
        ),
        predict(
          'guess',
          'You should rewrite a loop because…',
          [
            { id: 'feel', md: 'It feels slow' },
            { id: 'number', md: 'A measurement showed it is the problem' }
          ],
          'number'
        ),
        stdoutCode({
          id: 'count-loop',
          prompt: '> Loop 1000 times, increment `n`, print `n`.',
          equals: '1000',
          hidden: true,
          hints: hints(
            'for (let i = 0; i < 1000; i++) n++',
            { level: 4, kind: 'assist', md: 'function count() {\n  let n = 0\n  for (let i = 0; i < 1000; i++) n += 1\n  return n\n}\nconsole.log(count())\nmodule.exports = { count }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function count() {
  return 10
}
console.log(count())
module.exports = { count }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.count(), 1000)
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'jsdoc-contracts',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'JSDoc as a checklist',
      skillIds: ['js.test'],
      estimatedMinutes: 16,
      blocks: [
        explain(
          '## `@param` / `@returns` are a contract you can read\n\nThis is not TypeScript-as-product. One lesson: write the tags so a later you (or a TS pack) can check them.\n\n`/** @param {string[]} dirs @returns {number} */`\n\nPrint `walkLength` of two dirs (`2`).'
        ),
        predict(
          'jsdoc-runtime',
          'JSDoc tags…',
          [
            { id: 'enforce', md: 'Are enforced by Node at runtime' },
            { id: 'doc', md: 'Document the contract; tools may check them later' }
          ],
          'doc'
        ),
        stdoutCode({
          id: 'jsdoc-fn',
          prompt: '> Document and implement `walkLength`. Print `2`.',
          equals: '2',
          ast: '@param',
          hidden: true,
          hints: hints(
            'Put @param and @returns above the function.',
            { level: 4, kind: 'assist', md: '/** @param {string[]} dirs @returns {number} */\nfunction walkLength(dirs) { return dirs.length }\nconsole.log(walkLength(["east", "south"]))\nmodule.exports = { walkLength }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function walkLength(dirs) {
  return dirs.length
}
console.log(walkLength(["east", "south"]))
module.exports = { walkLength }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.walkLength(['a']), 1)
`) + srcIncludes('@param', '@returns')
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-test-the-fox',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Transfer: tests for walk(dirs)',
      skillIds: ['js.test', 'js.functions'],
      estimatedMinutes: 22,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Do not look at stdout\n\n`walk(dirs)` returns the end `{ x, y }` starting from `{ x: 0, y: 0 }` without calling `Player`. Tests check the object.\n\nPrint `3,2` for three east and two south.'
        ),
        predict(
          'pure-walk',
          '`walk` in this lesson should…',
          [
            { id: 'player', md: 'Call Player.move so the test watches the stage' },
            { id: 'return', md: 'Return coordinates the test can assert' }
          ],
          'return'
        ),
        stdoutCode({
          id: 'pure-end',
          prompt: '> `walk(["east","east","east","south","south"])` → print `3,2`.',
          equals: '3,2',
          hidden: true,
          hints: hints(
            'east +x, west -x, south +y, north -y.',
            { level: 4, kind: 'assist', md: 'function walk(dirs) {\n  let x = 0, y = 0\n  for (const d of dirs) {\n    if (d === "east") x += 1\n    if (d === "west") x -= 1\n    if (d === "south") y += 1\n    if (d === "north") y -= 1\n  }\n  return { x, y }\n}\nconst p = walk(["east", "east", "east", "south", "south"])\nconsole.log(p.x + "," + p.y)\nmodule.exports = { walk }' }
          )
        })
      ]
    }),
    files: {
      'main.js': `function walk(dirs) {
  return { x: 0, y: 0 }
}
console.log("0,0")
module.exports = { walk }
`,
      'hidden.test.js': exportAssert(`assert.deepStrictEqual(m.walk(['west', 'north']), { x: -1, y: -1 })
assert.deepStrictEqual(m.walk([]), { x: 0, y: 0 })
`)
    }
  })

  out.push({
    doc: lesson({
      id: 'capstone-signal-ops',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Capstone: signal ops',
      skillIds: ['js.modules', 'js.test', 'js.node.fs'],
      estimatedMinutes: 40,
      creation: { id: 'signal-ops', step: 1, briefMd: 'walk(dirs) plus scrubLog(text) with three hidden tests.' },
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      blocks: [
        explain(
          '## Three files, one kit\n\n1. `walk.mjs` exports `walk(dirs)` → `{ x, y }` from the origin.\n2. `scrub.mjs` exports `scrubLog(text)` → unique trimmed sorted names.\n3. `main.mjs` imports both, prints `walk` of east×3+south×2 as `3,2`, then a space, then `scrubLog` of `b\\na\\nb` (`a\\nb`).\n\nWrite a short Why below: why `walk` is testable without the stage.'
        ),
        predict(
          'why-pure',
          'Hidden tests can check `walk` without `Player` because…',
          [
            { id: 'log', md: 'They parse stdout only' },
            { id: 'return', md: 'The function returns data' }
          ],
          'return'
        ),
        {
          type: 'code',
          id: 'capstone',
          engine: 'javascript',
          entry: 'main.mjs',
          promptMd: '> Print `3,2` then a newline then `a` newline `b`.',
          files: [
            { path: 'files/walk.mjs', role: 'edit' },
            { path: 'files/scrub.mjs', role: 'edit' },
            { path: 'files/main.mjs', role: 'edit' },
            { path: 'files/hidden.test.mjs', role: 'hidden-test' }
          ],
          checks: [
            { type: 'stdout', equals: '3,2\na\nb' },
            { type: 'js-assert' }
          ],
          hintLadder: hints(
            'walk increments x/y. scrubLog uses Set + sort.',
            {
              level: 4,
              kind: 'assist',
              md: `walk.mjs:
export function walk(dirs) {
  let x = 0, y = 0
  for (const d of dirs) {
    if (d === "east") x += 1
    if (d === "west") x -= 1
    if (d === "south") y += 1
    if (d === "north") y -= 1
  }
  return { x, y }
}
scrub.mjs:
export function scrubLog(text) {
  return [...new Set(String(text).split(/\\n/).map((s) => s.trim()).filter(Boolean))].sort().join("\\n")
}
main.mjs:
import { walk } from "./walk.mjs"
import { scrubLog } from "./scrub.mjs"
const p = walk(["east", "east", "east", "south", "south"])
console.log(p.x + "," + p.y)
console.log(scrubLog("b\\na\\nb"))`
            }
          )
        },
        reflect(
          'why-writeup',
          'In a few sentences: why can a test prove `walk` without looking at the fox? When would you still want the stage?'
        )
      ]
    }),
    files: {
      'walk.mjs': `export function walk(dirs) {
  return { x: 0, y: 0 }
}
`,
      'scrub.mjs': `export function scrubLog(text) {
  return text
}
`,
      'main.mjs': `console.log("0,0")
`,
      'hidden.test.mjs': `import assert from 'node:assert'
import { walk } from './walk.mjs'
import { scrubLog } from './scrub.mjs'
assert.deepStrictEqual(walk(['east', 'south']), { x: 1, y: 1 })
assert.strictEqual(scrubLog('b\\na\\nb\\n'), 'a\\nb')
assert.deepStrictEqual(walk([]), { x: 0, y: 0 })
`
    }
  })

  return out
}
