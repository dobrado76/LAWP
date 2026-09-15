import { useEffect, useState } from 'react'
import { lessonPath, orderCatalog } from '@shared/catalog'
import type { Course, Track } from '@shared/schemas/pack'
import { IPC, invoke } from '../api'

type PackSum = { id: string; title: string; description: string; lessonCount: number }

export function Home({ onOpen }: { onOpen: (packId: string, lessonId: string) => void }) {
  const [packs, setPacks] = useState<PackSum[]>([])
  useEffect(() => {
    void invoke<PackSum[]>(IPC.packsList).then(setPacks)
  }, [])
  return (
    <div className="page">
      <h1>Continue learning</h1>
      <p>Playable subjects. Predict, act, see, explain. Progress stays in your AppData folder — same for dev and the installed app.</p>
      <div className="cards">
        {packs.map((p) => (
          <div key={p.id} className="card" onClick={() => void openFirst(p.id)}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p className="muted">{p.lessonCount} lessons</p>
          </div>
        ))}
      </div>
    </div>
  )

  async function openFirst(packId: string) {
    const tree = await invoke<{
      manifest?: { tracks: string[] }
      lessons: { id: string }[]
      courses: Course[]
      tracks?: Track[]
    }>(IPC.packsGet, { packId })
    const catalog = orderCatalog(tree.manifest?.tracks ?? [], tree.tracks ?? [], tree.courses)
    const path = lessonPath(catalog.tracks, catalog.courses)
    const ev = await invoke<{ lessons: Record<string, { status: string }> }>(IPC.progressGet, { packId })
    const next = path.find((id) => {
      const status = ev.lessons?.[id]?.status
      return status !== 'checked' && status !== 'mastered'
    })
    const first = next ?? path[0] ?? tree.lessons[0]?.id
    if (first) onOpen(packId, first)
  }
}
