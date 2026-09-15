import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { settingsForExport, settingsSchema, type Settings } from '@shared/schemas/settings'
import { userDataRoot } from '../paths'

function filePath(): string {
  return join(userDataRoot(), 'settings.json')
}

let cache: Settings | null = null

export function resetSettingsCache(): void {
  cache = null
}

export function loadSettings(): Settings {
  if (cache) return cache
  try {
    if (existsSync(filePath())) {
      const raw = JSON.parse(readFileSync(filePath(), 'utf8'))
      cache = settingsSchema.parse({ ...settingsSchema.parse({}), ...raw })
      return cache
    }
  } catch {
    /* defaults */
  }
  cache = settingsSchema.parse({})
  return cache
}

export function saveSettings(next: Settings): Settings {
  cache = settingsSchema.parse(next)
  mkdirSync(dirname(filePath()), { recursive: true })
  if (!existsSync(filePath()) || true) {
    writeFileSync(filePath(), JSON.stringify(cache, null, 2), 'utf8')
  }
  return cache
}

export function updateSettings(partial: Partial<Settings>): Settings {
  return saveSettings({ ...loadSettings(), ...partial })
}

export function exportSettingsDocument(includeSecrets = false): Record<string, unknown> {
  return settingsForExport(loadSettings(), includeSecrets)
}

export function revokeTrust(packId: string): void {
  const s = loadSettings()
  saveSettings({
    ...s,
    trustedExecutions: s.trustedExecutions.filter((t) => t.packId !== packId)
  })
}

export function grantTrust(packId: string, fingerprint: string): void {
  const s = loadSettings()
  const rest = s.trustedExecutions.filter((t) => t.packId !== packId)
  saveSettings({
    ...s,
    trustedExecutions: [...rest, { packId, fingerprint, grantedAt: new Date().toISOString() }]
  })
}

export function hasTrust(packId: string, fingerprint: string): boolean {
  return loadSettings().trustedExecutions.some((t) => t.packId === packId && t.fingerprint === fingerprint)
}
