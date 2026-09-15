import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'package.json')
const lockPath = join(root, 'package-lock.json')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const current = String(pkg.version)
const parts = current.trim().replace(/^v/i, '').split('.').map((n) => Number(n))
if (parts.length < 2 || parts.some((n) => !Number.isInteger(n) || n < 0)) {
  console.error(`Not MAJOR.MINOR.PATCH: ${current}`)
  process.exit(1)
}
const next = `${parts[0]}.${parts[1]}.${(parts[2] ?? 0) + 1}`
pkg.version = next
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

let lock = readFileSync(lockPath, 'utf8')
let replaced = 0
lock = lock.replaceAll(`"version": "${current}"`, (hit) => {
  if (replaced >= 2) return hit
  replaced += 1
  return `"version": "${next}"`
})
if (replaced < 2) {
  console.error('package-lock.json root version not updated (expected two hits)')
  process.exit(1)
}
writeFileSync(lockPath, lock)
console.log(`version ${current} → ${next}`)
