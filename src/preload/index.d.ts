import type { IPC } from '@shared/ipc'
import type { Result } from '@shared/result'

export type LawpApi = {
  invoke: <T = unknown>(channel: string, payload?: unknown) => Promise<Result<T>>
  on: (channel: string, fn: (payload: unknown) => void) => () => void
  channels: typeof IPC
}

declare global {
  interface Window {
    lawp: LawpApi
  }
}

export {}
