import { useEffect, useState } from 'react'
import { BLOCK_TYPE_LABEL, blankBlock, blankCheck, blankLesson, type BlockType, type DraftLesson } from '@shared/authoring'
import { CHECK_KIND_LABEL, CHECK_KINDS, type CheckKind } from '@shared/check'
import { IPC, invoke } from '../api'
import { BlockEditor } from '../author/BlockEditors'
import { NumInput, TextArea, TextInput } from '../author/fields'

type PackSum = { id: string; title: string }
type LessonSum = { id: string; title: string }

const ADD_GROUPS: { title: string; items: { type: BlockType; blurb: string }[] }[] = [
  {
    title: 'Teach',
    items: [
      { type: 'explain', blurb: 'The idea, in words.' },
      { type: 'predict', blurb: 'Ask before they try.' },
      { type: 'reflect', blurb: 'Say it in their own words.' }
    ]
  },
  {
    title: 'Play',
    items: [
      { type: 'activity', blurb: 'A world they can change.' },
      { type: 'code', blurb: 'Write and run a program.' },
      { type: 'debug', blurb: 'A broken starter to fix.' },
      { type: 'project', blurb: 'A longer keep-working brief.' }
    ]
  }
]

const QUESTION_GROUPS: { title: string; kinds: CheckKind[] }[] = [
  { title: 'Choose', kinds: ['mcq', 'multi', 'odd', 'tf', 'image'] },
  { title: 'Type', kinds: ['short', 'select', 'numeric', 'fix'] },
  { title: 'Fill', kinds: ['cloze', 'bank', 'hottext'] },
  { title: 'Arrange', kinds: ['match', 'order', 'bins', 'venn', 'table'] },
  { title: 'On a picture', kinds: ['place', 'hotspot', 'gorder'] },
  { title: 'More', kinds: ['tier', 'slider', 'numberline', 'listen'] }
]

