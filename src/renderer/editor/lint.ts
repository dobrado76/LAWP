import { syntaxTree } from '@codemirror/language'
import { linter, type Diagnostic } from '@codemirror/lint'
import type { EditorState } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import * as acorn from 'acorn'
import { PLAYER_DIRS, PLAYER_METHODS, type EditorApi } from './apis'
import type { EditorLanguage } from './languages'

/** Wait until the learner pauses before showing unfinished-expression tips. */
export const LINT_PAUSE_MS = 800

export type EditorIssue = {
  from: number
  to: number
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  /** True for mid-typing states such as `Player.move(`. Hide until pause. */
  incomplete: boolean
}

export type LintContext = {
  language: EditorLanguage
  api?: EditorApi
}

function at(
  state: EditorState,
  from: number,
  to: number,
  message: string,
  opts: { severity?: EditorIssue['severity']; incomplete?: boolean } = {}
): EditorIssue {
  const start = Math.max(0, Math.min(from, state.doc.length))
  let end = Math.max(start, Math.min(to, state.doc.length))
  if (end === start && start < state.doc.length) end = start + 1
  const line = state.doc.lineAt(start)
  return {
    from: start,
    to: end,
    line: line.number,
    column: start - line.from + 1,
    message,
    severity: opts.severity ?? 'error',
    incomplete: opts.incomplete === true
  }
}

function scanCallArgs(src: string, openEnd: number): { closed: boolean; inner: string; closeAt: number } {
  let depth = 1
  let quote: string | null = null
  let i = openEnd
  while (i < src.length) {
    const c = src[i]!
    if (quote) {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === quote) quote = null
      i += 1
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      i += 1
      continue
    }
    if (c === '(') depth += 1
    if (c === ')') {
      depth -= 1
      if (depth === 0) return { closed: true, inner: src.slice(openEnd, i), closeAt: i }
    }
    i += 1
  }
  return { closed: false, inner: src.slice(openEnd), closeAt: src.length }
}

function lastOpenKind(src: string): '(' | '[' | '{' | null {
  const stack: Array<'(' | '[' | '{'> = []
  let quote: string | null = null
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i]!
    if (quote) {
      if (c === '\\' && quote.length === 1) {
        i += 1
        continue
      }
      if (src.startsWith(quote, i)) {
        i += quote.length - 1
        quote = null
      }
      continue
    }
    if (c === '#' ) {
      const nl = src.indexOf('\n', i)
      if (nl === -1) break
      i = nl
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      continue
    }
    if (c === '(' || c === '[' || c === '{') stack.push(c)
    if (c === ')' || c === ']' || c === '}') stack.pop()
  }
  return stack[stack.length - 1] ?? null
}

export function teachParseMessage(raw: string, src: string): { message: string; incomplete: boolean } {
  if (/unterminated string/i.test(raw)) {
    return { message: 'Unclosed string — add a matching quote.', incomplete: true }
  }
  const open = lastOpenKind(src)
  if (/unexpected (end of input|eof|token)|unterminated/i.test(raw) && open === '(') {
    return {
      message: 'Incomplete function call — expected an argument or a closing parenthesis.',
      incomplete: true
    }
  }
  if (/unexpected (end of input|eof)|unterminated/i.test(raw) && open === '{') {
    return { message: 'Incomplete block — add a closing }.', incomplete: true }
  }
  if (/unexpected (end of input|eof)|unterminated/i.test(raw) && open === '[') {
    return { message: 'Incomplete list — add a closing ].', incomplete: true }
  }
  if (/unexpected (end of input|eof)/i.test(raw)) {
    return { message: 'This line is unfinished — finish the statement, then pause.', incomplete: true }
  }
  if (/unexpected token/i.test(raw)) {
    return {
      message: 'Unexpected token — check for a missing ), ", or comma nearby.',
      incomplete: false
    }
  }
  const cleaned = raw.replace(/\s*\(\d+:\d+\)\s*$/, '').trim()
  return { message: cleaned || 'Syntax problem — check quotes and parentheses.', incomplete: false }
}

function javascriptParseIssues(state: EditorState): EditorIssue[] {
  const src = state.doc.toString()
  if (!src.trim()) return []
  try {
    acorn.parse(src, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      allowHashBang: true
    })
    return []
  } catch (e) {
    const err = e as { message?: string; pos?: number }
    const pos = typeof err.pos === 'number' ? err.pos : state.doc.length
    const taught = teachParseMessage(String(err.message ?? 'Syntax error'), src)
    return [at(state, pos, pos + 1, taught.message, { incomplete: taught.incomplete })]
  }
}

function jsonParseIssues(state: EditorState): EditorIssue[] {
  const src = state.doc.toString()
  if (!src.trim()) return []
  try {
    JSON.parse(src)
    return []
  } catch (e) {
    const msg = String((e as Error).message ?? 'Invalid JSON')
    const m = msg.match(/position\s+(\d+)/i)
    const pos = m ? Number(m[1]) : state.doc.length
    const incomplete = /end of (data|json|input)|unterminated|unexpected end/i.test(msg)
    return [
      at(
        state,
        pos,
        pos + 1,
        incomplete
          ? 'Incomplete JSON — add the missing quote, comma, }, or ].'
          : `Invalid JSON — ${msg}.`,
        { incomplete }
      )
    ]
  }
}

