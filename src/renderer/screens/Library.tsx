import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { courseLessonIds, lessonPath, orderCatalog } from '@shared/catalog'
import { IPC, invoke } from '../api'

type PackSum = {
  id: string
  title: string
  description: string
  source: string
  overlay: boolean
  lessonCount: number
  execute: string
}

type Course = {
  id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  modules: { id: string; title: string; lessonIds: string[] }[]
}

type Track = { id: string; title: string; courseIds: string[]; intro?: string }

type LessonSum = {
  id: string
  title: string
  estimatedMinutes: number
  source: string
  courseId?: string
  description?: string
}

type LessonStatus = 'not-started' | 'in-progress' | 'checked' | 'mastered' | 'retrying' | string

type Filter = 'all' | 'todo' | 'done'

const COURSE_WHY: Record<string, string> = {
  placement: 'A short quiz. No lists yet — we only ask what you already expect.',
  values: 'What a value is: number, text, true/false. You need this before any array.',
  signals: 'Call a function and walk the fox. One command at a time, then a loop.',
  data: 'Only now: lists and objects. Index and length after you know what a value is.',
  'scope-hofs': 'Functions that remember, and functions that take functions.',
  errors: 'Throw, catch, and keep walking.',
  internals: 'Prototypes, this, and iterators — the object story under the hood.',
  'event-loop': 'When code runs: stack, then, timeout. Time on the stage.',
  'the-page': 'A real document tree. Not tiles pretending to be tags.',
  'talking-servers': 'HTTP as messages. Mock fetch. No live network.',
  'the-process': 'Node: argv, files, paths, ESM.',
  craft: 'Tests, hygiene, and the capstone kit.'
}

const COURSE_LOCK: Record<string, string> = {
  values: 'Locked. The quiz comes first — then we name kinds of values.',
  signals: 'Locked. You walk the fox after you know what a number and a string are.',
  data: 'Locked. Index and length wait until values and the fox are real. A list is a container of values — not the first thing you learn.',
  errors: 'Locked. Recover from a throw after you can pass a function around.',
  internals: 'Locked. Object internals after you can catch a throw.',
  'event-loop': 'Locked. Time on the stage after the object story.',
  'talking-servers': 'Locked. HTTP after you can change a real document.',
  'the-process': 'Locked. Node after the page and fetch.',
  craft: 'Locked. Tests and the kit after you can run a process.'
}

function isDone(status?: LessonStatus) {
  return status === 'checked' || status === 'mastered'
}

function isActive(status?: LessonStatus) {
  return status === 'in-progress' || status === 'retrying' || isDone(status)
}

function isTodo(status?: LessonStatus) {
  return !isDone(status)
}

function mark(status?: LessonStatus): { kind: 'done' | 'todo' | 'progress'; label: string } {
  if (status === 'checked' || status === 'mastered') return { kind: 'done', label: 'Done' }
  if (status === 'in-progress' || status === 'retrying') return { kind: 'progress', label: 'In progress' }
  return { kind: 'todo', label: 'To do' }
}

function minutesLabel(n: number) {
  if (n >= 60) {
    const h = Math.round((n / 60) * 10) / 10
    return `${h} h`
  }
  return `${n} min`
}

