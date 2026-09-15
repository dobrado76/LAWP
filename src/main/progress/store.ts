import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import {
  attemptSchema,
  beatsBest,
  lessonEvidenceSchema,
  pickBest,
  type Attempt,
  type GradeRow,
  type LessonEvidence
} from '@shared/schemas/progress'
import { learnerDir } from '../learners/store'
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
  const filled = backfillFirstTries(ev)
  if (Object.keys(filled.firstTries).length !== Object.keys(ev.firstTries).length) {
    saveEvidence(learnerId, packId, lessonId, filled)
  }
  return filled
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
    grades: ev.grades
  }
  const wasDone = ev.status === 'checked' || ev.status === 'mastered'
  return lessonEvidenceSchema.parse({
    status: wasDone ? 'retrying' : 'not-started',
    taskRev: newRev,
    grades: [],
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

export function recordGrade(
  learnerId: string,
  packId: string,
  lessonId: string,
  taskRev: number,
  row: GradeRow,
  replaceLast: boolean,
  snapshot: unknown,
  misconceptionIds: string[] = []
): LessonEvidence {
  let ev = loadEvidence(learnerId, packId, lessonId, taskRev)
  if (replaceLast && ev.grades.length > 0) {
    ev.grades[ev.grades.length - 1] = row
  } else {
    ev.grades.push(row)
    if (ev.grades.length > MAX_GRADES) ev.grades = ev.grades.slice(-MAX_GRADES)
  }
  const best = pickBest(ev.grades.filter((g) => g.taskRev === taskRev))
  ev.best = best
  if (best && beatsBest({ ...row, score: best.score, assisted: best.assisted, taskRev: best.taskRev, attemptId: best.attemptId ?? row.attemptId, at: row.at, blockId: row.blockId, revealed: row.revealed, passed: row.passed }, ev.bestEver)) {
    ev.bestEver = best
  } else if (!ev.bestEver && best) {
    ev.bestEver = best
  }
  if (!ev.firstTries[row.blockId]) {
    ev.firstTries[row.blockId] = { passed: row.passed, score: row.score, attemptId: row.attemptId }
  }
  ev.currentGradeId = ev.grades.at(-1)?.attemptId
  ev.previousGradeId = ev.grades.length > 1 ? ev.grades.at(-2)?.attemptId : undefined
  if (row.passed) {
    ev.status = 'checked'
    ev.firstCheckedAt = ev.firstCheckedAt ?? row.at
    if (!row.assisted && !row.revealed) {
      ev.independentPass = true
      ev.status = 'mastered'
      ev.masteredAt = ev.masteredAt ?? row.at
    }
  } else if (ev.status === 'not-started') {
    ev.status = 'in-progress'
  }
  recordMisconceptions(ev, misconceptionIds)
  saveEvidence(learnerId, packId, lessonId, ev)
  const dir = snapshotDir(learnerId, packId, lessonId, row.attemptId)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'snapshot.json'), JSON.stringify(snapshot, null, 2), 'utf8')
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

export function saveCreation(learnerId: string, packId: string, creationId: string, world: unknown): string {
  const dir = join(learnerDir(learnerId), 'creations', packId, creationId)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'world.json'), JSON.stringify(world, null, 2), 'utf8')
  return dir
}

export function creationDir(learnerId: string, packId: string, creationId: string): string {
  return join(learnerDir(learnerId), 'creations', packId, creationId)
}
