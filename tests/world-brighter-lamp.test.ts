import { describe, expect, it } from 'vitest'
import { brighterLampConstraints, brighterLampGoal, brighterLampWorld } from '@shared/fixtures/brighterLamp'
import { applyRules, gradeActivity, resolvePath, startRun, tick, type RunWorld } from '@main/activities/world'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const goal = brighterLampGoal
const constraints = brighterLampConstraints

function setOhms(run: RunWorld, ohms: number) {
  const r = tick(run, 'set-ohms', { value: ohms }, goal, constraints, [
    { when: { path: 'meter.current', op: 'gt', value: 2 }, misconceptionId: 'ignores-current-limit' }
  ])
  if ('error' in r) throw new Error(r.error)
  return r
}

describe('brighter-lamp world-v1', () => {
  it('starts with derived props and no fault', () => {
    const run = startRun(brighterLampWorld)
    expect(resolvePath(run.world, 'resistor.ohms')).toBe(2)
    expect(resolvePath(run.world, 'meter.current')).toBe(0.5)
    expect(resolvePath(run.world, 'lamp.brightness')).toBe(1)
    expect(run.calcFault).toBeNull()
  })

  it('A: ohms 4 is dim and fails both modes', () => {
    const run = startRun(brighterLampWorld)
    const t = setOhms(run, 4)
    expect(t.world.parts.find((p) => p.id === 'meter')?.props.current).toBe(0.25)
    expect(t.goalMet).toBe(false)
    expect(t.constraintOk).toBe(true)
    expect(t.calcFault).toBeNull()
    expect(gradeActivity(run, goal, constraints, 'final').passed).toBe(false)
    expect(gradeActivity(run, goal, constraints, 'always').passed).toBe(false)
  })

  it('B: over-limit, then C recovery passes only in final', () => {
    const run = startRun(brighterLampWorld)
    const b = setOhms(run, 0.25)
    expect(b.goalMet).toBe(true)
    expect(b.constraintOk).toBe(false)
    expect(b.misconceptionIds).toContain('ignores-current-limit')
    expect(gradeActivity(run, goal, constraints, 'final').passed).toBe(false)
    expect(gradeActivity(run, goal, constraints, 'always').passed).toBe(false)
    const c = setOhms(run, 1)
    expect(c.goalMet).toBe(true)
    expect(c.constraintOk).toBe(true)
    expect(gradeActivity(run, goal, constraints, 'final').passed).toBe(true)
    expect(gradeActivity(run, goal, constraints, 'always').passed).toBe(false)
  })

  it('D: clean pass in both modes', () => {
    const run = startRun(brighterLampWorld)
    setOhms(run, 1)
    expect(gradeActivity(run, goal, constraints, 'final').passed).toBe(true)
    expect(gradeActivity(run, goal, constraints, 'always').passed).toBe(true)
  })

  it('E: div-by-zero leaves I/B stale and fails; F clears fault', () => {
    const run = startRun(brighterLampWorld)
    const beforeI = resolvePath(run.world, 'meter.current')
    const beforeB = resolvePath(run.world, 'lamp.brightness')
    const e = setOhms(run, 0)
    expect(e.calcFault).toBe('div-by-zero')
    expect(resolvePath(run.world, 'meter.current')).toBe(beforeI)
    expect(resolvePath(run.world, 'lamp.brightness')).toBe(beforeB)
    expect(gradeActivity(run, goal, constraints, 'final').passed).toBe(false)
    const f = setOhms(run, 1)
    expect(f.calcFault).toBeNull()
    expect(f.goalMet).toBe(true)
    expect(gradeActivity(run, goal, constraints, 'final').passed).toBe(true)
  })

  it('never uses eval', () => {
    const src = readFileSync(resolve('src/main/activities/world.ts'), 'utf8')
    expect(src.includes('eval(')).toBe(false)
    expect(src.includes('new Function')).toBe(false)
  })

  it('later rules see earlier sets', () => {
    const world = structuredClone(brighterLampWorld)
    world.parts.find((p) => p.id === 'resistor')!.props.ohms = 1
    applyRules(world)
    expect(world.parts.find((p) => p.id === 'lamp')?.props.brightness).toBe(2)
  })
})
