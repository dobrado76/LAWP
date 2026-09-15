import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'
import { courseSchema, packManifestSchema, trackSchema } from '@shared/schemas/pack'

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.javascript.foundations')

// The learner walks this exact order: tracks, then courses, then modules.
export const EXPECTED = [
  'js-placement',
  'values-and-typeof',
  'names-let-const',
  'strings-and-templates',
  'numbers-and-nan',
  'triple-equals',
  'truth-and-if',
  'short-circuit',
  'optional-chaining',
  'transfer-classify-signal',
  'functions-call',
  'beacon-call',
  'return-not-print',
  'parameters-and-defaults',
  'loops-for',
  'loops-while-break',
  'switch-dispatch',
  'keyed-beacon',
  'debug-off-by-one-path',
  'arrays-index',
  'arrays-map',
  'arrays-filter-find',
  'arrays-reduce-once',
  'objects-props',
  'object-key-iteration',
  'set-and-map',
  'reference-vs-copy',
  'destructure-spread',
  'json-roundtrip',
  'signal-log',
  'scope-and-tdz',
  'closures-radio',
  'stale-closure-debug',
  'callbacks-as-commands',
  'arrow-vs-function',
  'higher-order-route',
  'transfer-command-table',
  'throw-and-catch',
  'finally-and-rethrow',
  'custom-errors',
  'debug-read-the-stack',
  'stack-vs-heap',
  'macrotasks-timeout',
  'microtasks-then',
  'promises-states',
  'async-await',
  'async-errors',
  'parallel-vs-sequence',
  'promise-combinators',
  'async-iterators',
  'transfer-beacon-dispatch',
  'debug-forgotten-await',
  'tree-not-string',
  'query-and-update',
  'create-and-remove',
  'events-bubble',
  'delegation',
  'forms-and-input',
  'prevent-default',
  'a11y-name-and-role',
  'xss-text-vs-html',
  'transfer-filter-list-ui',
  'creation-signal-board',
  'http-as-messages',
  'method-and-headers',
  'fetch-ok-and-fail',
  'json-body',
  'abort-and-timeout',
  'cors-mental-model',
  'transfer-library-search',
  'process-argv-env',
  'fs-read-write',
  'paths-and-encoding',
  'buffers-vs-strings',
  'streams-idea',
  'cjs-vs-esm-node',
  'why-bundlers',
  'modules-esm-files',
  'error-first-and-promises',
  'regex-lines',
  'transfer-clean-a-log',
  'creation-log-scrubber',
  'coercion-to-primitive',
  'prototypes-chain',
  'new-and-create',
  'classes-syntax',
  'this-call-apply-bind',
  'descriptors-get-set',
  'symbols',
  'weak-collections',
  'iterators-for-of',
  'generators',
  'proxies-reflect',
  'transfer-model-a-part',
  'assert-and-aaa',
  'fixtures-and-hidden-tests',
  'mocking-time-and-fs',
  'ast-and-lint',
  'proto-pollution',
  'measure-then-change',
  'jsdoc-contracts',
  'transfer-test-the-fox',
  'capstone-signal-ops'
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

function lessonDoc(id: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(packRoot, 'lessons', id, 'lesson.json'), 'utf8'))
}

