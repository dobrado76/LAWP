import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import {
  attemptSchema,
  beatsBest,
  blockStateFromGrades,
  lessonEvidenceSchema,
  lessonCompletionFrom,
  lessonScore,
  pickBest,
  type Attempt,
  type BlockState,
  type GradeRow,
  type LessonEvidence,
  type LessonRequirements
} from '@shared/schemas/progress'
import { learnerDir } from '../learners/store'
import { safeJoin } from '../security/paths'
import { clearDraft, clearPackDrafts } from './drafts'

const MAX_ATTEMPTS = 200
const MAX_GRADES = 50

function evidencePath(learnerId: string, packId: string, lessonId: string): string {
  return join(learnerDir(learnerId), 'progress', packId, 'evidence', `${lessonId}.json`)
}

function attemptsPath(learnerId: string, packId: string, lessonId: string): string {
  return join(learnerDir(learnerId), 'progress', packId, 'attempts', `${lessonId}.json`)
}

function snapshotDir(learnerId: string, packId: string, lessonId: string, attemptId: string): string {
  return join(learnerDir(learnerId), 'snapshots', packId, lessonId, attemptId)
}

function readJson<T>(path: string, fallback: T): T {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    /* fallback */
  }
  return fallback
}

function writeJson(path: string, data: unknown): void {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

export function loadEvidence(learnerId: string, packId: string, lessonId: string, taskRev: number): LessonEvidence {
  const raw = readJson(evidencePath(learnerId, packId, lessonId), null)
  if (!raw) {
    return lessonEvidenceSchema.parse({ status: 'not-started', taskRev, grades: [] })
  }
  let ev = lessonEvidenceSchema.parse(raw)
  if (ev.taskRev !== taskRev) {
    ev = applyTaskRevBump(ev, taskRev)
    saveEvidence(learnerId, packId, lessonId, ev)
    return ev
  }
  const filled = backfillBlockState(backfillFirstTries(ev))
  if (
    Object.keys(filled.firstTries).length !== Object.keys(ev.firstTries).length ||
    Object.keys(filled.blockState).length !== Object.keys(ev.blockState).length
  ) {
    saveEvidence(learnerId, packId, lessonId, filled)
  }
  return filled
}

/** Evidence written before durable block state existed still has its passes. */
function backfillBlockState(ev: LessonEvidence): LessonEvidence {
  if (Object.keys(ev.blockState).length || !ev.grades.length) return ev
  return { ...ev, blockState: blockStateFromGrades(ev.grades, ev.firstTries, ev.taskRev) }
}

function backfillFirstTries(ev: LessonEvidence): LessonEvidence {
  if (Object.keys(ev.firstTries).length) return ev
  const oldest = [...ev.grades].sort((a, b) => a.at.localeCompare(b.at))
  const firstTries = { ...ev.firstTries }
  for (const g of oldest) {
    if (!firstTries[g.blockId]) {
      firstTries[g.blockId] = { passed: g.passed, score: g.score, attemptId: g.attemptId }
    }
  }
  return { ...ev, firstTries }
}

export function applyTaskRevBump(ev: LessonEvidence, newRev: number): LessonEvidence {
  const prior = { ...(ev.prior ?? {}) }
  prior[String(ev.taskRev)] = {
    taskRev: ev.taskRev,
    best: ev.best,
    bestEver: ev.bestEver,
    fastest: ev.fastest,
    independentPass: ev.independentPass,
    masteredAt: ev.masteredAt,
    firstCheckedAt: ev.firstCheckedAt,
    firstTries: ev.firstTries,
    blockState: ev.blockState,
    grades: ev.grades
  }
  const wasDone = ev.status === 'checked' || ev.status === 'mastered'
  return lessonEvidenceSchema.parse({
    status: wasDone ? 'retrying' : 'not-started',
    taskRev: newRev,
    grades: [],
    blockState: {},
    independentPass: false,
    firstTries: {},
    prior
  })
}

export function saveEvidence(learnerId: string, packId: string, lessonId: string, ev: LessonEvidence): void {
  writeJson(evidencePath(learnerId, packId, lessonId), ev)
}

export function loadAttempts(learnerId: string, packId: string, lessonId: string): Attempt[] {
  const raw = readJson<unknown>(attemptsPath(learnerId, packId, lessonId), { attempts: [] })
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { attempts?: unknown }).attempts)
      ? (raw as { attempts: unknown[] }).attempts
      : []
  return list.map((a) => attemptSchema.parse(a))
}

