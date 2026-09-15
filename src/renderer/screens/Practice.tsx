import { useEffect, useState } from 'react'
import { IPC, invoke } from '../api'

export function Practice({ onOpen }: { onOpen: (packId: string, lessonId: string) => void }) {
  const [items, setItems] = useState<{ packId: string; lessonId: string; reason: string }[]>([])
  useEffect(() => {
    void invoke<typeof items>(IPC.practiceNext).then(setItems)
  }, [])
  return (
    <div className="page">
      <h1>Practice</h1>
      <p>Misconception follow-ups first, then in-progress lessons.</p>
      {items.length === 0 && <p className="muted">Nothing queued yet. Play a lesson.</p>}
      {items.map((i) => (
        <div key={`${i.packId}-${i.lessonId}`} className="row">
          <button className="btn primary" onClick={() => onOpen(i.packId, i.lessonId)}>
            {i.lessonId}
          </button>
          <span className="muted">{i.reason}</span>
        </div>
      ))}
    </div>
  )
}
