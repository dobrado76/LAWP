import { rmSync } from 'node:fs'
import { writePackFiles } from './py-curriculum/write-pack.mjs'
import { EXPECTED } from './py-curriculum/structure.mjs'
import { ROOT, writeLesson } from './py-curriculum/lib.mjs'
import { lessonsFoundations } from './py-curriculum/foundations.mjs'
import { lessonsFluency } from './py-curriculum/fluency.mjs'
import { lessonsMachine } from './py-curriculum/machine.mjs'
import { lessonsStructure } from './py-curriculum/structure-track.mjs'
import { lessonsLanguage } from './py-curriculum/language.mjs'
import { lessonsCraft } from './py-curriculum/craft.mjs'

/** `--partial` writes what is authored so far without wiping the pack. */
const partial = process.argv.includes('--partial')

const all = [
  ...lessonsFoundations(),
  ...lessonsFluency(),
  ...lessonsMachine(),
  ...lessonsStructure(),
  ...lessonsLanguage(),
  ...lessonsCraft()
]

const authored = all.map((x) => x.doc.id)
const missing = EXPECTED.filter((id) => !authored.includes(id))
const extra = authored.filter((id) => !EXPECTED.includes(id))
const dupes = authored.filter((id, i) => authored.indexOf(id) !== i)
if (extra.length) throw new Error(`Authored but not on the path: ${extra.join(', ')}`)
if (dupes.length) throw new Error(`Authored twice: ${dupes.join(', ')}`)
if (missing.length) {
  if (!partial) throw new Error(`Not authored yet (${missing.length}): ${missing.join(', ')}`)
  console.warn(`Partial run — ${missing.length} lessons still unwritten`)
}

// The path is the source of truth: a renamed lesson must not leave its old
// folder behind for the Library to resolve.
if (!partial) rmSync(ROOT, { recursive: true, force: true })

writePackFiles()
for (const { doc, files } of all) writeLesson(doc, files)
console.log(`Wrote ${all.length} Python lessons`)
