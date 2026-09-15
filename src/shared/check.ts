/** Closed check vocabulary. Adding a kind: grader case + a lesson in `lawp.learning.questions`. */
export const CHECK_KINDS = [
  'mcq',
  'multi',
  'odd',
  'tf',
  'image',
  'short',
  'select',
  'numeric',
  'fix',
  'cloze',
  'bank',
  'match',
  'order',
  'place',
  'hotspot',
  'gorder',
  'bins',
  'venn',
  'hottext',
  'table',
  'tier',
  'slider',
  'numberline',
  'listen'
] as const

export type CheckKind = (typeof CHECK_KINDS)[number]

export const CHECK_KIND_LABEL: Record<CheckKind, string> = {
  mcq: 'Pick one',
  multi: 'Pick every right answer',
  odd: 'Which does not belong?',
  tf: 'True or false',
  image: 'Pick the picture',
  short: 'Type the word',
  select: 'Choose the word',
  numeric: 'Enter the number',
  fix: 'Fix this',
  cloze: 'Fill the blanks',
  bank: 'Drag words into the sentence',
  match: 'Connect each pair',
  order: 'Put these in order',
  place: 'Place each piece',
  hotspot: 'Tap the right spot',
  gorder: 'Number the steps on the picture',
  bins: 'Sort into bins',
  venn: 'Place in the sets',
  hottext: 'Tap the word',
  table: 'Choose for each row',
  tier: 'Choose, then say why',
  slider: 'Estimate',
  numberline: 'Pin the number',
  listen: 'Listen, then pick'
}

export type CheckChoice = { id: string; md: string; misconceptionId?: string; image?: string }

export type CheckPrompt = {
  id: string
  kind: CheckKind
  promptMd: string
  explainMd?: string
  choices?: CheckChoice[]
  left?: CheckChoice[]
  right?: CheckChoice[]
  blanks?: { id: string; choices?: CheckChoice[] }[]
  slots?: { id: string; x: number; y: number; w?: number; h?: number; label?: string }[]
  pieces?: CheckChoice[]
  bins?: CheckChoice[]
  sets?: CheckChoice[]
  rows?: CheckChoice[]
  reasons?: { id: string; md: string; when?: string[]; misconceptionId?: string }[]
  image?: string
  audio?: string
  starter?: string
  unit?: string
  min?: number
  max?: number
  step?: number
  answer?: unknown
}

export type ClozePart = { type: 'text'; text: string } | { type: 'blank'; id: string }
export type HottextPart = { type: 'text'; text: string } | { type: 'token'; id: string; text: string }

export function splitCloze(promptMd: string): ClozePart[] {
  const parts: ClozePart[] = []
  const re = /\{\{([a-zA-Z0-9_-]+)\}\}/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(promptMd))) {
    if (m.index > last) parts.push({ type: 'text', text: promptMd.slice(last, m.index) })
    parts.push({ type: 'blank', id: m[1]! })
    last = m.index + m[0].length
  }
  if (last < promptMd.length) parts.push({ type: 'text', text: promptMd.slice(last) })
  return parts
}

/** One dropdown in a sentence: `{{a}}` or a run of underscores. */
export function splitSelect(promptMd: string): ClozePart[] {
  if (/\{\{[a-zA-Z0-9_-]+\}\}/.test(promptMd)) return splitCloze(promptMd)
  const found = /_{3,}/.exec(promptMd)
  if (!found || found.index === undefined) {
    return [{ type: 'text', text: promptMd }, { type: 'blank', id: 'a' }]
  }
  const start = found.index
  const end = start + found[0].length
  const parts: ClozePart[] = []
  if (start > 0) parts.push({ type: 'text', text: promptMd.slice(0, start) })
  parts.push({ type: 'blank', id: 'a' })
  if (end < promptMd.length) parts.push({ type: 'text', text: promptMd.slice(end) })
  return parts
}

export function splitHottext(promptMd: string): HottextPart[] {
  const parts: HottextPart[] = []
  const re = /\[\[([a-zA-Z0-9_-]+):([^\]]+)\]\]/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(promptMd))) {
    if (m.index > last) parts.push({ type: 'text', text: promptMd.slice(last, m.index) })
    parts.push({ type: 'token', id: m[1]!, text: m[2]! })
    last = m.index + m[0].length
  }
  if (last < promptMd.length) parts.push({ type: 'text', text: promptMd.slice(last) })
  return parts
}

export function packAssetUrl(packId: string, lessonId: string, path: string): string {
  const p = path.startsWith('assets/') ? path : `assets/${path}`
  return `lawp-pack://${packId}/lessons/${lessonId}/${p}`
}

export function normCheckText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Case, punctuation, and extra spaces do not count. */
export function foldCheckText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let cur = new Array<number>(n + 1)
  for (let i = 1; i <= m; i++) {
    cur[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost)
    }
    ;[prev, cur] = [cur, prev]
  }
  return prev[n]!
}

function fuzzyTextMatch(got: string, accepted: string[]): boolean {
  const g = foldCheckText(got)
  if (!g) return false
  for (const raw of accepted) {
    const w = foldCheckText(raw)
    if (!w) continue
    if (g === w) return true
    const dist = editDistance(g, w)
    const maxLen = Math.max(g.length, w.length)
    const allowed = maxLen <= 12 ? 1 : Math.max(2, Math.floor(maxLen * 0.12))
    if (dist <= allowed) return true
  }
  return false
}

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) return undefined
  return v
}

function asRecord(v: unknown): Record<string, string> | undefined {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const s = asString(val)
    if (s === undefined) return undefined
    out[k] = s
  }
  return out
}

