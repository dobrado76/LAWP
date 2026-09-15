export function draftLessonKey(packId: string, lessonId: string): string {
  return `${packId}/${lessonId}`
}

/** Files may be saved only for the lesson they were loaded into. */
export function draftMatchesLesson(boundKey: string, packId: string, lessonId: string): boolean {
  return Boolean(boundKey) && boundKey === draftLessonKey(packId, lessonId)
}

export function filesForLesson(
  starters: { path: string; contents: string }[],
  draft: { path: string; contents: string }[],
  ignoreDraft = false
): { path: string; contents: string }[] {
  if (!starters.length) return []
  if (ignoreDraft || !draft.length) return starters
  return starters.map((f) => draft.find((d) => d.path === f.path) ?? f)
}
