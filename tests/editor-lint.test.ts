import { CompletionContext } from '@codemirror/autocomplete'
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { domCompletionSource, playerCompletionSource } from '../src/renderer/editor/completions'
import { languageExtension, languageFromEngine, languageLabel } from '../src/renderer/editor/languages'
import { inspectSelectorAt, kindFromSelector } from '../src/renderer/editor/domKind'
import { inspectPage, pageSelectors } from '../src/renderer/editor/pageSource'
import { collectIssues, collectSyntaxIssues, teachParseMessage } from '../src/renderer/editor/lint'
import { companionFiles } from '../src/renderer/screens/Studio'

function js(doc: string) {
  return EditorState.create({ doc, extensions: [javascript()] })
}

function complete(doc: string, explicit = true) {
  const state = EditorState.create({
    doc,
    extensions: [javascript(), javascriptLanguage.data.of({ autocomplete: playerCompletionSource })]
  })
  return playerCompletionSource(new CompletionContext(state, doc.length, explicit))
}

describe('editor language registry', () => {
  it('maps engines and paths', () => {
    expect(languageFromEngine('python')).toBe('python')
    expect(languageFromEngine('javascript')).toBe('javascript')
    expect(languageFromEngine('react', 'App.js')).toBe('javascript')
    expect(languageFromEngine(undefined, 'pack.json')).toBe('json')
    expect(languageFromEngine(undefined, 'notes.txt')).toBe('plaintext')
    expect(languageFromEngine('javascript', 'index.html')).toBe('html')
    expect(languageFromEngine(undefined, 'page.css')).toBe('css')
    expect(languageLabel('javascript', 'dom-v1')).toBe('JavaScript · DOM')
    expect(languageLabel('javascript', 'player-v1')).toBe('JavaScript · Player')
    expect(languageLabel('python', 'player-v1')).toBe('Python · Player')
  })

  it('gives a python lesson python highlighting, linting, and completions', () => {
    const state = EditorState.create({
      doc: 'Player.mo',
      extensions: [languageExtension('python', 'player-v1')]
    })
    // lang-python contributes local and global completion; the Player source is ours.
    const sources = state.languageDataAt<unknown>('autocomplete', 0)
    expect(sources.length).toBeGreaterThanOrEqual(3)
    const player = playerCompletionSource(new CompletionContext(state, state.doc.length, true), 'python')
    expect(player?.options.map((o) => o.label)).toEqual(expect.arrayContaining(['move', 'wait']))
  })
})

describe('teachParseMessage', () => {
  it('turns unexpected eof after an open paren into a next step', () => {
    const taught = teachParseMessage('Unexpected token (3:13)', 'Player.move(')
    expect(taught.incomplete).toBe(true)
    expect(taught.message).toMatch(/argument or a closing parenthesis/i)
  })
})

describe('syntax issues', () => {
  it('flags broken javascript with a useful message', () => {
    const issues = collectSyntaxIssues(js('function (\n'))
    expect(issues.length).toBeGreaterThan(0)
    expect(issues[0]?.message).not.toBe('Syntax error')
    expect(issues[0]?.line).toBeGreaterThanOrEqual(1)
  })

  it('accepts valid python', () => {
    const state = EditorState.create({
      doc: 'Player.move("east")\n',
      extensions: [python()]
    })
    expect(collectIssues(state, { language: 'python' })).toEqual([])
  })
})

function py(doc: string) {
  return EditorState.create({ doc, extensions: [python()] })
}

function pyIssues(doc: string) {
  return collectIssues(py(doc), { language: 'python' })
}

