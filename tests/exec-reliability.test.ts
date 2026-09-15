import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { CodeBlock } from '@main/runners/types'

const root = mkdtempSync(join(tmpdir(), 'lawp-exec-'))

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

const hiddenBlock = (): CodeBlock => ({
  type: 'code',
  id: 'task',
  engine: 'javascript',
  entry: 'main.js',
  timeoutMs: 8000,
  files: [
    { path: 'files/main.js', role: 'edit', contents: '' },
    {
      path: 'files/hidden.test.js',
      role: 'hidden-test',
      contents: "const assert = require('assert')\nassert.equal(1, 2, 'hidden marker')\n"
    }
  ],
  checks: [{ type: 'js-assert' }],
  hintLadder: []
})

const domBlock = (js: string, timeoutMs = 1500, hidden?: string): CodeBlock => ({
  type: 'code',
  id: 'page',
  engine: 'javascript',
  entry: 'main.js',
  timeoutMs,
  preview: { kind: 'iframe' },
  files: [
    { path: 'files/index.html', role: 'fixture', contents: '<!doctype html><html><body><ul id="list"></ul></body></html>' },
    { path: 'files/main.js', role: 'edit', contents: js },
    {
      path: 'files/hidden.test.js',
      role: 'hidden-test',
      contents: hidden ?? "assert.ok(document.querySelectorAll('#list li').length > 0, 'hidden marker')\n"
    }
  ],
  checks: [{ type: 'js-assert' }],
  hintLadder: []
})

describe('Run never grades', () => {
  it('skips hidden tests and reports no checks', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const files = [{ path: 'files/main.js', contents: 'console.log("hello")\n' }]
    const ran = await executeCodeBlock(root, hiddenBlock(), files, { grade: false })
    expect(ran.checks).toEqual([])
    expect(ran.stdout.trim()).toBe('hello')
    expect(ran.stderr).not.toMatch(/hidden marker/)
    expect(ran.exitCode).toBe(0)
    const graded = await executeCodeBlock(root, hiddenBlock(), files)
    expect(graded.passed).toBe(false)
    expect(graded.stderr).toMatch(/hidden marker/)
  }, 30_000)

  it('keeps hidden DOM assertions out of a plain preview run', async () => {
    const { runDomHarness } = await import('@main/runners/dom')
    const block = domBlock('document.getElementById("list")\n')
    const files = block.files.map((f) => ({ path: f.path, contents: f.contents ?? '', role: f.role }))
    const ran = await runDomHarness(block, files, { grade: false })
    expect(ran.exitCode).toBe(0)
    expect(ran.stderr).not.toMatch(/hidden marker/)
  }, 30_000)
})

describe('async DOM work has an overall deadline', () => {
  it('stops a page that never settles instead of hanging the submit', async () => {
    const { runDomHarness } = await import('@main/runners/dom')
    const block = domBlock('document.getElementById("list")\n', 900, 'await new Promise(() => {})\n')
    const files = block.files.map((f) => ({ path: f.path, contents: f.contents ?? '', role: f.role }))
    const started = Date.now()
    const ran = await runDomHarness(block, files)
    expect(ran.timedOut).toBe(true)
    expect(ran.exitCode).toBe(124)
    expect(Date.now() - started).toBeLessThan(8000)
  }, 30_000)
})

describe('drafts stay with their lesson', () => {
  it('refuses a save bound to another lesson and restores starters on restart', async () => {
    const { draftLessonKey, draftMatchesLesson, filesForLesson } = await import('@shared/draftBind')
    const key = draftLessonKey('pack.a', 'lesson-one')
    expect(draftMatchesLesson(key, 'pack.a', 'lesson-one')).toBe(true)
    expect(draftMatchesLesson(key, 'pack.a', 'lesson-two')).toBe(false)
    const starters = [{ path: 'files/main.js', contents: 'start\n' }]
    const draft = [{ path: 'files/main.js', contents: 'edited\n' }]
    expect(filesForLesson(starters, draft)).toEqual(draft)
    expect(filesForLesson(starters, draft, true)).toEqual(starters)
  })
})
