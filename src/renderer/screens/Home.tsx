import { useEffect, useState } from 'react'
import { lessonPath, orderCatalog } from '@shared/catalog'
import { groupPacks } from '@shared/packDisplay'
import type { Course, Track } from '@shared/schemas/pack'
import { IPC, invoke } from '../api'
import { PackCard, type PackCardModel } from '../ui/PackCard'

export function Home({ onOpen }: { onOpen: (packId: string, lessonId: string) => void }) {
  const [packs, setPacks] = useState<PackCardModel[]>([])
  useEffect(() => {
    void invoke<PackCardModel[]>(IPC.packsList).then(setPacks)
  }, [])
  return (
    <div className="page">
      <h1>Continue learning</h1>
      <p>Pick a subject. Predict, act, see, explain. Progress stays in your AppData folder.</p>
      <div className="pack-shelves">
        {groupPacks(packs).map((shelf) => (
          <section key={shelf.category} className="pack-shelf">
            <header className="pack-shelf-head">
              <p className="lib-level-kicker">{shelf.category}</p>
              <h2>{shelf.category}</h2>
            </header>
            <div className="pack-grid">
              {shelf.packs.map((p) => (
                <PackCard key={p.id} pack={p} onOpen={() => void openFirst(p.id)} />
              ))}
            </div>
          </section>
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
