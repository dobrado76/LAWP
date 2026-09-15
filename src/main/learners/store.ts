import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { learnersRoot } from '../paths'
import { loadSettings, updateSettings } from '../settings/store'

export type Learner = { id: string; displayName: string; createdAt: string }

function profilePath(id: string): string {
  return join(learnersRoot(), id, 'profile.json')
}

export function listLearners(): Learner[] {
  mkdirSync(learnersRoot(), { recursive: true })
  const out: Learner[] = []
  for (const name of readdirSync(learnersRoot(), { withFileTypes: true })) {
    if (!name.isDirectory()) continue
    const p = profilePath(name.name)
    if (!existsSync(p)) continue
    try {
      out.push(JSON.parse(readFileSync(p, 'utf8')) as Learner)
    } catch {
      /* skip */
    }
  }
  return out
}

export function ensureDefaultLearner(): Learner {
  const existing = listLearners()
  const settings = loadSettings()
  if (settings.currentLearnerId && existing.some((l) => l.id === settings.currentLearnerId)) {
    return existing.find((l) => l.id === settings.currentLearnerId)!
  }
  if (existing[0]) {
    updateSettings({ currentLearnerId: existing[0].id })
    return existing[0]
  }
  return createLearner('Learner')
}

export function createLearner(displayName: string): Learner {
  const learner: Learner = {
    id: randomUUID(),
    displayName: displayName.trim() || 'Learner',
    createdAt: new Date().toISOString()
  }
  mkdirSync(join(learnersRoot(), learner.id), { recursive: true })
  writeFileSync(profilePath(learner.id), JSON.stringify(learner, null, 2), 'utf8')
  updateSettings({ currentLearnerId: learner.id })
  return learner
}

export function renameLearner(id: string, displayName: string): Learner | null {
  const p = profilePath(id)
  if (!existsSync(p)) return null
  const learner = { ...(JSON.parse(readFileSync(p, 'utf8')) as Learner), displayName }
  writeFileSync(p, JSON.stringify(learner, null, 2), 'utf8')
  return learner
}

export function currentLearnerId(): string {
  return ensureDefaultLearner().id
}

export function learnerDir(id: string): string {
  return join(learnersRoot(), id)
}
