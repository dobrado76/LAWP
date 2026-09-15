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
const FROM = 'js-placement'

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

type Raw = {
  blocks: Array<CodeBlock & { type: string; diagnostic?: boolean; play?: { world: unknown; goal: { all?: unknown[] } } }>
  mastery?: { requiresTransfer?: boolean }
  creation?: { id: string; step: number }
}

function lessonRaw(id: string): Raw {
  return JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8')) as Raw
}

function starterFiles(id: string, block: CodeBlock): { path: string; contents: string }[] {
  return block.files
    .filter((f) => f.role === 'edit')
    .map((f) => ({
      path: f.path,
      contents: f.contents ?? readFileSync(join(packRoot, 'lessons', id, f.path), 'utf8')
    }))
}

describe('javascript pack solutions', () => {
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
      const n = (text.match(/^const assert = require\('assert'\)/gm) ?? []).length
      expect(n, id).toBeLessThan(2)
    }
  })

  it('official assist hints pass hidden checks', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const start = EXPECTED.indexOf(FROM)
    expect(start).toBeGreaterThanOrEqual(0)
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

  it('every assessed starter fails its assessment while still running cleanly', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const alreadyDone: string[] = []
    const crashed: string[] = []
    const debugThatWorks: string[] = []
    for (const id of EXPECTED) {
      const raw = lessonRaw(id)
      const block = raw.blocks.find((b) => b.type === 'code' || b.type === 'debug')
      if (!block) continue
      const folder = join(packRoot, 'lessons', id)
      const files = starterFiles(id, block)
      const graded = await executeCodeBlock(folder, block, files)
      if (graded.passed) {
        ;(block.type === 'debug' ? debugThatWorks : alreadyDone).push(id)
        continue
      }
      // A broken debug lesson is allowed to throw. Nothing else is: pressing Run
      // on a fresh lesson should show an honest wrong answer, not a stack trace
      // the learner did not write. Hidden tests are off for that check.
      if (block.type === 'debug') continue
      const plain = await executeCodeBlock(folder, block, files, { grade: false })
      if (plain.exitCode !== 0 || plain.timedOut) {
        crashed.push(`${id}: exit=${plain.exitCode} timedOut=${plain.timedOut} stderr=${plain.stderr.slice(0, 200)}`)
      }
    }
    expect(alreadyDone, `starters that already pass: ${alreadyDone.join(', ')}`).toEqual([])
    expect(debugThatWorks, `debug lessons that are not broken: ${debugThatWorks.join(', ')}`).toEqual([])
    expect(crashed, crashed.join('\n')).toEqual([])
  }, 300_000)

  it('no play lesson opens with its objectives already ticked', async () => {
    const { evalProperty } = await import('@main/activities/world')
    const bad: string[] = []
    for (const id of EXPECTED) {
      for (const block of lessonRaw(id).blocks) {
        const goal = block.play?.goal
        const world = block.play?.world
        if (!goal?.all?.length || !world) continue
        const state = world as Parameters<typeof evalProperty>[0]
        const met = goal.all.filter((p) => evalProperty(state, p as Parameters<typeof evalProperty>[1]))
        if (met.length === goal.all.length) bad.push(`${id}: every objective already true`)
      }
    }
    expect(bad, bad.join('\n')).toEqual([])
  })

  it('teaches, asks, and offers a complete hint ladder', () => {
    const noExplain: string[] = []
    const noRetrieval: string[] = []
    const thinLadder: string[] = []
    for (const id of EXPECTED) {
      const raw = lessonRaw(id)
      const kinds = raw.blocks.map((b) => b.type)
      if (!kinds.includes('explain')) noExplain.push(id)
      if (!kinds.some((k) => k === 'check' || k === 'predict' || k === 'activity')) noRetrieval.push(id)
      for (const block of raw.blocks) {
        if (block.type !== 'code' && block.type !== 'debug') continue
        const levels = (block.hintLadder ?? []).map((h) => h.level).sort((a, b) => a - b)
        const contiguous = levels.every((lvl, i) => lvl === i + 1)
        const hasAssist = (block.hintLadder ?? []).some((h) => h.kind === 'assist')
        if (levels.length < 4 || !contiguous || !hasAssist) {
          thinLadder.push(`${id}/${block.id}: levels ${levels.join(',') || 'none'}`)
        }
      }
    }
    expect(noExplain, `lessons with no teaching: ${noExplain.join(', ')}`).toEqual([])
    expect(noRetrieval, `lessons that never ask anything: ${noRetrieval.join(', ')}`).toEqual([])
    expect(thinLadder, `incomplete hint ladders:\n${thinLadder.join('\n')}`).toEqual([])
  })

  it('keeps transfer and creation lessons labelled as such', () => {
    for (const id of EXPECTED.filter((l) => l.startsWith('transfer-'))) {
      expect(lessonRaw(id).mastery?.requiresTransfer, id).toBe(true)
    }
    for (const id of EXPECTED.filter((l) => l.startsWith('creation-'))) {
      expect(lessonRaw(id).creation?.id, id).toBeTruthy()
    }
  })
})
