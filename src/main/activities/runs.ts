import { randomUUID } from 'node:crypto'
import type { ActivityBlock } from '@shared/schemas/lesson'
import type { WorldV1 } from '@shared/schemas/world'
import type { PlayApplyResult } from '../play/commands'
import { gradeActivity, startRun, tick, type ActionPayload, type RunWorld } from './world'

type LiveRun = {
  runId: string
  learnerId: string
  packId: string
  lessonId: string
  blockId: string
  startedAt: number
  hintLevel: number
  assisted: boolean
  revealed: boolean
  activity?: ActivityBlock
  worldRun?: RunWorld
  playWorld?: WorldV1
  playCommands?: PlayApplyResult['commands']
  playFault?: string | null
}

const runs = new Map<string, LiveRun>()

export function startRunRecord(input: {
  learnerId: string
  packId: string
  lessonId: string
  blockId: string
  activity?: ActivityBlock
  playWorld?: WorldV1
}): LiveRun {
  const runId = randomUUID()
  const worldRun = input.activity ? startRun(input.activity.world) : undefined
  const rec: LiveRun = {
    runId,
    learnerId: input.learnerId,
    packId: input.packId,
    lessonId: input.lessonId,
    blockId: input.blockId,
    startedAt: Date.now(),
    hintLevel: 0,
    assisted: false,
    revealed: false,
    activity: input.activity,
    worldRun,
    playWorld: input.playWorld ? structuredClone(input.playWorld) : undefined
  }
  runs.set(runId, rec)
  return rec
}

export function getRun(runId: string): LiveRun | undefined {
  return runs.get(runId)
}

export function cancelRun(runId: string): void {
  runs.delete(runId)
}

export function applyActivity(runId: string, actionId: string, payload?: ActionPayload) {
  const rec = runs.get(runId)
  if (!rec?.activity || !rec.worldRun) return { error: 'not-found' as const }
  const result = tick(
    rec.worldRun,
    actionId,
    payload,
    rec.activity.goal,
    rec.activity.constraints,
    rec.activity.misconceptionMap
  )
  if ('error' in result) return { error: 'validation' as const, message: result.error }
  return { ok: true as const, rec, result }
}

export function gradeRunActivity(runId: string) {
  const rec = runs.get(runId)
  if (!rec?.activity || !rec.worldRun) return null
  const mode = rec.activity.constraintMode ?? 'final'
  return {
    rec,
    ...gradeActivity(rec.worldRun, rec.activity.goal, rec.activity.constraints, mode),
    world: rec.worldRun.world,
    calcFault: rec.worldRun.calcFault,
    constraintEverFailed: rec.worldRun.constraintEverFailed
  }
}

export function recordPlay(runId: string, play: PlayApplyResult): void {
  const rec = runs.get(runId)
  if (!rec) return
  rec.playWorld = play.world
  rec.playCommands = play.commands
  rec.playFault = play.fault
}

export function noteHint(runId: string, level: number, kind: 'concept' | 'assist'): void {
  const rec = runs.get(runId)
  if (!rec) return
  rec.hintLevel = Math.max(rec.hintLevel, level)
  if (kind === 'assist') rec.assisted = true
  if (level === 5) rec.revealed = true
}