export function saveAttempts(learnerId: string, packId: string, lessonId: string, attempts: Attempt[]): void {
  const trimmed = attempts.slice(-MAX_ATTEMPTS)
  writeJson(attemptsPath(learnerId, packId, lessonId), { attempts: trimmed, truncated: attempts.length > MAX_ATTEMPTS })
}

export function appendAttempt(learnerId: string, packId: string, lessonId: string, attempt: Attempt): void {
  const list = loadAttempts(learnerId, packId, lessonId)
  list.push(attempt)
  saveAttempts(learnerId, packId, lessonId, list)
}

export function recordMisconceptions(
  ev: LessonEvidence,
  ids: string[]
): LessonEvidence {
  const hits = [...ev.misconceptionHits]
  for (const id of ids) {
    const row = hits.find((h) => h.id === id)
    if (row) row.count += 1
    else hits.push({ id, count: 1 })
  }
  ev.misconceptionHits = hits
  return ev
}

/** Bounded ledger append plus the durable block record that outlives it. */
function applyRow(
  ev: LessonEvidence,
  row: GradeRow,
  replaceLast: boolean,
  extra?: { attempted?: boolean; answer?: unknown; passingFilesHash?: string }
): void {
  if (replaceLast && ev.grades.length > 0) {
    ev.grades[ev.grades.length - 1] = row
  } else {
    ev.grades.push(row)
    if (ev.grades.length > MAX_GRADES) ev.grades = ev.grades.slice(-MAX_GRADES)
  }
  const prev = ev.blockState[row.blockId]
  const fresh = !prev || prev.taskRev !== row.taskRev
  const independent = row.passed && !row.assisted && !row.revealed
  const next: BlockState = {
    taskRev: row.taskRev,
    attempted: extra?.attempted ?? true,
    passed: (!fresh && prev!.passed) || row.passed,
    bestScore: Math.max(fresh ? 0 : prev!.bestScore, row.score),
    assisted: row.assisted,
    independentPass: (!fresh && prev!.independentPass) || independent,
    firstTryPassed: fresh ? row.passed : prev!.firstTryPassed ?? row.passed,
    at: row.at
  }
  const answer = extra?.answer
  if (answer !== undefined) next.answer = answer
  else if (!fresh && prev!.answer !== undefined) next.answer = prev!.answer
  const hash = row.passed ? extra?.passingFilesHash : undefined
  if (hash) next.passingFilesHash = hash
  else if (!fresh && prev!.passingFilesHash && !row.passed) next.passingFilesHash = prev!.passingFilesHash
  ev.blockState[row.blockId] = next
  if (!ev.firstTries[row.blockId]) {
    ev.firstTries[row.blockId] = { passed: row.passed, score: row.score, attemptId: row.attemptId }
  }
}

/** Score, completion, and mastery are three separate readings of the same state. */
function settle(ev: LessonEvidence, required: LessonRequirements, at: string): void {
  const best = pickBest(ev.grades.filter((g) => g.taskRev === ev.taskRev))
  const last = ev.grades.at(-1)
  ev.best = best
  if (
    best &&
    last &&
    beatsBest(
      {
        ...last,
        score: best.score,
        assisted: best.assisted,
        taskRev: best.taskRev,
        attemptId: best.attemptId ?? last.attemptId
      },
      ev.bestEver
    )
  ) {
    ev.bestEver = best
  } else if (!ev.bestEver && best) {
    ev.bestEver = best
  }
  ev.currentGradeId = ev.grades.at(-1)?.attemptId
  ev.previousGradeId = ev.grades.length > 1 ? ev.grades.at(-2)?.attemptId : undefined
  ev.currentScore = lessonScore(ev.blockState, ev.taskRev, required)
  const done = lessonCompletionFrom(ev.blockState, ev.taskRev, required)
  if (done === 'mastered') {
    ev.status = 'mastered'
    ev.independentPass = true
    ev.firstCheckedAt = ev.firstCheckedAt ?? at
    ev.masteredAt = ev.masteredAt ?? at
  } else if (done === 'checked') {
    if (ev.status !== 'mastered') ev.status = 'checked'
    ev.firstCheckedAt = ev.firstCheckedAt ?? at
  } else if (ev.status === 'not-started' || ev.status === 'retrying') {
    ev.status = 'in-progress'
  }
}

