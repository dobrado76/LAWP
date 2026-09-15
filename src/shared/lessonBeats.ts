export type LessonBeat = 'learn' | 'try'

const TEACH = new Set(['explain', 'reflect', 'check', 'predict'])
const PLAY = new Set(['code', 'debug', 'activity'])

/** Infer Learn then Try when a lesson both teaches and has a playable task. */
export function inferLessonBeats(blocks: { type: string }[]): LessonBeat[] {
  const hasTeach = blocks.some((b) => TEACH.has(b.type))
  const hasPlay = blocks.some((b) => PLAY.has(b.type))
  if (hasTeach && hasPlay) return ['learn', 'try']
  if (hasPlay) return ['try']
  return ['learn']
}
