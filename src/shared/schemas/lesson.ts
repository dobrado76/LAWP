import { z } from 'zod'
import { propertySchema, worldV1Schema } from './world'

export const hintSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  kind: z.enum(['concept', 'assist']).optional(),
  md: z.string()
})

export const authoringMetaSchema = z.object({
  templateId: z.string().optional(),
  sources: z
    .array(z.object({ title: z.string(), url: z.string().optional(), note: z.string().optional() }))
    .optional(),
  reviewStatus: z.enum(['draft', 'needs-review', 'approved']).optional(),
  generatedBy: z.enum(['human', 'ai']).optional()
})

export const explainBlockSchema = z.object({
  type: z.literal('explain'),
  md: z.string(),
  assetIds: z.array(z.string()).optional()
})

export const checkBlockSchema = z.object({
  type: z.literal('check'),
  id: z.string(),
  promptMd: z.string(),
  kind: z.enum(['mcq', 'multi', 'short', 'numeric', 'cloze', 'match', 'order']),
  choices: z
    .array(z.object({ id: z.string(), md: z.string(), misconceptionId: z.string().optional() }))
    .optional(),
  answer: z.unknown(),
  explainMd: z.string().optional(),
  skillIds: z.array(z.string()).default([]),
  diagnostic: z.boolean().optional(),
  hintLadder: z.array(hintSchema).optional()
})

export const predictBlockSchema = z.object({
  type: z.literal('predict'),
  id: z.string().optional(),
  promptMd: z.string(),
  kind: z.enum(['short', 'mcq', 'numeric']).optional(),
  choices: z
    .array(z.object({ id: z.string(), md: z.string(), misconceptionId: z.string().optional() }))
    .optional(),
  answer: z.unknown().optional()
})

export const activityBlockSchema = z.object({
  type: z.literal('activity'),
  id: z.string(),
  kind: z.enum(['experiment', 'diagnose', 'construct', 'decide']),
  engine: z.literal('world-v1'),
  promptMd: z.string(),
  skillIds: z.array(z.string()).default([]),
  constraintMode: z.enum(['final', 'always']).optional(),
  predict: z
    .object({
      promptMd: z.string(),
      kind: z.enum(['short', 'mcq', 'numeric']),
      choices: z
        .array(z.object({ id: z.string(), md: z.string(), misconceptionId: z.string().optional() }))
        .optional(),
      answer: z.unknown().optional()
    })
    .optional(),
  world: worldV1Schema,
  goal: z.object({
    all: z.array(propertySchema).optional(),
    any: z.array(propertySchema).optional(),
    none: z.array(propertySchema).optional()
  }),
  constraints: z.array(propertySchema).optional(),
  explainAfter: z.object({ promptMd: z.string() }),
  hintLadder: z.array(hintSchema).optional(),
  misconceptionMap: z.array(z.object({ when: propertySchema, misconceptionId: z.string() })).optional()
})

export const codeCheckSchema = z.object({
  type: z.enum(['stdout', 'stdout-regex', 'python-assert', 'js-assert', 'ast', 'react-test']),
  equals: z.string().optional(),
  pattern: z.string().optional(),
  file: z.string().optional(),
  language: z.enum(['js', 'py']).optional(),
  query: z.string().optional(),
  misconceptionId: z.string().optional()
})

export const playSpecSchema = z.object({
  api: z.literal('player-v1'),
  playerId: z.string().default('fox'),
  world: worldV1Schema,
  goal: z.object({
    all: z.array(propertySchema).optional(),
    any: z.array(propertySchema).optional(),
    none: z.array(propertySchema).optional()
  }),
  constraints: z.array(propertySchema).optional(),
  scaleValues: z.array(z.number()).optional(),
  guided: z.boolean().optional()
})

