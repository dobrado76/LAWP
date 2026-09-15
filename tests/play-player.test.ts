import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyPlayLog, parsePlayLog, type PlayCommand } from '@main/play/commands'
import { clampGrid, facingName, GRID_MAX, propertyHolds } from '@shared/play'
import type { WorldV1 } from '@shared/schemas/world'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'

function gridWorld(fox = { x: 0, y: 0 }): WorldV1 {
  return {
    parts: [
      { id: 'fox', type: 'fox', props: { x: fox.x, y: fox.y, rot: 0 } },
      { id: 'beacon', type: 'beacon', props: { x: 3, y: 2 } }
    ],
    connections: [],
    actions: [],
    rules: [],
    view: { kind: 'grid', grid: { cols: 5, rows: 5 } }
  }
}

const onBeacon = {
  all: [
    { path: 'fox.x' as const, op: 'eq' as const, value: 3 },
    { path: 'fox.y' as const, op: 'eq' as const, value: 2 }
  ]
}

describe('grid size', () => {
  it('clamps authored size to 1–64', () => {
    expect(clampGrid(0)).toBe(1)
    expect(clampGrid(5)).toBe(5)
    expect(clampGrid(64)).toBe(GRID_MAX)
    expect(clampGrid(99)).toBe(64)
  })
})

describe('player-v1 apply', () => {
  it('move east increments fox x', () => {
    const out = applyPlayLog(gridWorld(), [{ op: 'move', dir: 'east' }], { playerId: 'fox', goal: onBeacon })
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(1)
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.y).toBe(0)
    expect(out.fault).toBeNull()
    expect(out.passed).toBe(false)
  })

  it('clamps moves at the grid edge', () => {
    const west = applyPlayLog(gridWorld({ x: 0, y: 0 }), [{ op: 'move', dir: 'west' }], { playerId: 'fox' })
    expect(west.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(0)
    const north = applyPlayLog(gridWorld({ x: 0, y: 0 }), [{ op: 'move', dir: 'north' }], { playerId: 'fox' })
    expect(north.world.parts.find((p) => p.id === 'fox')?.props.y).toBe(0)
    const east = applyPlayLog(gridWorld({ x: 4, y: 4 }), [{ op: 'move', dir: 'east' }], { playerId: 'fox' })
    expect(east.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(4)
    const south = applyPlayLog(gridWorld({ x: 4, y: 4 }), [{ op: 'move', dir: 'south' }], { playerId: 'fox' })
    expect(south.world.parts.find((p) => p.id === 'fox')?.props.y).toBe(4)
  })

  it('fault fails grade even when the fox is already on the beacon', () => {
    const out = applyPlayLog(gridWorld({ x: 3, y: 2 }), [{ op: 'fault', message: 'unknown method jump' }], {
      playerId: 'fox',
      goal: onBeacon
    })
    expect(out.goalMet).toBe(true)
    expect(out.fault).toBe('unknown method jump')
    expect(out.passed).toBe(false)
  })

  it('wait is a no-op on the world and is not a fault', () => {
    const out = applyPlayLog(gridWorld(), [{ op: 'wait', ticks: 2 }, { op: 'move', dir: 'east' }], {
      playerId: 'fox'
    })
    expect(out.fault).toBeNull()
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(1)
    expect(parsePlayLog([{ op: 'wait', ticks: 3 }])).toEqual([{ op: 'wait', ticks: 3 }])
  })

  it('unknown log rows become faults', () => {
    const cmds = parsePlayLog([{ op: 'teleport', x: 9 }])
    expect(cmds).toEqual([{ op: 'fault', message: 'Unknown play command' }])
    const out = applyPlayLog(gridWorld(), cmds, { playerId: 'fox', goal: onBeacon })
    expect(out.passed).toBe(false)
  })

  it('reaching the beacon without a fault passes', () => {
    const cmds: PlayCommand[] = [
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'south' },
      { op: 'move', dir: 'south' }
    ]
    const out = applyPlayLog(gridWorld(), cmds, { playerId: 'fox', goal: onBeacon })
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(3)
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.y).toBe(2)
    expect(out.passed).toBe(true)
  })

  it('solid rocks block a step', () => {
    const world = gridWorld({ x: 2, y: 3 })
    world.parts.push({ id: 'r33', type: 'rock', props: { x: 3, y: 3, solid: true } })
    const out = applyPlayLog(world, [{ op: 'move', dir: 'east' }], { playerId: 'fox' })
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(2)
    expect(out.fault).toBeNull()
  })

  it('stepping on a collect part sets taken', () => {
    const world = gridWorld({ x: 2, y: 3 })
    world.parts.push({ id: 'coin', type: 'coin', props: { x: 2, y: 4, collect: true, taken: false } })
    const out = applyPlayLog(world, [{ op: 'move', dir: 'south' }], { playerId: 'fox' })
    expect(out.world.parts.find((p) => p.id === 'coin')?.props.taken).toBe(true)
  })

  it('rotate, scale allowlist, and say grade together', () => {
    const world = gridWorld({ x: 3, y: 2 })
    world.parts[0]!.props.scale = 1
    const out = applyPlayLog(
      world,
      [
        { op: 'rotate', deg: 90 },
        { op: 'scale', n: 2 },
        { op: 'say', text: 'ready' }
      ],
      {
        playerId: 'fox',
        scaleValues: [1, 2],
        goal: {
          all: [
            { path: 'fox.x', op: 'eq', value: 3 },
            { path: 'fox.y', op: 'eq', value: 2 },
            { path: 'fox.rot', op: 'eq', value: 90 },
            { path: 'fox.scale', op: 'eq', value: 2 },
            { path: 'fox.say', op: 'eq', value: 'ready' }
          ]
        }
      }
    )
    expect(out.passed).toBe(true)
    const bad = applyPlayLog(world, [{ op: 'scale', n: 3 }], { playerId: 'fox', scaleValues: [1, 2] })
    expect(bad.fault).toBe('scale value not allowed')
    expect(bad.passed).toBe(false)
  })

  it('reads coordinates and facing for the HUD', () => {
    expect(facingName(0)).toBe('south')
    expect(facingName(90)).toBe('west')
    const world = gridWorld({ x: 2, y: 3 })
    expect(propertyHolds(world, { path: 'fox.x', op: 'eq', value: 2 })).toBe(true)
    expect(propertyHolds(world, { path: 'fox.y', op: 'eq', value: 0 })).toBe(false)
  })

  it('never evals pack strings', () => {
    const applySrc = readFileSync(resolve('src/main/play/commands.ts'), 'utf8')
    const sharedSrc = readFileSync(resolve('src/shared/play.ts'), 'utf8')
    const worldSrc = readFileSync(resolve('src/main/activities/world.ts'), 'utf8')
    for (const src of [applySrc, sharedSrc, worldSrc]) {
      expect(src.includes('eval(')).toBe(false)
      expect(src.includes('new Function')).toBe(false)
    }
  })
})