function unclosedIssues(state: EditorState): EditorIssue[] {
  const src = state.doc.toString()
  const stack: { ch: string; pos: number }[] = []
  let quote: string | null = null
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    const prev = src[i - 1]
    if (quote) {
      if (c === '\\' && quote !== "'''" && quote !== '"""') {
        i += 2
        continue
      }
      if (src.startsWith(quote, i)) {
        i += quote.length
        quote = null
        continue
      }
      i += 1
      continue
    }
    if (c === '#') {
      const nl = src.indexOf('\n', i)
      i = nl === -1 ? src.length : nl + 1
      continue
    }
    if ((c === '"' || c === "'") && prev !== '\\') {
      if (src.startsWith('"""', i)) {
        quote = '"""'
        i += 3
        continue
      }
      if (src.startsWith("'''", i)) {
        quote = "'''"
        i += 3
        continue
      }
      quote = c
      i += 1
      continue
    }
    if (c === '(' || c === '[' || c === '{') stack.push({ ch: c, pos: i })
    if (c === ')' || c === ']' || c === '}') {
      const open = c === ')' ? '(' : c === ']' ? '[' : '{'
      const last = stack[stack.length - 1]
      if (last?.ch === open) stack.pop()
      else return [at(state, i, i + 1, `Unexpected ${c} — it has no matching opener.`)]
    }
    i += 1
  }
  if (quote) {
    return [at(state, src.length, src.length, 'Unclosed string — add a matching quote.', { incomplete: true })]
  }
  const last = stack[stack.length - 1]
  if (last) {
    if (last.ch === '(') {
      return [
        at(state, last.pos, last.pos + 1, 'Incomplete function call — expected an argument or a closing parenthesis.', {
          incomplete: true
        })
      ]
    }
    const close = last.ch === '[' ? ']' : '}'
    return [at(state, last.pos, last.pos + 1, `Incomplete ${last.ch === '[' ? 'list' : 'block'} — add a closing ${close}.`, { incomplete: true })]
  }
  return []
}

function lezerIssues(state: EditorState): EditorIssue[] {
  const issues: EditorIssue[] = []
  syntaxTree(state).iterate({
    enter(node) {
      if (!node.type.isError) return
      issues.push(
        at(state, node.from, Math.max(node.to, node.from + 1), 'Something here is not valid — check spelling, quotes, and parentheses.')
      )
    }
  })
  return issues
}

function playerApiIssues(state: EditorState): EditorIssue[] {
  const src = state.doc.toString()
  const issues: EditorIssue[] = []
  const call = /\bPlayer\.([A-Za-z_]\w*)\s*(\()?/g
  let m: RegExpExecArray | null
  while ((m = call.exec(src))) {
    const name = m[1]!
    const from = m.index
    const identTo = from + m[0].length
    const method = PLAYER_METHODS[name]
    if (!method) {
      const known = Object.keys(PLAYER_METHODS).join(', ')
      issues.push(at(state, from, identTo, `Player has no method "${name}". Try ${known}.`))
      continue
    }
    if (!m[2]) {
      issues.push(at(state, from, identTo, `${name} is a function. Call it like ${method.sample}.`))
      continue
    }
    const args = scanCallArgs(src, from + m[0].length)
    if (!args.closed) {
      issues.push(
        at(state, from, Math.max(identTo, args.closeAt), `Incomplete ${name}() — expected ${method.args} or a closing parenthesis.`, {
          severity: 'warning',
          incomplete: true
        })
      )
      continue
    }
    if (!args.inner.trim()) {
      issues.push(
        at(state, from, args.closeAt + 1, `${name} needs an argument: ${method.args}.`, {
          severity: 'warning',
          incomplete: true
        })
      )
      continue
    }
    if (name === 'move') {
      const arg = args.inner.match(/^\s*["']([^"']*)["']\s*$/)
      if (arg && !PLAYER_DIRS.includes(arg[1] as (typeof PLAYER_DIRS)[number])) {
        const innerStart = from + m[0].length + args.inner.indexOf(arg[1]!)
        issues.push(
          at(
            state,
            innerStart,
            innerStart + arg[1]!.length,
            `move only accepts ${PLAYER_DIRS.map((d) => `"${d}"`).join(', ')}.`
          )
        )
      }
    }
  }
  return issues
}

export function collectIssues(state: EditorState, ctx: LintContext): EditorIssue[] {
  const parse: EditorIssue[] = []
  if (ctx.language === 'javascript') parse.push(...javascriptParseIssues(state))
  else if (ctx.language === 'json') parse.push(...jsonParseIssues(state))
  else if (ctx.language === 'python') {
    const unclosed = unclosedIssues(state)
    parse.push(...unclosed)
    if (unclosed.length === 0) parse.push(...lezerIssues(state))
  } else parse.push(...lezerIssues(state))

  const api = ctx.api === 'player-v1' ? playerApiIssues(state) : []
  const apiLines = new Set(api.map((issue) => issue.line))
  const filteredParse = api.length
    ? parse.filter((issue) => !(issue.incomplete && apiLines.has(issue.line)))
    : parse

  const seen = new Set<string>()
  return [...api, ...filteredParse].filter((issue) => {
    const key = `${issue.line}:${issue.column}:${issue.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** @deprecated use collectIssues */
export function collectSyntaxIssues(state: EditorState, ctx: LintContext = { language: 'javascript' }): EditorIssue[] {
  return collectIssues(state, ctx)
}

export function syntaxLinter(ctx: LintContext) {
  return linter(
    (view: EditorView) =>
      collectIssues(view.state, ctx).map(
        (issue): Diagnostic => ({
          from: issue.from,
          to: issue.to,
          severity: issue.incomplete ? 'warning' : issue.severity,
          message: issue.message
        })
      ),
    { delay: LINT_PAUSE_MS }
  )
}
