import { app } from 'electron'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

export function userDataRoot(): string {
  return app.getPath('userData')
}

export function userPacksRoot(): string {
  return join(userDataRoot(), 'packs')
}

export function learnersRoot(): string {
  return join(userDataRoot(), 'learners')
}

export function bundledPacksRoot(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'packs')
  }
  return join(app.getAppPath(), 'resources', 'packs')
}

export function templatesRoot(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'templates')
  }
  return join(app.getAppPath(), 'resources', 'templates')
}

export function playRoot(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'play')
  }
  return join(app.getAppPath(), 'resources', 'play')
}

export function playStubsRoot(): string {
  return join(playRoot(), 'stubs')
}

export function iconPath(): string {
  const ico = join(app.getAppPath(), 'build', 'icon.ico')
  const png = join(app.getAppPath(), 'build', 'icon.png')
  if (existsSync(ico)) return ico
  if (app.isPackaged) {
    const extra = join(dirname(app.getPath('exe')), 'build', 'icon.png')
    if (existsSync(extra)) return extra
  }
  return png
}
