export type Ok<T> = { ok: true; value: T }
export type Err = {
  ok: false
  error: { code: string; message: string; remediation?: string }
}
export type Result<T> = Ok<T> | Err

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

export function err(code: string, message: string, remediation?: string): Err {
  return { ok: false, error: { code, message, remediation } }
}
