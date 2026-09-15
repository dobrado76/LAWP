import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CHECK_KINDS } from '@shared/check'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.learning.questions')

describe('question-type inventory pack', () => {
  it('has a playable lesson for every CHECK_KIND', () => {
    expect(existsSync(join(packRoot, 'pack.json'))).toBe(true)
    const found = new Set<string>()
    for (const id of readdirSync(join(packRoot, 'lessons'))) {
      const raw = JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8'))
      const lesson = lessonSchema.parse(raw)
      expect(() => parseLessonBlocks(raw.blocks)).not.toThrow()
      for (const block of lesson.blocks) {
        if (block.type === 'check' && typeof block.kind === 'string') found.add(block.kind)
      }
    }
    expect([...found].sort()).toEqual([...CHECK_KINDS].sort())
  })
})
