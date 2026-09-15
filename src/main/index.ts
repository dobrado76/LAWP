import { app, BrowserWindow, Menu, protocol, net } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { configureUserData } from './userData'
import {
  applyWindowState,
  loadWindowState,
  persistWindowState,
  trackWindowState,
  windowConstructorOptions
} from './windowState'
import { bundledPacksRoot, iconPath, playRoot, userPacksRoot } from './paths'
import { registerIpc } from './ipc/register'
import { isInside, safeJoin } from './security/paths'

configureUserData()

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const w = BrowserWindow.getAllWindows()[0]
    if (w) {
      if (w.isMinimized()) w.restore()
      w.focus()
    }
  })
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'lawp-pack', privileges: { standard: true, supportFetchAPI: true, corsEnabled: true } },
  { scheme: 'lawp-play', privileges: { standard: true, supportFetchAPI: true, corsEnabled: true } }
])

function createWindow(): void {
  const bounds = windowConstructorOptions()
  const win = new BrowserWindow({
    ...bounds,
    minWidth: 960,
    minHeight: 640,
    icon: iconPath(),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.setMenuBarVisibility(false)
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', (e) => {
    e.preventDefault()
  })
  win.once('ready-to-show', () => {
    applyWindowState(win)
    win.show()
    if (loadWindowState()?.isMaximized) win.maximize()
    persistWindowState(win)
    trackWindowState(win)
  })
  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.handle('lawp-pack', (request) => {
    const url = new URL(request.url)
    const packId = url.hostname
    const rest = decodeURIComponent(url.pathname.replace(/^\//, ''))
    const lessonMatch = rest.match(/^lessons\/([^/]+)\//)
    const userPack = join(userPacksRoot(), packId)
    if (lessonMatch?.[1]) {
      const userLesson = join(userPack, 'lessons', lessonMatch[1])
      if (existsSync(userLesson)) {
        const file = join(userPack, rest)
        if (isInside(userLesson, file) && existsSync(file)) {
          return net.fetch(pathToFileURL(file).href)
        }
        return new Response('not found', { status: 404 })
      }
    }
    const roots = [userPack, join(bundledPacksRoot(), packId)]
    for (const root of roots) {
      const file = join(root, rest)
      if (isInside(root, file) && existsSync(file)) {
        return net.fetch(pathToFileURL(file).href)
      }
    }
    return new Response('not found', { status: 404 })
  })
  protocol.handle('lawp-play', (request) => {
    const url = new URL(request.url)
    if (url.hostname !== 'assets') return new Response('not found', { status: 404 })
    const name = decodeURIComponent(url.pathname.replace(/^\//, ''))
    const root = join(playRoot(), 'assets')
    const file = safeJoin(root, name)
    if (!file || !existsSync(file)) return new Response('not found', { status: 404 })
    return net.fetch(pathToFileURL(file).href)
  })
  Menu.setApplicationMenu(null)
  registerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  for (const w of BrowserWindow.getAllWindows()) persistWindowState(w)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
