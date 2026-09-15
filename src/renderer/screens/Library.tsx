import { useEffect, useMemo, useRef, useState } from 'react'
import { courseLessonIds, lessonPath, orderCatalog } from '@shared/catalog'
import { lessonCard } from '@shared/lessonCards'
import { groupPacks, packCoverUrl } from '@shared/packDisplay'
import { IPC, invoke } from '../api'
import { BackIcon, IconBtn } from '../ui/IconBtn'
import { LessonIcon } from '../ui/LessonIcon'
import { OverflowMenu } from '../ui/OverflowMenu'
import { PackCard } from '../ui/PackCard'

type PackSum = {
  id: string
  title: string
  description: string
  source: string
  overlay: boolean
  lessonCount: number
  execute: string
  category?: string
  cover?: string
  subjects?: string[]
  engines?: string[]
}

type Course = {
  id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  diagnosticLessonId?: string
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

const scrollCache: Record<string, number> = {}

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
  craft: 'Tests, hygiene, and the capstone kit.',
  kinds: 'Every way a question can look. Play them to see how answering works.'
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

function introLessonId(course: Course): string | undefined {
  return course.diagnosticLessonId ?? (course.id === 'placement' ? courseLessonIds(course)[0] : undefined)
}

export function Library({
  packId,
  lessonId,
  onOpen,
  onSelectPack,
  onBackToPacks
}: {
  packId?: string
  lessonId?: string
  onOpen: (packId: string, lessonId: string) => void
  onSelectPack: (packId: string) => void
  onBackToPacks: () => void
}) {
  const [packs, setPacks] = useState<PackSum[]>([])
  const [open, setOpen] = useState<string | null>(packId ?? null)
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
  const pageRef = useRef<HTMLDivElement>(null)
  const scrollReady = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function reload() {
    setPacks(await invoke<PackSum[]>(IPC.packsList))
  }
  useEffect(() => {
    void reload()
  }, [])

  async function loadProgress(id: string) {
    const ev = await invoke<{ lessons: Record<string, { status: string }> }>(IPC.progressGet, { packId: id })
    setProgress(ev.lessons ?? {})
  }

  async function loadPack(id: string) {
    setOpen(id)
    setTree(await invoke(IPC.packsGet, { packId: id }))
    await loadProgress(id)
  }

  useEffect(() => {
    if (!packId) {
      setOpen(null)
      setTree(null)
      return
    }
    if (open !== packId) {
      setFilter('all')
      setSkipAhead(new Set())
    }
    void loadPack(packId).catch(() => {
      setOpen(null)
      setTree(null)
    })
  }, [packId])

  async function saveScroll() {
    const id = open
    const el = pageRef.current
    if (!id || !el || !scrollReady.current) return
    scrollCache[id] = el.scrollTop
    const session = await invoke<{ libraryScroll?: Record<string, number> }>(IPC.sessionGet)
    await invoke(IPC.sessionSet, { libraryScroll: { ...(session.libraryScroll ?? {}), [id]: el.scrollTop } })
  }

  useEffect(() => {
    scrollReady.current = false
    if (!open || !tree) return
    let cancelled = false
    void invoke<{ libraryScroll?: Record<string, number> }>(IPC.sessionGet).then((session) => {
      if (cancelled) return
      const y = scrollCache[open] ?? session.libraryScroll?.[open] ?? 0
      requestAnimationFrame(() => {
        const el = pageRef.current
        if (!el) return
        if (y > 0) el.scrollTop = y
        else if (lessonId) {
          el.querySelector(`[data-lesson-id="${lessonId}"]`)?.scrollIntoView({ block: 'center', inline: 'nearest' })
        }
        scrollReady.current = true
      })
    })
    return () => {
      cancelled = true
    }
  }, [open, tree, lessonId])

  function onPageScroll() {
    if (!scrollReady.current) return
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => void saveScroll(), 120)
  }

  function openLesson(id: string) {
    void saveScroll().then(() => onOpen(open!, id))
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

  const pack = packs.find((p) => p.id === open)
  const inPack = Boolean(packId || open)

  return (
    <div className="page library-page" ref={pageRef} onScroll={onPageScroll}>
      <div className={`lib-title-row${inPack && pack ? ' is-hero' : ''}`}>
        {inPack && pack ? <PackCover pack={pack} /> : null}
        <div className="lib-title-lead">
          {inPack ? (
            <IconBtn label="All libraries" onClick={onBackToPacks}>
              <BackIcon />
            </IconBtn>
          ) : null}
          <div className="lib-title-text">
            <h1>{inPack ? (pack?.title ?? 'Lessons') : 'Library'}</h1>
            {inPack && pack?.description ? <p className="lib-title-blurb">{pack.description}</p> : null}
          </div>
        </div>
        <div className="lib-title-actions">
          {inPack && tree && open && catalog && (
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
          )}
          {!inPack && (
            <button
              className="btn primary"
              onClick={() =>
                void invoke(IPC.packsImportZip, {}).then(reload).catch((e: Error) => setErr(e.message))
              }
            >
              Install from ZIP
            </button>
          )}
          {inPack && open && (
            <button className="btn" onClick={() => void invoke(IPC.packsExportZip, { packId: open })}>
              Export pack ZIP
            </button>
          )}
          {inPack && open && tree && tree.execute && tree.execute !== 'none' && !tree.trusted && (
            <button
              className="btn danger"
              onClick={() => void invoke(IPC.trustGrant, { packId: open }).then(() => void loadPack(open))}
            >
              Trust this pack to run code
            </button>
          )}
        </div>
      </div>
      {err && <p className="err">{err}</p>}
      {!inPack && (
        <div className="pack-shelves">
          {groupPacks(packs).map((shelf) => (
            <section key={shelf.category} className="pack-shelf">
              <header className="pack-shelf-head">
                <p className="lib-level-kicker">{shelf.category}</p>
                <h2>{shelf.category === 'Your packs' ? 'Packs you made' : shelf.category}</h2>
              </header>
              <div className="pack-grid">
                {shelf.packs.map((p) => (
                  <PackCard key={p.id} pack={p} onOpen={() => onSelectPack(p.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {inPack && !catalog && <p className="muted">Loading lessons…</p>}
      {inPack && tree && open && catalog && (
        <div className="lib-pack">
          {nextLesson &&
            !catalog.courses.some((c) => introLessonId(c) === nextLesson.id && filter !== 'done') && (
            <button type="button" className="lib-next" onClick={() => openLesson(nextLesson.id)}>
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
                  <h3>
                    <span className="lib-course-num">Chapter {trackIndex + 1}</span> — {track.title}
                  </h3>
                  {track.intro && track.intro !== track.title && (
                    <p className="lib-level-intro">{track.intro}</p>
                  )}
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
                    const introId = introLessonId(course)
                    if (introId && !courseOpen) {
                      if (filter === 'done') return null
                      return (
                        <IntroRow
                          key={course.id}
                          course={course}
                          num={`${trackIndex + 1}.${courseIndex + 1}`}
                          lesson={tree.lessons.find((x) => x.id === introId)}
                          status={progress[introId]?.status}
                          next={introId === nextId}
                          locked
                          lockNote={
                            COURSE_LOCK[course.id] ??
                            (prevCourse
                              ? `Locked. Finish “${prevCourse.title}” first.`
                              : 'Locked until the step above is done.')
                          }
                          onSkip={() => setSkipAhead((s) => new Set(s).add(`course:${course.id}`))}
                          packId={open}
                          onOpen={() => openLesson(introId)}
                          onChanged={() => void loadProgress(open)}
                        />
                      )
                    }
                    if (introId && courseOpen) {
                      const intro = visible.find((v) => v.id === introId)
                      if (!intro) return null
                      return (
                        <IntroRow
                          key={course.id}
                          course={course}
                          num={`${trackIndex + 1}.${courseIndex + 1}`}
                          lesson={intro.lesson}
                          status={intro.status}
                          next={intro.id === nextId}
                          packId={open}
                          onOpen={() => openLesson(intro.id)}
                          onChanged={() => void loadProgress(open)}
                        />
                      )
                    }
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
                                — {course.title}
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
                              — {course.title}
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
                              current={id === lessonId}
                              onOpen={() => openLesson(id)}
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
                          current={id === lessonId}
                          onOpen={() => openLesson(id)}
                          onChanged={() => void loadProgress(open)}
                        />
                      )
                    })}
                </div>
              </section>
            ))}

          {tree.lessons
            .filter((l) => !path.includes(l.id))
            .filter((l) => {
              const status = progress[l.id]?.status
              return filter === 'all' || (filter === 'done' ? isDone(status) : isTodo(status))
            }).length > 0 && (
            <section className="lib-level">
              <header className="lib-level-head">
                <p className="lib-level-kicker">Unfiled</p>
                <h3>Not yet on a path</h3>
                <p className="lib-level-intro">Open them here, or add them to a course in Author.</p>
              </header>
              <div className="lib-lesson-grid">
                {tree.lessons
                  .filter((l) => !path.includes(l.id))
                  .filter((l) => {
                    const status = progress[l.id]?.status
                    return filter === 'all' || (filter === 'done' ? isDone(status) : isTodo(status))
                  })
                  .map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      packId={open}
                      lessonId={lesson.id}
                      step={0}
                      next={lesson.id === nextId}
                      title={lesson.title}
                      description={lesson.description ?? ''}
                      minutes={lesson.estimatedMinutes}
                      moduleTitle="Unfiled"
                      status={progress[lesson.id]?.status}
                      current={lesson.id === lessonId}
                      onOpen={() => openLesson(lesson.id)}
                      onChanged={() => void loadProgress(open)}
                    />
                  ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function lessonMenu(packId: string, lessonId: string, title: string, onChanged: () => void) {
  return [
    {
      label: 'Export lesson',
      onClick: () => void invoke(IPC.packsExportZip, { packId, lessonId })
    },
    {
      label: 'Restart lesson',
      onClick: () =>
        void invoke(IPC.progressReset, { packId, scope: 'lesson', history: 'keep', lessonId }).then(onChanged)
    },
    {
      label: 'Clear history',
      danger: true,
      onClick: () => {
        if (!confirm(`Clear history for “${title}”? This drops the attempt log for this lesson.`)) return
        void invoke(IPC.progressReset, { packId, scope: 'lesson', history: 'clear', lessonId }).then(onChanged)
      }
    }
  ]
}

/**
 * The shelf cover again, this time as the backdrop of the pack you opened, so
 * the page you browse in looks like the card you clicked. Decoration only — it
 * carries no information the text below does not, and it steps aside when the
 * pack has no art.
 */
function PackCover({ pack }: { pack: PackSum }) {
  const [broken, setBroken] = useState(false)
  if (broken) return null
  return (
    <div className="lib-title-art" aria-hidden="true">
      <img src={packCoverUrl(pack.id, pack.cover)} alt="" onError={() => setBroken(true)} />
    </div>
  )
}

function IntroRow({
  course,
  num,
  lesson,
  status,
  next,
  locked,
  lockNote,
  onSkip,
  packId,
  onOpen,
  onChanged
}: {
  course: Course
  /** Its place in the chapter, e.g. `1.1`. A compact row is still a numbered section. */
  num: string
  lesson?: LessonSum
  status?: LessonStatus
  next: boolean
  locked?: boolean
  lockNote?: string
  onSkip?: () => void
  packId: string
  onOpen: () => void
  onChanged: () => void
}) {
  const id = lesson?.id ?? introLessonId(course) ?? course.id
  const title = lesson?.title ?? course.title
  const copy = lessonCard(id)
  const m = mark(status)
  return (
    <div
      data-lesson-id={id}
      className={`lib-intro-row${locked ? ' is-locked' : ''}${next ? ' is-next' : ''}`}
    >
      <button type="button" className="lib-intro-main" onClick={onOpen} disabled={locked}>
        <span className="lib-level-kicker">
          <span className="lib-course-num">{num}</span> — {course.title}
          {next ? ' · Start here' : null}
        </span>
        <span className="lib-intro-title">
          {copy ? <LessonIcon name={copy.icon} color={copy.color} size={18} /> : null}
          <strong>{title}</strong>
        </span>
        <span className="muted">{COURSE_WHY[course.id] || copy?.description || lesson?.description || ''}</span>
        {locked && lockNote ? <span className="lib-lock-note">{lockNote}</span> : null}
      </button>
      <div className="lib-intro-side">
        <span className={`lib-mark is-${m.kind}`}>{m.label}</span>
        {lesson?.estimatedMinutes ? <span className="muted">{minutesLabel(lesson.estimatedMinutes)}</span> : null}
        {locked && onSkip ? (
          <button type="button" className="btn" onClick={onSkip}>
            Skip ahead
          </button>
        ) : (
          <OverflowMenu items={lessonMenu(packId, id, title, onChanged)} />
        )}
      </div>
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
  current,
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
  current?: boolean
  onOpen: () => void
  onChanged: () => void
}) {
  const copy = lessonCard(lessonId)
  const blurb = copy?.description ?? description
  const tags = copy?.tags ?? []
  const m = mark(status)
  return (
    <article
      data-lesson-id={lessonId}
      className={`lib-lesson-card is-${m.kind}${next ? ' is-next' : ''}${current ? ' is-current' : ''}`}
    >
      <div className="lib-lesson-more">
        <OverflowMenu items={lessonMenu(packId, lessonId, title, onChanged)} />
      </div>
      <button type="button" className="lib-lesson-main" onClick={onOpen}>
        <span className="lib-lesson-head">
          {copy ? <LessonIcon name={copy.icon} color={copy.color} /> : null}
          <strong>{title}</strong>
        </span>
        <span className="lib-lesson-mid">
          <span className={`lib-lesson-body${blurb ? '' : ' is-empty'}`}>
            {blurb || 'Open to play this lesson.'}
          </span>
          {tags.length ? (
            <span className="lib-lesson-tags">
              {tags.map((tag) => (
                <span key={tag} className="lib-lesson-tag">
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </span>
        <span className="lib-lesson-foot">
          <span className="lib-lesson-foot-status">
            <em className={`is-${m.kind}`}>{m.label}</em>
            {step > 0 ? <span className="lib-lesson-step">{step}</span> : null}
          </span>
          <span className="lib-lesson-foot-meta">
            <span className="lib-lesson-mod">{moduleTitle}</span>
            {minutes ? <span className="lib-lesson-mins">{minutesLabel(minutes)}</span> : null}
          </span>
        </span>
      </button>
    </article>
  )
}
