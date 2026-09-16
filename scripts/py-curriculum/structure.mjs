/**
 * The locked Python path. Courses, modules, skills, and misconceptions all come
 * from this one file so the pack JSON and `tests/py-curriculum.test.ts` cannot
 * drift apart.
 */

export const TRACKS = [
  {
    id: 'foundations',
    title: 'Foundations',
    intro: 'What a value is, how a decision branches, and how a call moves the fox. Lists come after, not before.',
    courses: [
      {
        id: 'placement',
        title: 'Where you are',
        level: 'beginner',
        estimatedMinutes: 25,
        diagnosticLessonId: 'py-placement',
        skillIds: ['python.types.names', 'python.control.loops', 'python.collections.list', 'python.functions'],
        modules: [{ id: 'diagnostic', title: 'Placement', lessonIds: ['py-placement'] }]
      },
      {
        id: 'values',
        title: 'Values you can see',
        level: 'beginner',
        estimatedMinutes: 240,
        skillIds: ['python.types.names', 'python.values.numbers', 'python.values.strings', 'python.values.truth'],
        modules: [
          {
            id: 'kinds',
            title: 'Kinds of values',
            lessonIds: [
              'names-and-values',
              'types-you-can-see',
              'numbers-int-float',
              'strings-immutable',
              'say-it-once'
            ]
          },
          {
            id: 'compare',
            title: 'Compare and branch',
            lessonIds: [
              'truthiness-and-none',
              'compare-is-not-assign',
              'equality-vs-identity',
              'boolean-logic',
              'transfer-classify-value'
            ]
          }
        ]
      },
      {
        id: 'flow',
        title: 'Decisions and the grid',
        level: 'beginner',
        estimatedMinutes: 260,
        skillIds: ['python.control.if', 'python.control.loops', 'python.call.move'],
        modules: [
          {
            id: 'decide',
            title: 'Decide',
            lessonIds: ['if-this-then-that', 'compare-chaining', 'walk-the-fox']
          },
          {
            id: 'repeat',
            title: 'Repeat',
            lessonIds: [
              'for-over-range',
              'while-and-break',
              'loop-else-and-continue',
              'nested-loops-grid',
              'debug-off-by-one',
              'transfer-patrol-route'
            ]
          }
        ]
      },
      {
        id: 'functions',
        title: 'Functions you can reuse',
        level: 'beginner',
        estimatedMinutes: 270,
        creationId: 'greeting-bot',
        skillIds: ['python.functions', 'python.functions.scope', 'python.io.stdio'],
        modules: [
          {
            id: 'define',
            title: 'Define and return',
            lessonIds: ['def-and-return', 'parameters-defaults', 'keyword-args', 'mutable-default-trap', 'args-and-kwargs']
          },
          {
            id: 'scope',
            title: 'Where names live',
            lessonIds: ['scope-and-global', 'closures-and-nonlocal', 'lambda-and-key', 'greeting-bot']
          }
        ]
      }
    ]
  },
  {
    id: 'fluency',
    title: 'Fluency',
    intro: 'Collections, errors, and text. This is where small scripts start to feel like programs.',
    courses: [
      {
        id: 'collections',
        title: 'Data that becomes a path',
        level: 'beginner',
        estimatedMinutes: 330,
        skillIds: [
          'python.collections.list',
          'python.collections.dict',
          'python.collections.set',
          'python.collections.comprehension'
        ],
        modules: [
          {
            id: 'sequences',
            title: 'Sequences',
            lessonIds: ['lists-index-slice', 'list-mutation-vs-copy', 'tuples-and-unpacking', 'sorting-with-key']
          },
          {
            id: 'mappings',
            title: 'Mappings and sets',
            lessonIds: ['dicts-keys', 'dict-get-and-setdefault', 'sets-and-dedupe', 'counting-with-counter']
          },
          {
            id: 'shape',
            title: 'Reshape the data',
            lessonIds: [
              'comprehensions-list',
              'comprehensions-dict-set',
              'zip-and-enumerate',
              'nested-data-gradebook',
              'transfer-group-records'
            ]
          }
        ]
      },
      {
        id: 'errors',
        title: 'Errors you can recover from',
        level: 'intermediate',
        estimatedMinutes: 190,
        skillIds: ['python.errors'],
        modules: [
          {
            id: 'read',
            title: 'Read the failure',
            lessonIds: ['read-the-traceback', 'try-except-specific', 'else-and-finally']
          },
          {
            id: 'raise',
            title: 'Raise and recover',
            lessonIds: ['raise-and-custom-error', 'eafp-vs-lbyl', 'debug-swallowed-error', 'transfer-safe-parse']
          }
        ]
      },
      {
        id: 'text',
        title: 'Text you can trust',
        level: 'intermediate',
        estimatedMinutes: 200,
        skillIds: ['python.values.strings', 'python.text.regex'],
        modules: [
          {
            id: 'shape-text',
            title: 'Shape text',
            lessonIds: ['string-methods-clean', 'split-and-join', 'slicing-text', 'fstring-formatting']
          },
          {
            id: 'patterns',
            title: 'Patterns',
            lessonIds: ['regex-search', 'regex-groups-and-sub', 'encoding-bytes-vs-str', 'transfer-clean-a-log']
          }
        ]
      }
    ]
  },
  {
    id: 'the-machine',
    title: 'Files and the machine',
    intro: 'Real input and output: the filesystem, structured records, and the process your script runs in.',
    courses: [
      {
        id: 'files',
        title: 'Files and the filesystem',
        level: 'intermediate',
        estimatedMinutes: 250,
        creationId: 'log-scrubber',
        skillIds: ['python.io.files', 'python.io.json'],
        modules: [
          {
            id: 'read-write',
            title: 'Read and write',
            lessonIds: ['open-and-with', 'read-lines-without-slurping', 'write-text-safely', 'pathlib-paths']
          },
          {
            id: 'records',
            title: 'Structured records',
            lessonIds: ['json-roundtrip', 'csv-rows', 'dirs-and-globs', 'creation-log-scrubber']
          }
        ]
      },
      {
        id: 'process',
        title: 'The process your script lives in',
        level: 'intermediate',
        estimatedMinutes: 170,
        skillIds: ['python.io.stdio', 'python.modules'],
        modules: [
          {
            id: 'inputs',
            title: 'Inputs and exits',
            lessonIds: ['argv-and-env', 'exit-codes-and-stderr', 'datetime-and-stamps']
          },
          {
            id: 'reach',
            title: 'Reach and limits',
            lessonIds: ['subprocess-idea', 'transfer-report-tool']
          }
        ]
      }
    ]
  },
  {
    id: 'structure',
    title: 'Structure',
    intro: 'Files become modules, and state that travels together becomes an object.',
    courses: [
      {
        id: 'modules',
        title: 'Modules and packages',
        level: 'intermediate',
        estimatedMinutes: 190,
        skillIds: ['python.modules'],
        modules: [
          {
            id: 'files-as-modules',
            title: 'A file is a module',
            lessonIds: ['module-is-a-file', 'import-forms', 'main-guard']
          },
          {
            id: 'bigger',
            title: 'Bigger than one file',
            lessonIds: ['packages-and-init', 'stdlib-tour', 'venv-and-dependencies']
          }
        ]
      },
      {
        id: 'objects',
        title: 'Objects that hold state',
        level: 'intermediate',
        estimatedMinutes: 300,
        skillIds: ['python.objects', 'python.objects.data'],
        modules: [
          {
            id: 'shape',
            title: 'Shape an object',
            lessonIds: ['class-and-instance', 'init-and-attributes', 'methods-and-self', 'class-vs-instance-attr']
          },
          {
            id: 'behave',
            title: 'Make it behave',
            lessonIds: ['dunder-str-and-repr', 'equality-and-hash', 'dataclasses', 'properties-not-getters']
          },
          {
            id: 'reuse',
            title: 'Reuse without tangling',
            lessonIds: ['inheritance-basics', 'super-and-mro', 'composition-over-inheritance', 'transfer-model-a-station']
          }
        ]
      }
    ]
  },
  {
    id: 'language',
    title: 'The language under the hood',
    intro: 'Iteration, laziness, decorators, context managers, and types. Taught after you have written real programs.',
    courses: [
      {
        id: 'internals',
        title: 'How Python actually runs it',
        level: 'advanced',
        estimatedMinutes: 330,
        skillIds: ['python.internals.iteration', 'python.internals.decorators', 'python.internals.context', 'python.typing'],
        modules: [
          {
            id: 'identity',
            title: 'Objects and references',
            lessonIds: ['objects-and-references', 'mutability-and-aliasing', 'copy-shallow-vs-deep']
          },
          {
            id: 'iteration',
            title: 'Lazy iteration',
            lessonIds: ['iterables-and-iterators', 'generators-yield', 'generator-pipelines', 'itertools-basics']
          },
          {
            id: 'wrap',
            title: 'Wrap behaviour',
            lessonIds: ['decorators-basics', 'decorators-with-args', 'context-managers', 'type-hints', 'transfer-lazy-reader']
          }
        ]
      },
      {
        id: 'waiting',
        title: 'Waiting without blocking',
        level: 'advanced',
        estimatedMinutes: 150,
        skillIds: ['python.async'],
        modules: [
          {
            id: 'why',
            title: 'Why waiting is different',
            lessonIds: ['blocking-vs-waiting', 'async-def-await']
          },
          {
            id: 'together',
            title: 'Work that overlaps',
            lessonIds: ['gather-concurrency', 'threads-vs-processes', 'debug-forgotten-await']
          }
        ]
      }
    ]
  },
  {
    id: 'craft',
    title: 'Craft',
    intro: 'Prove it works, find out why it does not, and make it fast enough. Then ship the capstone.',
    courses: [
      {
        id: 'craft',
        title: 'Prove it, then ship it',
        level: 'advanced',
        estimatedMinutes: 300,
        creationId: 'field-station',
        skillIds: ['python.craft.tests', 'python.craft.debug', 'python.craft.perf', 'python.security'],
        modules: [
          {
            id: 'prove',
            title: 'Prove it',
            lessonIds: ['assert-and-aaa', 'fixtures-and-hidden-tests', 'mocking-time-and-io', 'docstrings-contracts']
          },
          {
            id: 'diagnose',
            title: 'Diagnose and harden',
            lessonIds: ['logging-not-print', 'measure-then-change', 'security-paths-and-eval']
          },
          {
            id: 'ship',
            title: 'Ship',
            lessonIds: ['transfer-test-the-fox', 'capstone-field-station']
          }
        ]
      }
    ]
  }
]

