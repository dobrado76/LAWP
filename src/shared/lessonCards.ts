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
  | 'Cpu'
  | 'Crosshair'
  | 'Equal'
  | 'Eraser'
  | 'FileCheck'
  | 'FileCode'
  | 'FileInput'
  | 'FileJson'
  | 'FileWarning'
  | 'Filter'
  | 'Fingerprint'
  | 'Flag'
  | 'FolderSearch'
  | 'FolderTree'
  | 'Footprints'
  | 'Gauge'
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
  | 'Infinity'
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
  | 'LogOut'
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
  | 'Scissors'
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
  | 'SkipForward'
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
  | 'Workflow'
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
  'circuits-placement': {
    description: 'Ten short questions mark which later lessons to take slowly. Wrong answers do not lock you out.',
    icon: 'HelpCircle',
    color: amber,
    tags: ['place', 'check', 'start']
  },
  'what-is-charge': {
    description: 'Charge is a property of bits of matter, not a juice that sits in the wire. Opposite charges pull; a battery holds them apart.',
    icon: 'Zap',
    color: amber,
    tags: ['charge', 'plus', 'minus']
  },
  'current-is-flow': {
    description: 'Current is charge moving around a closed path. On one path the flow is the same everywhere. The lamp does not eat it.',
    icon: 'Waves',
    color: cyan,
    tags: ['current', 'flow', 'loop']
  },
  'what-is-a-loop': {
    description: 'A lamp lights only when the path from the supply and back again is closed. Open that path and the lamp goes dark, even if every part is still on the table.',
    icon: 'CircuitBoard',
    color: amber,
    tags: ['loop', 'lamp', 'path']
  },
  'open-means-dark': {
    description: 'One break anywhere on a series loop stops the flow. The lamp goes dark even if every part is still on the table.',
    icon: 'Ban',
    color: red,
    tags: ['open', 'gap', 'lamp']
  },
  'diagnose-dead-lamp': {
    description: 'A dark lamp is a detective story. Predict why it is dark, then close the gap and watch the loop come back.',
    icon: 'Scan',
    color: orange,
    tags: ['diagnose', 'gap', 'lamp']
  },
  'voltage-is-a-difference': {
    description: 'Voltage is a push between two points, not a stuff that sits in the wire. You measure it across, not through.',
    icon: 'SlidersHorizontal',
    color: blue,
    tags: ['voltage', 'difference', 'push']
  },
  'battery-as-push': {
    description: 'Cells add push when you stack them in series. More cells can raise current. They do not ignore resistance or the cap.',
    icon: 'Zap',
    color: amber,
    tags: ['battery', 'cells', 'push']
  },
  'resistance-as-squeeze': {
    description: 'Resistance squeezes the path. More ohms means less current. Zero ohms is not a super lamp. It is a short.',
    icon: 'SlidersHorizontal',
    color: orange,
    tags: ['resistance', 'ohms', 'squeeze']
  },
  'ohms-law': {
    description: 'V = I R ties push, flow, and squeeze together. Change one and the others must move.',
    icon: 'Ruler',
    color: teal,
    tags: ['ohm', 'voltage', 'current']
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
  'series-same-current': {
    description: 'In series there is one path. The current is the same through every part. The voltages add up to the battery.',
    icon: 'Link',
    color: teal,
    tags: ['series', 'current', 'share']
  },
  'parallel-split': {
    description: 'In parallel the branches share the battery voltage. Currents split. One dark lamp does not kill the other.',
    icon: 'GitBranch',
    color: blue,
    tags: ['parallel', 'split', 'voltage']
  },
  'series-vs-parallel': {
    description: 'Same parts, different wiring. Series keeps current the same. Parallel keeps voltage the same. Do not swap the rules.',
    icon: 'GitMerge',
    color: purple,
    tags: ['series', 'parallel', 'compare']
  },
  'power-and-heat': {
    description: 'Power is how fast energy is spent. A bright lamp and a hot wire can spend the same energy in different ways.',
    icon: 'Lightbulb',
    color: orange,
    tags: ['power', 'heat', 'brightness']
  },
  'open-vs-short': {
    description: 'An open path is dark and usually safe. A short is an easy extra path: huge current, heat, and often a dark lamp.',
    icon: 'BadgeAlert',
    color: red,
    tags: ['open', 'short', 'path']
  },
  'why-a-short-hurts': {
    description: 'A short is an easy extra path. Current and heat soar. That is not a brighter circuit you get to keep.',
    icon: 'Skull',
    color: red,
    tags: ['short', 'heat', 'danger']
  },
  'transfer-fuse': {
    description: 'The same current idea shows up in a fuse story. If the flow climbs too high, the fuse opens the path so the rest of the circuit survives.',
    icon: 'Zap',
    color: red,
    tags: ['fuse', 'current', 'protect']
  },
  'switches-break': {
    description: 'A switch is a gap you can open and close. It is not a dimmer. Closed lights. Open is dark.',
    icon: 'ToggleLeft',
    color: cyan,
    tags: ['switch', 'break', 'loop']
  },
  'what-meters-do': {
    description: 'An ammeter sits in the path and reads current. A voltmeter sits across two points and reads a difference.',
    icon: 'Watch',
    color: blue,
    tags: ['meter', 'voltage', 'current']
  },
  'series-parallel-mix': {
    description: 'A real desk mixes series and parallel. Light both lamps brightly by choosing the split, not the single hallway.',
    icon: 'Puzzle',
    color: purple,
    tags: ['mix', 'transfer', 'lamps']
  },
  'keep-your-circuit': {
    description: 'Keep the circuit you built. You can come back to it later instead of starting from an empty bench.',
    icon: 'Package',
    color: teal,
    tags: ['keep', 'circuit']
  },
  'py-placement': {
    description: 'A short set of questions marks which later lessons to take slowly. Wrong answers do not lock you out.',
    icon: 'Compass',
    color: teal,
    tags: ['placement', 'python', 'start']
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
    color: blue,
    tags: ['int', 'bool', 'string']
  },
  'numbers-int-float': {
    description: 'An int and a float are different kinds of number. Dividing with a slash gives a float even when the answer looks whole.',
    icon: 'Hash',
    color: blue,
    tags: ['int', 'float', 'division']
  },
  'say-it-once': {
    description: 'Write the message once, give it a name, and reuse it. Repeating the same line in three places is how small programs go stale.',
    icon: 'MessageSquare',
    color: blue,
    tags: ['string', 'reuse', 'name']
  },
  'truthiness-and-none': {
    description: 'None means there is nothing here yet, and empty text or an empty list is falsy without being None. Telling the three apart stops a check from lying to you.',
    icon: 'CircleDashed',
    color: blue,
    tags: ['none', 'truthiness', 'bool']
  },
  'compare-is-not-assign': {
    description: 'Asking whether two things are equal is a yes or no. Giving a name a value is a different act. Mixing them up is the classic beginner fault.',
    icon: 'Equal',
    color: blue,
    tags: ['equality', 'assign', 'bool']
  },
  'equality-vs-identity': {
    description: 'Double equals asks whether two values are equal. The is keyword asks whether they are the same object, and small numbers make that difference hard to see.',
    icon: 'Fingerprint',
    color: blue,
    tags: ['equality', 'identity', 'is']
  },
  'boolean-logic': {
    description: 'And, or, and not build a bigger question out of small ones. Python stops as soon as the answer is settled and hands back one of the operands, not always True or False.',
    icon: 'GitMerge',
    color: blue,
    tags: ['and', 'or', 'not']
  },
  'transfer-classify-value': {
    description: 'Label unfamiliar station readings by kind. Same rules as before, new data, and no worked example to copy.',
    icon: 'Tags',
    color: blue,
    tags: ['type', 'classify', 'transfer']
  },
  'if-this-then-that': {
    description: 'A decision looks at a check. When the check is true, one path runs. When it is false, the other path runs, or nothing does.',
    icon: 'GitBranch',
    color: green,
    tags: ['if', 'bool', 'branch']
  },
  'compare-chaining': {
    description: 'Python reads a chained comparison the way maths does, so a low to high range fits in one check. Writing it twice with and is not the same thing.',
    icon: 'Ruler',
    color: green,
    tags: ['compare', 'range', 'if']
  },
  'walk-the-fox': {
    description: 'A call is one step. Name the walk and the fox moves one cell. Repeat the call to go farther.',
    icon: 'Footprints',
    color: green,
    tags: ['function', 'call', 'grid']
  },
  'for-over-range': {
    description: 'A counted loop gets its numbers from range. It starts at zero and stops before the end value, which is the off-by-one that bites first.',
    icon: 'Repeat',
    color: green,
    tags: ['for', 'range', 'loop']
  },
  'while-and-break': {
    description: 'A while loop runs until its check goes false, or until break gets you out early. If nothing in the body changes the check, the loop never ends.',
    icon: 'CircleStop',
    color: green,
    tags: ['while', 'break', 'loop']
  },
  'loop-else-and-continue': {
    description: 'Continue skips the rest of one turn. The loop else runs only when the loop finished without a break, which makes it the not-found branch.',
    icon: 'SkipForward',
    color: green,
    tags: ['continue', 'else', 'loop']
  },
  'nested-loops-grid': {
    description: 'Two loops sweep the grid, rows on the outside and columns on the inside. Swapping which loop is outer changes the path the fox walks.',
    icon: 'LayoutGrid',
    color: green,
    tags: ['nested', 'grid', 'loop']
  },
  'debug-off-by-one': {
    description: 'The walk ends one cell short. Read the range bounds instead of guessing, then fix the boundary rather than bolting on an extra step.',
    icon: 'Bug',
    color: green,
    tags: ['debug', 'loop', 'index']
  },
  'transfer-patrol-route': {
    description: 'Write the route as a loop instead of a list of moves. New map, the same counting rules, and no worked example.',
    icon: 'Navigation',
    color: green,
    tags: ['loop', 'grid', 'transfer']
  },
  'def-and-return': {
    description: 'Def names a block you can call again, and return hands a value back to the caller. Printing shows a value and gives the caller nothing.',
    icon: 'Reply',
    color: amber,
    tags: ['def', 'return', 'function']
  },
  'parameters-defaults': {
    description: 'Parameters are the values a call has to supply, and a default covers the ones it leaves out. One function can then serve the short call and the long one.',
    icon: 'SlidersHorizontal',
    color: amber,
    tags: ['parameters', 'default', 'function']
  },
  'keyword-args': {
    description: 'Passing an argument by name makes a long call readable and lets you skip a middle default. Order still matters for the positional ones in front.',
    icon: 'Tag',
    color: amber,
    tags: ['keyword', 'call', 'function']
  },
  'mutable-default-trap': {
    description: 'A mutable default is built once when the function is defined, so it remembers what the last call put in it. Use None and build the list inside.',
    icon: 'BadgeAlert',
    color: amber,
    tags: ['default', 'list', 'trap']
  },
  'args-and-kwargs': {
    description: 'Star args collects the extra positional values into a tuple, and double star kwargs collects the named ones into a dict. Reach for them when the count is genuinely unknown.',
    icon: 'Boxes',
    color: amber,
    tags: ['args', 'kwargs', 'function']
  },
  'scope-and-global': {
    description: 'Assigning inside a function makes a local name, even when an outer name is spelled the same. Global says you meant the module-level one, and it is rarely the answer.',
    icon: 'Lock',
    color: amber,
    tags: ['scope', 'global', 'name']
  },
  'closures-and-nonlocal': {
    description: 'A function made inside another one keeps a live link to the enclosing name. Nonlocal lets it rebind that name instead of quietly shadowing it.',
    icon: 'Radio',
    color: amber,
    tags: ['closure', 'nonlocal', 'scope']
  },
  'lambda-and-key': {
    description: 'A lambda is a small function written where it is used, most often as the key that tells sorted what to compare.',
    icon: 'ArrowRight',
    color: amber,
    tags: ['lambda', 'key', 'sort']
  },
  'greeting-bot': {
    description: 'Build a small greeting you can keep. The bot should use a name and a message you can run again tomorrow.',
    icon: 'Bot',
    color: amber,
    tags: ['function', 'string', 'keep']
  },
  'lists-index-slice': {
    description: 'An index picks one item and counts from zero. A slice copies a run, stops before its end, and does not raise when it runs past the last item.',
    icon: 'List',
    color: purple,
    tags: ['list', 'index', 'slice']
  },
  'list-mutation-vs-copy': {
    description: 'Two names can point at one list, so appending through either changes what both see. A slice or a call to list makes the separate copy you probably meant.',
    icon: 'Copy',
    color: purple,
    tags: ['list', 'copy', 'alias']
  },
  'tuples-and-unpacking': {
    description: 'A tuple is a small fixed group you cannot edit in place, which makes it safe to hand around. Unpacking splits one into named parts in a single line.',
    icon: 'Braces',
    color: purple,
    tags: ['tuple', 'unpack', 'immutable']
  },
  'sorting-with-key': {
    description: 'Sorted returns a new list and list.sort returns None. A key function says which part of each item decides the order.',
    icon: 'ListOrdered',
    color: purple,
    tags: ['sort', 'key', 'list']
  },
  'dicts-keys': {
    description: 'A dict looks a value up by key instead of by position, which is how the station log becomes something you can question. Keys have to be hashable, and each one appears once.',
    icon: 'KeyRound',
    color: purple,
    tags: ['dict', 'key', 'value']
  },
  'dict-get-and-setdefault': {
    description: 'Reading a missing key raises an error rather than returning None. Get hands back a fallback, and setdefault stores one on the way past.',
    icon: 'HelpCircle',
    color: purple,
    tags: ['dict', 'get', 'default']
  },
  'sets-and-dedupe': {
    description: 'A set answers membership quickly and drops duplicates for free. It keeps no order, so do not reach for one when the sequence matters.',
    icon: 'Circle',
    color: purple,
    tags: ['set', 'unique', 'dedupe']
  },
  'counting-with-counter': {
    description: 'Counter is a dict that starts every key at zero, so tallying readings is one pass with no missing-key checks.',
    icon: 'Hash',
    color: purple,
    tags: ['counter', 'count', 'dict']
  },
  'comprehensions-list': {
    description: 'A comprehension is the loop that builds a list, written as one expression. The if at the end filters items out, it does not choose the value.',
    icon: 'Filter',
    color: purple,
    tags: ['comprehension', 'list', 'filter']
  },
  'comprehensions-dict-set': {
    description: 'Change the brackets and the same comprehension builds a dict or a set. Watch what a repeated key does to the result.',
    icon: 'Shapes',
    color: purple,
    tags: ['comprehension', 'dict', 'set']
  },
  'zip-and-enumerate': {
    description: 'Zip pairs two sequences and stops at the shorter one. Enumerate hands you the index with the item so you can stop counting by hand.',
    icon: 'ArrowLeftRight',
    color: purple,
    tags: ['zip', 'enumerate', 'loop']
  },
  'nested-data-gradebook': {
    description: 'Real station data is dicts of lists of dicts. Naming each level as you go down is the difference between reading it and guessing.',
    icon: 'Table2',
    color: purple,
    tags: ['nested', 'dict', 'list']
  },
  'transfer-group-records': {
    description: 'Turn a flat list of records into groups you can total. New data, the same dict and loop rules, and no worked example.',
    icon: 'Inbox',
    color: purple,
    tags: ['dict', 'group', 'transfer']
  },
  'read-the-traceback': {
    description: 'A traceback is the path of calls that led to the failure. The bottom line names what went wrong, and the frame just above it is usually your code.',
    icon: 'ScrollText',
    color: red,
    tags: ['traceback', 'debug', 'error']
  },
  'try-except-specific': {
    description: 'A bare except hides typos and interrupts along with the failure you planned for. Name the exception class so the ones you did not expect still get through.',
    icon: 'Shield',
    color: red,
    tags: ['try', 'except', 'error']
  },
  'else-and-finally': {
    description: 'The else block holds the work that only makes sense when the try succeeded. Finally runs either way, which is where cleanup belongs.',
    icon: 'RotateCcw',
    color: red,
    tags: ['finally', 'else', 'cleanup']
  },
  'raise-and-custom-error': {
    description: 'Raise reports a problem the caller has to deal with. Your own exception class lets a later except tell a bad reading from a missing file.',
    icon: 'BadgeAlert',
    color: red,
    tags: ['raise', 'error', 'class']
  },
  'eafp-vs-lbyl': {
    description: 'You can check first, or you can try and handle the failure. A check can go stale between asking and acting, which is why Python often prefers the try.',
    icon: 'HelpCircle',
    color: red,
    tags: ['try', 'check', 'style']
  },
  'debug-swallowed-error': {
    description: 'A too-wide except is hiding the real failure and reporting success. Narrow it until the problem comes back, then fix the problem.',
    icon: 'Bug',
    color: red,
    tags: ['debug', 'except', 'error']
  },
  'transfer-safe-parse': {
    description: 'Turn untrusted station lines into values, and decide what a bad line should do. New input, the same error rules, and no worked example.',
    icon: 'FileWarning',
    color: red,
    tags: ['parse', 'error', 'transfer']
  },
  'string-methods-clean': {
    description: 'Strip, lower, and replace hand back new text and leave the original alone. Chaining them is how a hand-typed log entry becomes comparable.',
    icon: 'Eraser',
    color: pink,
    tags: ['string', 'strip', 'clean']
  },
  'split-and-join': {
    description: 'Split turns one line into a list of fields, and join turns a list back into one line. They only undo each other if you pick the same separator.',
    icon: 'Scissors',
    color: pink,
    tags: ['split', 'join', 'string']
  },
  'slicing-text': {
    description: 'Text slices the way a list does: start included, stop excluded, and a step that can run backwards. A slice past the end stays quiet.',
    icon: 'Highlighter',
    color: pink,
    tags: ['slice', 'string', 'index']
  },
  'fstring-formatting': {
    description: 'An f-string drops a value into a sentence and can round, pad, and align it in place. That is how a report lines up in columns without hand-counted spaces.',
    icon: 'Quote',
    color: pink,
    tags: ['f-string', 'format', 'string']
  },
  'regex-search': {
    description: 'A pattern describes a shape of text, so you can find every timestamp without listing them. Search looks anywhere in the line, match only at the start.',
    icon: 'Search',
    color: pink,
    tags: ['regex', 'search', 'text']
  },
  'regex-groups-and-sub': {
    description: 'Groups mark the parts of a match you want to keep, and sub rewrites every match at once. A greedy pattern takes more than you meant.',
    icon: 'ScanSearch',
    color: pink,
    tags: ['regex', 'group', 'sub']
  },
  'encoding-bytes-vs-str': {
    description: 'A file holds bytes, and text appears only when you decode with the right encoding. Guessing gets you scrambled characters or a decode error.',
    icon: 'Binary',
    color: pink,
    tags: ['bytes', 'encoding', 'utf-8']
  },
  'open-and-with': {
    description: 'Open hands back a file you are responsible for closing, and with closes it on the way out. A file left open can hold writes in a buffer that never land.',
    icon: 'FileInput',
    color: cyan,
    tags: ['open', 'with', 'file']
  },
  'read-lines-without-slurping': {
    description: 'Looping over a file hands you one line at a time, so a log bigger than memory still works. Reading it whole is the version that has to fit.',
    icon: 'Waves',
    color: cyan,
    tags: ['file', 'lines', 'loop']
  },
  'write-text-safely': {
    description: 'Opening for write empties the file before you type a thing, and append keeps what was there. Writing to a temporary name first is how you avoid half a report.',
    icon: 'Pencil',
    color: cyan,
    tags: ['write', 'file', 'append']
  },
  'pathlib-paths': {
    description: 'A path object joins with a slash operator that works on Windows too, and it knows the parent, the suffix, and whether the file is there. Gluing strings is how you end up above the folder you meant.',
    icon: 'FolderTree',
    color: cyan,
    tags: ['path', 'pathlib', 'file']
  },
  'csv-rows': {
    description: 'The csv module handles the quoting and the commas inside fields that a plain split would ruin. Its dict reader gives each row named fields instead of positions.',
    icon: 'Table2',
    color: cyan,
    tags: ['csv', 'rows', 'file']
  },
  'dirs-and-globs': {
    description: 'Glob matches file names by pattern, and its recursive form walks down into every subfolder. Sort the results when you want the same order twice.',
    icon: 'FolderSearch',
    color: cyan,
    tags: ['glob', 'folder', 'file']
  },
  'argv-and-env': {
    description: 'The argument list is what the command line handed you, and the environment is the settings around the run. Both are text, and both can be missing.',
    icon: 'Terminal',
    color: orange,
    tags: ['argv', 'env', 'process']
  },
  'exit-codes-and-stderr': {
    description: 'Zero means it worked and anything else means it did not, which is how another program can tell. Errors belong on the error stream so the report stays clean.',
    icon: 'LogOut',
    color: orange,
    tags: ['exit code', 'stderr', 'process']
  },
  'datetime-and-stamps': {
    description: 'A timestamp is a datetime once you parse it, and then sorting and differences work. How you print it back out is a separate choice.',
    icon: 'Clock',
    color: orange,
    tags: ['datetime', 'stamp', 'parse']
  },
  'subprocess-idea': {
    description: 'Subprocess starts another program and hands you its output and its exit code. Pass the arguments as a list so a shell never gets to reinterpret them.',
    icon: 'Play',
    color: orange,
    tags: ['subprocess', 'process', 'run']
  },
  'transfer-report-tool': {
    description: 'Build a small command that reads input, writes a report, and exits with an honest code. First piece of the capstone, and no worked example.',
    icon: 'FileCheck',
    color: orange,
    tags: ['report', 'process', 'transfer']
  },
  'module-is-a-file': {
    description: 'A file is a module, and importing it runs it once and remembers the result. The names you defined become attributes of that module.',
    icon: 'FileCode',
    color: teal,
    tags: ['module', 'file', 'import']
  },
  'import-forms': {
    description: 'Import brings the module, from-import brings the name, and as renames it. A star import makes it impossible to say where a name came from.',
    icon: 'ArrowDownToLine',
    color: teal,
    tags: ['import', 'from', 'alias']
  },
  'main-guard': {
    description: 'Importing a module runs everything at its top level. Work that should only happen when you run the file directly belongs under the main guard.',
    icon: 'Command',
    color: teal,
    tags: ['main', 'import', 'script']
  },
  'packages-and-init': {
    description: 'A folder of modules is a package, and its init file decides what the package hands out. That is how station code grows past one file.',
    icon: 'Package',
    color: teal,
    tags: ['package', 'init', 'import']
  },
  'stdlib-tour': {
    description: 'A tour of the modules that ship with Python and how to find the right one. Looking there first saves writing what already exists.',
    icon: 'Library',
    color: teal,
    tags: ['stdlib', 'import', 'modules']
  },
  'venv-and-dependencies': {
    description: 'A virtual environment gives a project its own interpreter and its own installed packages. A pinned requirements list is how someone else rebuilds it.',
    icon: 'Layers',
    color: teal,
    tags: ['venv', 'pip', 'dependency']
  },
  'class-and-instance': {
    description: 'A class describes what every station reading has. An instance is one actual reading with its own values.',
    icon: 'Component',
    color: blue,
    tags: ['class', 'instance', 'object']
  },
  'init-and-attributes': {
    description: 'Init runs when you make an instance and gives it its attributes. It is setup on an object that already exists, not a constructor that returns one.',
    icon: 'Settings2',
    color: blue,
    tags: ['init', 'attribute', 'object']
  },
  'methods-and-self': {
    description: 'A method is a function on the class, and self is the instance it was called on. Calling it through an instance is what fills that first parameter in.',
    icon: 'User',
    color: blue,
    tags: ['method', 'self', 'object']
  },
  'class-vs-instance-attr': {
    description: 'An attribute on the class is one value every instance sees, and a mutable one gets shared. Assigning through an instance makes a separate attribute that shadows it.',
    icon: 'Users',
    color: blue,
    tags: ['class', 'attribute', 'shared']
  },
  'dunder-str-and-repr': {
    description: 'Str is the friendly line a person reads, and repr is the one you want in a log or a debugger. Without them you get a memory address.',
    icon: 'Quote',
    color: blue,
    tags: ['str', 'repr', 'object']
  },
  'equality-and-hash': {
    description: 'Defining equality lets two separate instances count as the same reading. Define hash alongside it, or the object stops working as a dict key.',
    icon: 'Equal',
    color: blue,
    tags: ['equality', 'hash', 'dict']
  },
  'dataclasses': {
    description: 'A dataclass writes init, repr, and equality from the field list. Reach for it when the class is mostly data and you still want a real type.',
    icon: 'Box',
    color: blue,
    tags: ['dataclass', 'init', 'object']
  },
  'properties-not-getters': {
    description: 'A property lets a computed value look like a plain attribute, so callers keep the simple spelling. Write one when there is real work or a check to do.',
    icon: 'Gauge',
    color: blue,
    tags: ['property', 'getter', 'attribute']
  },
  'inheritance-basics': {
    description: 'A subclass reuses the parent behaviour and overrides only the parts that differ. Inherit when the child really is a kind of the parent.',
    icon: 'Network',
    color: blue,
    tags: ['inherit', 'class', 'override']
  },
  'super-and-mro': {
    description: 'Super calls the next class in the method resolution order, which is not always the parent. With more than one parent, that order is the whole answer.',
    icon: 'GitMerge',
    color: blue,
    tags: ['super', 'mro', 'class']
  },
  'composition-over-inheritance': {
    description: 'A class that holds another object can swap it, test it, and stay shallow. Deep inheritance chains are where behaviour goes to hide.',
    icon: 'Puzzle',
    color: blue,
    tags: ['composition', 'class', 'design']
  },
  'transfer-model-a-station': {
    description: 'Turn the field station into classes with honest attributes and methods. New domain, the same object rules, and no worked example.',
    icon: 'LayoutDashboard',
    color: blue,
    tags: ['class', 'model', 'transfer']
  },
  'objects-and-references': {
    description: 'Every value is an object, and a name is a label pointing at one. Assignment moves the label and never copies the object.',
    icon: 'Link',
    color: purple,
    tags: ['reference', 'object', 'name']
  },
  'mutability-and-aliasing': {
    description: 'Changing a mutable object shows up through every name that points at it, while rebinding a name does not. Passing one into a function does not protect it.',
    icon: 'Shuffle',
    color: purple,
    tags: ['mutable', 'alias', 'object']
  },
  'copy-shallow-vs-deep': {
    description: 'A shallow copy gives you a new outer object whose inner objects are still shared. A deep copy walks the whole tree, and costs more than you may want.',
    icon: 'Copy',
    color: purple,
    tags: ['copy', 'deep', 'nested']
  },
  'iterables-and-iterators': {
    description: 'An iterable can hand out an iterator, and the iterator is the part that remembers where it got to. That is why looping over a used-up iterator does nothing.',
    icon: 'Repeat',
    color: purple,
    tags: ['iterable', 'iterator', 'for']
  },
  'generators-yield': {
    description: 'A generator produces values as they are asked for, so it never holds the whole list. It is not a list: you cannot index it, and it runs out once.',
    icon: 'Play',
    color: purple,
    tags: ['generator', 'yield', 'lazy']
  },
  'generator-pipelines': {
    description: 'Feeding one generator into the next reads the log once and holds one line at a time. Nothing moves until something pulls at the end of the chain.',
    icon: 'Workflow',
    color: purple,
    tags: ['generator', 'pipeline', 'lazy']
  },
  'itertools-basics': {
    description: 'Chain, islice, and groupby do the common iteration jobs lazily and already ship with Python. Groupby needs its input sorted first, which is the trap.',
    icon: 'Infinity',
    color: purple,
    tags: ['itertools', 'iterator', 'lazy']
  },
  'decorators-basics': {
    description: 'A decorator takes a function and returns a replacement that calls it, which is how timing or logging arrives in one line. The original body is untouched.',
    icon: 'Layers',
    color: purple,
    tags: ['decorator', 'wrap', 'function']
  },
  'decorators-with-args': {
    description: 'To give a decorator options you write a function that returns the decorator. Three levels feels like one too many until you have needed the option.',
    icon: 'SlidersHorizontal',
    color: purple,
    tags: ['decorator', 'arguments', 'closure']
  },
  'context-managers': {
    description: 'A context manager owns the enter and the exit, so a caller cannot forget the cleanup. A small helper turns a generator into one.',
    icon: 'Lock',
    color: purple,
    tags: ['with', 'context', 'cleanup']
  },
  'type-hints': {
    description: 'A hint states the contract for readers and tools, and Python does not enforce it at runtime. A checker or a test is what holds you to it.',
    icon: 'Type',
    color: purple,
    tags: ['type hints', 'typing', 'contract']
  },
  'transfer-lazy-reader': {
    description: 'Build a reader that streams records instead of loading them, using the laziness you just learned. New input, and no worked example.',
    icon: 'Waves',
    color: purple,
    tags: ['generator', 'stream', 'transfer']
  },
  'blocking-vs-waiting': {
    description: 'A blocking call holds the whole program while nothing happens. Telling waiting apart from work is what decides whether async is worth it.',
    icon: 'Hourglass',
    color: cyan,
    tags: ['blocking', 'waiting', 'async']
  },
  'async-def-await': {
    description: 'An async function returns a coroutine that does nothing until it is awaited or scheduled. Await pauses that one call, not the program.',
    icon: 'Timer',
    color: cyan,
    tags: ['async', 'await', 'coroutine']
  },
  'gather-concurrency': {
    description: 'Gather runs several awaitables together, so five one-second waits take about one second. Awaiting them in a row is the version that takes five.',
    icon: 'Send',
    color: cyan,
    tags: ['gather', 'concurrency', 'async']
  },
  'threads-vs-processes': {
    description: 'The global lock means threads do not speed up pure Python computation, though they do overlap waiting. Real parallel work needs separate processes.',
    icon: 'Cpu',
    color: cyan,
    tags: ['thread', 'process', 'GIL']
  },
  'mocking-time-and-io': {
    description: 'Replacing the clock and the filesystem keeps a test fast and repeatable. Patch the name where it is used, not where it was defined.',
    icon: 'Watch',
    color: amber,
    tags: ['mock', 'time', 'io']
  },
  'docstrings-contracts': {
    description: 'A short docstring says what goes in, what comes back, and what it raises. Written that way it is a checklist rather than decoration.',
    icon: 'BookOpen',
    color: amber,
    tags: ['docstring', 'contract', 'function']
  },
  'logging-not-print': {
    description: 'Logging lets you leave the diagnostics in and choose later how much to see. Print puts debug noise in the middle of your report.',
    icon: 'ScrollText',
    color: amber,
    tags: ['logging', 'level', 'print']
  },
  'security-paths-and-eval': {
    description: 'A path from outside can climb out of the folder you meant, and eval on untrusted text hands over the process. Resolve and check the path, and parse instead of evaluating.',
    icon: 'ShieldAlert',
    color: amber,
    tags: ['security', 'path', 'eval']
  },
  'capstone-field-station': {
    description: 'Put the whole path together: modules, objects, files, and tests, in one small package you keep.',
    icon: 'Flag',
    color: amber,
    tags: ['capstone', 'package', 'tests']
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
    description: 'A short quiz about what you already expect JavaScript to do. Wrong answers do not lock you out.',
    icon: 'Compass',
    color: teal,
    tags: ['placement', 'javascript']
  },
  'values-and-typeof': {
    description: 'Every value has a kind: number, text, or true and false. You need this before any list.',
    icon: 'Shapes',
    color: amber,
    tags: ['number', 'string', 'boolean']
  },
  'names-let-const': {
    description: 'A name is a box for a value. Some boxes you can refill. Some you cannot rebind.',
    icon: 'Tag',
    color: blue,
    tags: ['let', 'const', 'binding']
  },
  'strings-immutable': {
    description: 'A string method returns a new string. The original text stays put.',
    icon: 'Lock',
    color: blue,
    tags: ['string', 'immutable']
  },
  'strings-and-templates': {
    description: 'Backticks insert a value into a new string. Quotes keep the dollar signs as letters.',
    icon: 'Quote',
    color: pink,
    tags: ['string', 'template']
  },
  'numbers-and-nan': {
    description: 'Some calculations have no numeric answer. Spot NaN and do not treat it as zero.',
    icon: 'Hash',
    color: orange,
    tags: ['number', 'NaN', 'double']
  },
  'triple-equals': {
    description: 'Strict equality compares value and kind. Loose equality will surprise you.',
    icon: 'Equal',
    color: teal,
    tags: ['equality', 'boolean', 'type']
  },
  'truth-and-if': {
    description: 'Some values act as no in a decision. An empty list is still a list.',
    icon: 'GitBranch',
    color: green,
    tags: ['if', 'boolean', 'truth']
  },
  'short-circuit': {
    description: 'And, or, and nullish stop as soon as they know the answer. Zero is a real reading.',
    icon: 'GitMerge',
    color: cyan,
    tags: ['boolean', 'or', 'nullish']
  },
  'transfer-classify-signal': {
    description: 'Use kinds of values to label a signal in a new story.',
    icon: 'Tags',
    color: purple,
    tags: ['type', 'classify', 'signal']
  },
  'functions-call': {
    description: 'Name a function and pass values in to run it. Nothing runs until you call it.',
    icon: 'Play',
    color: cyan,
    tags: ['function', 'call', 'parameters']
  },
  'beacon-call': {
    description: 'Walk the fox onto the beacon by calling a move, one cell at a time.',
    icon: 'Navigation',
    color: orange,
    tags: ['function', 'call', 'grid']
  },
  'return-not-print': {
    description: 'Showing a value is not the same as handing it back to the caller.',
    icon: 'Reply',
    color: blue,
    tags: ['return', 'function', 'value']
  },
  'parameters-and-defaults': {
    description: 'A function can take values in. Missing ones can have a fallback.',
    icon: 'SlidersHorizontal',
    color: amber,
    tags: ['parameters', 'default', 'function']
  },
  'loops-for': {
    description: 'A counted loop writes a path, one step per turn.',
    icon: 'Repeat',
    color: teal,
    tags: ['loop', 'count', 'array']
  },
  'optional-chaining': {
    description: 'Reach through a record that may be missing without crashing. The question mark dot stops at the first gap, and it is not a default.',
    icon: 'Link',
    color: cyan,
    tags: ['optional', 'nullish', 'object']
  },
  'switch-dispatch': {
    description: 'One command name picks between many branches. Grouped labels share a body on purpose, and a missing stop runs the next branch by accident.',
    icon: 'GitBranch',
    color: green,
    tags: ['switch', 'branch', 'dispatch']
  },
  'object-key-iteration': {
    description: 'Walk a record by its own keys, its values, or both. The older loop also hands you inherited keys.',
    icon: 'FolderTree',
    color: teal,
    tags: ['object', 'keys', 'loop']
  },
  'promise-combinators': {
    description: 'Waiting for a group is three questions. Require every part, report what each part did, or take whichever answer lands first.',
    icon: 'Layers',
    color: blue,
    tags: ['promise', 'all', 'race']
  },
  'regex-lines': {
    description: 'A pattern pulls fields out of a log line and squeezes the spacing. Without the global flag it fixes only the first match.',
    icon: 'ScanSearch',
    color: orange,
    tags: ['regex', 'text', 'log']
  },
  'loops-while-break': {
    description: 'Keep going while a condition is true. Stop when you have a reason.',
    icon: 'Repeat',
    color: green,
    tags: ['loop', 'while', 'break']
  },
  'keyed-beacon': {
    description: 'Collect every token, then stand on the beacon facing the right way.',
    icon: 'Key',
    color: amber,
    tags: ['loop', 'grid', 'collect']
  },
  'debug-off-by-one-path': {
    description: 'The walk is one cell short. Find the off-by-one and fix it.',
    icon: 'Bug',
    color: red,
    tags: ['debug', 'loop', 'index']
  },
  'arrays-index': {
    description: 'Length is how many items. Index is the place of one item.',
    icon: 'List',
    color: blue,
    tags: ['array', 'index', 'length']
  },
  'arrays-map': {
    description: 'Make a new list from an old one. The original stays put.',
    icon: 'ArrowLeftRight',
    color: purple,
    tags: ['array', 'map', 'list']
  },
  'arrays-filter-find': {
    description: 'Filter keeps every match. Find keeps the first match.',
    icon: 'Filter',
    color: cyan,
    tags: ['array', 'filter', 'find']
  },
  'arrays-reduce-once': {
    description: 'Fold a list into one value, and be able to say why.',
    icon: 'Layers',
    color: orange,
    tags: ['array', 'reduce', 'value']
  },
  'objects-props': {
    description: 'A record holds named fields you can read and change.',
    icon: 'Box',
    color: teal,
    tags: ['object', 'field', 'value']
  },
  'set-and-map': {
    description: 'A set keeps each value once. A map stores a value under a key you choose.',
    icon: 'Boxes',
    color: purple,
    tags: ['set', 'map', 'unique']
  },
  'reference-vs-copy': {
    description: 'Two names can point at the same object. A copy is a new one.',
    icon: 'Copy',
    color: amber,
    tags: ['reference', 'copy', 'object']
  },
  'destructure-spread': {
    description: 'Pull fields out of a record, or copy them into a new one.',
    icon: 'Braces',
    color: pink,
    tags: ['object', 'spread', 'fields']
  },
  'json-roundtrip': {
    description: 'Turn a record into text and back again without losing the shape.',
    icon: 'FileJson',
    color: cyan,
    tags: ['json', 'object', 'string']
  },
  'signal-log': {
    description: 'Build a small log of signals you can keep working on.',
    icon: 'ScrollText',
    color: blue,
    tags: ['array', 'object', 'log']
  },
  'scope-and-tdz': {
    description: 'A name is only alive in its block. Using it too early is a fault.',
    icon: 'Lock',
    color: orange,
    tags: ['scope', 'let', 'binding']
  },
  'closures-radio': {
    description: 'A function can remember values from the place it was created.',
    icon: 'Radio',
    color: purple,
    tags: ['closure', 'function', 'scope']
  },
  'callbacks-as-commands': {
    description: 'A table of functions is a set of commands you can call by name.',
    icon: 'Command',
    color: cyan,
    tags: ['function', 'callback', 'table']
  },
  'arrow-vs-function': {
    description: 'Write a short arrow function with =>.',
    icon: 'ArrowRight',
    color: teal,
    tags: ['function', 'arrow']
  },
  'higher-order-route': {
    description: 'Pass a function into another function so the walk can change.',
    icon: 'GitMerge',
    color: blue,
    tags: ['function', 'callback', 'parameters']
  },
  'stale-closure-debug': {
    description: 'The last direction keeps winning. Find why the old value stuck.',
    icon: 'Bug',
    color: red,
    tags: ['debug', 'closure', 'this']
  },
  'transfer-command-table': {
    description: 'Build a new maze from a table of commands.',
    icon: 'Table2',
    color: amber,
    tags: ['function', 'table', 'grid']
  },
  'throw-and-catch': {
    description: 'Throw a problem, catch it, and keep walking.',
    icon: 'Shield',
    color: orange,
    tags: ['throw', 'catch', 'error']
  },
  'finally-and-rethrow': {
    description: 'Work that must run after a try, even when you throw again.',
    icon: 'RotateCcw',
    color: purple,
    tags: ['finally', 'throw', 'cleanup']
  },
  'custom-errors': {
    description: 'Make your own error type so the catch can tell stories apart.',
    icon: 'BadgeAlert',
    color: red,
    tags: ['error', 'type', 'catch']
  },
  'debug-read-the-stack': {
    description: 'Read the stack to see which call failed and why.',
    icon: 'Layers',
    color: amber,
    tags: ['debug', 'stack', 'call']
  },
  'coercion-to-primitive': {
    description: 'An object can be asked to become a simple value. Know what it answers.',
    icon: 'Shuffle',
    color: pink,
    tags: ['object', 'number', 'string']
  },
  'prototypes-chain': {
    description: 'A missing field is looked up on the object behind this one.',
    icon: 'Link',
    color: teal,
    tags: ['prototype', 'object', 'field']
  },
  'new-and-create': {
    description: 'Two ways to make an object that shares a prototype.',
    icon: 'Sparkles',
    color: cyan,
    tags: ['object', 'prototype', 'new']
  },
  'classes-syntax': {
    description: 'Class syntax is sugar over the same prototype story.',
    icon: 'Component',
    color: blue,
    tags: ['class', 'prototype', 'this']
  },
  'this-call-apply-bind': {
    description: 'This is who the function is talking about, not where it was written.',
    icon: 'User',
    color: green,
    tags: ['this', 'function', 'bind']
  },
  'descriptors-get-set': {
    description: 'A field can run code when you read or write it.',
    icon: 'Settings2',
    color: amber,
    tags: ['get', 'set', 'object']
  },
  'symbols': {
    description: 'A unique key that will not clash with ordinary names.',
    icon: 'KeyRound',
    color: purple,
    tags: ['symbol', 'key', 'object']
  },
  'weak-collections': {
    description: 'Notes that do not keep an object alive after you let it go.',
    icon: 'Ghost',
    color: blue,
    tags: ['weak', 'object', 'memory']
  },
  'iterators-for-of': {
    description: 'A custom list of directions you can walk with a for-of loop.',
    icon: 'List',
    color: teal,
    tags: ['iterator', 'loop', 'array']
  },
  'generators': {
    description: 'A function that yields the next step when you ask.',
    icon: 'Play',
    color: orange,
    tags: ['generator', 'yield', 'function']
  },
  'proxies-reflect': {
    description: 'Intercept one read or write and decide what it means.',
    icon: 'Scan',
    color: cyan,
    tags: ['proxy', 'object', 'get']
  },
  'transfer-model-a-part': {
    description: 'Model a part as an object with the same rules you just learned.',
    icon: 'Boxes',
    color: green,
    tags: ['object', 'prototype', 'model']
  },
  'stack-vs-heap': {
    description: 'Calls sit on a stack. Objects live on the heap until nothing points at them.',
    icon: 'Layers',
    color: amber,
    tags: ['stack', 'heap', 'memory']
  },
  'macrotasks-timeout': {
    description: 'A timeout waits until the current work is done, then it runs.',
    icon: 'Clock',
    color: orange,
    tags: ['timeout', 'event loop', 'async']
  },
  'microtasks-then': {
    description: 'A then callback runs before the next timeout. They are not the same tray.',
    icon: 'Timer',
    color: purple,
    tags: ['promise', 'microtask', 'then']
  },
  'promises-states': {
    description: 'A promise is pending, kept, or broken. It does not change again.',
    icon: 'CircleDashed',
    color: teal,
    tags: ['promise', 'async', 'state']
  },
  'async-await': {
    description: 'Await pauses this function until a promise settles, then continues.',
    icon: 'Hourglass',
    color: cyan,
    tags: ['async', 'await', 'promise']
  },
  'async-errors': {
    description: 'A rejected await belongs in try and catch, like a throw.',
    icon: 'ShieldAlert',
    color: red,
    tags: ['async', 'catch', 'error']
  },
  'parallel-vs-sequence': {
    description: 'Wait for many promises together, or one after another on purpose.',
    icon: 'GitMerge',
    color: blue,
    tags: ['promise', 'parallel', 'async']
  },
  'async-iterators': {
    description: 'Walk a stream of steps as each one arrives.',
    icon: 'Waves',
    color: pink,
    tags: ['async', 'iterator', 'stream']
  },
  'transfer-beacon-dispatch': {
    description: 'Time a walk on the grid using what you just learned about waiting.',
    icon: 'Send',
    color: amber,
    tags: ['async', 'grid', 'promise']
  },
  'debug-forgotten-await': {
    description: 'The walk finishes too soon. Find the missing wait.',
    icon: 'Bug',
    color: cyan,
    tags: ['debug', 'await', 'promise']
  },
  'tree-not-string': {
    description: 'The page is a tree of nodes, not a pile of text.',
    icon: 'Network',
    color: green,
    tags: ['dom', 'tree', 'node']
  },
  'query-and-update': {
    description: 'Find a node, then change the text it shows.',
    icon: 'Search',
    color: teal,
    tags: ['dom', 'query', 'text']
  },
  'create-and-remove': {
    description: 'Make a node, put it in the tree, or take it out.',
    icon: 'Plus',
    color: blue,
    tags: ['dom', 'create', 'remove']
  },
  'events-bubble': {
    description: 'A click rises through the tree unless you stop it.',
    icon: 'Waves',
    color: cyan,
    tags: ['event', 'bubble', 'dom']
  },
  'delegation': {
    description: 'One listener on a parent can handle many children.',
    icon: 'Users',
    color: purple,
    tags: ['event', 'delegate', 'dom']
  },
  'forms-and-input': {
    description: 'Read what the learner typed as they type it.',
    icon: 'TextCursorInput',
    color: amber,
    tags: ['input', 'string', 'event']
  },
  'prevent-default': {
    description: 'Stop the form from leaving the page, then copy the typed words onto the board.',
    icon: 'Shield',
    color: teal,
    tags: ['form', 'submit', 'event']
  },
  'a11y-name-and-role': {
    description: 'A control needs a name and a role a screen reader can use.',
    icon: 'Accessibility',
    color: green,
    tags: ['a11y', 'name', 'role']
  },
  'xss-text-vs-html': {
    description: 'Put plain words in as text. Do not feed them as markup.',
    icon: 'ShieldOff',
    color: red,
    tags: ['xss', 'text', 'html']
  },
  'transfer-filter-list-ui': {
    description: 'Filter a list on a real page using the same tree ideas.',
    icon: 'Filter',
    color: blue,
    tags: ['dom', 'filter', 'list']
  },
  'creation-signal-board': {
    description: 'Keep a signal board on the page and take it with you.',
    icon: 'LayoutDashboard',
    color: teal,
    tags: ['dom', 'keep', 'list']
  },
  'http-as-messages': {
    description: 'A request and a response are messages, not magic.',
    icon: 'Mail',
    color: orange,
    tags: ['http', 'request', 'response']
  },
  'method-and-headers': {
    description: 'A request has a method and labels. Those labels tell the other side how to read the body.',
    icon: 'Tag',
    color: blue,
    tags: ['http', 'header', 'method']
  },
  'fetch-ok-and-fail': {
    description: 'A missing page is still a response. Only a broken network throws.',
    icon: 'Globe',
    color: cyan,
    tags: ['fetch', 'http', 'error']
  },
  'json-body': {
    description: 'Reading a body as data can fail. Handle the bad text.',
    icon: 'FileJson',
    color: amber,
    tags: ['json', 'fetch', 'object']
  },
  'abort-and-timeout': {
    description: 'Cancel a request on purpose when you have waited long enough.',
    icon: 'CircleStop',
    color: red,
    tags: ['abort', 'timeout', 'fetch']
  },
  'cors-mental-model': {
    description: 'The browser decides whether page code may read another origin.',
    icon: 'Ban',
    color: orange,
    tags: ['cors', 'origin', 'http']
  },
  'transfer-library-search': {
    description: 'Search a fixture of records the way a library search would.',
    icon: 'Library',
    color: purple,
    tags: ['fetch', 'array', 'search']
  },
  'process-argv-env': {
    description: 'A program can read the words you typed and the environment around it.',
    icon: 'Terminal',
    color: green,
    tags: ['argv', 'env', 'string']
  },
  'fs-read-write': {
    description: 'Read and write a text file on disk.',
    icon: 'HardDrive',
    color: blue,
    tags: ['file', 'read', 'write']
  },
  'paths-and-encoding': {
    description: 'Join path parts safely. Do not walk above the folder you meant.',
    icon: 'FolderTree',
    color: teal,
    tags: ['path', 'encoding', 'file']
  },
  'buffers-vs-strings': {
    description: 'Bytes are not the same as text. Decode them on purpose.',
    icon: 'Binary',
    color: amber,
    tags: ['buffer', 'string', 'bytes']
  },
  'streams-idea': {
    description: 'Read a log in chunks instead of all at once.',
    icon: 'Waves',
    color: cyan,
    tags: ['stream', 'file', 'chunk']
  },
  'cjs-vs-esm-node': {
    description: 'Two module styles. Know which file is which.',
    icon: 'Package',
    color: purple,
    tags: ['module', 'import', 'require']
  },
  'error-first-and-promises': {
    description: 'Older file calls pass an error first. Newer ones return a promise.',
    icon: 'FileWarning',
    color: orange,
    tags: ['error', 'promise', 'callback']
  },
  'transfer-clean-a-log': {
    description: 'Clean a messy log into lines you can compare. New input, the rules you just learned, and no worked example.',
    icon: 'Eraser',
    color: pink,
    tags: ['log', 'string', 'transfer']
  },
  'creation-log-scrubber': {
    description: 'Keep a log scrubber you can run again.',
    icon: 'Sparkles',
    color: cyan,
    tags: ['file', 'keep', 'filter']
  },
  'assert-and-aaa': {
    description: 'Arrange the world, act, then assert what must be true.',
    icon: 'CheckSquare',
    color: amber,
    tags: ['assert', 'test', 'boolean']
  },
  'fixtures-and-hidden-tests': {
    description: 'Hidden tests use fixtures. Your file is the thing they call.',
    icon: 'Boxes',
    color: amber,
    tags: ['fixture', 'test', 'function']
  },
  'mocking-time-and-fs': {
    description: 'Fake the clock and the disk so a test does not wait or write for real.',
    icon: 'Watch',
    color: amber,
    tags: ['mock', 'time', 'file']
  },
  'why-bundlers': {
    description: 'A bundler packs modules for the page. Know why that step exists.',
    icon: 'Package',
    color: cyan,
    tags: ['bundler', 'module', 'import']
  },
  'modules-esm-files': {
    description: 'Export a walker from one file and import it in another.',
    icon: 'FileInput',
    color: teal,
    tags: ['export', 'import', 'module']
  },
  'ast-and-lint': {
    description: 'A linter reads the shape of the code, not only the text.',
    icon: 'ScanSearch',
    color: purple,
    tags: ['ast', 'lint', 'tree']
  },
  'proto-pollution': {
    description: 'Do not let outside data write into the shared object behind every record.',
    icon: 'Skull',
    color: red,
    tags: ['prototype', 'security', 'object']
  },
  'measure-then-change': {
    description: 'Measure first. Change one thing. Measure again.',
    icon: 'Ruler',
    color: amber,
    tags: ['measure', 'change', 'number']
  },
  'jsdoc-contracts': {
    description: 'A short comment can be a checklist of what a function owes.',
    icon: 'FileCheck',
    color: green,
    tags: ['jsdoc', 'function', 'parameters']
  },
  'transfer-test-the-fox': {
    description: 'Write tests for a walk so a later change cannot silently break it.',
    icon: 'TestTube',
    color: amber,
    tags: ['test', 'assert', 'grid']
  },
  'capstone-signal-ops': {
    description: 'Put the path together: walk, records, the page, and tests.',
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
