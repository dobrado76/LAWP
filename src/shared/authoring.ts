import { CHECK_KINDS, CHECK_KIND_LABEL, type CheckKind } from './check'

export type DraftLesson = {
  kind: 'lesson'
  schemaVersion: 1
  id: string
  packId: string
  title: string
  description?: string
  courseId?: string
  moduleId?: string
  skillIds: string[]
  estimatedMinutes: number
  taskRev: number
  engines?: Array<'none' | 'python' | 'javascript' | 'react'>
  blocks: Record<string, unknown>[]
  authoring?: { templateId?: string; reviewStatus?: 'draft' | 'needs-review' | 'approved'; generatedBy?: 'human' | 'ai' }
}

export const BLOCK_TYPES = ['explain', 'check', 'predict', 'activity', 'code', 'debug', 'reflect', 'project'] as const
export type BlockType = (typeof BLOCK_TYPES)[number]

export const BLOCK_TYPE_LABEL: Record<BlockType, string> = {
  explain: 'Explain',
  check: 'Question',
  predict: 'Predict',
  activity: 'Playable world',
  code: 'Code',
  debug: 'Debug',
  reflect: 'Reflect',
  project: 'Project'
}

export function blankLesson(packId: string, lessonId: string, title = 'Untitled lesson'): DraftLesson {
  return {
    kind: 'lesson',
    schemaVersion: 1,
    id: lessonId,
    packId,
    title,
    skillIds: [],
    estimatedMinutes: 8,
    taskRev: 1,
    blocks: [blankBlock('explain')],
    authoring: { reviewStatus: 'draft', generatedBy: 'human' }
  }
}

export function blankBlock(type: BlockType, checkKind: CheckKind = 'mcq'): Record<string, unknown> {
  if (type === 'explain') return { type: 'explain', md: '## New idea\n\nWrite what the learner should understand.' }
  if (type === 'reflect') return { type: 'reflect', id: 'reflect-1', promptMd: 'In one sentence, what changed?' }
  if (type === 'predict') {
    return {
      type: 'predict',
      id: 'predict-1',
      promptMd: 'What will happen?',
      kind: 'mcq',
      choices: [
        { id: 'a', md: 'Option A' },
        { id: 'b', md: 'Option B' }
      ],
      answer: 'a'
    }
  }
  if (type === 'check') return blankCheck(checkKind)
  if (type === 'activity') {
    return {
      type: 'activity',
      id: 'play-1',
      kind: 'experiment',
      engine: 'world-v1',
      promptMd: 'Change one thing. Watch what happens.',
      skillIds: [],
      constraintMode: 'final',
      predict: {
        promptMd: 'What will happen?',
        kind: 'mcq',
        choices: [
          { id: 'a', md: 'It gets brighter' },
          { id: 'b', md: 'Nothing changes' }
        ],
        answer: 'a'
      },
      world: {
        parts: [{ id: 'lamp', type: 'lamp', props: { brightness: 1, label: 'Lamp' } }],
        connections: [],
        actions: [{ id: 'set-bright', label: 'Brightness', target: 'lamp', op: 'set', key: 'brightness', values: [0, 1, 2] }],
        rules: [],
        view: { kind: 'graph', assetMap: {} }
      },
      goal: { all: [{ path: 'lamp.brightness', op: 'eq', value: 2 }] },
      constraints: [],
      explainAfter: { promptMd: 'What changed, and why?' },
      hintLadder: [{ level: 1, kind: 'concept', md: 'Try one change, then Check.' }]
    }
  }
  if (type === 'code' || type === 'debug') {
    return {
      type,
      id: type === 'debug' ? 'debug-1' : 'code-1',
      engine: 'javascript',
      entry: 'files/main.js',
      files: [{ path: 'files/main.js', role: 'edit', contents: "console.log('hello')\n" }],
      checks: [{ type: 'stdout', equals: 'hello' }],
      hintLadder: [{ level: 1, kind: 'concept', md: 'Read the prompt, then change one line.' }],
      promptMd: type === 'debug' ? 'Find the broken line.' : 'Make the program print hello.'
    }
  }
  return { type: 'project', id: 'project-1', engine: 'javascript', briefMd: 'Build the thing this course has been aiming at.', files: [] }
}

