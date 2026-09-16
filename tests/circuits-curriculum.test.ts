import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonPath } from '@shared/catalog'
import { inferLessonBeats } from '@shared/lessonBeats'
import { checkExplainHtml } from '../src/renderer/checks/CheckPanel'
import { md } from '../src/renderer/md'

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.circuits.basics')

const EXPECTED = [
  'circuits-placement',
  'what-is-charge',
  'current-is-flow',
  'what-is-a-loop',
  'open-means-dark',
  'diagnose-dead-lamp',
  'voltage-is-a-difference',
  'battery-as-push',
  'resistance-as-squeeze',
  'ohms-law',
  'brighter-lamp',
  'why-the-limit',
  'series-same-current',
  'parallel-split',
  'series-vs-parallel',
  'power-and-heat',
  'open-vs-short',
  'why-a-short-hurts',
  'transfer-fuse',
  'switches-break',
  'what-meters-do',
  'series-parallel-mix',
  'keep-your-circuit'
]

const skills = JSON.parse(readFileSync(join(packRoot, 'skills.json'), 'utf8')) as {
  id: string
  prereqIds: string[]
}[]
const misconceptions = JSON.parse(readFileSync(join(packRoot, 'misconceptions.json'), 'utf8')) as {
  id: string
  skillIds: string[]
  followUpLessonId: string
}[]
const courses = JSON.parse(
  JSON.stringify(
    readdirSync(join(packRoot, 'courses')).map((f) =>
      JSON.parse(readFileSync(join(packRoot, 'courses', f), 'utf8'))
    )
  )
) as { id: string; creationId?: string; diagnosticLessonId?: string; modules: { lessonIds: string[] }[] }[]
const tracks = [
  JSON.parse(readFileSync(join(packRoot, 'tracks', 'first-contact.json'), 'utf8')) as {
    id: string
    courseIds: string[]
  }
]

function lessonDoc(id: string) {
  return JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8')) as Record<string, unknown>
}