describe('python diagnostics', () => {
  it('names the missing colon instead of pointing at the line', () => {
    const issues = pyIssues('def greet(name)\n    return name\n')
    expect(issues[0]?.message).toMatch(/colon/i)
    expect(issues[0]?.message).toMatch(/def/)
    expect(issues[0]?.line).toBe(1)
  })

  it('does not ask for a colon on a header spread over several lines', () => {
    expect(pyIssues('def greet(\n    name,\n):\n    return name\n')).toEqual([])
  })

  it('leaves an annotated signature and a one-line body alone', () => {
    expect(pyIssues('def add(a: int, b: int) -> int:\n    return a + b\n')).toEqual([])
    expect(pyIssues('for i in range(3):\n    print(i)\n')).toEqual([])
    expect(pyIssues('rows = {"a": 1}\nlabel = rows["a"]\nprint(label)\n')).toEqual([])
  })

  it('teaches == in a condition rather than repeating the parse error', () => {
    const issues = pyIssues('flag = True\nif flag = True:\n    print("yes")\n')
    expect(issues[0]?.message).toMatch(/==/)
    expect(issues[0]?.line).toBe(2)
    expect(issues.some((i) => /not valid/.test(i.message))).toBe(false)
  })

  it('keeps a keyword argument and a walrus out of the == warning', () => {
    expect(pyIssues('def f(x=1):\n    return x\n\n\nif f(x=2) > 1:\n    print("ok")\n')).toEqual([])
    expect(pyIssues('values = [1, 2]\nif (n := len(values)) > 1:\n    print(n)\n')).toEqual([])
  })

  it('explains a python 2 print statement', () => {
    const issues = pyIssues('print "hello"\n')
    expect(issues[0]?.message).toMatch(/print\("hello"\)|function in Python 3/)
  })

  it('treats a half-typed last line as unfinished, not wrong', () => {
    const issues = pyIssues('total = 3 + 4\nif total >')
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.every((i) => i.incomplete)).toBe(true)
  })

  it('ignores python keywords inside comments and strings', () => {
    expect(pyIssues('note = "if flag = 1"\n# def broken(\nprint(note)\n')).toEqual([])
  })
})

describe('player-v1 diagnostics', () => {
  const ctx = { language: 'javascript' as const, api: 'player-v1' as const }

  it('treats Player.move( as an incomplete call, not a raw syntax error', () => {
    const issues = collectIssues(js('Player.move(\n'), ctx)
    expect(issues.length).toBeGreaterThan(0)
    expect(issues[0]?.incomplete).toBe(true)
    expect(issues[0]?.message).toMatch(/Incomplete move\(\)/)
    expect(issues[0]?.message).toMatch(/closing parenthesis/)
    expect(issues.some((i) => i.message === 'Syntax error')).toBe(false)
  })

  it('says move is a function when parentheses are missing', () => {
    const issues = collectIssues(js('Player.move\n'), ctx)
    expect(issues[0]?.incomplete).toBe(false)
    expect(issues[0]?.message).toMatch(/move is a function/)
    expect(issues[0]?.message).toContain('Player.move("east")')
  })

  it('softens empty Player.move() as still typing', () => {
    const issues = collectIssues(js('Player.move()\n'), ctx)
    expect(issues[0]?.incomplete).toBe(true)
    expect(issues[0]?.message).toMatch(/needs an argument/)
  })

  it('accepts a finished valid call', () => {
    expect(collectIssues(js('Player.move("south")\n'), ctx)).toEqual([])
  })

  it('explains an invalid direction', () => {
    const issues = collectIssues(js('Player.move("up")\n'), ctx)
    expect(issues[0]?.incomplete).toBe(false)
    expect(issues[0]?.message).toMatch(/north/)
    expect(issues[0]?.message).toMatch(/south/)
  })

  it('ignores Player calls inside comments and strings', () => {
    const commented = collectIssues(js('Player.move("south")\n// Player.jump()\n'), ctx)
    expect(commented.some((i) => /jump/.test(i.message))).toBe(false)
    const quoted = collectIssues(js('const s = "Player.jump()"\nPlayer.move("east")\n'), ctx)
    expect(quoted.some((i) => /jump/.test(i.message))).toBe(false)
  })
})

describe('player-v1 completions', () => {
  it('suggests methods after Player.', () => {
    const result = complete('Player.')
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['move', 'rotate', 'scale', 'say']))
    expect(result?.options.find((o) => o.label === 'move')?.info).toMatch(/Walk one cell/)
  })

  it('suggests direction strings with teaching blurbs', () => {
    const result = complete('Player.move(')
    const east = result?.options.find((o) => o.label === '"east"')
    expect(east?.detail).toBe('direction')
    expect(String(east?.info)).toMatch(/x increases/)
  })

  it('does not offer await to a python learner', () => {
    const state = EditorState.create({ doc: 'Player.', extensions: [python()] })
    const ctx = new CompletionContext(state, state.doc.length, true)
    const jsWait = playerCompletionSource(ctx, 'javascript')?.options.find((o) => o.label === 'wait')
    const pyWait = playerCompletionSource(ctx, 'python')?.options.find((o) => o.label === 'wait')
    expect(String(jsWait?.info)).toContain('await')
    expect(String(pyWait?.info)).not.toContain('await')
    expect(String(pyWait?.info)).toContain('Player.wait(2)')
  })
})

