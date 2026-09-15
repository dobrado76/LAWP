export type SubmissionFile = { path: string; contents: string }

export type SubmissionPayload = {
  runId?: string
  packId: string
  lessonId: string
  submissionId: string
  filesHash: string
  files: SubmissionFile[]
  answers: Record<string, unknown>
  /** Blocks the learner interacted with, for controls whose default can be right. */
  touched: string[]
}

export type SubmissionBlockOut = {
  blockId: string
  kind: 'check' | 'activity' | 'code'
  passed: boolean
  attempted: boolean
  required: 'pass' | 'attempt'
  misconceptionIds: string[]
}

export type SubmissionOut = {
  submissionId: string
  outcome: 'pass' | 'fail'
  filesHash: string
  unanswered: string[]
  blocks: SubmissionBlockOut[]
  score: number
  status: 'incomplete' | 'checked' | 'mastered'
  code?: {
    stdout: string
    stderr: string
    exitCode?: number
    timedOut: boolean
    world?: unknown
    commands?: unknown[]
    playFault?: string | null
    goalMet?: boolean
    constraintOk?: boolean
  }
  activity?: { world?: unknown; calcFault?: string | null; goalMet?: boolean; constraintOk?: boolean }
  compare?: { current?: { score: number }; previous?: { score: number }; best?: { score: number; assisted: boolean } }
}

/**
 * Stable content fingerprint of a submission. Renderer and main both call this
 * so a pass can be tied to the exact text that earned it.
 */
export function filesHash(files: SubmissionFile[]): string {
  const text = [...files]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((f) => `${f.path}\u0000${f.contents}`)
    .join('\u0001')
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0
    h2 = Math.imul(h2 + c + i, 2246822519) >>> 0
  }
  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`
}

/** Infrastructure trouble is not a wrong answer. */
export const INFRA_ERROR_CODES = new Set([
  'runner',
  'runner-timeout',
  'not-configured',
  'trust-required',
  'sandbox',
  'io'
])

export function isInfraError(code: string | undefined): boolean {
  return Boolean(code && INFRA_ERROR_CODES.has(code))
}
