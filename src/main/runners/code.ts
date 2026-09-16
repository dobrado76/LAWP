import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CodeBlock } from './types'
import { loadSettings } from '../settings/store'
import { resetSandbox, runProcess, writeSandboxFile, type SpawnResult } from './exec'
import { safeJoin } from '../security/paths'
import { applyPlayLog, parsePlayLog, type PlayApplyResult } from '../play/commands'
import { playStubsRoot } from '../paths'
import { isDomBlock, runDomHarness } from './dom'

const MAX_FILE = 256 * 1024
const MAX_FILES = 32

export type CheckResult = { ok: boolean; type: string; misconceptionId?: string; detail?: string }

export type CodeRunOut = SpawnResult & {
  checks: CheckResult[]
  passed: boolean
  play?: PlayApplyResult
}

function readLessonFile(lessonFolder: string, rel: string): string | null {
  const dest = safeJoin(lessonFolder, rel)
  if (!dest || !existsSync(dest)) return null
  return readFileSync(dest, 'utf8')
}

export function mergeLearnerFiles(
  lessonFolder: string,
  block: CodeBlock,
  learnerFiles: { path: string; contents: string }[]
): { path: string; contents: string; role: string }[] {
  if (learnerFiles.length > MAX_FILES) throw Object.assign(new Error('Too many files'), { code: 'validation' })
  const byPath = new Map(block.files.map((f) => [f.path, f]))
  const out: { path: string; contents: string; role: string }[] = []
  for (const declared of block.files) {
    const fromDisk = declared.contents ?? readLessonFile(lessonFolder, declared.path) ?? ''
    const incoming = learnerFiles.find((f) => f.path === declared.path)
    if (incoming && incoming.contents.length > MAX_FILE) {
      throw Object.assign(new Error('File too large'), { code: 'validation' })
    }
    if (incoming && declared.role !== 'edit') {
      throw Object.assign(new Error('Cannot edit a read-only file'), { code: 'validation' })
    }
    out.push({
      path: declared.path,
      role: declared.role,
      contents: incoming && declared.role === 'edit' ? incoming.contents : fromDisk
    })
    void byPath
  }
  return out
}

export async function findPython(): Promise<string> {
  const configured = loadSettings().pythonPath.trim()
  if (configured) return configured
  for (const [bin, args] of [
    ['py', ['-3', '-c', 'print(1)']],
    ['python', ['-c', 'print(1)']],
    ['python3', ['-c', 'print(1)']]
  ] as const) {
    const r = await runProcess(bin, [...args], process.cwd(), 4000)
    if (!r.timedOut && r.exitCode === 0) return bin === 'py' ? 'py' : bin
  }
  throw Object.assign(new Error('Python 3 not found. Set pythonPath in Settings.'), { code: 'not-configured' })
}

export async function findNode(): Promise<string> {
  const configured = loadSettings().nodePath.trim()
  if (configured) return configured
  const r = await runProcess('node', ['-v'], process.cwd(), 4000)
  if (!r.timedOut && r.exitCode === 0) return 'node'
  throw Object.assign(new Error('Node not found. Set nodePath in Settings.'), { code: 'not-configured' })
}

async function assertPython3(bin: string): Promise<void> {
  const args = bin === 'py' ? ['-3', '-c', 'import sys; print(sys.version_info[0])'] : ['-c', 'import sys; print(sys.version_info[0])']
  const r = await runProcess(bin, args, process.cwd(), 4000)
  if (r.stdout.trim() === '2') {
    throw Object.assign(new Error('Python 2 is not supported'), { code: 'validation' })
  }
}

function pythonBinArgs(bin: string, scriptArgs: string[]): { bin: string; args: string[] } {
  return bin === 'py' ? { bin: 'py', args: ['-3', ...scriptArgs] } : { bin, args: scriptArgs }
}

function stubsDir(): string {
  const repo = join(process.cwd(), 'resources', 'play', 'stubs')
  if (existsSync(repo)) return repo
  return playStubsRoot()
}

function readPlayLog(cwd: string): unknown {
  const logPath = join(cwd, 'play-log.json')
  if (!existsSync(logPath)) return []
  try {
    return JSON.parse(readFileSync(logPath, 'utf8'))
  } catch {
    return []
  }
}

