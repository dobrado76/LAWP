import type { CalcFault, Property, WorldPart, WorldV1 } from '@shared/schemas/world'

export type WorldState = WorldV1

export type TickResult = {
  world: WorldState
  goalMet: boolean
  constraintOk: boolean
  constraintEverFailed: boolean
  calcFault: CalcFault
  misconceptionIds: string[]
}

export type RunWorld = {
  world: WorldState
  constraintEverFailed: boolean
  calcFault: CalcFault
}

function cloneWorld(world: WorldV1): WorldState {
  return structuredClone(world)
}

function partById(world: WorldState, id: string): WorldPart | undefined {
  return world.parts.find((p) => p.id === id)
}

export function resolvePath(world: WorldState, path: string): string | number | boolean | undefined {
  const [id, key] = path.split('.')
  if (!id || !key) return undefined
  return partById(world, id)?.props[key]
}

function evalOperand(world: WorldState, v: string | number): number | undefined {
  if (typeof v === 'number') return v
  const got = resolvePath(world, v)
  return typeof got === 'number' ? got : undefined
}

export function evalProperty(world: WorldState, prop: Property): boolean {
  const got = resolvePath(world, prop.path)
  if (got === undefined) return false
  const { op, value } = prop
  switch (op) {
    case 'eq':
      return got === value
    case 'neq':
      return got !== value
    case 'lt':
      return typeof got === 'number' && typeof value === 'number' && got < value
    case 'lte':
      return typeof got === 'number' && typeof value === 'number' && got <= value
    case 'gt':
      return typeof got === 'number' && typeof value === 'number' && got > value
    case 'gte':
      return typeof got === 'number' && typeof value === 'number' && got >= value
    case 'includes':
      return typeof got === 'string' && typeof value === 'string' && got.includes(value)
    default:
      return false
  }
}

function evalValue(
  world: WorldState,
  value: WorldV1['rules'][number]['set'][number]['value']
): { ok: true; value: string | number | boolean } | { ok: false; fault: CalcFault } {
  if (typeof value !== 'object') return { ok: true, value }
  const a = evalOperand(world, value.a)
  const b = evalOperand(world, value.b)
  if (a === undefined || b === undefined) return { ok: true, value: 0 }
  let n = 0
  switch (value.op) {
    case 'add':
      n = a + b
      break
    case 'sub':
      n = a - b
      break
    case 'mul':
      n = a * b
      break
    case 'div':
      if (b === 0) return { ok: false, fault: 'div-by-zero' }
      n = a / b
      break
  }
  if (!Number.isFinite(n)) return { ok: false, fault: 'div-by-zero' }
  return { ok: true, value: n }
}

export function applyRules(world: WorldState): CalcFault {
  let calcFault: CalcFault = null
  for (const rule of world.rules) {
    if (!rule.when.every((p) => evalProperty(world, p))) continue
    for (const row of rule.set) {
      const ev = evalValue(world, row.value)
      if (!ev.ok) {
        calcFault = ev.fault
        continue
      }
      const part = partById(world, row.target)
      if (!part) continue
      part.props[row.key] = ev.value
    }
  }
  return calcFault
}

export type ActionPayload = {
  value?: string | number | boolean
  from?: string
  to?: string
  via?: string
  id?: string
  part?: { id: string; type: string; props: Record<string, string | number | boolean> }
}

