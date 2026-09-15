import AdmZip from 'adm-zip'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { packManifestSchema } from '@shared/schemas/pack'
import { lessonSchema } from '@shared/schemas/lesson'
import { bundledPacksRoot, userPacksRoot } from '../paths'
import { isInside } from '../security/paths'
import { resolvePack, type ResolvedPack } from './resolve'
import { revokeTrust } from '../settings/store'

const MAX_ENTRIES = 4000
const MAX_UNCOMPRESSED = 80 * 1024 * 1024

function assertSafeZip(zip: AdmZip, dest: string): void {
  const entries = zip.getEntries()
  if (entries.length > MAX_ENTRIES) throw Object.assign(new Error('Too many zip entries'), { code: 'zip-unsafe' })
  let total = 0
  for (const e of entries) {
    const name = e.entryName.replaceAll('\\', '/')
    if (name.includes('..') || name.startsWith('/') || /^[a-zA-Z]:/.test(name)) {
      throw Object.assign(new Error('Unsafe zip path'), { code: 'zip-unsafe' })
    }
    total += e.header.size
    if (total > MAX_UNCOMPRESSED) throw Object.assign(new Error('Zip too large'), { code: 'zip-unsafe' })
  }
  zip.extractAllTo(dest, true)
  const walk = (dir: string): void => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name)
      if (!isInside(dest, p)) throw Object.assign(new Error('Zip slipped'), { code: 'zip-unsafe' })
      if (ent.isDirectory()) walk(p)
    }
  }
  walk(dest)
}

function findKindRoot(extracted: string): { kind: 'pack' | 'lesson'; root: string } {
  const tryDir = (dir: string): { kind: 'pack' | 'lesson'; root: string } | null => {
    if (existsSync(join(dir, 'pack.json'))) return { kind: 'pack', root: dir }
    if (existsSync(join(dir, 'lesson.json'))) return { kind: 'lesson', root: dir }
    return null
  }
  const top = tryDir(extracted)
  if (top) return top
  const kids = readdirSync(extracted, { withFileTypes: true }).filter((e) => e.isDirectory())
  if (kids.length === 1 && kids[0]) {
    const inner = tryDir(join(extracted, kids[0].name))
    if (inner) return inner
  }
  throw Object.assign(new Error('Zip is not a pack or lesson cartridge'), { code: 'zip-invalid' })
}

export type ImportResult = {
  kind: 'pack' | 'lesson'
  packId: string
  lessonId?: string
  overlay: boolean
}

export function importZipFile(zipPath: string, replace: boolean): ImportResult {
  const tmp = mkdtempSync(join(tmpdir(), 'lawp-zip-'))
  try {
    const zip = new AdmZip(zipPath)
    assertSafeZip(zip, tmp)
    const found = findKindRoot(tmp)
    mkdirSync(userPacksRoot(), { recursive: true })
    if (found.kind === 'pack') {
      const manifest = packManifestSchema.parse(JSON.parse(readFileSync(join(found.root, 'pack.json'), 'utf8')))
      const dest = join(userPacksRoot(), manifest.id)
      if (existsSync(dest) && !replace) {
        throw Object.assign(new Error('Cartridge already exists'), { code: 'cartridge-conflict' })
      }
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
      cpSync(found.root, dest, { recursive: true })
      const overlayFalse = { ...manifest, overlay: false }
      writeFileSync(join(dest, 'pack.json'), JSON.stringify(overlayFalse, null, 2), 'utf8')
      revokeTrust(manifest.id)
      return { kind: 'pack', packId: manifest.id, overlay: false }
    }
    const lesson = lessonSchema.parse(JSON.parse(readFileSync(join(found.root, 'lesson.json'), 'utf8')))
    const packId = lesson.packId
    const destPack = join(userPacksRoot(), packId)
    const fromBundled = existsSync(join(bundledPacksRoot(), packId, 'pack.json'))
    mkdirSync(join(destPack, 'lessons'), { recursive: true })
    const destLesson = join(destPack, 'lessons', lesson.id)
    if (existsSync(destLesson) && !replace) {
      throw Object.assign(new Error('Lesson already exists'), { code: 'cartridge-conflict' })
    }
    if (existsSync(destLesson)) rmSync(destLesson, { recursive: true, force: true })
    cpSync(found.root, destLesson, { recursive: true })
    const userPackJson = join(destPack, 'pack.json')
    if (!existsSync(userPackJson)) {
      if (fromBundled) {
        writeFileSync(
          userPackJson,
          JSON.stringify({ kind: 'pack', schemaVersion: 1, id: packId, title: lesson.packTitle ?? packId, description: '', subjects: [], engines: ['none'], overlay: true, version: '0.0.0', locale: 'en', authors: [], tracks: [] }, null, 2),
          'utf8'
        )
        return { kind: 'lesson', packId, lessonId: lesson.id, overlay: true }
      }
      writeFileSync(
        userPackJson,
        JSON.stringify({
          kind: 'pack',
          schemaVersion: 1,
          id: packId,
          title: lesson.packTitle ?? packId,
          description: '',
          subjects: [],
          engines: lesson.engines ?? ['none'],
          overlay: false,
          capabilities: { execute: 'none', network: false },
          version: '0.0.1',
          locale: 'en',
          authors: [],
          tracks: []
        }, null, 2),
        'utf8'
      )
      return { kind: 'lesson', packId, lessonId: lesson.id, overlay: false }
    }
    const existing = packManifestSchema.parse(JSON.parse(readFileSync(userPackJson, 'utf8')))
    return { kind: 'lesson', packId, lessonId: lesson.id, overlay: existing.overlay !== false && fromBundled }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

function addResolvedTree(zip: AdmZip, pack: ResolvedPack): void {
  const manifest = { ...pack.manifest, overlay: false }
  zip.addFile('pack.json', Buffer.from(JSON.stringify(manifest, null, 2)))
  const copyDir = (abs: string, zipPrefix: string): void => {
    if (!existsSync(abs)) return
    for (const ent of readdirSync(abs, { withFileTypes: true })) {
      const from = join(abs, ent.name)
      const to = `${zipPrefix}${ent.name}`.replaceAll('\\', '/')
      if (ent.isDirectory()) copyDir(from, `${to}/`)
      else zip.addLocalFile(from, zipPrefix.replace(/\/$/, '') || undefined, ent.name)
    }
  }
  const sidecarRoot = pack.source === 'user' ? pack.root : pack.root
  for (const name of ['skills.json', 'misconceptions.json']) {
    const p = join(sidecarRoot, name)
    if (existsSync(p)) zip.addLocalFile(p, '', name)
  }
  for (const dir of ['tracks', 'courses', 'creations']) {
    const p = join(sidecarRoot, dir)
    if (existsSync(p)) copyDir(p, `${dir}/`)
  }
  for (const lesson of pack.lessons) {
    copyDir(lesson.folder, `lessons/${lesson.id}/`)
  }
}

export function exportResolvedPack(pack: ResolvedPack, destZip: string): void {
  const zip = new AdmZip()
  addResolvedTree(zip, pack)
  zip.writeZip(destZip)
}

export function exportLessonFolder(lessonFolder: string, destZip: string): void {
  const zip = new AdmZip()
  const rootName = basename(lessonFolder)
  const walk = (dir: string, prefix: string): void => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const from = join(dir, ent.name)
      if (ent.isDirectory()) walk(from, `${prefix}${ent.name}/`)
      else zip.addLocalFile(from, prefix.replace(/\/$/, '') || undefined, ent.name)
    }
  }
  walk(lessonFolder, `${rootName}/`)
  zip.writeZip(destZip)
}