describe('javascript expert catalog', () => {
  it('lists every locked lesson id in courses and on disk', () => {
    const listed = courses.flatMap((c) => c.modules.flatMap((m) => m.lessonIds))
    expect(listed.sort()).toEqual([...EXPECTED].sort())
    const trackCourses = tracks.flatMap((t) => t.courseIds)
    expect(new Set(trackCourses).size).toBe(courses.length)
    for (const id of EXPECTED) {
      const file = join(packRoot, 'lessons', id, 'lesson.json')
      expect(existsSync(file), id).toBe(true)
      const raw = lessonDoc(id)
      const lesson = lessonSchema.parse(raw)
      expect(() => parseLessonBlocks(raw.blocks as unknown[])).not.toThrow()
      expect(lesson.id).toBe(id)
      const code = (raw.blocks as { type: string }[]).filter((b) => b.type === 'code' || b.type === 'debug')
      for (const block of code as unknown as { files: { role: string }[]; checks: { type: string }[] }[]) {
        expect(block.files.some((f) => f.role === 'hidden-test'), `${id} hidden`).toBe(true)
        expect(block.checks.some((c) => c.type === 'js-assert'), `${id} js-assert`).toBe(true)
      }
    }
  })

  it('walks tracks, courses, and modules in the locked path order', () => {
    expect(pathOrder).toEqual(EXPECTED)
    expect(new Set(EXPECTED).size).toBe(EXPECTED.length)
    // Every course belongs to exactly one track, and every track holds real courses.
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

  it('teaches the page and the process before the language internals', () => {
    const at = (id: string) => trackOrder.indexOf(id)
    expect(at('foundations')).toBe(0)
    expect(at('fluency')).toBeLessThan(at('the-page'))
    expect(at('the-page')).toBeLessThan(at('language'))
    expect(at('the-process')).toBeLessThan(at('language'))
    expect(at('language')).toBeLessThan(at('craft'))
    // Scope, errors, and the event loop all land before the first page lesson.
    const first = (id: string) => EXPECTED.indexOf(id)
    for (const id of ['closures-radio', 'throw-and-catch', 'async-await']) {
      expect(first(id), id).toBeLessThan(first('tree-not-string'))
    }
    // The module sequence is together, and ahead of testing and the capstone.
    for (const id of ['cjs-vs-esm-node', 'why-bundlers', 'modules-esm-files']) {
      expect(first(id), id).toBeLessThan(first('assert-and-aaa'))
    }
    expect(first('regex-lines')).toBeLessThan(first('transfer-clean-a-log'))
  })

  it('declares every lesson file it references', () => {
    for (const id of EXPECTED) {
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
    for (const id of EXPECTED) {
      const raw = lessonDoc(id)
      for (const s of (raw.skillIds as string[]) ?? []) expect(skillIds.has(s), `${id} skill ${s}`).toBe(true)
      for (const found of JSON.stringify(raw).matchAll(/"misconceptionId":"([^"]+)"/g)) used.add(found[1])
      const creation = raw.creation as { id: string; step: number } | undefined
      if (creation) creationSteps.set(creation.id, [...(creationSteps.get(creation.id) ?? []), creation.step])
    }
    for (const id of used) expect(misconceptionIds.has(id), `unknown misconception ${id}`).toBe(true)
    // No dead entries: every authored misconception is reachable from a wrong answer.
    for (const id of misconceptionIds) expect(used.has(id), `unused misconception ${id}`).toBe(true)
    for (const course of courses) {
      if (!course.creationId) continue
      expect(creationSteps.has(course.creationId), `${course.id} creation`).toBe(true)
    }
  })

  it('puts the diagnostic first and marks its questions as diagnostic', () => {
    expect(EXPECTED[0]).toBe('js-placement')
    const placement = courses.find((c) => c.id === 'placement')
    expect(placement?.diagnosticLessonId).toBe('js-placement')
    const raw = lessonDoc('js-placement')
    const checks = (
      raw.blocks as { type: string; id?: string; diagnostic?: boolean; skillIds?: string[]; explainMd?: string }[]
    ).filter((b) => b.type === 'check' || b.type === 'predict')
    expect(checks.length).toBeGreaterThanOrEqual(6)
    for (const check of checks) {
      expect(check.diagnostic, 'diagnostic flag').toBe(true)
      // A diagnostic is the one place a learner can be wrong and move on, so the
      // review has to teach the answer rather than just reveal it.
      expect((check.explainMd ?? '').length, `${check.id} explainMd`).toBeGreaterThan(80)
    }
    // No other lesson hides diagnostics, which would silently stop gating progress.
    for (const id of EXPECTED.filter((l) => l !== 'js-placement')) {
      const blocks = lessonDoc(id).blocks as { diagnostic?: boolean }[]
      expect(blocks.some((b) => b.diagnostic), id).toBe(false)
    }
  })
})
