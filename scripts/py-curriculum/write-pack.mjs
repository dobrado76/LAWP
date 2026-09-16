import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CREATIONS, MISCONCEPTIONS, SKILLS, TRACKS } from './structure.mjs'

const packRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'resources', 'packs', 'lawp.python.foundations')

function writeJson(rel, doc) {
  const file = join(packRoot, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(doc, null, 2) + '\n')
}

/**
 * Drop JSON this run did not write. A renamed or deleted course used to leave its
 * old file behind, and the catalog then saw its lesson ids twice — a duplicate-id
 * failure in a file nobody had edited.
 */
function pruneDir(rel, keep) {
  const dir = join(packRoot, rel)
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.json') && !keep.has(name)) rmSync(join(dir, name))
  }
}

/** Rewrite everything above the lessons: manifest tracks, courses, graphs, creations. */
export function writePackFiles() {
  const manifest = JSON.parse(readFileSync(join(packRoot, 'pack.json'), 'utf8'))
  manifest.title = 'Python: Zero to hero'
  manifest.description =
    'A field-station path from your first name binding to generators, packages, tests, and a capstone tool. Predict, run, explain.'
  manifest.version = '0.5.0'
  manifest.tracks = TRACKS.map((t) => t.id)
  writeJson('pack.json', manifest)

  for (const track of TRACKS) {
    writeJson(`tracks/${track.id}.json`, {
      id: track.id,
      title: track.title,
      courseIds: track.courses.map((c) => c.id),
      intro: track.intro
    })
    for (const course of track.courses) {
      writeJson(`courses/${course.id}.json`, {
        id: course.id,
        title: course.title,
        level: course.level,
        estimatedMinutes: course.estimatedMinutes,
        skillIds: course.skillIds ?? [],
        ...(course.diagnosticLessonId ? { diagnosticLessonId: course.diagnosticLessonId } : {}),
        ...(course.creationId ? { creationId: course.creationId } : {}),
        modules: course.modules
      })
    }
  }

  writeJson('skills.json', SKILLS)
  writeJson('misconceptions.json', MISCONCEPTIONS)
  for (const creation of CREATIONS) writeJson(`creations/${creation.id}.json`, creation)

  pruneDir('tracks', new Set(TRACKS.map((t) => `${t.id}.json`)))
  pruneDir('courses', new Set(TRACKS.flatMap((t) => t.courses.map((c) => `${c.id}.json`))))
  pruneDir('creations', new Set(CREATIONS.map((c) => `${c.id}.json`)))
}
