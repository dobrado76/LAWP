import type { WorldV1 } from '@shared/schemas/world'
import { applyPlayCommands, parsePlayLog, type PlayCommand } from '@shared/play'
import { goalMet, constraintsOk } from '../activities/world'

export type { PlayCommand, PlayDir } from '@shared/play'
export { parsePlayLog, gridSize } from '@shared/play'

export type PlayApplyResult = {
  world: WorldV1
  commands: PlayCommand[]
  fault: string | null
  goalMet: boolean
  constraintOk: boolean
  passed: boolean
}

export function applyPlayLog(
  start: WorldV1,
  commands: PlayCommand[],
  opts: {
    playerId?: string
    goal?: { all?: Parameters<typeof goalMet>[1]['all']; any?: Parameters<typeof goalMet>[1]['any']; none?: Parameters<typeof goalMet>[1]['none'] }
    constraints?: Parameters<typeof constraintsOk>[1]
    scaleValues?: number[]
  } = {}
): PlayApplyResult {
  const { world, fault } = applyPlayCommands(start, commands, {
    playerId: opts.playerId,
    scaleValues: opts.scaleValues
  })
  const graded = world as WorldV1
  const g = opts.goal ?? {}
  const met = goalMet(graded, g)
  const constraintOk = constraintsOk(graded, opts.constraints)
  return {
    world: graded,
    commands,
    fault,
    goalMet: met,
    constraintOk,
    passed: fault === null && met && constraintOk
  }
}
