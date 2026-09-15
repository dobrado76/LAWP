import { describe, expect, it } from 'vitest'
import { gradeCtaMode, lessonWorkVerdict, revealsAnswer, unansweredChecks } from '../src/renderer/checks/CheckPanel'
import type { CheckPrompt } from '../src/shared/check'

describe('gradeCtaMode', () => {
  it('is Submit until every required part has passed, then Next', () => {
    expect(gradeCtaMode(null, true)).toBe('submit')
    expect(gradeCtaMode('fail', true)).toBe('submit')
    expect(gradeCtaMode('pass', false)).toBe('submit')
    expect(gradeCtaMode('pass', true)).toBe('next')
  })
})

describe('unansweredChecks', () => {
  const mcq = (id: string): CheckPrompt =>
    ({
      id,
      kind: 'mcq',
      promptMd: 'Pick one',
      choices: [
        { id: 'a', md: 'A' },
        { id: 'b', md: 'B' }
      ]
    }) as CheckPrompt
  const order = (id: string): CheckPrompt =>
    ({
      id,
      kind: 'order',
      promptMd: 'Sort these',
      choices: [
        { id: 'x', md: 'X' },
        { id: 'y', md: 'Y' }
      ]
    }) as CheckPrompt

  it('holds Submit until a question has an answer', () => {
    const checks = [mcq('q1')]
    expect(unansweredChecks(checks, {}, new Set()).map((c) => c.id)).toEqual(['q1'])
    expect(unansweredChecks(checks, { q1: 'b' }, new Set(['q1']))).toEqual([])
  })

  it('names every question still waiting, not just the first', () => {
    const checks = [mcq('q1'), mcq('q2'), mcq('q3')]
    expect(unansweredChecks(checks, { q2: 'a' }, new Set(['q2'])).map((c) => c.id)).toEqual(['q1', 'q3'])
  })

  it('counts a re-arrangeable question as answered once it is touched', () => {
    const checks = [order('q1')]
    // Left on its opening arrangement, so only the touch tells us anything.
    expect(unansweredChecks(checks, { q1: ['x', 'y'] }, new Set()).map((c) => c.id)).toEqual(['q1'])
    expect(unansweredChecks(checks, { q1: ['x', 'y'] }, new Set(['q1']))).toEqual([])
  })

  it('does not block a lesson that asks nothing', () => {
    expect(unansweredChecks([], {}, new Set())).toEqual([])
  })
})

describe('revealsAnswer', () => {
  const q = (diagnostic: boolean): CheckPrompt => ({ id: 'q', kind: 'mcq', promptMd: 'x', diagnostic }) as CheckPrompt

  it('tells a diagnostic the answer it missed, since the learner moves on either way', () => {
    expect(revealsAnswer(q(true), 'fail')).toBe(true)
  })

  it('leaves a graded question to the hint ladder', () => {
    expect(revealsAnswer(q(false), 'fail')).toBe(false)
  })

  it('reveals nothing before a verdict, or once it is already right', () => {
    expect(revealsAnswer(q(true), null)).toBe(false)
    expect(revealsAnswer(q(true), 'pass')).toBe(false)
  })
})

describe('lessonWorkVerdict', () => {
  it('is not Correct until the question and the code task both pass', () => {
    expect(lessonWorkVerdict({ checkResults: [null], taskResult: null, hasTask: true })).toBe(null)
    expect(lessonWorkVerdict({ checkResults: ['pass'], taskResult: null, hasTask: true })).toBe(null)
    expect(lessonWorkVerdict({ checkResults: ['pass'], taskResult: 'fail', hasTask: true })).toBe('fail')
    expect(lessonWorkVerdict({ checkResults: ['fail'], taskResult: 'pass', hasTask: true })).toBe('fail')
    expect(lessonWorkVerdict({ checkResults: ['pass'], taskResult: 'pass', hasTask: true })).toBe('pass')
  })
})
