/** `0.2.0` → `0.2.1`. Used by `npm run dist`. */
export function bumpPatch(version: string): string {
  const parts = version.trim().replace(/^v/i, '').split('.')
  const major = Number(parts[0])
  const minor = Number(parts[1])
  const patch = Number(parts[2] ?? 0)
  if (![major, minor, patch].every((n) => Number.isInteger(n) && n >= 0)) {
    throw new Error(`Not MAJOR.MINOR.PATCH: ${version}`)
  }
  return `${major}.${minor}.${patch + 1}`
}

/** `1.4.2` → `1.4`. Used to decide when to show RELEASE_NOTES.md. */
export function minorKey(version: string): string {
  const parts = version.trim().replace(/^v/i, '').split('.')
  const major = parts[0] ?? '0'
  const minor = parts[1] ?? '0'
  return `${major}.${minor}`
}

/** Body of the `## 0.2.0` (or `## 0.2`) section, until the next `## `. */
export function extractMinorNotes(markdown: string, version: string): string {
  const key = minorKey(version)
  const re = new RegExp(`^##\\s+v?${key.replace('.', '\\.')}(?:\\.\\d+)?\\b.*$`, 'im')
  const match = re.exec(markdown)
  if (!match || match.index === undefined) return markdown.trim()
  const from = match.index
  const rest = markdown.slice(from + match[0].length)
  const next = rest.search(/^##\s+/m)
  const body = next === -1 ? rest : rest.slice(0, next)
  return `${match[0].trim()}\n${body.trim()}`.trim()
}
