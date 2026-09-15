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
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Flags the process already has\n\n`process.argv` is the command line as a list of strings. Index `0` is the Node program. Index `1` is the script path. After that come the flags you typed. This lesson already runs with `--scrub` on that list.\n\n`process.env` is a separate bag of names. `process.env.LAWP_FLAG` is set to `scrub` here. A missing name is `undefined`, not a fake heading.\n\nNight desk: the fox walk log is only cleaned when `--scrub` is on the list. Print `scrub` if that flag is present.'
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
        cloze(
          'argv-tail',
          'After `node` and the script path, `process.argv` holds your {{a}}. `process.env.LAWP_FLAG` is an {{b}} value.',
          [
            { id: 'a', choices: ['flags', 'file bytes', 'hidden tests'] },
            { id: 'b', choices: ['environment', 'argv index', 'stdout line'] }
          ],
          { a: 'flags', b: 'environment' },
          { explainMd: 'argv is the command line. env is a separate bag. This run sets LAWP_FLAG and passes --scrub.' }
        ),
        stdoutCode({
          id: 'read-flag',
          prompt: '> If `process.argv` includes `--scrub`, print `scrub`.',
          equals: 'scrub',
          argv: ['--scrub'],
          env: { LAWP_FLAG: 'scrub' },
          hidden: true,
          hints: ladder(
            'The runner already passed `--scrub`. Look at `process.argv`, not a hardcoded string.',
            '`includes` tells you whether that flag is on the list.',
            'process.argv.includes("--scrub") ? "scrub" : "none"',
            'function flag() {\n  return process.argv.includes("--scrub") ? "scrub" : "none"\n}\nconsole.log(flag())\nmodule.exports = { flag }'
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
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Files stay under the run folder\n\n`fs.readFileSync("note.txt", "utf8")` reads the fixture as text. Without `"utf8"` you get a Buffer of bytes. `fs.writeFileSync("out.txt", text)` writes a sibling file in the same folder.\n\nTrim the extra newline. The note is one heading: `north`. Export `readNote` so a hidden test can call it and then open `out.txt`.\n\nThe desk copies the fox walk slip from `note.txt` into `out.txt` so morning shift can open it without guessing.'
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
        tf(
          'write-sibling',
          '`writeFileSync("out.txt", text)` writes next to the fixture, not into a random system folder.',
          true,
          { explainMd: 'Both names are relative to the run folder. You read note.txt and write out.txt beside it.' }
        ),
        stdoutCode({
          id: 'read-note',
          prompt: '> Read `note.txt` as UTF-8, trim, print it. Also write the same text to `out.txt`.',
          equals: 'north',
          hidden: true,
          extraFiles: [{ path: 'files/note.txt', role: 'fixture' }],
          hints: ladder(
            'Read the fixture as text, then write the same trimmed string.',
            '`trim()` drops the leftover newline so the print is just `north`.',
            'fs.readFileSync("note.txt", "utf8").trim()',
            'const fs = require("fs")\nfunction readNote() {\n  const text = fs.readFileSync("note.txt", "utf8").trim()\n  fs.writeFileSync("out.txt", text)\n  return text\n}\nconsole.log(readNote())\nmodule.exports = { readNote }'
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
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Join names, do not climb out\n\n`path.join("logs", "today.txt")` builds a path for *this* folder. It puts the right slash for the machine. It does not check whether the second name is a trick.\n\n`..` means go up one folder. A careless join of `"logs"` and `"../secret"` can point outside `logs`. `safeJoin("logs", name)` must throw if `name` includes `..`.\n\nThe log scrubber only opens files under `logs/`. A heading named `../secret` is not a log — refuse it.'
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
        tf(
          'join-jail',
          '`path.join` by itself blocks `..` and keeps you inside the folder.',
          false,
          {
            misconceptionId: 'path-dotdot-ok',
            explainMd: 'join glues names. You must refuse .. yourself before you open the path.'
          }
        ),
        stdoutCode({
          id: 'safe-join',
          prompt: '> `safeJoin("logs", "a.txt")` prints `logs/a.txt` or `logs\\\\a.txt`. Hidden: `..` throws.',
          pattern: 'logs[\\\\/]a\\.txt',
          hidden: true,
          hints: ladder(
            'Join the root and the name. Check the name first.',
            'If `name` includes `..`, throw. Do not open that path.',
            'if (name.includes("..")) throw new Error("no")',
            'const path = require("path")\nfunction safeJoin(root, name) {\n  if (name.includes("..")) throw new Error("no")\n  return path.join(root, name)\n}\nconsole.log(safeJoin("logs", "a.txt"))\nmodule.exports = { safeJoin }'
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
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## A Buffer is bytes\n\n`Buffer.from("café", "utf8")` stores the UTF-8 bytes. `.toString("utf8")` turns those bytes back into text. `.length` on a Buffer is the byte count, not the number of letters you see.\n\nThe letter `é` is often two UTF-8 bytes. So `"café"` is 5 bytes: `c`, `a`, `f`, and two for `é`.\n\nA fox tag painted `café` on the desk is four letters on the glass and five bytes in the log file. Print that byte length (`5`).'
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
        cloze(
          'byte-vs-char',
          '`Buffer.byteLength` counts {{a}}. `"é"` in UTF-8 is typically {{b}} byte(s).',
          [
            { id: 'a', choices: ['bytes', 'letters on screen', 'argv flags'] },
            { id: 'b', choices: ['1', '2', '0'] }
          ],
          { a: 'bytes', b: '2' },
          { explainMd: 'Letters you see and bytes on disk are not the same count. café is 4 letters and 5 UTF-8 bytes.' }
        ),
        stdoutCode({
          id: 'byte-length',
          prompt: '> Print `Buffer.byteLength("café", "utf8")`.',
          equals: '5',
          ast: 'Buffer',
          hidden: true,
          hints: ladder(
            'Do not use `text.length` — that counts UTF-16 code units, not UTF-8 bytes.',
            '`Buffer.byteLength(text, "utf8")` is the disk size of the string.',
            'Buffer.byteLength(text, "utf8")',
            'function bytesOf(text) { return Buffer.byteLength(text, "utf8") }\nconsole.log(bytesOf("café"))\nmodule.exports = { bytesOf }'
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
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Chunks, not one giant string in your head\n\n`fs.createReadStream` fires `data` as pieces arrive. You collect those pieces, then join them when `end` fires. You do not assume the first chunk is the whole file.\n\nThis fixture is small. You still practice the API: collect, join, take the last non-empty line (`east`). The hidden test also checks that your source mentions `createReadStream`.\n\nThe night log drips in. The first line is `north`. The fox’s last heading is `east` — print that, not the first drip.'
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
        tf(
          'first-chunk-all',
          'The first `data` event means the whole file is already in memory.',
          false,
          { explainMd: 'data can fire more than once. end is the signal that no more chunks are coming.' }
        ),
        stdoutCode({
          id: 'stream-last',
          prompt: '> Stream `chunk-log.txt`, print the last trimmed line (`east`).',
          equals: 'east',
          hidden: true,
          extraFiles: [{ path: 'files/chunk-log.txt', role: 'fixture' }],
          hints: ladder(
            'Open a read stream on `chunk-log.txt`. Collect text as `data` fires.',
            'On `end`, split into lines and take the last non-empty one.',
            'Listen for data and end. Hidden wants createReadStream in the source.',
            'const fs = require("fs")\nfunction lastLine() {\n  return new Promise((resolve) => {\n    let raw = ""\n    const s = fs.createReadStream("chunk-log.txt", "utf8")\n    s.on("data", (c) => { raw += c })\n    s.on("end", () => {\n      const lines = raw.trim().split(/\\r?\\n/)\n      resolve(lines[lines.length - 1])\n    })\n  })\n}\nlastLine().then((v) => console.log(v))\nmodule.exports = { lastLine }'
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
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## Two module systems\n\n`require` and `module.exports` are CommonJS. `import` and `export` are ESM. Node treats a file as ESM when it ends in `.mjs` or when `package.json` says `"type": "module"`.\n\nStatic `import` is hoisted and resolved before the file runs. When a module is only sometimes needed — a rarely used tool, a heavy dependency — `await import(\"./tool.mjs\")` loads it on demand and resolves to the namespace.\n\nThis lesson is ESM. Export `ping` and print `pong`. Do not write `module.exports` here — the hidden test imports from `main.mjs`.\n\nThe desk’s walk helper ships as `.mjs` so the scrubber can `import { ping }` without a `require` dance.'
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
        cloze(
          'esm-when',
          'A {{a}} file is ESM. This lesson should {{b}} `ping`, not use `module.exports`.',
          [
            { id: 'a', choices: ['.mjs', '.json', '.txt'] },
            { id: 'b', choices: ['export', 'require', 'argv'] }
          ],
          { a: '.mjs', b: 'export' },
          { explainMd: 'Node picks ESM for .mjs. The hidden test is import { ping } from ./main.mjs.' }
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
          hintLadder: ladder(
            'This file is ESM. Use `export`, not `module.exports`.',
            '`ping` should return the string `pong`. Then print that result.',
            'export function ping() { return "pong" }',
            'export function ping() { return "pong" }\nconsole.log(ping())'
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
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## From callbacks to promises\n\nOld Node: `fs.readFile(path, (err, data) => …)`. The first argument is the error, or `null` when the read worked. New style: `await fs.promises.readFile(path, "utf8")` and `try/catch`.\n\nYou still read the same fixture. The promise version returns text instead of stuffing it into a callback. The source must mention `promises` so the habit is visible.\n\nThe desk used to check `err` first. Now the fox walk slip is awaited: read `note.txt`, trim, print `north`.'
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
        tf(
          'err-is-text',
          'In `fs.readFile(path, cb)`, the first callback argument is the file text.',
          false,
          { explainMd: 'Error first: err is argument 0. The bytes or text come second, and only if err is null.' }
        ),
        stdoutCode({
          id: 'promises-read',
          prompt: '> `async function load()` uses `fs.promises` to read `note.txt`. Print trimmed `north`.',
          equals: 'north',
          ast: 'promises',
          hidden: true,
          extraFiles: [{ path: 'files/note.txt', role: 'fixture' }],
          hints: ladder(
            '`load` is async. Read with `fs.promises`, not the callback form.',
            'Await the read, then `trim()` the text.',
            'await fs.promises.readFile("note.txt", "utf8")',
            'const fs = require("fs")\nasync function load() {\n  return (await fs.promises.readFile("note.txt", "utf8")).trim()\n}\nload().then((v) => console.log(v))\nmodule.exports = { load }'
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
      id: 'regex-lines',
      courseId: 'the-process',
      moduleId: 'style',
      title: 'Patterns over log lines',
      skillIds: ['js.text'],
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## A pattern is a tiny parser\n\nA log line looks like `[WARN]   beacon   down`. You want the level and the message, without the noise.\n\n- `/\\s+/` means one or more whitespace characters.\n- `^` and `$` anchor the pattern to the start and end of the line.\n- Parentheses **capture**: `/^\\[(\\w+)\\]\\s*(.*)$/` keeps the level in group 1 and the rest in group 2.\n- `exec` returns `null` when nothing matched, or an array whose slots 1 and 2 are those groups.\n\n`"a  b  c".replace(/\\s+/, " ")` fixes only the **first** run of spaces. Add the `g` flag — `/\\s+/g` — to fix every run. That missing `g` is the bug people ship most.\n\nRegex is for lines and fields. It is the wrong tool for HTML; you already have a document tree for that.'
        ),
        predict(
          'replace-one',
          '`"a  b  c".replace(/\\s+/, "-")` gives…',
          [
            { id: 'all', md: '`a-b-c`', misconceptionId: 'replace-replaces-all' },
            { id: 'first', md: '`a-b  c` — only the first run changed' },
            { id: 'none', md: '`a  b  c`' }
          ],
          'first'
        ),
        cloze(
          'pattern-parts',
          'In `/^\\[(\\w+)\\]\\s*(.*)$/`, the parentheses {{a}} that part of the match, and `^` {{b}}.',
          [
            { id: 'a', choices: ['capture', 'delete', 'repeat'] },
            { id: 'b', choices: ['anchors to the start', 'means not', 'matches a caret'] }
          ],
          { a: 'capture', b: 'anchors to the start' },
          { explainMd: 'Groups come back as slots 1, 2, … on the exec result. Anchors stop the pattern from matching in the middle of a longer line.' }
        ),
        tf(
          'exec-null',
          '`exec` throws when the line does not match the pattern.',
          false,
          { explainMd: 'It returns null. Check for null before reading the capture groups, or you will read a property of null.' }
        ),
        stdoutCode({
          id: 'tidy-line',
          prompt:
            '> `tidy(line)` turns `"[WARN]   beacon   down  "` into `"warn: beacon down"`. A line with no `[LEVEL]` tag gets the level `info`. Print `tidy("[WARN]   beacon   down  ")`.',
          equals: 'warn: beacon down',
          hidden: true,
          hints: ladder(
            'Two jobs: pull the level out of the brackets, and squeeze the runs of spaces in the message.',
            '`/^\\[(\\w+)\\]\\s*(.*)$/.exec(line)` gives you the level and the rest, or `null` when there is no tag.',
            'Collapse spacing with the global flag: `text.replace(/\\s+/g, " ").trim()`.',
            'function tidy(line) {\n  const match = /^\\[(\\w+)\\]\\s*(.*)$/.exec(line.trim())\n  const level = match ? match[1].toLowerCase() : "info"\n  const message = (match ? match[2] : line).replace(/\\s+/g, " ").trim()\n  return `${level}: ${message}`\n}\nconsole.log(tidy("[WARN]   beacon   down  "))\nmodule.exports = { tidy }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function tidy(line) {
  return line.trim().toLowerCase()
}
console.log(tidy("[WARN]   beacon   down  "))
module.exports = { tidy }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.tidy('[WARN]   beacon   down  '), 'warn: beacon down')
assert.strictEqual(m.tidy('[ERROR] lost'), 'error: lost')
assert.strictEqual(m.tidy('plain    message'), 'info: plain message')
assert.strictEqual(m.tidy('  [info]  ok  '), 'info: ok')
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
          '## Scrub a messy file\n\n`messy.txt` has blank lines, extra spaces, and the same name twice. `clean(text)` trims each line, drops empties, keeps each name once, then sorts.\n\nPrint the cleaned text. Unique sorted names: `east`, then `north`, then `west` on the last line. The hidden test will send a shorter list (`b`, `a`, `b`) and expect `a` then `b`.\n\nTwo `north` slips on the desk become one `north` line. The fox heading list should not repeat a name because someone typed it twice.'
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
        cloze(
          'clean-steps',
          'After trim and drop blanks, make names {{a}}, then {{b}} them.',
          [
            { id: 'a', choices: ['unique', 'uppercase', 'argv flags'] },
            { id: 'b', choices: ['sort', 'shuffle', 'buffer'] }
          ],
          { a: 'unique', b: 'sort' },
          { explainMd: 'Set keeps each name once. sort puts east before north before west.' }
        ),
        stdoutCode({
          id: 'clean-text',
          prompt: '> Clean `messy.txt` and print unique sorted names.',
          equals: 'east\nnorth\nwest',
          hidden: true,
          extraFiles: [{ path: 'files/messy.txt', role: 'fixture' }],
          hints: ladder(
            'Split the file into lines. Trim each line. Drop empty ones.',
            'A `Set` keeps each name once. Then sort and join with newlines.',
            'trim, filter Boolean, unique with Set, sort, join newlines.',
            'const fs = require("fs")\nfunction clean(text) {\n  const names = text.split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean)\n  return [...new Set(names)].sort().join("\\n")\n}\nconsole.log(clean(fs.readFileSync("messy.txt", "utf8")))\nmodule.exports = { clean }'
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
      estimatedMinutes: 24,
      creation: { id: 'log-scrubber', step: 1, briefMd: 'scrub(input, output) writes unique trimmed names.' },
      blocks: [
        explain(
          '## A tool you keep\n\n`scrub(input, output)` reads UTF-8 from `input`, cleans names the same way as the transfer lesson, and writes that text to `output`. The next program can open the file. Printing names is not enough.\n\nPrint `ok` after writing `clean.txt` from `messy.txt`. Reuse a `clean` helper if you want — the hidden test calls `scrub` and then reads the file it wrote.\n\nNight shift leaves `clean.txt` on the desk. Morning shift opens that file. They do not re-read the messy log.'
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
        tf(
          'scrub-must-write',
          '`scrub` must write a file, not only print the cleaned names.',
          true,
          { explainMd: 'Morning shift opens the output path. stdout is a notebook, not the kept list.' }
        ),
        stdoutCode({
          id: 'scrub-fn',
          prompt: '> `scrub("messy.txt", "clean.txt")` writes the clean list. Print `ok`.',
          equals: 'ok',
          hidden: true,
          extraFiles: [{ path: 'files/messy.txt', role: 'fixture' }],
          hints: ladder(
            'Read the input file as UTF-8. Clean it. Write the result to `output`.',
            'Cleaning is the same rules: trim, drop blanks, unique, sort.',
            'Reuse clean(), then writeFileSync.',
            'const fs = require("fs")\nfunction clean(text) {\n  const names = text.split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean)\n  return [...new Set(names)].sort().join("\\n")\n}\nfunction scrub(input, output) {\n  fs.writeFileSync(output, clean(fs.readFileSync(input, "utf8")))\n}\nscrub("messy.txt", "clean.txt")\nconsole.log("ok")\nmodule.exports = { clean, scrub }'
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
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## AAA on a route helper\n\n**Arrange** a list of dirs. **Act** by calling `walkLength`. **Assert** with `assert.strictEqual`. A failed assert throws. The process exits non-zero — it does not only print a sad line.\n\n`walkLength(["east", "south"])` is `2`. Print `pass` after your own assert in `main.js`. The hidden test also calls the function.\n\nThe fox walked two headings. A test that only `console.log`s `2` can lie. `assert` stops the run when the length is wrong.'
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
        tf(
          'assert-still-zero',
          'A failed `assert.strictEqual` only prints and the process still exits 0.',
          false,
          { explainMd: 'A thrown assert fails the process. That is how the grader knows the check did not hold.' }
        ),
        stdoutCode({
          id: 'aaa',
          prompt: '> Implement `walkLength`. Assert it. Print `pass`.',
          equals: 'pass',
          ast: 'assert',
          hidden: true,
          hints: ladder(
            '`walkLength` returns how many headings are in the list.',
            'Call `assert.strictEqual` on a case you know, then print `pass`.',
            'const assert = require("assert"); assert.strictEqual(walkLength(["east"]), 1)',
            'const assert = require("assert")\nfunction walkLength(dirs) { return dirs.length }\nassert.strictEqual(walkLength(["east", "south"]), 2)\nconsole.log("pass")\nmodule.exports = { walkLength }'
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
      estimatedMinutes: 22,
      blocks: [
        explain(
          '## You write a test the hidden runner also runs\n\n`cases.json` is a fixture: a list of `{ dirs, n }` records. Read that file and assert `walkLength` for each row. You do not type the cases into the test by hand if the file already holds them.\n\nPrint `ok` when every fixture case passes. A hidden test is a file you cannot edit. The grader runs it after your program.\n\nThe desk keeps walk lengths in `cases.json`. The fox route `["east"]` must be length `1` even when no one is watching the stage.'
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
        cloze(
          'fixture-role',
          'A fixture is a {{a}} the test reads. A hidden test is a file the {{b}} runs.',
          [
            { id: 'a', choices: ['data file', 'editor theme', 'bundler'] },
            { id: 'b', choices: ['grader', 'browser only', 'fox'] }
          ],
          { a: 'data file', b: 'grader' },
          { explainMd: 'cases.json holds the rows. The hidden test is extra proof you cannot rewrite.' }
        ),
        stdoutCode({
          id: 'fixture-cases',
          prompt: '> `walkLength` plus a loop over `cases.json`. Print `ok`.',
          equals: 'ok',
          hidden: true,
          extraFiles: [{ path: 'files/cases.json', role: 'fixture' }],
          hints: ladder(
            'Two jobs: make `walkLength` correct, and prove it against every row in `cases.json` rather than one example you typed.',
            'Read the fixture with `fs`, `JSON.parse` it, and assert `walkLength(c.dirs)` equals `c.n` for each row.',
            '`for (const c of rows) assert.strictEqual(walkLength(c.dirs), c.n)` fails loudly on the first bad row.',
            'const fs = require("fs")\nconst assert = require("assert")\nfunction walkLength(dirs) { return dirs.length }\nfor (const c of JSON.parse(fs.readFileSync("cases.json", "utf8"))) {\n  assert.strictEqual(walkLength(c.dirs), c.n)\n}\nconsole.log("ok")\nmodule.exports = { walkLength }'
          )
        })
      ]
    }),
    files: {
      'cases.json': `[{ "dirs": ["east"], "n": 1 }, { "dirs": ["east", "south"], "n": 2 }]\n`,
      'main.js': `function walkLength(dirs) {
  return 0
}
console.log("ok")
module.exports = { walkLength }
`,
      'hidden.test.js':
        exportAssert(`assert.strictEqual(m.walkLength(['a', 'b', 'c']), 3)
assert.strictEqual(m.walkLength([]), 0)
`) + srcIncludes('cases.json', 'assert')
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
          '## Do not wait on the real clock\n\n`report(deps)` should call `deps.clock()` and `deps.read("log.txt")`. In tests you pass `{ clock: () => 1000, read: () => "north" }`. You do not call `Date.now()` or `fs` inside `report`.\n\nPrint `1000 north`. The hidden test will pass a different clock and a different `read`. If you touch the real disk, that test cannot control the bytes.\n\nThe desk stamps a log with a fake noon so the fox walk test does not wait for a real midnight file.'
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
        tf(
          'report-hits-disk',
          '`report` should call `fs.readFileSync` so the test always hits the real disk.',
          false,
          { explainMd: 'Pass read in. The test supplies the bytes. report only concatenates clock() and that text.' }
        ),
        stdoutCode({
          id: 'inject-deps',
          prompt: '> `report({ clock, read })` prints `clock() + " " + read("log.txt")`. Use 1000 and north.',
          equals: '1000 north',
          hidden: true,
          hints: ladder(
            '`report` only talks to `deps`. It does not import `fs` or `Date`.',
            'Call `deps.clock()` and `deps.read("log.txt")`. Join them with a space.',
            'Do not call Date.now() or fs in report — use deps.',
            'function report(deps) {\n  return deps.clock() + " " + deps.read("log.txt")\n}\nconsole.log(report({ clock: () => 1000, read: () => "north" }))\nmodule.exports = { report }'
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
      estimatedMinutes: 16,
      blocks: [
        explain(
          '## The browser has no `require` of your files\n\nA page can load one script URL (or native ESM URLs you list). `require("./walker.js")` is a Node idea. The browser does not walk a folder of files the way Node does.\n\nA **bundler** follows your `import` graph and emits files the browser can load. This lesson does not run a bundler. It asks you to name the gap.\n\nThe fox walker lives in `walker.mjs`. On the desk, Node can `import` it. A plain page cannot `require` that folder unless you bundle or ship real ESM URLs.'
        ),
        predict(
          'bundle-why',
          'A bundler mainly exists because…',
          [
            { id: 'fashion', md: 'Minify is the only reason' },
            { id: 'load', md: 'The browser is not Node’s folder `require`' }
          ],
          'load'
        ),
        tf(
          'native-esm-gap',
          'You can also ship native ESM with import maps; the gap is still the loader, not fashion.',
          true,
          { explainMd: 'Minify is extra. The first problem is that the browser is not Node’s module loader.' }
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
          '## Two files\n\n`walker.mjs` exports `walkLength`. `main.mjs` imports that name and prints `2` for `["east", "south"]`. A named export is not a global. The other file must import it.\n\nKeep the function in `walker.mjs`. The hidden test imports `walkLength` from there, not from `main.mjs`.\n\nThe desk’s fox helper lives in one file. The night log printer lives in another. Sharing a name is an `export` / `import`, not a hope that both files see the same global.'
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
        tf(
          'export-is-global',
          '`export function walkLength` is automatically a global in every file.',
          false,
          { explainMd: 'main.mjs must import { walkLength } from "./walker.mjs". The hidden test does the same.' }
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
          hintLadder: ladder(
            'Put `walkLength` in `walker.mjs` and export it. Import it in `main.mjs`.',
            '`walkLength` returns `dirs.length`. Print that for east then south.',
            'import { walkLength } from "./walker.mjs"',
            'walker.mjs:\nexport function walkLength(dirs) { return dirs.length }\nmain.mjs:\nimport { walkLength } from "./walker.mjs"\nconsole.log(walkLength(["east", "south"]))'
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
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Refuse `==` in the edit file\n\nLAWP’s `ast` check is a **substring** search, not a real parser pass. Treat it as a stand-in for a linter. The file text must contain `===` and must not use `==`.\n\n`same(a, b)` compares with `===`. Print `false` for `0` and `""` — those are different kinds.\n\nThe desk once filed `0` (lamp off) as the same as a missing name `""` because someone wrote `==`. The fox route test uses `===` so off and missing stay different.'
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
        tf(
          'ast-is-eslint',
          'This lesson runs a full ESLint pass on your file.',
          false,
          { explainMd: 'The grader looks for === in the file text and rejects ==. That is a stand-in, not ESLint.' }
        ),
        stdoutCode({
          id: 'no-double',
          prompt: '> `same(0, "")` is false via `===`. Print `false`.',
          equals: 'false',
          ast: '===',
          hidden: true,
          hints: ladder(
            '`==` would treat `0` and `""` as the same. This lesson refuses that.',
            'Return `a === b`. Print `same(0, "")`.',
            'Use === only.',
            'function same(a, b) { return a === b }\nconsole.log(same(0, ""))\nmodule.exports = { same }'
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
          '## Do not merge untrusted keys onto Object.prototype\n\n`obj.__proto__` or a merge of `{ "__proto__": { polluted: true } }` can change **every** object. A JSON body from outside the desk is not a safe field list.\n\nSafe dictionaries: `Object.create(null)`, or copy **own** keys and skip `__proto__`, `constructor`, and `prototype`. `Object.freeze(Object.prototype)` is a belt.\n\n`safeMerge(target, src)` copies only those safe own keys. A fake heading `__proto__` in a fox log must not rewrite every object on the desk.'
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
        cloze(
          'skip-keys',
          'When merging untrusted objects, skip {{a}} and {{b}}.',
          [
            { id: 'a', choices: ['__proto__', 'name', 'dirs'] },
            { id: 'b', choices: ['constructor', 'east', 'utf8'] }
          ],
          { a: '__proto__', b: 'constructor' },
          { explainMd: 'Also skip prototype. Copy only ordinary own keys such as name onto a fresh object.' }
        ),
        stdoutCode({
          id: 'safe-merge',
          prompt: '> `safeMerge({}, { __proto__: { x: 1 }, name: "n" }).name` prints `n`. Hidden: prototype stays clean.',
          equals: 'n',
          hidden: true,
          hints: ladder(
            'Start from a fresh object. Copy own keys from `src` one at a time.',
            'Skip `__proto__`, `constructor`, and `prototype`. Keep `name`.',
            'Skip keys __proto__, constructor, prototype.',
            'function safeMerge(target, src) {\n  const out = Object.assign(Object.create(null), target)\n  for (const key of Object.keys(src)) {\n    if (key === "__proto__" || key === "constructor" || key === "prototype") continue\n    out[key] = src[key]\n  }\n  return out\n}\nconsole.log(safeMerge({}, { name: "n" }).name)\nmodule.exports = { safeMerge }'
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
      'hidden.test.js': exportAssert(`const target = { a: 1 }
const out = m.safeMerge(target, JSON.parse('{"__proto__":{"polluted":true},"name":"n"}'))
assert.strictEqual(out.name, 'n')
assert.strictEqual(out.a, 1)
assert.strictEqual({}.polluted, undefined)
assert.strictEqual(out.polluted, undefined, 'the merged object inherited a polluted prototype')
assert.strictEqual(Object.prototype.hasOwnProperty.call(out, '__proto__'), false)
m.safeMerge(target, { b: 2 })
assert.strictEqual(target.b, undefined, 'safeMerge must return a fresh object, not edit the target')
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
      estimatedMinutes: 20,
      blocks: [
        explain(
          '## Count the work before you rewrite it\n\nWall-clock timing with `Date.now()` is noisy: the same loop gives a different answer on every run. A **counted** measurement is reproducible, and it is usually the number you actually wanted — how much work does each approach do?\n\nTwo ways to look for duplicates in a list of `n` items:\n\n- Nested loops compare every pair: `n * (n - 1) / 2` comparisons.\n- A `Set` visits each item once: `n` steps.\n\nDo not take those formulas on faith. Run both, increment a counter inside each, and report what the counters say. For `n = 5` that is `loops:10 set:5`.\n\nThe desk counted before anyone rewrote the walker. Change the path once you have a number.'
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
        tf(
          'rewrite-on-feel',
          'You should rewrite a loop because it feels slow, even with no measurement.',
          false,
          { explainMd: 'Measure first. This lesson’s proof is the count 1000 from the loop you actually ran.' }
        ),
        stdoutCode({
          id: 'count-loop',
          prompt:
            '> `report(n)` builds a list of `n` items, runs both searches with a counter in each, and returns `loops:<pairs> set:<steps>`. Print `report(5)` (`loops:10 set:5`).',
          equals: 'loops:10 set:5',
          hidden: true,
          hints: ladder(
            'Two counters, two loops. Neither number should be written by hand — they must come out of the runs.',
            'The nested pass compares each item with the ones after it, so the inner loop starts at `i + 1`.',
            'The Set pass is one loop: add each item and increment the counter once per item.',
            'function report(n) {\n  const list = Array.from({ length: n }, (_, i) => i)\n  let pairs = 0\n  for (let i = 0; i < list.length; i++) {\n    for (let j = i + 1; j < list.length; j++) pairs += 1\n  }\n  let steps = 0\n  const seen = new Set()\n  for (const item of list) {\n    steps += 1\n    seen.add(item)\n  }\n  return `loops:${pairs} set:${steps}`\n}\nconsole.log(report(5))\nmodule.exports = { report }'
          )
        })
      ]
    }),
    files: {
      'main.js': `function report(n) {
  const list = Array.from({ length: n }, (_, i) => i)
  return "loops:0 set:0"
}
console.log(report(5))
module.exports = { report }
`,
      'hidden.test.js': exportAssert(`assert.strictEqual(m.report(5), 'loops:10 set:5')
assert.strictEqual(m.report(4), 'loops:6 set:4')
assert.strictEqual(m.report(1), 'loops:0 set:1')
assert.strictEqual(m.report(0), 'loops:0 set:0')
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
      estimatedMinutes: 18,
      blocks: [
        explain(
          '## `@param` / `@returns` are a contract you can read\n\nThis is not TypeScript-as-product. Write the tags so a later you (or a TS pack) can check them. Node does not enforce JSDoc at runtime.\n\n`/** @param {string[]} dirs @returns {number} */` above `walkLength`. Print the length of two dirs (`2`). The hidden test looks for `@param` and `@returns` in the file text.\n\nThe fox helper’s card on the desk lists what goes in and what comes out. A missing `@returns` is a missing promise to the next shift.'
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
        tf(
          'jsdoc-enforced',
          'JSDoc tags are enforced by Node when the function runs.',
          false,
          { explainMd: 'The tags are a contract you can read. This lesson’s grader only checks that the words are in the file.' }
        ),
        stdoutCode({
          id: 'jsdoc-fn',
          prompt: '> Document and implement `walkLength`. Print `2`.',
          equals: '2',
          ast: '@param',
          hidden: true,
          hints: ladder(
            'Keep `walkLength` returning `dirs.length`. Add a JSDoc block above it.',
            'The block needs `@param` and `@returns`. Node will not check the types for you.',
            'Put @param and @returns above the function.',
            '/** @param {string[]} dirs @returns {number} */\nfunction walkLength(dirs) { return dirs.length }\nconsole.log(walkLength(["east", "south"]))\nmodule.exports = { walkLength }'
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
          '## Do not look at stdout\n\n`walk(dirs)` returns the end `{ x, y }` starting from `{ x: 0, y: 0 }`. It must not call `Player`. Tests check the object. The stage is for seeing a fox, not for proving the math.\n\n`east` adds 1 to `x`. `west` subtracts 1 from `x`. `south` adds 1 to `y`. `north` subtracts 1 from `y`.\n\nPrint `3,2` for three east and two south. A hidden test will send `west` then `north` and expect `{ x: -1, y: -1 }`.'
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
        cloze(
          'walk-axes',
          '`east` adds 1 to {{a}}. `south` adds 1 to {{b}}.',
          [
            { id: 'a', choices: ['x', 'y', 'dirs.length'] },
            { id: 'b', choices: ['x', 'y', 'argv'] }
          ],
          { a: 'x', b: 'y' },
          { explainMd: 'Origin is 0,0. Three east and two south end at 3,2. west and north go negative.' }
        ),
        stdoutCode({
          id: 'pure-end',
          prompt: '> `walk(["east","east","east","south","south"])` → print `3,2`.',
          equals: '3,2',
          hidden: true,
          hints: ladder(
            'Start at `{ x: 0, y: 0 }`. Change `x` or `y` for each heading.',
            'Return the object. Print `x + "," + y` for the sample path.',
            'east +x, west -x, south +y, north -y.',
            'function walk(dirs) {\n  let x = 0, y = 0\n  for (const d of dirs) {\n    if (d === "east") x += 1\n    if (d === "west") x -= 1\n    if (d === "south") y += 1\n    if (d === "north") y -= 1\n  }\n  return { x, y }\n}\nconst p = walk(["east", "east", "east", "south", "south"])\nconsole.log(p.x + "," + p.y)\nmodule.exports = { walk }'
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
          '## Three files, one kit\n\n`walk.mjs` exports `walk(dirs)` → `{ x, y }` from the origin. `scrub.mjs` exports `scrubLog(text)` → unique trimmed sorted names. `main.mjs` imports both.\n\nPrint `walk` of east×3 + south×2 as `3,2`, then a newline, then `scrubLog` of `b\\na\\nb` (`a` then `b`). Hidden tests import those two modules. They do not parse your console art.\n\nThe desk ships a fox walker and a log scrubber as two files. Write a short Why below: why `walk` is testable without the stage.'
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
        tf(
          'walk-stdout-only',
          'Hidden tests can check `walk` only by parsing stdout, not by reading the returned object.',
          false,
          { explainMd: 'walk returns { x, y }. The hidden test imports it. stdout is just what main prints for you.' }
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
          hintLadder: ladder(
            'Three edit files: `walk.mjs`, `scrub.mjs`, `main.mjs`. Hidden tests import `walk` and `scrubLog`.',
            '`walk` increments x/y. `scrubLog` uses Set + sort. `main` prints walk, then scrubLog.',
            'east +x, west -x, south +y, north -y. Names: trim, drop blanks, unique, sort, join newlines.',
            `walk.mjs:
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
