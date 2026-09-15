import { useEffect, useMemo, useRef, useState } from 'react'
import { applyPlayCommands, facingName, propertyHolds, type PlayCommand, type PlayProp } from '@shared/play'
import { IPC, invoke } from '../api'
import { CodeEditor } from '../editor/CodeEditor'

type Block = Record<string, unknown> & { type: string; id?: string; md?: string; promptMd?: string }
type LessonSum = { id: string; title: string }
type WorldPart = { id: string; type: string; props: Record<string, string | number | boolean> }
type World = {
  parts: WorldPart[]
  connections?: { from: string; to: string }[]
  view?: { kind?: string; assetMap?: Record<string, string>; grid?: { cols?: number; rows?: number } }
}
type PlayCmd = PlayCommand

export function Studio({
  packId,
  lessonId,
  onPickLesson
}: {
  packId: string
  lessonId: string
  onPickLesson: (id: string) => void
}) {
  const [lesson, setLesson] = useState<{ title: string; blocks: Block[]; creation?: { id: string } } | null>(null)
  const [tree, setTree] = useState<{
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
  const [checkAns, setCheckAns] = useState('')
  const [evidence, setEvidence] = useState('')
  const [files, setFiles] = useState<{ path: string; contents: string }[]>([])
  const [output, setOutput] = useState('')
  const [banner, setBanner] = useState<{ kind: 'success' | 'fail'; title: string } | null>(null)

  const lessonOrder = useMemo(() => {
    const fromCourse = tree?.courses.flatMap((c) => c.modules.flatMap((m) => m.lessonIds)) ?? []
    if (fromCourse.length) return fromCourse
    return tree?.lessons.map((l) => l.id) ?? []
  }, [tree])
  const idx = lessonOrder.indexOf(lessonId)
  const prevId = idx > 0 ? lessonOrder[idx - 1] : undefined
  const nextId = idx >= 0 && idx < lessonOrder.length - 1 ? lessonOrder[idx + 1] : undefined
  const lessonTitle = (id: string) => tree?.lessons.find((l) => l.id === id)?.title ?? id

  async function load() {
    const l = await invoke<{ title: string; blocks: Block[]; creation?: { id: string } }>(IPC.packsLesson, { packId, lessonId })
    setLesson(l)
    setTree(await invoke(IPC.packsGet, { packId }))
    const ev = await invoke<{ lessons: Record<string, { status: string; best?: { score: number; assisted: boolean } }> }>(
      IPC.progressGet,
      { packId }
    )
    const e = ev.lessons[lessonId]
    setEvidence(e ? `${e.status}${e.best ? ` · best ${Math.round(e.best.score * 100)}%` : ''}` : '')
    const act = l.blocks.find((b) => b.type === 'activity')
    const code = l.blocks.find((b) => b.type === 'code' || b.type === 'debug')
    const startId = act?.id ?? code?.id ?? l.blocks.find((b) => b.id)?.id
    if (startId) {
      const started = await invoke<{ runId: string; world?: World }>(IPC.runStart, {
        packId,
        lessonId,
        blockId: startId
      })
      setRunId(started.runId)
      setWorld(started.world ?? null)
      setStartWorld(started.world ?? null)
    } else {
      setRunId(undefined)
      setWorld(null)
      setStartWorld(null)
    }
    if (code && Array.isArray(code.files)) {
      setFiles(
        (code.files as { path: string; role: string; contents?: string }[])
          .filter((f) => f.role === 'edit')
          .map((f) => ({ path: f.path, contents: f.contents ?? '' }))
      )
    } else setFiles([])
    setOutput('')
    setHint('')
    setHintLevel(0)
    setStatus('')
    setCompare('')
    setPredict('')
    setCheckAns('')
    setWhy('')
    setBanner(null)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId, lessonId])

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
  const checks = (lesson?.blocks.filter((b) => b.type === 'check') ?? []) as (Block & {
    choices?: { id: string; md: string }[]
    promptMd: string
    explainMd?: string
  })[]
  const playable = Boolean(activity || code || checks.length)

  async function act(actionId: string, value?: string | number) {
    if (!runId) return
    const r = await invoke<{
      world: typeof world
      goalMet: boolean
      constraintOk: boolean
      calcFault: string | null
      misconceptionIds: string[]
    }>(IPC.runActivity, { runId, actionId, payload: value !== undefined ? { value } : undefined })
    setWorld(r.world)
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

  async function checkActivity() {
    if (!runId || !activity?.id) return
    if (activity.predict && !predict) {
      setStatus('Predict first')
      setWhy('Answer the predict question on the left, then change the circuit.')
      return
    }
    const r = await invoke<{
      passed: boolean
      compare?: { current?: { score: number }; previous?: { score: number }; best?: { score: number; assisted: boolean } }
    }>(IPC.gradeBlock, { runId, packId, lessonId, blockId: activity.id })
    const c = r.compare
    setCompare(
      c
        ? `This ${Math.round((c.current?.score ?? 0) * 100)}% · Last ${c.previous ? `${Math.round(c.previous.score * 100)}%` : '—'} · Best ${c.best ? `${Math.round(c.best.score * 100)}%` : '—'}`
        : ''
    )
    setStatus(r.passed ? 'Passed' : 'Not yet')
    setWhy(r.passed ? activity.explainAfter?.promptMd ?? 'That worked.' : why || 'Try another resistance.')
    setBanner({ kind: r.passed ? 'success' : 'fail', title: r.passed ? 'SUCCESS' : 'FAIL' })
  }

  async function askHint() {
    const blockId = activity?.id ?? code?.id ?? checks[0]?.id
    if (!runId || !blockId) return
    const next = Math.min(5, hintLevel + 1)
    const h = await invoke<{ md: string; kind: string }>(IPC.hintGet, {
      runId,
      packId,
      lessonId,
      blockId,
      level: next
    })
    setHintLevel(next)
    setHint(`### Hint ${next}\n\n${h.md}`)
  }

  async function gradeCheck(block: Block) {
    const id = runId ?? (await invoke<{ runId: string }>(IPC.runStart, { packId, lessonId, blockId: block.id })).runId
    setRunId(id)
    const r = await invoke<{ passed: boolean; misconceptionIds?: string[] }>(IPC.gradeBlock, {
      runId: id,
      packId,
      lessonId,
      blockId: block.id,
      answers: checkAns
    })
    setStatus(r.passed ? 'Correct' : 'Not quite')
    const names = (r.misconceptionIds ?? []).map((i) => tree?.misconceptions.find((m) => m.id === i)?.title ?? i)
    setWhy(names.join(', ') || (r.passed ? String(block.explainMd ?? 'Yes.') : 'Try again.'))
    setBanner({ kind: r.passed ? 'success' : 'fail', title: r.passed ? 'SUCCESS' : 'FAIL' })
  }

  async function showPlayResult(r: {
    world?: World
    commands?: PlayCmd[]
    playFault?: string | null
    stdout?: string
    stderr?: string
    timedOut?: boolean
    passed?: boolean
    goalMet?: boolean
  }) {
    setBanner(null)
    setOutput((r.stdout || r.stderr || '') + (r.timedOut ? '\n(timed out)' : ''))
    const gen = ++replayGen.current
    const origin = startWorld ?? code?.play?.world ?? null
    if (origin && r.commands?.length) {
      await replayPlay(origin, r.commands, playerId, (w) => {
        if (replayGen.current === gen) setWorld(w)
      })
    }
    if (replayGen.current === gen && r.world) setWorld(r.world)
    if (r.playFault) {
      setWhy(r.playFault)
      setBanner({ kind: 'fail', title: 'FAIL' })
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
    try {
      const r = await invoke<{
        stdout: string
        stderr: string
        timedOut: boolean
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
      await showPlayResult(r)
      if (code.play) setStatus(r.playFault ? 'Fault' : r.passed ? 'On the beacon' : r.goalMet ? 'Ready to check' : '')
    } catch (e) {
      setStatus((e as Error).message)
    }
  }

  async function gradeCode() {
    if (!runId || !code?.id) return
    const r = await invoke<{
      passed: boolean
      stdout?: string
      stderr?: string
      world?: World
      commands?: PlayCmd[]
      playFault?: string | null
      goalMet?: boolean
      compare?: { current?: { score: number }; previous?: { score: number }; best?: { score: number } }
    }>(IPC.gradeBlock, { runId, packId, lessonId, blockId: code.id, files })
    await showPlayResult(r)
    setStatus(r.passed ? 'Passed' : 'Not yet')
    const c = r.compare
    setCompare(
      c
        ? `This ${Math.round((c.current?.score ?? 0) * 100)}% · Last ${c.previous ? `${Math.round(c.previous.score * 100)}%` : '—'} · Best ${c.best ? `${Math.round(c.best.score * 100)}%` : '—'}`
        : ''
    )
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) {
          if (activity) void checkActivity()
          else if (code) void gradeCode()
        } else if (code) void runCode()
        else if (activity) void checkActivity()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const actions = (
    <div className="studio-bar-actions">
      {activity && (
        <button className="btn primary" onClick={() => void checkActivity()}>
          Check
        </button>
      )}
      {code && (
        <>
          <button className="btn primary" onClick={() => void runCode()}>
            Run
          </button>
          <button className="btn" onClick={() => void gradeCode()}>
            Check
          </button>
        </>
      )}
      {checks.map((ch) => (
        <button key={ch.id} className="btn primary" onClick={() => void gradeCheck(ch)}>
          Submit
        </button>
      ))}
      {playable && (
        <button className="btn" disabled={hintLevel >= 5} onClick={() => void askHint()}>
          Hint{hintLevel ? ` ${hintLevel}/5` : ''}
        </button>
      )}
      <button
        className="btn"
        onClick={() => void invoke(IPC.progressReset, { packId, scope: 'lesson', history: 'keep', lessonId }).then(load)}
      >
        Restart
      </button>
      {lesson?.creation && (
        <button className="btn" onClick={() => void invoke(IPC.creationExport, { packId, creationId: lesson.creation!.id, kind: 'zip' })}>
          Export
        </button>
      )}
    </div>
  )

  return (
    <div className="page studio-page">
      <header className="studio-bar">
        <button className="btn" disabled={!prevId} onClick={() => prevId && onPickLesson(prevId)}>
          Back
        </button>
        <div className="studio-bar-title">
          <strong>{lesson?.title ?? 'Lesson'}</strong>
          <span className="muted">
            {idx >= 0 ? `${idx + 1} / ${lessonOrder.length}` : ''}
            {evidence ? ` · ${evidence}` : ''}
          </span>
        </div>
        {actions}
        <button className="btn" disabled={!nextId} onClick={() => nextId && onPickLesson(nextId)}>
          Next
        </button>
      </header>

      <div className="studio">
        <div className="pane teach">
          {lesson?.blocks.map((b, i) => {
            if (b.type === 'explain') return <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: md(String(b.md)) }} />
            if (b.type === 'predict') {
              return <Predict key={i} pred={b} value={predict} onChange={setPredict} />
            }
            if (b.type === 'reflect') {
              return <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: md(String(b.promptMd ?? '')) }} />
            }
            return null
          })}
          {activity?.predict && <Predict pred={activity.predict} value={predict} onChange={setPredict} />}
          {activity && (
            <div className="task prose" dangerouslySetInnerHTML={{ __html: md(activity.promptMd) }} />
          )}
          {code?.play && <Objectives goal={code.play.goal} world={world ?? startWorld} />}
          {code?.play?.guided && (
            <p className="guide">East increases <strong>x</strong>. South increases <strong>y</strong>. Run to update the list.</p>
          )}
          {code && !code.play && (
            <div
              className="task prose"
              dangerouslySetInnerHTML={{ __html: md(String(code.promptMd ?? '> Edit the file, then **Run**.')) }}
            />
          )}
          {checks.map((ch) => (
            <div key={ch.id} className="check-block">
              <h2>Check</h2>
              <div className="prose" dangerouslySetInnerHTML={{ __html: md(ch.promptMd) }} />
              {ch.choices?.map((c) => (
                <label key={c.id} className="choice">
                  <input type="radio" name="chk" checked={checkAns === c.id} onChange={() => setCheckAns(c.id)} />
                  <span dangerouslySetInnerHTML={{ __html: md(c.md) }} />
                </label>
              ))}
            </div>
          ))}
          {hint && <div className="callout hint" dangerouslySetInnerHTML={{ __html: md(hint) }} />}
          {why && <div className="callout why-inline" dangerouslySetInnerHTML={{ __html: md(why) }} />}
          {compare && <p className="compare">{compare}</p>}
        </div>

        <div className="pane work">
          {world && isGrid && (
            <GridStage world={world} packId={packId} lessonId={lessonId} banner={banner} />
          )}
          {world && activity && !isGrid && banner && (
            <div className={`stage-banner ${banner.kind} is-inline`} role="status">
              <span>{banner.title}</span>
            </div>
          )}
          {world && activity && !isGrid && (
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
          {activity?.world?.actions.map((a) => (
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
          {files.map((f) => (
            <CodeEditor
              key={f.path}
              path={f.path}
              value={f.contents}
              engine={code?.engine}
              api={code?.play ? 'player-v1' : undefined}
              onChange={(contents) => {
                setBanner(null)
                setFiles((prev) => prev.map((x) => (x.path === f.path ? { ...x, contents } : x)))
              }}
            />
          ))}
          {output && !isGrid ? <pre className="output">{output}</pre> : null}
          {!playable && nextId && (
            <div className="empty-work">
              <p>Read the idea on the left. Then continue.</p>
              <button className="btn primary" onClick={() => onPickLesson(nextId)}>
                Continue to {lessonTitle(nextId)}
              </button>
            </div>
          )}
          {!playable && !nextId && <p className="muted">This lesson is reading only.</p>}
        </div>
      </div>

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
  const items = objectiveItems(goal, world)
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

function objectiveItems(
  goal: { all?: PlayProp[] } | undefined,
  world: World | null
): { id: string; label: string; done: boolean }[] {
  const rows = goal?.all ?? []
  if (!rows.length) return []
  const used = new Set<string>()
  const out: { id: string; label: string; done: boolean }[] = []
  for (const prop of rows) {
    if (used.has(prop.path)) continue
    const [id, key] = prop.path.split('.')
    const pairKey = key === 'x' ? `${id}.y` : key === 'y' ? `${id}.x` : null
    const pair = pairKey ? rows.find((r) => r.path === pairKey && r.op === 'eq') : undefined
    if (pair && (key === 'x' || key === 'y')) {
      used.add(`${id}.x`)
      used.add(`${id}.y`)
      const x = key === 'x' ? prop.value : pair.value
      const y = key === 'y' ? prop.value : pair.value
      const beacon = world?.parts.find((p) => p.type === 'beacon' && p.props.x === x && p.props.y === y)
      const label = beacon ? `Stand on the beacon (${x}, ${y})` : `Stand on (${x}, ${y})`
      const done = world
        ? propertyHolds(world, { path: `${id}.x`, op: 'eq', value: x }) &&
          propertyHolds(world, { path: `${id}.y`, op: 'eq', value: y })
        : false
      out.push({ id: `${id}.pos`, label, done })
      continue
    }
    used.add(prop.path)
    const part = world?.parts.find((p) => p.id === id)
    const name = String(part?.props.label ?? id ?? 'it')
    let label = `${name} ${key} = ${String(prop.value)}`
    if (key === 'taken') label = `Collect the ${name.toLowerCase()}`
    if (key === 'rot') label = `Face ${prop.value}°`
    if (key === 'scale') label = `Scale to ${prop.value}`
    if (key === 'say') label = `Say “${prop.value}”`
    out.push({ id: prop.path, label, done: world ? propertyHolds(world, prop) : false })
  }
  return out
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
  if (!mapped) return null
  if (mapped.startsWith('lawp-play://') || mapped.startsWith('lawp-pack://')) return mapped
  if (mapped.startsWith('assets/')) return `lawp-pack://${packId}/lessons/${lessonId}/${mapped}`
  return `lawp-play://assets/${mapped}`
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
      world = stepPlay(world, commands[i]!, playerId)
      onFrame(world)
      i += 1
      window.setTimeout(tick, 180)
    }
    window.setTimeout(tick, 80)
  })
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
  const cols = world.view?.grid?.cols ?? 5
  const rows = world.view?.grid?.rows ?? 5
  const map = world.view?.assetMap
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols
    const y = Math.floor(i / cols)
    const here = world.parts
      .filter((p) => Number(p.props.x ?? 0) === x && Number(p.props.y ?? 0) === y)
      .filter((p) => p.props.taken !== true)
      .sort((a, b) => {
        const rank = (p: WorldPart) => (p.type === 'fox' || p.type === 'player' ? 2 : p.props.solid === true ? 0 : 1)
        return rank(a) - rank(b)
      })
    return { x, y, here }
  })
  const player =
    world.parts.find((p) => p.type === 'fox' || p.type === 'player') ?? world.parts.find((p) => p.id === 'fox')
  const px = typeof player?.props.x === 'number' ? player.props.x : 0
  const py = typeof player?.props.y === 'number' ? player.props.y : 0
  const prot = typeof player?.props.rot === 'number' ? player.props.rot : 0
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
      <div className="stage-board">
        <div className="stage-x" style={{ ['--cols' as string]: cols }}>
          <span />
          {Array.from({ length: cols }, (_, x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="stage-mid">
          <div className="stage-y" style={{ ['--rows' as string]: rows }}>
            {Array.from({ length: rows }, (_, y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
          <div className="stage-frame">
          <div className="stage" style={{ ['--cols' as string]: cols, ['--rows' as string]: rows }}>
            <div className="stage-grid">
              {cells.map(({ x, y, here }) => (
                <div key={`${x}-${y}`} className="stage-cell">
                  {here.map((p) => {
                    const src = spriteUrl(packId, lessonId, map, p)
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
  )
}

function md(s: string): string {
  const inline = (t: string) =>
    t
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
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
