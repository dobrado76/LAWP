import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(process.cwd(), 'resources', 'packs', 'lawp.learning.questions')
const kinds = [
  ['mcq', 'Pick one', 'One right answer. Use this for a single fact.'],
  ['multi', 'Pick every right answer', 'Several boxes can be true. Missing one fails.'],
  ['odd', 'Which does not belong?', 'Same widget as pick-one. The odd item is the answer.'],
  ['tf', 'True or false', 'Two buttons. Still a closed fact, not an opinion.'],
  ['image', 'Pick the picture', 'Choices can be images. Import assets in Author.'],
  ['short', 'Type the word', 'A short string. Case and extra spaces do not matter. Close spellings pass.'],
  ['select', 'Choose the word', 'Same sentence as type-the-word, but the blank is a dropdown.'],
  ['numeric', 'Enter the number', 'A number, optional unit and tolerance.'],
  ['fix', 'Fix this', 'Edit the broken sentence. Several accepted lines; close spellings pass.'],
  ['cloze', 'Fill the blanks', 'A sentence with {{a}} dropdowns.'],
  ['bank', 'Drag words into the sentence', 'One shared pile of words. Drag into {{a}} blanks.'],
  ['match', 'Connect each pair', 'Each left item maps to one right item.'],
  ['order', 'Put these in order', 'Priorities, steps, or lines of code.'],
  ['place', 'Place each piece', 'Drag chips onto slots on a diagram.'],
  ['hotspot', 'Tap the right spot', 'Click a region on the picture. No dragging.'],
  ['gorder', 'Number the steps on the picture', 'Tap slots in the order they should happen.'],
  ['bins', 'Sort into bins', 'Many cards, a few buckets, leftover distractors allowed.'],
  ['venn', 'Place in the sets', 'A only, A and B, B only, or neither.'],
  ['hottext', 'Tap the word', 'A passage. Tap the token that is wrong or that proves the claim.'],
  ['table', 'Choose for each row', 'Same choices down a column.'],
  ['tier', 'Choose, then say why', 'Two-step diagnostic. Both parts must match.'],
  ['slider', 'Estimate', 'A range. Tolerance on the answer decides pass.'],
  ['numberline', 'Pin the number', 'Tap a tick on the line.'],
  ['listen', 'Listen, then pick', 'Play the clip, then choose. This clip is three beeps.']
]

const pageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#121816"/>
  <rect x="16" y="12" width="288" height="36" rx="4" fill="#24302b" stroke="#3d5a52"/>
  <rect x="16" y="60" width="288" height="88" rx="4" fill="#24302b" stroke="#3d5a52"/>
  <rect x="16" y="160" width="288" height="28" rx="4" fill="#24302b" stroke="#3d5a52"/>
