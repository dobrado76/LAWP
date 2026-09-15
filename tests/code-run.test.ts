import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { CodeBlock } from '@main/runners/types'
import type { WorldV1 } from '@shared/schemas/world'

const root = mkdtempSync(join(tmpdir(), 'lawp-run-'))

vi.mock('electron', () => ({
  app: {
    getPath: () => root,
    setPath: () => undefined,
    isPackaged: false,
    getAppPath: () => process.cwd(),
    getVersion: () => '0.2.0'
  }
}))

vi.mock('@main/paths', () => ({
  userDataRoot: () => root,
  learnersRoot: () => join(root, 'learners'),
  userPacksRoot: () => join(root, 'packs'),
  bundledPacksRoot: () => join(process.cwd(), 'resources', 'packs'),
  templatesRoot: () => join(process.cwd(), 'resources', 'templates'),
  playStubsRoot: () => join(process.cwd(), 'resources', 'play', 'stubs'),
  playRoot: () => join(process.cwd(), 'resources', 'play'),
  iconPath: () => ''
}))

function gridWorld(): WorldV1 {
  return {
    parts: [
      { id: 'fox', type: 'fox', props: { x: 0, y: 0, rot: 0 } },
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
    { path: 'fox.x', op: 'eq' as const, value: 3 },
    { path: 'fox.y', op: 'eq' as const, value: 2 }
  ]
}

const playBlock = (): CodeBlock => ({
  type: 'code',
  id: 'reach',
  engine: 'javascript',
  entry: 'main.js',
  files: [{ path: 'files/main.js', role: 'edit', contents: '' }],
  checks: [],
  play: { api: 'player-v1', playerId: 'fox', world: gridWorld(), goal: onBeacon }
})

const walk =
  'Player.move("east")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("south")\nPlayer.move("south")\n'

describe('code run grading', () => {
  it('does not pass a play lesson that reaches the goal then throws', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const out = await executeCodeBlock(root, playBlock(), [
      { path: 'files/main.js', contents: `${walk}throw new Error("boom")\n` }
    ])
    expect(out.play?.goalMet).toBe(true)
    expect(out.exitCode).not.toBe(0)
    expect(out.passed).toBe(false)
    expect(out.stderr).toMatch(/boom/)
  })

  it('passes a clean walk that exits 0', async () => {
    const { executeCodeBlock } = await import('@main/runners/code')
    const out = await executeCodeBlock(root, playBlock(), [{ path: 'files/main.js', contents: walk }])
    expect(out.exitCode).toBe(0)
    expect(out.play?.passed).toBe(true)
    expect(out.passed).toBe(true)
  })
})