describe('player-v1 stubs', () => {
  it('js stub logs move east', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lawp-play-'))
    copyFileSync(resolve('resources/play/stubs/_lawp_player.js'), join(dir, '_lawp_player.js'))
    writeFileSync(join(dir, 'main.js'), `global.Player = require('./_lawp_player.js').Player\nPlayer.move('east')\n`)
    const r = spawnSync('node', ['main.js'], { cwd: dir, encoding: 'utf8' })
    expect(r.status).toBe(0)
    const log = JSON.parse(readFileSync(join(dir, 'play-log.json'), 'utf8'))
    expect(log).toEqual([{ op: 'move', dir: 'east' }])
    const out = applyPlayLog(gridWorld(), parsePlayLog(log), { playerId: 'fox' })
    expect(out.world.parts.find((p) => p.id === 'fox')?.props.x).toBe(1)
  })

  it('js stub unknown method writes a fault', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lawp-play-'))
    copyFileSync(resolve('resources/play/stubs/_lawp_player.js'), join(dir, '_lawp_player.js'))
    writeFileSync(
      join(dir, 'main.js'),
      `global.Player = require('./_lawp_player.js').Player\nPlayer.jump()\n`
    )
    const r = spawnSync('node', ['main.js'], { cwd: dir, encoding: 'utf8' })
    expect(r.status).toBe(0)
    const log = JSON.parse(readFileSync(join(dir, 'play-log.json'), 'utf8'))
    expect(log[0]).toMatchObject({ op: 'fault' })
    const out = applyPlayLog(gridWorld({ x: 3, y: 2 }), parsePlayLog(log), { playerId: 'fox', goal: onBeacon })
    expect(out.passed).toBe(false)
  })
})

describe('play lessons', () => {
  it('parses play lessons including keyed-beacon', () => {
    for (const rel of [
      'resources/packs/lawp.javascript.foundations/lessons/beacon-call/lesson.json',
      'resources/packs/lawp.javascript.foundations/lessons/keyed-beacon/lesson.json',
      'resources/packs/lawp.python.foundations/lessons/walk-the-fox/lesson.json'
    ]) {
      const raw = JSON.parse(readFileSync(resolve(rel), 'utf8'))
      expect(lessonSchema.parse(raw).id).toBeTruthy()
      const blocks = parseLessonBlocks(raw.blocks)
      const code = blocks.find((b) => (b as { type?: string }).type === 'code') as { play?: { api?: string } }
      expect(code.play?.api).toBe('player-v1')
    }
    expect(existsSync(resolve('resources/play/assets/fox.png'))).toBe(true)
    expect(existsSync(resolve('resources/play/assets/beacon.png'))).toBe(true)
    expect(existsSync(resolve('resources/play/assets/rock.png'))).toBe(true)
  })

  it('keyed-beacon solution passes and skipping the key fails', () => {
    const raw = JSON.parse(
      readFileSync(resolve('resources/packs/lawp.javascript.foundations/lessons/keyed-beacon/lesson.json'), 'utf8')
    )
    const blocks = parseLessonBlocks(raw.blocks)
    const code = blocks.find((b) => (b as { type?: string }).type === 'code') as {
      play: {
        world: import('@shared/schemas/world').WorldV1
        goal: { all?: { path: string; op: 'eq'; value: string | number | boolean }[] }
        scaleValues?: number[]
      }
    }
    const solution: PlayCommand[] = [
      { op: 'move', dir: 'south' },
      { op: 'move', dir: 'north' },
      { op: 'move', dir: 'north' },
      { op: 'move', dir: 'north' },
      { op: 'move', dir: 'west' },
      { op: 'move', dir: 'west' },
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'east' },
      { op: 'move', dir: 'west' },
      { op: 'move', dir: 'west' },
      { op: 'move', dir: 'north' },
      { op: 'rotate', deg: 90 },
      { op: 'scale', n: 2 },
      { op: 'say', text: 'ready' }
    ]
    const win = applyPlayLog(code.play.world, solution, {
      playerId: 'fox',
      goal: code.play.goal,
      scaleValues: code.play.scaleValues
    })
    expect(win.passed).toBe(true)
    const skipKey = solution.filter((c, i) => i < 6 || i > 9)
    const miss = applyPlayLog(code.play.world, skipKey, {
      playerId: 'fox',
      goal: code.play.goal,
      scaleValues: code.play.scaleValues
    })
    expect(miss.passed).toBe(false)
  })
})
