import { z } from 'zod'

export const propertySchema = z.object({
  path: z.string().min(1),
  op: z.enum(['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'includes']),
  value: z.union([z.string(), z.number(), z.boolean()])
})

export const valueOrExprSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.object({
    op: z.enum(['add', 'sub', 'mul', 'div']),
    a: z.union([z.string(), z.number()]),
    b: z.union([z.string(), z.number()])
  })
])

export const worldPartSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.union([z.string(), z.number(), z.boolean()]))
})

export const worldActionSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  target: z.string().min(1),
  op: z.enum(['set', 'toggle', 'connect', 'disconnect', 'add', 'remove']),
  key: z.string().optional(),
  values: z.array(z.union([z.string(), z.number(), z.boolean()])).optional()
})

export const worldRuleSchema = z.object({
  id: z.string().min(1),
  when: z.array(propertySchema),
  set: z.array(
    z.object({
      target: z.string().min(1),
      key: z.string().min(1),
      value: valueOrExprSchema
    })
  )
})

export const worldV1Schema = z.object({
  parts: z.array(worldPartSchema),
  connections: z.array(
    z.object({
      from: z.string().min(1),
      to: z.string().min(1),
      via: z.string().optional()
    })
  ),
  actions: z.array(worldActionSchema),
  rules: z.array(worldRuleSchema),
  view: z.object({
    kind: z.enum(['graph', 'list', 'grid']),
    assetMap: z.record(z.string()).optional(),
    grid: z
      .object({
        cols: z.number().int().positive().default(5),
        rows: z.number().int().positive().default(5)
      })
      .optional()
  })
})

export type Property = z.infer<typeof propertySchema>
export type WorldV1 = z.infer<typeof worldV1Schema>
export type WorldPart = z.infer<typeof worldPartSchema>
export type CalcFault = null | 'div-by-zero'
