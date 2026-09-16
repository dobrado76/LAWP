import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { CodeBlock } from '@main/runners/types'
import { AUTHORED } from './py-curriculum.test'

const root = mkdtempSync(join(tmpdir(), 'lawp-py-'))

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

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.python.foundations')

type Raw = { blocks: Array<CodeBlock & { type: string }> }

function lessonRaw(id: string): Raw {
  return JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8')) as Raw
}

/** The level-4 assist rung is the whole working file, so it can be pasted and run. */
function assistFiles(block: CodeBlock): { path: string; contents: string }[] {
  const hints = block.hintLadder ?? []
  const assist = [...hints].reverse().find((h) => h.kind === 'assist') ?? hints.at(-1)
  const edit = block.files.find((f) => f.role === 'edit')
  return edit ? [{ path: edit.path, contents: assist?.md ?? '' }] : []
}

function starterFiles(id: string, block: CodeBlock): { path: string; contents: string }[] {
  return block.files
    .filter((f) => f.role === 'edit')
    .map((f) => ({
      path: f.path,
      contents: f.contents ?? readFileSync(join(packRoot, 'lessons', id, f.path), 'utf8')
    }))
}

function codeBlocks(id: string): CodeBlock[] {
  return lessonRaw(id).blocks.filter((b) => b.type === 'code' || b.type === 'debug')
}

describe('python pack solutions', () => {
  it('official assist hints pass the hidden checks', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const failed: string[] = []
    for (const id of AUTHORED) {
      for (const block of codeBlocks(id)) {
        const out = await executeCodeBlock(join(packRoot, 'lessons', id), block, assistFiles(block))
        if (!out.passed) {
          failed.push(
            `${id}/${block.id}: exit=${out.exitCode} timedOut=${out.timedOut} checks=${JSON.stringify(
              out.checks
            )} stderr=${out.stderr.slice(0, 400)} stdout=${out.stdout.slice(0, 160)}`
          )
        }
      }
    }
    expect(failed, failed.join('\n\n')).toEqual([])
  }, 900_000)

  it('every assessed starter fails its assessment while still running cleanly', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const alreadyDone: string[] = []
    const crashed: string[] = []
    const debugThatWorks: string[] = []
    for (const id of AUTHORED) {
      for (const block of codeBlocks(id)) {
        const folder = join(packRoot, 'lessons', id)
        const files = starterFiles(id, block)
        const graded = await executeCodeBlock(folder, block, files)
        if (graded.passed) {
          ;(block.type === 'debug' ? debugThatWorks : alreadyDone).push(`${id}/${block.id}`)
          continue
        }
        // A broken debug lesson is allowed to raise. Nothing else is: pressing Run
        // on a fresh lesson should show an honest wrong answer, not a traceback the
        // learner did not write. Hidden tests are off for that check.
        if (block.type === 'debug') continue
        const plain = await executeCodeBlock(folder, block, files, { grade: false })
        if (plain.exitCode !== 0 || plain.timedOut) {
          crashed.push(`${id}/${block.id}: exit=${plain.exitCode} stderr=${plain.stderr.slice(0, 300)}`)
        }
      }
    }
    expect(alreadyDone, `starters that already pass: ${alreadyDone.join(', ')}`).toEqual([])
    expect(debugThatWorks, `debug lessons that are not broken: ${debugThatWorks.join(', ')}`).toEqual([])
    expect(crashed, crashed.join('\n')).toEqual([])
  }, 900_000)
})
