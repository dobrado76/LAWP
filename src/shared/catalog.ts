import { lessonCardDescription } from './lessonCards'
import type { Course, PackManifest, Track } from './schemas/pack'

export type CatalogTrack = { id: string; courseIds: string[] }
export type CatalogCourse = { id: string; modules: { lessonIds: string[] }[] }

export function orderCatalog<TTrack extends CatalogTrack, TCourse extends CatalogCourse>(
  manifestTracks: string[],
  tracks: TTrack[],
  courses: TCourse[]
): { tracks: TTrack[]; courses: TCourse[] } {
  const byTrackId = new Map(tracks.map((t) => [t.id, t]))
  const trackIds = manifestTracks.length ? manifestTracks : tracks.map((t) => t.id)
  const orderedTracks = [
    ...trackIds.map((id) => byTrackId.get(id)).filter((t): t is TTrack => Boolean(t)),
    ...tracks.filter((t) => !trackIds.includes(t.id))
  ]
  const courseIds = orderedTracks.flatMap((t) => t.courseIds)
  const byCourseId = new Map(courses.map((c) => [c.id, c]))
  const seen = new Set<string>()
  const orderedCourses: TCourse[] = []
  for (const id of courseIds) {
    const course = byCourseId.get(id)
    if (!course || seen.has(course.id)) continue
    seen.add(course.id)
    orderedCourses.push(course)
  }
  for (const course of courses) {
    if (!seen.has(course.id)) orderedCourses.push(course)
  }
  return { tracks: orderedTracks, courses: orderedCourses }
}

export function courseLessonIds(course: CatalogCourse): string[] {
  return course.modules.flatMap((mod) => mod.lessonIds)
}

export function lessonPath(tracks: CatalogTrack[], courses: CatalogCourse[]): string[] {
  const byId = new Map(courses.map((c) => [c.id, c]))
  const ids: string[] = []
  const seenLessons = new Set<string>()
  const usedCourses = new Set<string>()
  const pushCourse = (course: CatalogCourse) => {
    usedCourses.add(course.id)
    for (const mod of course.modules) {
      for (const id of mod.lessonIds) {
        if (seenLessons.has(id)) continue
        seenLessons.add(id)
        ids.push(id)
      }
    }
  }
  for (const track of tracks) {
    for (const courseId of track.courseIds) {
      const course = byId.get(courseId)
      if (course) pushCourse(course)
    }
  }
  for (const course of courses) {
    if (!usedCourses.has(course.id)) pushCourse(course)
  }
  return ids
}

export function orderResolved<T extends { manifest: PackManifest; tracks: Track[]; courses: Course[] }>(pack: T): T {
  const ordered = orderCatalog(pack.manifest.tracks, pack.tracks, pack.courses)
  return { ...pack, ...ordered }
}

export function cardDescription(lesson: { id?: string; description?: string; blocks?: unknown[] }): string {
  if (lesson.id) {
    const catalog = lessonCardDescription(lesson.id)
    if (catalog) return catalog
  }
  const authored = lesson.description?.trim()
  if (authored) return authored
  return lessonBlurb(lesson.blocks ?? [])
}

export function lessonBlurb(blocks: unknown[]): string {
  const explain = (blocks as { type?: string; md?: string }[]).find((b) => b.type === 'explain')
  if (!explain?.md) return ''
  const chunks = explain.md.replace(/```[\s\S]*?```/g, '\n').split(/\n\s*\n/)
  for (const chunk of chunks) {
    const prose = chunk
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !/^#{1,3}\s/.test(s) && !/^[-*]\s/.test(s) && !s.startsWith('|') && !s.startsWith('>'))
      .join(' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (prose) return completeSentences(prose)
  }
  return ''
}

/** Card copy should end on a sentence, not a mid-line slice. */
export function completeSentences(text: string, max = 220): string {
  if (!text) return ''
  const parts = text.match(/[^.!?]+[.!?](?:["')\]]+)?|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text]
  let out = ''
  for (const part of parts) {
    const next = out ? `${out} ${part}` : part
    if (out && next.length > max) break
    out = next
  }
  return out
}
