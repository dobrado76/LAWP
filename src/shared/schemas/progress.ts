import { z } from 'zod'

export const gradeRowSchema = z.object({
  attemptId: z.string(),
  at: z.string(),
  blockId: z.string(),
  taskRev: z.number(),
  score: z.number(),
  assisted: z.boolean(),
  revealed: z.boolean(),
  passed: z.boolean()
})

export const bestValueSchema = z.object({
  score: z.number(),
  assisted: z.boolean(),
  taskRev: z.number(),
  attemptId: z.string().optional()
})

export const firstTrySchema = z.object({
  passed: z.boolean(),
  score: z.number(),
  attemptId: z.string().optional()
})

/**
 * Durable per-block record. The grade ledger is trimmed, so completion and
 * mastery are read from here instead of from the surviving grade rows.
 */
export const blockStateSchema = z.object({
  taskRev: z.number(),
  attempted: z.boolean().default(false),
  passed: z.boolean().default(false),
  bestScore: z.number().default(0),
  assisted: z.boolean().default(false),
  independentPass: z.boolean().default(false),
  firstTryPassed: z.boolean().optional(),
  answer: z.unknown().optional(),
  passingFilesHash: z.string().optional(),
  at: z.string()
})

export const lessonEvidenceSchema = z.object({
  status: z.enum(['not-started', 'in-progress', 'checked', 'mastered', 'retrying']),
  taskRev: z.number(),
  grades: z.array(gradeRowSchema).default([]),
  blockState: z.record(blockStateSchema).default({}),
  currentScore: z.number().optional(),
  lastSubmissionId: z.string().optional(),
  firstCheckedAt: z.string().optional(),
  masteredAt: z.string().optional(),
  independentPass: z.boolean().default(false),
  best: bestValueSchema.optional(),
  bestEver: bestValueSchema.optional(),
  firstTries: z.record(firstTrySchema).default({}),
  prior: z.record(z.unknown()).optional(),
  fastest: z.object({ attemptId: z.string(), durationMs: z.number() }).optional(),
  previousGradeId: z.string().optional(),
  currentGradeId: z.string().optional(),
  misconceptionHits: z.array(z.object({ id: z.string(), count: z.number() })).default([])
})

export const attemptSchema = z.object({
  id: z.string(),
  runId: z.string(),
  learnerId: z.string(),
  at: z.string(),
  blockId: z.string(),
  kind: z.enum(['run', 'grade', 'restart', 'activity', 'skip']),
  taskRev: z.number(),
  passed: z.boolean().optional(),
  checksPassed: z.number().optional(),
  checksTotal: z.number().optional(),
  score: z.number().optional(),
  assisted: z.boolean().optional(),
  revealed: z.boolean().optional(),
  hintLevel: z.number().optional(),
  durationMs: z.number().optional(),
  timedOut: z.boolean().optional(),
  misconceptionIds: z.array(z.string()).optional(),
  snapshotId: z.string().optional()
})

export type GradeRow = z.infer<typeof gradeRowSchema>
export type LessonEvidence = z.infer<typeof lessonEvidenceSchema>
export type BlockState = z.infer<typeof blockStateSchema>
export type Attempt = z.infer<typeof attemptSchema>
export type BestValue = z.infer<typeof bestValueSchema>
export type FirstTry = z.infer<typeof firstTrySchema>

const GRADED_BLOCK_TYPES = new Set(['check', 'predict', 'code', 'debug', 'activity'])

export type LessonRequirements = {
  /** Must pass before the lesson is checked. */
  pass: string[]
  /** Must be answered, right or wrong. Placement questions live here. */
  attempt: string[]
}

/** Blocks that must pass before a lesson is checked or mastered. */
export function requiredBlockIds(blocks: { type?: string; id?: unknown }[] | undefined): string[] {
  const ids: string[] = []
  for (const b of blocks ?? []) {
    if (!GRADED_BLOCK_TYPES.has(String(b.type ?? ''))) continue
    const id = typeof b.id === 'string' ? b.id.trim() : ''
    if (id) ids.push(id)
  }
  return ids
}

