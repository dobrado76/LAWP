import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'
import { courseSchema, packManifestSchema, trackSchema } from '@shared/schemas/pack'

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.python.foundations')

// The learner walks this exact order: tracks, then courses, then modules.
export const EXPECTED = [
  'py-placement',
  'names-and-values',
  'types-you-can-see',
  'numbers-int-float',
  'strings-immutable',
  'say-it-once',
  'truthiness-and-none',
  'compare-is-not-assign',
  'equality-vs-identity',
  'boolean-logic',
  'transfer-classify-value',
  'if-this-then-that',
  'compare-chaining',
  'walk-the-fox',
  'for-over-range',
  'while-and-break',
  'loop-else-and-continue',
  'nested-loops-grid',
  'debug-off-by-one',
  'transfer-patrol-route',
  'def-and-return',
  'parameters-defaults',
  'keyword-args',
  'mutable-default-trap',
  'args-and-kwargs',
  'scope-and-global',
  'closures-and-nonlocal',
  'lambda-and-key',
  'greeting-bot',
  'lists-index-slice',
  'list-mutation-vs-copy',
  'tuples-and-unpacking',
  'sorting-with-key',
  'dicts-keys',
  'dict-get-and-setdefault',
  'sets-and-dedupe',
  'counting-with-counter',
  'comprehensions-list',
  'comprehensions-dict-set',
  'zip-and-enumerate',
  'nested-data-gradebook',
  'transfer-group-records',
  'read-the-traceback',
  'try-except-specific',
  'else-and-finally',
  'raise-and-custom-error',
  'eafp-vs-lbyl',
  'debug-swallowed-error',
  'transfer-safe-parse',
  'string-methods-clean',
  'split-and-join',
  'slicing-text',
  'fstring-formatting',
  'regex-search',
  'regex-groups-and-sub',
  'encoding-bytes-vs-str',
  'transfer-clean-a-log',
  'open-and-with',
  'read-lines-without-slurping',
  'write-text-safely',
  'pathlib-paths',
  'json-roundtrip',
  'csv-rows',
  'dirs-and-globs',
  'creation-log-scrubber',
  'argv-and-env',
  'exit-codes-and-stderr',
  'datetime-and-stamps',
  'subprocess-idea',
  'transfer-report-tool',
  'module-is-a-file',
  'import-forms',
  'main-guard',
  'packages-and-init',
  'stdlib-tour',
  'venv-and-dependencies',
  'class-and-instance',
  'init-and-attributes',
  'methods-and-self',
  'class-vs-instance-attr',
  'dunder-str-and-repr',
  'equality-and-hash',
  'dataclasses',
  'properties-not-getters',
  'inheritance-basics',
  'super-and-mro',
  'composition-over-inheritance',
  'transfer-model-a-station',
  'objects-and-references',
  'mutability-and-aliasing',
  'copy-shallow-vs-deep',
  'iterables-and-iterators',
  'generators-yield',
  'generator-pipelines',
  'itertools-basics',
  'decorators-basics',
  'decorators-with-args',
  'context-managers',
  'type-hints',
  'transfer-lazy-reader',
  'blocking-vs-waiting',
  'async-def-await',
  'gather-concurrency',
  'threads-vs-processes',
  'debug-forgotten-await',
  'assert-and-aaa',
  'fixtures-and-hidden-tests',
  'mocking-time-and-io',
  'docstrings-contracts',
  'logging-not-print',
  'measure-then-change',
  'security-paths-and-eval',
  'transfer-test-the-fox',
  'capstone-field-station'
]

