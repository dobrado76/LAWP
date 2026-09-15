import { relative, resolve, sep } from 'node:path'

export function isInside(root: string, candidate: string): boolean {
  const rel = relative(resolve(root), resolve(candidate))
  return rel === '' || (!rel.startsWith('..') && !rel.includes(`..${sep}`))
}

export function safeJoin(root: string, ...parts: string[]): string | null {
  const joined = resolve(root, ...parts)
  if (!isInside(root, joined)) return null
  return joined
}
