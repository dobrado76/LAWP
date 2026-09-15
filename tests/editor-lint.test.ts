import { CompletionContext } from '@codemirror/autocomplete'
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { domCompletionSource, playerCompletionSource } from '../src/renderer/editor/completions'
import { languageFromEngine, languageLabel } from '../src/renderer/editor/languages'
import { inspectPage, pageSelectors } from '../src/renderer/editor/pageSource'
import { collectIssues, collectSyntaxIssues, teachParseMessage } from '../src/renderer/editor/lint'

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
})

function domComplete(doc: string, selectors: string[] = [], explicit = true) {
  const state = EditorState.create({
    doc,
    extensions: [javascript(), javascriptLanguage.data.of({ autocomplete: (ctx) => domCompletionSource(ctx, selectors) })]
  })
  return domCompletionSource(new CompletionContext(state, doc.length, explicit), selectors)
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
