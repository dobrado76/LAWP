import { BrowserWindow, screen } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { userDataRoot } from './paths'

export type SavedWindowState = {
  x: number
  y: number
  width: number
  height: number
  isMaximized: boolean
}

const MIN_W = 960
const MIN_H = 640
const DEFAULT_W = 1280
const DEFAULT_H = 800

function filePath(): string {
  return join(userDataRoot(), 'window-state.json')
}

export function loadWindowState(): SavedWindowState | null {
  try {
    if (!existsSync(filePath())) return null
    const raw = JSON.parse(readFileSync(filePath(), 'utf8')) as Partial<SavedWindowState>
    if (typeof raw.width !== 'number' || typeof raw.height !== 'number') return null
    if (!Number.isFinite(raw.width) || !Number.isFinite(raw.height)) return null
    const width = Math.max(MIN_W, Math.round(raw.width))
    const height = Math.max(MIN_H, Math.round(raw.height))
    const x = typeof raw.x === 'number' && Number.isFinite(raw.x) ? Math.round(raw.x) : 0
    const y = typeof raw.y === 'number' && Number.isFinite(raw.y) ? Math.round(raw.y) : 0
    return { x, y, width, height, isMaximized: raw.isMaximized === true }
  } catch {
    return null
  }
}

function onADisplay(state: SavedWindowState): boolean {
  return screen.getAllDisplays().some((d) => {
    const a = d.workArea
    return (
      state.x + state.width > a.x + 50 &&
      state.x < a.x + a.width - 50 &&
      state.y + 50 > a.y &&
      state.y < a.y + a.height
    )
  })
}

export function windowConstructorOptions(): { x?: number; y?: number; width: number; height: number } {
  const saved = loadWindowState()
  if (!saved) return { width: DEFAULT_W, height: DEFAULT_H }
  if (onADisplay(saved)) {
    return { x: saved.x, y: saved.y, width: saved.width, height: saved.height }
  }
  return { width: saved.width, height: saved.height }
}

function writeState(saved: SavedWindowState): void {
  mkdirSync(dirname(filePath()), { recursive: true })
  writeFileSync(filePath(), JSON.stringify(saved, null, 2), 'utf8')
}

export function persistWindowState(win: BrowserWindow): void {
  if (win.isDestroyed() || win.isMinimized()) return
  const isMaximized = win.isMaximized()
  const bounds = isMaximized ? win.getNormalBounds() : win.getBounds()
  if (bounds.x <= -16000 || bounds.y <= -16000) return
  writeState({
    x: bounds.x,
    y: bounds.y,
    width: Math.max(MIN_W, bounds.width),
    height: Math.max(MIN_H, bounds.height),
    isMaximized
  })
}

export function applyWindowState(win: BrowserWindow): void {
  const opts = windowConstructorOptions()
  if (opts.x !== undefined && opts.y !== undefined) {
    win.setBounds({ x: opts.x, y: opts.y, width: opts.width, height: opts.height })
  } else {
    win.setSize(opts.width, opts.height)
    win.center()
  }
}

export function trackWindowState(win: BrowserWindow): void {
  let timer: ReturnType<typeof setTimeout> | undefined
  const persist = (): void => persistWindowState(win)
  const debounce = (): void => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(persist, 80)
  }
  win.on('resize', debounce)
  win.on('move', debounce)
  win.on('maximize', persist)
  win.on('unmaximize', persist)
  win.on('close', persist)
}
