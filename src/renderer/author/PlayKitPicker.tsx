import { useState } from 'react'
import { PLAY_KIT, PLAY_KIT_CATEGORIES, playKitSrc, type PlayKitCategory } from '@shared/playKit'

export function PlayKitPicker({
  value,
  onPick,
  categories
}: {
  value?: string
  onPick: (id: string) => void
  categories?: PlayKitCategory[]
}) {
  const tabs = PLAY_KIT_CATEGORIES.filter((c) => !categories || categories.includes(c.id))
  const [cat, setCat] = useState<PlayKitCategory>(tabs[0]?.id ?? 'items')
  const pieces = PLAY_KIT.filter((p) => p.category === cat)
  return (
    <div className="play-kit">
      <div className="play-kit-tabs">
        {tabs.map((t) => (
          <button key={t.id} type="button" className={t.id === cat ? 'is-on' : undefined} onClick={() => setCat(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="play-kit-grid">
        {pieces.map((piece) => {
          const src = playKitSrc(piece.id)
          return (
            <button
              key={piece.id}
              type="button"
              className={`play-kit-cell${value === piece.id ? ' is-on' : ''}`}
              onClick={() => onPick(piece.id)}
              title={piece.label}
            >
              {src ? <img src={src} alt="" /> : null}
              <span>{piece.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
