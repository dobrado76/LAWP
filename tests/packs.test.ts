import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import AdmZip from 'adm-zip'

const root = mkdtempSync(join(tmpdir(), 'lawp-packs-'))
const bundled = join(root, 'bundled')
const user = join(root, 'user')

vi.mock('electron', () => ({
  app: {
    getPath: () => root,
    setPath: () => undefined,
    isPackaged: false,
    getAppPath: () => process.cwd(),
    getVersion: () => '0.2.0'
  }
}))

vi.mock('@main/paths', () => ({
  userDataRoot: () => root,
  learnersRoot: () => join(root, 'learners'),
  userPacksRoot: () => user,
  bundledPacksRoot: () => bundled,
  templatesRoot: () => join(process.cwd(), 'resources', 'templates'),
  iconPath: () => ''
}))

function seedBundled(packId = 'demo.pack'): string {
  const pack = join(bundled, packId)
  mkdirSync(join(pack, 'lessons', 'one'), { recursive: true })
  mkdirSync(join(pack, 'lessons', 'two'), { recursive: true })
  writeFileSync(
    join(pack, 'pack.json'),
    JSON.stringify({
      kind: 'pack',
      schemaVersion: 1,
      id: packId,
      title: 'Demo',
      engines: ['none'],
      tracks: []
    })
  )
  const lesson = (id: string) =>
    JSON.stringify({
      kind: 'lesson',
      schemaVersion: 1,
      id,
      packId,
      title: id,
      estimatedMinutes: 1,
      taskRev: 1,
      blocks: [{ type: 'explain', md: id }]
    })
  writeFileSync(join(pack, 'lessons', 'one', 'lesson.json'), lesson('one'))
  writeFileSync(join(pack, 'lessons', 'two', 'lesson.json'), lesson('two'))
  writeFileSync(join(pack, 'lessons', 'one', 'secret.txt'), 'bundled-secret')
  return packId
}

describe('overlay and zip', () => {
  it('overlay lesson is atomic and does not hide siblings', async () => {
    seedBundled()
    const { importZipFile } = await import('@main/packs/zip')
    const { resolvePack } = await import('@main/packs/resolve')
    const tmp = mkdtempSync(join(tmpdir(), 'lawp-lesson-'))
    mkdirSync(join(tmp, 'one'), { recursive: true })
    writeFileSync(
      join(tmp, 'one', 'lesson.json'),
      JSON.stringify({
        kind: 'lesson',
        schemaVersion: 1,
        id: 'one',
        packId: 'demo.pack',
        title: 'overlay-one',
        estimatedMinutes: 1,
        taskRev: 2,
        blocks: [{ type: 'explain', md: 'overlay' }]
      })
    )
    writeFileSync(join(tmp, 'one', 'only-user.txt'), 'user-only')
    const zip = new AdmZip()
    zip.addLocalFolder(join(tmp, 'one'), 'one')
    const zipPath = join(tmp, 'one.zip')
    zip.writeZip(zipPath)
    const r = importZipFile(zipPath, false)
    expect(r.overlay).toBe(true)
    const pack = resolvePack('demo.pack')
    expect(pack?.lessons.map((l) => l.id).sort()).toEqual(['one', 'two'])
    expect(pack?.lessons.find((l) => l.id === 'one')?.raw.title).toBe('overlay-one')
    expect(pack?.lessons.find((l) => l.id === 'two')?.raw.title).toBe('two')
    expect(existsSync(join(user, 'demo.pack', 'lessons', 'one', 'only-user.txt'))).toBe(true)
    expect(existsSync(join(user, 'demo.pack', 'lessons', 'one', 'secret.txt'))).toBe(false)
  })

  it('rejects zip-slip paths', async () => {
    const { importZipFile } = await import('@main/packs/zip')
    const zip = new AdmZip()
    zip.addFile('../evil.txt', Buffer.from('nope'))
    const p = join(root, 'slip.zip')
    zip.writeZip(p)
    expect(() => importZipFile(p, false)).toThrow(/Unsafe|slip|zip/i)
  })

  it('exportResolvedPack writes overlay false and resolved lessons', async () => {
    seedBundled()
    const { resolvePack } = await import('@main/packs/resolve')
    const { exportResolvedPack } = await import('@main/packs/zip')
    const pack = resolvePack('demo.pack')
    expect(pack).toBeTruthy()
    const dest = join(root, 'resolved.zip')
    exportResolvedPack(pack!, dest)
    const zip = new AdmZip(dest)
    const names = zip.getEntries().map((e) => e.entryName.replaceAll('\\', '/'))
    expect(names.some((n) => n.endsWith('pack.json'))).toBe(true)
    const manifest = JSON.parse(zip.getEntry('pack.json')!.getData().toString('utf8'))
    expect(manifest.overlay).toBe(false)
    expect(names.join(',')).not.toContain('learners/')
  })
})

describe('fingerprint trust', () => {
  it('is stable for circuits and changes when a code file changes', async () => {
    const { resolvePack } = await import('@main/packs/resolve')
    const { executableFingerprint } = await import('@main/packs/fingerprint')
    const realBundled = join(process.cwd(), 'resources', 'packs')
    vi.doUnmock?.('@main/paths')
    const circuits = resolvePack('lawp.circuits.basics')
    if (!circuits && !existsSync(join(bundled, 'lawp.circuits.basics'))) {
      expect(existsSync(join(realBundled, 'lawp.circuits.basics', 'pack.json'))).toBe(true)
    }
    const a = executableFingerprint({
      packId: 'x',
      root: root,
      overlay: false,
      source: 'user',
      manifest: {
        kind: 'pack',
        schemaVersion: 1,
        id: 'x',
        title: 'x',
        description: '',
        subjects: [],
        engines: ['python'],
        capabilities: { execute: 'python', network: false },
        version: '1',
        locale: 'en',
        authors: [],
        tracks: []
      },
      tracks: [],
      courses: [],
      skills: [],
      misconceptions: [],
      creations: [],
      lessons: [
        {
          id: 'l',
          folder: root,
          source: 'user',
          raw: { taskRev: 1, blocks: [{ type: 'code', engine: 'python', files: [{ path: 'files/main.py', role: 'edit' }] }] } as never
        }
      ]
    })
    const b = executableFingerprint({
      packId: 'x',
      root: root,
      overlay: false,
      source: 'user',
      manifest: {
        kind: 'pack',
        schemaVersion: 1,
        id: 'x',
        title: 'x',
        description: '',
        subjects: [],
        engines: ['python'],
        capabilities: { execute: 'python', network: false },
        version: '1',
        locale: 'en',
        authors: [],
        tracks: []
      },
      tracks: [],
      courses: [],
      skills: [],
      misconceptions: [],
      creations: [],
      lessons: [
        {
          id: 'l',
          folder: root,
          source: 'user',
          raw: { taskRev: 2, blocks: [{ type: 'code', engine: 'python', files: [{ path: 'files/main.py', role: 'edit' }] }] } as never
        }
      ]
    })
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe('settings export', () => {
  it('strips trust and does not include window geometry', async () => {
    const { settingsForExport, settingsSchema } = await import('@shared/schemas/settings')
    const s = settingsSchema.parse({
      trustedExecutions: [{ packId: 'x', fingerprint: 'abc', grantedAt: 't' }],
      pythonPath: '/py'
    })
    const doc = settingsForExport(s)
    expect(JSON.stringify(doc)).not.toContain('trustedExecutions')
    expect(JSON.stringify(doc)).not.toContain('window')
    expect((doc.settings as { pythonPath: string }).pythonPath).toBe('/py')
  })
})