function writeSnapshot(learnerId: string, packId: string, lessonId: string, attemptId: string, snapshot: unknown): void {
  const dir = snapshotDir(learnerId, packId, lessonId, attemptId)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'snapshot.json'), JSON.stringify(snapshot, null, 2), 'utf8')
}

export function recordGrade(
  learnerId: string,
  packId: string,
  lessonId: string,
  taskRev: number,
  row: GradeRow,
  replaceLast: boolean,
  snapshot: unknown,
  misconceptionIds: string[] = [],
  requiredBlockIds: string[] = []
): LessonEvidence {
  const ev = loadEvidence(learnerId, packId, lessonId, taskRev)
  applyRow(ev, row, replaceLast)
  settle(ev, { pass: requiredBlockIds.length ? requiredBlockIds : [row.blockId], attempt: [] }, row.at)
  recordMisconceptions(ev, misconceptionIds)
  saveEvidence(learnerId, packId, lessonId, ev)
  writeSnapshot(learnerId, packId, lessonId, row.attemptId, snapshot)
  return ev
}

export type SubmissionBlockResult = {
  blockId: string
  passed: boolean
  score: number
  attempted: boolean
  assisted: boolean
  revealed: boolean
  answer?: unknown
  misconceptionIds?: string[]
}

/**
 * One submission, one commit. Every block result from a single Submit lands
 * together so evidence never shows half an attempt.
 */
export function recordSubmission(
  learnerId: string,
  packId: string,
  lessonId: string,
  taskRev: number,
  input: {
    submissionId: string
    at: string
    filesHash?: string
    results: SubmissionBlockResult[]
    required: LessonRequirements
    snapshot: unknown
  }
): LessonEvidence {
  const ev = loadEvidence(learnerId, packId, lessonId, taskRev)
  const misconceptions: string[] = []
  for (const r of input.results) {
    applyRow(
      ev,
      {
        attemptId: input.submissionId,
        at: input.at,
        blockId: r.blockId,
        taskRev,
        score: r.score,
        assisted: r.assisted,
        revealed: r.revealed,
        passed: r.passed
      },
      false,
      { attempted: r.attempted, answer: r.answer, passingFilesHash: input.filesHash }
    )
    misconceptions.push(...(r.misconceptionIds ?? []))
  }
  ev.lastSubmissionId = input.submissionId
  settle(ev, input.required, input.at)
  recordMisconceptions(ev, misconceptions)
  saveEvidence(learnerId, packId, lessonId, ev)
  writeSnapshot(learnerId, packId, lessonId, input.submissionId, input.snapshot)
  return ev
}

