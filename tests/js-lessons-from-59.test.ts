import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { CodeBlock } from '@main/runners/types'
import { EXPECTED } from './js-curriculum.test'

const root = mkdtempSync(join(tmpdir(), 'lawp-from-59-'))

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

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.javascript.foundations')
const FROM = 'tree-not-string'

function assistFiles(block: CodeBlock): { path: string; contents: string }[] {
  const hints = block.hintLadder ?? []
  const assist = [...hints].reverse().find((h) => h.kind === 'assist') ?? hints.at(-1)
  const md = assist?.md ?? ''
  const edits = block.files.filter((f) => f.role === 'edit')
  if (edits.length === 1) return [{ path: edits[0]!.path, contents: md }]
  const chunks = md.split(/(?=^[A-Za-z0-9._-]+\.(?:js|mjs):)/m).filter(Boolean)
  const out: { path: string; contents: string }[] = []
  for (const edit of edits) {
    const name = edit.path.replace(/^files\//, '')
    const hit = chunks.find((c) => c.startsWith(`${name}:`))
    if (hit) out.push({ path: edit.path, contents: hit.replace(/^[^\n]+:\s?/, '').replace(/^\n/, '') })
  }
  if (out.length) return out
  return edits.map((f, i) => ({ path: f.path, contents: i === edits.length - 1 ? md : '' }))
}

describe('javascript lessons from 59', () => {
  it('hidden tests do not redeclare assert', () => {
    const start = EXPECTED.indexOf(FROM)
    for (const id of EXPECTED.slice(start)) {
      const file = join(packRoot, 'lessons', id, 'files', 'hidden.test.js')
      let text = ''
      try {
        text = readFileSync(file, 'utf8')
      } catch {
        continue
      }
      const n = (text.match(/const assert = require\('assert'\)/g) ?? []).length
      expect(n, id).toBeLessThan(2)
    }
  })

  it('official assist hints pass hidden checks', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const start = EXPECTED.indexOf(FROM)
    expect(start).toBeGreaterThan(0)
    const failed: string[] = []
    for (const id of EXPECTED.slice(start)) {
      const raw = JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8')) as {
        blocks: Array<CodeBlock & { type: string }>
      }
      const block = raw.blocks.find((b) => b.type === 'code' || b.type === 'debug')
      if (!block) continue
      const files = assistFiles(block)
      const out = await executeCodeBlock(join(packRoot, 'lessons', id), block, files)
      if (!out.passed) {
        failed.push(
          `${id}: exit=${out.exitCode} timedOut=${out.timedOut} checks=${JSON.stringify(out.checks)} stderr=${out.stderr.slice(0, 400)} stdout=${out.stdout.slice(0, 120)}`
        )
      }
    }
    expect(failed, failed.join('\n\n')).toEqual([])
  }, 180_000)
})
