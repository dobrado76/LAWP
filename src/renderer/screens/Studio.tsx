import { useEffect, useMemo, useRef, useState } from 'react'
import { defaultCheckValue, type CheckKind, type CheckPrompt } from '@shared/check'
import { firstTryTally, type BlockState, type FirstTry } from '@shared/schemas/progress'
import { filesHash, isInfraError, type SubmissionOut } from '@shared/submission'
import { applyPlayCommands, facingName, GRID_CELL_PX, clampGrid, playObjectiveItems, type PlayCommand, type PlayProp } from '@shared/play'
import { DEFAULT_FLOOR, playKitLayerRank, playKitPiece, playKitSrc } from '@shared/playKit'
import { IPC, invoke } from '../api'
import { draftLessonKey, draftMatchesLesson, filesForLesson } from '@shared/draftBind'
import { inferLessonBeats, type LessonBeat } from '@shared/lessonBeats'
import { CheckPanel, GradeCta, lessonWorkVerdict, unansweredChecks } from '../checks/CheckPanel'
import { CodeEditor } from '../editor/CodeEditor'
import { inspectPage } from '../editor/pageSource'
import { md } from '../md'
import { BackIcon, CheckVerdict, HintIcon, IconBtn, NextIcon, PlayIcon, RestartIcon } from '../ui/IconBtn'

type Block = Record<string, unknown> & { type: string; id?: string; md?: string; promptMd?: string }
type LessonSum = { id: string; title: string }
type WorldPart = { id: string; type: string; props: Record<string, string | number | boolean> }
type World = {
  parts: WorldPart[]
  connections?: { from: string; to: string }[]
  view?: { kind?: string; assetMap?: Record<string, string>; grid?: { cols?: number; rows?: number; floor?: string } }
}
type PlayCmd = PlayCommand
type ConsoleState = { text: string; ran: boolean }

const emptyConsole: ConsoleState = { text: '', ran: false }

function CodeConsole({ text }: ConsoleState) {
  return (
    <div className="code-console" role="log" aria-label="Console">
      <div className="code-console-bar">Console</div>
      <pre className="code-console-body">{text}</pre>
    </div>
  )
}

