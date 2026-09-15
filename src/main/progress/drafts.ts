import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { learnerDir } from '../learners/store'
import { safeJoin } from '../security/paths'

const MAX_FILE = 256 * 1024
const MAX_FILES = 32

export const draftFileSchema = z.object({
  path: z.string().min(1).max(240),
  contents: z.string().max(MAX_FILE)
})

export const lessonDraftSchema = z.object({
  files: z.array(draftFileSchema).max(MAX_FILES),
  updatedAt: z.string()
})

export type LessonDraft = z.infer<typeof lessonDraftSchema>

function draftsRoot(learnerId: string): string {
  return join(learnerDir(learnerId), 'drafts')
}

function draftFile(learnerId: string, packId: string, lessonId: string): string | null {
  return safeJoin(draftsRoot(learnerId), packId, `${lessonId}.json`)
}

export function loadDraft(learnerId: string, packId: string, lessonId: string): LessonDraft {
  const empty: LessonDraft = { files: [], updatedAt: '' }
  const path = draftFile(learnerId, packId, lessonId)
  if (!path || !existsSync(path)) return empty
  try {
    return lessonDraftSchema.parse(JSON.parse(readFileSync(path, 'utf8')))
  } catch {
    return empty
  }
}

export function saveDraft(
  learnerId: string,
  packId: string,
  lessonId: string,
  files: { path: string; contents: string }[]
): LessonDraft {
  const path = draftFile(learnerId, packId, lessonId)
  if (!path) throw Object.assign(new Error('Bad draft path'), { code: 'sandbox' })
  const draft = lessonDraftSchema.parse({
    files,
    updatedAt: new Date().toISOString()
  })
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(draft, null, 2), 'utf8')
  return draft
}

export function clearDraft(learnerId: string, packId: string, lessonId: string): void {
  const path = draftFile(learnerId, packId, lessonId)
  if (path && existsSync(path)) rmSync(path, { force: true })
}

export function clearPackDrafts(learnerId: string, packId: string): void {
  const dir = safeJoin(draftsRoot(learnerId), packId)
  if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true })
}
