import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { python, pythonLanguage } from '@codemirror/lang-python'
import type { Extension } from '@codemirror/state'
import type { EditorApi } from './apis'
import { apiCompletionSource, type DomCompleteOpts } from './completions'

export const EDITOR_LANGUAGES = ['javascript', 'python', 'json', 'html', 'css', 'plaintext'] as const
export type EditorLanguage = (typeof EDITOR_LANGUAGES)[number]

const LABELS: Record<EditorLanguage, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  plaintext: 'Plain text'
}

export function languageLabel(lang: EditorLanguage, api?: EditorApi): string {
  if (lang === 'javascript' && api === 'dom-v1') return 'JavaScript · DOM'
  if (lang === 'javascript' && api === 'player-v1') return 'JavaScript · Player'
  return LABELS[lang]
}

export function languageFromEngine(engine?: string, path?: string): EditorLanguage {
  const ext = path?.split('.').pop()?.toLowerCase()
  if (ext === 'json') return 'json'
  if (ext === 'py') return 'python'
  if (ext === 'html' || ext === 'htm') return 'html'
  if (ext === 'css') return 'css'
  if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx' || ext === 'mjs') return 'javascript'
  if (engine === 'python') return 'python'
  if (engine === 'javascript' || engine === 'react') return 'javascript'
  return 'plaintext'
}

export function languageExtension(lang: EditorLanguage, api?: EditorApi, extras?: DomCompleteOpts): Extension {
  const complete = apiCompletionSource(api, extras)
  if (lang === 'python') {
    return complete
      ? [python(), pythonLanguage.data.of({ autocomplete: complete })]
      : python()
  }
  if (lang === 'json') return json()
  if (lang === 'html') return html()
  if (lang === 'css') return css()
  if (lang === 'javascript') {
    return complete
      ? [javascript({ jsx: true }), javascriptLanguage.data.of({ autocomplete: complete })]
      : javascript({ jsx: true })
  }
  return []
}