/** A diagnostic question completes when it is answered; everything else must pass. */
export function lessonRequirements(
  blocks: { type?: string; id?: unknown; diagnostic?: unknown }[] | undefined
): LessonRequirements {
  const pass: string[] = []
  const attempt: string[] = []
  for (const b of blocks ?? []) {
    if (!GRADED_BLOCK_TYPES.has(String(b.type ?? ''))) continue
    const id = typeof b.id === 'string' ? b.id.trim() : ''
    if (!id) continue
    if (b.diagnostic === true) attempt.push(id)
    else pass.push(id)
  }
  return { pass, attempt }
}

/** Completion and mastery read durable block state, never the trimmed ledger. */
export function lessonCompletionFrom(
  state: Record<string, BlockState> | undefined,
  taskRev: number,
  required: LessonRequirements
): 'incomplete' | 'checked' | 'mastered' {
  const rows = state ?? {}
  if (!required.pass.length && !required.attempt.length) return 'incomplete'
  const here = (id: string): BlockState | undefined => {
    const row = rows[id]
    return row && row.taskRev === taskRev ? row : undefined
  }
  if (!required.pass.every((id) => here(id)?.passed)) return 'incomplete'
  if (!required.attempt.every((id) => here(id)?.attempted)) return 'incomplete'
  // A lesson made only of diagnostics is finished, but nothing was proven.
  if (required.pass.length && required.pass.every((id) => here(id)?.independentPass)) return 'mastered'
  return 'checked'
}

/** Share of required work passed in the current task revision. */
export function lessonScore(
  state: Record<string, BlockState> | undefined,
  taskRev: number,
  required: LessonRequirements
): number {
  const rows = state ?? {}
  const ids = [...required.pass, ...required.attempt]
  if (!ids.length) return 0
  let hits = 0
  for (const id of ids) {
    const row = rows[id]
    if (!row || row.taskRev !== taskRev) continue
    if (required.pass.includes(id) ? row.passed : row.attempted) hits += 1
  }
  return hits / ids.length
}

export function lessonCompletion(
  grades: GradeRow[],
  taskRev: number,
  required: string[]
): 'incomplete' | 'checked' | 'mastered' {
  if (!required.length) return 'incomplete'
  const latest = new Map<string, GradeRow>()
  for (const g of grades) {
    if (g.taskRev !== taskRev || !g.passed) continue
    latest.set(g.blockId, g)
  }
  if (!required.every((id) => latest.has(id))) return 'incomplete'
  if (required.every((id) => {
    const g = latest.get(id)
    return Boolean(g && !g.assisted && !g.revealed)
  })) {
    return 'mastered'
  }
  return 'checked'
}

/** One-time rebuild for evidence saved before durable block state existed. */
export function blockStateFromGrades(
  grades: GradeRow[],
  firstTries: Record<string, FirstTry> | undefined,
  taskRev: number
): Record<string, BlockState> {
  const out: Record<string, BlockState> = {}
  for (const g of grades) {
    if (g.taskRev !== taskRev) continue
    const prev = out[g.blockId]
    const independent = g.passed && !g.assisted && !g.revealed
    out[g.blockId] = {
      taskRev,
      attempted: true,
      passed: prev?.passed || g.passed,
      bestScore: Math.max(prev?.bestScore ?? 0, g.score),
      assisted: g.assisted,
      independentPass: prev?.independentPass || independent,
      firstTryPassed: prev?.firstTryPassed ?? firstTries?.[g.blockId]?.passed ?? g.passed,
      at: g.at
    }
  }
  return out
}

/** First submit per block. A later pass does not change this. */
export function firstTryTally(firstTries: Record<string, FirstTry> | undefined): { hits: number; total: number; score: number } {
  const rows = Object.values(firstTries ?? {})
  const hits = rows.filter((r) => r.passed).length
  const total = rows.length
  return { hits, total, score: total ? hits / total : 0 }
}

export function pickBest(grades: GradeRow[]): BestValue | undefined {
  if (grades.length === 0) return undefined
  const sorted = [...grades].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.assisted !== b.assisted) return a.assisted ? 1 : -1
    return 0
  })
  const g = sorted[0]
  if (!g) return undefined
  return { score: g.score, assisted: g.assisted, taskRev: g.taskRev, attemptId: g.attemptId }
}

export function beatsBest(next: GradeRow, current?: BestValue, speedMatters = false): boolean {
  if (!current) return true
  if (next.score !== current.score) return next.score > current.score
  if (next.assisted !== current.assisted) return !next.assisted
  void speedMatters
  return false
}
