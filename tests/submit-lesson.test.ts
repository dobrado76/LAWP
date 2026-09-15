import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { filesHash, isInfraError, type SubmissionPayload } from '@shared/submission'

const root = mkdtempSync(join(tmpdir(), 'lawp-submit-'))
const bundled = join(root, 'bundled')

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
  bundledPacksRoot: () => bundled,
  templatesRoot: () => join(process.cwd(), 'resources', 'templates'),
  playStubsRoot: () => join(process.cwd(), 'resources', 'play', 'stubs'),
  playRoot: () => join(process.cwd(), 'resources', 'play'),
  iconPath: () => ''
}))

const PACK = 'submit.pack'

function seed(): void {
  const pack = join(bundled, PACK)
  mkdirSync(join(pack, 'lessons', 'mixed', 'files'), { recursive: true })
  mkdirSync(join(pack, 'lessons', 'placement'), { recursive: true })
  mkdirSync(join(pack, 'lessons', 'slow', 'files'), { recursive: true })
  writeFileSync(
    join(pack, 'pack.json'),
    JSON.stringify({
      kind: 'pack',
      schemaVersion: 1,
      id: PACK,
      title: 'Submit',
      engines: ['javascript'],
      capabilities: { execute: 'javascript', network: false },
      tracks: []
    })
  )
  writeFileSync(
    join(pack, 'lessons', 'mixed', 'lesson.json'),
    JSON.stringify({
      kind: 'lesson',
      schemaVersion: 1,
      id: 'mixed',
      packId: PACK,
      title: 'Question plus code',
      estimatedMinutes: 5,
      taskRev: 1,
      blocks: [
        { type: 'explain', md: 'Read this.' },
        {
          type: 'check',
          id: 'q1',
          kind: 'mcq',
          promptMd: 'Pick two',
          choices: [
            { id: 'one', md: '1' },
            { id: 'two', md: '2' }
          ],
          answer: 'two'
        },
        {
          type: 'code',
          id: 'task',
          engine: 'javascript',
          entry: 'main.js',
          promptMd: 'Print ready',
          files: [{ path: 'files/main.js', role: 'edit' }],
          checks: [{ type: 'stdout', equals: 'ready' }]
        }
      ]
    })
  )
  writeFileSync(join(pack, 'lessons', 'mixed', 'files', 'main.js'), 'console.log("not yet")\n')
  writeFileSync(
    join(pack, 'lessons', 'placement', 'lesson.json'),
    JSON.stringify({
      kind: 'lesson',
      schemaVersion: 1,
      id: 'placement',
      packId: PACK,
      title: 'Placement',
      estimatedMinutes: 2,
      taskRev: 1,
      blocks: [
        {
          type: 'check',
          id: 'd1',
          kind: 'mcq',
          diagnostic: true,
          promptMd: 'Where are you?',
          choices: [
            { id: 'new', md: 'New' },
            { id: 'old', md: 'Old' }
          ],
          answer: 'old'
        }
      ]
    })
  )
  writeFileSync(
    join(pack, 'lessons', 'slow', 'lesson.json'),
    JSON.stringify({
      kind: 'lesson',
      schemaVersion: 1,
      id: 'slow',
      packId: PACK,
      title: 'Never finishes',
      estimatedMinutes: 2,
      taskRev: 1,
      blocks: [
        {
          type: 'code',
          id: 'loop',
          engine: 'javascript',
          entry: 'main.js',
          timeoutMs: 1200,
          promptMd: 'Loops forever',
          files: [{ path: 'files/main.js', role: 'edit' }],
          checks: [{ type: 'stdout', equals: 'done' }]
        }
      ]
    })
  )
  writeFileSync(join(pack, 'lessons', 'slow', 'files', 'main.js'), 'while (true) {}\n')
}

function payload(lessonId: string, over: Partial<SubmissionPayload> = {}): SubmissionPayload {
  const files = over.files ?? []
  return {
    packId: PACK,
    lessonId,
    submissionId: `sub-${Math.random().toString(16).slice(2)}`,
    filesHash: filesHash(files),
    files,
    answers: {},
    touched: [],
    ...over
  }
}

let learnerId = ''

beforeAll(async () => {
  seed()
  const { resetSettingsCache } = await import('@main/settings/store')
  const { ensureDefaultLearner } = await import('@main/learners/store')
  resetSettingsCache()
  learnerId = ensureDefaultLearner().id
})

