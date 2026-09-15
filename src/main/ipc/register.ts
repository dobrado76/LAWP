import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { existsSync, mkdirSync, writeFileSync, cpSync, readFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { IPC } from '@shared/ipc'
import { err, ok, type Result } from '@shared/result'
import { settingsSchema } from '@shared/schemas/settings'
import { activityBlockSchema, executableBlockSchema, lessonSchema } from '@shared/schemas/lesson'
import { app } from 'electron'
import { iconPath, userDataRoot, userPacksRoot } from '../paths'
import { exportSettingsDocument, grantTrust, hasTrust, loadSettings, updateSettings } from '../settings/store'
import { loadSession, saveSession } from '../session/store'
import {
  createLearner,
  currentLearnerId,
  ensureDefaultLearner,
  listLearners,
  renameLearner
} from '../learners/store'
import { lessonById, listPackIds, resolvePack, stripLessonForRenderer } from '../packs/resolve'
import { exportLessonFolder, exportResolvedPack, importZipFile } from '../packs/zip'
import { capabilitiesAgree, declaredExecute, executableFingerprint, isBundledUnmodified } from '../packs/fingerprint'
import { revokeTrust } from '../settings/store'
import {
  appendAttempt,
  creationDir,
  loadAttempts,
  loadEvidence,
  loadSnapshot,
  packProgress,
  recordGrade,
  resetProgress,
  saveCreation
} from '../progress/store'
import { applyActivity, cancelRun, getRun, gradeRunActivity, noteHint, recordPlay, startRunRecord } from '../activities/runs'
import { evalProperty } from '../activities/world'
import { listTemplates, createFromTemplate } from '../author/templates'
import { safeJoin } from '../security/paths'
import { executeCodeBlock } from '../runners/code'
import { assertCanSpawn } from '../runners/trust'
import type { CodeBlock } from '../runners/types'

function wrap<T>(fn: () => T | Promise<T>): Promise<Result<T>> {
  return Promise.resolve()
    .then(fn)
    .then((value) => ok(value))
    .catch((e: unknown) => {
      const errObj = e as { code?: string; message?: string }
      return err(errObj.code ?? 'io', errObj.message ?? String(e))
    })
}

export function registerIpc(): void {
  ensureDefaultLearner()

  ipcMain.handle(IPC.appInfo, () =>
    wrap(() => ({
      version: app.getVersion(),
      userDataPath: userDataRoot(),
      isPackaged: app.isPackaged,
      icon: iconPath()
    }))
  )

  ipcMain.handle(IPC.settingsGet, () => wrap(() => loadSettings()))
  ipcMain.handle(IPC.settingsUpdate, (_e, partial: unknown) =>
    wrap(() => updateSettings(settingsSchema.partial().parse(partial)))
  )

  ipcMain.handle(IPC.settingsExport, async (_e, input: { includeCartridges?: boolean } | undefined) => {
    const win = BrowserWindow.getFocusedWindow()
    const include = input?.includeCartridges === true
    const pick = await dialog.showSaveDialog(win!, {
      filters: include
        ? [{ name: 'LAWP setup', extensions: ['zip'] }]
        : [{ name: 'LAWP settings', extensions: ['json'] }],
      defaultPath: include ? 'lawp-setup.zip' : 'lawp-settings.json'
    })
    if (pick.canceled || !pick.filePath) return ok({ cancelled: true })
    if (!include) {
      writeFileSync(pick.filePath, JSON.stringify(exportSettingsDocument(), null, 2), 'utf8')
      return ok({ cancelled: false, path: pick.filePath })
    }
    const AdmZip = (await import('adm-zip')).default
    const zip = new AdmZip()
    zip.addFile('manifest.json', Buffer.from(JSON.stringify({ kind: 'setup', schemaVersion: 1 })))
    zip.addFile('settings.json', Buffer.from(JSON.stringify(exportSettingsDocument())))
    for (const id of listPackIds()) {
      const pack = resolvePack(id)
      if (!pack) continue
      if (pack.source === 'bundled') continue
      const tmp = join(app.getPath('temp'), `lawp-exp-${id}.zip`)
      exportResolvedPack(pack, tmp)
      zip.addLocalFile(tmp, 'packs', `${id}.zip`)
    }
    zip.writeZip(pick.filePath)
    return ok({ cancelled: false, path: pick.filePath })
  })

  ipcMain.handle(IPC.settingsImport, async () => {
    const win = BrowserWindow.getFocusedWindow()
    const pick = await dialog.showOpenDialog(win!, {
      filters: [
        { name: 'LAWP setup / settings', extensions: ['json', 'zip'] }
      ],
      properties: ['openFile']
    })
    if (pick.canceled || !pick.filePaths[0]) return ok({ cancelled: true })
    const path = pick.filePaths[0]
    if (path.endsWith('.json')) {
      const doc = JSON.parse(readFileSync(path, 'utf8')) as { settings?: unknown }
      const parsed = settingsSchema.partial().parse(doc.settings ?? doc)
      const { trustedExecutions: _t, ...rest } = parsed
      const next = updateSettings(rest)
      return ok({ cancelled: false, settings: next, packsImported: [], skipped: [] })
    }
    const imported: string[] = []
    const skipped: string[] = []
    const AdmZip = (await import('adm-zip')).default
    const zip = new AdmZip(path)
    const settingsEntry = zip.getEntry('settings.json')
    if (settingsEntry) {
      const doc = JSON.parse(settingsEntry.getData().toString('utf8')) as { settings?: unknown }
      const parsed = settingsSchema.partial().parse(doc.settings ?? doc)
      const { trustedExecutions: _t, ...rest } = parsed
      updateSettings(rest)
    }
    for (const e of zip.getEntries()) {
      if (!e.entryName.replaceAll('\\', '/').startsWith('packs/') || e.isDirectory) continue
      const tmp = join(app.getPath('temp'), basename(e.entryName))
      writeFileSync(tmp, e.getData())
      try {
        const r = importZipFile(tmp, false)
        imported.push(r.packId)
      } catch (er) {
        const code = (er as { code?: string }).code
        if (code === 'cartridge-conflict') skipped.push(basename(e.entryName))
        else throw er
      }
    }
    return ok({ cancelled: false, settings: loadSettings(), packsImported: imported, skipped })
  })

  ipcMain.handle(IPC.sessionGet, () => wrap(() => loadSession()))
  ipcMain.handle(IPC.sessionSet, (_e, patch: unknown) =>
    wrap(() => saveSession({ ...loadSession(), ...(patch as object) }))
  )

  ipcMain.handle(IPC.learnersList, () =>
    wrap(() => {
      const learners = listLearners()
      return { currentId: currentLearnerId(), learners }
    })
  )
  ipcMain.handle(IPC.learnersCreate, (_e, input: { displayName: string }) =>
    wrap(() => createLearner(input.displayName))
  )
  ipcMain.handle(IPC.learnersSwitch, (_e, input: { learnerId: string }) =>
    wrap(() => {
      updateSettings({ currentLearnerId: input.learnerId })
      return { currentId: input.learnerId }
    })
  )
  ipcMain.handle(IPC.learnersRename, (_e, input: { learnerId: string; displayName: string }) =>
    wrap(() => {
      const l = renameLearner(input.learnerId, input.displayName)
      if (!l) throw Object.assign(new Error('Learner not found'), { code: 'not-found' })
      return l
    })
  )

  ipcMain.handle(IPC.packsList, () =>
    wrap(() =>
      listPackIds()
        .map((id) => resolvePack(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({
          id: p.manifest.id,
          title: p.manifest.title,
          description: p.manifest.description,
          subjects: p.manifest.subjects,
          engines: p.manifest.engines,
          overlay: p.overlay,
          source: p.source,
          lessonCount: p.lessons.length,
          execute: declaredExecute(p),
          fingerprint: executableFingerprint(p)
        }))
    )
  )

  ipcMain.handle(IPC.packsGet, (_e, input: { packId: string }) =>
    wrap(() => {
      const p = resolvePack(input.packId)
      if (!p) throw Object.assign(new Error('Pack not found'), { code: 'not-found' })
      const agree = capabilitiesAgree(p)
      return {
        manifest: p.manifest,
        tracks: p.tracks,
        courses: p.courses,
        lessons: p.lessons.map((l) => ({
          id: l.id,
          title: l.raw.title,
          estimatedMinutes: l.raw.estimatedMinutes,
          skillIds: l.raw.skillIds,
          taskRev: l.raw.taskRev,
          source: l.source
        })),
        skills: p.skills,
        misconceptions: p.misconceptions,
        creations: p.creations,
        capabilitiesOk: agree.ok,
        capabilitiesMessage: agree.message,
        fingerprint: executableFingerprint(p),
        execute: declaredExecute(p),
        trusted: isBundledUnmodified(p) || hasTrust(p.packId, executableFingerprint(p))
      }
    })
  )

  ipcMain.handle(IPC.packsLesson, (_e, input: { packId: string; lessonId: string }) =>
    wrap(() => {
      const p = resolvePack(input.packId)
      const lesson = p && lessonById(p, input.lessonId)
      if (!lesson) throw Object.assign(new Error('Lesson not found'), { code: 'not-found' })
      return stripLessonForRenderer(lesson)
    })
  )

  ipcMain.handle(IPC.packsImportZip, async (_e, input: { replace?: boolean } | undefined) => {
    const win = BrowserWindow.getFocusedWindow()
    const pick = await dialog.showOpenDialog(win!, {
      filters: [{ name: 'Zip', extensions: ['zip'] }],
      properties: ['openFile']
    })
    if (pick.canceled || !pick.filePaths[0]) return ok({ cancelled: true })
    try {
      const r = importZipFile(pick.filePaths[0], input?.replace === true)
      return ok(r)
    } catch (e) {
      const er = e as { code?: string; message?: string }
      return err(er.code ?? 'zip-invalid', er.message ?? 'Import failed')
    }
  })

  ipcMain.handle(IPC.packsExportZip, async (_e, input: { packId: string; lessonId?: string }) => {
    const win = BrowserWindow.getFocusedWindow()
    const pack = resolvePack(input.packId)
    if (!pack) return err('not-found', 'Pack not found')
    const pick = await dialog.showSaveDialog(win!, {
      defaultPath: input.lessonId ? `${input.packId}__${input.lessonId}.zip` : `${input.packId}.zip`,
      filters: [{ name: 'Zip', extensions: ['zip'] }]
    })
    if (pick.canceled || !pick.filePath) return ok({ cancelled: true })
    if (input.lessonId) {
      const lesson = lessonById(pack, input.lessonId)
      if (!lesson) return err('not-found', 'Lesson not found')
      exportLessonFolder(lesson.folder, pick.filePath)
    } else {
      exportResolvedPack(pack, pick.filePath)
    }
    return ok({ cancelled: false, path: pick.filePath })
  })

  ipcMain.handle(IPC.packsReload, () => wrap(() => listPackIds()))

  ipcMain.handle(IPC.trustGrant, (_e, input: { packId: string }) =>
    wrap(() => {
      const p = resolvePack(input.packId)
      if (!p) throw Object.assign(new Error('Pack not found'), { code: 'not-found' })
      grantTrust(p.packId, executableFingerprint(p))
      return { trusted: true }
    })
  )

  ipcMain.handle(IPC.progressGet, (_e, input: { packId?: string; learnerId?: string }) =>
    wrap(() => {
      const learnerId = input.learnerId ?? currentLearnerId()
      if (!input.packId) return { learnerId, packs: {} }
      const pack = resolvePack(input.packId)
      if (!pack) return { learnerId, lessons: {} }
      return {
        learnerId,
        lessons: packProgress(
          learnerId,
          input.packId,
          pack.lessons.map((l) => ({ id: l.id, taskRev: l.raw.taskRev }))
        )
      }
    })
  )

  ipcMain.handle(IPC.progressAttempts, (_e, input: { packId: string; lessonId: string }) =>
    wrap(() => ({ attempts: loadAttempts(currentLearnerId(), input.packId, input.lessonId) }))
  )

  ipcMain.handle(IPC.progressSnapshot, (_e, input: { packId: string; lessonId: string; attemptId: string }) =>
    wrap(() => loadSnapshot(currentLearnerId(), input.packId, input.lessonId, input.attemptId))
  )

  ipcMain.handle(IPC.progressNote, () => wrap(() => ({ ok: true })))

  ipcMain.handle(
    IPC.progressReset,
    (_e, input: { packId: string; scope: 'block' | 'lesson' | 'module' | 'course' | 'pack'; history?: 'keep' | 'delete-last' | 'clear'; lessonId?: string; blockId?: string }) =>
      wrap(() => {
        const pack = resolvePack(input.packId)
        const lesson = input.lessonId && pack ? lessonById(pack, input.lessonId) : undefined
        return resetProgress(
          currentLearnerId(),
          input.packId,
          input.scope,
          input.history ?? 'keep',
          { lessonId: input.lessonId, blockId: input.blockId },
          lesson?.raw.taskRev ?? 1
        )
      })
  )

  ipcMain.handle(IPC.practiceNext, () =>
    wrap(() => {
      const items: { packId: string; lessonId: string; reason: string }[] = []
      for (const id of listPackIds()) {
        const pack = resolvePack(id)
        if (!pack) continue
        for (const l of pack.lessons) {
          const ev = loadEvidence(currentLearnerId(), id, l.id, l.raw.taskRev)
          if (ev.misconceptionHits.some((m) => m.count > 0) || ev.status === 'in-progress' || ev.status === 'retrying') {
            items.push({ packId: id, lessonId: l.id, reason: ev.misconceptionHits[0]?.id ?? ev.status })
          }
        }
      }
      return items.slice(0, 8)
    })
  )

  ipcMain.handle(IPC.runStart, (_e, input: { packId: string; lessonId: string; blockId: string }) =>
    wrap(() => {
      const pack = resolvePack(input.packId)
      const lesson = pack && lessonById(pack, input.lessonId)
      if (!lesson) throw Object.assign(new Error('Lesson not found'), { code: 'not-found' })
      const block = (lesson.raw.blocks as { type?: string; id?: string }[]).find(
        (b) => b.id === input.blockId || (b.type === 'activity' && !input.blockId)
      )
      const activity = block ? activityBlockSchema.safeParse(block) : null
      const code = block ? executableBlockSchema.safeParse(block) : null
      const playWorld = code?.success ? code.data.play?.world : undefined
      const rec = startRunRecord({
        learnerId: currentLearnerId(),
        packId: input.packId,
        lessonId: input.lessonId,
        blockId: input.blockId,
        activity: activity?.success ? activity.data : undefined,
        playWorld
      })
      return {
        runId: rec.runId,
        learnerId: rec.learnerId,
        world: rec.worldRun?.world ?? rec.playWorld,
        calcFault: rec.worldRun?.calcFault ?? null
      }
    })
  )

  ipcMain.handle(
    IPC.runActivity,
    (_e, input: { runId: string; actionId: string; payload?: { value?: string | number | boolean } }) =>
      wrap(() => {
        const out = applyActivity(input.runId, input.actionId, input.payload)
        if ('error' in out && out.error === 'not-found') {
          throw Object.assign(new Error('Run not found'), { code: 'not-found' })
        }
        if ('error' in out) throw Object.assign(new Error(out.message ?? 'Invalid action'), { code: 'validation' })
        return out.result
      })
  )

  ipcMain.handle(IPC.runCancel, (_e, input: { runId: string }) =>
    wrap(() => {
      cancelRun(input.runId)
      return { ok: true }
    })
  )

  ipcMain.handle(
    IPC.gradeBlock,
    (_e, input: {
      runId: string
      packId: string
      lessonId: string
      blockId: string
      answers?: unknown
      files?: { path: string; contents: string }[]
      replaceLast?: boolean
      world?: unknown
    }) =>
      wrap(async () => {
        void input.world
        const run = getRun(input.runId)
        if (!run) throw Object.assign(new Error('Run not found'), { code: 'not-found' })
        const pack = resolvePack(input.packId)
        const lesson = pack && lessonById(pack, input.lessonId)
        if (!lesson) throw Object.assign(new Error('Lesson not found'), { code: 'not-found' })
        const block = (lesson.raw.blocks as { type?: string; id?: string }[]).find((b) => b.id === input.blockId)
        const attemptId = randomUUID()
        if (block && (block as { type: string }).type === 'activity') {
          const g = gradeRunActivity(input.runId)
          if (!g) throw Object.assign(new Error('No activity run'), { code: 'not-found' })
          const parsed = activityBlockSchema.safeParse(block)
          const misconceptionIds =
            parsed.success
              ? parsed.data.misconceptionMap?.filter((m) => evalProperty(g.world, m.when)).map((m) => m.misconceptionId) ?? []
              : []
          const score = g.passed ? 1 : g.goalMet ? 0.5 : 0
          const ev = recordGrade(
            run.learnerId,
            input.packId,
            input.lessonId,
            lesson.raw.taskRev,
            {
              attemptId,
              at: new Date().toISOString(),
              blockId: input.blockId,
              taskRev: lesson.raw.taskRev,
              score,
              assisted: run.assisted,
              revealed: run.revealed,
              passed: g.passed
            },
            input.replaceLast === true,
            { world: g.world, calcFault: g.calcFault },
            misconceptionIds
          )
          appendAttempt(run.learnerId, input.packId, input.lessonId, {
            id: attemptId,
            runId: run.runId,
            learnerId: run.learnerId,
            at: new Date().toISOString(),
            blockId: input.blockId,
            kind: 'grade',
            taskRev: lesson.raw.taskRev,
            passed: g.passed,
            score,
            assisted: run.assisted,
            revealed: run.revealed,
            snapshotId: attemptId,
            misconceptionIds
          })
          if (g.passed) {
            saveCreation(run.learnerId, input.packId, lesson.raw.creation?.id ?? 'my-circuit', g.world)
          }
          return {
            passed: g.passed,
            goalMet: g.goalMet,
            constraintOk: g.constraintOk,
            calcFault: g.calcFault,
            compare: { current: ev.grades.at(-1), previous: ev.grades.at(-2), best: ev.best },
            snapshotId: attemptId,
            misconceptionIds
          }
        }
        if (block && (block as { type: string }).type === 'check') {
          const check = block as { answer?: unknown; choices?: { id: string; misconceptionId?: string }[] }
          const passed = JSON.stringify(input.answers) === JSON.stringify(check.answer) || input.answers === check.answer
          const misconceptionIds =
            !passed && typeof input.answers === 'string'
              ? check.choices?.filter((c) => c.id === input.answers && c.misconceptionId).map((c) => c.misconceptionId!) ?? []
              : []
          const ev = recordGrade(
            run.learnerId,
            input.packId,
            input.lessonId,
            lesson.raw.taskRev,
            {
              attemptId,
              at: new Date().toISOString(),
              blockId: input.blockId,
              taskRev: lesson.raw.taskRev,
              score: passed ? 1 : 0,
              assisted: run.assisted,
              revealed: run.revealed,
              passed
            },
            input.replaceLast === true,
            { answers: input.answers },
            misconceptionIds
          )
          return {
            passed,
            compare: { current: ev.grades.at(-1), previous: ev.grades.at(-2), best: ev.best },
            misconceptionIds,
            snapshotId: attemptId
          }
        }
        const code = block ? executableBlockSchema.safeParse(block) : null
        if (code?.success) {
          assertCanSpawn(pack!)
          const out = await executeCodeBlock(lesson.folder, code.data as CodeBlock, input.files ?? [])
          const misconceptionIds = out.checks.filter((c) => !c.ok && c.misconceptionId).map((c) => c.misconceptionId!)
          if (out.play) recordPlay(run.runId, out.play)
          const ev = recordGrade(
            run.learnerId,
            input.packId,
            input.lessonId,
            lesson.raw.taskRev,
            {
              attemptId,
              at: new Date().toISOString(),
              blockId: input.blockId,
              taskRev: lesson.raw.taskRev,
              score: out.passed ? 1 : 0,
              assisted: run.assisted,
              revealed: run.revealed,
              passed: out.passed
            },
            input.replaceLast === true,
            {
              files: input.files,
              stdout: out.stdout,
              stderr: out.stderr,
              world: out.play?.world,
              playFault: out.play?.fault ?? null,
              commands: out.play?.commands
            },
            misconceptionIds
          )
          if (out.passed && lesson.raw.creation) {
            saveCreation(run.learnerId, input.packId, lesson.raw.creation.id, {
              files: input.files,
              world: out.play?.world
            })
          }
          return {
            passed: out.passed,
            checks: out.checks,
            stdout: out.stdout,
            stderr: out.stderr,
            timedOut: out.timedOut,
            world: out.play?.world,
            commands: out.play?.commands,
            playFault: out.play?.fault ?? null,
            goalMet: out.play?.goalMet,
            constraintOk: out.play?.constraintOk,
            compare: { current: ev.grades.at(-1), previous: ev.grades.at(-2), best: ev.best },
            misconceptionIds,
            snapshotId: attemptId
          }
        }
        throw Object.assign(new Error('Unsupported block'), { code: 'validation' })
      })
  )

  ipcMain.handle(IPC.hintGet, (_e, input: { runId: string; packId: string; lessonId: string; blockId: string; level: number }) =>
    wrap(() => {
      if (!input.runId || !getRun(input.runId)) {
        throw Object.assign(new Error('Run not found'), { code: 'not-found' })
      }
      const pack = resolvePack(input.packId)
      const lesson = pack && lessonById(pack, input.lessonId)
      if (!lesson) throw Object.assign(new Error('Lesson not found'), { code: 'not-found' })
      const block = (lesson.raw.blocks as { id?: string; hintLadder?: { level: number; md: string; kind?: string }[] }[]).find(
        (b) => b.id === input.blockId
      )
      const hint = block?.hintLadder?.find((h) => h.level === input.level)
      if (!hint) throw Object.assign(new Error('Hint not found'), { code: 'not-found' })
      const kind = (hint.kind as 'concept' | 'assist') ?? (input.level <= 3 ? 'concept' : 'assist')
      noteHint(input.runId, input.level, kind)
      return { md: hint.md, level: input.level, kind }
    })
  )

  ipcMain.handle(IPC.authorTemplates, () => wrap(() => listTemplates()))
  ipcMain.handle(IPC.authorCreate, (_e, input: { templateId: string; packId: string; lessonId: string }) =>
    wrap(() => createFromTemplate(input.templateId, input.packId, input.lessonId))
  )
  ipcMain.handle(IPC.authorSave, (_e, input: { packId: string; lessonId: string; lesson: unknown }) =>
    wrap(() => {
      const parsed = lessonSchema.parse(input.lesson)
      const pack = resolvePack(input.packId)
      const destPack = join(userPacksRoot(), input.packId)
      const dest = join(destPack, 'lessons', input.lessonId)
      mkdirSync(dest, { recursive: true })
      writeFileSync(join(dest, 'lesson.json'), JSON.stringify(parsed, null, 2), 'utf8')
      if (pack && executableFingerprint(pack) !== executableFingerprint(resolvePack(input.packId)!)) {
        revokeTrust(input.packId)
      }
      revokeTrust(input.packId)
      return { ok: true }
    })
  )
  ipcMain.handle(IPC.authorImportAsset, async (_e, input: { packId: string; lessonId: string }) => {
    const win = BrowserWindow.getFocusedWindow()
    const pick = await dialog.showOpenDialog(win!, { properties: ['openFile'] })
    if (pick.canceled || !pick.filePaths[0]) return ok({ cancelled: true })
    const src = pick.filePaths[0]
    const ext = extname(src).toLowerCase()
    const allow = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.webm', '.gif', '.json']
    if (!allow.includes(ext)) return err('validation', 'File type not allowed')
    const destDir = join(userPacksRoot(), input.packId, 'lessons', input.lessonId, 'assets')
    mkdirSync(destDir, { recursive: true })
    const name = basename(src)
    const dest = safeJoin(destDir, name)
    if (!dest) return err('sandbox', 'Bad path')
    cpSync(src, dest)
    return ok({ path: `assets/${name}` })
  })
  ipcMain.handle(IPC.authorValidate, (_e, input: { packId: string; lessonId: string }) =>
    wrap(() => {
      const pack = resolvePack(input.packId)
      const lesson = pack && lessonById(pack, input.lessonId)
      const issues: { path: string; message: string }[] = []
      if (!pack || !lesson) issues.push({ path: 'lesson', message: 'not found' })
      else {
        const parsed = lessonSchema.safeParse(lesson.raw)
        if (!parsed.success) issues.push({ path: 'lesson.json', message: parsed.error.message })
        const cap = capabilitiesAgree(pack)
        if (!cap.ok) issues.push({ path: 'capabilities', message: cap.message ?? 'mismatch' })
      }
      return { ok: issues.length === 0, issues }
    })
  )
  ipcMain.handle(IPC.authorPreview, (_e, input: { packId: string; lessonId: string }) =>
    wrap(() => {
      const pack = resolvePack(input.packId)
      const lesson = pack && lessonById(pack, input.lessonId)
      if (!lesson) throw Object.assign(new Error('not found'), { code: 'not-found' })
      return stripLessonForRenderer(lesson)
    })
  )
  ipcMain.handle(IPC.authorExportZip, async (_e, input: { packId: string; lessonId?: string }) => {
    const win = BrowserWindow.getFocusedWindow()
    const pack = resolvePack(input.packId)
    if (!pack) return err('not-found', 'Pack not found')
    const pick = await dialog.showSaveDialog(win!, {
      defaultPath: input.lessonId ? `${input.lessonId}.zip` : `${input.packId}.zip`
    })
    if (pick.canceled || !pick.filePath) return ok({ cancelled: true })
    if (input.lessonId) {
      const lesson = lessonById(pack, input.lessonId)
      if (!lesson) return err('not-found', 'Lesson not found')
      exportLessonFolder(lesson.folder, pick.filePath)
    } else exportResolvedPack(pack, pick.filePath)
    return ok({ cancelled: false, path: pick.filePath })
  })
  ipcMain.handle(IPC.authorDraftAi, () => err('not-configured', 'No AI endpoint configured', 'Add one in Settings'))

  ipcMain.handle(IPC.creationGet, (_e, input: { packId: string; creationId: string }) =>
    wrap(() => {
      const dir = creationDir(currentLearnerId(), input.packId, input.creationId)
      return { dir, exists: existsSync(dir) }
    })
  )
  ipcMain.handle(IPC.creationExport, async (_e, input: { packId: string; creationId: string; kind: 'folder' | 'zip' }) => {
    const win = BrowserWindow.getFocusedWindow()
    const dir = creationDir(currentLearnerId(), input.packId, input.creationId)
    if (!existsSync(dir)) return err('not-found', 'No creation yet — finish the experiment first')
    if (input.kind === 'folder') {
      const pick = await dialog.showOpenDialog(win!, { properties: ['openDirectory'] })
      if (pick.canceled || !pick.filePaths[0]) return ok({ cancelled: true })
      cpSync(dir, join(pick.filePaths[0], input.creationId), { recursive: true })
      return ok({ cancelled: false, path: join(pick.filePaths[0], input.creationId) })
    }
    const pick = await dialog.showSaveDialog(win!, { defaultPath: `${input.creationId}.zip` })
    if (pick.canceled || !pick.filePath) return ok({ cancelled: true })
    exportLessonFolder(dir, pick.filePath)
    return ok({ cancelled: false, path: pick.filePath })
  })

  ipcMain.handle(
    IPC.runCode,
    (_e, input: { runId: string; packId: string; lessonId: string; blockId: string; files: { path: string; contents: string }[] }) =>
      wrap(async () => {
        const run = getRun(input.runId)
        if (!run) throw Object.assign(new Error('Run not found'), { code: 'not-found' })
        const pack = resolvePack(input.packId)
        const lesson = pack && lessonById(pack, input.lessonId)
        if (!pack || !lesson) throw Object.assign(new Error('Lesson not found'), { code: 'not-found' })
        const block = (lesson.raw.blocks as { id?: string }[]).find((b) => b.id === input.blockId)
        const parsed = block ? executableBlockSchema.safeParse(block) : null
        if (!parsed?.success) throw Object.assign(new Error('Not a code block'), { code: 'validation' })
        assertCanSpawn(pack)
        const out = await executeCodeBlock(lesson.folder, parsed.data as CodeBlock, input.files ?? [])
        if (out.play) recordPlay(run.runId, out.play)
        return {
          stdout: out.stdout,
          stderr: out.stderr,
          exitCode: out.exitCode,
          timedOut: out.timedOut,
          durationMs: out.durationMs,
          checks: out.checks,
          passed: out.passed,
          world: out.play?.world,
          commands: out.play?.commands,
          playFault: out.play?.fault ?? null,
          goalMet: out.play?.goalMet,
          constraintOk: out.play?.constraintOk
        }
      })
  )
}

export function openUserData(): void {
  void shell.openPath(userDataRoot())
}