export function Author({ onOpen }: { onOpen: (packId: string, lessonId: string) => void }) {
  const [packs, setPacks] = useState<PackSum[]>([])
  const [lessons, setLessons] = useState<LessonSum[]>([])
  const [templates, setTemplates] = useState<{ id: string; title: string }[]>([])
  const [mode, setMode] = useState<'new' | 'open'>('new')
  const [packId, setPackId] = useState('')
  const [newPack, setNewPack] = useState(false)
  const [packTitle, setPackTitle] = useState('')
  const [lessonId, setLessonId] = useState('my-lesson')
  const [lessonTitle, setLessonTitle] = useState('Untitled lesson')
  const [idLocked, setIdLocked] = useState(false)
  const [templateId, setTemplateId] = useState('blank')
  const [draft, setDraft] = useState<DraftLesson | null>(null)
  const [openBlock, setOpenBlock] = useState(0)
  const [settings, setSettings] = useState(false)
  const [palette, setPalette] = useState<'block' | 'question' | null>(null)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function reloadPacks() {
    const list = await invoke<PackSum[]>(IPC.packsList)
    setPacks(list)
    if (!packId && list[0]) setPackId(list[0].id)
  }

  async function loadLessons(id: string) {
    if (!id) {
      setLessons([])
      return
    }
    try {
      const tree = await invoke<{ lessons: LessonSum[] }>(IPC.packsGet, { packId: id })
      setLessons(tree.lessons)
      if (mode === 'open' && tree.lessons[0] && !tree.lessons.some((l) => l.id === lessonId)) {
        setLessonId(tree.lessons[0].id)
      }
    } catch {
      setLessons([])
    }
  }

  useEffect(() => {
    void reloadPacks()
    void invoke<{ id: string; title: string }[]>(IPC.authorTemplates).then((t) => {
      setTemplates(t.filter((x) => x.id === 'blank' || x.title))
      if (t.some((x) => x.id === 'blank')) setTemplateId('blank')
    })
  }, [])

  useEffect(() => {
    void loadLessons(packId)
  }, [packId, mode])

  useEffect(() => {
    if (!packs.length) setNewPack(true)
  }, [packs.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (draft) void persist()
      }
      if (e.key === 'Escape') {
        setPalette(null)
        setSettings(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const activePack = packs.find((p) => p.id === packId)

  function setLesson(next: DraftLesson) {
    setDraft(next)
    setLessonId(next.id)
    setPackId(next.packId)
    setLessonTitle(next.title)
    setDirty(false)
    setSettings(false)
    setPalette(null)
    setOpenBlock(0)
  }

  function patch(partial: Partial<DraftLesson>) {
    if (!draft) return
    setDraft({ ...draft, ...partial })
    setDirty(true)
  }

  function setBlock(i: number, block: Record<string, unknown>) {
    if (!draft) return
    const blocks = draft.blocks.slice()
    blocks[i] = block
    patch({ blocks })
  }

  function moveBlock(i: number, dir: -1 | 1) {
    if (!draft) return
    const j = i + dir
    if (j < 0 || j >= draft.blocks.length) return
    const blocks = draft.blocks.slice()
    ;[blocks[i], blocks[j]] = [blocks[j]!, blocks[i]!]
    patch({ blocks })
    setOpenBlock(j)
  }

  function addBlock(type: BlockType, kind?: CheckKind) {
    if (!draft) return
    const next = type === 'check' ? blankCheck(kind ?? 'mcq') : blankBlock(type)
    patch({ blocks: [...draft.blocks, next] })
    setOpenBlock(draft.blocks.length)
    setPalette(null)
  }

  function resolvedPackId() {
    if (newPack) return slug(packTitle, '.') || 'my.course'
    return packId
  }

  async function create() {
    const pid = resolvedPackId()
    const lid = lessonId || slug(lessonTitle)
    setBusy(true)
    try {
      const created = (await invoke<DraftLesson>(IPC.authorCreate, {
        templateId,
        packId: pid,
        lessonId: lid
      })) as DraftLesson
      const next = asDraft({ ...created, title: lessonTitle || created.title })
      await invoke(IPC.authorSave, { packId: next.packId, lessonId: next.id, lesson: next })
      setLesson(next)
      setMsg({ kind: 'ok', text: 'Lesson created. Add blocks, then Play.' })
      await reloadPacks()
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function openExisting() {
    if (!packId || !lessonId) return
    setBusy(true)
    try {
      const lesson = (await invoke<DraftLesson>(IPC.authorOpen, { packId, lessonId })) as DraftLesson
      setLesson(asDraft(lesson))
      setMsg({ kind: 'ok', text: 'Opened. Learners never see the answers in these forms.' })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function persist() {
    if (!draft) return
    setBusy(true)
    try {
      await invoke(IPC.authorSave, { packId: draft.packId, lessonId: draft.id, lesson: draft })
      setDirty(false)
      setMsg({ kind: 'ok', text: 'Saved.' })
      await reloadPacks()
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function validate() {
    if (!draft) return
    const r = await invoke<{ ok: boolean; issues: { path: string; message: string }[] }>(IPC.authorValidate, {
      packId: draft.packId,
      lessonId: draft.id
    })
    setMsg(
      r.ok
        ? { kind: 'ok', text: 'Looks valid. Play it to be sure.' }
        : { kind: 'err', text: r.issues.map((i) => `${i.path}: ${i.message}`).join(' · ') }
    )
  }

  async function importAsset() {
    if (!draft) return
    const r = await invoke<{ cancelled?: boolean; path?: string }>(IPC.authorImportAsset, {
      packId: draft.packId,
      lessonId: draft.id
    })
    if (r.path) setMsg({ kind: 'ok', text: `Imported ${r.path}. Paste that path into an image or audio field.` })
  }

  const current = draft?.blocks[openBlock]
  const currentType = current ? String(current.type) : ''

  if (!draft) {
    return (
      <div className="page author-page is-start">
        <div className="author-start">
          <p className="author-kicker">Author</p>
          <h1>Make a lesson</h1>
          <p className="author-lead">The learner will play this in Studio. You fill forms — not JSON.</p>

          <div className="author-tabs" role="tablist">
            <button type="button" className={mode === 'new' ? 'is-on' : ''} onClick={() => setMode('new')}>
              New
            </button>
            <button type="button" className={mode === 'open' ? 'is-on' : ''} onClick={() => setMode('open')}>
              Open
            </button>
          </div>

          {mode === 'new' ? (
            <>
              <div className="author-pack-row">
                <button type="button" className={!newPack ? 'is-on' : ''} onClick={() => setNewPack(false)}>
                  Existing pack
                </button>
                <button type="button" className={newPack ? 'is-on' : ''} onClick={() => setNewPack(true)}>
                  New pack
                </button>
              </div>
              {newPack ? (
                <label className="author-field">
                  <span>Pack name</span>
                  <input
                    value={packTitle}
                    onChange={(e) => setPackTitle(e.target.value)}
                    placeholder="Plants"
                  />
                  <small className="muted">Saved as {slug(packTitle, '.') || 'my.course'}</small>
                </label>
              ) : (
                <PackGrid packs={packs} value={packId} onChange={setPackId} />
              )}
              <label className="author-field">
                <span>Lesson title</span>
                <input
                  className="author-title-input"
                  value={lessonTitle}
                  onChange={(e) => {
                    const title = e.target.value
                    setLessonTitle(title)
                    if (!idLocked) setLessonId(slug(title))
                  }}
                  placeholder="Why leaves are green"
                />
              </label>
              <label className="author-field is-compact">
                <span>Id</span>
                <input
                  value={lessonId}
                  onChange={(e) => {
                    setIdLocked(true)
                    setLessonId(slug(e.target.value) || e.target.value)
                  }}
                />
              </label>
              <label className="author-field is-compact">
                <span>Start with</span>
                <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id === 'blank' ? 'Empty page' : t.title}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn primary author-go" disabled={busy} onClick={() => void create()}>
                Create lesson
              </button>
            </>
          ) : (
            <>
              <PackGrid packs={packs} value={packId} onChange={setPackId} />
              {lessons.length ? (
                <ul className="author-lesson-list">
                  {lessons.map((l) => (
                    <li key={l.id}>
                      <button type="button" className={lessonId === l.id ? 'is-on' : ''} onClick={() => setLessonId(l.id)}>
                        <strong>{l.title}</strong>
                        <span className="muted">{l.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">This pack has no lessons yet. Use New.</p>
              )}
              <button
                type="button"
                className="btn primary author-go"
                disabled={busy || !lessonId}
                onClick={() => void openExisting()}
              >
                Open lesson
              </button>
            </>
          )}
          {msg ? <p className={msg.kind === 'ok' ? 'ok' : 'err'}>{msg.text}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="page author-page is-work">
      <header className="author-bar">
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (dirty && !confirm('Leave without saving?')) return
            setDraft(null)
            setMsg(null)
          }}
        >
          Lessons
        </button>
        <div className="author-bar-title">
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            aria-label="Lesson title"
          />
          <span className="muted">
            {activePack?.title ?? draft.packId}
            {dirty ? ' · unsaved' : ''}
          </span>
        </div>
        <div className="author-bar-actions">
          <button type="button" className="btn" onClick={() => setSettings((s) => !s)}>
            Details
          </button>
          <button type="button" className="btn" disabled={busy} onClick={() => void validate()}>
            Check
          </button>
          <button type="button" className="btn primary" disabled={busy} onClick={() => void persist()}>
            Save
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void persist().then(() => onOpen(draft.packId, draft.id))}
          >
            Play
          </button>
        </div>
      </header>

      <div className="author-work">
        <aside className="author-rail">
          <p className="author-kicker">Blocks</p>
          <ol className="author-outline">
            {draft.blocks.map((b, i) => {
              const type = String(b.type) as BlockType
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`author-outline-item is-${tone(type)}${openBlock === i ? ' is-on' : ''}`}
                    onClick={() => setOpenBlock(i)}
                  >
                    <span className="author-outline-n">{i + 1}</span>
                    <span>
                      <strong>{BLOCK_TYPE_LABEL[type] ?? type}</strong>
                      <em>{blockHint(b)}</em>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <button type="button" className="btn primary author-add" onClick={() => setPalette('block')}>
            Add a block
          </button>
        </aside>

        <section className="author-canvas">
          {current ? (
            <>
              <div className="author-canvas-head">
                <div>
                  <p className="author-kicker">
                    Block {openBlock + 1} of {draft.blocks.length}
                  </p>
                  <h2>
                    {BLOCK_TYPE_LABEL[currentType as BlockType] ?? currentType}
                    {currentType === 'check' && typeof current.kind === 'string' ? ` · ${CHECK_KIND_LABEL[current.kind as CheckKind] ?? current.kind}` : ''}
                  </h2>
                </div>
                <div className="author-canvas-move">
                  <button type="button" className="btn" disabled={openBlock === 0} onClick={() => moveBlock(openBlock, -1)}>
                    Up
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={openBlock === draft.blocks.length - 1}
                    onClick={() => moveBlock(openBlock, 1)}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => {
                      if (!confirm('Remove this block?')) return
                      const blocks = draft.blocks.filter((_, j) => j !== openBlock)
                      patch({ blocks })
                      setOpenBlock(Math.max(0, openBlock - 1))
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="author-canvas-body">
                <BlockEditor block={current} onChange={(next) => setBlock(openBlock, next)} />
              </div>
            </>
          ) : (
            <div className="author-empty-canvas">
              <p>This lesson has no blocks yet.</p>
              <button type="button" className="btn primary" onClick={() => setPalette('block')}>
                Add the first block
              </button>
            </div>
          )}
        </section>

        {settings && (
          <aside className="author-details">
            <p className="author-kicker">Details</p>
            <TextArea
              label="Card description"
              value={draft.description ?? ''}
              onChange={(description) => patch({ description })}
              hint="One or two sentences. No code. Starts with a capital and ends with a period."
              rows={3}
            />
            <NumInput label="Minutes" value={draft.estimatedMinutes} onChange={(estimatedMinutes) => patch({ estimatedMinutes })} />
            <NumInput label="Task revision" value={draft.taskRev} onChange={(taskRev) => patch({ taskRev })} hint="Bump if you change the task so old scores do not carry." />
            <TextInput
              label="Skills"
              value={draft.skillIds.join(', ')}
              onChange={(v) => patch({ skillIds: v.split(',').map((s) => s.trim()).filter(Boolean) })}
              hint="Optional ids, comma-separated."
            />
            <TextInput label="Course" value={draft.courseId ?? 'drafts'} onChange={(courseId) => patch({ courseId })} />
            <TextInput label="Module" value={draft.moduleId ?? 'main'} onChange={(moduleId) => patch({ moduleId })} />
            <button type="button" className="btn" onClick={() => void importAsset()}>
              Import picture or audio
            </button>
            <button type="button" className="btn" onClick={() => void invoke(IPC.authorExportZip, { packId: draft.packId, lessonId: draft.id })}>
              Export lesson zip
            </button>
            <button type="button" className="btn" onClick={() => void invoke(IPC.authorExportZip, { packId: draft.packId })}>
              Export pack zip
            </button>
            <details className="author-json" open={jsonOpen} onToggle={(e) => setJsonOpen((e.target as HTMLDetailsElement).open)}>
              <summary>Raw JSON</summary>
              <textarea
                rows={10}
                value={JSON.stringify(draft, null, 2)}
                onChange={(e) => {
                  try {
                    setDraft(asDraft(JSON.parse(e.target.value)))
                    setDirty(true)
                    setMsg(null)
                  } catch {
                    setMsg({ kind: 'err', text: 'JSON is not valid yet.' })
                  }
                }}
              />
            </details>
          </aside>
        )}
      </div>

      {msg ? <p className={`author-toast is-${msg.kind}`}>{msg.text}</p> : null}

      {palette && (
        <div className="author-palette-back" onClick={() => setPalette(null)}>
          <div className="author-palette" onClick={(e) => e.stopPropagation()}>
            {palette === 'block' ? (
              <>
                <header>
                  <p className="author-kicker">Add a block</p>
                  <h2>What happens next?</h2>
                </header>
                {ADD_GROUPS.map((g) => (
                  <div key={g.title}>
                    <p className="author-kicker">{g.title}</p>
                    <div className="author-palette-grid">
                      {g.items.map((item) => (
                        <button key={item.type} type="button" className={`author-pick is-${tone(item.type)}`} onClick={() => addBlock(item.type)}>
                          <strong>{BLOCK_TYPE_LABEL[item.type]}</strong>
                          <span>{item.blurb}</span>
                        </button>
                      ))}
                      {g.title === 'Teach' ? (
                        <button type="button" className="author-pick is-ask" onClick={() => setPalette('question')}>
                          <strong>Question</strong>
                          <span>A graded check — pick the type next.</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <header>
                  <button type="button" className="btn" onClick={() => setPalette('block')}>
                    Back
                  </button>
                  <h2>What kind of question?</h2>
                </header>
                {QUESTION_GROUPS.map((g) => (
                  <div key={g.title}>
                    <p className="author-kicker">{g.title}</p>
                    <div className="author-palette-grid is-kinds">
                      {g.kinds.map((k) => (
                        <button key={k} type="button" className="author-pick is-ask" onClick={() => addBlock('check', k)}>
                          <strong>{CHECK_KIND_LABEL[k]}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PackGrid({ packs, value, onChange }: { packs: PackSum[]; value: string; onChange: (id: string) => void }) {
  if (!packs.length) return <p className="muted">No packs yet. Create a new one.</p>
  return (
    <div className="author-packs">
      {packs.map((p) => (
        <button key={p.id} type="button" className={`author-pack${value === p.id ? ' is-on' : ''}`} onClick={() => onChange(p.id)}>
          <strong>{p.title}</strong>
          <span className="muted">{p.id}</span>
        </button>
      ))}
    </div>
  )
}

function tone(type: string): string {
  if (type === 'check' || type === 'predict') return 'ask'
  if (type === 'activity' || type === 'code' || type === 'debug' || type === 'project') return 'play'
  return 'teach'
}

function blockHint(block: Record<string, unknown>): string {
  if (block.type === 'check' && typeof block.kind === 'string') {
    return CHECK_KIND_LABEL[block.kind as CheckKind] ?? block.kind
  }
  const text = String(block.md ?? block.promptMd ?? block.briefMd ?? '')
  const line = text.replace(/^#+\s+/gm, '').split('\n').map((s) => s.trim()).find(Boolean) ?? ''
  return line.length > 42 ? `${line.slice(0, 40)}…` : line
}

function slug(s: string, sep = '-'): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, 'g'), '')
}

function asDraft(raw: DraftLesson): DraftLesson {
  return {
    ...blankLesson(raw.packId, raw.id, raw.title),
    ...raw,
    blocks: Array.isArray(raw.blocks) ? raw.blocks : []
  }
}
