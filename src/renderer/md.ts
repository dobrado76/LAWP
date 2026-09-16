/** Small markdown subset used in Studio and release notes. */

const LANG_LABEL: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  mjs: 'JavaScript',
  py: 'Python',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  text: 'Text',
  output: 'Output',
  plain: 'Text',
  bash: 'Shell',
  sh: 'Shell'
}

/** Code spans and bold only, with no block wrapper, so it can sit mid-sentence. */
export function mdInline(t: string): string {
  return t
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function esc(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
}

function tok(kind: string, text: string): string {
  return `<span class="tok-${kind}">${esc(text)}</span>`
}

const JS_KW =
  /^(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|class|extends|new|this|super|import|export|from|as|async|await|of|in|typeof|instanceof|void|delete|yield|debugger|true|false|null|undefined)$/

const PY_KW =
  /^(def|return|if|elif|else|for|while|break|continue|class|import|from|as|try|except|finally|raise|with|lambda|True|False|None|and|or|not|in|is|pass|yield|async|await|global|nonlocal)$/

/** Syntax-highlight a fenced snippet. Unknown languages still get a readable block. */
export function highlightSnippet(code: string, lang = ''): string {
  const key = lang.trim().toLowerCase()
  if (key === 'text' || key === 'output' || key === 'plain') return esc(code)
  if (key === 'python' || key === 'py') return highlightPython(code)
  if (key === 'html') return highlightHtml(code)
  if (key === 'css') return highlightCss(code)
  return highlightJs(code)
}

function highlightJs(src: string): string {
  let i = 0
  let out = ''
  while (i < src.length) {
    if (src.startsWith('//', i)) {
      const end = src.indexOf('\n', i)
      const j = end < 0 ? src.length : end
      out += tok('cm', src.slice(i, j))
      i = j
      continue
    }
    if (src.startsWith('/*', i)) {
      const end = src.indexOf('*/', i + 2)
      const j = end < 0 ? src.length : end + 2
      out += tok('cm', src.slice(i, j))
      i = j
      continue
    }
    const q = src[i]
    if (q === '"' || q === "'" || q === '`') {
      let j = i + 1
      while (j < src.length) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === q) {
          j += 1
          break
        }
        j += 1
      }
      out += tok('str', src.slice(i, j))
      i = j
      continue
    }
    if (/[0-9]/.test(src[i]!) && (i === 0 || /[^\w$]/.test(src[i - 1]!))) {
      let j = i
      while (j < src.length && /[\d._]/.test(src[j]!)) j += 1
      out += tok('num', src.slice(i, j))
      i = j
      continue
    }
    if (/[A-Za-z_$]/.test(src[i]!)) {
      let j = i
      while (j < src.length && /[\w$]/.test(src[j]!)) j += 1
      const word = src.slice(i, j)
      let k = j
      while (k < src.length && /\s/.test(src[k]!)) k += 1
      if (JS_KW.test(word)) out += tok('kw', word)
      else if (src[k] === '(') out += tok('fn', word)
      else out += esc(word)
      i = j
      continue
    }
    out += esc(src[i]!)
    i += 1
  }
  return out
}

function highlightPython(src: string): string {
  let i = 0
  let out = ''
  while (i < src.length) {
    if (src[i] === '#') {
      const end = src.indexOf('\n', i)
      const j = end < 0 ? src.length : end
      out += tok('cm', src.slice(i, j))
      i = j
      continue
    }
    if (src.startsWith('"""', i) || src.startsWith("'''", i)) {
      const q = src.slice(i, i + 3)
      const end = src.indexOf(q, i + 3)
      const j = end < 0 ? src.length : end + 3
      out += tok('str', src.slice(i, j))
      i = j
      continue
    }
    const q = src[i]
    if (q === '"' || q === "'") {
      let j = i + 1
      while (j < src.length) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === q) {
          j += 1
          break
        }
        j += 1
      }
      out += tok('str', src.slice(i, j))
      i = j
      continue
    }
    if (/[0-9]/.test(src[i]!) && (i === 0 || /[^\w]/.test(src[i - 1]!))) {
      let j = i
      while (j < src.length && /[\d._]/.test(src[j]!)) j += 1
      out += tok('num', src.slice(i, j))
      i = j
      continue
    }
    if (/[A-Za-z_]/.test(src[i]!)) {
      let j = i
      while (j < src.length && /[\w]/.test(src[j]!)) j += 1
      const word = src.slice(i, j)
      let k = j
      while (k < src.length && /\s/.test(src[k]!)) k += 1
      if (PY_KW.test(word)) out += tok('kw', word)
      else if (src[k] === '(') out += tok('fn', word)
      else out += esc(word)
      i = j
      continue
    }
    out += esc(src[i]!)
    i += 1
  }
  return out
}

