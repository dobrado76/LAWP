import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packsRoot = join(process.cwd(), 'resources', 'packs')
const TEACHING = [
  'lawp.javascript.foundations',
  'lawp.python.foundations',
  'lawp.react.foundations',
  'lawp.circuits.basics'
]
const SKIP = new Set(['js-placement', 'circuits-placement'])
const FENCE = /```(?:javascript|python|html|css|json|text|output)\b/

function lessonIds(pack: string): string[] {
  return readdirSync(join(packsRoot, pack, 'lessons'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function explainMd(pack: string, id: string): string {
  const raw = JSON.parse(readFileSync(join(packsRoot, pack, 'lessons', id, 'lesson.json'), 'utf8')) as {
    blocks: { type: string; md?: string }[]
  }
  return raw.blocks.filter((b) => b.type === 'explain').map((b) => b.md ?? '').join('\n\n')
}

function words(s: string): number {
  return s.replace(/```[\s\S]*?```/g, ' ').trim().split(/\s+/).filter(Boolean).length
}

describe('teaching explains', () => {
  it('use a labeled fence and enough prose that Learn is a lesson, not a stub', () => {
    const thin: string[] = []
    const bare: string[] = []
    for (const pack of TEACHING) {
      for (const id of lessonIds(pack)) {
        if (SKIP.has(id)) continue
        const md = explainMd(pack, id)
        if (!md.trim()) continue
        if (!FENCE.test(md)) bare.push(`${pack}/${id}`)
        if (words(md) < 90) thin.push(`${pack}/${id} (${words(md)} words)`)
      }
    }
    expect(bare, `missing language-tagged fence:\n${bare.join('\n')}`).toEqual([])
    expect(thin, `explain too thin:\n${thin.join('\n')}`).toEqual([])
  })
})