function domComplete(doc: string, selectors: string[] = [], explicit = true, html = '') {
  const state = EditorState.create({
    doc,
    extensions: [javascript(), javascriptLanguage.data.of({ autocomplete: (ctx) => domCompletionSource(ctx, selectors, html) })]
  })
  return domCompletionSource(new CompletionContext(state, doc.length, explicit), selectors, html)
}

describe('dom-v1 completions', () => {
  it('suggests document and querySelector at the root', () => {
    const result = domComplete('doc', [], false)
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['document', 'document.querySelector']))
  })

  it('suggests document members after document.', () => {
    const result = domComplete('document.')
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['querySelector', 'getElementById', 'createElement', 'body']))
  })

  it('suggests element members after querySelector(...).', () => {
    const result = domComplete('document.querySelector("h1").')
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['textContent', 'innerHTML', 'classList', 'addEventListener']))
    expect(labels).not.toEqual(expect.arrayContaining(['checked', 'value', 'disabled']))
  })

  it('keeps form members on an input', () => {
    const result = domComplete('document.querySelector("input").')
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['value', 'checked', 'disabled', 'textContent']))
  })

  it('resolves #id from the page HTML to a paragraph, not a control', () => {
    const html = '<p id="beacon-name">?</p><input id="q" />'
    expect(kindFromSelector('#beacon-name', html)).toBe('generic')
    const result = domComplete('document.querySelector("#beacon-name").', [], true, html)
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).not.toContain('checked')
    expect(labels).toContain('textContent')
  })

  it('suggests element members on a bound querySelector result', () => {
    const result = domComplete('const heading = document.querySelector("h1")\nheading.')
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['textContent', 'setAttribute']))
  })

  it('suggests page selectors inside querySelector(', () => {
    const result = domComplete('document.querySelector(', ['#beacon-name', '.desk'])
    const labels = result?.options.map((o) => o.label) ?? []
    expect(labels).toEqual(expect.arrayContaining(['"#beacon-name"', '".desk"']))
  })
})

describe('companion files', () => {
  it('shows a module the exercise imports but not the hidden test', () => {
    const shown = companionFiles({
      files: [
        { path: 'files/main.py', role: 'edit' },
        { path: 'files/station.py', role: 'ro', contents: 'NAME = "north ridge"\n' },
        { path: 'files/log.txt', role: 'fixture', contents: 'raw\n' },
        { path: 'files/hidden_test.py', role: 'hidden-test' }
      ]
    }).map((f) => f.path)
    expect(shown).toEqual(['files/station.py', 'files/log.txt'])
  })

  it('leaves the page fixture to the DOM board, which already has a tab for it', () => {
    const shown = companionFiles({
      preview: { kind: 'iframe' },
      files: [
        { path: 'files/index.html', role: 'fixture', contents: '<p>x</p>' },
        { path: 'files/main.js', role: 'edit' }
      ]
    })
    expect(shown).toEqual([])
  })
})

describe('page source inspect', () => {
  const raw =
    '<!doctype html><html><head><style>h1{font-size:22px}.desk{padding:16px}</style></head><body><div class="desk"><p id="beacon-name">?</p></div></body></html>'

  it('pretty-prints markup and extracts CSS', () => {
    const page = inspectPage(raw)
    expect(page.html).toMatch(/<div class="desk">/)
    expect(page.html).toMatch(/\n/)
    expect(page.css).toMatch(/h1 \{/)
    expect(page.css).toMatch(/font-size/)
  })

  it('lists ids, classes, and tags for completions', () => {
    expect(pageSelectors(raw)).toEqual(expect.arrayContaining(['#beacon-name', '.desk', 'p', 'div']))
  })
})

describe('inspectSelectorAt', () => {
  it('reads the selector under a querySelector call', () => {
    const src = 'document.querySelector("h1").textContent = "Signal desk"'
    const hit = inspectSelectorAt(src, src.indexOf('h1'))
    expect(hit).toEqual({ selector: 'h1', all: false })
  })

  it('maps getElementById to an id selector', () => {
    const src = 'document.getElementById("beacon-name")'
    expect(inspectSelectorAt(src, 10)).toEqual({ selector: '#beacon-name', all: false })
  })

  it('follows a bound variable', () => {
    const src = 'const heading = document.querySelector("h1")\nheading.textContent = "x"'
    expect(inspectSelectorAt(src, src.indexOf('heading.'))).toEqual({ selector: 'h1', all: false })
  })
})
