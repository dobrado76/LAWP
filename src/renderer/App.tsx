import { useEffect, useState } from 'react'
import { IPC, invoke } from './api'
import { ReleaseNotes } from './components/ReleaseNotes'
import { Home } from './screens/Home'
import { Library } from './screens/Library'
import { Studio } from './screens/Studio'
import { Author } from './screens/Author'
import { Settings } from './screens/Settings'
import { Practice } from './screens/Practice'

export type Route = 'home' | 'library' | 'studio' | 'author' | 'settings' | 'practice'

export function App() {
  const [route, setRoute] = useState<Route>('home')
  const [packId, setPackId] = useState<string>()
  const [lessonId, setLessonId] = useState<string>()
  const [info, setInfo] = useState<{ userDataPath?: string; version?: string }>({})
  const [notes, setNotes] = useState<{ version: string; minor: string; markdown: string } | null>(null)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    void invoke<{ userDataPath: string; version: string }>(IPC.appInfo).then(setInfo)
    void invoke<{ route?: Route; packId?: string; lessonId?: string }>(IPC.sessionGet).then((s) => {
      if (s.route) setRoute(s.route as Route)
      if (s.packId) setPackId(s.packId)
      if (s.lessonId) setLessonId(s.lessonId)
    })
    void invoke<{ version: string; minor: string; markdown: string; unseen: boolean }>(IPC.appReleaseNotes).then((r) => {
      if (!r.markdown) return
      setNotes({ version: r.version, minor: r.minor, markdown: r.markdown })
      if (r.unseen) setShowNotes(true)
    })
  }, [])

  function dismissNotes() {
    setShowNotes(false)
    if (notes) void invoke(IPC.sessionSet, { lastReleaseNotesMinor: notes.minor })
  }

  function go(next: Route, extra?: { packId?: string; lessonId?: string }) {
    setRoute(next)
    if (extra?.packId) setPackId(extra.packId)
    if (extra?.lessonId) setLessonId(extra.lessonId)
    void invoke(IPC.sessionSet, { route: next, ...extra })
  }

  return (
    <div className="app">
      <nav className="nav">
        {(['home', 'library', 'studio', 'practice', 'author', 'settings'] as Route[]).map((r) => (
          <button key={r} className={route === r ? 'active' : ''} onClick={() => go(r)}>
            {r[0]!.toUpperCase() + r.slice(1)}
          </button>
        ))}
        <div className="spacer" />
        <button type="button" className="hud notes-launch" onClick={() => notes && setShowNotes(true)}>
          LAWP {info.version}
        </button>
      </nav>
      {route === 'home' && <Home onOpen={(p, l) => go('studio', { packId: p, lessonId: l })} />}
      {route === 'library' && <Library onOpen={(p, l) => go('studio', { packId: p, lessonId: l })} />}
      {route === 'studio' && packId && lessonId && (
        <Studio packId={packId} lessonId={lessonId} onPickLesson={(l) => go('studio', { packId, lessonId: l })} />
      )}
      {route === 'studio' && (!packId || !lessonId) && (
        <div className="page">
          <p>Pick a lesson from the Library.</p>
        </div>
      )}
      {route === 'author' && <Author />}
      {route === 'settings' && <Settings userDataPath={info.userDataPath ?? ''} version={info.version} />}
      {route === 'practice' && <Practice onOpen={(p, l) => go('studio', { packId: p, lessonId: l })} />}
      {showNotes && notes ? <ReleaseNotes notes={notes} onDismiss={dismissNotes} /> : null}
    </div>
  )
}
