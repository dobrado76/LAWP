import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { bumpPatch, extractMinorNotes, minorKey } from '../src/shared/versioning'
import pkg from '../package.json'

describe('bumpPatch', () => {
  it('increments PATCH only', () => {
    expect(bumpPatch('0.2.0')).toBe('0.2.1')
    expect(bumpPatch('1.4.9')).toBe('1.4.10')
  })
})

describe('semver minor key', () => {
  it('uses MAJOR.MINOR only', () => {
    expect(minorKey('0.2.0')).toBe('0.2')
    expect(minorKey('v1.4.9')).toBe('1.4')
  })
})

describe('release notes', () => {
  it('package minor matches the current RELEASE_NOTES section', () => {
    const md = readFileSync(resolve('RELEASE_NOTES.md'), 'utf8')
    const section = extractMinorNotes(md, pkg.version)
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(section).toMatch(new RegExp(`^##\\s+${minorKey(pkg.version)}`))
    expect(section.length).toBeGreaterThan(80)
    expect(section).toMatch(/^##\s/)
    expect(section).not.toMatch(/\*\*Learn\.\*\*/)
  })
})