export function resetProgress(
  learnerId: string,
  packId: string,
  scope: 'block' | 'lesson' | 'module' | 'course' | 'pack',
  history: 'keep' | 'delete-last' | 'clear',
  ids: { lessonId?: string; blockId?: string },
  taskRev: number
): LessonEvidence | { ok: true } {
  if (scope === 'pack' && history === 'clear') {
    const root = join(learnerDir(learnerId), 'progress', packId)
    if (existsSync(root)) rmSync(root, { recursive: true, force: true })
    const snaps = join(learnerDir(learnerId), 'snapshots', packId)
    if (existsSync(snaps)) rmSync(snaps, { recursive: true, force: true })
    clearPackDrafts(learnerId, packId)
    return { ok: true }
  }
  const lessonId = ids.lessonId
  if (!lessonId) return { ok: true }
  if (history === 'keep') {
    clearDraft(learnerId, packId, lessonId)
    const ev = loadEvidence(learnerId, packId, lessonId, taskRev)
    ev.status = ev.status === 'not-started' ? 'not-started' : 'retrying'
    if (Object.keys(ev.blockState).length) {
      const prior = { ...(ev.prior ?? {}) }
      prior[`${taskRev}:restart:${new Date().toISOString()}`] = { blockState: ev.blockState }
      ev.prior = prior
      ev.blockState = {}
      ev.currentScore = 0
    }
    saveEvidence(learnerId, packId, lessonId, ev)
    appendAttempt(learnerId, packId, lessonId, {
      id: randomUUID(),
      runId: 'restart',
      learnerId,
      at: new Date().toISOString(),
      blockId: ids.blockId ?? lessonId,
      kind: 'restart',
      taskRev
    })
    return ev
  }
  if (history === 'delete-last') {
    const attempts = loadAttempts(learnerId, packId, lessonId)
    const last = attempts.pop()
    saveAttempts(learnerId, packId, lessonId, attempts)
    let ev = loadEvidence(learnerId, packId, lessonId, taskRev)
    if (last) {
      ev.grades = ev.grades.filter((g) => g.attemptId !== last.id)
    }
    ev.best = pickBest(ev.grades)
    if (ev.bestEver && last && ev.bestEver.attemptId === last.id) {
      ev.bestEver = pickBest(ev.grades)
    }
    ev.blockState = blockStateFromGrades(ev.grades, ev.firstTries, ev.taskRev)
    ev.currentGradeId = ev.grades.at(-1)?.attemptId
    ev.previousGradeId = ev.grades.length > 1 ? ev.grades.at(-2)?.attemptId : undefined
    saveEvidence(learnerId, packId, lessonId, ev)
    return ev
  }
  clearDraft(learnerId, packId, lessonId)
  const ev = lessonEvidenceSchema.parse({ status: 'not-started', taskRev, grades: [] })
  saveEvidence(learnerId, packId, lessonId, ev)
  saveAttempts(learnerId, packId, lessonId, [])
  return ev
}

export function loadSnapshot(learnerId: string, packId: string, lessonId: string, attemptId: string): unknown {
  const p = join(snapshotDir(learnerId, packId, lessonId, attemptId), 'snapshot.json')
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf8'))
}

export function packProgress(learnerId: string, packId: string, lessons: { id: string; taskRev: number }[]): Record<string, LessonEvidence> {
  const out: Record<string, LessonEvidence> = {}
  for (const l of lessons) {
    out[l.id] = loadEvidence(learnerId, packId, l.id, l.taskRev)
  }
  return out
}

export function saveCreation(
  learnerId: string,
  packId: string,
  creationId: string,
  payload: { files?: { path: string; contents: string }[]; world?: unknown; lessonId?: string }
): string {
  const dir = join(learnerDir(learnerId), 'creations', packId, creationId)
  mkdirSync(dir, { recursive: true })
  // The export is meant to be opened, read, and run — so the learner's own files
  // land as files, not as strings inside a wrapper.
  const written: string[] = []
  for (const file of payload.files ?? []) {
    const rel = file.path.replace(/^files\//, '')
    const target = safeJoin(dir, rel)
    if (!target) continue
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, file.contents, 'utf8')
    written.push(rel)
  }
  if (payload.world !== undefined) writeFileSync(join(dir, 'world.json'), JSON.stringify(payload.world, null, 2), 'utf8')
  writeFileSync(
    join(dir, 'creation.json'),
    JSON.stringify(
      {
        creationId,
        packId,
        lessonId: payload.lessonId,
        savedAt: new Date().toISOString(),
        files: written,
        hasWorld: payload.world !== undefined
      },
      null,
      2
    ),
    'utf8'
  )
  return dir
}

export function creationDir(learnerId: string, packId: string, creationId: string): string {
  return join(learnerDir(learnerId), 'creations', packId, creationId)
}