export function Library({ onOpen }: { onOpen: (packId: string, lessonId: string) => void }) {
  const [packs, setPacks] = useState<PackSum[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [tree, setTree] = useState<{
    manifest?: { tracks: string[] }
    lessons: LessonSum[]
    courses: Course[]
    tracks?: Track[]
    trusted?: boolean
    execute?: string
  } | null>(null)
  const [progress, setProgress] = useState<Record<string, { status: LessonStatus }>>({})
  const [filter, setFilter] = useState<Filter>('all')
  const [skipAhead, setSkipAhead] = useState<Set<string>>(new Set())
  const [err, setErr] = useState('')

  async function reload() {
    setPacks(await invoke<PackSum[]>(IPC.packsList))
  }
  useEffect(() => {
    void reload()
  }, [])

  async function loadProgress(packId: string) {
    const ev = await invoke<{ lessons: Record<string, { status: string }> }>(IPC.progressGet, { packId })
    setProgress(ev.lessons ?? {})
  }

  async function select(id: string) {
    setOpen(id)
    setFilter('all')
    setSkipAhead(new Set())
    setTree(await invoke(IPC.packsGet, { packId: id }))
    await loadProgress(id)
  }

  const catalog = useMemo(() => {
    if (!tree) return null
    return orderCatalog(tree.manifest?.tracks ?? [], tree.tracks ?? [], tree.courses)
  }, [tree])

  const path = useMemo(() => (catalog ? lessonPath(catalog.tracks, catalog.courses) : []), [catalog])

  const nextId = path.find((id) => isTodo(progress[id]?.status))

  const counts = useMemo(() => {
    const done = path.filter((id) => isDone(progress[id]?.status)).length
    return { done, todo: path.length - done, total: path.length }
  }, [path, progress])

  const nextLesson = tree?.lessons.find((l) => l.id === nextId)

  return (
    <div className="page library-page">
      <div className="lib-title-row">
        <h1>Library</h1>
        <div className="lib-title-actions">
          <button
            className="btn primary"
            onClick={() =>
              void invoke(IPC.packsImportZip, {}).then(reload).catch((e: Error) => setErr(e.message))
            }
          >
            Install from ZIP
          </button>
          {open && (
            <button className="btn" onClick={() => void invoke(IPC.packsExportZip, { packId: open })}>
              Export pack ZIP
            </button>
          )}
          {open && tree && tree.execute && tree.execute !== 'none' && !tree.trusted && (
            <button
              className="btn danger"
              onClick={() => void invoke(IPC.trustGrant, { packId: open }).then(() => select(open))}
            >
              Trust this pack to run code
            </button>
          )}
        </div>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="cards">
        {packs.map((p) => (
          <div
            key={p.id}
            className={`card${open === p.id ? ' is-selected' : ''}`}
            onClick={() => void select(p.id)}
          >
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p className="muted">
              {p.source}
              {p.overlay ? ' · overlay' : ''} · {p.lessonCount} lessons
            </p>
          </div>
        ))}
      </div>
      {tree && open && catalog && (
        <div className="lib-pack">
          <hr className="lib-split" />
          <div className="lib-pack-head">
            <div>
              <h2>Your path</h2>
              <p className="muted">
                Play in order, like a tutorial. {counts.done} done · {counts.todo} to do
              </p>
            </div>
            <div className="lib-filters" role="tablist" aria-label="Lesson status">
              {(
                [
                  ['all', `All (${counts.total})`],
                  ['todo', `To do (${counts.todo})`],
                  ['done', `Done (${counts.done})`]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  className={`btn${filter === id ? ' primary' : ''}`}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {nextLesson && (
            <button type="button" className="lib-next" onClick={() => onOpen(open, nextLesson.id)}>
              <span className="lib-level-kicker">{path.indexOf(nextLesson.id) === 0 ? 'Start here' : 'Play next'}</span>
              <strong>{nextLesson.title}</strong>
              <span className="muted">
                {nextLesson.description || 'The next step on this path.'}
              </span>
            </button>
          )}
          {!nextLesson && path.length > 0 && (
            <p className="lib-next is-done-path">Path complete. You can replay any card below.</p>
          )}

          {catalog.tracks.map((track, trackIndex) => {
            const courses = track.courseIds.flatMap((id) => {
              const course = catalog.courses.find((c) => c.id === id)
              return course ? [course] : []
            })
            const lessonIds = courses.flatMap(courseLessonIds)
            const prev = catalog.tracks[trackIndex - 1]
            const prevIds = prev
              ? prev.courseIds.flatMap((id) => {
                  const course = catalog.courses.find((c) => c.id === id)
                  return course ? courseLessonIds(course) : []
                })
              : []
            const prevComplete =
              trackIndex === 0 || (prevIds.length > 0 && prevIds.every((id) => isDone(progress[id]?.status)))
            const alreadyIn = lessonIds.some((id) => isActive(progress[id]?.status))
            const unlocked = prevComplete || alreadyIn || skipAhead.has(`track:${track.id}`)
            return (
              <section key={track.id} className={`lib-level${unlocked ? '' : ' is-locked'}`}>
                <header className="lib-level-head">
                  <p className="lib-level-kicker">
                    Chapter {trackIndex + 1} · {track.title}
                  </p>
                  <h3>{track.intro ?? track.title}</h3>
                  {!unlocked && (
                    <p className="lib-lock-note">
                      Finish Chapter {trackIndex} first — this is later in the tutorial.
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setSkipAhead((s) => new Set(s).add(`track:${track.id}`))}
                      >
                        Skip ahead
                      </button>
                    </p>
                  )}
                </header>
                {unlocked &&
                  courses.map((course, courseIndex) => {
                    const prevCourse = courses[courseIndex - 1]
                    const prevCourseIds = prevCourse ? courseLessonIds(prevCourse) : []
                    const prevCourseDone =
                      courseIndex === 0 ||
                      (prevCourseIds.length > 0 && prevCourseIds.every((id) => isDone(progress[id]?.status)))
                    const courseStarted = courseLessonIds(course).some((id) => isActive(progress[id]?.status))
                    const courseOpen =
                      prevCourseDone || courseStarted || skipAhead.has(`course:${course.id}`)
                    const visible = course.modules.flatMap((mod) =>
                      mod.lessonIds.flatMap((id) => {
                        const lesson = tree.lessons.find((x) => x.id === id)
                        const status = progress[id]?.status
                        const show = filter === 'all' || (filter === 'done' ? isDone(status) : isTodo(status))
                        if (!show) return []
                        return [{ id, lesson, moduleTitle: mod.title, status, step: path.indexOf(id) + 1 }]
                      })
                    )
                    if (!courseOpen) {
                      if (filter === 'done') return null
                      return (
                        <div key={course.id} className="lib-course is-locked">
                          <div className="lib-course-head">
                            <div>
                              <h4>
                                <span className="lib-course-num">
                                  {trackIndex + 1}.{courseIndex + 1}
                                </span>{' '}
                                {course.title}
                              </h4>
                              <p className="lib-course-why">{COURSE_WHY[course.id] ?? ''}</p>
                              <p className="lib-lock-note">
                                {COURSE_LOCK[course.id] ??
                                  (prevCourse
                                    ? `Locked. Finish “${prevCourse.title}” first.`
                                    : 'Locked until the step above is done.')}
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => setSkipAhead((s) => new Set(s).add(`course:${course.id}`))}
                                >
                                  Skip ahead
                                </button>
                              </p>
                            </div>
                            <span className="muted">{minutesLabel(course.estimatedMinutes)}</span>
                          </div>
                        </div>
                      )
                    }
                    if (!visible.length) return null
                    return (
                      <div key={course.id} className="lib-course">
                        <div className="lib-course-head">
                          <div>
                            <h4>
                              <span className="lib-course-num">
                                {trackIndex + 1}.{courseIndex + 1}
                              </span>{' '}
                              {course.title}
                            </h4>
                            <p className="lib-course-why">{COURSE_WHY[course.id] ?? ''}</p>
                          </div>
                          <span className="muted">{minutesLabel(course.estimatedMinutes)}</span>
                        </div>
                        <div className="lib-lesson-grid">
                          {visible.map(({ id, lesson, moduleTitle, status, step }) => (
                            <LessonCard
                              key={id}
                              packId={open}
                              lessonId={id}
                              step={step}
                              next={id === nextId}
                              title={lesson?.title ?? id}
                              description={lesson?.description ?? ''}
                              minutes={lesson?.estimatedMinutes ?? 0}
                              moduleTitle={moduleTitle}
                              status={status}
                              onOpen={() => onOpen(open, id)}
                              onChanged={() => void loadProgress(open)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </section>
            )
          })}

          {catalog.courses
            .filter((c) => !catalog.tracks.some((t) => t.courseIds.includes(c.id)))
            .map((course) => (
              <section key={course.id} className="lib-level">
                <header className="lib-level-head">
                  <p className="lib-level-kicker">Also in this pack</p>
                  <h3>{course.title}</h3>
                </header>
                <div className="lib-lesson-grid">
                  {course.modules
                    .flatMap((mod) => mod.lessonIds.map((id) => ({ id, mod })))
                    .filter(({ id }) => {
                      const status = progress[id]?.status
                      return filter === 'all' || (filter === 'done' ? isDone(status) : isTodo(status))
                    })
                    .map(({ id, mod }) => {
                      const lesson = tree.lessons.find((x) => x.id === id)
                      return (
                        <LessonCard
                          key={id}
                          packId={open}
                          lessonId={id}
                          step={path.indexOf(id) + 1}
                          next={id === nextId}
                          title={lesson?.title ?? id}
                          description={lesson?.description ?? ''}
                          minutes={lesson?.estimatedMinutes ?? 0}
                          moduleTitle={mod.title}
                          status={progress[id]?.status}
                          onOpen={() => onOpen(open, id)}
                          onChanged={() => void loadProgress(open)}
                        />
                      )
                    })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  )
}

function LessonCard({
  packId,
  lessonId,
  step,
  next,
  title,
  description,
  minutes,
  moduleTitle,
  status,
  onOpen,
  onChanged
}: {
  packId: string
  lessonId: string
  step: number
  next: boolean
  title: string
  description: string
  minutes: number
  moduleTitle: string
  status?: LessonStatus
  onOpen: () => void
  onChanged: () => void
}) {
  const m = mark(status)
  return (
    <article className={`lib-lesson-card is-${m.kind}${next ? ' is-next' : ''}`}>
      <button type="button" className="lib-lesson-main" onClick={onOpen}>
        <span className="lib-card-top">
          <span className={`lib-mark is-${m.kind}`}>{m.label}</span>
          {step > 0 ? <span className="lib-step">Step {step}</span> : null}
        </span>
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
        <span className="muted">
          {moduleTitle}
          {minutes ? ` · ${minutesLabel(minutes)}` : ''}
        </span>
      </button>
      <div className="lib-lesson-actions">
        <IconBtn
          label="Export lesson"
          onClick={() => void invoke(IPC.packsExportZip, { packId, lessonId })}
        >
          <ExportIcon />
        </IconBtn>
        <IconBtn
          label="Restart lesson"
          onClick={() =>
            void invoke(IPC.progressReset, { packId, scope: 'lesson', history: 'keep', lessonId }).then(onChanged)
          }
        >
          <RestartIcon />
        </IconBtn>
        <IconBtn
          label="Clear history"
          danger
          onClick={() => {
            if (!confirm(`Clear history for “${title}”? This drops the attempt log for this lesson.`)) return
            void invoke(IPC.progressReset, { packId, scope: 'lesson', history: 'clear', lessonId }).then(onChanged)
          }}
        >
          <ClearIcon />
        </IconBtn>
      </div>
    </article>
  )
}

function IconBtn({
  label,
  danger,
  onClick,
  children
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className={`btn icon-btn${danger ? ' danger' : ''}`} title={label} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 2.2 11.3 5.5h-2V9H6.7V5.5h-2L8 2.2Zm-5 8.3h10v3.3H3V10.5Zm1.2 1.2v.9h7.6v-.9H4.2Z"
      />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 2.5a5.5 5.5 0 1 1-4.7 2.6l1.1.7A4.2 4.2 0 1 0 8 3.8V6L11 3.2 8 .5V2.5Z"
      />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M6.2 2h3.6l.4 1H14v1.2H2V3h3.8l.4-1ZM3.5 5.4h9l-.6 8.1H4.1L3.5 5.4Zm2.2 1.3v5.4h1.2V6.7H5.7Zm3.4 0v5.4h1.2V6.7H9.1Z" />
    </svg>
  )
}
