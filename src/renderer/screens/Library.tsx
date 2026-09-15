import { useEffect, useState } from 'react'
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

export function Library({ onOpen }: { onOpen: (packId: string, lessonId: string) => void }) {
  const [packs, setPacks] = useState<PackSum[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [tree, setTree] = useState<{
    lessons: { id: string; title: string; estimatedMinutes: number; source: string }[]
    courses: { title: string; modules: { title: string; lessonIds: string[] }[] }[]
    trusted?: boolean
    execute?: string
  } | null>(null)
  const [err, setErr] = useState('')

  async function reload() {
    setPacks(await invoke<PackSum[]>(IPC.packsList))
  }
  useEffect(() => {
    void reload()
  }, [])

  async function select(id: string) {
    setOpen(id)
    setTree(await invoke(IPC.packsGet, { packId: id }))
  }

  return (
    <div className="page">
      <h1>Library</h1>
      <div className="row">
        <button
          className="btn primary"
          onClick={() =>
            void invoke(IPC.packsImportZip, {}).then(reload).catch((e: Error) => setErr(e.message))
          }
        >
          Install from ZIP
        </button>
        {open && (
          <>
            <button className="btn" onClick={() => void invoke(IPC.packsExportZip, { packId: open })}>
              Export pack ZIP
            </button>
            {tree && tree.execute && tree.execute !== 'none' && !tree.trusted && (
              <button
                className="btn danger"
                onClick={() => void invoke(IPC.trustGrant, { packId: open }).then(() => select(open))}
              >
                Trust this pack to run code
              </button>
            )}
          </>
        )}
      </div>
      {err && <p className="err">{err}</p>}
      <div className="cards">
        {packs.map((p) => (
          <div key={p.id} className="card" onClick={() => void select(p.id)}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p className="muted">
              {p.source}
              {p.overlay ? ' · overlay' : ''} · {p.lessonCount} lessons
            </p>
          </div>
        ))}
      </div>
      {tree && open && (
        <>
          <h2>Lessons</h2>
          {tree.courses.map((c) => (
            <div key={c.title}>
              <h3>{c.title}</h3>
              {c.modules.map((m) => (
                <div key={m.title}>
                  <p>{m.title}</p>
                  {m.lessonIds.map((id) => {
                    const l = tree.lessons.find((x) => x.id === id)
                    return (
                      <div key={id} className="row">
                        <button className="btn primary" onClick={() => onOpen(open, id)}>
                          {l?.title ?? id}
                        </button>
                        <button className="btn" onClick={() => void invoke(IPC.packsExportZip, { packId: open, lessonId: id })}>
                          Export lesson
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            void invoke(IPC.progressReset, { packId: open, scope: 'lesson', history: 'keep', lessonId: id })
                          }
                        >
                          Restart
                        </button>
                        <button
                          className="btn danger"
                          onClick={() =>
                            void invoke(IPC.progressReset, { packId: open, scope: 'lesson', history: 'clear', lessonId: id })
                          }
                        >
                          Clear history
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
          {tree.lessons
            .filter((l) => !tree.courses.some((c) => c.modules.some((m) => m.lessonIds.includes(l.id))))
            .map((l) => (
              <div key={l.id} className="row">
                <span className="muted">Unfiled</span>
                <button className="btn primary" onClick={() => onOpen(open, l.id)}>
                  {l.title}
                </button>
              </div>
            ))}
        </>
      )}
    </div>
  )
}
