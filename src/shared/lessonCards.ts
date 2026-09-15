export type LessonIconName =
  | 'Accessibility'
  | 'ArrowDownToLine'
  | 'ArrowLeftRight'
  | 'ArrowRight'
  | 'BadgeAlert'
  | 'Ban'
  | 'Binary'
  | 'BookOpen'
  | 'Bot'
  | 'Box'
  | 'Boxes'
  | 'Braces'
  | 'Bug'
  | 'CheckSquare'
  | 'ChevronDown'
  | 'Circle'
  | 'CircleDashed'
  | 'CircleDot'
  | 'CircleStop'
  | 'CircuitBoard'
  | 'Clock'
  | 'Command'
  | 'Compass'
  | 'Component'
  | 'Copy'
  | 'Crosshair'
  | 'Equal'
  | 'Eraser'
  | 'FileCheck'
  | 'FileInput'
  | 'FileJson'
  | 'FileWarning'
  | 'Filter'
  | 'Flag'
  | 'FolderTree'
  | 'Footprints'
  | 'Ghost'
  | 'GitBranch'
  | 'GitMerge'
  | 'Globe'
  | 'HardDrive'
  | 'Hash'
  | 'Headphones'
  | 'HelpCircle'
  | 'Highlighter'
  | 'Hourglass'
  | 'Image'
  | 'Inbox'
  | 'Key'
  | 'KeyRound'
  | 'Layers'
  | 'LayoutDashboard'
  | 'LayoutGrid'
  | 'Library'
  | 'Lightbulb'
  | 'Link'
  | 'List'
  | 'ListChecks'
  | 'ListOrdered'
  | 'Lock'
  | 'Mail'
  | 'MessageSquare'
  | 'Minus'
  | 'MousePointerClick'
  | 'Navigation'
  | 'Network'
  | 'Package'
  | 'Pencil'
  | 'Play'
  | 'Plus'
  | 'Puzzle'
  | 'Quote'
  | 'Radio'
  | 'Repeat'
  | 'Reply'
  | 'RotateCcw'
  | 'Ruler'
  | 'Scan'
  | 'ScanSearch'
  | 'ScrollText'
  | 'Search'
  | 'SearchX'
  | 'Send'
  | 'Settings2'
  | 'Shapes'
  | 'Shield'
  | 'ShieldAlert'
  | 'ShieldOff'
  | 'Shuffle'
  | 'Skull'
  | 'SlidersHorizontal'
  | 'Sparkles'
  | 'Table2'
  | 'Tag'
  | 'Tags'
  | 'Terminal'
  | 'TestTube'
  | 'TextCursorInput'
  | 'Timer'
  | 'ToggleLeft'
  | 'Type'
  | 'User'
  | 'Users'
  | 'Watch'
  | 'Waves'
  | 'Zap'

export type LessonCardCopy = {
  description: string
  icon: LessonIconName
  color: string
  tags: string[]
}

const teal = '#2ec4b6'
const amber = '#e6b84d'
const green = '#7dce82'
const orange = '#f59e5b'
const blue = '#7eb6ff'
const purple = '#c084fc'
const red = '#e07a5f'
const pink = '#f472b6'
const cyan = '#22d3ee'

