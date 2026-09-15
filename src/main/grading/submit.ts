import { randomUUID } from 'node:crypto'
import { correctChoiceIds, gradeCheckAnswer, isAttemptedAnswer, type CheckPrompt } from '@shared/check'
import { activityBlockSchema, executableBlockSchema } from '@shared/schemas/lesson'
import { lessonRequirements } from '@shared/schemas/progress'
import { filesHash, type SubmissionBlockOut, type SubmissionOut, type SubmissionPayload } from '@shared/submission'
import { evalProperty } from '../activities/world'
import { getRun, gradeRunActivity, recordPlay, startRunRecord } from '../activities/runs'
import { lessonById, resolvePack } from '../packs/resolve'
import { appendAttempt, loadEvidence, recordSubmission, saveCreation, type SubmissionBlockResult } from '../progress/store'
import { executeCodeBlock } from '../runners/code'
import { assertCanSpawn } from '../runners/trust'
import type { CodeBlock } from '../runners/types'

type RawBlock = Record<string, unknown> & { type?: string; id?: string }

function infra(message: string, code = 'runner'): Error {
  return Object.assign(new Error(message), { code })
}

/**
 * Grades one frozen submission in a single pass and commits every block result
 * together. Nothing here reads live renderer state, so edits made while this
 * runs belong to the next submission, not this one.
 */
