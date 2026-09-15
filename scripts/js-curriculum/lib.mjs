import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PACK = 'lawp.javascript.foundations'
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'resources', 'packs', PACK, 'lessons')

export const ASSETS = {
  fox: 'fox.png',
  owl: 'owl.png',
  robot: 'robot.png',
  beacon: 'beacon.png',
  rock: 'rock.png',
  wall: 'wall.png',
  crate: 'crate.png',
  tree: 'tree.png',
  bush: 'bush.png',
  barrel: 'barrel.png',
  coin: 'coin.png',
  key: 'key.png',
  glint: 'glint.png',
  gem: 'gem.png',
  star: 'star.png',
  scroll: 'scroll.png',
  chest: 'chest.png',
  flag: 'flag.png',
  spike: 'spike.png',
  fire: 'fire.png',
  hole: 'hole.png'
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

export function wall(id, x, y) {
  return { id, type: 'wall', props: { x, y, solid: true } }
}

export function tree(id, x, y) {
  return { id, type: 'tree', props: { x, y, solid: true } }
}

export function token(id, type, x, y) {
  return { id, type, props: { x, y, collect: true, taken: false, label: id } }
}

export function piece(id, type, x, y, extra = {}) {
  return { id, type, props: { x, y, ...extra } }
}

export function gridWorld(parts, cols = 5, rows = 5, floor = 'floor-stone') {
  return {
    parts,
    connections: [],
    actions: [],
    rules: [],
    view: { kind: 'grid', grid: { cols, rows, floor }, assetMap: ASSETS }
  }
}

/** A yard the fox can walk. Extra kit pieces stay off the required path. */
export function field(parts, opts = {}) {
  return gridWorld(parts, opts.cols ?? 7, opts.rows ?? 5, opts.floor ?? 'floor-grass')
}

export function at(id, key, value) {
  return { path: `${id}.${key}`, op: 'eq', value }
}

export function lesson(partial) {
  return {
    kind: 'lesson',
    schemaVersion: 1,
    packId: PACK,
    taskRev: 2,
    estimatedMinutes: 18,
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
    ...(extra.hintLadder ? { hintLadder: extra.hintLadder } : {}),
    ...(extra.blanks ? { blanks: extra.blanks } : {})
  }
}

export function cloze(id, promptMd, blanks, answer, extra = {}) {
  return {
    type: 'check',
    id,
    kind: 'cloze',
    promptMd,
    blanks: blanks.map((b) => ({
      id: b.id,
      choices: (b.choices ?? []).map((c) => (typeof c === 'string' ? { id: c, md: c } : c))
    })),
    answer,
    ...(extra.explainMd ? { explainMd: extra.explainMd } : {}),
    ...(extra.skillIds ? { skillIds: extra.skillIds } : {})
  }
}

export function tf(id, promptMd, yes, extra = {}) {
  return {
    type: 'check',
    id,
    kind: 'tf',
    promptMd,
    answer: yes ? 'true' : 'false',
    ...(extra.explainMd ? { explainMd: extra.explainMd } : {}),
    ...(extra.skillIds ? { skillIds: extra.skillIds } : {}),
    ...(extra.misconceptionId ? { misconceptionId: extra.misconceptionId } : {})
  }
}

export function hints(...rows) {
  return rows.map((r, i) => {
    if (typeof r === 'string') return { level: Math.min(5, i + 1), kind: i >= 3 ? 'assist' : 'concept', md: r }
    return r
  })
}

export function ladder(orient, concept, example, assist) {
  return hints(
    { level: 1, kind: 'concept', md: orient },
    { level: 2, kind: 'concept', md: concept },
    { level: 3, kind: 'concept', md: example },
    { level: 4, kind: 'assist', md: assist }
  )
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

function assertPlayGoalStartsOpen(world, goal, id) {
  if (!world || !goal?.all?.length) return
  const fox = world.parts.find((p) => p.id === 'fox')
  const gx = goal.all.find((p) => p.path === 'fox.x' && p.op === 'eq')
  const gy = goal.all.find((p) => p.path === 'fox.y' && p.op === 'eq')
  if (fox && gx && gy && fox.props.x === gx.value && fox.props.y === gy.value) {
    throw new Error(`${id}: fox starts on the goal cell (${gx.value}, ${gy.value})`)
  }
  for (const p of goal.all) {
    if (p.path === 'fox.x' || p.path === 'fox.y') continue
    const [pid, key] = String(p.path).split('.')
    const part = world.parts.find((x) => x.id === pid)
    if (part && part.props[key] === p.value) {
      throw new Error(`${id}: goal ${p.path} already holds at start`)
    }
  }
}

export function playCode(opts) {
  assertPlayGoalStartsOpen(opts.world, opts.goal, opts.id)
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

const CARD_COPY = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'lesson-card-copy.json'), 'utf8')
)

export function writeLesson(doc, diskFiles) {
  const dir = join(ROOT, doc.id)
  mkdirSync(join(dir, 'files'), { recursive: true })
  const description = CARD_COPY[PACK]?.[doc.id]
  writeFileSync(join(dir, 'lesson.json'), JSON.stringify(description ? { ...doc, description } : doc, null, 2) + '\n')
  for (const [name, contents] of Object.entries(diskFiles)) {
    writeFileSync(join(dir, 'files', name), contents.endsWith('\n') ? contents : contents + '\n')
  }
}

export function srcIncludes(...needles) {
  return `;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  ${needles.map((n) => `assert.ok(src.includes(${JSON.stringify(n)}), 'expected source to include ' + ${JSON.stringify(n)})`).join('\n  ')}
})()
`
}

export function playLogOk(extra = '') {
  return `;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  ${extra}
})()
`
}

export const PAGE_STYLE = `html,body{margin:0}body{box-sizing:border-box;min-height:100%;font:16px/1.45 system-ui,"Segoe UI",sans-serif;color:#1c2430;background:#f3efe6;padding:16px 18px}.desk{background:#fff;border:1px solid #d8d1c3;border-radius:10px;padding:16px 18px;min-height:72px}.kicker{margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a7468}h1{font-size:22px;line-height:1.25;margin:0 0 .4em}p,li{margin:0 0 8px}ul{margin:0;padding-left:1.2em;min-height:2em}ul:empty{list-style:none;padding:12px;border:1px dashed #d8d1c3;border-radius:8px;color:#9a9386}ul:empty::after{content:"No items yet"}input,button,select,textarea{font:inherit}input,textarea{padding:6px 8px;border:1px solid #c9c2b4;border-radius:6px;background:#fff}button{padding:6px 12px;border:1px solid #2a6b63;border-radius:6px;background:#1a3d38;color:#e8fff8;cursor:pointer}label{display:block;font-size:12px;color:#6b6458;margin:0 0 4px}`

export function pageHtml(inner, kicker = 'Signal desk') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${PAGE_STYLE}</style></head><body><div class="desk"><p class="kicker">${kicker}</p>${inner}</div></body></html>\n`
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
