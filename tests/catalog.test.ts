import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cardDescription, lessonBlurb, lessonPath, orderCatalog } from '@shared/catalog'
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

  it('prefers the lesson card catalog over leftover explain copy', () => {
    expect(
      cardDescription({ id: 'values-and-typeof', description: 'Old leftover `code`.', blocks: [] })
    ).toBe(
      'Every value has a kind. A number is not text, and true or false is not a number. Ask for the kind before you try to add, join, or list anything.'
    )
  })

  it('reads a short blurb from the first explain', () => {
    const blurb = lessonBlurb([{ type: 'explain', md: '## Title\n\nThe fox walks east.\n\nMore.' }])
    expect(blurb).toBe('The fox walks east.')
  })

  it('skips the heading so the blurb is the first prose paragraph', () => {
    const blurb = lessonBlurb([
      { type: 'explain', md: '## A name is a box\n\n`let` names a box you can refill. `const` names a box you cannot rebind.' }
    ])
    expect(blurb).toBe('let names a box you can refill. const names a box you cannot rebind.')
    expect(blurb).not.toMatch(/A name is a box/)
  })

  it('keeps inline code text in the card preview', () => {
    expect(
      lessonBlurb([
        { type: 'explain', md: '## Names\n\n`let` names a box you can refill. `const` names a box you cannot rebind.' }
      ])
    ).toBe('let names a box you can refill. const names a box you cannot rebind.')
    expect(
      lessonBlurb([
        { type: 'explain', md: '## Truth\n\nIn an `if`, these are falsy: `0`, `""`, `null`.' }
      ])
    ).toBe('In an if, these are falsy: 0, "", null.')
    const names = JSON.parse(readFileSync(join(packRoot, 'lessons', 'names-let-const', 'lesson.json'), 'utf8'))
    const truth = JSON.parse(readFileSync(join(packRoot, 'lessons', 'truth-and-if', 'lesson.json'), 'utf8'))
    expect(lessonBlurb(names.blocks)).toMatch(/let names a box/)
    expect(lessonBlurb(names.blocks)).toMatch(/const names a box/)
    expect(lessonBlurb(truth.blocks)).toMatch(/In an if/)
    expect(lessonBlurb(truth.blocks)).toMatch(/falsy: 0/)
  })

  it('ends a long blurb on a sentence, not mid-word', () => {
    const blurb = lessonBlurb([
      {
        type: 'explain',
        md: '## Kinds you can print\n\nEvery value has a kind. typeof 42 is number — and then a lot more detail that would be sliced if we cut at a character budget without respecting the period.'
      }
    ])
    expect(blurb.startsWith('Every value has a kind.')).toBe(true)
    expect(blurb.endsWith('.')).toBe(true)
    expect(blurb).not.toMatch(/…/)
    expect(blurb).not.toMatch(/Kinds you can print/)
  })
})
