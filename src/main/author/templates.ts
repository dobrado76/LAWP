import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { bundledPacksRoot, templatesRoot, userPacksRoot } from '../paths'
import { lessonSchema } from '@shared/schemas/lesson'

export function listTemplates(): { id: string; title: string }[] {
  const root = templatesRoot()
  if (!existsSync(root)) return []
  return readdirSync(root)
    .filter((n) => n.endsWith('.json'))
    .map((n) => {
      const id = n.replace(/\.json$/, '')
      const raw = JSON.parse(readFileSync(join(root, n), 'utf8')) as { title?: string; promptMd?: string; briefMd?: string }
      return { id, title: raw.title ?? raw.promptMd ?? raw.briefMd ?? id }
    })
}

export function createFromTemplate(templateId: string, packId: string, lessonId: string): unknown {
  const file = join(templatesRoot(), `${templateId}.json`)
  if (!existsSync(file)) throw Object.assign(new Error('Template not found'), { code: 'not-found' })
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
  const block = raw.kind === 'lesson' && Array.isArray(raw.blocks) ? null : raw
  const lesson = lessonSchema.parse({
    kind: 'lesson',
    schemaVersion: 1,
    id: lessonId,
    packId,
    title: typeof raw.title === 'string' ? raw.title : lessonId,
    skillIds: [],
    estimatedMinutes: 8,
    taskRev: 1,
    blocks: block ? [block] : raw.blocks,
    authoring: { templateId, reviewStatus: 'draft', generatedBy: 'human' }
  })
  const fromBundled = existsSync(join(bundledPacksRoot(), packId, 'pack.json'))
  const destPack = join(userPacksRoot(), packId)
  mkdirSync(join(destPack, 'lessons', lessonId, 'assets'), { recursive: true })
  if (!existsSync(join(destPack, 'pack.json'))) {
    writeFileSync(
      join(destPack, 'pack.json'),
      JSON.stringify(
        {
          kind: 'pack',
          schemaVersion: 1,
          id: packId,
          title: packId,
          description: '',
          subjects: [],
          engines: ['none'],
          overlay: fromBundled,
          capabilities: { execute: 'none', network: false },
          version: '0.0.1',
          locale: 'en',
          authors: [],
          tracks: []
        },
        null,
        2
      )
    )
  }
  writeFileSync(join(destPack, 'lessons', lessonId, 'lesson.json'), JSON.stringify(lesson, null, 2), 'utf8')
  return lesson
}
