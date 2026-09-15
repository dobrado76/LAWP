import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { blankLesson } from '@shared/authoring'
import { lessonSchema } from '@shared/schemas/lesson'
import { courseSchema } from '@shared/schemas/pack'
import { bundledPacksRoot, templatesRoot, userPacksRoot } from '../paths'
import { resolvePack } from '../packs/resolve'

export function listTemplates(): { id: string; title: string }[] {
  const blank = { id: 'blank', title: 'Empty lesson (forms only)' }
  const root = templatesRoot()
  if (!existsSync(root)) return [blank]
  return [
    blank,
    ...readdirSync(root)
      .filter((n) => n.endsWith('.json'))
      .map((n) => {
        const id = n.replace(/\.json$/, '')
        const raw = JSON.parse(readFileSync(join(root, n), 'utf8')) as { title?: string; promptMd?: string; briefMd?: string }
        return { id, title: raw.title ?? raw.promptMd ?? raw.briefMd ?? id }
      })
  ]
}

export function ensureUserPack(packId: string, title?: string): string {
  const destPack = join(userPacksRoot(), packId)
  mkdirSync(destPack, { recursive: true })
  const fromBundled = existsSync(join(bundledPacksRoot(), packId, 'pack.json'))
  if (!existsSync(join(destPack, 'pack.json'))) {
    writeFileSync(
      join(destPack, 'pack.json'),
      JSON.stringify(
        {
          kind: 'pack',
          schemaVersion: 1,
          id: packId,
          title: title ?? packId,
          description: '',
          subjects: [],
          engines: ['none'],
          overlay: fromBundled,
          capabilities: { execute: 'none', network: false },
          version: '0.0.1',
          locale: 'en',
          authors: [],
          tracks: fromBundled ? [] : ['drafts']
        },
        null,
        2
      )
    )
  }
  if (!fromBundled) {
    const tracksDir = join(destPack, 'tracks')
    const coursesDir = join(destPack, 'courses')
    mkdirSync(tracksDir, { recursive: true })
    mkdirSync(coursesDir, { recursive: true })
    if (!existsSync(join(tracksDir, 'drafts.json'))) {
      writeFileSync(
        join(tracksDir, 'drafts.json'),
        JSON.stringify({ id: 'drafts', title: 'Drafts', courseIds: ['drafts'], intro: 'Lessons you are writing.' }, null, 2)
      )
    }
    if (!existsSync(join(coursesDir, 'drafts.json'))) {
      writeFileSync(
        join(coursesDir, 'drafts.json'),
        JSON.stringify(
          {
            id: 'drafts',
            title: 'Drafts',
            level: 'beginner',
            estimatedMinutes: 8,
            skillIds: [],
            modules: [{ id: 'main', title: 'Lessons', lessonIds: [] }]
          },
          null,
          2
        )
      )
    }
  }
  return destPack
}

export function writeLessonFile(packId: string, lessonId: string, lesson: unknown): unknown {
  const parsed = lessonSchema.parse({ ...(lesson as object), id: lessonId, packId })
  const destPack = ensureUserPack(packId, parsed.title)
  const dest = join(destPack, 'lessons', lessonId)
  mkdirSync(join(dest, 'assets'), { recursive: true })
  writeFileSync(join(dest, 'lesson.json'), JSON.stringify(parsed, null, 2), 'utf8')
  attachLessonToCourse(packId, parsed.courseId ?? 'drafts', parsed.moduleId ?? 'main', lessonId)
  return parsed
}

export function attachLessonToCourse(packId: string, courseId: string, moduleId: string, lessonId: string) {
  const pack = resolvePack(packId)
  const destPack = join(userPacksRoot(), packId)
  mkdirSync(join(destPack, 'courses'), { recursive: true })
  const existing = pack?.courses.find((c) => c.id === courseId)
  const course = existing
    ? structuredClone(existing)
    : courseSchema.parse({
        id: courseId,
        title: courseId,
        level: 'beginner',
        estimatedMinutes: 8,
        skillIds: [],
        modules: [{ id: moduleId, title: 'Lessons', lessonIds: [] }]
      })
  let mod = course.modules.find((m) => m.id === moduleId)
  if (!mod) {
    mod = { id: moduleId, title: moduleId, lessonIds: [] }
    course.modules.push(mod)
  }
  if (!mod.lessonIds.includes(lessonId)) mod.lessonIds.push(lessonId)
  writeFileSync(join(destPack, 'courses', `${course.id}.json`), JSON.stringify(course, null, 2), 'utf8')
}

export function createFromTemplate(templateId: string, packId: string, lessonId: string): unknown {
  if (templateId === 'blank') return writeLessonFile(packId, lessonId, blankLesson(packId, lessonId, lessonId))
  const file = join(templatesRoot(), `${templateId}.json`)
  if (!existsSync(file)) throw Object.assign(new Error('Template not found'), { code: 'not-found' })
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
  const block = raw.kind === 'lesson' && Array.isArray(raw.blocks) ? null : raw
  return writeLessonFile(packId, lessonId, {
    kind: 'lesson',
    schemaVersion: 1,
    id: lessonId,
    packId,
    title: typeof raw.title === 'string' ? raw.title : lessonId,
    skillIds: [],
    estimatedMinutes: 8,
    taskRev: 1,
    courseId: 'drafts',
    moduleId: 'main',
    blocks: block ? [block] : raw.blocks,
    authoring: { templateId, reviewStatus: 'draft', generatedBy: 'human' }
  })
}