function sandboxName(rel: string): string {
  return rel.replace(/^files\//, '').replace(/\\/g, '/')
}

function isEsmBlock(block: CodeBlock, files: { path: string; contents: string; role: string }[]): boolean {
  const entry = sandboxName(block.entry ?? files.find((f) => f.role === 'edit')?.path ?? '')
  if (entry.endsWith('.mjs')) return true
  if (files.some((f) => sandboxName(f.path).endsWith('.mjs'))) return true
  const pkg = files.find((f) => sandboxName(f.path).endsWith('package.json'))
  if (pkg) {
    try {
      if ((JSON.parse(pkg.contents) as { type?: string }).type === 'module') return true
    } catch {
      /* ignore */
    }
  }
  return files.some(
    (f) =>
      f.role !== 'hidden-test' &&
      (/(?:^|\n)\s*import\s/.test(f.contents) || /(?:^|\n)\s*export\s/.test(f.contents))
  )
}

export async function executeCodeBlock(
  lessonFolder: string,
  block: CodeBlock,
  learnerFiles: { path: string; contents: string }[],
  opts?: { grade?: boolean }
): Promise<CodeRunOut> {
  const grade = opts?.grade !== false
  const files = mergeLearnerFiles(lessonFolder, block, learnerFiles)
  const cwd = resetSandbox(`run-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  for (const f of files) writeSandboxFile(cwd, sandboxName(f.path), f.contents)
  const entry = sandboxName(block.entry ?? files.find((f) => f.role === 'edit')?.path ?? 'main.py')
  const timeout = block.timeoutMs ?? 8000
  const hidden = files.find((f) => f.role === 'hidden-test')
  const play = block.play
  const extraEnv = { ...(block.env ?? {}) }
  const argv = block.argv ?? []
  let result: SpawnResult
  let playLogAfterRun: unknown | undefined

  if (block.engine === 'javascript' && isDomBlock(block, files)) {
    result = await runDomHarness(block, files, { grade })
  } else if (block.engine === 'python') {
    const bin = await findPython()
    await assertPython3(bin)
    // PYTHONSAFEPATH keeps the interpreter from importing out of whatever directory
    // it was launched from. The sandbox is the one directory that must stay
    // importable: it holds the player stub, the learner's module, and its fixtures.
    const pyEnv = { PYTHONPATH: cwd, ...extraEnv }
    let boot = entry
    if (play) {
      const stubs = stubsDir()
      copyFileSync(join(stubs, '_lawp_player.py'), join(cwd, '_lawp_player.py'))
      writeSandboxFile(
        cwd,
        '_boot.py',
        `from _lawp_player import Player\nimport runpy\nrunpy.run_path(${JSON.stringify(entry)}, init_globals={"Player": Player})\n`
      )
      boot = '_boot.py'
    }
    const launched = pythonBinArgs(bin, [boot, ...argv])
    result = await runProcess(launched.bin, launched.args, cwd, timeout, pyEnv)
    if (play) playLogAfterRun = readPlayLog(cwd)
    if (grade && hidden && block.checks.some((c) => c.type === 'python-assert')) {
      const hiddenName = sandboxName(hidden.path)
      let assertEntry = hiddenName
      if (play) {
        // A hidden test on a play lesson may `import main`, which replays the
        // learner's calls. Give that import the same Player the first run had.
        writeSandboxFile(
          cwd,
          '_assert_boot.py',
          `import builtins\nimport runpy\nfrom _lawp_player import Player\nbuiltins.Player = Player\nrunpy.run_path(${JSON.stringify(
            hiddenName
          )}, run_name="__main__")\n`
        )
        assertEntry = '_assert_boot.py'
      }
      const assertLaunch = pythonBinArgs(bin, [assertEntry, ...argv])
      const assertRun = await runProcess(assertLaunch.bin, assertLaunch.args, cwd, timeout, pyEnv)
      result = mergeAssertRun(result, assertRun)
    }
  } else if (block.engine === 'javascript') {
    const bin = await findNode()
    const stubs = stubsDir()
    copyFileSync(join(stubs, '_lawp_fetch.js'), join(cwd, '_lawp_fetch.js'))
    const esm = isEsmBlock(block, files)
    let boot = entry
    if (play) {
      if (esm) {
        copyFileSync(join(stubs, '_lawp_player.mjs'), join(cwd, '_lawp_player.mjs'))
        writeSandboxFile(
          cwd,
          '_boot.mjs',
          `import { createRequire } from 'node:module'\nconst require = createRequire(import.meta.url)\nrequire('./_lawp_fetch.js')\nimport { Player } from './_lawp_player.mjs'\nglobalThis.Player = Player\nawait import(${JSON.stringify('./' + entry)})\n`
        )
        boot = '_boot.mjs'
      } else {
        copyFileSync(join(stubs, '_lawp_player.js'), join(cwd, '_lawp_player.js'))
        writeSandboxFile(
          cwd,
          '_boot.js',
          `require('./_lawp_fetch.js')\nglobal.Player = require('./_lawp_player.js').Player\nrequire(${JSON.stringify('./' + entry)})\n`
        )
        boot = '_boot.js'
      }
    } else if (!esm) {
      writeSandboxFile(cwd, '_boot.js', `require('./_lawp_fetch.js')\nrequire(${JSON.stringify('./' + entry)})\n`)
      boot = '_boot.js'
    } else {
      writeSandboxFile(
        cwd,
        '_boot.mjs',
        `import { createRequire } from 'node:module'\nconst require = createRequire(import.meta.url)\nrequire('./_lawp_fetch.js')\nawait import(${JSON.stringify('./' + entry)})\n`
      )
      boot = '_boot.mjs'
    }
    result = await runProcess(bin, [boot, ...argv], cwd, timeout, extraEnv)
    if (play) playLogAfterRun = readPlayLog(cwd)
    if (grade && hidden && block.checks.some((c) => c.type === 'js-assert')) {
      const hiddenName = sandboxName(hidden.path)
      const hiddenEsm = hiddenName.endsWith('.mjs') || esm
      const assertBoot = hiddenEsm ? '_assert_boot.mjs' : '_assert_boot.js'
      const playerLine = play
        ? hiddenEsm
          ? `import { Player } from './_lawp_player.mjs'\nglobalThis.Player = Player\n`
          : `global.Player = require('./_lawp_player.js').Player\n`
        : ''
      if (hiddenEsm) {
        writeSandboxFile(
          cwd,
          assertBoot,
          `import { createRequire } from 'node:module'\nconst require = createRequire(import.meta.url)\nrequire('./_lawp_fetch.js')\n${playerLine}await import(${JSON.stringify('./' + hiddenName)})\n`
        )
      } else {
        writeSandboxFile(
          cwd,
          assertBoot,
          `require('./_lawp_fetch.js')\n${playerLine}require(${JSON.stringify('./' + hiddenName)})\n`
        )
      }
      const assertRun = await runProcess(bin, [assertBoot, ...argv], cwd, timeout, extraEnv)
      result = mergeAssertRun(result, assertRun)
    }
  } else {
    const bin = await findNode()
    result = await runProcess(bin, [entry, ...argv], cwd, timeout, extraEnv)
  }
  const checks = gradeChecks(block, files, result)
  let playOut: PlayApplyResult | undefined
  if (play) {
    let raw: unknown = playLogAfterRun
    const logPath = join(cwd, 'play-log.json')
    if (raw === undefined && existsSync(logPath)) {
      try {
        raw = JSON.parse(readFileSync(logPath, 'utf8'))
      } catch {
        raw = []
      }
    }
    if (raw === undefined) raw = []
    playOut = applyPlayLog(play.world, parsePlayLog(raw), {
      playerId: play.playerId,
      goal: play.goal,
      constraints: play.constraints,
      scaleValues: play.scaleValues
    })
  }
  const processOk = result.exitCode === 0 && !result.timedOut
  const passed = grade
    ? (playOut ? playOut.passed && checks.every((c) => c.ok) : checks.every((c) => c.ok)) && processOk
    : Boolean(playOut?.passed && processOk)
  return { ...result, checks: grade ? checks : [], passed, play: playOut }
}

function mergeAssertRun(first: SpawnResult, assertRun: SpawnResult): SpawnResult {
  return {
    stdout: first.stdout,
    stderr: [first.stderr, assertRun.stderr].filter(Boolean).join('\n'),
    exitCode: first.exitCode !== 0 ? first.exitCode : assertRun.exitCode,
    timedOut: first.timedOut || assertRun.timedOut,
    durationMs: first.durationMs + assertRun.durationMs
  }
}

function gradeChecks(
  block: CodeBlock,
  files: { path: string; contents: string; role: string }[],
  result: SpawnResult
): CheckResult[] {
  if (!block.checks || block.checks.length === 0) {
    return [{ ok: result.exitCode === 0 && !result.timedOut, type: 'stdout' }]
  }
  return block.checks.map((check) => {
    if (check.type === 'stdout') {
      const got = result.stdout.replace(/\r\n/g, '\n').trim()
      const want = (check.equals ?? '').replace(/\r\n/g, '\n').trim()
      return { ok: got === want, type: check.type, misconceptionId: check.misconceptionId, detail: got }
    }
    if (check.type === 'stdout-regex') {
      const re = new RegExp(check.pattern ?? '')
      return { ok: re.test(result.stdout), type: check.type, misconceptionId: check.misconceptionId }
    }
    if (check.type === 'ast') {
      const target = files.find((f) => f.role === 'edit')?.contents ?? ''
      const q = check.query ?? ''
      return { ok: q ? target.includes(q) : false, type: check.type, misconceptionId: check.misconceptionId }
    }
    if (check.type === 'python-assert' || check.type === 'js-assert' || check.type === 'react-test') {
      return { ok: result.exitCode === 0 && !result.timedOut, type: check.type, misconceptionId: check.misconceptionId }
    }
    return { ok: false, type: check.type }
  })
}
