import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { ResolvedPack } from './resolve'

function walkFiles(root: string, dir = root, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) walkFiles(root, p, acc)
    else acc.push(p)
  }
  return acc
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(',')}]`
  const obj = value as Record<string, unknown>
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(',')}}`
}

export function executableFingerprint(pack: ResolvedPack): string {
  const lessons: Record<string, unknown> = {}
  for (const lesson of [...pack.lessons].sort((a, b) => a.id.localeCompare(b.id))) {
    const codeBlocks = (lesson.raw.blocks as unknown[])
      .filter((b) => {
        const t = (b as { type?: string }).type
        return t === 'code' || t === 'debug' || t === 'project'
      })
      .map((b) => {
        const block = b as {
          type: string
          engine?: string
          files?: { path: string; role: string }[]
          checks?: unknown
          entry?: string
        }
        return {
          type: block.type,
          engine: block.engine,
          entry: block.entry,
          files: (block.files ?? []).map((f) => ({ path: f.path, role: f.role })),
          checks: block.checks
        }
      })
    const fileHashes: Record<string, string> = {}
    const filesDir = join(lesson.folder, 'files')
    if (existsSync(filesDir)) {
      for (const f of walkFiles(filesDir).sort()) {
        const rel = relative(lesson.folder, f).replaceAll('\\', '/')
        fileHashes[rel] = createHash('sha256').update(readFileSync(f)).digest('hex')
      }
    }
    lessons[lesson.id] = {
      id: lesson.id,
      taskRev: lesson.raw.taskRev,
      blocks: codeBlocks,
      files: fileHashes
    }
  }
  const payload = {
    packId: pack.manifest.id,
    engines: pack.manifest.engines,
    capabilities: pack.manifest.capabilities ?? { execute: 'none', network: false },
    lessons
  }
  return createHash('sha256').update(stableStringify(payload)).digest('hex')
}

export function declaredExecute(pack: ResolvedPack): 'none' | 'python' | 'javascript' | 'react' {
  const fromCaps = pack.manifest.capabilities?.execute
  const used = new Set<'python' | 'javascript' | 'react'>()
  for (const lesson of pack.lessons) {
    for (const b of lesson.raw.blocks as { type?: string; engine?: string }[]) {
      if ((b.type === 'code' || b.type === 'debug' || b.type === 'project') && (b.engine === 'python' || b.engine === 'javascript' || b.engine === 'react')) {
        used.add(b.engine)
      }
    }
  }
  const inferred = [...used]
  if (inferred.length === 0) return fromCaps ?? 'none'
  if (fromCaps === 'none') return inferred[0] ?? 'none'
  return fromCaps ?? inferred[0] ?? 'none'
}

export function capabilitiesAgree(pack: ResolvedPack): { ok: boolean; message?: string } {
  const used = new Set<string>()
  for (const lesson of pack.lessons) {
    for (const b of lesson.raw.blocks as { type?: string; engine?: string }[]) {
      if ((b.type === 'code' || b.type === 'debug' || b.type === 'project') && b.engine && b.engine !== 'none') {
        used.add(b.engine)
      }
    }
  }
  const execute = pack.manifest.capabilities?.execute ?? (used.size ? [...used][0] : 'none')
  if (used.size > 0 && execute === 'none') {
    return { ok: false, message: 'capabilities.execute is none but lessons include code engines' }
  }
  if (used.size === 0 && execute && execute !== 'none') {
    return { ok: false, message: 'capabilities.execute advertises a code engine but no lesson uses it' }
  }
  if (used.size > 0 && execute && !used.has(execute) && execute !== 'none') {
    return { ok: false, message: `capabilities.execute is ${execute} but lessons use ${[...used].join(',')}` }
  }
  return { ok: true }
}

export function isBundledUnmodified(pack: ResolvedPack): boolean {
  return pack.source === 'bundled'
}
