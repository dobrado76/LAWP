import { describe, expect, it } from 'vitest'
import { highlightSnippet, md, notesBody, notesDate } from '../src/renderer/md'

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

describe('fenced snippets', () => {
  it('turns a fence into a labeled highlighted block, not leftover backticks', () => {
    const html = md('See this:\n\n```javascript\nconst shouted = d.toUpperCase()\n```\n\nKeep both strings.')
    expect(html).toContain('class="snippet"')
    expect(html).toContain('JavaScript')
    expect(html).toContain('tok-kw')
    expect(html).toContain('tok-fn')
    expect(html).not.toContain('```')
    expect(html).toContain('<p>Keep both strings.</p>')
  })

  it('keeps inline ticks as sentence code, not a second dump of the fence', () => {
    const html = md('Call `"east".toUpperCase()`.')
    expect(html).toContain('<code>"east".toUpperCase()</code>')
    expect(html).not.toContain('class="snippet"')
  })

  it('highlights Python keywords the same way as the editor palette', () => {
    const html = highlightSnippet('def kind_of(value):\n    return type(value).__name__', 'python')
    expect(html).toContain('tok-kw')
    expect(html).toContain('def')
    expect(html).toContain('tok-fn')
  })
})

describe('diagram images', () => {
  it('renders a pack asset as a figure and rewrites the src', () => {
    const html = md('See this:\n\n![Closed loop](assets/closed-loop.svg)\n', { packId: 'p', lessonId: 'l' })
    expect(html).toContain('class="diagram"')
    expect(html).toContain('lawp-pack://p/lessons/l/assets/closed-loop.svg')
    expect(html).toContain('Closed loop')
    expect(html).toContain('<p>See this:</p>')
  })

  it('drops remote image sources', () => {
    const html = md('![x](https://evil.example/a.png)')
    expect(html).not.toContain('https://')
    expect(html).not.toContain('evil.example')
  })
})

