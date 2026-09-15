import { createContext, runInContext } from 'node:vm'
import { Window } from 'happy-dom'
import type { CodeBlock } from './types'

export type DomRunOut = {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
  durationMs: number
}

function fileName(rel: string): string {
  return rel.replace(/^files\//, '').replace(/\\/g, '/')
}

function loadRoutes(files: { path: string; contents: string; role: string }[]): Record<string, { status: number; body: string; delayMs: number }> {
  const map: Record<string, { status: number; body: string; delayMs: number }> = {}
  for (const f of files) {
    const name = fileName(f.path)
    if (!name.endsWith('.json') || name === 'package.json' || name === 'routes.json') continue
    map['/' + name] = { status: 200, body: f.contents, delayMs: 0 }
    map[name] = { status: 200, body: f.contents, delayMs: 0 }
    const base = name.split('/').pop()
    if (base) {
      map['/' + base] = { status: 200, body: f.contents, delayMs: 0 }
      map[base] = { status: 200, body: f.contents, delayMs: 0 }
    }
  }
  const routesFile = files.find((f) => fileName(f.path) === 'routes.json')
  if (routesFile) {
    try {
      const spec = JSON.parse(routesFile.contents) as Record<string, { file?: string; body?: string; status?: number; delayMs?: number }>
      for (const [url, row] of Object.entries(spec)) {
        let body = typeof row.body === 'string' ? row.body : ''
        if (row.file) {
          const hit = files.find((f) => fileName(f.path) === row.file || fileName(f.path).endsWith('/' + row.file))
          if (hit) body = hit.contents
        }
        map[url] = { status: Number(row.status ?? 200), body, delayMs: Number(row.delayMs ?? 0) }
      }
    } catch {
      /* ignore */
    }
  }
  return map
}

function installWindowFetch(
  window: Window,
  routes: Record<string, { status: number; body: string; delayMs: number }>
): void {
  window.fetch = function fetch(url: string | URL, init?: RequestInit) {
    const href = String(url)
    const pathOnly = href.replace(/^https?:\/\/[^/]+/i, '')
    const hit = routes[href] ?? routes[pathOnly] ?? routes[pathOnly.replace(/^\//, '')]
    const opts = init ?? {}
    const signal = opts.signal
    if (signal?.aborted) {
      return Promise.reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' }))
    }
    const delay = hit ? Math.max(0, hit.delayMs) : 0
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        signal?.removeEventListener('abort', onAbort)
        if (!hit) {
          resolve(new window.Response('', { status: 404, statusText: 'Not Found' }))
          return
        }
        resolve(new window.Response(hit.body, { status: hit.status, headers: { 'content-type': 'application/json' } }))
      }, delay)
      function onAbort() {
        window.clearTimeout(timer)
        reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' }))
      }
      signal?.addEventListener('abort', onAbort)
    })
  } as typeof window.fetch
}

export function isDomBlock(block: CodeBlock, files: { path: string; role: string }[]): boolean {
  if (block.preview?.kind === 'iframe') return true
  return files.some((f) => f.path.endsWith('.html'))
}

export async function runDomHarness(
  block: CodeBlock,
  files: { path: string; contents: string; role: string }[],
  opts?: { grade?: boolean }
): Promise<DomRunOut> {
  const grade = opts?.grade !== false
  const started = Date.now()
  const timeout = block.timeoutMs ?? 8000
  const htmlFile = files.find((f) => fileName(f.path).endsWith('.html'))
  const entryName = (block.entry ?? 'main.js').replace(/^files\//, '')
  const learner = files.find((f) => fileName(f.path) === entryName) ?? files.find((f) => f.role === 'edit')
  const hidden = files.find((f) => f.role === 'hidden-test')
  let stdout = ''
  let stderr = ''
  const window = new Window({ url: 'https://lesson.lawp.local/' })
  window.document.write(htmlFile?.contents ?? '<!doctype html><html><body></body></html>')
  installWindowFetch(window, loadRoutes(files))
  const logs = {
    log: (...args: unknown[]) => {
      stdout += args.map(String).join(' ') + '\n'
    },
    error: (...args: unknown[]) => {
      stderr += args.map(String).join(' ') + '\n'
    },
    warn: (...args: unknown[]) => {
      stderr += args.map(String).join(' ') + '\n'
    },
    info: (...args: unknown[]) => {
      stdout += args.map(String).join(' ') + '\n'
    }
  }
  const context = createContext({
    window,
    document: window.document,
    console: logs,
    fetch: window.fetch.bind(window),
    AbortController: window.AbortController,
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    MouseEvent: window.MouseEvent,
    KeyboardEvent: window.KeyboardEvent,
    HTMLElement: window.HTMLElement,
    Node: window.Node,
    FormData: window.FormData,
    URL: window.URL,
    Response: window.Response,
    assert: await import('node:assert').then((m) => m.default ?? m),
    module: { exports: {} },
    exports: {}
  })
  try {
    return await withDeadline(timeout, async () => {
      if (learner?.contents) {
        runInContext(learner.contents, context, { filename: entryName, timeout })
      }
      await window.happyDOM.waitUntilComplete()
      if (grade && hidden?.contents) {
        const wrapped = `(async () => {\n${hidden.contents}\n})()`
        const pending = runInContext(wrapped, context, { filename: fileName(hidden.path), timeout })
        if (pending && typeof (pending as Promise<unknown>).then === 'function') {
          await pending
        }
      }
      await window.happyDOM.waitUntilComplete()
      return { stdout, stderr, exitCode: 0, timedOut: false, durationMs: Date.now() - started }
    })
  } catch (err) {
    const message = err instanceof Error ? err.stack ?? err.message : String(err)
    const timedOut = /Script execution timed out|TimeoutError/i.test(message)
    return {
      stdout,
      stderr: stderr + message + '\n',
      exitCode: timedOut ? 124 : 1,
      timedOut,
      durationMs: Date.now() - started
    }
  } finally {
    window.happyDOM.close()
  }
}

function withDeadline<T>(ms: number, work: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      reject(Object.assign(new Error('Script execution timed out'), { name: 'TimeoutError' }))
    }, Math.max(1, ms))
    work().then(resolve, reject)
  }).finally(() => {
    if (timer) clearTimeout(timer)
  })
}
