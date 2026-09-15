import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PACK = 'lawp.javascript.foundations'
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'resources', 'packs', PACK, 'lessons')

export const ASSETS = {
  fox: 'fox.svg',
  beacon: 'beacon.svg',
  rock: 'rock.svg',
  coin: 'coin.svg',
  key: 'key.svg',
  glint: 'glint.svg'
}

export function fox(x = 0, y = 0, extra = {}) {
  return { id: 'fox', type: 'fox', props: { x, y, rot: 0, label: 'Fox', ...extra } }
}

export function beacon(x = 3, y = 2, extra = {}) {
  return { id: 'beacon', type: 'beacon', props: { x, y, label: 'Beacon', ...extra } }
}

export function rock(id, x, y) {
  return { id, type: 'rock', props: { x, y, solid: true } }
}

export function token(id, type, x, y) {
  return { id, type, props: { x, y, collect: true, taken: false, label: id } }
}

export function gridWorld(parts, cols = 5, rows = 5) {
  return {
    parts,
    connections: [],
    actions: [],
    rules: [],
    view: { kind: 'grid', grid: { cols, rows }, assetMap: ASSETS }
  }
}

export function at(id, key, value) {
  return { path: `${id}.${key}`, op: 'eq', value }
}

export function lesson(partial) {
  return {
    kind: 'lesson',
    schemaVersion: 1,
    packId: PACK,
    taskRev: 1,
    estimatedMinutes: 15,
    skillIds: [],
    ...partial
  }
}

export function explain(md) {
  return { type: 'explain', md }
}

export function predict(id, promptMd, choices, answer) {
  return {
    type: 'predict',
    id,
    promptMd,
    kind: 'mcq',
    choices: choices.map((c) =>
      typeof c === 'string' ? { id: c, md: c } : { id: c.id, md: c.md, ...(c.misconceptionId ? { misconceptionId: c.misconceptionId } : {}) }
    ),
    answer
  }
}

export function check(id, promptMd, choices, answer, extra = {}) {
  return {
    type: 'check',
    id,
    promptMd,
    kind: extra.kind ?? 'mcq',
    choices: choices.map((c) =>
      typeof c === 'string'
        ? { id: c, md: c }
        : { id: c.id, md: c.md, ...(c.misconceptionId ? { misconceptionId: c.misconceptionId } : {}) }
    ),
    answer,
    ...(extra.explainMd ? { explainMd: extra.explainMd } : {}),
    ...(extra.diagnostic ? { diagnostic: true } : {}),
    ...(extra.skillIds ? { skillIds: extra.skillIds } : {}),
    ...(extra.hintLadder ? { hintLadder: extra.hintLadder } : {})
  }
}

export function hints(...rows) {
  return rows.map((r, i) => {
    if (typeof r === 'string') return { level: Math.min(5, i + 1), kind: i >= 3 ? 'assist' : 'concept', md: r }
    return r
  })
}

export function stdoutCode(opts) {
  const files = [{ path: 'files/main.js', role: 'edit' }]
  if (opts.hidden) files.push({ path: 'files/hidden.test.js', role: 'hidden-test' })
  if (opts.extraFiles) files.push(...opts.extraFiles)
  const checks = []
  if (opts.equals !== undefined) checks.push({ type: 'stdout', equals: opts.equals, ...(opts.misconceptionId ? { misconceptionId: opts.misconceptionId } : {}) })
  if (opts.pattern) checks.push({ type: 'stdout-regex', pattern: opts.pattern })
  if (opts.ast) checks.push({ type: 'ast', query: opts.ast })
  if (opts.hidden) checks.push({ type: 'js-assert' })
  return {
    type: opts.debug ? 'debug' : 'code',
    id: opts.id,
    engine: 'javascript',
    entry: opts.entry ?? 'main.js',
    promptMd: opts.prompt,
    files,
    checks,
    hintLadder: opts.hints ?? [],
    ...(opts.argv ? { argv: opts.argv } : {}),
    ...(opts.env ? { env: opts.env } : {}),
    ...(opts.timeoutMs ? { timeoutMs: opts.timeoutMs } : {})
  }
}

