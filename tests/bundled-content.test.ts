import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { startRun, evalProperty } from '@main/activities/world'
import { LESSON_CARDS } from '@shared/lessonCards'
import { playObjectiveItems, type PlayGoal, type PlayWorld } from '@shared/play'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'
import { packManifestSchema } from '@shared/schemas/pack'

const packsRoot = join(process.cwd(), 'resources', 'packs')

function packDirs(): string[] {
  return readdirSync(packsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(packsRoot, e.name, 'pack.json')))
    .map((e) => e.name)
}

describe('bundled cartridges', () => {
  it('parses every pack and lesson', () => {
    const ids = packDirs()
    expect(ids).toEqual(
      expect.arrayContaining([
        'lawp.circuits.basics',
        'lawp.python.foundations',
        'lawp.javascript.foundations',
        'lawp.react.foundations',
        'lawp.learning.questions'
      ])
    )
    for (const id of ids) {
      const root = join(packsRoot, id)
      packManifestSchema.parse(JSON.parse(readFileSync(join(root, 'pack.json'), 'utf8')))
      const lessonsDir = join(root, 'lessons')
      for (const lessonId of readdirSync(lessonsDir)) {
        const file = join(lessonsDir, lessonId, 'lesson.json')
        const raw = JSON.parse(readFileSync(file, 'utf8'))
        const lesson = lessonSchema.parse(raw)
        expect(() => parseLessonBlocks(raw.blocks)).not.toThrow()
        expect(lesson.packId).toBe(id)
        expect(lesson.id).toBe(lessonId)
        expect(lesson.description, `${id}/${lessonId}`).toMatch(/^[A-Z].*\.$/)
        expect(lesson.description, `${id}/${lessonId}`).not.toMatch(/`/)
        const card = LESSON_CARDS[lessonId]
        expect(card, `${id}/${lessonId} card`).toBeDefined()
        expect(card.description, `${id}/${lessonId} card`).toMatch(/^[A-Z].*\.$/)
        expect(card.description, `${id}/${lessonId} card`).not.toMatch(/`/)
        expect(card.icon, `${id}/${lessonId} icon`).toBeTruthy()
        expect(card.tags.length, `${id}/${lessonId} tags`).toBeGreaterThan(0)
        expect(card.tags.length, `${id}/${lessonId} tags`).toBeLessThanOrEqual(4)
        for (const tag of card.tags) {
          expect(tag, `${id}/${lessonId} tag`).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9 /._-]*$/)
          expect(tag, `${id}/${lessonId} tag`).not.toMatch(/`/)
        }
      }
    }
  })

  it('does not start play or activity lessons with a goal already true', () => {
    const leaks: string[] = []
    for (const id of packDirs()) {
      const lessonsDir = join(packsRoot, id, 'lessons')
      for (const lessonId of readdirSync(lessonsDir)) {
        const raw = JSON.parse(readFileSync(join(lessonsDir, lessonId, 'lesson.json'), 'utf8')) as {
          blocks?: Array<Record<string, unknown>>
        }
        for (const block of raw.blocks ?? []) {
          if (block.type === 'code' || block.type === 'debug') {
            const play = block.play as { world?: PlayWorld; goal?: PlayGoal } | undefined
            const world = play?.world ?? null
            for (const item of playObjectiveItems(play?.goal, world)) {
              if (item.done) leaks.push(`${id}/${lessonId} play “${item.label}”`)
            }
          }
          if (block.type === 'activity') {
            const world = block.world as Parameters<typeof startRun>[0] | undefined
            const goal = block.goal as { all?: Parameters<typeof evalProperty>[1][] } | undefined
            const constraints = (block.constraints ?? []) as Parameters<typeof evalProperty>[1][]
            if (!world) continue
            const started = startRun(world).world
            for (const prop of goal?.all ?? []) {
              const invariant = constraints.some((c) => c.path === prop.path && c.op === prop.op && c.value === prop.value)
              if (!invariant && evalProperty(started, prop)) {
                leaks.push(`${id}/${lessonId} activity ${prop.path} ${prop.op} ${String(prop.value)}`)
              }
            }
          }
        }
      }
    }
    expect(leaks, leaks.join('\n')).toEqual([])
  })
})
