import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PLAY_KIT, playKitPiece } from '@shared/playKit'

const assets = join(process.cwd(), 'resources', 'play', 'assets')

describe('play kit', () => {
  it('has a unique id and an on-disk png for every piece', () => {
    const ids = PLAY_KIT.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(PLAY_KIT.length).toBeGreaterThanOrEqual(40)
    for (const piece of PLAY_KIT) {
      expect(piece.file.endsWith('.png'), piece.file).toBe(true)
      expect(existsSync(join(assets, piece.file)), piece.file).toBe(true)
      expect(playKitPiece(piece.id)?.file).toBe(piece.file)
    }
    expect(playKitPiece('fox')?.file).toBe('fox.png')
    expect(playKitPiece('floor-stone')?.layer).toBe('floor')
  })
})
