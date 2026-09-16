import { type Completion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import {
  DOM_CLASSLIST,
  DOM_DOCUMENT,
  DOM_ELEMENT,
  DOM_EVENT,
  DOM_EVENT_TYPES,
  DOM_NODELIST,
  DOM_ROOT,
  DOM_STYLE,
  DOM_TAGS,
  PLAYER_DIRS,
  PLAYER_METHODS,
  playerMethodFor,
  type DomMember,
  type EditorApi,
  type PlayerLanguage
} from './apis'
import { boundFinds, kindFromSelector, memberBoost, memberFits, selectorAtDot, type ElKind } from './domKind'

const DIR_TEACH: Record<(typeof PLAYER_DIRS)[number], string> = {
  north: 'Up the grid. y decreases.',
  south: 'Down the grid. y increases.',
  east: 'Right. x increases.',
  west: 'Left. x decreases.'
}

const playerRoot: Completion[] = [
  {
    label: 'Player',
    type: 'class',
    detail: 'stage API',
    info: 'Moves the character on the grid. After Player, type a dot and pick a method.',
    boost: 99
  }
]

function playerMembersFor(language: PlayerLanguage): Completion[] {
  return Object.keys(PLAYER_METHODS).map((name) => {
    const spec = playerMethodFor(name, language)!
    return {
      label: name,
      type: 'function',
      detail: spec.args,
      info: `${spec.info} Example: ${spec.sample}`,
      apply: `${name}(`,
      boost: 98
    }
  })
}

function playerPrefixedFor(language: PlayerLanguage): Completion[] {
  return Object.keys(PLAYER_METHODS).map((name) => {
    const spec = playerMethodFor(name, language)!
    return {
      label: `Player.${name}`,
      type: 'function',
      detail: spec.args,
      info: `${spec.info} Example: ${spec.sample}`,
      apply: `Player.${name}(`,
      boost: 97
    }
  })
}

const dirs: Completion[] = PLAYER_DIRS.map((dir) => ({
  label: `"${dir}"`,
  type: 'text',
  detail: 'direction',
  info: DIR_TEACH[dir],
  apply: `"${dir}"`,
  boost: 99
}))

const rotateArgs: Completion[] = [
  {
    label: '90',
    type: 'number',
    detail: 'quarter turn',
    info: 'Turn 90°. Face south = 0°, west = 90°, north = 180°, east = 270°.',
    boost: 95
  }
]

const scaleArgs: Completion[] = [
  {
    label: '1',
    type: 'number',
    detail: 'normal size',
    info: 'Usual size. Use this unless the lesson asks you to grow.',
    boost: 95
  },
  {
    label: '2',
    type: 'number',
    detail: 'larger',
    info: 'Bigger on the grid — only if the lesson allows it.',
    boost: 95
  }
]

function tokenFrom(context: CompletionContext): { from: number } {
  const quoted = context.matchBefore(/["'][\w]*/)
  if (quoted) return quoted
  const word = context.matchBefore(/\w+/)
  if (word) return word
  return { from: context.pos }
}

export function playerCompletionSource(
  context: CompletionContext,
  language: PlayerLanguage = 'javascript'
): CompletionResult | null {
  const playerMembers = playerMembersFor(language)
  const playerPrefixed = playerPrefixedFor(language)
  if (context.matchBefore(/Player\.move\(\s*[^)]*/)) {
    return { from: tokenFrom(context).from, options: dirs, validFor: /^["']?\w*$/ }
  }
  if (context.matchBefore(/Player\.rotate\(\s*[^)]*/)) {
    return { from: tokenFrom(context).from, options: rotateArgs, validFor: /^\d*$/ }
  }
  if (context.matchBefore(/Player\.scale\(\s*[^)]*/)) {
    return { from: tokenFrom(context).from, options: scaleArgs, validFor: /^\d*$/ }
  }
  const member = context.matchBefore(/Player\.\w*/)
  if (member) {
    return {
      from: member.from + (member.text.endsWith('.') ? member.text.length : 'Player.'.length),
      options: playerMembers,
      validFor: /^\w*$/
    }
  }
  const word = context.matchBefore(/[A-Za-z_]\w*/)
  if (!word && !context.explicit) return null
  if (word && /^play/i.test(word.text)) {
    return { from: word.from, options: [...playerRoot, ...playerPrefixed], validFor: /^[\w.]*$/ }
  }
  if (context.explicit) {
    return { from: word?.from ?? context.pos, options: [...playerRoot, ...playerPrefixed] }
  }
  return null
}

export type DomCompleteOpts = { selectors?: string[]; html?: string }

export function apiCompletionSource(api?: EditorApi, extras?: DomCompleteOpts, language: PlayerLanguage = 'javascript') {
  if (api === 'player-v1') return (context: CompletionContext) => playerCompletionSource(context, language)
  if (api === 'dom-v1') {
    return (context: CompletionContext) =>
      domCompletionSource(context, extras?.selectors ?? [], extras?.html ?? '')
  }
  return null
}

function membersOf(table: Record<string, DomMember>, boost = 96): Completion[] {
  return Object.entries(table).map(([name, spec]) => ({
    label: name,
    type: spec.type === 'function' ? 'function' : spec.type === 'class' ? 'class' : 'property',
    detail: spec.args ?? spec.type ?? 'DOM',
    info: `${spec.info} Example: ${spec.sample}`,
    apply: spec.apply ?? name,
    boost
  }))
}

function elementMembersFor(kind: ElKind): Completion[] {
  return Object.entries(DOM_ELEMENT)
    .filter(([name]) => memberFits(name, kind))
    .map(([name, spec]) => ({
      label: name,
      type: spec.type === 'function' ? 'function' : spec.type === 'class' ? 'class' : 'property',
      detail: spec.args ?? spec.type ?? 'DOM',
      info: `${spec.info} Example: ${spec.sample}`,
      apply: spec.apply ?? name,
      boost: memberBoost(name, kind)
    }))
}

const documentMembers = membersOf(DOM_DOCUMENT, 98)
const classListMembers = membersOf(DOM_CLASSLIST, 98)
const styleMembers = membersOf(DOM_STYLE, 96)
const eventMembers = membersOf(DOM_EVENT, 97)
const nodeListMembers = membersOf(DOM_NODELIST, 96)

const documentRoot: Completion[] = [
  {
    label: 'document',
    type: 'class',
    detail: 'page',
    info: `${DOM_ROOT.info} Example: ${DOM_ROOT.sample}`,
    boost: 99
  },
  ...Object.entries(DOM_DOCUMENT).map(([name, spec]) => ({
    label: `document.${name}`,
    type: (spec.type === 'function' ? 'function' : 'property') as Completion['type'],
    detail: spec.args ?? 'document',
    info: `${spec.info} Example: ${spec.sample}`,
    apply: `document.${spec.apply ?? name}`,
    boost: 94
  }))
]

const eventTypeOpts = (quoted: boolean): Completion[] =>
  DOM_EVENT_TYPES.map((name) => ({
    label: quoted ? `"${name}"` : name,
    type: 'text' as const,
    detail: 'event',
    info: `Listen for ${name}.`,
    apply: quoted ? `"${name}"` : `"${name}"`,
    boost: 95
  }))

const tagOpts: Completion[] = DOM_TAGS.map((tag) => ({
  label: `"${tag}"`,
  type: 'text',
  detail: 'tag',
  info: `Create a <${tag}>.`,
  apply: `"${tag}"`,
  boost: 95
}))

const ELEMENT_NAMES = new Set([
  'el',
  'elem',
  'element',
  'node',
  'heading',
  'title',
  'btn',
  'button',
  'form',
  'input',
  'item',
  'parent',
  'child',
  'desk',
  'out',
  'q',
  'root',
  'label',
  'option',
  'target',
  'row',
  'cell',
  'name'
])

const LIST_NAMES = new Set(['nodes', 'items', 'list', 'lis', 'all', 'matches', 'children'])
const EVENT_NAMES = new Set(['event', 'ev', 'e', 'evt'])

const FIND_EL = /(?:querySelector|getElementById|createElement|closest)\s*\(/
const FIND_LIST = /querySelectorAll\s*\(/

function boundNames(src: string): { elements: Set<string>; lists: Set<string>; events: Set<string> } {
  const elements = new Set<string>(ELEMENT_NAMES)
  const lists = new Set<string>(LIST_NAMES)
  const events = new Set<string>(EVENT_NAMES)
  const assign = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g
  let m: RegExpExecArray | null
  while ((m = assign.exec(src))) {
    const name = m[1]!
    const rhs = m[2]!
    if (FIND_LIST.test(rhs)) lists.add(name)
    else if (FIND_EL.test(rhs)) elements.add(name)
  }
  const listen = /\.addEventListener\s*\(\s*['"][^'"]+['"]\s*,\s*(?:function\s*\(\s*([A-Za-z_$][\w$]*)|(\(?)\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>)/g
  while ((m = listen.exec(src))) {
    const name = m[1] || m[3]
    if (name) events.add(name)
  }
  return { elements, lists, events }
}

function selectorOpts(selectors: string[]): Completion[] {
  return selectors.map((sel, i) => ({
    label: `"${sel}"`,
    type: 'text' as const,
    detail: sel.startsWith('#') ? 'id' : sel.startsWith('.') ? 'class' : 'tag',
    info: `A node on this page. Matches ${sel}.`,
    apply: `"${sel}"`,
    boost: 99 - Math.min(i, 10)
  }))
}

function memberFrom(context: CompletionContext): { from: number } {
  const word = context.matchBefore(/\w*/)
  return { from: word?.from ?? context.pos }
}

function callOpen(src: string, pos: number, name: string): boolean {
  const slice = src.slice(0, pos)
  const re = new RegExp(`${name}\\s*\\(([^)]*)$`)
  return re.test(slice)
}

export function domCompletionSource(
  context: CompletionContext,
  selectors: string[] = [],
  html = ''
): CompletionResult | null {
  const src = context.state.doc.toString()
  const before = src.slice(0, context.pos)
  const bound = boundNames(src)
  const finds = boundFinds(src)
  const sel = selectorOpts(selectors)
  const atDot = selectorAtDot(src, context.pos)
  const identName = before.match(/([A-Za-z_$][\w$]*)\s*\??\s*\.\s*\w*$/)?.[1]
  const elKind = kindFromSelector(atDot?.selector, html, identName)

  if (/\.classList\.\w*$/.test(before)) {
    return { from: memberFrom(context).from, options: classListMembers, validFor: /^\w*$/ }
  }
  if (/\.style\.\w*$/.test(before)) {
    return { from: memberFrom(context).from, options: styleMembers, validFor: /^\w*$/ }
  }
  if (callOpen(before, context.pos, 'createElement')) {
    return { from: tokenFrom(context).from, options: tagOpts, validFor: /^["']?[\w-]*$/ }
  }
  if (callOpen(before, context.pos, 'addEventListener')) {
    const inner = before.match(/addEventListener\s*\(([^)]*)$/)?.[1] ?? ''
    if (!inner.includes(',')) {
      return { from: tokenFrom(context).from, options: eventTypeOpts(/["']/.test(inner)), validFor: /^["']?[\w]*$/ }
    }
  }
  if (
    callOpen(before, context.pos, 'querySelector') ||
    callOpen(before, context.pos, 'querySelectorAll') ||
    callOpen(before, context.pos, 'closest') ||
    callOpen(before, context.pos, 'matches')
  ) {
    if (sel.length) return { from: tokenFrom(context).from, options: sel, validFor: /^["']?[\w.#-]*$/ }
  }
  if (callOpen(before, context.pos, 'getElementById')) {
    const ids = selectors
      .filter((s) => s.startsWith('#'))
      .map((s, i) => ({
        label: `"${s.slice(1)}"`,
        type: 'text' as const,
        detail: 'id',
        info: `The node with id="${s.slice(1)}". No # in getElementById.`,
        apply: `"${s.slice(1)}"`,
        boost: 99 - Math.min(i, 10)
      }))
    if (ids.length) return { from: tokenFrom(context).from, options: ids, validFor: /^["']?[\w-]*$/ }
  }

  if (/(?:document\.)?(?:querySelector|getElementById|createElement|closest)\s*\((?:[^)(]|\([^)(]*\))*\)\s*\??\s*\.\w*$/.test(before)) {
    return { from: memberFrom(context).from, options: elementMembersFor(elKind), validFor: /^\w*$/ }
  }
  if (/(?:document\.)?querySelectorAll\s*\((?:[^)(]|\([^)(]*\))*\)\s*\??\s*\.\w*$/.test(before)) {
    return { from: memberFrom(context).from, options: nodeListMembers, validFor: /^\w*$/ }
  }
  if (/document\.\w*$/.test(before)) {
    return { from: memberFrom(context).from, options: documentMembers, validFor: /^\w*$/ }
  }

  const identDot = before.match(/([A-Za-z_$][\w$]*)\s*\??\s*\.\s*(\w*)$/)
  if (identDot) {
    const name = identDot[1]!
    if (name === 'document') return { from: memberFrom(context).from, options: documentMembers, validFor: /^\w*$/ }
    if (bound.events.has(name)) return { from: memberFrom(context).from, options: eventMembers, validFor: /^\w*$/ }
    if (bound.lists.has(name) && !bound.elements.has(name)) {
      return { from: memberFrom(context).from, options: nodeListMembers, validFor: /^\w*$/ }
    }
    if (bound.elements.has(name) || bound.lists.has(name)) {
      const boundKind = kindFromSelector(finds.get(name)?.selector, html, name)
      return { from: memberFrom(context).from, options: elementMembersFor(boundKind), validFor: /^\w*$/ }
    }
  }

  const word = context.matchBefore(/[A-Za-z_]\w*/)
  if (!word && !context.explicit) return null
  if (word && /^doc/i.test(word.text)) {
    return { from: word.from, options: documentRoot, validFor: /^[\w.]*$/ }
  }
  if (context.explicit) {
    return { from: word?.from ?? context.pos, options: documentRoot }
  }
  return null
}