export function playCode(opts) {
  const files = [{ path: 'files/main.js', role: 'edit' }]
  if (opts.hidden) files.push({ path: 'files/hidden.test.js', role: 'hidden-test' })
  if (opts.extraFiles) files.push(...opts.extraFiles)
  const checks = []
  if (opts.ast) checks.push({ type: 'ast', query: opts.ast })
  if (opts.hidden) checks.push({ type: 'js-assert' })
  return {
    type: opts.debug ? 'debug' : 'code',
    id: opts.id,
    engine: 'javascript',
    entry: 'main.js',
    promptMd: opts.prompt,
    files,
    checks,
    hintLadder: opts.hints ?? [],
    play: {
      api: 'player-v1',
      playerId: 'fox',
      world: opts.world,
      goal: opts.goal,
      ...(opts.guided ? { guided: true } : {}),
      ...(opts.scaleValues ? { scaleValues: opts.scaleValues } : {})
    }
  }
}

export function domCode(opts) {
  const files = [
    { path: 'files/index.html', role: 'fixture' },
    { path: 'files/main.js', role: 'edit' }
  ]
  if (opts.hidden) files.push({ path: 'files/hidden.test.js', role: 'hidden-test' })
  if (opts.extraFiles) files.push(...opts.extraFiles)
  return {
    type: 'code',
    id: opts.id,
    engine: 'javascript',
    entry: 'main.js',
    promptMd: opts.prompt,
    preview: { kind: 'iframe' },
    files,
    checks: opts.hidden ? [{ type: 'js-assert' }] : [],
    hintLadder: opts.hints ?? []
  }
}

export function esmCode(opts) {
  const files = (opts.editFiles ?? ['main.mjs']).map((name) => ({ path: `files/${name}`, role: 'edit' }))
  if (opts.roFiles) files.push(...opts.roFiles.map((name) => ({ path: `files/${name}`, role: 'ro' })))
  if (opts.hidden) files.push({ path: `files/${opts.hiddenName ?? 'hidden.test.mjs'}`, role: 'hidden-test' })
  if (opts.extraFiles) files.push(...opts.extraFiles)
  const checks = []
  if (opts.equals !== undefined) checks.push({ type: 'stdout', equals: opts.equals })
  if (opts.hidden) checks.push({ type: 'js-assert' })
  if (opts.ast) checks.push({ type: 'ast', query: opts.ast })
  return {
    type: 'code',
    id: opts.id,
    engine: 'javascript',
    entry: opts.entry ?? 'main.mjs',
    promptMd: opts.prompt,
    files,
    checks,
    hintLadder: opts.hints ?? [],
    ...(opts.play ? { play: { api: 'player-v1', playerId: 'fox', ...opts.play } } : {})
  }
}

export function activityBlock(opts) {
  return {
    type: 'activity',
    id: opts.id,
    kind: opts.kind ?? 'experiment',
    engine: 'world-v1',
    promptMd: opts.prompt,
    skillIds: opts.skillIds ?? [],
    constraintMode: opts.constraintMode ?? 'final',
    ...(opts.predict ? { predict: opts.predict } : {}),
    world: opts.world,
    goal: opts.goal,
    ...(opts.constraints ? { constraints: opts.constraints } : {}),
    explainAfter: { promptMd: opts.explainAfter ?? 'Which light fired first, and why?' },
    hintLadder: opts.hints ?? [],
    ...(opts.misconceptionMap ? { misconceptionMap: opts.misconceptionMap } : {})
  }
}

export function reflect(id, promptMd) {
  return { type: 'reflect', id, promptMd }
}

export function writeLesson(doc, diskFiles) {
  const dir = join(ROOT, doc.id)
  mkdirSync(join(dir, 'files'), { recursive: true })
  writeFileSync(join(dir, 'lesson.json'), JSON.stringify(doc, null, 2) + '\n')
  for (const [name, contents] of Object.entries(diskFiles)) {
    writeFileSync(join(dir, 'files', name), contents.endsWith('\n') ? contents : contents + '\n')
  }
}