export const SKILLS = [
  { id: 'python.types.names', title: 'Names and values', prereqIds: [] },
  { id: 'python.values.numbers', title: 'Numbers', prereqIds: ['python.types.names'] },
  { id: 'python.values.strings', title: 'Strings', prereqIds: ['python.types.names'] },
  { id: 'python.values.truth', title: 'Truthiness and None', prereqIds: ['python.types.names'] },
  { id: 'python.control.if', title: 'Decisions', prereqIds: ['python.values.truth'] },
  { id: 'python.control.loops', title: 'Loops', prereqIds: ['python.control.if'] },
  { id: 'python.call.move', title: 'Call a move', prereqIds: ['python.types.names'] },
  { id: 'python.functions', title: 'Functions', prereqIds: ['python.control.if'] },
  { id: 'python.functions.scope', title: 'Scope and closures', prereqIds: ['python.functions'] },
  { id: 'python.io.stdio', title: 'Messages in and out', prereqIds: ['python.types.names'] },
  { id: 'python.collections.list', title: 'Lists and tuples', prereqIds: ['python.control.loops'] },
  { id: 'python.collections.dict', title: 'Dictionaries', prereqIds: ['python.collections.list'] },
  { id: 'python.collections.set', title: 'Sets', prereqIds: ['python.collections.list'] },
  { id: 'python.collections.comprehension', title: 'Comprehensions', prereqIds: ['python.collections.list'] },
  { id: 'python.errors', title: 'Errors and recovery', prereqIds: ['python.functions'] },
  { id: 'python.text.regex', title: 'Patterns in text', prereqIds: ['python.values.strings'] },
  { id: 'python.io.files', title: 'Files', prereqIds: ['python.errors'] },
  { id: 'python.io.json', title: 'Structured records', prereqIds: ['python.io.files', 'python.collections.dict'] },
  { id: 'python.modules', title: 'Modules and packages', prereqIds: ['python.functions'] },
  { id: 'python.objects', title: 'Classes and instances', prereqIds: ['python.functions'] },
  { id: 'python.objects.data', title: 'Data objects', prereqIds: ['python.objects'] },
  { id: 'python.internals.iteration', title: 'Iterators and generators', prereqIds: ['python.collections.list'] },
  { id: 'python.internals.decorators', title: 'Decorators', prereqIds: ['python.functions.scope'] },
  { id: 'python.internals.context', title: 'Context managers', prereqIds: ['python.io.files'] },
  { id: 'python.typing', title: 'Type hints', prereqIds: ['python.functions'] },
  { id: 'python.async', title: 'Async and waiting', prereqIds: ['python.functions'] },
  { id: 'python.craft.tests', title: 'Tests', prereqIds: ['python.functions'] },
  { id: 'python.craft.debug', title: 'Debugging', prereqIds: ['python.errors'] },
  { id: 'python.craft.perf', title: 'Measuring speed', prereqIds: ['python.collections.list'] },
  { id: 'python.security', title: 'Safe by default', prereqIds: ['python.io.files'] }
]

