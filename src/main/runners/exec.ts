import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { userDataRoot } from '../paths'

export type SpawnResult = {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
  durationMs: number
}

const MAX_OUT = 1024 * 1024

export function sandboxDir(runId: string): string {
  return join(userDataRoot(), 'sandboxes', runId)
}

export function resetSandbox(runId: string): string {
  const dir = sandboxDir(runId)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  return dir
}

export function writeSandboxFile(root: string, rel: string, contents: string): void {
  const dest = join(root, rel)
  mkdirSync(join(dest, '..'), { recursive: true })
  writeFileSync(dest, contents, 'utf8')
}

export function runProcess(
  bin: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
  extraEnv: Record<string, string> = {}
): Promise<SpawnResult> {
  const started = Date.now()
  return new Promise((resolve) => {
    const child = spawn(bin, args, {
      cwd,
      shell: false,
      windowsHide: true,
      env: {
        PATH: process.env.PATH ?? '',
        SYSTEMROOT: process.env.SYSTEMROOT ?? '',
        WINDIR: process.env.WINDIR ?? '',
        PYTHONSAFEPATH: '1',
        PYTHONDONTWRITEBYTECODE: '1',
        NO_COLOR: '1',
        PYTHONIOENCODING: 'utf-8',
        ...extraEnv
      }
    })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill()
    }, timeoutMs)
    child.stdout?.on('data', (chunk: Buffer) => {
      if (stdout.length < MAX_OUT) stdout += chunk.toString('utf8').slice(0, MAX_OUT - stdout.length)
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      if (stderr.length < MAX_OUT) stderr += chunk.toString('utf8').slice(0, MAX_OUT - stderr.length)
    })
    child.on('error', (e) => {
      clearTimeout(timer)
      resolve({
        stdout,
        stderr: `${stderr}\n${e.message}`,
        exitCode: 127,
        timedOut,
        durationMs: Date.now() - started
      })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({
        stdout,
        stderr,
        exitCode: code ?? (timedOut ? 124 : 1),
        timedOut,
        durationMs: Date.now() - started
      })
    })
  })
}
