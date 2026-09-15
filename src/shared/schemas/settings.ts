import { z } from 'zod'

export const trustedExecutionSchema = z.object({
  packId: z.string().min(1),
  fingerprint: z.string().min(1),
  grantedAt: z.string().min(1)
})

export const settingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  fontSize: z.number().int().min(10).max(28).default(15),
  tabWidth: z.number().int().min(2).max(8).default(2),
  keymap: z.enum(['default', 'vim']).default('default'),
  pythonPath: z.string().default(''),
  nodePath: z.string().default(''),
  playHud: z.boolean().default(true),
  playSounds: z.boolean().default(false),
  strictCampaign: z.boolean().default(false),
  currentLearnerId: z.string().default(''),
  trustedExecutions: z.array(trustedExecutionSchema).default([]),
  aiEndpoint: z.string().default(''),
  aiModel: z.string().default('')
})

export type Settings = z.infer<typeof settingsSchema>

export const SETTINGS_EXPORT_STRIP = [
  'trustedExecutions'
] as const

export function settingsForExport(settings: Settings, includeSecrets = false): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...settings }
  delete copy.trustedExecutions
  if (!includeSecrets) {
    delete copy.aiEndpoint
  }
  return {
    kind: 'settings',
    schemaVersion: 1,
    settings: copy
  }
}
