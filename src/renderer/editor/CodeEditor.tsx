import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language'
import { lintGutter } from '@codemirror/lint'
import { Compartment, EditorState } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  type ViewUpdate
} from '@codemirror/view'
import { useEffect, useRef, useState } from 'react'
import {
  languageExtension,
  languageFromEngine,
  languageLabel,
  type EditorLanguage
} from './languages'
import type { EditorApi } from './apis'
import { inspectSelectorAt, type InspectHit } from './domKind'
import { collectIssues, LINT_PAUSE_MS, syntaxLinter, type EditorIssue } from './lint'
import { lawpEditorTheme } from './theme'

export type { EditorIssue, EditorLanguage }

type Props = {
  value: string
  onChange: (next: string) => void
  language?: EditorLanguage | string
  engine?: string
  path?: string
  highlightLine?: number
  readOnly?: boolean
  api?: EditorApi
  selectors?: string[]
  pageHtml?: string
  onInspect?: (hit: InspectHit | null) => void
}

const playLine = new Compartment()
const playMark = Decoration.line({ class: 'cm-playLine' })

function playLineExt(line?: number) {
  return EditorView.decorations.compute(['doc'], (state) => {
    if (!line || line < 1 || line > state.doc.lines) return Decoration.none
    return Decoration.set([playMark.range(state.doc.line(line).from)])
  })
}

export function CodeEditor({ value, onChange, language, engine, path, highlightLine, readOnly, api, selectors, pageHtml, onInspect }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onInspectRef = useRef(onInspect)
  onInspectRef.current = onInspect
  const [issues, setIssues] = useState<EditorIssue[]>([])
  const lang = (EDITOR_LANG_SET.has(language as EditorLanguage)
    ? language
    : languageFromEngine(engine, path)) as EditorLanguage
  const lintCtx = { language: lang, api }
  const lintCtxRef = useRef(lintCtx)
  lintCtxRef.current = lintCtx
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showHardIssues(state: EditorState) {
    setIssues(collectIssues(state, lintCtxRef.current).filter((issue) => !issue.incomplete))
  }

  function showAllIssues(state: EditorState) {
    setIssues(collectIssues(state, lintCtxRef.current))
  }

  function schedulePausedLint(state: EditorState) {
    showHardIssues(state)
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => {
      const view = viewRef.current
      if (view) showAllIssues(view.state)
    }, LINT_PAUSE_MS)
  }

  useEffect(() => {
    if (!host.current) return
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          foldGutter(),
          history(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          keymap.of([...closeBracketsKeymap, ...completionKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          languageExtension(lang, api, { selectors, html: pageHtml }),
          lawpEditorTheme,
          lintGutter(),
          syntaxLinter(lintCtx),
          autocompletion({ activateOnTyping: true }),
          playLine.of(playLineExt(highlightLine)),
          EditorState.readOnly.of(readOnly === true),
          EditorView.updateListener.of((u: ViewUpdate) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString())
            if (u.docChanged) schedulePausedLint(u.state)
            if ((u.docChanged || u.selectionSet) && api === 'dom-v1') {
              const pos = u.state.selection.main.head
              onInspectRef.current?.(inspectSelectorAt(u.state.doc.toString(), pos))
            }
          })
        ]
      })
    })
    viewRef.current = view
    showHardIssues(view.state)
    schedulePausedLint(view.state)
    if (api === 'dom-v1') {
      onInspectRef.current?.(inspectSelectorAt(view.state.doc.toString(), view.state.selection.main.head))
    }
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current)
      view.destroy()
      viewRef.current = null
    }
    // language / readOnly / api recreate; value is synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, readOnly, api, selectors?.join('\0'), pageHtml])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    if (view.state.doc.toString() === value) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value }
    })
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: playLine.reconfigure(playLineExt(highlightLine)) })
  }, [highlightLine])

  function goTo(issue: EditorIssue) {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      selection: { anchor: issue.from, head: issue.to },
      scrollIntoView: true
    })
    view.focus()
  }

  const first = issues[0]
  const tone = !first ? 'is-ok' : first.incomplete ? 'is-hint' : 'is-error'
  return (
    <div className="code-editor">
      <div className="code-host" ref={host} />
      <button
        type="button"
        className={`code-status ${tone}`}
        onClick={() => first && goTo(first)}
        disabled={!first}
      >
        <span className="code-lang">{languageLabel(lang, api)}</span>
        {readOnly ? (
          <span>Read only — page source</span>
        ) : first ? (
          <span>
            Line {first.line}:{first.column} · {first.message}
            {issues.length > 1 ? ` · ${issues.length} issues` : ''}
          </span>
        ) : (
          <span>No issues</span>
        )}
      </button>
    </div>
  )
}

const EDITOR_LANG_SET = new Set<EditorLanguage>(['javascript', 'python', 'json', 'html', 'css', 'plaintext'])
