import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CodeBlock } from './types'
import { loadSettings } from '../settings/store'
import { resetSandbox, runProcess, writeSandboxFile, type SpawnResult } from './exec'
import { safeJoin } from '../security/paths'
import { applyPlayLog, parsePlayLog, type PlayApplyResult } from '../play/commands'
import { playStubsRoot } from '../paths'

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

export async function executeCodeBlock(
  lessonFolder: string,
  block: CodeBlock,
  learnerFiles: { path: string; contents: string }[]
): Promise<CodeRunOut> {
  const files = mergeLearnerFiles(lessonFolder, block, learnerFiles)
  const cwd = resetSandbox(`run-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  for (const f of files) writeSandboxFile(cwd, f.path.replace(/^files\//, ''), f.contents)
  const entry = (block.entry ?? files.find((f) => f.role === 'edit')?.path ?? 'main.py').replace(/^files\//, '')
  const timeout = block.timeoutMs ?? 8000
  const hidden = files.find((f) => f.role === 'hidden-test')
  const play = block.play
  let boot = entry
  if (play) {
    const stubs = stubsDir()
    if (block.engine === 'python') {
      copyFileSync(join(stubs, '_lawp_player.py'), join(cwd, '_lawp_player.py'))
      writeSandboxFile(
        cwd,
        '_boot.py',
        `from _lawp_player import Player\nimport runpy\nrunpy.run_path(${JSON.stringify(entry)}, init_globals={"Player": Player})\n`
      )
      boot = '_boot.py'
    } else if (block.engine === 'javascript') {
      copyFileSync(join(stubs, '_lawp_player.js'), join(cwd, '_lawp_player.js'))
      writeSandboxFile(cwd, '_boot.js', `global.Player = require('./_lawp_player.js').Player\nrequire(${JSON.stringify('./' + entry)})\n`)
      boot = '_boot.js'
    }
  }
  let result: SpawnResult
  if (block.engine === 'python') {
    const bin = await findPython()
    await assertPython3(bin)
    const script =
      !play && hidden && block.checks.some((c) => c.type === 'python-assert')
        ? hidden.path.replace(/^files\//, '')
        : boot
    const launched = pythonBinArgs(bin, [script])
    result = await runProcess(launched.bin, launched.args, cwd, timeout)
  } else if (block.engine === 'javascript') {
    const bin = await findNode()
    const script =
      !play && hidden && block.checks.some((c) => c.type === 'js-assert') ? hidden.path.replace(/^files\//, '') : boot
    result = await runProcess(bin, [script], cwd, timeout)
  } else {
    const bin = await findNode()
    result = await runProcess(bin, [boot], cwd, timeout)
  }
  const checks = gradeChecks(block, files, result)
  let playOut: PlayApplyResult | undefined
  if (play) {
    let raw: unknown = []
    const logPath = join(cwd, 'play-log.json')
    if (existsSync(logPath)) {
      try {
        raw = JSON.parse(readFileSync(logPath, 'utf8'))
      } catch {
        raw = []
      }
    }
    playOut = applyPlayLog(play.world, parsePlayLog(raw), {
      playerId: play.playerId,
      goal: play.goal,
      constraints: play.constraints,
      scaleValues: play.scaleValues
    })
  }
  const passed = (playOut ? playOut.passed : checks.every((c) => c.ok)) && !result.timedOut
  return { ...result, checks, passed, play: playOut }
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