const manifest = packManifestSchema.parse(JSON.parse(readFileSync(join(packRoot, 'pack.json'), 'utf8')))
const courses = readdirSync(join(packRoot, 'courses'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => courseSchema.parse(JSON.parse(readFileSync(join(packRoot, 'courses', f), 'utf8'))))
const tracks = readdirSync(join(packRoot, 'tracks'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => trackSchema.parse(JSON.parse(readFileSync(join(packRoot, 'tracks', f), 'utf8'))))
const skills = JSON.parse(readFileSync(join(packRoot, 'skills.json'), 'utf8')) as { id: string; prereqIds: string[] }[]
const misconceptions = JSON.parse(readFileSync(join(packRoot, 'misconceptions.json'), 'utf8')) as {
  id: string
  skillIds: string[]
  followUpLessonId: string
}[]

const byCourseId = new Map(courses.map((c) => [c.id, c]))
const trackOrder = manifest.tracks ?? []
const pathOrder = trackOrder.flatMap((trackId) => {
  const track = tracks.find((t) => t.id === trackId)
  if (!track) return []
  return track.courseIds.flatMap((courseId) => byCourseId.get(courseId)?.modules.flatMap((m) => m.lessonIds) ?? [])
})

// Content assertions run over what is on disk so a half-written pack reports the
// real problem — one missing-lesson failure — instead of a hundred read errors.
export const AUTHORED = EXPECTED.filter((id) => existsSync(join(packRoot, 'lessons', id, 'lesson.json')))

function lessonDoc(id: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8'))
}

describe('python zero-to-hero catalog', () => {
  it('lists every locked lesson id in courses and on disk', () => {
    const listed = courses.flatMap((c) => c.modules.flatMap((m) => m.lessonIds))
    expect(listed.sort()).toEqual([...EXPECTED].sort())
    const trackCourses = tracks.flatMap((t) => t.courseIds)
    expect(new Set(trackCourses).size).toBe(courses.length)
    const absent = EXPECTED.filter((id) => !AUTHORED.includes(id))
    expect(absent, `lessons not authored yet:\n${absent.join('\n')}`).toEqual([])
  })

  it('parses every authored lesson and grades its code with a hidden test', () => {
    for (const id of AUTHORED) {
      const raw = lessonDoc(id)
      const lesson = lessonSchema.parse(raw)
      expect(() => parseLessonBlocks(raw.blocks as unknown[])).not.toThrow()
      expect(lesson.id).toBe(id)
      expect(lesson.packId).toBe('lawp.python.foundations')
      const code = (raw.blocks as { type: string }[]).filter((b) => b.type === 'code' || b.type === 'debug')
      for (const block of code as unknown as {
        engine: string
        files: { role: string; path: string }[]
        checks: { type: string }[]
      }[]) {
        expect(block.engine, `${id} engine`).toBe('python')
        expect(block.files.filter((f) => f.role === 'edit').length, `${id} edit files`).toBe(1)
        expect(block.files.some((f) => f.role === 'hidden-test'), `${id} hidden`).toBe(true)
        expect(block.checks.some((c) => c.type === 'python-assert'), `${id} python-assert`).toBe(true)
      }
    }
  })

  it('walks tracks, courses, and modules in the locked path order', () => {
    expect(pathOrder).toEqual(EXPECTED)
    expect(new Set(EXPECTED).size).toBe(EXPECTED.length)
    const seen = new Set<string>()
    for (const track of tracks) {
      expect(track.courseIds.length, track.id).toBeGreaterThan(0)
      for (const courseId of track.courseIds) {
        expect(byCourseId.has(courseId), courseId).toBe(true)
        expect(seen.has(courseId), `${courseId} listed twice`).toBe(false)
        seen.add(courseId)
      }
    }
    expect(new Set(trackOrder).size).toBe(tracks.length)
  })

  it('teaches values, then collections, then structure, then internals', () => {
    const track = (id: string) => trackOrder.indexOf(id)
    expect(track('foundations')).toBe(0)
    expect(track('fluency')).toBeLessThan(track('the-machine'))
    expect(track('the-machine')).toBeLessThan(track('structure'))
    expect(track('structure')).toBeLessThan(track('language'))
    expect(track('language')).toBeLessThan(track('craft'))
    const at = (id: string) => EXPECTED.indexOf(id)
    // Nobody meets a comprehension before a loop, or a class before a function.
    expect(at('for-over-range')).toBeLessThan(at('comprehensions-list'))
    expect(at('def-and-return')).toBeLessThan(at('lists-index-slice'))
    expect(at('lists-index-slice')).toBeLessThan(at('class-and-instance'))
    // Errors and files come before anything that writes to disk for real.
    expect(at('try-except-specific')).toBeLessThan(at('open-and-with'))
    expect(at('open-and-with')).toBeLessThan(at('json-roundtrip'))
    // Laziness is taught after the eager version of the same idea.
    expect(at('comprehensions-list')).toBeLessThan(at('generators-yield'))
    expect(at('closures-and-nonlocal')).toBeLessThan(at('decorators-basics'))
    expect(at('open-and-with')).toBeLessThan(at('context-managers'))
    expect(at('main-guard')).toBeLessThan(at('packages-and-init'))
    expect(at('read-the-traceback')).toBeLessThan(at('debug-swallowed-error'))
    expect(EXPECTED.at(-1)).toBe('capstone-field-station')
  })

  it('declares every lesson file it references', () => {
    for (const id of AUTHORED) {
      const raw = lessonDoc(id)
      const blocks = raw.blocks as { type: string; files?: { path: string; contents?: string }[] }[]
      for (const block of blocks) {
        for (const file of block.files ?? []) {
          if (file.contents !== undefined) continue
          const onDisk = join(packRoot, 'lessons', id, file.path)
          expect(existsSync(onDisk), `${id} -> ${file.path}`).toBe(true)
        }
      }
    }
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
    for (const id of AUTHORED) {
      const raw = lessonDoc(id)
      for (const s of (raw.skillIds as string[]) ?? []) expect(skillIds.has(s), `${id} skill ${s}`).toBe(true)
      for (const found of JSON.stringify(raw).matchAll(/"misconceptionId":"([^"]+)"/g)) used.add(found[1])
      const creation = raw.creation as { id: string; step: number } | undefined
      if (creation) creationSteps.set(creation.id, [...(creationSteps.get(creation.id) ?? []), creation.step])
    }
    for (const id of used) expect(misconceptionIds.has(id), `unknown misconception ${id}`).toBe(true)
    if (AUTHORED.length === EXPECTED.length) {
      // No dead entries: every authored misconception is reachable from a wrong answer.
      for (const id of misconceptionIds) expect(used.has(id), `unused misconception ${id}`).toBe(true)
      for (const course of courses) {
        if (!course.creationId) continue
        expect(creationSteps.has(course.creationId), `${course.id} creation`).toBe(true)
      }
    }
  })

  it('puts the diagnostic first and marks its questions as diagnostic', () => {
    expect(EXPECTED[0]).toBe('py-placement')
    const placement = courses.find((c) => c.id === 'placement')
    expect(placement?.diagnosticLessonId).toBe('py-placement')
    const raw = lessonDoc('py-placement')
    const checks = (
      raw.blocks as { type: string; id?: string; diagnostic?: boolean; explainMd?: string }[]
    ).filter((b) => b.type === 'check' || b.type === 'predict')
    expect(checks.length).toBeGreaterThanOrEqual(8)
    for (const check of checks) {
      expect(check.diagnostic, 'diagnostic flag').toBe(true)
      // A diagnostic is the one place a learner can be wrong and move on, so the
      // review has to teach the answer rather than just reveal it.
      expect((check.explainMd ?? '').length, `${check.id} explainMd`).toBeGreaterThan(80)
    }
    for (const id of AUTHORED.filter((l) => l !== 'py-placement')) {
      const blocks = lessonDoc(id).blocks as { diagnostic?: boolean }[]
      expect(blocks.some((b) => b.diagnostic), id).toBe(false)
    }
  })

  it('teaches, asks, and offers a complete hint ladder', () => {
    const noExplain: string[] = []
    const noRetrieval: string[] = []
    const thinLadder: string[] = []
    const thinReview: string[] = []
    for (const id of AUTHORED) {
      const raw = lessonDoc(id)
      const blocks = raw.blocks as {
        type: string
        id?: string
        explainMd?: string
        hintLadder?: { level: number; kind: string }[]
      }[]
      const kinds = blocks.map((b) => b.type)
      if (!kinds.includes('explain')) noExplain.push(id)
      if (!kinds.some((k) => k === 'check' || k === 'predict' || k === 'activity')) noRetrieval.push(id)
      for (const block of blocks) {
        if (block.type === 'check' || block.type === 'predict') {
          // Review copy has to say why, not just which one was right.
          if ((block.explainMd ?? '').length < 100) thinReview.push(`${id}/${block.id}`)
          continue
        }
        if (block.type !== 'code' && block.type !== 'debug') continue
        const levels = (block.hintLadder ?? []).map((h) => h.level).sort((a, b) => a - b)
        const contiguous = levels.every((lvl, i) => lvl === i + 1)
        const hasAssist = (block.hintLadder ?? []).some((h) => h.kind === 'assist')
        if (levels.length < 4 || !contiguous || !hasAssist) {
          thinLadder.push(`${id}/${block.id}: levels ${levels.join(',') || 'none'}`)
        }
      }
    }
    expect(noExplain, `lessons with no teaching: ${noExplain.join(', ')}`).toEqual([])
    expect(noRetrieval, `lessons that never ask anything: ${noRetrieval.join(', ')}`).toEqual([])
    expect(thinLadder, `incomplete hint ladders:\n${thinLadder.join('\n')}`).toEqual([])
    expect(thinReview, `review copy too thin:\n${thinReview.join('\n')}`).toEqual([])
  })

  it('keeps transfer, creation, and capstone lessons labelled as such', () => {
    for (const id of AUTHORED.filter((l) => l.startsWith('transfer-'))) {
      const raw = lessonDoc(id) as { mastery?: { requiresTransfer?: boolean } }
      expect(raw.mastery?.requiresTransfer, id).toBe(true)
    }
    for (const id of AUTHORED.filter((l) => l.startsWith('creation-') || l === 'capstone-field-station')) {
      const raw = lessonDoc(id) as { creation?: { id: string } }
      expect(raw.creation?.id, id).toBeTruthy()
    }
  })
})
