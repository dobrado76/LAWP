import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { CodeBlock } from '@main/runners/types'
import type { WorldV1 } from '@shared/schemas/world'

const root = mkdtempSync(join(tmpdir(), 'lawp-run-'))

vi.mock('electron', () => ({
  app: {
    getPath: () => root,
    setPath: () => undefined,
    isPackaged: false,
    getAppPath: () => process.cwd(),
    getVersion: () => '0.2.0'
  }
}))

vi.mock('@main/paths', () => ({
  userDataRoot: () => root,
  learnersRoot: () => join(root, 'learners'),
  userPacksRoot: () => join(root, 'packs'),
  bundledPacksRoot: () => join(process.cwd(), 'resources', 'packs'),
  templatesRoot: () => join(process.cwd(), 'resources', 'templates'),
  playStubsRoot: () => join(process.cwd(), 'resources', 'play', 'stubs'),
  playRoot: () => join(process.cwd(), 'resources', 'play'),
  iconPath: () => ''
}))

function gridWorld(): WorldV1 {
  return {
    parts: [
      { id: 'fox', type: 'fox', props: { x: 0, y: 0, rot: 0 } },
      { id: 'beacon', type: 'beacon', props: { x: 3, y: 2 } }
    ],
    connections: [],
    actions: [],
    rules: [],
    view: { kind: 'grid', grid: { cols: 5, rows: 5 } }
  }
}

const onBeacon = {
  all: [
    { path: 'fox.x', op: 'eq' as const, value: 3 },
    { path: 'fox.y', op: 'eq' as const, value: 2 }
  ]
}

const playBlock = (): CodeBlock => ({
  type: 'code',
  id: 'reach',
  engine: 'javascript',
  entry: 'main.js',
  files: [{ path: 'files/main.js', role: 'edit', contents: '' }],
  checks: [],
  play: { api: 'player-v1', playerId: 'fox', world: gridWorld(), goal: onBeacon }
})

const walk =
  'Player.move("east")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("south")\nPlayer.move("south")\n'

