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

export const lessonEvidenceSchema = z.object({
  status: z.enum(['not-started', 'in-progress', 'checked', 'mastered', 'retrying']),
  taskRev: z.number(),
  grades: z.array(gradeRowSchema).default([]),
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
  kind: z.enum(['run', 'grade', 'restart', 'activity']),
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
export type Attempt = z.infer<typeof attemptSchema>
export type BestValue = z.infer<typeof bestValueSchema>
export type FirstTry = z.infer<typeof firstTrySchema>

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
