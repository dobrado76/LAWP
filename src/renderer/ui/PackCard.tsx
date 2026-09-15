import { useState } from 'react'
import { packCategory, packCategoryTone, packCoverUrl } from '@shared/packDisplay'

export type PackCardModel = {
  id: string
  title: string
  description: string
  lessonCount: number
  doneCount?: number
  started?: boolean
  category?: string
  cover?: string
  subjects?: string[]
  engines?: string[]
  source?: string
}

export function packProgressLabel(done: number, total: number) {
  const t = total || 0
  const d = Math.min(done, t)
  const pct = t ? Math.round((d / t) * 100) : 0
  return { done: d, total: t, pct, text: `${d}/${t}  (${pct}%)` }
}

export function packStatus(done: number, total: number, started?: boolean): 'idle' | 'progress' | 'complete' {
  if (total > 0 && done >= total) return 'complete'
  if (started || done > 0) return 'progress'
  return 'idle'
}

const STATUS_LABEL = {
  idle: 'Not started',
  progress: 'In progress',
  complete: 'Complete'
} as const

export function PackCard({ pack, onOpen }: { pack: PackCardModel; onOpen: () => void }) {
  const category = packCategory(pack)
  const tone = packCategoryTone(category)
  const [broken, setBroken] = useState(false)
  const src = packCoverUrl(pack.id, pack.cover)
  const progress = packProgressLabel(pack.doneCount ?? 0, pack.lessonCount)
  const status = packStatus(progress.done, progress.total, pack.started)
  return (
    <button type="button" className={`pack-card is-${tone}`} onClick={onOpen}>
      <div className="pack-card-art" aria-hidden="true">
        {!broken ? <img src={src} alt="" onError={() => setBroken(true)} /> : <span className="pack-card-letter">{pack.title.slice(0, 1)}</span>}
        <span className="pack-card-cat">{category}</span>
        <span className={`pack-card-tag is-${status}`}>{STATUS_LABEL[status]}</span>
      </div>
      <div className="pack-card-body">
        <h3>{pack.title}</h3>
        <p>{pack.description}</p>
        <div className="pack-card-foot">
          <div className="pack-card-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.pct}>
            <i style={{ width: `${progress.pct}%` }} />
          </div>
          <span className="pack-card-meta">{progress.text}</span>
        </div>
      </div>
    </button>
  )
}
