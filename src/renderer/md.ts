/** Small markdown subset used in Studio and release notes. */
/** Code spans and bold only, with no block wrapper, so it can sit mid-sentence. */
export function mdInline(t: string): string {
  return t
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function md(s: string): string {
  const inline = mdInline
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  const close = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }
  for (const line of s.replaceAll('\r\n', '\n').split('\n')) {
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

/** Drop the `## 0.2.0 — date` line; the dialog already titles the minor. */
export function notesBody(markdown: string): string {
  return markdown.replace(/^##\s+[^\n]+\n+/, '').trim()
}

export function notesDate(markdown: string): string | undefined {
  const m = markdown.match(/^##\s+[^\n—–-]+[—–-]\s*(.+)$/m)
  return m?.[1]?.trim()
}
