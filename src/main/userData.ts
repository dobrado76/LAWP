import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

export function configureUserData(): string {
  let resolved: string
  if (process.env.LAWP_USER_DATA) {
    resolved = resolve(process.env.LAWP_USER_DATA)
    if (!isAbsolute(resolved)) resolved = resolve(process.cwd(), process.env.LAWP_USER_DATA)
  } else if (process.env.LAWP_ISOLATED_USER_DATA === '1') {
    resolved = join(process.cwd(), '.dev-user-data')
  } else {
    resolved = join(app.getPath('appData'), 'LAWP')
  }
  mkdirSync(resolved, { recursive: true })
  app.setPath('userData', resolved)
  return resolved
}
