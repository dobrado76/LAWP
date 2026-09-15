import { describe, expect, it } from 'vitest'
import { md, notesBody, notesDate } from '../src/renderer/md'

describe('release notes display', () => {
  const src = `## 0.2.0 — 15 September 2026\n\nHello.\n\n### Learn\n\nUse \`Player.move\`.\n`

  it('strips the version heading and renders sections', () => {
    expect(notesDate(src)).toBe('15 September 2026')
    const body = notesBody(src)
    expect(body).not.toMatch(/^## /)
    const html = md(body)
    expect(html).toContain('<h3>Learn</h3>')
    expect(html).toContain('<code>Player.move</code>')
    expect(html).not.toContain('**')
  })
})
