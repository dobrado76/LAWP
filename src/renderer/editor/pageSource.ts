const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

export function inspectPage(html: string): { html: string; css: string; selectors: string[] } {
  const cssChunks: string[] = []
  html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, body: string) => {
    const css = String(body).trim()
    if (css) cssChunks.push(css)
    return ''
  })
  return {
    html: prettyMarkup(html),
    css: prettyCss(cssChunks.join('\n\n')),
    selectors: pageSelectors(html)
  }
}

export function pageSelectors(html: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  function add(value: string) {
    if (!value || seen.has(value)) return
    seen.add(value)
    out.push(value)
  }
  for (const m of html.matchAll(/\bid=["']([^"']+)["']/gi)) add(`#${m[1]}`)
  for (const m of html.matchAll(/\bclass=["']([^"']+)["']/gi)) {
    for (const cls of String(m[1]).split(/\s+/)) if (cls) add(`.${cls}`)
  }
  for (const m of html.matchAll(/<([a-z][a-z0-9]*)\b/gi)) add(m[1]!.toLowerCase())
  return out.slice(0, 48)
}

export function prettyCss(css: string): string {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '').trim()
  if (!src) return ''
  const lines: string[] = []
  let depth = 0
  let buf = ''
  for (const ch of src) {
    if (ch === '{') {
      lines.push(`${'  '.repeat(depth)}${buf.trim()} {`)
      buf = ''
      depth += 1
    } else if (ch === '}') {
      if (buf.trim()) lines.push(`${'  '.repeat(depth)}${buf.trim()}`)
      buf = ''
      depth = Math.max(0, depth - 1)
      lines.push(`${'  '.repeat(depth)}}`)
    } else if (ch === ';') {
      lines.push(`${'  '.repeat(depth)}${buf.trim()};`)
      buf = ''
    } else buf += ch
  }
  if (buf.trim()) lines.push(buf.trim())
  return lines.filter((line) => line.trim()).join('\n')
}

export function prettyMarkup(html: string): string {
  const styles: string[] = []
  const marked = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, body: string) => {
    const i = styles.length
    styles.push(prettyCss(String(body)))
    return `<style data-lawp="${i}"></style>`
  })
  const pretty = indentTags(marked)
  return pretty.replace(/<style data-lawp="(\d+)"><\/style>/g, (_, n) => {
    const css = styles[Number(n)] ?? ''
    const inner = css
      ? `\n${css
          .split('\n')
          .map((line) => (line ? `  ${line}` : line))
          .join('\n')}\n`
      : ''
    return `<style>${inner}</style>`
  })
}

function indentTags(html: string): string {
  const parts = html
    .replace(/>(\s*)</g, '>\n<')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  let depth = 0
  const lines: string[] = []
  for (const part of parts) {
    const close = /^<\//.test(part)
    const decl = /^<!/.test(part) || /^<\?/.test(part)
    const tag = part.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/)?.[1]?.toLowerCase() ?? ''
    const self = VOID.has(tag) || /\/>$/.test(part) || decl
    if (close) depth = Math.max(0, depth - 1)
    lines.push(`${'  '.repeat(depth)}${part}`)
    if (!close && !self && /^<[a-zA-Z]/.test(part)) depth += 1
  }
  return lines.join('\n')
}