export function Studio({
  packId,
  lessonId,
  onPickLesson,
  onDone
}: {
  packId: string
  lessonId: string
  onPickLesson: (id: string) => void
  onDone: () => void
}) {
  const [lesson, setLesson] = useState<{ title: string; blocks: Block[]; creation?: { id: string } } | null>(null)
  const [tree, setTree] = useState<{
    manifest?: { title?: string }
    lessons: LessonSum[]
    courses: { modules: { lessonIds: string[] }[] }[]
    misconceptions: { id: string; title: string }[]
  } | null>(null)
  const [runId, setRunId] = useState<string>()
  const [world, setWorld] = useState<World | null>(null)
  const [startWorld, setStartWorld] = useState<World | null>(null)
  const replayGen = useRef(0)
  const [status, setStatus] = useState('')
  const [why, setWhy] = useState('')
  const [compare, setCompare] = useState('')
  const [hint, setHint] = useState('')
  const [hintLevel, setHintLevel] = useState(0)
  const [predict, setPredict] = useState('')
  const [checkAns, setCheckAns] = useState<Record<string, unknown>>({})
  const [checkResult, setCheckResult] = useState<Record<string, 'pass' | 'fail'>>({})
  const [revealAnswers, setRevealAnswers] = useState<Record<string, string[]>>({})
  const [attempted, setAttempted] = useState<Record<string, boolean>>({})
  const [firstTry, setFirstTry] = useState<Record<string, 'pass' | 'fail'>>({})
  const [evidence, setEvidence] = useState('')
  const [progress, setProgress] = useState<
    Record<
      string,
      {
        status: string
        best?: { score: number; assisted: boolean }
        firstTries?: Record<string, FirstTry>
        blockState?: Record<string, BlockState>
      }
    >
  >({})
  const [files, setFiles] = useState<{ path: string; contents: string }[]>([])
  const [boundKey, setBoundKey] = useState('')
  const [consoleOut, setConsoleOut] = useState<ConsoleState>(emptyConsole)
  const [banner, setBanner] = useState<{ kind: 'success' | 'fail'; title: string } | null>(null)
  const [draftReady, setDraftReady] = useState(false)
  const [inspectHit, setInspectHit] = useState<{ selector: string; all: boolean } | null>(null)
  const [taskResult, setTaskResult] = useState<'pass' | 'fail' | null>(null)
  const [canExport, setCanExport] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runNote, setRunNote] = useState('')
  const [passHash, setPassHash] = useState<string | null>(null)
  const workGen = useRef(0)
  const draftHold = useRef(false)
  /** State, not a ref: the Submit gate is computed from it during render. */
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [beat, setBeat] = useState<LessonBeat>('learn')
  const runIdRef = useRef<string | undefined>(undefined)

  const lessonOrder = useMemo(() => {
    const fromCourse = tree?.courses.flatMap((c) => c.modules.flatMap((m) => m.lessonIds)) ?? []
    if (fromCourse.length) return fromCourse
    return tree?.lessons.map((l) => l.id) ?? []
  }, [tree])
  const idx = lessonOrder.indexOf(lessonId)
  const prevId = idx > 0 ? lessonOrder[idx - 1] : undefined
  const nextId = idx >= 0 && idx < lessonOrder.length - 1 ? lessonOrder[idx + 1] : undefined
  const lessonTitle = (id: string) => tree?.lessons.find((l) => l.id === id)?.title ?? id

  function stillHere(gen: number) {
    return workGen.current === gen
  }

  async function refreshProgress(gen = workGen.current) {
    const ev = await invoke<{
      lessons: Record<
        string,
        {
          status: string
          best?: { score: number; assisted: boolean }
          firstTries?: Record<string, FirstTry>
          blockState?: Record<string, BlockState>
        }
      >
    }>(IPC.progressGet, { packId })
    if (!stillHere(gen)) return undefined
    setProgress(ev.lessons)
    const e = ev.lessons[lessonId]
    setEvidence(e ? `${e.status}${e.best ? ` · best ${Math.round(e.best.score * 100)}%` : ''}` : '')
    return e
  }

  function advanceOrDone() {
    if (nextId) onPickLesson(nextId)
    else onDone()
  }

  /**
   * Reopening a lesson restores every block the learner attempted, right or
   * wrong. A finished task only shows its pass while the editor still holds the
   * text that earned it.
   */
  function hydrate(
    state: Record<string, BlockState> | undefined,
    startFiles: { path: string; contents: string }[],
    opts: { taskIds: string[]; hasCode: boolean }
  ) {
    const rows = state ?? {}
    const answers: Record<string, unknown> = {}
    const results: Record<string, 'pass' | 'fail'> = {}
    const seen: Record<string, boolean> = {}
    const touchedNow = new Set<string>()
    const startHash = filesHash(startFiles)
    let task: 'pass' | null = null
    let hash: string | null = null
    for (const [id, row] of Object.entries(rows)) {
      if (!row?.attempted) continue
      seen[id] = true
      if (opts.taskIds.includes(id)) {
        if (row.passed && (!opts.hasCode || row.passingFilesHash === startHash)) {
          task = 'pass'
          hash = startHash
        }
        continue
      }
      touchedNow.add(id)
      if (row.answer !== undefined) answers[id] = row.answer
      results[id] = row.passed ? 'pass' : 'fail'
    }
    setTouched(touchedNow)
    setCheckAns(answers)
    setCheckResult(results)
    setRevealAnswers({})
    setAttempted(seen)
    setTaskResult(task)
    setPassHash(hash)
  }

  async function load(gen = workGen.current, opts?: { ignoreDraft?: boolean }) {
    setDraftReady(false)
    setBoundKey('')
    const l = await invoke<{ title: string; blocks: Block[]; creation?: { id: string } }>(IPC.packsLesson, { packId, lessonId })
    if (!stillHere(gen)) return
    setLesson(l)
    const packed = await invoke<{
      manifest?: { title?: string }
      lessons: LessonSum[]
      courses: { modules: { lessonIds: string[] }[] }[]
      misconceptions: { id: string; title: string }[]
    }>(IPC.packsGet, { packId })
    if (!stillHere(gen)) return
    setTree(packed)
    const evRow = await refreshProgress(gen)
    const act = l.blocks.find((b) => b.type === 'activity')
    const codeBlock = l.blocks.find((b) => b.type === 'code' || b.type === 'debug')
    const startId = act?.id ?? codeBlock?.id ?? l.blocks.find((b) => b.id)?.id
    if (startId) {
      const started = await invoke<{ runId: string; world?: World }>(IPC.runStart, {
        packId,
        lessonId,
        blockId: startId
      })
      if (!stillHere(gen)) return
      setRunId(started.runId)
      runIdRef.current = started.runId
      setWorld(started.world ?? null)
      setStartWorld(started.world ?? null)
    } else {
      setRunId(undefined)
      runIdRef.current = undefined
      setWorld(null)
      setStartWorld(null)
    }
    const starters =
      codeBlock && Array.isArray(codeBlock.files)
        ? (codeBlock.files as { path: string; role: string; contents?: string }[])
            .filter((f) => f.role === 'edit')
            .map((f) => ({ path: f.path, contents: f.contents ?? '' }))
        : []
    let nextFiles = starters
    if (starters.length && !opts?.ignoreDraft) {
      const draft = await invoke<{ files: { path: string; contents: string }[] }>(IPC.draftsGet, { packId, lessonId })
      if (!stillHere(gen)) return
      nextFiles = filesForLesson(starters, draft.files)
    }
    if (!stillHere(gen)) return
    setFiles(nextFiles)
    setBoundKey(draftLessonKey(packId, lessonId))
    setConsoleOut(emptyConsole)
    setHint('')
    setHintLevel(0)
    setStatus('')
    setCompare('')
    setPredict('')
    setFirstTry({})
    setWhy('')
    setRunNote('')
    setBanner(null)
    setTaskResult(null)
    hydrate(evRow?.blockState, nextFiles, {
      taskIds: [act?.id, codeBlock?.id].filter((x): x is string => Boolean(x)),
      hasCode: Boolean(codeBlock)
    })
    if (l.creation) {
      const kept = await invoke<{ exists: boolean }>(IPC.creationGet, { packId, creationId: l.creation.id })
      if (!stillHere(gen)) return
      setCanExport(kept.exists)
    } else {
      setCanExport(false)
    }
    setDraftReady(true)
  }

  useEffect(() => {
    const gen = ++workGen.current
    replayGen.current += 1
    setDraftReady(false)
    setBoundKey('')
    setFiles([])
    setInspectHit(null)
    setTaskResult(null)
    setCanExport(false)
    setPassHash(null)
    setAttempted({})
    setRevealAnswers({})
    setSubmitting(false)
    setRunNote('')
    setTouched(new Set())
    setBeat('learn')
    void load(gen)
    return () => {
      workGen.current += 1
      replayGen.current += 1
      const id = runIdRef.current
      if (id) void invoke(IPC.runCancel, { runId: id }).catch(() => undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId, lessonId])

  useEffect(() => {
    if (draftHold.current) return
    if (!draftReady || !files.length) return
    if (!draftMatchesLesson(boundKey, packId, lessonId)) return
    const snapshot = { packId, lessonId, files }
    const t = setTimeout(() => {
      if (draftHold.current) return
      void invoke(IPC.draftsSave, snapshot).catch(() => undefined)
    }, 400)
    return () => {
      clearTimeout(t)
      if (draftHold.current) return
      void invoke(IPC.draftsSave, snapshot).catch(() => undefined)
    }
  }, [files, draftReady, boundKey, packId, lessonId])

  const activity = lesson?.blocks.find((b) => b.type === 'activity') as
    | (Block & {
        promptMd: string
        world?: {
          actions: { id: string; label: string; key?: string; values?: (string | number)[] }[]
          view?: { kind?: string }
        }
        predict?: { promptMd: string; choices?: { id: string; md: string }[] }
        explainAfter?: { promptMd: string }
      })
    | undefined
  const code = lesson?.blocks.find((b) => b.type === 'code' || b.type === 'debug') as
    | (Block & {
        promptMd?: string
        engine?: string
        preview?: { kind?: string }
        files?: { path: string; role: string; contents?: string }[]
        play?: {
          playerId?: string
          world?: World
          guided?: boolean
          goal?: { all?: PlayProp[]; any?: PlayProp[]; none?: PlayProp[] }
        }
      })
    | undefined
  const playerId = code?.play?.playerId ?? 'fox'
  const viewKind = world?.view?.kind ?? activity?.world?.view?.kind
  const isGrid = viewKind === 'grid'
  const checks: CheckPrompt[] = (lesson?.blocks.filter((b) => b.type === 'check' || (b.type === 'predict' && b.id)) ?? []).map((b) => ({
    ...(b as unknown as CheckPrompt),
    id: String(b.id ?? 'check'),
    kind: ((b as { kind?: CheckKind }).kind ?? 'mcq') as CheckKind,
    promptMd: String(b.promptMd ?? '')
  }))
  const checkOnly = checks.length > 0 && !activity && !code
  const beats = useMemo(() => inferLessonBeats(lesson?.blocks ?? []), [lesson])
  const paged = beats.length === 2
  const onLearn = !paged || beat === 'learn'
  const onTry = !paged || beat === 'try'
  const playable = Boolean(activity || code || checks.length)
  const nextLabel = nextId ? 'Next' : 'Return to library'
  const gradedChecks = checks.filter((ch) => (ch as { diagnostic?: boolean }).diagnostic !== true)
  const diagnosticsPending = checks.some(
    (ch) => (ch as { diagnostic?: boolean }).diagnostic === true && !attempted[ch.id]
  )
  /**
   * Whether the code is right is only knowable by running it, but an
   * unanswered question is visible from here — so Submit waits rather than
   * spending an attempt on a blank. Same `isAttemptedAnswer` rule main grades
   * with, so the button and the grader never disagree.
   */
  const unanswered = unansweredChecks(checks, checkAns, touched)
  const submitBlocked = unanswered.length > 0 || Boolean(activity?.predict && !predict)
  const currentHash = useMemo(() => filesHash(files), [files])
  /** A pass belongs to the text that earned it, not to whatever is in the editor now. */
  const hashOk = !code || !files.length || passHash === currentHash
  /**
   * Same rule for answers: change one after grading and the CTA goes back to
   * Submit, so a learner who reads the review can act on it. Diagnostics need
   * this most — they are not in `gradedChecks`, so nothing else notices.
   */
  const answersDirty = checks.some((ch) => attempted[ch.id] && !checkResult[ch.id])
  const pendingCheck = gradedChecks.find((ch) => checkResult[ch.id] !== 'pass')
  const taskPending = Boolean((code || activity) && (taskResult !== 'pass' || !hashOk))
  // Only a *pass* is tied to the files hash. A fail must still show as fail —
  // otherwise two Correct question reviews sit next to 67% with no overall verdict.
  const shownTask = taskResult === 'pass' && !hashOk ? null : taskResult
  const ctaResult = diagnosticsPending
    ? null
    : lessonWorkVerdict({
        checkResults: gradedChecks.map((ch) => checkResult[ch.id] ?? null),
        taskResult: shownTask,
        hasTask: Boolean(code || activity)
      })
  const canAdvance = !pendingCheck && !taskPending && !diagnosticsPending && !answersDirty

  function pct(score?: number): string {
    return score === undefined ? '—' : `${Math.round(score * 100)}%`
  }

  function applySubmission(r: SubmissionOut, sentHash: string): Promise<void> | void {
    const gen = workGen.current
    const results: Record<string, 'pass' | 'fail'> = {}
    const seen: Record<string, boolean> = {}
    for (const b of r.blocks) {
      seen[b.blockId] = b.attempted
      if (b.kind === 'check') results[b.blockId] = b.passed ? 'pass' : 'fail'
    }
    setCheckResult((prev) => ({ ...prev, ...results }))
    setRevealAnswers((prev) => {
      const next = { ...prev }
      for (const b of r.blocks) {
        if (b.kind !== 'check') continue
        if (b.correctChoiceIds?.length) next[b.blockId] = b.correctChoiceIds
        else delete next[b.blockId]
      }
      return next
    })
    setAttempted((prev) => ({ ...prev, ...seen }))
    setFirstTry((prev) => {
      const out = { ...prev }
      for (const b of r.blocks) if (!(b.blockId in out)) out[b.blockId] = b.passed ? 'pass' : 'fail'
      return out
    })
    const task = r.blocks.find((b) => b.kind === 'code' || b.kind === 'activity')
    if (task) setTaskResult(task.passed ? 'pass' : 'fail')
    if (r.outcome === 'pass') setPassHash(sentHash)
    setStatus(r.outcome === 'pass' ? 'Passed' : 'Not yet')
    setCompare(`This ${pct(r.compare?.current?.score)} · Last ${pct(r.compare?.previous?.score)} · Best ${pct(r.compare?.best?.score)}`)

    const finish = () => {
      if (!stillHere(gen)) return
      const names = r.blocks
        .flatMap((b) => b.misconceptionIds)
        .map((id) => tree?.misconceptions.find((m) => m.id === id)?.title ?? id)
      if (r.unanswered.length) {
        setWhy(
          r.unanswered.length === 1
            ? 'One question is still unanswered. Answer it, then submit.'
            : `${r.unanswered.length} questions are still unanswered. Answer them, then submit.`
        )
      } else if (names.length) {
        setWhy(names.join(', '))
      } else if (r.outcome === 'pass') {
        // A check's own explanation now sits under its choices; only the
        // activity's after-word has nowhere else to go.
        const explain = activity?.explainAfter?.promptMd
        if (explain) setWhy(String(explain))
      } else if (task && !task.passed) {
        const requiredChecks = r.blocks.filter((b) => b.kind === 'check' && b.required === 'pass')
        const checksOk = requiredChecks.length > 0 && requiredChecks.every((b) => b.passed)
        setWhy(
          checksOk
            ? 'The questions are right. The code task is still open — read the prompt on the left again.'
            : 'Not quite. Look again, then submit.'
        )
      } else if (!r.code) {
        setWhy('Not quite. Look again, then submit.')
      }
      void refreshProgress(gen)
      if (r.outcome === 'pass' && lesson?.creation) {
        void invoke<{ exists: boolean }>(IPC.creationGet, { packId, creationId: lesson.creation.id })
          .then((kept) => {
            if (stillHere(gen)) setCanExport(kept.exists)
          })
          .catch(() => undefined)
      }
    }

    if (r.code) {
      const out = r.code
      return showPlayResult(
        {
          world: out.world as World | undefined,
          commands: out.commands as PlayCmd[] | undefined,
          playFault: out.playFault,
          stdout: out.stdout,
          stderr: out.stderr,
          timedOut: out.timedOut,
          exitCode: out.exitCode,
          passed: task?.passed,
          goalMet: out.goalMet
        },
        { fillConsole: true }
      ).then(finish)
    }
    if (r.activity) {
      setWorld((r.activity.world as World) ?? null)
      setBanner({ kind: task?.passed ? 'success' : 'fail', title: task?.passed ? 'SUCCESS' : 'FAIL' })
    }
    finish()
  }

  /**
   * One Submit: freeze the answers and files, grade them once, commit together.
   * A second click while this runs joins the first attempt instead of starting
   * another.
   */
  async function submitWork() {
    if (submitting) return
    if (activity?.predict && !predict) {
      setStatus('Predict first')
      setWhy('Answer the predict question on the left, then change the circuit.')
      return
    }
    // The keyboard shortcut reaches this too, so the gate lives here, not only
    // on the button.
    if (unanswered.length) {
      setStatus('Answer first')
      setWhy(answerFirstNote(unanswered.length, checkOnly ? 'above' : paged ? 'learn' : 'left'))
      return
    }
    const gen = workGen.current
    const snapshot = files.map((f) => ({ path: f.path, contents: f.contents }))
    const answers: Record<string, unknown> = {}
    for (const ch of checks) answers[ch.id] = checkAns[ch.id] ?? defaultCheckValue(ch)
    const sentHash = filesHash(snapshot)
    setSubmitting(true)
    setRunNote('')
    try {
      const r = await invoke<SubmissionOut>(IPC.submitLesson, {
        runId,
        packId,
        lessonId,
        submissionId: crypto.randomUUID(),
        filesHash: sentHash,
        files: snapshot,
        answers,
        touched: [...touched]
      })
      if (!stillHere(gen)) return
      await applySubmission(r, sentHash)
    } catch (e) {
      if (!stillHere(gen)) return
      const er = e as Error & { code?: string }
      setRunNote(
        isInfraError(er.code)
          ? `This attempt could not run, so nothing was graded. ${er.message}`
          : er.message
      )
    } finally {
      if (stillHere(gen)) setSubmitting(false)
    }
  }

  async function act(actionId: string, value?: string | number) {
    if (!runId) return
    const gen = workGen.current
    const r = await invoke<{
      world: typeof world
      goalMet: boolean
      constraintOk: boolean
      calcFault: string | null
      misconceptionIds: string[]
    }>(IPC.runActivity, { runId, actionId, payload: value !== undefined ? { value } : undefined })
    if (!stillHere(gen)) return
    setWorld(r.world)
    setTaskResult(null)
    const names = r.misconceptionIds.map((id) => tree?.misconceptions.find((m) => m.id === id)?.title ?? id).join(', ')
    setWhy(
      r.calcFault
        ? `Calculation fault: ${r.calcFault}. This attempt cannot pass until you correct it.`
        : names ||
            (r.constraintOk
              ? r.goalMet
                ? 'Goal looks met. Press Check when you are ready.'
                : 'Not there yet — watch the lamp and the meter.'
              : 'Current is over the safe limit of 2.')
    )
    setStatus(r.calcFault ? 'Fault' : r.goalMet && r.constraintOk ? 'Ready to check' : '')
  }

  async function askHint() {
    const blockId = activity?.id ?? code?.id ?? checks[0]?.id
    if (!runId || !blockId) return
    const gen = workGen.current
    const next = Math.min(5, hintLevel + 1)
    const h = await invoke<{ md: string; kind: string }>(IPC.hintGet, {
      runId,
      packId,
      lessonId,
      blockId,
      level: next
    })
    if (!stillHere(gen)) return
    setHintLevel(next)
    setHint(`### Hint ${next}\n\n${h.md}`)
  }

  function setCheckValue(id: string, next: unknown) {
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
    setCheckAns((prev) => ({ ...prev, [id]: next }))
    setCheckResult((prev) => {
      if (!(id in prev)) return prev
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  async function showPlayResult(
    r: {
      world?: World
      commands?: PlayCmd[]
      playFault?: string | null
      stdout?: string
      stderr?: string
      timedOut?: boolean
      exitCode?: number
      passed?: boolean
      goalMet?: boolean
    },
    opts?: { preview?: boolean; fillConsole?: boolean }
  ) {
    if (opts?.fillConsole) {
      setConsoleOut({ text: (r.stdout ?? '').replace(/\s+$/, ''), ran: true })
    }
    const gen = ++replayGen.current
    const origin = startWorld ?? code?.play?.world ?? null
    if (origin && r.commands?.length) {
      await replayPlay(origin, r.commands, playerId, (w) => {
        if (replayGen.current === gen) setWorld(w)
      })
    }
    if (replayGen.current === gen && r.world) setWorld(r.world)
    setBanner(null)
    const harnessFail = /AssertionError|_assert_boot|hidden\.test|ERR_ASSERTION/.test(r.stderr ?? '')
    if (r.playFault) {
      setWhy(r.playFault)
      setBanner({ kind: 'fail', title: 'FAIL' })
    } else if (r.exitCode !== undefined && r.exitCode !== 0 && !harnessFail) {
      const crash =
        r.stderr?.trim().split('\n').find((line) => line.trim()) ?? 'The program stopped with an error.'
      setWhy(crash)
      setBanner({ kind: 'fail', title: 'FAIL' })
    } else if (opts?.preview && !code?.play) {
      setWhy('')
    } else if (r.passed) {
      setWhy('')
      setBanner({ kind: 'success', title: 'SUCCESS' })
    } else if (r.goalMet === false || r.passed === false) {
      setWhy('')
      setBanner({ kind: 'fail', title: 'FAIL' })
    }
  }

  async function runCode() {
    if (!runId || !code?.id) return
    const gen = workGen.current
    try {
      const r = await invoke<{
        stdout: string
        stderr: string
        timedOut: boolean
        exitCode?: number
        world?: World
        commands?: PlayCmd[]
        playFault?: string | null
        passed?: boolean
        goalMet?: boolean
      }>(IPC.runCode, {
        runId,
        packId,
        lessonId,
        blockId: code.id,
        files
      })
      if (!stillHere(gen)) return
      await showPlayResult(r, { preview: true, fillConsole: true })
      if (!stillHere(gen)) return
      if (code.play) {
        setStatus(
          r.playFault
            ? 'Fault'
            : r.exitCode && r.exitCode !== 0
              ? 'Crashed'
              : r.passed
                ? 'On the beacon'
                : r.goalMet
                  ? 'Ready to check'
                  : ''
        )
      }
    } catch (e) {
      if (!stillHere(gen)) return
      setStatus((e as Error).message)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) {
          if (canAdvance) advanceOrDone()
          else void submitWork()
        } else if (code) void runCode()
        else void submitWork()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const actions = (
    <div className="studio-bar-actions">
      {code && (
        <IconBtn label="Run" onClick={() => void runCode()}>
          <PlayIcon />
        </IconBtn>
      )}
      {playable && (
        <IconBtn label={hintLevel ? `Hint ${hintLevel}/5` : 'Hint'} disabled={hintLevel >= 5} onClick={() => void askHint()}>
          <HintIcon />
        </IconBtn>
      )}
      <IconBtn
        label="Restart lesson"
        onClick={() => {
          draftHold.current = true
          workGen.current += 1
          replayGen.current += 1
          const id = runIdRef.current
          if (id) void invoke(IPC.runCancel, { runId: id }).catch(() => undefined)
          const gen = workGen.current
          setFiles([])
          setBoundKey('')
          setDraftReady(false)
          void invoke(IPC.progressReset, { packId, scope: 'lesson', history: 'keep', lessonId })
            .then(() => load(gen, { ignoreDraft: true }))
            .finally(() => {
              draftHold.current = false
            })
        }}
      >
        <RestartIcon />
      </IconBtn>
      {canExport && lesson?.creation && (
        <button
          className="btn"
          title="Export your kept work as a zip"
          onClick={() => {
            void invoke<{ cancelled?: boolean }>(IPC.creationExport, {
              packId,
              creationId: lesson.creation!.id,
              kind: 'zip'
            }).catch((e) => setStatus((e as Error).message))
          }}
        >
          Export
        </button>
      )}
    </div>
  )

  return (
    <div className="page studio-page">
      <header className="studio-bar">
        <IconBtn label="Previous lesson" disabled={!prevId} onClick={() => prevId && onPickLesson(prevId)}>
          <BackIcon />
        </IconBtn>
        <div className="studio-bar-title">
          <strong>{lesson?.title ?? 'Lesson'}</strong>
          <span className="muted">
            {idx >= 0 ? `${idx + 1} / ${lessonOrder.length}` : ''}
            {paged ? ` · ${beat === 'learn' ? 'Learn' : 'Try'}` : ''}
            {evidence ? ` · ${evidence}` : ''}
          </span>
        </div>
        {tree?.manifest?.title ? <div className="studio-bar-pack">{tree.manifest.title}</div> : null}
        {actions}
        <IconBtn
          label={
            canAdvance || !playable
              ? nextId
                ? 'Next lesson'
                : 'Return to library'
              : 'Skip ahead — this lesson stays unfinished'
          }
          onClick={() => {
            if (playable && !canAdvance) {
              void invoke(IPC.progressSkip, { packId, lessonId }).catch(() => undefined)
            }
            advanceOrDone()
          }}
        >
          <NextIcon />
        </IconBtn>
      </header>

      <div className="studio">
        <div className="pane teach">
          {paged && onTry ? (
            <button type="button" className="btn studio-back-idea" onClick={() => setBeat('learn')}>
              Back to the idea
            </button>
          ) : null}
          {lesson?.blocks.map((b, i) => {
            if (b.type === 'explain') {
              if (!onLearn) return null
              return <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: md(String(b.md)) }} />
            }
            if (b.type === 'predict' && b.id) return null
            if (b.type === 'reflect') {
              if (!onLearn) return null
              return <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: md(String(b.promptMd ?? '')) }} />
            }
            return null
          })}
          {activity?.predict && onLearn && !paged && <Predict pred={activity.predict} value={predict} onChange={setPredict} />}
          {activity && onTry && (
            <div className="task prose" dangerouslySetInnerHTML={{ __html: md(activity.promptMd) }} />
          )}
          {code?.play && onTry && <Objectives goal={code.play.goal} world={world ?? startWorld} />}
          {code?.play?.guided && onTry && (
            <p className="guide">East increases <strong>x</strong>. South increases <strong>y</strong>. Run to update the list.</p>
          )}
          {code && !code.play && onTry && (
            <div
              className="task prose"
              dangerouslySetInnerHTML={{ __html: md(String(code.promptMd ?? '> Edit the file, then **Run**.')) }}
            />
          )}
          {checkOnly && checks.length === 1 && checkResult[checks[0]!.id] ? (
            <CheckVerdict result={checkResult[checks[0]!.id]!} />
          ) : null}
          {checkOnly && checks.length > 1 ? (
            <CheckTally checks={checks} results={checkResult} diagnostic={checks.every((ch) => (ch as { diagnostic?: boolean }).diagnostic)} />
          ) : null}
          {onTry && !checkOnly && ctaResult ? <CheckVerdict result={ctaResult} /> : null}
          {onTry && !nextId && canAdvance ? (
            <LessonComplete progress={progress} lessonId={lessonId} lessonOrder={lessonOrder} firstTry={firstTry} />
          ) : null}
          {hint && <div className="callout hint" dangerouslySetInnerHTML={{ __html: md(hint) }} />}
          {why && <div className="callout why-inline" dangerouslySetInnerHTML={{ __html: md(why) }} />}
          {compare && <p className="compare">{compare}</p>}
        </div>

        <div className="pane work">
          {onTry && world && isGrid && (
            <GridStage world={world} packId={packId} lessonId={lessonId} banner={banner} />
          )}
          {onTry && world && activity && !isGrid && banner && (
            <div className={`stage-banner ${banner.kind} is-inline`} role="status">
              <span>{banner.title}</span>
            </div>
          )}
          {onTry && world && activity && !isGrid && (
            <div className="world">
              {world.parts.map((p) => {
                const bright = Number(p.props.brightness ?? 0)
                const cls = p.type === 'lamp' ? (bright >= 2 ? 'lamp-bright' : 'lamp-dim') : ''
                return (
                  <div key={p.id} className={`node ${cls}`}>
                    <div className="node-type">{String(p.props.label ?? p.type)}</div>
                    <div className="muted">
                      {Object.entries(p.props)
                        .filter(([k]) => k !== 'label')
                        .map(([k, v]) => `${k} ${v}`)
                        .join(' · ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {onTry && activity?.world?.actions.map((a) => (
            <div key={a.id} className="action-group">
              <span className="muted">{a.label}</span>
              <div className="chips">
                {(a.values ?? [undefined]).map((v) => (
                  <button key={`${a.id}-${String(v)}`} className="btn" onClick={() => void act(a.id, v)}>
                    {v === undefined ? a.label : String(v)}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {onTry && draftReady && boundKey === draftLessonKey(packId, lessonId) && code?.preview?.kind === 'iframe' && (
            <PageBoard
              key={lessonId}
              html={code.files?.find((f) => f.path.endsWith('.html'))?.contents ?? ''}
              js={files.find((f) => f.path.endsWith('.js'))?.contents ?? ''}
              inspect={inspectHit}
              fixtures={Object.fromEntries(
                (code.files ?? [])
                  .filter((f) => f.path.endsWith('.json') && f.contents)
                  .flatMap((f) => {
                    const name = f.path.replace(/^files\//, '')
                    const base = name.split('/').pop() ?? name
                    return [
                      [name, f.contents as string],
                      ['/' + name, f.contents as string],
                      [base, f.contents as string],
                      ['/' + base, f.contents as string]
                    ] as [string, string][]
                  })
              )}
            />
          )}
          {onTry && draftReady && boundKey === draftLessonKey(packId, lessonId) && files.length > 0 && (
            <div className="code-work">
              {files.map((f) => (
                <CodeEditor
                  key={`${lessonId}:${f.path}`}
                  path={f.path}
                  value={f.contents}
                  engine={code?.engine}
                  api={code?.play ? 'player-v1' : code?.preview?.kind === 'iframe' ? 'dom-v1' : undefined}
                  selectors={
                    code?.preview?.kind === 'iframe'
                      ? inspectPage(code.files?.find((x) => x.path.endsWith('.html'))?.contents ?? '').selectors
                      : undefined
                  }
                  pageHtml={code?.preview?.kind === 'iframe' ? code.files?.find((x) => x.path.endsWith('.html'))?.contents ?? '' : undefined}
                  onInspect={code?.preview?.kind === 'iframe' ? setInspectHit : undefined}
                  onChange={(contents) => {
                    setBanner(null)
                    setTaskResult(null)
                    setFiles((prev) => prev.map((x) => (x.path === f.path ? { ...x, contents } : x)))
                  }}
                />
              ))}
              <CodeConsole {...consoleOut} />
            </div>
          )}
          {(checkOnly || (paged && onLearn)) &&
            checks.map((ch) => (
              <CheckPanel
                key={ch.id}
                check={ch}
                value={checkAns[ch.id]}
                onChange={(next) => setCheckValue(ch.id, next)}
                packId={packId}
                lessonId={lessonId}
                result={checkResult[ch.id] ?? null}
                revealIds={revealAnswers[ch.id] ?? []}
              />
            ))}
          {activity?.predict && paged && onLearn && <Predict pred={activity.predict} value={predict} onChange={setPredict} />}
          {runNote && onTry && <p className="run-note">{runNote}</p>}
          {paged && onLearn && playable ? (
            <div className="studio-beat-cta">
              <button
                type="button"
                className="btn primary check-cta"
                disabled={submitBlocked}
                title={submitBlocked ? answerFirstNote(unanswered.length, 'above') : undefined}
                onClick={() => setBeat('try')}
              >
                Continue to the exercise
              </button>
              {submitBlocked ? <p className="check-cta-note">{answerFirstNote(unanswered.length, 'above')}</p> : null}
            </div>
          ) : null}
          {playable && (!paged || onTry) && (
            <GradeCta
              result={ctaResult}
              canAdvance={canAdvance}
              busy={submitting}
              blockedReason={submitBlocked ? answerFirstNote(unanswered.length, checkOnly ? 'above' : paged ? 'learn' : 'left') : undefined}
              onSubmit={() => void submitWork()}
              onNext={advanceOrDone}
              nextLabel={nextLabel}
            />
          )}
          {!playable && nextId && (
            <div className="empty-work">
              <p>Read the idea on the left. Then continue.</p>
              <button className="btn primary" onClick={() => onPickLesson(nextId)}>
                Continue to {lessonTitle(nextId)}
              </button>
            </div>
          )}
          {!playable && !nextId && (
            <div className="empty-work">
              <p>This lesson is reading only.</p>
              <button className="btn primary" onClick={onDone}>
                Return to library
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

/**
 * One score line for a multi-question lesson. A column of eight identical
 * Correct / Incorrect banners says nothing: the banners are not attached to the
 * questions they judge, so the learner cannot tell which five were wrong.
 */
function CheckTally({
  checks,
  results,
  diagnostic
}: {
  checks: CheckPrompt[]
  results: Record<string, 'pass' | 'fail'>
  diagnostic: boolean
}) {
  const graded = checks.filter((ch) => results[ch.id])
  if (!graded.length) return null
  const right = graded.filter((ch) => results[ch.id] === 'pass').length
  const wrong = graded.length - right
  return (
    <div className={`check-tally${wrong ? '' : ' is-clean'}`} role="status">
      <p className="check-tally-score">
        <span className="is-right">{right} correct</span>
        {wrong ? <span className="is-wrong">{wrong} to review</span> : null}
      </p>
      <p className="muted">
        {wrong
          ? 'Each question on the right shows your pick, the answer in amber, and why it is the answer. Change any answer and submit again.'
          : 'Every question right.'}
      </p>
      {diagnostic && wrong ? (
        <p className="muted">Nothing is locked. This only marks which lessons to take slowly.</p>
      ) : null}
    </div>
  )
}

/** Checks sit in the teach pane unless the lesson is nothing but checks. */
function answerFirstNote(count: number, where: 'left' | 'above' | 'learn'): string {
  const place = where === 'above' ? 'above' : where === 'learn' ? 'on Learn' : 'on the left'
  if (count === 0) return `Answer the predict question ${place} first.`
  return count === 1 ? `Answer the question ${place} first.` : `Answer the ${count} questions ${place} first.`
}

function LessonComplete({
  progress,
  lessonId,
  lessonOrder,
  firstTry
}: {
  progress: Record<string, { status: string; best?: { score: number }; firstTries?: Record<string, FirstTry> }>
  lessonId: string
  lessonOrder: string[]
  firstTry: Record<string, 'pass' | 'fail'>
}) {
  let hits = 0
  let total = 0
  for (const id of lessonOrder.length ? lessonOrder : [lessonId]) {
    const stored = { ...(progress[id]?.firstTries ?? {}) }
    if (id === lessonId) {
      for (const [blockId, result] of Object.entries(firstTry)) {
        if (!stored[blockId]) stored[blockId] = { passed: result === 'pass', score: result === 'pass' ? 1 : 0 }
      }
    }
    const tally = firstTryTally(stored)
    hits += tally.hits
    total += tally.total
  }
  const scorePct = total ? Math.round((hits / total) * 100) : 0
  const pathDone = lessonOrder.filter((id) => {
    const s = progress[id]?.status
    return s === 'checked' || s === 'mastered'
  }).length
  const pathTotal = lessonOrder.length
  const selfDone = progress[lessonId]?.status === 'checked' || progress[lessonId]?.status === 'mastered'
  const shownDone = selfDone ? pathDone : Math.min(pathTotal, pathDone + 1)
  return (
    <div className="lesson-complete">
      <p className="check-kicker">Lesson complete</p>
      <strong>Congratulations!</strong>
      <p className="lesson-complete-score">
        Score {scorePct}%
        {total ? ` · ${hits} of ${total} first try` : ''}
      </p>
      {pathTotal > 1 ? (
        <p className="muted">
          {shownDone} of {pathTotal} lessons on this path
        </p>
      ) : null}
    </div>
  )
}

function Objectives({
  goal,
  world
}: {
  goal?: { all?: PlayProp[]; any?: PlayProp[]; none?: PlayProp[] }
  world: World | null
}) {
  const items = playObjectiveItems(goal, world)
  if (!items.length) return null
  const done = items.filter((i) => i.done).length
  return (
    <div className="objectives">
      <h3>
        Goal
        <span>
          {done}/{items.length}
        </span>
      </h3>
      <ul>
        {items.map((i) => (
          <li key={i.id} className={i.done ? 'is-done' : ''}>
            <span className="tick" aria-hidden>
              {i.done ? '✓' : ''}
            </span>
            {i.label}
          </li>
        ))}
      </ul>
    </div>
  )
}


function Predict({
  pred,
  value,
  onChange
}: {
  pred: { promptMd?: string; choices?: { id: string; md: string }[] }
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="predict">
      <h2>Predict</h2>
      <div className="prose" dangerouslySetInnerHTML={{ __html: md(pred.promptMd ?? '') }} />
      {pred.choices?.map((c) => (
        <label key={c.id} className={`choice${value === c.id ? ' is-on' : ''}`}>
          <input type="radio" name="pred" checked={value === c.id} onChange={() => onChange(c.id)} />
          <span dangerouslySetInnerHTML={{ __html: md(c.md) }} />
        </label>
      ))}
    </div>
  )
}

function spriteUrl(packId: string, lessonId: string, map: Record<string, string> | undefined, part: WorldPart): string | null {
  const rot = part.props.rot
  const keys = [
    typeof rot === 'number' ? `${part.id}@rot=${rot}` : '',
    typeof rot === 'number' ? `${part.type}@rot=${rot}` : '',
    part.id,
    part.type
  ].filter(Boolean)
  let mapped: string | undefined
  for (const k of keys) {
    if (map?.[k]) {
      mapped = map[k]
      break
    }
  }
  if (!mapped) return playKitSrc(part.type)
  if (mapped.startsWith('lawp-pack://')) return mapped
  if (mapped.startsWith('assets/')) return `lawp-pack://${packId}/lessons/${lessonId}/${mapped}`
  const file = mapped.replace(/^lawp-play:\/\/assets\//, '').replace(/\.svg$/i, '.png')
  return `lawp-play://assets/${file}`
}

function stepPlay(world: World, cmd: PlayCmd, playerId: string): World {
  return applyPlayCommands(world, [cmd], { playerId }).world
}

function replayPlay(
  start: World,
  commands: PlayCmd[],
  playerId: string,
  onFrame: (w: World) => void
): Promise<void> {
  return new Promise((resolve) => {
    let world = structuredClone(start)
    onFrame(world)
    let i = 0
    const tick = () => {
      if (i >= commands.length) {
        resolve()
        return
      }
      const cmd = commands[i]!
      i += 1
      if (cmd.op === 'wait') {
        window.setTimeout(tick, Math.min(2000, Math.max(1, cmd.ticks) * 180))
        return
      }
      world = stepPlay(world, cmd, playerId)
      onFrame(world)
      window.setTimeout(tick, 180)
    }
    window.setTimeout(tick, 80)
  })
}

function PageBoard({
  html,
  js,
  fixtures,
  inspect
}: {
  html: string
  js: string
  fixtures: Record<string, string>
  inspect: { selector: string; all: boolean } | null
}) {
  const [tab, setTab] = useState<'preview' | 'html' | 'css'>('preview')
  const [hits, setHits] = useState(0)
  const fixturesKey = JSON.stringify(fixtures)
  const stableFixtures = useMemo(() => fixtures, [fixturesKey])
  const page = useMemo(() => inspectPage(html), [html])
  const tabs: Array<{ id: 'preview' | 'html' | 'css'; label: string }> = [
    { id: 'preview', label: 'Preview' },
    { id: 'html', label: 'HTML' }
  ]
  if (page.css) tabs.push({ id: 'css', label: 'CSS' })
  const hitLabel = inspect
    ? hits === 0
      ? `${inspect.selector} · no match`
      : inspect.all
        ? `${inspect.selector} · ${hits} ${hits === 1 ? 'node' : 'nodes'}`
        : hits === 1
          ? `${inspect.selector} · 1 node`
          : `${inspect.selector} · first of ${hits}`
    : null
  return (
    <div className="page-board">
      <div className="page-board-tabs" role="tablist" aria-label="Page">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-on' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        {hitLabel ? (
          <button type="button" className="page-board-hit" onClick={() => setTab('preview')}>
            {hitLabel}
          </button>
        ) : null}
      </div>
      <div className={`page-board-stage${tab === 'preview' ? ' is-preview' : ' is-source'}`}>
        <div className={tab === 'preview' ? 'is-shown' : 'is-kept'}>
          <DomFrame html={html} js={js} fixtures={stableFixtures} inspect={inspect} onHits={setHits} />
        </div>
        {tab === 'html' ? (
          <CodeEditor language="html" path="files/index.html" value={page.html || html} readOnly onChange={() => undefined} />
        ) : null}
        {tab === 'css' ? (
          <CodeEditor language="css" path="page.css" value={page.css} readOnly onChange={() => undefined} />
        ) : null}
      </div>
    </div>
  )
}

function composePageSrc(html: string, js: string, fixtures: Record<string, string>): string {
  const chrome = `<style>
html,body{margin:0}
body{box-sizing:border-box;min-height:100%;font:16px/1.45 system-ui,"Segoe UI",sans-serif;color:#1c2430;background:#f3efe6;padding:16px 18px}
h1{font-size:22px;line-height:1.25;margin:0 0 .45em}
h2,h3{font-size:16px;margin:0 0 .4em}
p,li,label{font-size:15px}
ul{margin:.4em 0;padding-left:1.2em;min-height:1.6em}
ul:empty{list-style:none;padding:12px;border:1px dashed #cfc6b6;border-radius:8px;color:#8f8778}
ul:empty::after{content:"No items yet"}
input,button,select,textarea{font:inherit}
input,textarea{padding:6px 8px;border:1px solid #c9c2b4;border-radius:6px;background:#fff}
button{padding:6px 12px;border:1px solid #2a6b63;border-radius:6px;background:#1a3d38;color:#e8fff8}
.lawp-hit{outline:2px solid #2a6b63;outline-offset:3px;box-shadow:0 0 0 6px rgba(42,107,99,.22);border-radius:4px}
.lawp-hit-first{outline-color:#0f3d36}
</style>`
  const boot = `${chrome}<script>
const FIX = ${JSON.stringify(fixtures)};
window.fetch = function(url) {
  const href = String(url);
  const path = href.replace(/^https?:\\/\\/[^/]+/i, '');
  const body = FIX[href] || FIX[path] || FIX[path.replace(/^\\//, '')];
  if (body == null) return Promise.resolve(new Response('', { status: 404 }));
  return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }));
};
</script>
<script>
(function () {
  function run() {
    ${js.replace(/<\/script/gi, '<\\/script')}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
window.addEventListener('message', function (ev) {
  if (!ev.data || ev.data.lawp !== 'select') return;
  document.querySelectorAll('.lawp-hit').forEach(function (n) {
    n.classList.remove('lawp-hit', 'lawp-hit-first');
  });
  var selector = ev.data.selector;
  var all = ev.data.all === true;
  var count = 0;
  if (selector) {
    try {
      var nodes = document.querySelectorAll(selector);
      count = nodes.length;
      if (all) {
        nodes.forEach(function (n, i) {
          n.classList.add('lawp-hit');
          if (i === 0) n.classList.add('lawp-hit-first');
        });
      } else if (nodes[0]) {
        nodes[0].classList.add('lawp-hit', 'lawp-hit-first');
      }
    } catch (e) { count = 0; }
  }
  window.parent.postMessage({ lawp: 'hits', selector: selector || '', count: count }, '*');
});
</script>`
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${boot}</body>`) : `${html}${boot}`
}

function DomFrame({
  html,
  js,
  fixtures,
  inspect,
  onHits
}: {
  html: string
  js: string
  fixtures: Record<string, string>
  inspect: { selector: string; all: boolean } | null
  onHits: (count: number) => void
}) {
  const ref = useRef<HTMLIFrameElement>(null)
  const urlRef = useRef<string | null>(null)
  const [liveJs, setLiveJs] = useState(js)
  const inspectRef = useRef(inspect)
  inspectRef.current = inspect
  useEffect(() => {
    const t = window.setTimeout(() => setLiveJs(js), 140)
    return () => window.clearTimeout(t)
  }, [js])
  const src = useMemo(() => composePageSrc(html, liveJs, fixtures), [html, liveJs, fixtures])

  function tellSelect() {
    const win = ref.current?.contentWindow
    if (!win) return
    win.postMessage(
      { lawp: 'select', selector: inspectRef.current?.selector ?? '', all: inspectRef.current?.all === true },
      '*'
    )
  }

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    let cancelled = false
    let loaded = false
    const onLoad = () => {
      loaded = true
    }
    iframe.addEventListener('load', onLoad)
    const paint = () => {
      if (cancelled || !ref.current) return
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(new Blob([src], { type: 'text/html' }))
      urlRef.current = url
      ref.current.removeAttribute('srcdoc')
      ref.current.src = url
    }
    paint()
    // Only repaint if the first load never landed. Repainting a live page would
    // throw away typed input and listeners mid-inspection.
    const retry = window.setTimeout(() => {
      if (!loaded) paint()
    }, 60)
    return () => {
      cancelled = true
      iframe.removeEventListener('load', onLoad)
      window.clearTimeout(retry)
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
    }
  }, [src])

  useEffect(() => {
    tellSelect()
  }, [inspect?.selector, inspect?.all])

  useEffect(() => {
    function onMsg(ev: MessageEvent) {
      if (ev.data?.lawp === 'hits') onHits(Number(ev.data.count) || 0)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [onHits])

  return (
    <iframe
      ref={ref}
      className="dom-preview"
      title="Page preview"
      sandbox="allow-scripts"
      onLoad={() => tellSelect()}
    />
  )
}

function GridStage({
  world,
  packId,
  lessonId,
  banner
}: {
  world: World
  packId: string
  lessonId: string
  banner: { kind: 'success' | 'fail'; title: string } | null
}) {
  const cols = clampGrid(world.view?.grid?.cols ?? 5)
  const rows = clampGrid(world.view?.grid?.rows ?? 5)
  const fit = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const el = fit.current
    if (!el) return
    const measure = () => {
      const gutter = 20
      const aw = Math.max(0, el.clientWidth - gutter)
      const ah = Math.max(0, el.clientHeight)
      const z = Math.min(1, aw / (cols * GRID_CELL_PX), ah / (rows * GRID_CELL_PX))
      setZoom(Number.isFinite(z) && z > 0 ? z : 1)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cols, rows])
  const cell = GRID_CELL_PX * zoom
  const boardW = cols * cell
  const boardH = rows * cell
  const map = world.view?.assetMap
  const floorSrc = playKitSrc(world.view?.grid?.floor ?? DEFAULT_FLOOR)
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols
    const y = Math.floor(i / cols)
    const here = world.parts
      .filter((p) => Number(p.props.x ?? 0) === x && Number(p.props.y ?? 0) === y)
      .filter((p) => p.props.taken !== true)
      .sort((a, b) => playKitLayerRank(a.type) - playKitLayerRank(b.type))
    return { x, y, here }
  })
  const player =
    world.parts.find((p) => p.type === 'fox' || p.type === 'player') ?? world.parts.find((p) => p.id === 'fox')
  const px = typeof player?.props.x === 'number' ? player.props.x : 0
  const py = typeof player?.props.y === 'number' ? player.props.y : 0
  const prot = typeof player?.props.rot === 'number' ? player.props.rot : 0
  const axisStep = cell < 18 ? 8 : 1
  return (
    <div className="stage-wrap">
      <div className="stage-hud">
        <span>
          ({px}, {py})
        </span>
        <span className="stage-facing">
          <i style={{ transform: `rotate(${prot}deg)` }} />
          {prot}° {facingName(prot)}
        </span>
      </div>
      <div className="stage-fit" ref={fit}>
      <div className="stage-board" style={{ width: boardW + 20 }}>
        <div className="stage-x" style={{ ['--cols' as string]: cols, width: boardW + 20 }}>
          <span />
          {Array.from({ length: cols }, (_, x) => (
            <span key={x}>{x % axisStep === 0 || x === cols - 1 ? x : ''}</span>
          ))}
        </div>
        <div className="stage-mid">
          <div className="stage-y" style={{ ['--rows' as string]: rows, height: boardH }}>
            {Array.from({ length: rows }, (_, y) => (
              <span key={y}>{y % axisStep === 0 || y === rows - 1 ? y : ''}</span>
            ))}
          </div>
          <div className="stage-frame">
          <div
            className="stage"
            style={{
              ['--cols' as string]: cols,
              ['--rows' as string]: rows,
              width: boardW,
              height: boardH
            }}
          >
            <div className="stage-grid">
              {cells.map(({ x, y, here }) => (
                <div key={`${x}-${y}`} className="stage-cell">
                  {floorSrc ? <img className="stage-floor" src={floorSrc} alt="" /> : null}
                  {here.map((p) => {
                    const src = spriteUrl(packId, lessonId, map, p)
                    if (playKitPiece(p.type)?.layer === 'floor') {
                      return src ? <img key={p.id} className="stage-floor" src={src} alt="" /> : null
                    }
                    const rot = Number(p.props.rot ?? 0)
                    const scale = Number(p.props.scale ?? 1)
                    const isPlayer = p.type === 'fox' || p.type === 'player'
                    return (
                      <div key={p.id} className={`stage-sprite${isPlayer ? ' is-player' : ''}`}>
                        <div className="stage-art" style={{ transform: `rotate(${rot}deg) scale(${scale})` }}>
                          {src ? (
                            <img src={src} alt={String(p.props.label ?? p.type)} />
                          ) : (
                            <span className="stage-tile">{p.type}</span>
                          )}
                          {isPlayer ? <em className="facing-chevron" /> : null}
                        </div>
                        {p.props.say ? <span className="stage-say">{String(p.props.say)}</span> : null}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          {banner && (
            <div className={`stage-banner ${banner.kind}`} role="status">
              <span>{banner.title}</span>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