function asTier(v: unknown): { choice: string; reason: string } | undefined {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined
  const choice = asString((v as { choice?: unknown }).choice)
  const reason = asString((v as { reason?: unknown }).reason)
  if (!choice || !reason) return undefined
  return { choice, reason }
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const right = new Set(b)
  return a.every((x) => right.has(x))
}

function sameSeq(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

function sameMap(expected: Record<string, string>, given: Record<string, string>, text = false): boolean {
  const keys = Object.keys(expected)
  if (Object.keys(given).length !== keys.length) return false
  for (const k of keys) {
    const want = text ? normCheckText(expected[k]!) : expected[k]
    const got = given[k]
    if (got === undefined) return false
    if ((text ? normCheckText(got) : got) !== want) return false
  }
  return true
}

function shortAccepted(answer: unknown): string[] {
  if (typeof answer === 'string') return [normCheckText(answer)]
  const arr = asStringArray(answer)
  return arr ? arr.map(normCheckText) : []
}

function numericSpec(answer: unknown): { value: number; tolerance: number } | undefined {
  if (typeof answer === 'number' && Number.isFinite(answer)) return { value: answer, tolerance: 0 }
  if (answer && typeof answer === 'object' && !Array.isArray(answer) && 'value' in answer) {
    const value = Number((answer as { value: unknown }).value)
    const rawTol = (answer as { tolerance?: unknown }).tolerance
    const tolerance = rawTol === undefined ? 0 : Number(rawTol)
    if (Number.isFinite(value) && Number.isFinite(tolerance)) return { value, tolerance }
  }
  return undefined
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

const PICK_ONE: CheckKind[] = ['mcq', 'odd', 'tf', 'image', 'hotspot', 'hottext', 'listen']
const SEQ: CheckKind[] = ['order', 'gorder']
const MAP: CheckKind[] = ['match', 'place', 'cloze', 'bank', 'bins', 'table', 'venn']
const TEXT: CheckKind[] = ['short', 'fix']
const NUM: CheckKind[] = ['numeric', 'slider', 'numberline']
const SELECT: CheckKind[] = ['select']

export function gradeCheckAnswer(check: CheckPrompt, given: unknown): { passed: boolean; misconceptionIds: string[] } {
  const kind = check.kind
  const answer = check.answer
  let passed = false

  if (PICK_ONE.includes(kind)) {
    passed = asString(given) === asString(answer)
  } else if (kind === 'multi') {
    passed = sameSet(asStringArray(answer) ?? [], asStringArray(given) ?? [])
  } else if (SEQ.includes(kind)) {
    passed = sameSeq(asStringArray(answer) ?? [], asStringArray(given) ?? [])
  } else if (MAP.includes(kind)) {
    const want = asRecord(answer)
    const got = asRecord(given)
    passed = Boolean(want && got && sameMap(want, got, kind === 'cloze' || kind === 'bank'))
  } else if (kind === 'tier') {
    const want = asTier(answer)
    const got = asTier(given)
    passed = Boolean(want && got && want.choice === got.choice && want.reason === got.reason)
  } else if (TEXT.includes(kind)) {
    const got = asString(given)
    passed = Boolean(got && fuzzyTextMatch(got, shortAccepted(answer)))
  } else if (SELECT.includes(kind)) {
    const got = asString(given)
    const accepted = typeof answer === 'string' ? [answer] : (asStringArray(answer) ?? [])
    passed = Boolean(got && accepted.includes(got))
  } else if (NUM.includes(kind)) {
    const spec = numericSpec(answer)
    const n = asNumber(given)
    passed = Boolean(spec && n !== undefined && Math.abs(n - spec.value) <= spec.tolerance)
  }

  const misconceptionIds: string[] = []
  if (!passed) {
    const chosen = new Set<string>()
    if (typeof given === 'string') chosen.add(given)
    if (Array.isArray(given)) for (const x of given) if (typeof x === 'string') chosen.add(x)
    const tier = asTier(given)
    if (tier) {
      chosen.add(tier.choice)
      chosen.add(tier.reason)
    }
    const pool = [
      ...(check.choices ?? []),
      ...(check.pieces ?? []),
      ...(check.reasons ?? []),
      ...(check.rows ?? [])
    ]
    for (const c of pool) {
      if (c.misconceptionId && chosen.has(c.id) && !isCorrectChoice(check, c.id)) {
        misconceptionIds.push(c.misconceptionId)
      }
    }
  }
  return { passed, misconceptionIds }
}

function isCorrectChoice(check: CheckPrompt, id: string): boolean {
  if (typeof check.answer === 'string') return check.answer === id
  if (Array.isArray(check.answer)) return check.answer.includes(id)
  const rec = asRecord(check.answer)
  if (rec) return Object.values(rec).includes(id) || rec[id] !== undefined
  const tier = asTier(check.answer)
  if (tier) return tier.choice === id || tier.reason === id
  return false
}

export function defaultCheckValue(check: CheckPrompt): unknown {
  if (check.kind === 'multi') return []
  if (check.kind === 'order') return (check.choices ?? []).map((c) => c.id)
  if (check.kind === 'gorder') return []
  if (MAP.includes(check.kind)) return {}
  if (check.kind === 'tier') return { choice: '', reason: '' }
  if (NUM.includes(check.kind)) return check.min ?? ''
  if (check.kind === 'fix') return check.starter ?? ''
  return ''
}

export function tfChoices(check: CheckPrompt): CheckChoice[] {
  if (check.choices?.length) return check.choices
  return [
    { id: 'true', md: 'True' },
    { id: 'false', md: 'False' }
  ]
}
