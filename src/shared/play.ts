export type PlayDir = 'north' | 'south' | 'east' | 'west'

export type PlayCommand =
  | { op: 'move'; dir: PlayDir }
  | { op: 'rotate'; deg: number }
  | { op: 'scale'; n: number }
  | { op: 'say'; text: string }
  | { op: 'wait'; ticks: number }
  | { op: 'fault'; message: string }

export type PlayWorld = {
  parts: { id: string; type: string; props: Record<string, string | number | boolean> }[]
  view?: { grid?: { cols?: number; rows?: number } }
}

const DIRS: PlayDir[] = ['north', 'south', 'east', 'west']

export function parsePlayLog(raw: unknown): PlayCommand[] {
  if (!Array.isArray(raw)) return []
  const out: PlayCommand[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const op = (row as { op?: string }).op
    if (op === 'move' && DIRS.includes((row as { dir: PlayDir }).dir)) {
      out.push({ op: 'move', dir: (row as { dir: PlayDir }).dir })
    } else if (op === 'rotate' && typeof (row as { deg: number }).deg === 'number') {
      out.push({ op: 'rotate', deg: (row as { deg: number }).deg })
    } else if (op === 'scale' && typeof (row as { n: number }).n === 'number') {
      out.push({ op: 'scale', n: (row as { n: number }).n })
    } else if (op === 'say' && typeof (row as { text: string }).text === 'string') {
      out.push({ op: 'say', text: (row as { text: string }).text })
    } else if (op === 'wait' && Number.isInteger((row as { ticks: number }).ticks) && (row as { ticks: number }).ticks >= 0) {
      out.push({ op: 'wait', ticks: (row as { ticks: number }).ticks })
    } else if (op === 'fault') {
      out.push({ op: 'fault', message: String((row as { message?: string }).message ?? 'invalid play command') })
    } else {
      out.push({ op: 'fault', message: 'Unknown play command' })
    }
  }
  return out
}

export function gridSize(world: PlayWorld): { cols: number; rows: number } {
  return { cols: world.view?.grid?.cols ?? 5, rows: world.view?.grid?.rows ?? 5 }
}

export function playerPart(world: PlayWorld, playerId: string) {
  return (
    world.parts.find((p) => p.id === playerId) ??
    world.parts.find((p) => p.type === 'fox' || p.type === 'player') ??
    world.parts[0]
  )
}

function occupiedSolid(world: PlayWorld, x: number, y: number, playerId: string): boolean {
  return world.parts.some(
    (p) =>
      p.id !== playerId &&
      p.props.solid === true &&
      Number(p.props.x ?? 0) === x &&
      Number(p.props.y ?? 0) === y
  )
}

function collectAt(world: PlayWorld, x: number, y: number): void {
  for (const p of world.parts) {
    if (p.props.collect !== true) continue
    if (Number(p.props.x ?? 0) === x && Number(p.props.y ?? 0) === y) {
      p.props.taken = true
    }
  }
}

export type PlayProp = { path: string; op: string; value: string | number | boolean }

export function propertyHolds(world: PlayWorld, prop: PlayProp): boolean {
  const [id, key] = prop.path.split('.')
  if (!id || !key) return false
  const got = world.parts.find((p) => p.id === id)?.props[key]
  if (got === undefined) return false
  const { op, value } = prop
  if (op === 'eq') return got === value
  if (op === 'neq') return got !== value
  if (op === 'lt') return typeof got === 'number' && typeof value === 'number' && got < value
  if (op === 'lte') return typeof got === 'number' && typeof value === 'number' && got <= value
  if (op === 'gt') return typeof got === 'number' && typeof value === 'number' && got > value
  if (op === 'gte') return typeof got === 'number' && typeof value === 'number' && got >= value
  if (op === 'includes') return typeof got === 'string' && typeof value === 'string' && got.includes(value)
  return false
}

export function facingName(rot: number): string {
  const r = ((rot % 360) + 360) % 360
  if (r === 0) return 'south'
  if (r === 90) return 'west'
  if (r === 180) return 'north'
  if (r === 270) return 'east'
  return `${r}°`
}

export function applyPlayCommands(
  start: PlayWorld,
  commands: PlayCommand[],
  opts: { playerId?: string; scaleValues?: number[] } = {}
): { world: PlayWorld; fault: string | null } {
  const world = structuredClone(start)
  const { cols, rows } = gridSize(world)
  const id = opts.playerId ?? 'fox'
  let fault: string | null = null
  for (const cmd of commands) {
    if (cmd.op === 'fault') {
      fault = cmd.message
      continue
    }
    const part = playerPart(world, id)
    if (!part) {
      fault = 'No player part'
      continue
    }
    const x = typeof part.props.x === 'number' ? part.props.x : 0
    const y = typeof part.props.y === 'number' ? part.props.y : 0
    if (cmd.op === 'move') {
      let nx = x
      let ny = y
      if (cmd.dir === 'east') nx += 1
      if (cmd.dir === 'west') nx -= 1
      if (cmd.dir === 'south') ny += 1
      if (cmd.dir === 'north') ny -= 1
      nx = Math.max(0, Math.min(cols - 1, nx))
      ny = Math.max(0, Math.min(rows - 1, ny))
      if (!occupiedSolid(world, nx, ny, part.id)) {
        part.props.x = nx
        part.props.y = ny
        collectAt(world, nx, ny)
      }
    } else if (cmd.op === 'rotate') {
      if (cmd.deg % 90 !== 0) {
        fault = 'rotate must be a multiple of 90'
        continue
      }
      const rot = typeof part.props.rot === 'number' ? part.props.rot : 0
      part.props.rot = ((rot + cmd.deg) % 360 + 360) % 360
    } else if (cmd.op === 'scale') {
      if (opts.scaleValues && !opts.scaleValues.includes(cmd.n)) {
        fault = 'scale value not allowed'
        continue
      }
      part.props.scale = cmd.n
    } else if (cmd.op === 'say') {
      part.props.say = cmd.text
    } else if (cmd.op === 'wait') {
      // Delay is for Studio replay only. The world does not change.
    }
  }
  return { world, fault }
}
