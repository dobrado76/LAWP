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

export function lessonBlurb(blocks: unknown[]): string {
  const explain = (blocks as { type?: string; md?: string }[]).find((b) => b.type === 'explain')
  if (!explain?.md) return ''
  const lines = explain.md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_]/g, '')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('-') && !s.startsWith('|') && !s.startsWith('>'))
  const text = lines[1] ?? lines[0] ?? ''
  return text.length > 200 ? `${text.slice(0, 197)}…` : text
}