export function blankCheck(kind: CheckKind): Record<string, unknown> {
  const id = `check-${kind}`
  const base = {
    type: 'check',
    id,
    kind,
    promptMd: CHECK_KIND_LABEL[kind],
    explainMd: 'State the rule in one sentence.',
    skillIds: [],
    hintLadder: [{ level: 1, kind: 'concept', md: 'Read the prompt again. What must be true?' }]
  }
  const two = [
    { id: 'a', md: 'First choice' },
    { id: 'b', md: 'Second choice' }
  ]
  const four = [...two, { id: 'c', md: 'Third choice' }, { id: 'd', md: 'Fourth choice' }]
  if (kind === 'mcq' || kind === 'odd' || kind === 'listen' || kind === 'image') {
    return { ...base, choices: four, answer: 'a', audio: kind === 'listen' ? 'assets/clip.wav' : undefined }
  }
  if (kind === 'tf') return { ...base, answer: 'true' }
  if (kind === 'multi') return { ...base, choices: four, answer: ['a', 'c'] }
  if (kind === 'short') return { ...base, promptMd: 'A list is a ________ of values.', answer: ['container', 'collection'] }
  if (kind === 'select') {
    return {
      ...base,
      promptMd: 'A list is a ________ of values.',
      choices: [
        { id: 'container', md: 'container' },
        { id: 'collection', md: 'collection' },
        { id: 'number', md: 'number' }
      ],
      answer: ['container', 'collection']
    }
  }
  if (kind === 'fix') {
    return {
      ...base,
      starter: 'A list is a number of values.',
      answer: ['A list is a container of values.', 'A list is a collection of values.']
    }
  }
  if (kind === 'numeric' || kind === 'slider' || kind === 'numberline') {
    return { ...base, min: 0, max: 10, step: 1, unit: kind === 'numeric' ? 'A' : undefined, answer: { value: 2, tolerance: kind === 'slider' ? 1 : 0 } }
  }
  if (kind === 'cloze') {
    return {
      ...base,
      promptMd: 'A list is a {{a}} of {{b}}.',
      blanks: [
        { id: 'a', choices: [{ id: 'container', md: 'container' }, { id: 'number', md: 'number' }] },
        { id: 'b', choices: [{ id: 'values', md: 'values' }, { id: 'files', md: 'files' }] }
      ],
      answer: { a: 'container', b: 'values' }
    }
  }
  if (kind === 'bank') {
    return {
      ...base,
      promptMd: 'A {{a}} holds many {{b}}.',
      pieces: [
        { id: 'list', md: 'list' },
        { id: 'values', md: 'values' },
        { id: 'loop', md: 'loop' }
      ],
      answer: { a: 'list', b: 'values' }
    }
  }
  if (kind === 'match') {
    return {
      ...base,
      left: [
        { id: 'len', md: 'length' },
        { id: 'idx', md: 'index' }
      ],
      right: [
        { id: 'how', md: 'how many items' },
        { id: 'pos', md: 'position of one item' }
      ],
      answer: { len: 'how', idx: 'pos' }
    }
  }
  if (kind === 'order') {
    return { ...base, choices: [{ id: 'first', md: 'First' }, { id: 'then', md: 'Then' }, { id: 'last', md: 'Last' }], answer: ['first', 'then', 'last'] }
  }
  if (kind === 'place' || kind === 'hotspot' || kind === 'gorder') {
    return {
      ...base,
      image: 'assets/page.svg',
      slots: [
        { id: 'top', x: 8, y: 8, w: 84, h: 18, label: 'Top' },
        { id: 'mid', x: 8, y: 32, w: 84, h: 38, label: 'Middle' },
        { id: 'bot', x: 8, y: 76, w: 84, h: 16, label: 'Bottom' }
      ],
      pieces: kind === 'place' ? [{ id: 'header', md: 'Header' }, { id: 'body', md: 'Article' }, { id: 'footer', md: 'Footer' }] : undefined,
      answer: kind === 'gorder' ? ['top', 'mid', 'bot'] : kind === 'hotspot' ? 'mid' : { top: 'header', mid: 'body', bot: 'footer' }
    }
  }
  if (kind === 'bins') {
    return {
      ...base,
      bins: [
        { id: 'safe', md: 'Safe' },
        { id: 'hot', md: 'Too much' }
      ],
      pieces: [
        { id: 'one', md: 'Current 1' },
        { id: 'four', md: 'Current 4' }
      ],
      answer: { one: 'safe', four: 'hot' }
    }
  }
  if (kind === 'venn') {
    return {
      ...base,
      sets: [
        { id: 'fruit', md: 'Fruit' },
        { id: 'red', md: 'Red' }
      ],
      pieces: [
        { id: 'apple', md: 'Apple' },
        { id: 'banana', md: 'Banana' },
        { id: 'fire', md: 'Fire truck' }
      ],
      answer: { apple: 'both', banana: 'fruit', fire: 'red' }
    }
  }
  if (kind === 'hottext') {
    return { ...base, promptMd: 'The fox walked [[ok:east]] then [[bad:teleported]] to the beacon.', answer: 'bad' }
  }
  if (kind === 'table') {
    return {
      ...base,
      rows: [
        { id: 'n', md: '42' },
        { id: 's', md: '"hi"' }
      ],
      choices: [
        { id: 'num', md: 'number' },
        { id: 'str', md: 'string' }
      ],
      answer: { n: 'num', s: 'str' }
    }
  }
  if (kind === 'tier') {
    return {
      ...base,
      choices: [
        { id: 'ok', md: 'Lower the current' },
        { id: 'no', md: 'Set resistance to 0', misconceptionId: 'ignores-current-limit' }
      ],
      reasons: [
        { id: 'cap', md: 'Current must stay under the cap.', when: ['ok'] },
        { id: 'bright', md: 'Zero ohms is always brighter.', when: ['no'] }
      ],
      answer: { choice: 'ok', reason: 'cap' }
    }
  }
  return { ...base, choices: two, answer: 'a' }
}

export { CHECK_KINDS, CHECK_KIND_LABEL }
