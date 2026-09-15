import { describe, expect, it } from 'vitest'
import { gradeCtaMode } from '../src/renderer/checks/CheckPanel'

describe('gradeCtaMode', () => {
  it('is Submit until a pass, then Next when the lesson can advance', () => {
    expect(gradeCtaMode(null, true)).toBe('submit')
    expect(gradeCtaMode('fail', true)).toBe('submit')
    expect(gradeCtaMode('pass', true)).toBe('next')
    expect(gradeCtaMode('pass', false)).toBe('none')
  })
})
