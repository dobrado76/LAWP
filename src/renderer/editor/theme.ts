import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const highlight = HighlightStyle.define([
  { tag: t.keyword, color: '#2ec4b6' },
  { tag: t.controlKeyword, color: '#2ec4b6' },
  { tag: t.operatorKeyword, color: '#2ec4b6' },
  { tag: t.definitionKeyword, color: '#5eead4' },
  { tag: t.string, color: '#7dce82' },
  { tag: t.special(t.string), color: '#a7e3aa' },
  { tag: t.number, color: '#e07a5f' },
  { tag: t.bool, color: '#e07a5f' },
  { tag: t.null, color: '#e07a5f' },
  { tag: t.comment, color: '#6d7b91', fontStyle: 'italic' },
  { tag: t.lineComment, color: '#6d7b91', fontStyle: 'italic' },
  { tag: t.function(t.variableName), color: '#93c5fd' },
  { tag: t.function(t.propertyName), color: '#93c5fd' },
  { tag: t.definition(t.variableName), color: '#e8edf5' },
  { tag: t.propertyName, color: '#cbd5e1' },
  { tag: t.variableName, color: '#e8edf5' },
  { tag: t.typeName, color: '#fbbf24' },
  { tag: t.className, color: '#fbbf24' },
  { tag: t.operator, color: '#94a3b8' },
  { tag: t.punctuation, color: '#94a3b8' },
  { tag: t.bracket, color: '#93a0b5' },
  { tag: t.paren, color: '#93a0b5' },
  { tag: t.invalid, color: '#e07a5f', textDecoration: 'underline' }
])

export const lawpEditorTheme = [
  EditorView.theme(
    {
      '&': {
        backgroundColor: '#0b0e14',
        color: '#e8edf5',
        fontSize: '13px',
        height: '100%'
      },
      '&.cm-editor': { height: '100%' },
      '&.cm-editor.cm-focused': { outline: 'none' },
      '.cm-scroller': {
        fontFamily: 'var(--mono)',
        lineHeight: '1.55',
        overflow: 'auto'
      },
      '.cm-content': { caretColor: '#2ec4b6', padding: '8px 0' },
      '.cm-gutters': {
        backgroundColor: '#10161f',
        color: '#6d7b91',
        border: 'none',
        borderRight: '1px solid #2a3344'
      },
      '.cm-lineNumbers .cm-gutterElement': { minWidth: '2.4em', padding: '0 8px 0 6px' },
      '.cm-activeLine': { backgroundColor: '#1e253366' },
      '.cm-activeLineGutter': { backgroundColor: '#1e2533', color: '#e8edf5' },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#1b4d4a' },
      '.cm-cursor': { borderLeftColor: '#2ec4b6' },
      '.cm-lintRange-error': { backgroundImage: 'none', borderBottom: '2px wavy #e07a5f' },
      '.cm-lintPoint-error': { borderBottom: '2px solid #e07a5f' },
      '.cm-tooltip-lint': {
        backgroundColor: '#161b26',
        color: '#e8edf5',
        border: '1px solid #2a3344'
      },
      '.cm-tooltip.cm-tooltip-autocomplete': {
        backgroundColor: '#161b26',
        border: '1px solid #2a3344',
        borderRadius: '8px',
        overflow: 'hidden'
      },
      '.cm-tooltip-autocomplete > ul': {
        fontFamily: 'var(--mono)',
        fontSize: '12px'
      },
      '.cm-tooltip-autocomplete > ul > li': {
        padding: '4px 10px',
        lineHeight: '1.4'
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: '#1b4d4a',
        color: '#e8edf5'
      },
      '.cm-completionLabel': { color: '#e8edf5' },
      '.cm-completionDetail': {
        color: '#93a0b5',
        fontStyle: 'normal',
        marginLeft: '8px'
      },
      '.cm-completionInfo': {
        backgroundColor: '#10161f',
        color: '#c5d0e0',
        border: '1px solid #2a3344',
        borderRadius: '8px',
        padding: '8px 10px',
        maxWidth: '240px',
        fontFamily: 'var(--font)',
        fontSize: '12px',
        lineHeight: '1.45'
      },
      '.cm-tooltip-hover': {
        backgroundColor: '#161b26',
        color: '#e8edf5',
        border: '1px solid #2a3344'
      },
      '.cm-playLine': { backgroundColor: '#1b4d4a88' }
    },
    { dark: true }
  ),
  syntaxHighlighting(highlight)
]
