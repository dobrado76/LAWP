import type { Result } from '@shared/result'
import { IPC } from '@shared/ipc'

export async function invoke<T>(channel: string, payload?: unknown): Promise<T> {
  const r = (await window.lawp.invoke(channel, payload)) as Result<T>
  if (!r.ok) {
    const e = new Error(r.error.message)
    ;(e as Error & { code?: string }).code = r.error.code
    throw e
  }
  return r.value
}

export { IPC }
