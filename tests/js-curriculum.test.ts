import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'
import { courseSchema, packManifestSchema, trackSchema } from '@shared/schemas/pack'

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.javascript.foundations')

export const EXPECTED = [
  'js-placement',
  'values-and-typeof',
  'names-let-const',
  'strings-and-templates',
  'numbers-and-nan',
  'triple-equals',
  'truth-and-if',
  'transfer-classify-signal',
  'functions-call',
  'beacon-call',
  'return-not-print',
  'parameters-and-defaults',
  'loops-for',
  'loops-while-break',
  'keyed-beacon',
  'debug-off-by-one-path',
  'arrays-index',
  'arrays-map',
  'arrays-filter-find',
  'arrays-reduce-once',
  'objects-props',
  'reference-vs-copy',
  'destructure-spread',
  'json-roundtrip',
  'signal-log',
  'scope-and-tdz',
  'closures-radio',
  'callbacks-as-commands',
  'arrow-vs-function',
  'higher-order-route',
  'stale-closure-debug',
  'transfer-command-table',
  'throw-and-catch',
  'finally-and-rethrow',
  'custom-errors',
  'debug-read-the-stack',
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
  'stack-vs-heap',
  'macrotasks-timeout',
  'microtasks-then',
  'promises-states',
  'async-await',
  'async-errors',
  'parallel-vs-sequence',
  'async-iterators',
  'transfer-beacon-dispatch',
  'debug-forgotten-await',
  'tree-not-string',
  'query-and-update',
  'create-and-remove',
  'events-bubble',
  'delegation',
  'forms-and-input',
  'a11y-name-and-role',
  'xss-text-vs-html',
  'transfer-filter-list-ui',
  'creation-signal-board',
  'http-as-messages',
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
  'error-first-and-promises',
  'transfer-clean-a-log',
  'creation-log-scrubber',
  'assert-and-aaa',
  'fixtures-and-hidden-tests',
  'mocking-time-and-fs',
  'why-bundlers',
  'modules-esm-files',
  'ast-and-lint',
  'proto-pollution',
  'measure-then-change',
  'jsdoc-contracts',
  'transfer-test-the-fox',
  'capstone-signal-ops'
]

describe('javascript expert catalog', () => {
  it('lists every locked lesson id in courses and on disk', () => {
    packManifestSchema.parse(JSON.parse(readFileSync(join(packRoot, 'pack.json'), 'utf8')))
    const courses = readdirSync(join(packRoot, 'courses'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => courseSchema.parse(JSON.parse(readFileSync(join(packRoot, 'courses', f), 'utf8'))))
    const tracks = readdirSync(join(packRoot, 'tracks'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => trackSchema.parse(JSON.parse(readFileSync(join(packRoot, 'tracks', f), 'utf8'))))
    const listed = courses.flatMap((c) => c.modules.flatMap((m) => m.lessonIds))
    expect(listed.sort()).toEqual([...EXPECTED].sort())
    const trackCourses = tracks.flatMap((t) => t.courseIds)
    expect(new Set(trackCourses).size).toBe(courses.length)
    for (const id of EXPECTED) {
      const file = join(packRoot, 'lessons', id, 'lesson.json')
      expect(existsSync(file), id).toBe(true)
      const raw = JSON.parse(readFileSync(file, 'utf8'))
      const lesson = lessonSchema.parse(raw)
      expect(() => parseLessonBlocks(raw.blocks)).not.toThrow()
      expect(lesson.id).toBe(id)
      const code = raw.blocks.filter((b: { type: string }) => b.type === 'code' || b.type === 'debug')
      for (const block of code) {
        const files = block.files as { role: string }[]
        expect(files.some((f) => f.role === 'hidden-test'), `${id} hidden`).toBe(true)
        expect((block.checks as { type: string }[]).some((c) => c.type === 'js-assert'), `${id} js-assert`).toBe(true)
      }
    }
  })
})
