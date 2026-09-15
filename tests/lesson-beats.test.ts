import { describe, expect, it } from 'vitest'
import { inferLessonBeats } from '../src/shared/lessonBeats'

describe('inferLessonBeats', () => {
  it('opens Learn then Try when a lesson both teaches and has a task', () => {
    expect(
      inferLessonBeats([{ type: 'explain' }, { type: 'check' }, { type: 'code' }])
    ).toEqual(['learn', 'try'])
    expect(inferLessonBeats([{ type: 'explain' }, { type: 'activity' }])).toEqual(['learn', 'try'])
  })

  it('stays on one screen when there is only teaching or only a task', () => {
    expect(inferLessonBeats([{ type: 'explain' }, { type: 'check' }])).toEqual(['learn'])
    expect(inferLessonBeats([{ type: 'activity' }])).toEqual(['try'])
    expect(inferLessonBeats([{ type: 'code' }])).toEqual(['try'])
  })
})
