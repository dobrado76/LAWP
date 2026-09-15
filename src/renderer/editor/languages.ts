import { javascript, javascriptLanguage } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { python, pythonLanguage } from '@codemirror/lang-python'
import type { Extension } from '@codemirror/state'
import type { EditorApi } from './apis'
import { apiCompletionSource } from './completions'

export const EDITOR_LANGUAGES = ['javascript', 'python', 'json', 'plaintext'] as const
export type EditorLanguage = (typeof EDITOR_LANGUAGES)[number]

const LABELS: Record<EditorLanguage, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  json: 'JSON',
  plaintext: 'Plain text'
}

export function languageLabel(lang: EditorLanguage): string {
  return LABELS[lang]
}

export function languageFromEngine(engine?: string, path?: string): EditorLanguage {
  const ext = path?.split('.').pop()?.toLowerCase()
  if (ext === 'json') return 'json'
  if (ext === 'py') return 'python'
  if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx' || ext === 'mjs') return 'javascript'
  if (engine === 'python') return 'python'
  if (engine === 'javascript' || engine === 'react') return 'javascript'
  return 'plaintext'
}

export function languageExtension(lang: EditorLanguage, api?: EditorApi): Extension {
  const complete = apiCompletionSource(api)
  if (lang === 'python') {
    return complete
      ? [python(), pythonLanguage.data.of({ autocomplete: complete })]
      : python()
  }
  if (lang === 'json') return json()
  if (lang === 'javascript') {
    return complete
      ? [javascript({ jsx: true }), javascriptLanguage.data.of({ autocomplete: complete })]
      : javascript({ jsx: true })
  }
  return []
}