describe('atomic submit', () => {
  it('grades every required block in one commit, not just the first', async () => {
    const { submitLesson } = await import('@main/grading/submit')
    const { loadEvidence } = await import('@main/progress/store')
    const files = [{ path: 'files/main.js', contents: 'console.log("nope")\n' }]
    const r = await submitLesson(learnerId, payload('mixed', { files, answers: { q1: 'two' }, touched: ['q1'] }))
    expect(r.outcome).toBe('fail')
    expect(r.blocks.map((b) => b.blockId).sort()).toEqual(['q1', 'task'])
    expect(r.blocks.find((b) => b.blockId === 'q1')?.passed).toBe(true)
    expect(r.blocks.find((b) => b.blockId === 'task')?.passed).toBe(false)
    const ev = loadEvidence(learnerId, PACK, 'mixed', 1)
    expect(ev.blockState.q1?.passed).toBe(true)
    expect(ev.blockState.task?.passed).toBe(false)
    expect(ev.status).toBe('in-progress')
  }, 30_000)

  it('passes the lesson only when the question and the code both pass', async () => {
    const { submitLesson } = await import('@main/grading/submit')
    const { loadEvidence } = await import('@main/progress/store')
    const files = [{ path: 'files/main.js', contents: 'console.log("ready")\n' }]
    const hash = filesHash(files)
    const r = await submitLesson(learnerId, payload('mixed', { files, answers: { q1: 'two' }, touched: ['q1'] }))
    expect(r.outcome).toBe('pass')
    expect(r.filesHash).toBe(hash)
    const ev = loadEvidence(learnerId, PACK, 'mixed', 1)
    expect(ev.status).toBe('mastered')
    expect(ev.blockState.task?.passingFilesHash).toBe(hash)
    expect(ev.currentScore).toBe(1)
  }, 30_000)

  it('ties the pass to the submitted text so later edits cannot inherit it', async () => {
    const { loadEvidence } = await import('@main/progress/store')
    const ev = loadEvidence(learnerId, PACK, 'mixed', 1)
    const edited = [{ path: 'files/main.js', contents: 'console.log("ready") // changed\n' }]
    expect(ev.blockState.task?.passingFilesHash).not.toBe(filesHash(edited))
  })

  it('runs one submission at a time per learner and lesson', async () => {
    const { submitLesson } = await import('@main/grading/submit')
    const inFlight = new Map<string, Promise<unknown>>()
    const key = `${learnerId}|${PACK}|mixed`
    const files = [{ path: 'files/main.js', contents: 'console.log("ready")\n' }]
    const start = () => {
      const running = inFlight.get(key)
      if (running) return running
      const job = submitLesson(learnerId, payload('mixed', { files, answers: { q1: 'two' }, touched: ['q1'] })).finally(
        () => inFlight.delete(key)
      )
      inFlight.set(key, job)
      return job
    }
    const first = start()
    const second = start()
    expect(second).toBe(first)
    await first
  }, 30_000)

  it('reports a runner timeout as infrastructure trouble and records no grade', async () => {
    const { submitLesson } = await import('@main/grading/submit')
    const { loadEvidence } = await import('@main/progress/store')
    const files = [{ path: 'files/main.js', contents: 'while (true) {}\n' }]
    let code = ''
    await submitLesson(learnerId, payload('slow', { files })).catch((e: { code?: string }) => {
      code = e.code ?? ''
    })
    expect(code).toBe('runner-timeout')
    expect(isInfraError(code)).toBe(true)
    const ev = loadEvidence(learnerId, PACK, 'slow', 1)
    expect(ev.grades).toEqual([])
    expect(ev.blockState).toEqual({})
    expect(ev.status).toBe('not-started')
  }, 30_000)
})

describe('diagnostic blocks', () => {
  it('completes when answered, even wrongly, and keeps the answer for revisits', async () => {
    const { submitLesson } = await import('@main/grading/submit')
    const { loadEvidence } = await import('@main/progress/store')
    const r = await submitLesson(learnerId, payload('placement', { answers: { d1: 'new' }, touched: ['d1'] }))
    expect(r.outcome).toBe('pass')
    expect(r.blocks[0]?.passed).toBe(false)
    expect(r.blocks[0]?.required).toBe('attempt')
    const ev = loadEvidence(learnerId, PACK, 'placement', 1)
    expect(ev.blockState.d1?.attempted).toBe(true)
    expect(ev.blockState.d1?.passed).toBe(false)
    expect(ev.blockState.d1?.answer).toBe('new')
    expect(ev.status).toBe('checked')
  })

  it('does not complete while the question is untouched', async () => {
    const { submitLesson } = await import('@main/grading/submit')
    const r = await submitLesson(learnerId, payload('placement', { answers: { d1: '' } }))
    expect(r.unanswered).toEqual(['d1'])
    expect(r.outcome).toBe('fail')
  })
})
