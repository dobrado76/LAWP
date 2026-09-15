export const PACK_CATEGORY_ORDER = ['Electricity', 'Programming', 'Learning', 'Your packs', 'More'] as const

export type PackCategory = (typeof PACK_CATEGORY_ORDER)[number]

export function packCategory(p: {
  category?: string
  subjects?: string[]
  engines?: string[]
  source?: string
}): PackCategory | string {
  if (p.category?.trim()) return p.category.trim()
  const subjects = p.subjects ?? []
  if (subjects.includes('circuits') || subjects.includes('science')) return 'Electricity'
  if (subjects.includes('learning')) return 'Learning'
  if (subjects.includes('programming') || (p.engines ?? []).some((e) => e !== 'none')) return 'Programming'
  if (p.source === 'user') return 'Your packs'
  return 'More'
}

export function packCategoryTone(category: string): string {
  const key = category.toLowerCase()
  if (key === 'electricity') return 'power'
  if (key === 'programming') return 'code'
  if (key === 'learning') return 'learn'
  if (key === 'your packs') return 'yours'
  return 'more'
}

export function packCoverUrl(packId: string, cover?: string): string {
  const path = (cover ?? 'assets/cover.png').replace(/^\/+/, '')
  return `lawp-pack://${packId}/${path}`
}

export function groupPacks<T extends { category?: string; subjects?: string[]; engines?: string[]; source?: string }>(
  packs: T[]
): { category: string; packs: T[] }[] {
  const buckets = new Map<string, T[]>()
  for (const p of packs) {
    const cat = packCategory(p)
    const list = buckets.get(cat) ?? []
    list.push(p)
    buckets.set(cat, list)
  }
  const known = PACK_CATEGORY_ORDER.filter((c) => buckets.has(c)).map((c) => ({ category: c, packs: buckets.get(c)! }))
  const extra = [...buckets.keys()]
    .filter((c) => !PACK_CATEGORY_ORDER.includes(c as PackCategory))
    .sort()
    .map((c) => ({ category: c, packs: buckets.get(c)! }))
  return [...known, ...extra]
}