describe('code run grading', () => {
  it('does not pass a play lesson that reaches the goal then throws', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const out = await executeCodeBlock(root, playBlock(), [
      { path: 'files/main.js', contents: `${walk}throw new Error("boom")\n` }
    ])
    expect(out.play?.goalMet).toBe(true)
    expect(out.exitCode).not.toBe(0)
    expect(out.passed).toBe(false)
    expect(out.stderr).toMatch(/boom/)
  })

  it('keeps Player in scope when a hidden test reloads main.js', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const block: CodeBlock = {
      ...playBlock(),
      files: [
        { path: 'files/main.js', role: 'edit', contents: '' },
        {
          path: 'files/hidden.test.js',
          role: 'hidden-test',
          contents: `const assert = require('assert')\nrequire('./main.js')\nconst log = JSON.parse(require('fs').readFileSync('play-log.json', 'utf8'))\nassert.ok(log.some((row) => row.op === 'move'))\n`
        }
      ],
      checks: [{ type: 'js-assert' }]
    }
    const out = await executeCodeBlock(root, block, [{ path: 'files/main.js', contents: walk }])
    expect(out.stderr).not.toMatch(/Player is not defined/)
    expect(out.passed).toBe(true)
  })

  it('passes a clean walk that exits 0', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const out = await executeCodeBlock(root, playBlock(), [{ path: 'files/main.js', contents: walk }])
    expect(out.exitCode).toBe(0)
    expect(out.play?.passed).toBe(true)
    expect(out.passed).toBe(true)
  })

  it('runs hidden js-assert after the learner entry', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const block: CodeBlock = {
      type: 'code',
      id: 'hidden',
      engine: 'javascript',
      entry: 'main.js',
      files: [
        { path: 'files/main.js', role: 'edit', contents: '' },
        {
          path: 'files/hidden.test.js',
          role: 'hidden-test',
          contents: `const assert = require('assert')\nconst { label } = require('./main.js')\nassert.strictEqual(label(), 'beacon')\n`
        }
      ],
      checks: [
        { type: 'stdout', equals: 'beacon' },
        { type: 'js-assert' }
      ]
    }
    const fail = await executeCodeBlock(root, block, [
      { path: 'files/main.js', contents: `function label() { return 'nope' }\nconsole.log(label())\nmodule.exports = { label }\n` }
    ])
    expect(fail.passed).toBe(false)
    const ok = await executeCodeBlock(root, block, [
      { path: 'files/main.js', contents: `function label() { return 'beacon' }\nconsole.log(label())\nmodule.exports = { label }\n` }
    ])
    expect(ok.stdout.trim()).toBe('beacon')
    expect(ok.passed).toBe(true)
  })

  it('preview run keeps learner stdout and skips hidden-test stderr', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const block: CodeBlock = {
      type: 'code',
      id: 'hidden',
      engine: 'javascript',
      entry: 'main.js',
      files: [
        { path: 'files/main.js', role: 'edit', contents: '' },
        {
          path: 'files/hidden.test.js',
          role: 'hidden-test',
          contents: `const assert = require('assert')\nconst { label } = require('./main.js')\nassert.strictEqual(label(), 'beacon')\n`
        }
      ],
      checks: [{ type: 'js-assert' }]
    }
    const out = await executeCodeBlock(
      root,
      block,
      [{ path: 'files/main.js', contents: `function label() { return 'nope' }\nconsole.log('locked')\nmodule.exports = { label }\n` }],
      { grade: false }
    )
    expect(out.stdout.trim()).toBe('locked')
    expect(out.stderr).not.toMatch(/AssertionError/)
    expect(out.exitCode).toBe(0)
    expect(out.checks).toEqual([])
  })

  it('boots ESM import/export', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const block: CodeBlock = {
      type: 'code',
      id: 'esm',
      engine: 'javascript',
      entry: 'main.mjs',
      files: [
        { path: 'files/main.mjs', role: 'edit', contents: '' },
        {
          path: 'files/hidden.test.mjs',
          role: 'hidden-test',
          contents: `import assert from 'node:assert'\nimport { ping } from './main.mjs'\nassert.strictEqual(ping(), 'pong')\n`
        }
      ],
      checks: [
        { type: 'stdout', equals: 'pong' },
        { type: 'js-assert' }
      ]
    }
    const out = await executeCodeBlock(root, block, [
      { path: 'files/main.mjs', contents: `export function ping() { return 'pong' }\nconsole.log(ping())\n` }
    ])
    expect(out.passed).toBe(true)
  })

  it('mocks fetch from a fixture and honors abort', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const block: CodeBlock = {
      type: 'code',
      id: 'fetch',
      engine: 'javascript',
      entry: 'main.js',
      timeoutMs: 4000,
      files: [
        { path: 'files/main.js', role: 'edit', contents: '' },
        { path: 'files/beacons.json', role: 'fixture', contents: '{"ok":true}' },
        {
          path: 'files/routes.json',
          role: 'fixture',
          contents: JSON.stringify({ '/slow': { file: 'beacons.json', delayMs: 400 } })
        },
        {
          path: 'files/hidden.test.js',
          role: 'hidden-test',
          contents: `const assert = require('assert')\nconst { read } = require('./main.js')\nassert.ok(typeof read === 'function')\n`
        }
      ],
      checks: [
        { type: 'stdout', equals: 'true' },
        { type: 'js-assert' }
      ]
    }
    const out = await executeCodeBlock(root, block, [
      {
        path: 'files/main.js',
        contents: `async function read() {\n  const res = await fetch('/beacons.json')\n  const data = await res.json()\n  console.log(data.ok)\n  return data\n}\nread()\nmodule.exports = { read }\n`
      }
    ])
    expect(out.passed).toBe(true)
  })

  it('grades DOM fixtures in main with happy-dom', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const block: CodeBlock = {
      type: 'code',
      id: 'dom',
      engine: 'javascript',
      entry: 'main.js',
      preview: { kind: 'iframe' },
      files: [
        { path: 'files/index.html', role: 'fixture', contents: '<!doctype html><html><body><h1 id="t">old</h1></body></html>' },
        { path: 'files/main.js', role: 'edit', contents: '' },
        {
          path: 'files/hidden.test.js',
          role: 'hidden-test',
          contents: `assert.strictEqual(document.querySelector('#t').textContent, 'Beacon')\n`
        }
      ],
      checks: [{ type: 'js-assert' }]
    }
    const miss = await executeCodeBlock(root, block, [
      { path: 'files/main.js', contents: `document.querySelector('#t').textContent = 'nope'\n` }
    ])
    expect(miss.passed).toBe(false)
    const ok = await executeCodeBlock(root, block, [
      { path: 'files/main.js', contents: `document.querySelector('#t').textContent = 'Beacon'\n` }
    ])
    expect(ok.passed).toBe(true)
  })

  it('times out async DOM work that exceeds timeoutMs', async () => {
    const { runDomHarness } = await import('@main/runners/dom')
    const started = Date.now()
    const out = await runDomHarness(
      {
        type: 'code',
        id: 'slow',
        engine: 'javascript',
        entry: 'main.js',
        timeoutMs: 10,
        preview: { kind: 'iframe' },
        files: [
          { path: 'files/index.html', role: 'fixture', contents: '<!doctype html><html><body></body></html>' },
          { path: 'files/main.js', role: 'edit', contents: '' }
        ],
        checks: []
      },
      [
        { path: 'files/index.html', role: 'fixture', contents: '<!doctype html><html><body></body></html>' },
        { path: 'files/main.js', role: 'edit', contents: 'setTimeout(function () {}, 120)\n' }
      ]
    )
    expect(out.timedOut).toBe(true)
    expect(out.exitCode).toBe(124)
    expect(Date.now() - started).toBeLessThan(80)
  })
})
