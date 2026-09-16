import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PACK = 'lawp.python.foundations'
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'resources', 'packs', PACK, 'lessons')

/** Play-kit sprites the grid lessons bind through `assetMap`. */
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
  // A transfer or capstone is the course's proof of understanding, so it carries
  // `requiresTransfer` by default rather than waiting for an author to remember.
  const proves = /^(transfer|capstone)-/.test(partial.id ?? '')
  return {
    kind: 'lesson',
    schemaVersion: 1,
    packId: PACK,
    taskRev: 1,
    estimatedMinutes: 18,
    skillIds: [],
    ...(proves ? { mastery: { requiresTransfer: true, minCorrectIndependent: 1 } } : {}),
    ...partial
  }
}

export function explain(md) {
  return { type: 'explain', md }
}

/** Studio highlights a fenced block. Always tag the language — a bare fence looks like leftover ticks. */
export function fence(lang, code) {
  return '```' + lang + '\n' + String(code).replace(/^\n/, '').replace(/\n$/, '') + '\n```'
}

/**
 * The teaching shape every explain owes: named idea, the failure it causes, a
 * worked example you can read, and the mistake to avoid.
 */
export function teach({ heading, idea, bites, code, lang = 'python', mistake }) {
  return explain([`## ${heading}`, '', idea, '', bites, '', fence(lang, code), '', mistake].join('\n'))
}

export function predict(id, promptMd, choices, answer, extra = {}) {
  return {
    type: 'predict',
    id,
    promptMd,
    kind: 'mcq',
    choices: choices.map((c) =>
      typeof c === 'string' ? { id: c, md: c } : { id: c.id, md: c.md, ...(c.misconceptionId ? { misconceptionId: c.misconceptionId } : {}) }
    ),
    answer,
    ...(extra.explainMd ? { explainMd: extra.explainMd } : {}),
    ...(extra.misconceptionId ? { misconceptionId: extra.misconceptionId } : {}),
    ...(extra.skillIds ? { skillIds: extra.skillIds } : {})
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
    ...(extra.misconceptionId ? { misconceptionId: extra.misconceptionId } : {})
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

export function reflect(id, promptMd) {
  return { type: 'reflect', id, promptMd }
}

export function hints(...rows) {
  return rows.map((r, i) => {
    if (typeof r === 'string') return { level: Math.min(5, i + 1), kind: i >= 3 ? 'assist' : 'concept', md: r }
    return r
  })
}

/**
 * Orient, then the rule, then a *different* example, then the answer. The assist
 * rung is the whole working file: the solutions test pastes it in and runs it.
 */
export function ladder(orient, concept, example, assist) {
  return hints(
    { level: 1, kind: 'concept', md: orient },
    { level: 2, kind: 'concept', md: concept },
    { level: 3, kind: 'concept', md: example },
    { level: 4, kind: 'assist', md: assist }
  )
}

function codeFiles(opts) {
  const files = [{ path: 'files/main.py', role: 'edit' }]
  if (opts.hidden) files.push({ path: 'files/hidden_test.py', role: 'hidden-test' })
  if (opts.roFiles) files.push(...opts.roFiles.map((name) => ({ path: `files/${name}`, role: 'ro' })))
  if (opts.fixtures) files.push(...opts.fixtures.map((name) => ({ path: `files/${name}`, role: 'fixture' })))
  if (opts.extraFiles) files.push(...opts.extraFiles)
  return files
}

/** Stdout / hidden-assert lesson. `equals` is compared trimmed, so no trailing-newline traps. */
export function pyCode(opts) {
  const checks = []
  if (opts.equals !== undefined) {
    checks.push({
      type: 'stdout',
      equals: opts.equals,
      ...(opts.misconceptionId ? { misconceptionId: opts.misconceptionId } : {})
    })
  }
  if (opts.pattern) checks.push({ type: 'stdout-regex', pattern: opts.pattern })
  if (opts.ast) checks.push({ type: 'ast', query: opts.ast })
  if (opts.hidden) checks.push({ type: 'python-assert' })
  return {
    type: opts.debug ? 'debug' : 'code',
    id: opts.id,
    engine: 'python',
    entry: opts.entry ?? 'main.py',
    promptMd: opts.prompt,
    files: codeFiles(opts),
    checks,
    hintLadder: opts.hints ?? [],
    ...(opts.argv ? { argv: opts.argv } : {}),
    ...(opts.env ? { env: opts.env } : {}),
    ...(opts.timeoutMs ? { timeoutMs: opts.timeoutMs } : {})
  }
}

function assertPlayGoalStartsOpen(world, goal, id) {
  if (!world || !goal?.all?.length) return
  const player = world.parts.find((p) => p.id === 'fox')
  const gx = goal.all.find((p) => p.path === 'fox.x' && p.op === 'eq')
  const gy = goal.all.find((p) => p.path === 'fox.y' && p.op === 'eq')
  if (player && gx && gy && player.props.x === gx.value && player.props.y === gy.value) {
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

/** Fox-on-the-grid lesson. The learner writes Python; `Player` is injected by the runner. */
export function playCode(opts) {
  assertPlayGoalStartsOpen(opts.world, opts.goal, opts.id)
  const checks = []
  if (opts.ast) checks.push({ type: 'ast', query: opts.ast })
  if (opts.hidden) checks.push({ type: 'python-assert' })
  return {
    type: opts.debug ? 'debug' : 'code',
    id: opts.id,
    engine: 'python',
    entry: 'main.py',
    promptMd: opts.prompt,
    files: codeFiles(opts),
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

/**
 * Hidden test body. `import main` re-runs the learner's file, but that second
 * run's stdout is discarded by the grader — only its exit code matters.
 */
export function importAssert(body) {
  return `import main\n\n${body.trim()}\n`
}

/** Source-level assertions for when the *how* is the lesson, not only the output. */
export function srcIncludes(...needles) {
  const lines = needles
    .map((n) => `assert ${JSON.stringify(n)} in src, "expected your code to use " + ${JSON.stringify(n)}`)
    .join('\n')
  return `from pathlib import Path\n\nsrc = Path("main.py").read_text(encoding="utf-8")\n${lines}\n`
}

export function srcExcludes(...needles) {
  const lines = needles
    .map((n) => `assert ${JSON.stringify(n)} not in src, "do not use " + ${JSON.stringify(n)}`)
    .join('\n')
  return `from pathlib import Path\n\nsrc = Path("main.py").read_text(encoding="utf-8")\n${lines}\n`
}

export function playLogOk(extra = '') {
  return `import json
from pathlib import Path

log = json.loads(Path("play-log.json").read_text(encoding="utf-8"))
assert isinstance(log, list) and log, "expected play commands"
assert not any(row.get("op") == "fault" for row in log), "play log has a fault"
${extra}
`
}

const CARD_COPY = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'lesson-card-copy.json'), 'utf8')
)

export function writeLesson(doc, diskFiles) {
  const dir = join(ROOT, doc.id)
  mkdirSync(join(dir, 'files'), { recursive: true })
  const description = CARD_COPY[PACK]?.[doc.id]
  writeFileSync(join(dir, 'lesson.json'), JSON.stringify(description ? { ...doc, description } : doc, null, 2) + '\n')
  for (const [name, contents] of Object.entries(diskFiles ?? {})) {
    const file = join(dir, 'files', name)
    // A fixture may sit in a subfolder — `data/station.log` — which the sandbox
    // handles but this writer used to throw on.
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, contents.endsWith('\n') ? contents : contents + '\n')
  }
}