export const LESSON_CARDS: Record<string, LessonCardCopy> = {
  'what-is-a-loop': {
    description: 'A lamp lights only when the path from the supply and back again is closed. Open that path and the lamp goes dark, even if every part is still on the table.',
    icon: 'CircuitBoard',
    color: amber,
    tags: ['loop', 'lamp', 'path']
  },
  'brighter-lamp': {
    description: 'Predict the brightness first, then change one part of the circuit and watch the lamp. The goal is to make it shine brighter on purpose, not by guessing.',
    icon: 'Lightbulb',
    color: amber,
    tags: ['current', 'lamp', 'predict']
  },
  'why-the-limit': {
    description: 'Too much current can damage a part even when the loop is complete. A safe limit is a ceiling, not a target you try to hit.',
    icon: 'ShieldAlert',
    color: orange,
    tags: ['current', 'limit', 'safety']
  },
  'transfer-fuse': {
    description: 'The same current idea shows up in a fuse story. If the flow climbs too high, the fuse opens the path so the rest of the circuit survives.',
    icon: 'Zap',
    color: red,
    tags: ['fuse', 'current', 'protect']
  },
  'keep-your-circuit': {
    description: 'Keep the circuit you built. You can come back to it later instead of starting from an empty bench.',
    icon: 'Package',
    color: teal,
    tags: ['keep', 'circuit']
  },
  'names-and-values': {
    description: 'A name is a label on a box. Put a value in the box and you can use that value again later without typing it twice.',
    icon: 'Tag',
    color: blue,
    tags: ['name', 'value', 'variable']
  },
  'types-you-can-see': {
    description: 'Numbers, text, and true or false are different kinds of value. Asking for the kind tells you what you can do with what you have.',
    icon: 'Shapes',
    color: purple,
    tags: ['int', 'bool', 'string']
  },
  'walk-the-fox': {
    description: 'A call is one step. Name the walk and the fox moves one cell. Repeat the call to go farther.',
    icon: 'Footprints',
    color: orange,
    tags: ['function', 'call', 'grid']
  },
  'compare-is-not-assign': {
    description: 'Asking whether two things are equal is a yes or no. Giving a name a value is a different act. Mixing them up is the classic beginner fault.',
    icon: 'Equal',
    color: teal,
    tags: ['equality', 'assign', 'bool']
  },
  'if-this-then-that': {
    description: 'A decision looks at a check. When the check is true, one path runs. When it is false, the other path runs, or nothing does.',
    icon: 'GitBranch',
    color: green,
    tags: ['if', 'bool', 'branch']
  },
  'say-it-once': {
    description: 'Write the message once, give it a name, and reuse it. Repeating the same line in three places is how small programs go stale.',
    icon: 'MessageSquare',
    color: blue,
    tags: ['string', 'reuse', 'name']
  },
  'greeting-bot': {
    description: 'Build a small greeting you can keep. The bot should use a name and a message you can run again tomorrow.',
    icon: 'Bot',
    color: purple,
    tags: ['function', 'string', 'keep']
  },
  'function-returns-ui': {
    description: 'A component is a function. It runs and hands back the piece of the page that should appear, instead of drawing by side effect.',
    icon: 'Component',
    color: cyan,
    tags: ['component', 'function', 'return']
  },
  'props-flow-in': {
    description: 'Values flow into a component from the outside. The parent decides what to pass. The child reads those values and does not invent them.',
    icon: 'ArrowDownToLine',
    color: blue,
    tags: ['props', 'parameters', 'component']
  },
  'click-changes-state': {
    description: 'A click replaces what the screen remembers. After the memory changes, the page draws again from that new memory.',
    icon: 'MousePointerClick',
    color: amber,
    tags: ['state', 'event', 'render']
  },
  'list-needs-key': {
    description: 'Each item in a list needs a stable key. Without one, inserts and deletes can attach the wrong memory to the wrong row.',
    icon: 'List',
    color: teal,
    tags: ['list', 'key', 'array']
  },
  'filter-the-list': {
    description: 'Show only the items that match what the learner asked for. The full list stays in memory. The view is the filtered slice.',
    icon: 'Filter',
    color: purple,
    tags: ['filter', 'list', 'array']
  },
  'keep-the-app': {
    description: 'Keep the list you built. Come back to the same app instead of throwing the work away at the end of the lesson.',
    icon: 'Package',
    color: green,
    tags: ['keep', 'list']
  },
  'check-kinds': {
    description: 'Walk through every way a question can look in LAWP. Submit once for each kind so you see how answering and grading feel.',
    icon: 'LayoutGrid',
    color: teal,
    tags: ['question', 'kinds', 'grade']
  },
  'check-mcq': {
    description: 'One choice is right. The others are plausible but wrong. Pick the single answer that matches the prompt.',
    icon: 'CircleDot',
    color: blue,
    tags: ['pick one', 'choice']
  },
  'check-multi': {
    description: 'Every true box must be checked, and no false box may be. Missing one right answer fails the whole question.',
    icon: 'ListChecks',
    color: green,
    tags: ['multi', 'bool']
  },
  'check-odd': {
    description: 'Four items share a rule. One of them does not. Find the item that does not belong, and be able to say why.',
    icon: 'SearchX',
    color: orange,
    tags: ['odd one out']
  },
  'check-tf': {
    description: 'A closed fact is either true or false. There is no sometimes. Read the sentence as written, not the version you wish it said.',
    icon: 'ToggleLeft',
    color: purple,
    tags: ['bool', 'true/false']
  },
  'check-image': {
    description: 'The answer is a picture, not a word. Tap the image that matches the prompt and ignore the look-alikes.',
    icon: 'Image',
    color: pink,
    tags: ['image', 'choice']
  },
  'check-short': {
    description: 'Type a short word or phrase. Close spellings still pass, so a missed letter is not an automatic fail.',
    icon: 'Type',
    color: cyan,
    tags: ['string', 'spelling']
  },
  'check-select': {
    description: 'A sentence has a hole. Open the menu in that hole and choose the word that makes the sentence true.',
    icon: 'ChevronDown',
    color: blue,
    tags: ['select', 'string']
  },
  'check-numeric': {
    description: 'Enter the number the prompt asks for. If a unit is shown, include it. Close values can still pass when a tolerance is set.',
    icon: 'Hash',
    color: amber,
    tags: ['number', 'unit']
  },
  'check-fix': {
    description: 'The starter sentence is wrong on purpose. Edit it until it matches a finished answer. Close spellings still count.',
    icon: 'Pencil',
    color: orange,
    tags: ['fix', 'string']
  },
  'check-cloze': {
    description: 'Each blank has its own short list. Fill every blank. A right word in the wrong slot is still wrong.',
    icon: 'TextCursorInput',
    color: teal,
    tags: ['cloze', 'blanks']
  },
  'check-bank': {
    description: 'Words sit in a shared pile. Drag each one into the blank it belongs in. Leftover words can stay in the pile.',
    icon: 'Layers',
    color: purple,
    tags: ['word bank', 'blanks']
  },
  'check-match': {
    description: 'Each item on the left has one partner on the right. Connect every pair. A swapped pair fails both sides.',
    icon: 'ArrowLeftRight',
    color: blue,
    tags: ['match', 'pairs']
  },
  'check-order': {
    description: 'The steps are right, but the order is not. Put them in the sequence they should happen, first to last.',
    icon: 'ListOrdered',
    color: green,
    tags: ['order', 'list']
  },
  'check-place': {
    description: 'Pieces belong on a diagram. Drag each piece onto the spot that matches it. A right piece on the wrong spot fails.',
    icon: 'Puzzle',
    color: amber,
    tags: ['place', 'diagram']
  },
  'check-hotspot': {
    description: 'The picture is the question. Tap the region that answers it. Nearby regions are meant to look tempting.',
    icon: 'Crosshair',
    color: red,
    tags: ['hotspot', 'image']
  },
  'check-gorder': {
    description: 'Tap the spots on the picture in the order the story happens. The sequence is the answer, not a single click.',
    icon: 'ListOrdered',
    color: cyan,
    tags: ['order', 'image']
  },
  'check-bins': {
    description: 'Sort the cards into buckets. Some cards may stay out if they belong in none of the bins.',
    icon: 'Inbox',
    color: orange,
    tags: ['bins', 'sort']
  },
  'check-venn': {
    description: 'Two sets overlap. Place each item in the left set, the right set, both, or neither. The overlap is a real place.',
    icon: 'Circle',
    color: purple,
    tags: ['sets', 'venn']
  },
  'check-hottext': {
    description: 'A word in the passage is the proof, or the mistake. Tap that word. The rest of the sentence is there to frame it.',
    icon: 'Highlighter',
    color: pink,
    tags: ['hot text', 'string']
  },
  'check-table': {
    description: 'Every row needs an answer, and the choices repeat. Fill the whole table. One blank row fails the question.',
    icon: 'Table2',
    color: blue,
    tags: ['table', 'choice']
  },
  'check-tier': {
    description: 'First pick the answer. Then pick the reason that belongs with it. A right answer with the wrong why still fails.',
    icon: 'HelpCircle',
    color: teal,
    tags: ['why', 'two-step']
  },
  'check-slider': {
    description: 'Estimate a value on a range. You do not need the exact tick. Close enough still passes.',
    icon: 'SlidersHorizontal',
    color: amber,
    tags: ['number', 'estimate']
  },
  'check-numberline': {
    description: 'Pin the number on the line. Left is smaller, right is larger. The mark is the answer.',
    icon: 'Minus',
    color: green,
    tags: ['number', 'line']
  },
  'check-listen': {
    description: 'Play the clip, then pick what you heard. Reading the choices first is fine. The sound is the source.',
    icon: 'Headphones',
    color: cyan,
    tags: ['listen', 'choice']
  },
  'js-placement': {
    description: 'A short quiz about what you already expect JavaScript to do. Wrong answers do not lock you out. They only help sit you on the path.',
    icon: 'Compass',
    color: teal,
    tags: ['placement', 'javascript']
  },
  'values-and-typeof': {
    description: 'Every value has a kind. A number is not text, and true or false is not a number. Ask for the kind before you try to add, join, or list anything.',
    icon: 'Shapes',
    color: amber,
    tags: ['number', 'string', 'boolean']
  },
  'names-let-const': {
    description: 'A name is a box for a value. Some boxes you can refill. Some you can only fill once. Rebinding is not the same as changing a field inside a value.',
    icon: 'Tag',
    color: blue,
    tags: ['let', 'const', 'binding']
  },
  'strings-and-templates': {
    description: 'Text can be a plain string you write out, or a template that fills holes with values. Both are still text when you are done.',
    icon: 'Quote',
    color: pink,
    tags: ['string', 'template']
  },
  'numbers-and-nan': {
    description: 'Not every calculation is a real number. Divide in a way that has no meaning and the result is empty of number-ness. Learn to spot that, and do not treat it as zero.',
    icon: 'Hash',
    color: orange,
    tags: ['number', 'NaN', 'double']
  },
  'triple-equals': {
    description: 'Strict equality compares value and kind together. Loose equality will convert first and surprise you. Prefer the strict check unless you can name the conversion you want.',
    icon: 'Equal',
    color: teal,
    tags: ['equality', 'boolean', 'type']
  },
  'truth-and-if': {
    description: 'Some values act as no in a decision: empty text, zero, missing. An empty list is still a list, so it acts as yes. Know which values flip the branch.',
    icon: 'GitBranch',
    color: green,
    tags: ['if', 'boolean', 'truth']
  },
  'transfer-classify-signal': {
    description: 'Use kinds of values to label a signal in a new story. The names change. The question is the same: what kind is this, and what can I do with it.',
    icon: 'Tags',
    color: purple,
    tags: ['type', 'classify', 'signal']
  },
  'functions-call': {
    description: 'A call is a step. You name the function, you may pass values in, and the function runs. Nothing happens until you call it.',
    icon: 'Play',
    color: cyan,
    tags: ['function', 'call', 'parameters']
  },
  'beacon-call': {
    description: 'Walk the fox onto the beacon one cell at a time. Each call is one move. The path is the list of calls you chose.',
    icon: 'Navigation',
    color: orange,
    tags: ['function', 'call', 'grid']
  },
  'return-not-print': {
    description: 'Showing a value on the screen is not the same as handing it back to the caller. A function that only prints leaves the caller empty-handed.',
    icon: 'Reply',
    color: blue,
    tags: ['return', 'function', 'value']
  },
  'parameters-and-defaults': {
    description: 'A function can take values in through parameters. If a caller skips one, a default can fill the hole so the function still has something to use.',
    icon: 'SlidersHorizontal',
    color: amber,
    tags: ['parameters', 'default', 'function']
  },
  'loops-for': {
    description: 'A counted loop writes a path, one step per turn. You say how many times. The body runs that many times, then stops.',
    icon: 'Repeat',
    color: teal,
    tags: ['loop', 'count', 'array']
  },
  'loops-while-break': {
    description: 'Keep going while a condition is true. Stop when you have a reason, even if the count is not finished. An endless loop is a missing stop.',
    icon: 'Repeat',
    color: green,
    tags: ['loop', 'while', 'break']
  },
  'keyed-beacon': {
    description: 'Collect every token, then stand on the beacon facing the right way. Order and facing both matter. A finished walk with the wrong facing still fails.',
    icon: 'Key',
    color: amber,
    tags: ['loop', 'grid', 'collect']
  },
  'debug-off-by-one-path': {
    description: 'The walk is one cell short. That usually means the loop counted wrong, or the first or last step was skipped. Find the off-by-one and fix it.',
    icon: 'Bug',
    color: red,
    tags: ['debug', 'loop', 'index']
  },
  'arrays-index': {
    description: 'Length is how many items sit in the list. Index is the place of one item, starting at zero. The last item lives at length minus one.',
    icon: 'List',
    color: blue,
    tags: ['array', 'index', 'length']
  },
  'arrays-map': {
    description: 'Make a new list from an old one by changing each item. The original list stays put. Map is a transform, not an edit in place.',
    icon: 'ArrowLeftRight',
    color: purple,
    tags: ['array', 'map', 'list']
  },
  'arrays-filter-find': {
    description: 'Keep the items that match a check, or stop at the first one that does. Filter returns a list. Find returns one item or nothing.',
    icon: 'Filter',
    color: cyan,
    tags: ['array', 'filter', 'find']
  },
  'arrays-reduce-once': {
    description: 'Fold a list into one value: a sum, a record, a decision. Be able to say what the running result is after each item.',
    icon: 'Layers',
    color: orange,
    tags: ['array', 'reduce', 'value']
  },
  'objects-props': {
    description: 'A record holds named fields you can read and change. The name of the field is the key. The thing stored there is the value.',
    icon: 'Box',
    color: teal,
    tags: ['object', 'field', 'value']
  },
  'reference-vs-copy': {
    description: 'Two names can point at the same object. Change it through one name and the other sees it. A copy is a new object with the same shape.',
    icon: 'Copy',
    color: amber,
    tags: ['reference', 'copy', 'object']
  },
  'destructure-spread': {
    description: 'Pull fields out of a record into their own names, or copy those fields into a new record. Spread makes the copy. Destructure makes the names.',
    icon: 'Braces',
    color: pink,
    tags: ['object', 'spread', 'fields']
  },
  'json-roundtrip': {
    description: 'Turn a record into text and back again without losing the shape. If a field disappears, the text did not hold that kind of value.',
    icon: 'FileJson',
    color: green,
    tags: ['json', 'object', 'string']
  },
  'signal-log': {
    description: 'Build a small log of signals you can keep. Each entry is a record. The list of entries is the log you will grow in later lessons.',
    icon: 'ScrollText',
    color: blue,
    tags: ['array', 'object', 'log']
  },
  'scope-and-tdz': {
    description: 'A name is only alive in its block. Using it before the line that creates it is a fault, even if the name appears later in the same function.',
    icon: 'Lock',
    color: orange,
    tags: ['scope', 'let', 'binding']
  },
  'closures-radio': {
    description: 'A function can remember values from the place it was created, even after that place has finished. That memory is a closure, not a global.',
    icon: 'Radio',
    color: purple,
    tags: ['closure', 'function', 'scope']
  },
  'callbacks-as-commands': {
    description: 'A table of functions is a set of commands. Look up a name, call what you find, and the walk changes without a long chain of branches.',
    icon: 'Command',
    color: cyan,
    tags: ['function', 'callback', 'table']
  },
  'arrow-vs-function': {
    description: 'Two ways to write a function. They look close, but they are not the same about the special value this. Pick one on purpose.',
    icon: 'ArrowRight',
    color: teal,
    tags: ['function', 'arrow', 'this']
  },
  'higher-order-route': {
    description: 'Pass a function into another function so the walk can change. The outer function decides when to call. The inner function decides what the step is.',
    icon: 'GitMerge',
    color: blue,
    tags: ['function', 'callback', 'parameters']
  },
  'stale-closure-debug': {
    description: 'The last direction keeps winning. An old value got stuck in a function that closed over it too early. Find the stale memory and recapture the current one.',
    icon: 'Bug',
    color: red,
    tags: ['debug', 'closure', 'this']
  },
  'transfer-command-table': {
    description: 'Build a new maze from a table of commands. Each name maps to a step. Filling the table is how you write the walk without a giant branch.',
    icon: 'Table2',
    color: amber,
    tags: ['function', 'table', 'grid']
  },
  'throw-and-catch': {
    description: 'Throw a problem when the walk cannot continue. Catch it so the program does not die, then decide whether to recover or stop.',
    icon: 'Shield',
    color: orange,
    tags: ['throw', 'catch', 'error']
  },
  'finally-and-rethrow': {
    description: 'Some work must run after a try, even when you throw again. Finally is that cleanup. Rethrow keeps the original problem moving up.',
    icon: 'RotateCcw',
    color: purple,
    tags: ['finally', 'throw', 'cleanup']
  },
  'custom-errors': {
    description: 'Make your own error type so the catch can tell stories apart. A missing file and a bad password should not look like the same failure.',
    icon: 'BadgeAlert',
    color: red,
    tags: ['error', 'type', 'catch']
  },
  'debug-read-the-stack': {
    description: 'The stack is the list of calls that were still open when it failed. Read from the top to see which call broke, then walk down to see who asked for it.',
    icon: 'Layers',
    color: amber,
    tags: ['debug', 'stack', 'call']
  },
  'coercion-to-primitive': {
    description: 'An object can be asked to become a simple value. Know whether it answers with text, a number, or something unhelpful, because the asker will use that answer.',
    icon: 'Shuffle',
    color: pink,
    tags: ['object', 'number', 'string']
  },
  'prototypes-chain': {
    description: 'A missing field is looked up on the object behind this one, then the one behind that. The chain ends when nothing is left to ask.',
    icon: 'Link',
    color: teal,
    tags: ['prototype', 'object', 'field']
  },
  'new-and-create': {
    description: 'Two ways to make an object that shares a prototype. One looks like a constructor call. The other builds from a chosen parent. The sharing story is the same.',
    icon: 'Sparkles',
    color: cyan,
    tags: ['object', 'prototype', 'new']
  },
  'classes-syntax': {
    description: 'Class syntax is sugar over the same prototype story. Methods still live on the shared parent. Instances still hold their own fields.',
    icon: 'Component',
    color: blue,
    tags: ['class', 'prototype', 'this']
  },
  'this-call-apply-bind': {
    description: 'This is who the function is talking about, not where it was written. Call, apply, and bind let you set that who on purpose.',
    icon: 'User',
    color: green,
    tags: ['this', 'function', 'bind']
  },
  'descriptors-get-set': {
    description: 'A field can run code when you read it or write it. The name still looks like a field. The work behind it is a function pair.',
    icon: 'Settings2',
    color: amber,
    tags: ['get', 'set', 'object']
  },
  'symbols': {
    description: 'A symbol is a unique key that will not clash with ordinary names. Two symbols with the same description are still different keys.',
    icon: 'KeyRound',
    color: purple,
    tags: ['symbol', 'key', 'object']
  },
  'weak-collections': {
    description: 'A weak collection holds notes that do not keep an object alive. When nothing else points at the object, the note can disappear with it.',
    icon: 'Ghost',
    color: blue,
    tags: ['weak', 'object', 'memory']
  },
  'iterators-for-of': {
    description: 'A custom list can hand out the next item when asked. A for-of loop is the polite way to walk that list until it says it is done.',
    icon: 'List',
    color: teal,
    tags: ['iterator', 'loop', 'array']
  },
  'generators': {
    description: 'A generator is a function that yields the next step when you ask, then pauses. Call it again and it continues from that pause, not from the start.',
    icon: 'Play',
    color: orange,
    tags: ['generator', 'yield', 'function']
  },
  'proxies-reflect': {
    description: 'A proxy intercepts one read or write and decides what it means. Reflect is the polite way to forward the same act to the real object.',
    icon: 'Scan',
    color: cyan,
    tags: ['proxy', 'object', 'get']
  },
  'transfer-model-a-part': {
    description: 'Model a part as an object with fields, a prototype, and the same lookup rules you just learned. The story changed. The object rules did not.',
    icon: 'Boxes',
    color: green,
    tags: ['object', 'prototype', 'model']
  },
  'stack-vs-heap': {
    description: 'Calls sit on a stack that grows and shrinks. Objects live on the heap until nothing points at them. Mixing the two stories is how leaks and crashes get explained badly.',
    icon: 'Layers',
    color: amber,
    tags: ['stack', 'heap', 'memory']
  },
  'macrotasks-timeout': {
    description: 'A timeout waits until the current work is done, then it runs. It is not a pause inside the function. It is a note for later, after this turn finishes.',
    icon: 'Clock',
    color: orange,
    tags: ['timeout', 'event loop', 'async']
  },
  'microtasks-then': {
    description: 'A then callback runs before the next timeout. Microtasks and timeouts are different trays. Draining one is not the same as waiting for the other.',
    icon: 'Timer',
    color: purple,
    tags: ['promise', 'microtask', 'then']
  },
  'promises-states': {
    description: 'A promise is pending, kept, or broken. Once it settles, it does not change again. Later thens still see that same settled result.',
    icon: 'CircleDashed',
    color: teal,
    tags: ['promise', 'async', 'state']
  },
  'async-await': {
    description: 'Await pauses this function until a promise settles, then continues with the value. The rest of the program is not frozen. Only this function waits.',
    icon: 'Hourglass',
    color: cyan,
    tags: ['async', 'await', 'promise']
  },
  'async-errors': {
    description: 'A rejected await belongs in try and catch, like a throw. If you skip the catch, the failure becomes an unhandled rejection.',
    icon: 'ShieldAlert',
    color: red,
    tags: ['async', 'catch', 'error']
  },
  'parallel-vs-sequence': {
    description: 'Wait for many promises together when the work does not depend on order. Wait one after another when the next step needs the last result.',
    icon: 'GitMerge',
    color: blue,
    tags: ['promise', 'parallel', 'async']
  },
  'async-iterators': {
    description: 'Walk a stream of steps as each one arrives. You do not have the whole list up front. You ask for the next item and wait until it is there.',
    icon: 'Waves',
    color: pink,
    tags: ['async', 'iterator', 'stream']
  },
  'transfer-beacon-dispatch': {
    description: 'Time a walk on the grid using waits you just learned. Some steps are ready now. Some steps must wait. The path is still a sequence of calls.',
    icon: 'Send',
    color: amber,
    tags: ['async', 'grid', 'promise']
  },
  'debug-forgotten-await': {
    description: 'The walk finishes too soon because a wait was never asked for. The promise was created. Nobody paused for it. Find the missing wait.',
    icon: 'Bug',
    color: red,
    tags: ['debug', 'await', 'promise']
  },
  'tree-not-string': {
    description: 'The page is a tree of nodes, not a pile of text. Each node has a parent, children, and a kind. Markup is only how we write that tree down.',
    icon: 'Network',
    color: green,
    tags: ['dom', 'tree', 'node']
  },
  'query-and-update': {
    description: 'Find a node in the tree, then change the text it shows. If you query the wrong node, the right words appear in the wrong place.',
    icon: 'Search',
    color: teal,
    tags: ['dom', 'query', 'text']
  },
  'create-and-remove': {
    description: 'Make a node, put it in the tree, or take it out. A node that is not attached is invisible. Removing it does not have to destroy the object first.',
    icon: 'Plus',
    color: blue,
    tags: ['dom', 'create', 'remove']
  },
  'events-bubble': {
    description: 'A click starts on the target and rises through the parents unless you stop it. The parent can hear a click that happened on a child.',
    icon: 'Waves',
    color: cyan,
    tags: ['event', 'bubble', 'dom']
  },
  'delegation': {
    description: 'One listener on a parent can handle many children. You listen high, then ask which child was the target. New children are covered for free.',
    icon: 'Users',
    color: purple,
    tags: ['event', 'delegate', 'dom']
  },
  'forms-and-input': {
    description: 'Read what the learner typed as they type it. The field holds a string. Your job is to notice the change and use that string.',
    icon: 'TextCursorInput',
    color: amber,
    tags: ['input', 'string', 'event']
  },
  'a11y-name-and-role': {
    description: 'A control needs a name and a role a screen reader can use. A pretty button with no name is silent. The visible label should be that name.',
    icon: 'Accessibility',
    color: green,
    tags: ['a11y', 'name', 'role']
  },
  'xss-text-vs-html': {
    description: 'Put plain words in as text. Do not feed learner input as markup. Markup is a program. Text is only characters.',
    icon: 'ShieldOff',
    color: red,
    tags: ['xss', 'text', 'html']
  },
  'transfer-filter-list-ui': {
    description: 'Filter a list on a real page using the same tree ideas. Query the field, read the string, and show only the rows that match.',
    icon: 'Filter',
    color: blue,
    tags: ['dom', 'filter', 'list']
  },
  'creation-signal-board': {
    description: 'Keep a signal board on the page. Add rows, change them, and take the board with you to the next lesson.',
    icon: 'LayoutDashboard',
    color: teal,
    tags: ['dom', 'keep', 'list']
  },
  'http-as-messages': {
    description: 'A request and a response are messages, not magic. You send one. You get one back. The network is a conversation with a delay.',
    icon: 'Mail',
    color: orange,
    tags: ['http', 'request', 'response']
  },
  'fetch-ok-and-fail': {
    description: 'A missing page is still a response. The server answered. Only a broken network throws. Check the ok flag before you trust the body.',
    icon: 'Globe',
    color: cyan,
    tags: ['fetch', 'http', 'error']
  },
  'json-body': {
    description: 'Reading a body as data can fail if the text is not a record. Handle the bad text. Do not assume every response is a clean object.',
    icon: 'FileJson',
    color: amber,
    tags: ['json', 'fetch', 'object']
  },
  'abort-and-timeout': {
    description: 'Cancel a request on purpose when you have waited long enough. An abandoned request still uses the network until you abort it.',
    icon: 'CircleStop',
    color: red,
    tags: ['abort', 'timeout', 'fetch']
  },
  'cors-mental-model': {
    description: 'The browser decides whether page code may read another origin. The server can allow it. Your code cannot override a no.',
    icon: 'Ban',
    color: orange,
    tags: ['cors', 'origin', 'http']
  },
  'transfer-library-search': {
    description: 'Search a fixture of records the way a library search would. Send a query, read the list that comes back, and show the matches.',
    icon: 'Library',
    color: purple,
    tags: ['fetch', 'array', 'search']
  },
  'process-argv-env': {
    description: 'A program can read the words you typed after its name, and the environment around it. Those values are strings until you turn them into numbers.',
    icon: 'Terminal',
    color: green,
    tags: ['argv', 'env', 'string']
  },
  'fs-read-write': {
    description: 'Read a text file from disk, change it, and write it back. The file is bytes on disk. Your program sees a string after it is decoded.',
    icon: 'HardDrive',
    color: blue,
    tags: ['file', 'read', 'write']
  },
  'paths-and-encoding': {
    description: 'Join path parts safely. Do not walk above the folder you meant. Encoding is how bytes become text. The wrong encoding makes garbage, not a crash.',
    icon: 'FolderTree',
    color: teal,
    tags: ['path', 'encoding', 'file']
  },
  'buffers-vs-strings': {
    description: 'Bytes are not the same as text. A buffer is the raw bytes. A string is decoded text. Decode on purpose, or you will slice a character in half.',
    icon: 'Binary',
    color: amber,
    tags: ['buffer', 'string', 'bytes']
  },
  'streams-idea': {
    description: 'Read a log in chunks instead of all at once. A stream hands you the next piece when it is ready. You do not hold the whole file in memory.',
    icon: 'Waves',
    color: cyan,
    tags: ['stream', 'file', 'chunk']
  },
  'cjs-vs-esm-node': {
    description: 'Two module styles live in Node. One uses require. One uses import. Know which file is which, because mixing them without a bridge fails.',
    icon: 'Package',
    color: purple,
    tags: ['module', 'import', 'require']
  },
  'error-first-and-promises': {
    description: 'Older file calls pass an error first, then the result. Newer ones return a promise. Both mean the same thing: check failure before you use the value.',
    icon: 'FileWarning',
    color: orange,
    tags: ['error', 'promise', 'callback']
  },
  'transfer-clean-a-log': {
    description: 'Clean a names log using files and the process. Read the file, drop the bad lines, write a cleaner file, and say what you changed.',
    icon: 'Eraser',
    color: pink,
    tags: ['file', 'string', 'filter']
  },
  'creation-log-scrubber': {
    description: 'Keep a log scrubber you can run again. Point it at a file, get a cleaned file back, and take that tool with you.',
    icon: 'Sparkles',
    color: teal,
    tags: ['file', 'keep', 'filter']
  },
  'assert-and-aaa': {
    description: 'Arrange the world, act, then assert what must be true. An assertion is a claim the test will fail if it is false. One claim per test is easier to read.',
    icon: 'CheckSquare',
    color: green,
    tags: ['assert', 'test', 'boolean']
  },
  'fixtures-and-hidden-tests': {
    description: 'Hidden tests use fixtures you do not see. Your file is the thing they call. If you hard-code the sample, the hidden case will fail.',
    icon: 'Boxes',
    color: blue,
    tags: ['fixture', 'test', 'function']
  },
  'mocking-time-and-fs': {
    description: 'Fake the clock and the disk so a test does not wait or write for real. The fake must still look like the real thing to the code under test.',
    icon: 'Watch',
    color: amber,
    tags: ['mock', 'time', 'file']
  },
  'why-bundlers': {
    description: 'A bundler packs modules for the page so the browser can load one file instead of a tree of imports. Know why that step exists before you fight it.',
    icon: 'Package',
    color: cyan,
    tags: ['bundler', 'module', 'import']
  },
  'modules-esm-files': {
    description: 'Export a walker from one file and import it in another. The export is the public surface. Everything else in the file stays private.',
    icon: 'FileInput',
    color: teal,
    tags: ['export', 'import', 'module']
  },
  'ast-and-lint': {
    description: 'A linter reads the shape of the code, not only the text. It walks a tree of nodes. That is why it can catch a missing name you never ran.',
    icon: 'ScanSearch',
    color: purple,
    tags: ['ast', 'lint', 'tree']
  },
  'proto-pollution': {
    description: 'Do not let outside data write into the shared object behind every record. One bad key can change how every later object behaves.',
    icon: 'Skull',
    color: red,
    tags: ['prototype', 'security', 'object']
  },
  'measure-then-change': {
    description: 'Measure first. Change one thing. Measure again. A faster feeling is not a measurement. The number before and after is the lesson.',
    icon: 'Ruler',
    color: orange,
    tags: ['measure', 'change', 'number']
  },
  'jsdoc-contracts': {
    description: 'A short comment can be a checklist of what a function owes: the parameters it takes, the value it returns, and what it must not do.',
    icon: 'FileCheck',
    color: green,
    tags: ['jsdoc', 'function', 'parameters']
  },
  'transfer-test-the-fox': {
    description: 'Write tests for a walk so a later change cannot silently break it. If the fox should end on the beacon, assert that. Do not watch it by eye.',
    icon: 'TestTube',
    color: blue,
    tags: ['test', 'assert', 'grid']
  },
  'capstone-signal-ops': {
    description: 'Put the path together. Walk the grid, keep records, show them on the page, and test the parts you cannot afford to break.',
    icon: 'Flag',
    color: amber,
    tags: ['capstone', 'array', 'function']
  }
}

export function lessonCard(id: string): LessonCardCopy | undefined {
  return LESSON_CARDS[id]
}

export function lessonCardDescription(id: string, fallback = ''): string {
  return LESSON_CARDS[id]?.description ?? fallback
}
