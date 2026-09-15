import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { safeJoin } from '../security/paths'
import { courseSchema, packManifestSchema, trackSchema, type Course, type PackManifest, type Track } from '@shared/schemas/pack'
import { lessonSchema, parseLessonBlocks } from '@shared/schemas/lesson'
import { bundledPacksRoot, userPacksRoot } from '../paths'

export type ResolvedLesson = {
  id: string
  folder: string
  source: 'bundled' | 'user'
  raw: Omit<ReturnType<typeof lessonSchema.parse>, 'blocks'> & { blocks: unknown[] }
}

export type ResolvedPack = {
  packId: string
  root: string
  overlay: boolean
  source: 'bundled' | 'user' | 'merged'
  manifest: PackManifest
  tracks: Track[]
  courses: Course[]
  lessons: ResolvedLesson[]
  skills: unknown[]
  misconceptions: unknown[]
  creations: unknown[]
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function listLessonIds(packDir: string): string[] {
  const dir = join(packDir, 'lessons')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(dir, e.name, 'lesson.json')))
    .map((e) => e.name)
}

function loadLesson(folder: string, source: 'bundled' | 'user'): ResolvedLesson {
  const rawUnknown = readJson(join(folder, 'lesson.json'))
  const raw = lessonSchema.parse(rawUnknown)
  const blocks = parseLessonBlocks((rawUnknown as { blocks: unknown[] }).blocks)
  const { blocks: _ignored, ...rest } = raw
  void _ignored
  return { id: raw.id, folder, source, raw: { ...rest, blocks } }
}

function loadSidecars(packDir: string): Pick<ResolvedPack, 'tracks' | 'courses' | 'skills' | 'misconceptions' | 'creations'> {
  const tracks: Track[] = []
  const courses: Course[] = []
  const td = join(packDir, 'tracks')
  if (existsSync(td)) {
    for (const f of readdirSync(td).filter((n) => n.endsWith('.json'))) {
      tracks.push(trackSchema.parse(readJson(join(td, f))))
    }
  }
  const cd = join(packDir, 'courses')
  if (existsSync(cd)) {
    for (const f of readdirSync(cd).filter((n) => n.endsWith('.json'))) {
      courses.push(courseSchema.parse(readJson(join(cd, f))))
    }
  }
  const skills = existsSync(join(packDir, 'skills.json')) ? (readJson(join(packDir, 'skills.json')) as unknown[]) : []
  const misconceptions = existsSync(join(packDir, 'misconceptions.json'))
    ? (readJson(join(packDir, 'misconceptions.json')) as unknown[])
    : []
  const creations: unknown[] = []
  const cr = join(packDir, 'creations')
  if (existsSync(cr)) {
    for (const f of readdirSync(cr).filter((n) => n.endsWith('.json'))) {
      creations.push(readJson(join(cr, f)))
    }
  }
  return { tracks, courses, skills: Array.isArray(skills) ? skills : [skills], misconceptions: Array.isArray(misconceptions) ? misconceptions : [misconceptions], creations }
}

function loadFull(packDir: string, source: 'bundled' | 'user'): ResolvedPack {
  const manifest = packManifestSchema.parse(readJson(join(packDir, 'pack.json')))
  const lessons = listLessonIds(packDir).map((id) => loadLesson(join(packDir, 'lessons', id), source))
  return {
    packId: manifest.id,
    root: packDir,
    overlay: false,
    source,
    manifest,
    lessons,
    ...loadSidecars(packDir)
  }
}

export function listPackIds(): string[] {
  const ids = new Set<string>()
  for (const root of [bundledPacksRoot(), userPacksRoot()]) {
    if (!existsSync(root)) continue
    for (const ent of readdirSync(root, { withFileTypes: true })) {
      if (ent.isDirectory() && existsSync(join(root, ent.name, 'pack.json'))) ids.add(ent.name)
    }
  }
  return [...ids]
}

export function resolvePack(packId: string): ResolvedPack | null {
  const bundledDir = join(bundledPacksRoot(), packId)
  const userDir = join(userPacksRoot(), packId)
  const bundled = existsSync(join(bundledDir, 'pack.json')) ? bundledDir : null
  const user = existsSync(join(userDir, 'pack.json')) ? userDir : null
  if (!bundled && !user) return null
  if (user && !bundled) return loadFull(user, 'user')
  if (bundled && !user) return loadFull(bundled, 'bundled')
  const userManifest = packManifestSchema.parse(readJson(join(user!, 'pack.json')))
  if (userManifest.overlay === false) return loadFull(user!, 'user')
  const base = loadFull(bundled!, 'bundled')
  const overlayIds = listLessonIds(user!)
  const lessons = [...base.lessons]
  for (const id of overlayIds) {
    const overlayLesson = loadLesson(join(user!, 'lessons', id), 'user')
    const idx = lessons.findIndex((l) => l.id === id)
    if (idx >= 0) lessons[idx] = overlayLesson
    else lessons.push(overlayLesson)
  }
  return {
    ...base,
    source: 'merged',
    overlay: true,
    lessons,
    manifest: { ...base.manifest, overlay: true }
  }
}

export function lessonById(pack: ResolvedPack, lessonId: string): ResolvedLesson | undefined {
  return pack.lessons.find((l) => l.id === lessonId)
}

export function stripLessonForRenderer(lesson: ResolvedLesson): unknown {
  const blocks = (lesson.raw.blocks as { type?: string; answer?: unknown; files?: { role: string; path: string; contents?: string }[] }[]).map(
    (b) => {
      if (b.type === 'check' || b.type === 'predict') {
        const { answer, ...rest } = b
        return { ...rest, hasAnswer: answer !== undefined }
      }
      if (b.type === 'code' || b.type === 'debug') {
        return {
          ...b,
          files: b.files?.map((f) => {
            if (f.role === 'hidden-test') return { path: f.path, role: f.role }
            if (f.contents) return f
            const disk = safeJoin(lesson.folder, f.path)
            const contents = disk && existsSync(disk) ? readFileSync(disk, 'utf8') : ''
            return { ...f, contents }
          }),
          hasHiddenChecks: b.files?.some((f) => f.role === 'hidden-test') ?? false
        }
      }
      return b
    }
  )
  return { ...lesson.raw, blocks, folderHint: lesson.id }
}
