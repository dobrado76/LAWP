import { useEffect, useState } from 'react'
import { IPC, invoke } from './api'
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

  useEffect(() => {
    void invoke<{ userDataPath: string; version: string }>(IPC.appInfo).then(setInfo)
    void invoke<{ route?: Route; packId?: string; lessonId?: string }>(IPC.sessionGet).then((s) => {
      if (s.route) setRoute(s.route as Route)
      if (s.packId) setPackId(s.packId)
      if (s.lessonId) setLessonId(s.lessonId)
    })
  }, [])

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
        <span className="hud">LAWP {info.version}</span>
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
      {route === 'settings' && <Settings userDataPath={info.userDataPath ?? ''} />}
      {route === 'practice' && <Practice onOpen={(p, l) => go('studio', { packId: p, lessonId: l })} />}
    </div>
  )
}
