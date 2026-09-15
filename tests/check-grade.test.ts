import { describe, expect, it } from 'vitest'
import { CHECK_KINDS, gradeCheckAnswer, type CheckPrompt } from '@shared/check'

function check(partial: Partial<CheckPrompt> & Pick<CheckPrompt, 'kind'>): CheckPrompt {
  return { id: 'q', promptMd: '', ...partial }
}

describe('gradeCheckAnswer', () => {
  it('covers every kind with a pass and a fail', () => {
    const samples: Record<(typeof CHECK_KINDS)[number], { answer: unknown; ok: unknown; bad: unknown }> = {
      mcq: { answer: 'a', ok: 'a', bad: 'b' },
      odd: { answer: 'x', ok: 'x', bad: 'y' },
      tf: { answer: 'true', ok: 'true', bad: 'false' },
      image: { answer: 'c', ok: 'c', bad: 's' },
      listen: { answer: 'three', ok: 'three', bad: 'one' },
      hotspot: { answer: 'mid', ok: 'mid', bad: 'top' },
      hottext: { answer: 'bad', ok: 'bad', bad: 'ok' },
      multi: { answer: ['a', 'c'], ok: ['c', 'a'], bad: ['a'] },
      order: { answer: ['a', 'b'], ok: ['a', 'b'], bad: ['b', 'a'] },
      gorder: { answer: ['top', 'mid'], ok: ['top', 'mid'], bad: ['mid', 'top'] },
      match: { answer: { l: 'r' }, ok: { l: 'r' }, bad: { l: 'x' } },
      place: { answer: { s: 'p' }, ok: { s: 'p' }, bad: { s: 'q' } },
      cloze: { answer: { a: 'container' }, ok: { a: 'Container' }, bad: { a: 'number' } },
      bank: { answer: { a: 'list' }, ok: { a: 'list' }, bad: { a: 'loop' } },
      bins: { answer: { one: 'safe' }, ok: { one: 'safe' }, bad: { one: 'hot' } },
      venn: { answer: { apple: 'both' }, ok: { apple: 'both' }, bad: { apple: 'out' } },
      table: { answer: { n: 'num' }, ok: { n: 'num' }, bad: { n: 'str' } },
      tier: { answer: { choice: 'ok', reason: 'cap' }, ok: { choice: 'ok', reason: 'cap' }, bad: { choice: 'ok', reason: 'no' } },
      short: { answer: ['container', 'list'], ok: ' Container ', bad: 'number' },
      select: { answer: ['container', 'collection'], ok: 'collection', bad: 'number' },
      fix: {
        answer: ['A list is a container of values.', 'A list is a collection of values.'],
        ok: 'A list is a collection of values',
        bad: 'A list is a number of values.'
      },
      numeric: { answer: { value: 1, tolerance: 0 }, ok: 1, bad: 4 },
      slider: { answer: { value: 5, tolerance: 1 }, ok: 6, bad: 9 },
      numberline: { answer: { value: 3, tolerance: 0 }, ok: 3, bad: 2 }
    }
    for (const kind of CHECK_KINDS) {
      const sample = samples[kind]
      expect(gradeCheckAnswer(check({ kind, answer: sample.answer }), sample.ok).passed, kind).toBe(true)
      expect(gradeCheckAnswer(check({ kind, answer: sample.answer }), sample.bad).passed, kind).toBe(false)
    }
  })

  it('accepts close spellings and punctuation on typed answers', () => {
    const fix = check({
      kind: 'fix',
      answer: ['A list is a container of values.', 'A list is a collection of values.']
    })
    expect(gradeCheckAnswer(fix, 'A list is a colection of values.').passed).toBe(true)
    expect(gradeCheckAnswer(fix, 'a list is a container of values').passed).toBe(true)
    expect(gradeCheckAnswer(check({ kind: 'short', answer: ['container'] }), 'containr').passed).toBe(true)
    expect(gradeCheckAnswer(check({ kind: 'short', answer: ['container'] }), 'number').passed).toBe(false)
  })
})