export function srcIncludes(...needles) {
  return `const fs = require('fs')
const assert = require('assert')
const src = fs.readFileSync('main.js', 'utf8')
${needles.map((n) => `assert.ok(src.includes(${JSON.stringify(n)}), 'expected source to include ' + ${JSON.stringify(n)})`).join('\n')}
`
}

export function playLogOk(extra = '') {
  return `const fs = require('fs')
const assert = require('assert')
const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
${extra}
`
}

export function exportAssert(body) {
  return `const assert = require('assert')
const m = require('./main.js')
${body}
`
}

export function asyncAssert(body) {
  return `const assert = require('assert')
const m = require('./main.js')
async function main() {
${body}
}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
`
}

export function deskWorld() {
  return {
    parts: [
      { id: 'desk', type: 'meter', props: { step: 0, fault: 0, pick: 0, label: 'Dispatch desk' } },
      { id: 'sync', type: 'lamp', props: { on: 0, brightness: 1, label: '1 · Sync work' } },
      { id: 'micro', type: 'lamp', props: { on: 0, brightness: 1, label: '2 · promise.then' } },
      { id: 'macro', type: 'lamp', props: { on: 0, brightness: 1, label: '3 · setTimeout' } }
    ],
    connections: [],
    actions: [
      { id: 'pick-sync', label: 'Run the sync call', target: 'desk', op: 'set', key: 'pick', values: [1] },
      { id: 'pick-micro', label: 'Flush promise.then', target: 'desk', op: 'set', key: 'pick', values: [2] },
      { id: 'pick-macro', label: 'Fire the timeout', target: 'desk', op: 'set', key: 'pick', values: [3] }
    ],
    rules: [
      {
        id: 'sync-ok',
        when: [
          { path: 'desk.pick', op: 'eq', value: 1 },
          { path: 'desk.step', op: 'eq', value: 0 }
        ],
        set: [
          { target: 'sync', key: 'on', value: 1 },
          { target: 'sync', key: 'brightness', value: 2 },
          { target: 'desk', key: 'step', value: 1 },
          { target: 'desk', key: 'pick', value: 0 }
        ]
      },
      {
        id: 'micro-ok',
        when: [
          { path: 'desk.pick', op: 'eq', value: 2 },
          { path: 'desk.step', op: 'eq', value: 1 }
        ],
        set: [
          { target: 'micro', key: 'on', value: 1 },
          { target: 'micro', key: 'brightness', value: 2 },
          { target: 'desk', key: 'step', value: 2 },
          { target: 'desk', key: 'pick', value: 0 }
        ]
      },
      {
        id: 'macro-ok',
        when: [
          { path: 'desk.pick', op: 'eq', value: 3 },
          { path: 'desk.step', op: 'eq', value: 2 }
        ],
        set: [
          { target: 'macro', key: 'on', value: 1 },
          { target: 'macro', key: 'brightness', value: 2 },
          { target: 'desk', key: 'step', value: 3 },
          { target: 'desk', key: 'pick', value: 0 }
        ]
      },
      {
        id: 'sync-wrong',
        when: [
          { path: 'desk.pick', op: 'eq', value: 1 },
          { path: 'desk.step', op: 'neq', value: 0 }
        ],
        set: [{ target: 'desk', key: 'fault', value: 1 }]
      },
      {
        id: 'micro-wrong',
        when: [
          { path: 'desk.pick', op: 'eq', value: 2 },
          { path: 'desk.step', op: 'neq', value: 1 }
        ],
        set: [{ target: 'desk', key: 'fault', value: 1 }]
      },
      {
        id: 'macro-wrong',
        when: [
          { path: 'desk.pick', op: 'eq', value: 3 },
          { path: 'desk.step', op: 'neq', value: 2 }
        ],
        set: [{ target: 'desk', key: 'fault', value: 1 }]
      }
    ],
    view: { kind: 'list' }
  }
}

export const deskGoal = {
  all: [at('sync', 'on', 1), at('micro', 'on', 1), at('macro', 'on', 1), at('desk', 'fault', 0)]
}
