import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/ipc'

const lawp = {
  invoke: (channel: string, payload?: unknown) => ipcRenderer.invoke(channel, payload),
  on: (channel: string, fn: (payload: unknown) => void) => {
    const listener = (_e: unknown, payload: unknown) => fn(payload)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
  channels: IPC
}

contextBridge.exposeInMainWorld('lawp', lawp)
