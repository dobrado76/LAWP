import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { beatsBest, pickBest, type GradeRow, type LessonEvidence } from '@shared/schemas/progress'

const root = mkdtempSync(join(tmpdir(), 'lawp-prog-'))

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
  iconPath: () => ''
}))

function row(partial: Partial<GradeRow> & { attemptId: string; score: number }): GradeRow {
  return {
    at: new Date().toISOString(),
    blockId: 'b',
    taskRev: 1,
    assisted: false,
    revealed: false,
    passed: partial.score === 1,
    ...partial
  }
}

describe('best and ledger rules', () => {
  it('pickBest prefers score then independence, not speed', () => {
    const best = pickBest([
      row({ attemptId: 'slow', score: 1, assisted: false }),
      row({ attemptId: 'fast-assist', score: 1, assisted: true })
    ])
    expect(best?.attemptId).toBe('slow')
    expect(beatsBest(row({ attemptId: 'x', score: 1, assisted: true }), best, true)).toBe(false)
  })

  it('taskRev bump archives and clears bestEver', async () => {
    const { applyTaskRevBump } = await import('@main/progress/store')
    const ev: LessonEvidence = {
      status: 'mastered',
      taskRev: 1,
      grades: [row({ attemptId: 'a', score: 1 })],
      independentPass: true,
      best: { score: 1, assisted: false, taskRev: 1, attemptId: 'a' },
      bestEver: { score: 1, assisted: false, taskRev: 1, attemptId: 'a' },
      misconceptionHits: [],
      firstTries: { b: { passed: true, score: 1, attemptId: 'a' } }
    }
    const next = applyTaskRevBump(ev, 2)
    expect(next.firstTries).toEqual({})
    expect(next.grades).toEqual([])
    expect(next.best).toBeUndefined()
    expect(next.bestEver).toBeUndefined()
    expect(next.independentPass).toBe(false)
    expect(next.prior?.['1']).toBeTruthy()
  })

  it('keeps grades when many log rows are appended and delete-last rebuilds best', async () => {
    const { recordGrade, resetProgress, loadEvidence, appendAttempt } = await import('@main/progress/store')
    const { resetSettingsCache } = await import('@main/settings/store')
    const { ensureDefaultLearner } = await import('@main/learners/store')
    resetSettingsCache()
    const learner = ensureDefaultLearner()
    for (let i = 0; i < 5; i++) {
      recordGrade(learner.id, 'p', 'l', 1, row({ attemptId: `g${i}`, score: i === 2 ? 1 : 0.2 }), false, {})
    }
    for (let i = 0; i < 12; i++) {
      appendAttempt(learner.id, 'p', 'l', {
        id: `log${i}`,
        runId: 'r',
        learnerId: learner.id,
        at: new Date().toISOString(),
        blockId: 'b',
        kind: 'run',
        taskRev: 1
      })
    }
    let ev = loadEvidence(learner.id, 'p', 'l', 1)
    expect(ev.grades.length).toBe(5)
    expect(ev.best?.attemptId).toBe('g2')
    appendAttempt(learner.id, 'p', 'l', {
      id: 'g2',
      runId: 'r',
      learnerId: learner.id,
      at: new Date().toISOString(),
      blockId: 'b',
      kind: 'grade',
      taskRev: 1
    })
    ev = resetProgress(learner.id, 'p', 'lesson', 'delete-last', { lessonId: 'l' }, 1) as LessonEvidence
    expect(ev.grades.some((g) => g.attemptId === 'g2')).toBe(false)
    expect(ev.best?.attemptId).not.toBe('g2')
  })

  it('keeps the first try after a later pass', async () => {
    const { recordGrade, loadEvidence } = await import('@main/progress/store')
    const { resetSettingsCache } = await import('@main/settings/store')
    const { ensureDefaultLearner } = await import('@main/learners/store')
    const { firstTryTally } = await import('@shared/schemas/progress')
    resetSettingsCache()
    const learner = ensureDefaultLearner()
    recordGrade(learner.id, 'p', 'first-try', 1, row({ attemptId: 'miss', score: 0 }), false, {})
    recordGrade(learner.id, 'p', 'first-try', 1, row({ attemptId: 'fix', score: 1 }), false, {})
    const ev = loadEvidence(learner.id, 'p', 'first-try', 1)
    expect(ev.best?.score).toBe(1)
    expect(ev.firstTries.b?.passed).toBe(false)
    expect(firstTryTally(ev.firstTries)).toEqual({ hits: 0, total: 1, score: 0 })
  })
})

describe('learner drafts', () => {
  it('saves, restores, and clears per lesson', async () => {
    const { resetSettingsCache } = await import('@main/settings/store')
    const { ensureDefaultLearner } = await import('@main/learners/store')
    const { saveDraft, loadDraft, clearDraft } = await import('@main/progress/drafts')
    const { resetProgress } = await import('@main/progress/store')
    resetSettingsCache()
    const learner = ensureDefaultLearner()
    saveDraft(learner.id, 'pack.a', 'lesson-1', [{ path: 'files/main.js', contents: 'Player.move("east")' }])
    expect(loadDraft(learner.id, 'pack.a', 'lesson-1').files[0]?.contents).toContain('east')
    expect(loadDraft(learner.id, 'pack.a', 'lesson-2').files).toEqual([])
    resetProgress(learner.id, 'pack.a', 'lesson', 'keep', { lessonId: 'lesson-1' }, 1)
    expect(loadDraft(learner.id, 'pack.a', 'lesson-1').files).toEqual([])
    saveDraft(learner.id, 'pack.a', 'lesson-1', [{ path: 'files/main.js', contents: 'x' }])
    clearDraft(learner.id, 'pack.a', 'lesson-1')
    expect(loadDraft(learner.id, 'pack.a', 'lesson-1').files).toEqual([])
  })
})
