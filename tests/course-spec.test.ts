import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The subject-agnostic bars from `docs/COURSE_SPEC.md`, held against every
 * bundled pack at once. The per-subject suites (`py-curriculum`,
 * `js-curriculum`, `circuits-curriculum`) own each path and its content; this
 * file owns the rules that apply no matter what the subject is, so a new pack
 * inherits them without anyone remembering to copy a test.
 */

const packsRoot = join(process.cwd(), 'resources', 'packs')

type Block = {
  type: string
  md?: string
  explainMd?: string
  files?: { path: string; role: string }[]
  hintLadder?: { level: number; kind: string }[]
}
type Lesson = { id: string; blocks?: Block[]; mastery?: { requiresTransfer?: boolean } }

/** The demo pack for `CHECK_KINDS`: a catalogue of controls, not a course. */
const QUESTION_TYPES = 'lawp.learning.questions'

/**
 * Packs that are still a stub. `docs/STATUS.md` says so out loud, and the bars
 * below apply the day they stop being one. Nothing may join this list.
 */
const STUB_PACKS = new Set(['lawp.react.foundations'])

/**
 * Review copy written before COURSE_SPEC set the 100-character floor. These
 * ceilings may only fall. A new pack starts at zero because it is not listed.
 */
const THIN_REVIEW_DEBT: Record<string, number> = {
  'lawp.javascript.foundations': 176,
  'lawp.circuits.basics': 43,
  [QUESTION_TYPES]: 24
}

function packIds(): string[] {
  return readdirSync(packsRoot).filter((id) => existsSync(join(packsRoot, id, 'lessons')))
}

function lessonsOf(packId: string): Lesson[] {
  const dir = join(packsRoot, packId, 'lessons')
  return readdirSync(dir)
    .map((id) => join(dir, id, 'lesson.json'))
    .filter((file) => existsSync(file))
    .map((file) => JSON.parse(readFileSync(file, 'utf8')) as Lesson)
}

const TEACHING_PACKS = packIds().filter((id) => id !== QUESTION_TYPES && !STUB_PACKS.has(id))
const ALL_PACKS = packIds()

describe.each(TEACHING_PACKS)('%s teaches, asks, and shows', (packId) => {
  const lessons = lessonsOf(packId)

  it('opens every lesson with an explain', () => {
    const missing = lessons.filter((l) => !(l.blocks ?? []).some((b) => b.type === 'explain')).map((l) => l.id)
    expect(missing).toEqual([])
  })

  it('asks the learner something in every lesson', () => {
    const silent = lessons
      .filter((l) => !(l.blocks ?? []).some((b) => ['check', 'predict', 'activity'].includes(b.type)))
      .map((l) => l.id)
    expect(silent).toEqual([])
  })

  it('gives every explain a worked example — a tagged fence or a diagram', () => {
    const bare: string[] = []
    for (const lesson of lessons) {
      for (const block of lesson.blocks ?? []) {
        if (block.type !== 'explain') continue
        const text = block.md ?? ''
        // A placement battery is measuring, not teaching, so it has nothing to show yet.
        if (lesson.id.endsWith('-placement')) continue
        if (!/```[a-zA-Z0-9]/.test(text) && !/!\[[^\]]*\]\(assets\//.test(text)) bare.push(lesson.id)
      }
    }
    expect(bare).toEqual([])
  })
})

describe.each(TEACHING_PACKS)('%s gives every task a way through', (packId) => {
  const tasks = lessonsOf(packId).flatMap((lesson) =>
    (lesson.blocks ?? [])
      .filter((b) => b.type === 'code' || b.type === 'debug')
      .map((block) => ({ lessonId: lesson.id, block }))
  )

  it('ships a hidden test with every code task', () => {
    const naked = tasks
      .filter(({ block }) => !(block.files ?? []).some((f) => f.role === 'hidden-test'))
      .map(({ lessonId }) => lessonId)
    expect(naked).toEqual([])
  })

  it('climbs a contiguous hint ladder that ends in assist', () => {
    const broken = tasks
      .filter(({ block }) => {
        const ladder = block.hintLadder ?? []
        const levels = ladder.map((h) => h.level).sort((a, b) => a - b)
        const contiguous = levels.length >= 4 && levels.every((level, i) => level === i + 1)
        return !contiguous || !ladder.some((h) => h.kind === 'assist')
      })
      .map(({ lessonId }) => lessonId)
    expect(broken).toEqual([])
  })
})

describe.each(ALL_PACKS)('%s explains the answer', (packId) => {
  it('says why, not which, in review copy', () => {
    const thin: string[] = []
    for (const lesson of lessonsOf(packId)) {
      for (const block of lesson.blocks ?? []) {
        if (block.type !== 'check' && block.type !== 'predict') continue
        if ((block.explainMd ?? '').length < 100) thin.push(lesson.id)
      }
    }
    // Only ever tighten this. Fixing copy lowers the number; new copy may not raise it.
    expect(thin.length).toBeLessThanOrEqual(THIN_REVIEW_DEBT[packId] ?? 0)
  })
})

describe.each(ALL_PACKS)('%s keeps its graphs honest', (packId) => {
  const packDir = join(packsRoot, packId)
  const lessons = lessonsOf(packId)
  const lessonIds = new Set(lessons.map((l) => l.id))
  const misconceptionsFile = join(packDir, 'misconceptions.json')
  const misconceptions: { id: string; followUpLessonId?: string }[] = existsSync(misconceptionsFile)
    ? JSON.parse(readFileSync(misconceptionsFile, 'utf8'))
    : []
  const cited = new Set<string>()
  for (const lesson of lessons) {
    for (const m of JSON.stringify(lesson).matchAll(/"misconceptionId":"([^"]+)"/g)) cited.add(m[1]!)
  }

  it('cites only misconceptions the pack declares', () => {
    const unknown = [...cited].filter((id) => !misconceptions.some((m) => m.id === id))
    expect(unknown).toEqual([])
  })

  it('points every misconception at a follow-up lesson that exists', () => {
    const dangling = misconceptions
      .filter((m) => m.followUpLessonId && !lessonIds.has(m.followUpLessonId))
      .map((m) => m.id)
    expect(dangling).toEqual([])
  })
})

describe('pack content reaches the clone', () => {
  /**
   * A lesson file that exists here but is git-ignored passes every `existsSync`
   * check on the machine that generated it and is simply absent on CI. A blanket
   * `*.log` once hid six Python fixtures that way, and the pack only broke after
   * the push. Nothing under `resources/packs` may be ignored.
   */
  it('tracks every file a pack ships', () => {
    let ignored: string
    try {
      ignored = execFileSync('git', ['ls-files', '--others', '--ignored', '--exclude-standard', 'resources/packs'], {
        cwd: process.cwd(),
        encoding: 'utf8'
      })
    } catch {
      return // no git here; CI still checks
    }
    expect(ignored.split('\n').filter(Boolean)).toEqual([])
  })
})

describe.each(TEACHING_PACKS)('%s marks its transfers', (packId) => {
  it('requires transfer on every transfer and capstone lesson', () => {
    const unmarked = lessonsOf(packId)
      .filter((l) => /^(transfer|capstone)-/.test(l.id) && l.mastery?.requiresTransfer !== true)
      .map((l) => l.id)
    expect(unmarked).toEqual([])
  })
})