function highlightHtml(src: string): string {
  return esc(src)
    .replace(/(&lt;\/?)([a-zA-Z][\w:-]*)/g, '$1<span class="tok-kw">$2</span>')
    .replace(/\s([a-zA-Z_:][\w:-]*)=/g, ' <span class="tok-fn">$1</span>=')
    .replace(/="([^"]*)"/g, '=<span class="tok-str">"$1"</span>')
    .replace(/='([^']*)'/g, "=<span class=\"tok-str\">'$1'</span>")
}

function highlightCss(src: string): string {
  let i = 0
  let out = ''
  while (i < src.length) {
    if (src.startsWith('/*', i)) {
      const end = src.indexOf('*/', i + 2)
      const j = end < 0 ? src.length : end + 2
      out += tok('cm', src.slice(i, j))
      i = j
      continue
    }
    out += esc(src[i]!)
    i += 1
  }
  return out
}

function renderFence(lang: string, body: string): string {
  const code = body.replace(/^\n/, '').replace(/\n$/, '')
  const key = lang.trim().toLowerCase()
  const label = LANG_LABEL[key] ?? (key ? key : 'Code')
  return `<figure class="snippet"><figcaption>${esc(label)}</figcaption><pre><code>${highlightSnippet(code, key)}</code></pre></figure>`
}

export type MdAssets = { packId: string; lessonId: string }

const ASSET_SRC = /^assets\/[A-Za-z0-9._-]+$/

function diagramHtml(alt: string, src: string): string {
  const safe = src.trim()
  if (!ASSET_SRC.test(safe)) return `<p>${mdInline(alt)}</p>`
  const cap = alt.trim() ? `<figcaption>${mdInline(alt)}</figcaption>` : ''
  return `<figure class="diagram"><img src="${esc(safe)}" alt="${esc(alt)}" />${cap}</figure>`
}

export function rewritePackImages(html: string, packId: string, lessonId: string): string {
  return html.replace(/src="(assets\/[A-Za-z0-9._-]+)"/g, (_, path: string) => {
    return `src="lawp-pack://${packId}/lessons/${lessonId}/${path}"`
  })
}

function renderBlocks(s: string): string {
  const inline = mdInline
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  const close = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }
  for (const line of s.split('\n')) {
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
    if (image) {
      close()
      out.push(diagramHtml(image[1] ?? '', image[2] ?? ''))
      continue
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      close()
      const n = heading[1]!.length
      out.push(`<h${n}>${inline(heading[2]!)}</h${n}>`)
      continue
    }
    const quote = line.match(/^>\s?(.*)$/)
    if (quote) {
      close()
      out.push(`<blockquote>${inline(quote[1]!)}</blockquote>`)
      continue
    }
    const ul = line.match(/^[-*]\s+(.+)$/)
    if (ul) {
      if (list !== 'ul') {
        close()
        out.push('<ul>')
        list = 'ul'
      }
      out.push(`<li>${inline(ul[1]!)}</li>`)
      continue
    }
    const ol = line.match(/^\d+\.\s+(.+)$/)
    if (ol) {
      if (list !== 'ol') {
        close()
        out.push('<ol>')
        list = 'ol'
      }
      out.push(`<li>${inline(ol[1]!)}</li>`)
      continue
    }
    if (line.trim() === '') {
      close()
      continue
    }
    close()
    out.push(`<p>${inline(line)}</p>`)
  }
  close()
  return out.join('')
}

export function md(s: string, assets?: MdAssets): string {
  const text = s.replaceAll('\r\n', '\n')
  const fence = /```([a-zA-Z0-9_+-]*)[ \t]*\n([\s\S]*?)```/g
  const parts: string[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = fence.exec(text))) {
    if (m.index > last) parts.push(renderBlocks(text.slice(last, m.index)))
    parts.push(renderFence(m[1] ?? '', m[2] ?? ''))
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(renderBlocks(text.slice(last)))
  const html = parts.join('')
  return assets ? rewritePackImages(html, assets.packId, assets.lessonId) : html
}

/** Drop the `## 0.2.0 — date` line; the dialog already titles the minor. */
export function notesBody(markdown: string): string {
  return markdown.replace(/^##\s+[^\n]+\n+/, '').trim()
}

export function notesDate(markdown: string): string | undefined {
  const m = markdown.match(/^##\s+[^\n—–-]+[—–-]\s*(.+)$/m)
  return m?.[1]?.trim()
}