describe('circuits curriculum', () => {
  it('keeps the path order and every lesson on disk', () => {
    const onDisk = readdirSync(join(packRoot, 'lessons'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
    expect(onDisk).toEqual([...EXPECTED].sort())
    expect(lessonPath(tracks, courses)).toEqual(EXPECTED)
  })

  it('keeps the skill, misconception, and creation graphs whole', () => {
    const skillIds = new Set(skills.map((s) => s.id))
    expect(skillIds.size).toBe(skills.length)
    for (const skill of skills) {
      for (const prereq of skill.prereqIds) expect(skillIds.has(prereq), `${skill.id} -> ${prereq}`).toBe(true)
    }
    const misconceptionIds = new Set(misconceptions.map((m) => m.id))
    expect(misconceptionIds.size).toBe(misconceptions.length)
    for (const m of misconceptions) {
      expect(EXPECTED.includes(m.followUpLessonId), `${m.id} follow-up`).toBe(true)
      for (const s of m.skillIds) expect(skillIds.has(s), `${m.id} skill`).toBe(true)
    }
    const used = new Set<string>()
    const creationSteps = new Map<string, number[]>()
    for (const id of EXPECTED) {
      const raw = lessonDoc(id)
      for (const s of (raw.skillIds as string[]) ?? []) expect(skillIds.has(s), `${id} skill ${s}`).toBe(true)
      for (const found of JSON.stringify(raw).matchAll(/"misconceptionId":"([^"]+)"/g)) used.add(found[1]!)
      const creation = raw.creation as { id: string; step: number } | undefined
      if (creation) creationSteps.set(creation.id, [...(creationSteps.get(creation.id) ?? []), creation.step])
    }
    for (const id of used) expect(misconceptionIds.has(id), `unknown misconception ${id}`).toBe(true)
    for (const id of misconceptionIds) expect(used.has(id), `unused misconception ${id}`).toBe(true)
    for (const course of courses) {
      if (!course.creationId) continue
      expect(creationSteps.has(course.creationId), `${course.id} creation`).toBe(true)
    }
  })

  it('puts the diagnostic first and marks its questions as diagnostic', () => {
    expect(EXPECTED[0]).toBe('circuits-placement')
    const placement = courses.find((c) => c.id === 'placement')
    expect(placement?.diagnosticLessonId).toBe('circuits-placement')
    const raw = lessonDoc('circuits-placement')
    const checks = (
      raw.blocks as { type: string; id?: string; diagnostic?: boolean; skillIds?: string[]; explainMd?: string }[]
    ).filter((b) => b.type === 'check' || b.type === 'predict')
    expect(checks.length).toBeGreaterThanOrEqual(8)
    for (const check of checks) {
      expect(check.diagnostic, 'diagnostic flag').toBe(true)
      expect((check.explainMd ?? '').length, `${check.id} explainMd`).toBeGreaterThan(80)
    }
    for (const id of EXPECTED.filter((l) => l !== 'circuits-placement')) {
      const blocks = lessonDoc(id).blocks as { diagnostic?: boolean }[]
      expect(blocks.some((b) => b.diagnostic), id).toBe(false)
    }
  })

  it('ships original pack diagrams', () => {
    const diagrams = [
      'closed-loop.svg',
      'closed-loop-quiz.svg',
      'open-loop.svg',
      'open-loop-quiz.svg',
      'parallel-split.svg',
      'parallel-split-quiz.svg',
      'short-path.svg',
      'short-path-quiz.svg',
      'current-flow.svg',
      'current-flow-quiz.svg',
      'used-up-myth.svg',
      'used-up-myth-quiz.svg',
      'charge-plus-minus-quiz.svg',
      'meters.svg',
      'meters-quiz.svg',
      'series-two-lamps-quiz.svg',
      'ohms-law.svg'
    ]
    for (const name of diagrams) {
      expect(existsSync(join(packRoot, 'assets', name)), name).toBe(true)
    }
  })

  it('keeps the first loop lessons on one Learn screen and their pictures loadable', () => {
    const packId = 'lawp.circuits.basics'
    for (const id of ['what-is-a-loop', 'open-means-dark'] as const) {
      const blocks = lessonDoc(id).blocks as {
        type: string
        md?: string
        explainMd?: string
        image?: string
        choices?: { image?: string }[]
        slots?: { id: string; x: number; y: number }[]
      }[]
      expect(inferLessonBeats(blocks), id).toEqual(['learn'])
      for (const block of blocks) {
        if (block.md) expect(() => md(block.md, { packId, lessonId: id })).not.toThrow()
        if (block.explainMd) expect(() => checkExplainHtml(block.explainMd, packId, id)).not.toThrow()
        const fromMd = [...`${block.md ?? ''}\n${block.explainMd ?? ''}`.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)].map(
          (m) => m[1]!
        )
        const images = [block.image, ...(block.choices ?? []).map((c) => c.image), ...fromMd].filter(
          (p): p is string => Boolean(p)
        )
        for (const image of images) {
          const name = image.replace(/^assets\//, '')
          const inLesson = existsSync(join(packRoot, 'lessons', id, 'assets', name))
          const inPack = existsSync(join(packRoot, 'assets', name))
          expect(inLesson || inPack, `${id} missing ${image}`).toBe(true)
        }
        if (block.slots) {
          for (const slot of block.slots) {
            expect(Number.isFinite(slot.x), `${id} slot ${slot.id} x`).toBe(true)
            expect(Number.isFinite(slot.y), `${id} slot ${slot.id} y`).toBe(true)
          }
        }
      }
    }
  })

  it('does not put labeled teaching diagrams on picture questions', () => {
    const teaching = new Set([
      'closed-loop.svg',
      'open-loop.svg',
      'short-path.svg',
      'current-flow.svg',
      'used-up-myth.svg',
      'charge-plus-minus.svg',
      'meters.svg',
      'parallel-split.svg',
      'series-two-lamps.svg'
    ])
    const pictureKinds = new Set(['image', 'hotspot', 'place', 'gorder'])
    for (const id of EXPECTED) {
      const blocks = lessonDoc(id).blocks as {
        type?: string
        kind?: string
        id?: string
        image?: string
        choices?: { image?: string }[]
      }[]
      for (const block of blocks) {
        if (block.type !== 'check' && block.type !== 'predict') continue
        if (!pictureKinds.has(block.kind ?? '')) continue
        const images = [
          block.image,
          ...(block.choices ?? []).map((c) => c.image)
        ].filter((p): p is string => Boolean(p))
        for (const image of images) {
          const name = image.replace(/^assets\//, '')
          expect(teaching.has(name), `${id}/${block.id ?? block.kind} uses ${name}`).toBe(false)
        }
      }
    }
  })
})