const codeBlockFields = {
  id: z.string().optional(),
  engine: z.enum(['python', 'javascript', 'react']),
  files: z.array(
    z.object({
      path: z.string(),
      role: z.enum(['edit', 'ro', 'hidden-test', 'fixture']),
      contents: z.string().optional()
    })
  ),
  entry: z.string().optional(),
  timeoutMs: z.number().int().positive().default(8000),
  checks: z.array(codeCheckSchema).default([]),
  hintLadder: z.array(hintSchema).default([]),
  preview: z.object({ kind: z.enum(['none', 'iframe']) }).optional(),
  play: playSpecSchema.optional(),
  promptMd: z.string().optional()
}

export const codeBlockSchema = z.object({
  type: z.literal('code'),
  ...codeBlockFields
})

export const debugBlockSchema = z.object({
  type: z.literal('debug'),
  ...codeBlockFields
})

export const reflectBlockSchema = z.object({
  type: z.literal('reflect'),
  id: z.string().optional(),
  promptMd: z.string()
})

export const playBlockSchema = z.object({
  type: z.literal('play'),
  id: z.string().optional(),
  engine: z.enum(['grid-js', 'custom-iframe', 'world-v1']),
  world: worldV1Schema.optional(),
  win: z.array(z.unknown()).optional()
})

export const projectBlockSchema = z.object({
  type: z.literal('project'),
  id: z.string().optional(),
  engine: z.enum(['none', 'python', 'javascript', 'react']).optional(),
  files: z
    .array(
      z.object({
        path: z.string(),
        role: z.enum(['edit', 'ro', 'hidden-test', 'fixture']),
        contents: z.string().optional()
      })
    )
    .optional(),
  briefMd: z.string().optional()
})

export const blockSchema = z.discriminatedUnion('type', [
  explainBlockSchema,
  checkBlockSchema,
  predictBlockSchema,
  activityBlockSchema,
  codeBlockSchema,
  debugBlockSchema,
  reflectBlockSchema,
  playBlockSchema,
  projectBlockSchema
])

export const lessonSchema = z.object({
  kind: z.literal('lesson'),
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  packId: z.string().min(1),
  packTitle: z.string().optional(),
  engines: z.array(z.enum(['none', 'python', 'javascript', 'react'])).optional(),
  courseId: z.string().optional(),
  moduleId: z.string().optional(),
  title: z.string().min(1),
  skillIds: z.array(z.string()).default([]),
  estimatedMinutes: z.number().positive(),
  taskRev: z.number().int().positive(),
  speedMatters: z.boolean().optional(),
  creation: z.object({ id: z.string(), step: z.number(), briefMd: z.string() }).optional(),
  blocks: z.array(z.record(z.unknown())),
  mastery: z
    .object({
      requiresTransfer: z.boolean(),
      minCorrectIndependent: z.number().optional()
    })
    .optional(),
  authoring: authoringMetaSchema.optional()
})

export type Lesson = z.infer<typeof lessonSchema>
export type ActivityBlock = z.infer<typeof activityBlockSchema>
export type CheckBlock = z.infer<typeof checkBlockSchema>
export type CodeBlock = z.infer<typeof codeBlockSchema> | z.infer<typeof debugBlockSchema>
export type PlaySpec = z.infer<typeof playSpecSchema>
export type Hint = z.infer<typeof hintSchema>

export const executableBlockSchema = z.union([codeBlockSchema, debugBlockSchema])

export function parseLessonBlocks(raw: unknown[]): unknown[] {
  return raw.map((block, i) => {
    const parsed = blockSchema.safeParse(block)
    if (!parsed.success) {
      const type = typeof block === 'object' && block && 'type' in block ? String((block as { type: unknown }).type) : '?'
      if (!blockSchema.options.some((o) => 'shape' in o && 'type' in o.shape && (o.shape.type as { value?: string }).value === type)) {
        return { type: 'unknown', originalType: type, index: i }
      }
      throw parsed.error
    }
    return parsed.data
  })
}
