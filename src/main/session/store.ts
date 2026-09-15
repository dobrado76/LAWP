import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { userDataRoot } from '../paths'

export type Session = {
  route: string
  packId?: string
  lessonId?: string
  splits?: { toc: number; studio: number }
}

const defaults: Session = { route: 'home' }

function filePath(): string {
  return join(userDataRoot(), 'session.json')
}

export function loadSession(): Session {
  try {
    if (existsSync(filePath())) {
      return { ...defaults, ...JSON.parse(readFileSync(filePath(), 'utf8')) }
    }
  } catch {
    /* defaults */
  }
  return { ...defaults }
}

export function saveSession(next: Session): Session {
  mkdirSync(dirname(filePath()), { recursive: true })
  writeFileSync(filePath(), JSON.stringify(next, null, 2), 'utf8')
  return next
}
