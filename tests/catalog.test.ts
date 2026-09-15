import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonBlurb, lessonPath, orderCatalog } from '@shared/catalog'
import { courseSchema, packManifestSchema, trackSchema } from '@shared/schemas/pack'

const packRoot = join(process.cwd(), 'resources', 'packs', 'lawp.javascript.foundations')

describe('catalog order', () => {
  it('puts JS courses in track order, beginner first', () => {
    const manifest = packManifestSchema.parse(JSON.parse(readFileSync(join(packRoot, 'pack.json'), 'utf8')))
    const tracks = ['foundations', 'fluency', 'language', 'the-page', 'the-process', 'craft'].map((id) =>
      trackSchema.parse(JSON.parse(readFileSync(join(packRoot, 'tracks', `${id}.json`), 'utf8')))
    )
    const courses = [
      'craft',
      'data',
      'placement',
      'values',
      'signals'
    ].map((id) => courseSchema.parse(JSON.parse(readFileSync(join(packRoot, 'courses', `${id}.json`), 'utf8'))))
    const ordered = orderCatalog(manifest.tracks, tracks, courses)
    expect(ordered.courses.map((c) => c.id)).toEqual(['placement', 'values', 'signals', 'data', 'craft'])
    expect(ordered.courses[0]?.level).toBe('beginner')
    expect(ordered.courses.at(-1)?.level).toBe('advanced')
    const path = lessonPath(ordered.tracks, ordered.courses)
    expect(path[0]).toBe('js-placement')
    expect(path.indexOf('values-and-typeof')).toBeLessThan(path.indexOf('arrays-index'))
  })

  it('reads a short blurb from the first explain', () => {
    const blurb = lessonBlurb([{ type: 'explain', md: '## Title\n\nThe fox walks east.\n\nMore.' }])
    expect(blurb).toBe('The fox walks east.')
  })
})