export async function submitLesson(learnerId: string, input: SubmissionPayload): Promise<SubmissionOut> {
  const pack = resolvePack(input.packId)
  const lesson = pack && lessonById(pack, input.lessonId)
  if (!pack || !lesson) throw Object.assign(new Error('Lesson not found'), { code: 'not-found' })

  const blocks = (lesson.raw.blocks ?? []) as RawBlock[]
  const required = lessonRequirements(blocks as { type?: string; id?: unknown; diagnostic?: unknown }[])
  const needed = new Set([...required.pass, ...required.attempt])
  const taskRev = lesson.raw.taskRev
  const at = new Date().toISOString()
  const hash = filesHash(input.files ?? [])

  let run = input.runId ? getRun(input.runId) : undefined
  if (!run) {
    const activityBlock = blocks.find((b) => b.type === 'activity')
    const parsedActivity = activityBlock ? activityBlockSchema.safeParse(activityBlock) : null
    run = startRunRecord({
      learnerId,
      packId: input.packId,
      lessonId: input.lessonId,
      blockId: String(activityBlock?.id ?? blocks.find((b) => b.id)?.id ?? input.lessonId),
      activity: parsedActivity?.success ? parsedActivity.data : undefined
    })
  }

  const results: SubmissionBlockResult[] = []
  const out: SubmissionBlockOut[] = []
  const unanswered: string[] = []
  let code: SubmissionOut['code']
  let activity: SubmissionOut['activity']
  let creationFiles: { path: string; contents: string }[] | undefined
  let creationWorld: unknown

  for (const block of blocks) {
    const id = typeof block.id === 'string' ? block.id : ''
    if (!id || !needed.has(id)) continue
    const isAttemptOnly = required.attempt.includes(id)
    const type = String(block.type)

    if (type === 'check' || type === 'predict') {
      const prompt = block as unknown as CheckPrompt
      const given = input.answers?.[id]
      const attempted = isAttemptedAnswer(prompt, given, (input.touched ?? []).includes(id))
      const graded = attempted ? gradeCheckAnswer(prompt, given) : { passed: false, misconceptionIds: [] }
      if (!attempted) unanswered.push(id)
      results.push({
        blockId: id,
        passed: graded.passed,
        score: graded.passed ? 1 : 0,
        attempted,
        assisted: run.assisted,
        revealed: run.revealed,
        answer: given,
        misconceptionIds: graded.misconceptionIds
      })
      out.push({
        blockId: id,
        kind: 'check',
        passed: graded.passed,
        attempted,
        required: isAttemptOnly ? 'attempt' : 'pass',
        misconceptionIds: graded.misconceptionIds,
        // Answers are stripped from the lesson the renderer sees. On a diagnostic
        // miss, hand back the choice ids so amber can mark the right one.
        ...(prompt.diagnostic && attempted && !graded.passed
          ? { correctChoiceIds: correctChoiceIds(prompt) }
          : {})
      })
      continue
    }

    if (type === 'activity') {
      const graded = gradeRunActivity(run.runId)
      if (!graded) throw infra('The activity run was lost. Reload the lesson and try again.')
      const parsed = activityBlockSchema.safeParse(block)
      const misconceptionIds = parsed.success
        ? parsed.data.misconceptionMap?.filter((m) => evalProperty(graded.world, m.when)).map((m) => m.misconceptionId) ?? []
        : []
      activity = {
        world: graded.world,
        calcFault: graded.calcFault,
        goalMet: graded.goalMet,
        constraintOk: graded.constraintOk
      }
      results.push({
        blockId: id,
        passed: graded.passed,
        score: graded.passed ? 1 : graded.goalMet ? 0.5 : 0,
        attempted: true,
        assisted: run.assisted,
        revealed: run.revealed,
        misconceptionIds
      })
      out.push({
        blockId: id,
        kind: 'activity',
        passed: graded.passed,
        attempted: true,
        required: isAttemptOnly ? 'attempt' : 'pass',
        misconceptionIds
      })
      if (graded.passed) creationWorld = graded.world
      continue
    }

    const parsed = executableBlockSchema.safeParse(block)
    if (!parsed.success) continue
    assertCanSpawn(pack)
    let ran
    try {
      ran = await executeCodeBlock(lesson.folder, parsed.data as CodeBlock, input.files ?? [])
    } catch (e) {
      const er = e as { code?: string; message?: string }
      throw infra(er.message ?? 'The runner could not start.', er.code ?? 'runner')
    }
    if (ran.timedOut) throw infra('The program did not finish in time. Nothing was graded.', 'runner-timeout')
    if (ran.play) recordPlay(run.runId, ran.play)
    const misconceptionIds = ran.checks.filter((c) => !c.ok && c.misconceptionId).map((c) => c.misconceptionId!)
    code = {
      stdout: ran.stdout,
      stderr: ran.stderr,
      exitCode: ran.exitCode,
      timedOut: ran.timedOut,
      world: ran.play?.world,
      commands: ran.play?.commands,
      playFault: ran.play?.fault ?? null,
      goalMet: ran.play?.goalMet,
      constraintOk: ran.play?.constraintOk
    }
    results.push({
      blockId: id,
      passed: ran.passed,
      score: ran.passed ? 1 : 0,
      attempted: true,
      assisted: run.assisted,
      revealed: run.revealed,
      misconceptionIds
    })
    out.push({
      blockId: id,
      kind: 'code',
      passed: ran.passed,
      attempted: true,
      required: isAttemptOnly ? 'attempt' : 'pass',
      misconceptionIds
    })
    if (ran.passed) {
      creationFiles = input.files ?? []
      creationWorld = ran.play?.world ?? creationWorld
    }
  }

  const submissionId = input.submissionId || randomUUID()
  const before = loadEvidence(learnerId, input.packId, input.lessonId, taskRev)
  const previousScore = before.currentScore
  const ev = recordSubmission(learnerId, input.packId, input.lessonId, taskRev, {
    submissionId,
    at,
    filesHash: hash,
    results,
    required,
    snapshot: {
      filesHash: hash,
      files: input.files,
      answers: input.answers,
      stdout: code?.stdout,
      stderr: code?.stderr,
      world: code?.world ?? activity?.world
    }
  })

  const passedAll =
    required.pass.every((id) => results.find((r) => r.blockId === id)?.passed) &&
    required.attempt.every((id) => results.find((r) => r.blockId === id)?.attempted)

  appendAttempt(learnerId, input.packId, input.lessonId, {
    id: submissionId,
    runId: run.runId,
    learnerId,
    at,
    blockId: input.lessonId,
    kind: 'grade',
    taskRev,
    passed: passedAll,
    checksPassed: results.filter((r) => r.passed).length,
    checksTotal: results.length,
    score: ev.currentScore ?? 0,
    assisted: run.assisted,
    revealed: run.revealed,
    snapshotId: submissionId,
    misconceptionIds: results.flatMap((r) => r.misconceptionIds ?? [])
  })

  if (passedAll && lesson.raw.creation) {
    saveCreation(learnerId, input.packId, lesson.raw.creation.id, {
      lessonId: input.lessonId,
      ...(creationFiles ? { files: creationFiles } : {}),
      ...(creationWorld ? { world: creationWorld } : {})
    })
  }

  return {
    submissionId,
    outcome: passedAll ? 'pass' : 'fail',
    filesHash: hash,
    unanswered,
    blocks: out,
    score: ev.currentScore ?? 0,
    status: ev.status === 'mastered' ? 'mastered' : ev.status === 'checked' ? 'checked' : 'incomplete',
    ...(code ? { code } : {}),
    ...(activity ? { activity } : {}),
    compare: {
      current: { score: ev.currentScore ?? 0 },
      ...(previousScore === undefined ? {} : { previous: { score: previousScore } }),
      ...(ev.bestEver ? { best: { score: ev.bestEver.score, assisted: ev.bestEver.assisted } } : {})
    }
  }
}