/**
 * Every id here must be reachable from a wrong answer and must name a lesson
 * that teaches the fix. `tests/py-curriculum.test.ts` enforces both directions.
 */
export const MISCONCEPTIONS = [
  { id: 'print-is-the-program', title: 'Treats print as the whole program', skillIds: ['python.io.stdio'], followUpLessonId: 'def-and-return' },
  { id: 'assign-instead-of-compare', title: 'Uses = when the code needed a comparison', skillIds: ['python.control.if'], followUpLessonId: 'compare-is-not-assign' },
  { id: 'strings-mutate-in-place', title: 'Expects a string method to change the original', skillIds: ['python.values.strings'], followUpLessonId: 'strings-immutable' },
  { id: 'slash-is-integer-division', title: 'Expects / to stay a whole number', skillIds: ['python.values.numbers'], followUpLessonId: 'numbers-int-float' },
  { id: 'is-means-equals', title: 'Uses is for value equality', skillIds: ['python.values.truth'], followUpLessonId: 'equality-vs-identity' },
  { id: 'none-is-false-value', title: 'Treats None as interchangeable with False', skillIds: ['python.values.truth'], followUpLessonId: 'truthiness-and-none' },
  { id: 'range-is-inclusive', title: 'Expects range to include the end value', skillIds: ['python.control.loops'], followUpLessonId: 'for-over-range' },
  { id: 'mutable-default-is-fresh', title: 'Expects a default list argument to be new each call', skillIds: ['python.functions'], followUpLessonId: 'mutable-default-trap' },
  { id: 'assignment-copies-a-list', title: 'Expects assignment to copy a list', skillIds: ['python.collections.list'], followUpLessonId: 'list-mutation-vs-copy' },
  { id: 'copy-is-always-deep', title: 'Expects a copy to protect nested values', skillIds: ['python.collections.list'], followUpLessonId: 'copy-shallow-vs-deep' },
  { id: 'missing-key-returns-none', title: 'Expects a missing dict key to return None', skillIds: ['python.collections.dict'], followUpLessonId: 'dict-get-and-setdefault' },
  { id: 'sets-keep-order', title: 'Expects a set to keep insertion order', skillIds: ['python.collections.set'], followUpLessonId: 'sets-and-dedupe' },
  { id: 'sort-returns-a-list', title: 'Expects list.sort() to return the sorted list', skillIds: ['python.collections.list'], followUpLessonId: 'sorting-with-key' },
  { id: 'bare-except-is-handling', title: 'Treats a bare except as error handling', skillIds: ['python.errors'], followUpLessonId: 'try-except-specific' },
  { id: 'traceback-reads-top-down', title: 'Reads the traceback from the top instead of the last frame', skillIds: ['python.craft.debug'], followUpLessonId: 'read-the-traceback' },
  { id: 'file-closes-itself', title: 'Assumes an opened file closes on its own', skillIds: ['python.io.files'], followUpLessonId: 'open-and-with' },
  { id: 'paths-are-just-strings', title: 'Builds paths by gluing strings with slashes', skillIds: ['python.io.files'], followUpLessonId: 'pathlib-paths' },
  { id: 'import-runs-nothing', title: 'Thinks importing a module does not run its code', skillIds: ['python.modules'], followUpLessonId: 'main-guard' },
  { id: 'self-is-a-keyword', title: 'Thinks self is language magic rather than the first parameter', skillIds: ['python.objects'], followUpLessonId: 'methods-and-self' },
  { id: 'class-attr-is-per-instance', title: 'Expects a class attribute to be private to each instance', skillIds: ['python.objects'], followUpLessonId: 'class-vs-instance-attr' },
  { id: 'generator-is-a-list', title: 'Treats a generator as a list it can index or reuse', skillIds: ['python.internals.iteration'], followUpLessonId: 'generators-yield' },
  { id: 'decorator-edits-the-source', title: 'Thinks a decorator rewrites the function body', skillIds: ['python.internals.decorators'], followUpLessonId: 'decorators-basics' },
  { id: 'await-blocks-everything', title: 'Thinks await stops the whole program', skillIds: ['python.async'], followUpLessonId: 'async-def-await' },
  { id: 'hints-are-enforced', title: 'Believes type hints are checked at runtime', skillIds: ['python.typing'], followUpLessonId: 'type-hints' },
  { id: 'test-checks-the-print', title: 'Tests the printed text instead of the returned value', skillIds: ['python.craft.tests'], followUpLessonId: 'assert-and-aaa' }
]

