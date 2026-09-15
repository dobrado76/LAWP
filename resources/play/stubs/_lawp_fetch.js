const fs = require('fs')
const path = require('path')

function loadRoutes() {
  const map = {}
  const skip = new Set(['play-log.json', 'package.json', 'routes.json', '_lawp_routes.json'])
  for (const name of fs.readdirSync(process.cwd())) {
    if (!name.endsWith('.json') || skip.has(name)) continue
    const body = fs.readFileSync(path.join(process.cwd(), name), 'utf8')
    map['/' + name] = { status: 200, body, delayMs: 0 }
    map[name] = { status: 200, body, delayMs: 0 }
  }
  const routeFile = ['routes.json', '_lawp_routes.json'].find((n) => fs.existsSync(path.join(process.cwd(), n)))
  if (routeFile) {
    try {
      const spec = JSON.parse(fs.readFileSync(path.join(process.cwd(), routeFile), 'utf8'))
      for (const [url, row] of Object.entries(spec)) {
        const rec = row && typeof row === 'object' ? row : {}
        let body = typeof rec.body === 'string' ? rec.body : ''
        if (rec.file) {
          const dest = path.join(process.cwd(), String(rec.file))
          if (fs.existsSync(dest)) body = fs.readFileSync(dest, 'utf8')
        }
        map[url] = { status: Number(rec.status ?? 200), body, delayMs: Number(rec.delayMs ?? 0) }
      }
    } catch {
      /* ignore bad routes.json */
    }
  }
  return map
}

function lookup(url, routes) {
  const href = String(url)
  const pathOnly = href.replace(/^https?:\/\/[^/]+/i, '')
  return routes[href] ?? routes[pathOnly] ?? routes[pathOnly.replace(/^\//, '')] ?? null
}

function installFetch(target) {
  const routes = loadRoutes()
  const fetchImpl = function fetch(url, init) {
    const opts = init && typeof init === 'object' ? init : {}
    const signal = opts.signal
    if (signal && signal.aborted) {
      return Promise.reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' }))
    }
    const hit = lookup(url, routes)
    const delay = hit ? Math.max(0, hit.delayMs) : 0
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (signal) signal.removeEventListener('abort', onAbort)
        if (!hit) {
          resolve(
            new Response('', {
              status: 404,
              statusText: 'Not Found',
              headers: { 'content-type': 'text/plain' }
            })
          )
          return
        }
        resolve(
          new Response(hit.body, {
            status: hit.status,
            headers: { 'content-type': 'application/json' }
          })
        )
      }, delay)
      function onAbort() {
        clearTimeout(timer)
        reject(Object.assign(new Error('This operation was aborted'), { name: 'AbortError' }))
      }
      if (signal) signal.addEventListener('abort', onAbort)
    })
  }
  target.fetch = fetchImpl
  if (typeof global !== 'undefined') global.fetch = fetchImpl
}

installFetch(typeof globalThis !== 'undefined' ? globalThis : global)
module.exports = { installFetch }