</svg>`

function shapeSvg(fill, shape) {
  const body =
    shape === 'circle'
      ? `<circle cx="40" cy="40" r="28" fill="${fill}"/>`
      : shape === 'square'
        ? `<rect x="12" y="12" width="56" height="56" fill="${fill}"/>`
        : `<polygon points="40,8 72,72 8,72" fill="${fill}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">${body}</svg>`
}

function beepWav() {
  const rate = 8000
  const samples = []
  for (let b = 0; b < 3; b++) {
    for (let i = 0; i < rate * 0.12; i++) samples.push(Math.round(Math.sin((2 * Math.PI * 880 * i) / rate) * 80 + 128))
    for (let i = 0; i < rate * 0.1; i++) samples.push(128)
  }
  const data = Buffer.from(samples)
  const hdr = Buffer.alloc(44)
  hdr.write('RIFF', 0)
  hdr.writeUInt32LE(36 + data.length, 4)
  hdr.write('WAVE', 8)
  hdr.write('fmt ', 12)
  hdr.writeUInt32LE(16, 16)
  hdr.writeUInt16LE(1, 20)
  hdr.writeUInt16LE(1, 22)
  hdr.writeUInt32LE(rate, 24)
  hdr.writeUInt32LE(rate, 28)
  hdr.writeUInt16LE(1, 32)
  hdr.writeUInt16LE(8, 34)
  hdr.write('data', 36)
  hdr.writeUInt32LE(data.length, 40)
  return Buffer.concat([hdr, data])
}

const CARD_COPY = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'lesson-card-copy.json'), 'utf8'))

function lesson(id, title, blocks) {
  return {
    kind: 'lesson',
    schemaVersion: 1,
    id,
    packId: 'lawp.learning.questions',
    courseId: 'kinds',
    moduleId: 'all',
    title,
    description: CARD_COPY['lawp.learning.questions']?.[id],
    skillIds: ['check.kinds'],
    estimatedMinutes: 3,
    taskRev: 1,
    blocks
  }
}

function writeLesson(id, title, blocks, assets = {}) {
  const dir = join(root, 'lessons', id)
  mkdirSync(join(dir, 'assets'), { recursive: true })
  writeFileSync(join(dir, 'lesson.json'), JSON.stringify(lesson(id, title, blocks), null, 2))
  for (const [name, body] of Object.entries(assets)) {
    writeFileSync(join(dir, 'assets', name), body)
  }
}

mkdirSync(join(root, 'tracks'), { recursive: true })
mkdirSync(join(root, 'courses'), { recursive: true })
writeFileSync(
  join(root, 'pack.json'),
  JSON.stringify(
    {
      kind: 'pack',
      schemaVersion: 1,
      id: 'lawp.learning.questions',
      title: 'Question types',
      description:
        'Pick, match, sort, listen, and more — every way a question can look. Play them to see how answering works.',
      subjects: ['learning'],
      category: 'Learning',
      cover: 'assets/cover.png',
      engines: ['none'],
      capabilities: { execute: 'none', network: false },
      version: '0.1.0',
      locale: 'en',
      authors: ['LAWP'],
      tracks: ['kinds']
    },
    null,
    2
  )
)
writeFileSync(
  join(root, 'tracks', 'kinds.json'),
  JSON.stringify(
    {
      id: 'kinds',
      title: 'Question types',
      courseIds: ['kinds'],
      intro: 'Try each kind of question. No code — tap, type, drag, or listen.'
    },
    null,
    2
  )
)
writeFileSync(
  join(root, 'courses', 'kinds.json'),
  JSON.stringify(
    {
      id: 'kinds',
      title: 'The inventory',
      level: 'beginner',
      estimatedMinutes: 70,
      skillIds: ['check.kinds'],
      modules: [{ id: 'all', title: 'Kinds', lessonIds: ['check-kinds', ...kinds.map(([k]) => `check-${k}`)] }]
    },
    null,
    2
  )
)
writeFileSync(join(root, 'skills.json'), JSON.stringify([{ id: 'check.kinds', title: 'Question kinds', prereqIds: [] }], null, 2))
writeFileSync(
  join(root, 'misconceptions.json'),
  JSON.stringify([{ id: 'ignores-current-limit', title: 'Zero ohms is always the goal', skillIds: ['check.kinds'] }], null, 2)
)

writeLesson('check-kinds', 'What this pack is', [
  {
    type: 'explain',
    md: [
      '## The inventory',
      '',
      'Each next lesson is one way a question can look. Pick, type, drag, or listen — then see how the app grades it.',
      '',
      kinds.map(([k, label, why]) => `- **${k}** — ${label}. ${why}`).join('\n'),
      '',
      'When you add a kind: add it to `CHECK_KINDS` in `src/shared/check.ts`, grade it, draw it, add a lesson here, and run the tests. Author can build every kind from forms — you do not write JSON by hand.'
    ].join('\n')
  }
])

writeLesson('check-mcq', 'Pick one', [
  { type: 'explain', md: '## One answer\n\nOnly one choice is right.' },
  {
    type: 'check',
    id: 'q',
    kind: 'mcq',
    promptMd: 'Which fruit is typically red when ripe?',
    choices: [
      { id: 'apple', md: 'Apple' },
      { id: 'banana', md: 'Banana' },
      { id: 'lime', md: 'Lime' }
    ],
    answer: 'apple',
    explainMd: 'A ripe apple is often red. The others are not.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-multi', 'Pick every right answer', [
  { type: 'explain', md: '## Several can be true\n\nCheck every box that holds.' },
  {
    type: 'check',
    id: 'q',
    kind: 'multi',
    promptMd: 'Which of these are numbers?',
    choices: [
      { id: 'n', md: '`42`' },
      { id: 's', md: '`"42"`' },
      { id: 't', md: '`true`' },
      { id: 'z', md: '`0`' }
    ],
    answer: ['n', 'z'],
    explainMd: '`42` and `0` are numbers. The quoted one is text. `true` is a boolean.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-odd', 'Which does not belong?', [
  { type: 'explain', md: '## The odd one\n\nSame as pick-one. The prompt asks which item is not like the others.' },
  {
    type: 'check',
    id: 'q',
    kind: 'odd',
    promptMd: 'Which does not belong with the fruits?',
    choices: [
      { id: 'apple', md: 'Apple' },
      { id: 'pear', md: 'Pear' },
      { id: 'hammer', md: 'Hammer' },
      { id: 'peach', md: 'Peach' }
    ],
    answer: 'hammer',
    explainMd: 'A hammer is a tool, not a fruit.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-tf', 'True or false', [
  { type: 'explain', md: '## Two buttons\n\nStill a fact, not “how do you feel”.' },
  {
    type: 'check',
    id: 'q',
    kind: 'tf',
    promptMd: 'A list’s length is how many items it holds.',
    answer: 'true',
    explainMd: 'Length counts items. Index is the position of one item.',
    skillIds: ['check.kinds']
  }
])

writeLesson(
  'check-image',
  'Pick the picture',
  [
    { type: 'explain', md: '## The answer is a picture\n\nTap the circle.' },
    {
      type: 'check',
      id: 'q',
      kind: 'image',
      promptMd: 'Which shape is a circle?',
      choices: [
        { id: 'c', md: 'Circle', image: 'assets/circle.svg' },
        { id: 's', md: 'Square', image: 'assets/square.svg' },
        { id: 't', md: 'Triangle', image: 'assets/tri.svg' }
      ],
      answer: 'c',
      explainMd: 'The circle is round.',
      skillIds: ['check.kinds']
    }
  ],
  { 'circle.svg': shapeSvg('#3d9', 'circle'), 'square.svg': shapeSvg('#c66', 'square'), 'tri.svg': shapeSvg('#69c', 'tri') }
)

writeLesson('check-short', 'Type the word', [
  { type: 'explain', md: '## A short string\n\nSpaces, capitals, and close spellings are accepted. List every word that should pass.' },
  {
    type: 'check',
    id: 'q',
    kind: 'short',
    promptMd: 'A list is a ________ of values.',
    answer: ['container', 'collection'],
    explainMd: 'A list holds many values. Container or collection both pass.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-select', 'Choose the word', [
  { type: 'explain', md: '## A menu in the sentence\n\nSame idea as type-the-word, but you pick. More than one choice can be right.' },
  {
    type: 'check',
    id: 'q',
    kind: 'select',
    promptMd: 'A list is a ________ of values.',
    choices: [
      { id: 'container', md: 'container' },
      { id: 'collection', md: 'collection' },
      { id: 'number', md: 'number' }
    ],
    answer: ['container', 'collection'],
    explainMd: 'Container or collection both name what a list is. Number is a kind of value.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-numeric', 'Enter the number', [
  { type: 'explain', md: '## A number with a unit\n\nCurrent = 1 / ohms. Cap is 2.' },
  {
    type: 'check',
    id: 'q',
    kind: 'numeric',
    promptMd: 'If resistance is 1, what is the current?',
    unit: 'A',
    answer: { value: 1, tolerance: 0 },
    explainMd: '1 / 1 = 1 ampere.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-fix', 'Fix this', [
  { type: 'explain', md: '## Edit the line\n\nThe starter is wrong. Several finished sentences can be right, and close spellings pass.' },
  {
    type: 'check',
    id: 'q',
    kind: 'fix',
    promptMd: 'Correct the sentence.',
    starter: 'A list is a number of values.',
    answer: ['A list is a container of values.', 'A list is a collection of values.'],
    explainMd: 'A list is a container or a collection of values. Number is a kind of value, not the list itself.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-cloze', 'Fill the blanks', [
  { type: 'explain', md: '## Dropdowns in a sentence\n\n`{{a}}` becomes a menu.' },
  {
    type: 'check',
    id: 'q',
    kind: 'cloze',
    promptMd: 'A list is a {{a}} of {{b}}.',
    blanks: [
      { id: 'a', choices: [{ id: 'container', md: 'container' }, { id: 'number', md: 'number' }] },
      { id: 'b', choices: [{ id: 'values', md: 'values' }, { id: 'files', md: 'files' }] }
    ],
    answer: { a: 'container', b: 'values' },
    explainMd: 'A list is a container of values.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-bank', 'Drag words into the sentence', [
  { type: 'explain', md: '## One pile of words\n\nDrag a chip into each blank. Extra words stay in the bank.' },
  {
    type: 'check',
    id: 'q',
    kind: 'bank',
    promptMd: 'A {{a}} holds many {{b}}.',
    pieces: [
      { id: 'list', md: 'list' },
      { id: 'values', md: 'values' },
      { id: 'loop', md: 'loop' }
    ],
    answer: { a: 'list', b: 'values' },
    explainMd: 'A list holds many values. A loop is how you walk them, not what they are.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-match', 'Connect each pair', [
  { type: 'explain', md: '## Left to right\n\nEach left term has one right meaning.' },
  {
    type: 'check',
    id: 'q',
    kind: 'match',
    promptMd: 'Match the word to what it means.',
    left: [
      { id: 'len', md: 'length' },
      { id: 'idx', md: 'index' }
    ],
    right: [
      { id: 'how', md: 'how many items' },
      { id: 'pos', md: 'position of one item' }
    ],
    answer: { len: 'how', idx: 'pos' },
    explainMd: 'Length counts. Index locates.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-order', 'Put these in order', [
  { type: 'explain', md: '## Sequence\n\nUse Up and Down. First step at the top.' },
  {
    type: 'check',
    id: 'q',
    kind: 'order',
    promptMd: 'Order the steps for a safe lamp.',
    choices: [
      { id: 'cap', md: 'Know the current cap' },
      { id: 'set', md: 'Change resistance' },
      { id: 'see', md: 'Watch brightness and current' }
    ],
    answer: ['cap', 'set', 'see'],
    explainMd: 'Know the limit before you turn the knob.',
    skillIds: ['check.kinds']
  }
])

const slots = [
  { id: 'top', x: 50, y: 15, w: 70, h: 16, label: 'Top' },
  { id: 'mid', x: 50, y: 52, w: 70, h: 30, label: 'Middle' },
  { id: 'bot', x: 50, y: 87, w: 70, h: 12, label: 'Bottom' }
]

writeLesson(
  'check-place',
  'Place each piece',
  [
    { type: 'explain', md: '## Drop on the diagram\n\nDrag Header, Article, and Footer onto the page.' },
    {
      type: 'check',
      id: 'q',
      kind: 'place',
      promptMd: 'Label the page.',
      image: 'assets/page.svg',
      slots,
      pieces: [
        { id: 'header', md: 'Header' },
        { id: 'body', md: 'Article' },
        { id: 'footer', md: 'Footer' },
        { id: 'side', md: 'Sidebar' }
      ],
      answer: { top: 'header', mid: 'body', bot: 'footer' },
      explainMd: 'Header on top, article in the middle, footer at the bottom. Sidebar is leftover.',
      skillIds: ['check.kinds']
    }
  ],
  { 'page.svg': pageSvg }
)

writeLesson(
  'check-hotspot',
  'Tap the right spot',
  [
    { type: 'explain', md: '## Click, do not drag\n\nTap the middle of the page — that is where the article lives.' },
    {
      type: 'check',
      id: 'q',
      kind: 'hotspot',
      promptMd: 'Where does the article go?',
      image: 'assets/page.svg',
      slots,
      answer: 'mid',
      explainMd: 'The large middle band is the article.',
      skillIds: ['check.kinds']
    }
  ],
  { 'page.svg': pageSvg }
)

writeLesson(
  'check-gorder',
  'Number the steps on the picture',
  [
    { type: 'explain', md: '## Order on a picture\n\nTap top, then middle, then bottom — the order a page is read.' },
    {
      type: 'check',
      id: 'q',
      kind: 'gorder',
      promptMd: 'Number the bands in reading order.',
      image: 'assets/page.svg',
      slots,
      answer: ['top', 'mid', 'bot'],
      explainMd: 'We read top to bottom.',
      skillIds: ['check.kinds']
    }
  ],
  { 'page.svg': pageSvg }
)

writeLesson('check-bins', 'Sort into bins', [
  { type: 'explain', md: '## Buckets\n\nPut each current in Safe or Too much. The cap is 2.' },
  {
    type: 'check',
    id: 'q',
    kind: 'bins',
    promptMd: 'Sort these currents. Cap is 2.',
    bins: [
      { id: 'safe', md: 'Safe' },
      { id: 'hot', md: 'Too much' }
    ],
    pieces: [
      { id: 'one', md: '1' },
      { id: 'four', md: '4' },
      { id: 'half', md: '0.5' }
    ],
    answer: { one: 'safe', four: 'hot', half: 'safe' },
    explainMd: '4 is over the cap. 1 and 0.5 are under.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-venn', 'Place in the sets', [
  {
    type: 'explain',
    md: '## Overlap\n\nTwo sets: **fruit** and **red**. An apple belongs in both. A banana is fruit only. A fire truck is red only. An idea is neither fruit nor red.'
  },
  {
    type: 'check',
    id: 'q',
    kind: 'venn',
    promptMd: 'Put each thing in fruit only, fruit and red, red only, or neither.',
    sets: [
      { id: 'fruit', md: 'Fruit' },
      { id: 'red', md: 'Red' }
    ],
    pieces: [
      { id: 'apple', md: 'Apple' },
      { id: 'banana', md: 'Banana' },
      { id: 'truck', md: 'Fire truck' },
      { id: 'idea', md: 'An idea' }
    ],
    answer: { apple: 'both', banana: 'fruit', truck: 'red', idea: 'out' },
    explainMd: 'An apple is a red fruit. A banana is fruit only. A fire truck is red only. An idea is neither.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-hottext', 'Tap the word', [
  { type: 'explain', md: '## A word in a sentence\n\nTap the token that is wrong.' },
  {
    type: 'check',
    id: 'q',
    kind: 'hottext',
    promptMd: 'The fox walked [[ok:east]] then [[bad:teleported]] to the beacon.',
    answer: 'bad',
    explainMd: 'The fox walks. It does not teleport.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-table', 'Choose for each row', [
  {
    type: 'explain',
    md: '## Quotes change the type\n\n`42` (no quotes) is the number forty-two. `"42"` (quotes) is text that looks like 42. They are not the same kind of value.'
  },
  {
    type: 'check',
    id: 'q',
    kind: 'table',
    promptMd: 'What kind of value is each of these?',
    rows: [
      { id: 'n', md: '`42`' },
      { id: 's', md: '`"42"`' }
    ],
    choices: [
      { id: 'num', md: 'number' },
      { id: 'str', md: 'string' }
    ],
    answer: { n: 'num', s: 'str' },
    explainMd: 'No quotes → number. Quotes → string. The digits can be the same; the quotes decide the type.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-tier', 'Choose, then say why', [
  { type: 'explain', md: '## Two steps\n\nPick the move, then the reason. Both must be right.' },
  {
    type: 'check',
    id: 'q',
    kind: 'tier',
    promptMd: 'The lamp is dim. The cap is 2. What is the safer move?',
    choices: [
      { id: 'ok', md: 'Lower resistance a little' },
      { id: 'no', md: 'Set resistance to 0', misconceptionId: 'ignores-current-limit' }
    ],
    reasons: [
      { id: 'cap', md: 'Current must stay under the cap.', when: ['ok'] },
      { id: 'bright', md: 'Zero ohms is always brighter.', when: ['no'] }
    ],
    answer: { choice: 'ok', reason: 'cap' },
    explainMd: 'A little less resistance raises brightness. Zero ohms blows the cap.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-slider', 'Estimate', [
  { type: 'explain', md: '## Close enough\n\nThe slider allows a band. About 5 is fine.' },
  {
    type: 'check',
    id: 'q',
    kind: 'slider',
    promptMd: 'About how many fingers on one hand?',
    min: 0,
    max: 10,
    step: 1,
    answer: { value: 5, tolerance: 1 },
    explainMd: 'Five, plus or minus one, passes. This is for estimates, not for exact current.',
    skillIds: ['check.kinds']
  }
])

writeLesson('check-numberline', 'Pin the number', [
  { type: 'explain', md: '## A line of ticks\n\nTap 3.' },
  {
    type: 'check',
    id: 'q',
    kind: 'numberline',
    promptMd: 'Pin the number of sides on a triangle.',
    min: 0,
    max: 6,
    step: 1,
    answer: { value: 3, tolerance: 0 },
    explainMd: 'A triangle has three sides.',
    skillIds: ['check.kinds']
  }
])

writeLesson(
  'check-listen',
  'Listen, then pick',
  [
    { type: 'explain', md: '## A clip, then a choice\n\nPlay the sound. Count the beeps.' },
    {
      type: 'check',
      id: 'q',
      kind: 'listen',
      promptMd: 'How many beeps are in the clip?',
      audio: 'assets/clip.wav',
      choices: [
        { id: 'one', md: 'One' },
        { id: 'two', md: 'Two' },
        { id: 'three', md: 'Three' }
      ],
      answer: 'three',
      explainMd: 'Three short tones.',
      skillIds: ['check.kinds']
    }
  ],
  { 'clip.wav': beepWav() }
)

console.log(`wrote ${kinds.length + 1} lessons to ${root}`)