export const CREATIONS = [
  {
    id: 'greeting-bot',
    title: 'Greeting bot',
    briefMd: 'A small program that greets someone by name. You keep adding validation as you learn.',
    exportKinds: ['folder', 'zip'],
    steps: [
      { lessonId: 'say-it-once', addsMd: 'An f-string greeting.' },
      { lessonId: 'greeting-bot', addsMd: 'A reusable greeting with a name check.' }
    ]
  },
  {
    id: 'log-scrubber',
    title: 'Log scrubber',
    briefMd: 'A tool that reads a messy station log and writes a clean report you can hand to someone else.',
    exportKinds: ['folder', 'zip'],
    steps: [
      { lessonId: 'transfer-clean-a-log', addsMd: 'Normalise the messy lines.' },
      { lessonId: 'creation-log-scrubber', addsMd: 'Read a file, write the cleaned report.' }
    ]
  },
  {
    id: 'field-station',
    title: 'Field station',
    briefMd: 'The capstone: a small package that loads records, reports on them, and proves itself with tests.',
    exportKinds: ['folder', 'zip'],
    steps: [
      { lessonId: 'transfer-report-tool', addsMd: 'A reporting command.' },
      { lessonId: 'transfer-test-the-fox', addsMd: 'Tests for the walk.' },
      { lessonId: 'capstone-field-station', addsMd: 'The whole station, tested.' }
    ]
  }
]

/** Flat path order: tracks, then courses, then modules. */
export const EXPECTED = TRACKS.flatMap((t) => t.courses.flatMap((c) => c.modules.flatMap((m) => m.lessonIds)))
