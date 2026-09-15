import { type Completion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { PLAYER_DIRS, PLAYER_METHODS, type EditorApi } from './apis'

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

const playerMembers: Completion[] = Object.entries(PLAYER_METHODS).map(([name, spec]) => ({
  label: name,
  type: 'function',
  detail: spec.args,
  info: `${spec.info} Example: ${spec.sample}`,
  apply: `${name}(`,
  boost: 98
}))

const playerPrefixed: Completion[] = Object.entries(PLAYER_METHODS).map(([name, spec]) => ({
  label: `Player.${name}`,
  type: 'function',
  detail: spec.args,
  info: `${spec.info} Example: ${spec.sample}`,
  apply: `Player.${name}(`,
  boost: 97
}))

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

export function playerCompletionSource(context: CompletionContext): CompletionResult | null {
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

export function apiCompletionSource(api?: EditorApi) {
  if (api === 'player-v1') return playerCompletionSource
  return null
}
