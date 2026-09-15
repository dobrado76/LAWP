import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const copy = JSON.parse(readFileSync(join(root, 'scripts', 'lesson-card-copy.json'), 'utf8'))
let wrote = 0
const missing = []
for (const [packId, lessons] of Object.entries(copy)) {
  for (const [id, description] of Object.entries(lessons)) {
    const file = join(root, 'resources', 'packs', packId, 'lessons', id, 'lesson.json')
    if (!existsSync(file)) {
      missing.push(`${packId}/${id}`)
      continue
    }
    const doc = JSON.parse(readFileSync(file, 'utf8'))
    if (doc.description === description) continue
    doc.description = description
    writeFileSync(file, JSON.stringify(doc, null, 2) + '\n')
    wrote += 1
  }
}
const uncovered = []
for (const [packId, lessons] of Object.entries(copy)) {
  const dir = join(root, 'resources', 'packs', packId, 'lessons')
  if (!existsSync(dir)) continue
  for (const id of readdirSync(dir)) {
    if (!lessons[id]) uncovered.push(`${packId}/${id}`)
  }
}
if (missing.length || uncovered.length) {
  if (missing.length) console.error('copy points at missing folders:\n' + missing.join('\n'))
  if (uncovered.length) console.error('lessons with no copy:\n' + uncovered.join('\n'))
  process.exit(1)
}
console.log(`updated ${wrote} lessons`)
