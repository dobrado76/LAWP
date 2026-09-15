export type ElKind = 'heading' | 'control' | 'button' | 'form' | 'list' | 'link' | 'label' | 'generic' | 'unknown'

export type InspectHit = { selector: string; all: boolean }

const FORM_ONLY = new Set(['checked', 'value'])
const CONTROL_ONLY = new Set(['checked', 'value', 'disabled'])

const PREFERRED: Record<ElKind, string[]> = {
  heading: ['textContent', 'innerHTML', 'id', 'classList', 'hidden', 'style'],
  control: ['value', 'checked', 'disabled', 'focus', 'addEventListener', 'getAttribute'],
  button: ['textContent', 'disabled', 'click', 'addEventListener', 'hidden'],
  form: ['addEventListener', 'querySelector', 'querySelectorAll', 'closest'],
  list: ['append', 'prepend', 'replaceChildren', 'children', 'querySelectorAll', 'firstElementChild'],
  link: ['textContent', 'getAttribute', 'setAttribute', 'addEventListener', 'id'],
  label: ['textContent', 'getAttribute', 'htmlFor', 'classList'],
  generic: ['textContent', 'classList', 'id', 'append', 'querySelector', 'addEventListener'],
  unknown: ['textContent', 'classList', 'id', 'querySelector', 'addEventListener']
}

const NAME_KIND: Record<string, ElKind> = {
  heading: 'heading',
  title: 'heading',
  h1: 'heading',
  h2: 'heading',
  input: 'control',
  checkbox: 'control',
  radio: 'control',
  field: 'control',
  textarea: 'control',
  select: 'control',
  option: 'control',
  btn: 'button',
  button: 'button',
  form: 'form',
  list: 'list',
  items: 'list',
  ul: 'list',
  link: 'link',
  anchor: 'link',
  label: 'label'
}

export function kindFromTag(tag?: string): ElKind {
  if (!tag) return 'unknown'
  const t = tag.toLowerCase()
  if (/^h[1-6]$/.test(t)) return 'heading'
  if (t === 'input' || t === 'textarea' || t === 'select' || t === 'option') return 'control'
  if (t === 'button') return 'button'
  if (t === 'form') return 'form'
  if (t === 'ul' || t === 'ol') return 'list'
  if (t === 'a') return 'link'
  if (t === 'label') return 'label'
  return 'generic'
}

export function tagFromSelector(html: string, selector: string): string | undefined {
  const s = selector.trim()
  if (!s) return undefined
  const simple = s.match(/^([a-z][a-z0-9]*)$/i)
  if (simple) return simple[1]!.toLowerCase()
  const tagged = s.match(/^([a-z][a-z0-9]*)[#.[(:]/i)
  if (tagged) return tagged[1]!.toLowerCase()
  const id = s.match(/^#([\w-]+)$/)
  if (id) {
    const re = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bid=["']${id[1]}["']`, 'i')
    return html.match(re)?.[1]?.toLowerCase()
  }
  const cls = s.match(/^\.([\w-]+)$/)
  if (cls) {
    const re = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bclass=["'][^"']*\\b${cls[1]}\\b`, 'i')
    return html.match(re)?.[1]?.toLowerCase()
  }
  return undefined
}

export function kindFromSelector(selector: string | undefined, html = '', name?: string): ElKind {
  if (selector) {
    const fromSel = kindFromTag(tagFromSelector(html, selector))
    if (fromSel !== 'unknown') return fromSel
  }
  if (name && NAME_KIND[name.toLowerCase()]) return NAME_KIND[name.toLowerCase()]!
  return 'unknown'
}

export function memberFits(name: string, kind: ElKind): boolean {
  if (kind === 'control') return true
  if (kind === 'button') return !FORM_ONLY.has(name)
  if (kind === 'form') return !FORM_ONLY.has(name)
  if (CONTROL_ONLY.has(name)) return false
  if ((kind === 'heading' || kind === 'generic' || kind === 'list' || kind === 'label') && (name === 'focus' || name === 'click')) {
    return false
  }
  return true
}

export function memberBoost(name: string, kind: ElKind, base = 90): number {
  const pref = PREFERRED[kind] ?? []
  const i = pref.indexOf(name)
  if (i >= 0) return 99 - i
  return base
}

const FIND = /(?:document\.)?(querySelectorAll|querySelector|closest|matches|getElementById|createElement)\s*\(\s*(['"])((?:\\.|[^\\])*?)\2/g

export function inspectSelectorAt(src: string, pos: number): InspectHit | null {
  const hits = listFindCalls(src)
  for (const hit of hits) {
    if (pos >= hit.from && pos <= hit.to) return { selector: hit.selector, all: hit.all }
  }
  const ident = identAt(src, pos)
  if (!ident) return null
  const bound = boundFinds(src).get(ident)
  return bound ?? null
}

export function boundFinds(src: string): Map<string, InspectHit> {
  const out = new Map<string, InspectHit>()
  const assign = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g
  let m: RegExpExecArray | null
  while ((m = assign.exec(src))) {
    const rhsHits = listFindCalls(m[2]!)
    const hit = rhsHits[0]
    if (hit) out.set(m[1]!, { selector: hit.selector, all: hit.all })
  }
  return out
}

export function selectorAtDot(src: string, pos: number): InspectHit | null {
  const before = src.slice(0, pos)
  const call = before.match(
    /(?:document\.)?(querySelectorAll|querySelector|closest|matches|getElementById|createElement)\s*\(\s*(['"])((?:\\.|[^\\])*?)\2\s*\)\s*\??\s*\.\w*$/
  )
  if (call) return normalizeFind(call[1]!, call[3]!)
  const ident = before.match(/([A-Za-z_$][\w$]*)\s*\??\s*\.\s*\w*$/)
  if (ident) return boundFinds(src).get(ident[1]!) ?? null
  return inspectSelectorAt(src, pos)
}

function listFindCalls(src: string): Array<InspectHit & { from: number; to: number }> {
  const out: Array<InspectHit & { from: number; to: number }> = []
  FIND.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = FIND.exec(src))) {
    const from = m.index
    const close = src.indexOf(')', from + m[0].length - 1)
    const to = close === -1 ? from + m[0].length : close + 1
    const hit = normalizeFind(m[1]!, m[3]!)
    out.push({ ...hit, from, to })
  }
  return out
}

function normalizeFind(fn: string, raw: string): InspectHit {
  const arg = raw.replace(/\\(['"])/g, '$1')
  if (fn === 'getElementById') return { selector: `#${arg}`, all: false }
  if (fn === 'createElement') return { selector: arg, all: false }
  return { selector: arg, all: fn === 'querySelectorAll' }
}

function identAt(src: string, pos: number): string | null {
  let start = pos
  let end = pos
  while (start > 0 && /[A-Za-z0-9_$]/.test(src[start - 1]!)) start -= 1
  while (end < src.length && /[A-Za-z0-9_$]/.test(src[end]!)) end += 1
  const word = src.slice(start, end)
  return /^[A-Za-z_$][\w$]*$/.test(word) ? word : null
}
