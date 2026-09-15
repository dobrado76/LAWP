import { z } from 'zod'
import { authoringMetaSchema } from './lesson'

export const packManifestSchema = z.object({
  kind: z.literal('pack'),
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(''),
  subjects: z.array(z.string()).default([]),
  category: z.string().optional(),
  cover: z.string().optional(),
  engines: z.array(z.enum(['none', 'python', 'javascript', 'react'])),
  overlay: z.boolean().optional(),
  capabilities: z
    .object({
      execute: z.enum(['none', 'python', 'javascript', 'react']),
      network: z.literal(false)
    })
    .optional(),
  version: z.string().default('0.1.0'),
  locale: z.string().default('en'),
  authors: z.array(z.string()).default([]),
  tracks: z.array(z.string()).default([]),
  authoring: authoringMetaSchema.optional()
})

export const trackSchema = z.object({
  id: z.string(),
  title: z.string(),
  courseIds: z.array(z.string()),
  intro: z.string().optional()
})

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number(),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      lessonIds: z.array(z.string())
    })
  ),
  skillIds: z.array(z.string()).default([]),
  diagnosticLessonId: z.string().optional(),
  creationId: z.string().optional()
})

export const skillSchema = z.object({
  id: z.string(),
  title: z.string(),
  prereqIds: z.array(z.string()).default([])
})

export const misconceptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  skillIds: z.array(z.string()).default([]),
  followUpLessonId: z.string().optional(),
  diagnosticBlockId: z.string().optional()
})

export const creationSchema = z.object({
  id: z.string(),
  title: z.string(),
  briefMd: z.string(),
  exportKinds: z.array(z.enum(['folder', 'zip'])),
  steps: z.array(z.object({ lessonId: z.string(), addsMd: z.string() }))
})

export type PackManifest = z.infer<typeof packManifestSchema>
export type Course = z.infer<typeof courseSchema>
export type Track = z.infer<typeof trackSchema>