export function applyAction(world: WorldState, actionId: string, payload?: ActionPayload): string | null {
  const action = world.actions.find((a) => a.id === actionId)
  if (!action) return 'Unknown action'
  switch (action.op) {
    case 'set': {
      const value = payload?.value ?? action.values?.[0]
      if (value === undefined) return 'Missing value'
      if (action.values && !action.values.includes(value)) return 'Value not allowed'
      const part = partById(world, action.target)
      if (!part || !action.key) return 'Missing target'
      part.props[action.key] = value
      return null
    }
    case 'toggle': {
      const part = partById(world, action.target)
      if (!part || !action.key) return 'Missing target'
      const cur = part.props[action.key]
      part.props[action.key] = typeof cur === 'boolean' ? !cur : true
      return null
    }
    case 'connect': {
      const from = payload?.from ?? action.target
      const to = payload?.to
      if (!from || !to) return 'connect needs from and to'
      const exists = world.connections.some((c) => c.from === from && c.to === to && c.via === payload?.via)
      if (!exists) world.connections.push({ from, to, via: payload?.via })
      return null
    }
    case 'disconnect': {
      const from = payload?.from ?? action.target
      const to = payload?.to
      world.connections = world.connections.filter((c) => !(c.from === from && c.to === to))
      return null
    }
    case 'add': {
      const part = payload?.part
      if (!part) return 'add needs part'
      if (partById(world, part.id)) return null
      world.parts.push(part)
      return null
    }
    case 'remove': {
      const id = payload?.id ?? action.target
      world.parts = world.parts.filter((p) => p.id !== id)
      world.connections = world.connections.filter((c) => c.from !== id && c.to !== id)
      return null
    }
    default:
      return 'Unknown op'
  }
}

export function goalMet(world: WorldState, goal: { all?: Property[]; any?: Property[]; none?: Property[] }): boolean {
  const all = goal.all?.every((p) => evalProperty(world, p)) ?? true
  const any = !goal.any || goal.any.length === 0 || goal.any.some((p) => evalProperty(world, p))
  const none = goal.none?.every((p) => !evalProperty(world, p)) ?? true
  return all && any && none
}

export function constraintsOk(world: WorldState, constraints?: Property[]): boolean {
  if (!constraints || constraints.length === 0) return true
  return constraints.every((p) => evalProperty(world, p))
}

export function startRun(world: WorldV1): RunWorld {
  const next = cloneWorld(world)
  const calcFault = applyRules(next)
  return { world: next, constraintEverFailed: false, calcFault }
}

export function tick(
  run: RunWorld,
  actionId: string,
  payload: ActionPayload | undefined,
  goal: { all?: Property[]; any?: Property[]; none?: Property[] },
  constraints: Property[] | undefined,
  misconceptionMap?: { when: Property; misconceptionId: string }[]
): TickResult | { error: string } {
  const world = cloneWorld(run.world)
  const bad = applyAction(world, actionId, payload)
  if (bad) return { error: bad }
  const calcFault = applyRules(world)
  const constraintOk = constraintsOk(world, constraints)
  const constraintEverFailed = run.constraintEverFailed || !constraintOk
  const ids =
    misconceptionMap?.filter((m) => evalProperty(world, m.when)).map((m) => m.misconceptionId) ?? []
  run.world = world
  run.calcFault = calcFault
  run.constraintEverFailed = constraintEverFailed
  return {
    world,
    goalMet: goalMet(world, goal),
    constraintOk,
    constraintEverFailed,
    calcFault,
    misconceptionIds: ids
  }
}

export function gradeActivity(
  run: RunWorld,
  goal: { all?: Property[]; any?: Property[]; none?: Property[] },
  constraints: Property[] | undefined,
  constraintMode: 'final' | 'always'
): { passed: boolean; goalMet: boolean; constraintOk: boolean } {
  const met = goalMet(run.world, goal)
  const constraintOk = constraintsOk(run.world, constraints)
  const constraintPass = constraintMode === 'final' ? constraintOk : !run.constraintEverFailed
  const passed = run.calcFault === null && met && constraintPass
  return { passed, goalMet: met, constraintOk }
}

export function viewAsset(world: WorldState, part: WorldPart): string | undefined {
  const map = world.view.assetMap ?? {}
  let best: string | undefined
  let bestScore = -1
  for (const [key, asset] of Object.entries(map)) {
    if (key === part.type && bestScore < 0) {
      best = asset
      bestScore = 0
    }
    const m = key.match(/^(.+)@([^=]+)=(.+)$/)
    if (m && m[1] === part.type && m[2] && String(part.props[m[2]]) === m[3] && 1 > bestScore) {
      best = asset
      bestScore = 1
    }
  }
  return best
}
