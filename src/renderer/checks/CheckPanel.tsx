import { useState, type DragEvent, type ReactNode } from 'react'
import {
  CHECK_KIND_LABEL,
  defaultCheckValue,
  packAssetUrl,
  splitCloze,
  splitHottext,
  splitSelect,
  tfChoices,
  type CheckPrompt
} from '@shared/check'
import { md } from '../md'
import { DownIcon, IconBtn, UpIcon } from '../ui/IconBtn'

type Choice = { id: string; md: string; image?: string }

export function CheckPanel({
  check,
  value,
  onChange,
  packId,
  lessonId,
  onSubmit,
  onNext,
  nextLabel,
  result
}: {
  check: CheckPrompt
  value: unknown
  onChange: (next: unknown) => void
  packId: string
  lessonId: string
  onSubmit: () => void
  onNext: () => void
  nextLabel: string
  result: 'pass' | 'fail' | null
}) {
  const kind = check.kind
  const current = value === undefined ? defaultCheckValue(check) : value
  const hidePrompt = kind === 'cloze' || kind === 'bank' || kind === 'hottext' || kind === 'select'
  return (
    <div className="check-panel">
      <p className="check-kicker">{CHECK_KIND_LABEL[kind]}</p>
      {!hidePrompt && <div className="prose" dangerouslySetInnerHTML={{ __html: md(check.promptMd) }} />}
      {kind === 'mcq' || kind === 'odd' || kind === 'listen' ? (
        <>
          {kind === 'listen' && check.audio ? (
            <audio className="check-audio" controls src={packAssetUrl(packId, lessonId, check.audio)} />
          ) : null}
          <ChoiceList
            name={check.id}
            choices={check.choices ?? []}
            packId={packId}
            lessonId={lessonId}
            multiple={false}
            selected={typeof current === 'string' ? [current] : []}
            onToggle={(id) => onChange(id)}
          />
        </>
      ) : null}
      {kind === 'image' ? (
        <ChoiceList
          name={check.id}
          choices={check.choices ?? []}
          packId={packId}
          lessonId={lessonId}
          multiple={false}
          pictures
          selected={typeof current === 'string' ? [current] : []}
          onToggle={(id) => onChange(id)}
        />
      ) : null}
      {kind === 'tf' ? (
        <div className="check-tf">
          {tfChoices(check).map((c) => (
            <button
              key={c.id}
              type="button"
              className={`btn${current === c.id ? ' primary' : ''}`}
              onClick={() => onChange(c.id)}
            >
              {c.md}
            </button>
          ))}
        </div>
      ) : null}
      {kind === 'multi' ? (
        <ChoiceList
          name={check.id}
          choices={check.choices ?? []}
          packId={packId}
          lessonId={lessonId}
          multiple
          selected={Array.isArray(current) ? (current as string[]) : []}
          onToggle={(id) => {
            const have = new Set(Array.isArray(current) ? (current as string[]) : [])
            if (have.has(id)) have.delete(id)
            else have.add(id)
            onChange([...have])
          }}
        />
      ) : null}
      {kind === 'short' ? (
        <input
          type="text"
          value={typeof current === 'string' ? current : ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Your answer"
        />
      ) : null}
      {kind === 'select' ? (
        <SelectWord check={check} value={typeof current === 'string' ? current : ''} onChange={onChange} />
      ) : null}
      {kind === 'fix' ? (
        <input
          type="text"
          className="check-fix"
          value={typeof current === 'string' ? current : (check.starter ?? '')}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Corrected text"
        />
      ) : null}
      {kind === 'numeric' ? (
        <label className="check-numeric">
          <input
            type="number"
            value={current === '' || current === undefined ? '' : String(current)}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            aria-label="Your number"
          />
          {check.unit ? <span className="muted">{check.unit}</span> : null}
        </label>
      ) : null}
      {kind === 'slider' ? (
        <Slider check={check} value={asNum(current, check.min ?? 0)} onChange={onChange} />
      ) : null}
      {kind === 'numberline' ? (
        <NumberLine check={check} value={asNum(current, check.min ?? 0)} onChange={onChange} />
      ) : null}
      {kind === 'cloze' ? <Cloze check={check} value={asMap(current)} onChange={onChange} /> : null}
      {kind === 'bank' ? <Bank check={check} value={asMap(current)} onChange={onChange} /> : null}
      {kind === 'hottext' ? (
        <Hottext check={check} value={typeof current === 'string' ? current : ''} onChange={onChange} />
      ) : null}
      {kind === 'match' ? <Match check={check} value={asMap(current)} onChange={onChange} /> : null}
      {kind === 'order' ? (
        <Order
          choices={check.choices ?? []}
          value={Array.isArray(current) ? (current as string[]) : (check.choices ?? []).map((c) => c.id)}
          onChange={onChange}
        />
      ) : null}
      {kind === 'table' ? <Table check={check} value={asMap(current)} onChange={onChange} /> : null}
      {kind === 'tier' ? <Tier check={check} value={asTier(current)} onChange={onChange} /> : null}
      {kind === 'place' ? (
        <Place check={check} value={asMap(current)} onChange={onChange} packId={packId} lessonId={lessonId} />
      ) : null}
      {kind === 'hotspot' ? (
        <Hotspot
          check={check}
          value={typeof current === 'string' ? current : ''}
          onChange={onChange}
          packId={packId}
          lessonId={lessonId}
        />
      ) : null}
      {kind === 'gorder' ? (
        <Gorder
          check={check}
          value={Array.isArray(current) ? (current as string[]) : []}
          onChange={onChange}
          packId={packId}
          lessonId={lessonId}
        />
      ) : null}
      {kind === 'bins' ? <Bins check={check} value={asMap(current)} onChange={onChange} /> : null}
      {kind === 'venn' ? <Venn check={check} value={asMap(current)} onChange={onChange} /> : null}
      {result === 'pass' ? (
        <button type="button" className="btn primary check-cta" onClick={onNext}>
          {nextLabel}
        </button>
      ) : (
        <button type="button" className="btn primary check-cta" onClick={onSubmit}>
          Submit
        </button>
      )}
    </div>
  )
}

function asMap(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === 'string') out[k] = val
  }
  return out
}

function asNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function asTier(v: unknown): { choice: string; reason: string } {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { choice: '', reason: '' }
  const choice = typeof (v as { choice?: unknown }).choice === 'string' ? (v as { choice: string }).choice : ''
  const reason = typeof (v as { reason?: unknown }).reason === 'string' ? (v as { reason: string }).reason : ''
  return { choice, reason }
}

function ChoiceList({
  name,
  choices,
  multiple,
  selected,
  onToggle,
  pictures,
  packId,
  lessonId
}: {
  name: string
  choices: Choice[]
  multiple: boolean
  selected: string[]
  onToggle: (id: string) => void
  pictures?: boolean
  packId: string
  lessonId: string
}) {
  return (
    <div className={`check-choices${pictures ? ' is-pictures' : ''}`}>
      {choices.map((c) => {
        const on = selected.includes(c.id)
        return (
          <label key={c.id} className={`choice${on ? ' is-on' : ''}${c.image ? ' has-pic' : ''}`}>
            <input type={multiple ? 'checkbox' : 'radio'} name={name} checked={on} onChange={() => onToggle(c.id)} />
            {c.image ? <img src={packAssetUrl(packId, lessonId, c.image)} alt="" /> : null}
            <span dangerouslySetInnerHTML={{ __html: md(c.md) }} />
          </label>
        )
      })}
    </div>
  )
}

function Cloze({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const setBlank = (id: string, next: string) => onChange({ ...value, [id]: next })
  return (
    <p className="check-cloze">
      {splitCloze(check.promptMd).map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.text}</span>
        const blank = check.blanks?.find((b) => b.id === part.id)
        const choices = blank?.choices ?? check.choices ?? []
        if (choices.length) {
          return (
            <select
              key={part.id}
              value={value[part.id] ?? ''}
              onChange={(e) => setBlank(part.id, e.target.value)}
              aria-label={`Blank ${part.id}`}
            >
              <option value="">…</option>
              {choices.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.md}
                </option>
              ))}
            </select>
          )
        }
        return (
          <input
            key={part.id}
            type="text"
            className="check-cloze-input"
            value={value[part.id] ?? ''}
            onChange={(e) => setBlank(part.id, e.target.value)}
            aria-label={`Blank ${part.id}`}
          />
        )
      })}
    </p>
  )
}

function Hottext({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: string
  onChange: (id: string) => void
}) {
  return (
    <p className="check-hottext">
      {splitHottext(check.promptMd).map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.text}</span>
        return (
          <button
            key={part.id}
            type="button"
            className={`check-token${value === part.id ? ' is-on' : ''}`}
            onClick={() => onChange(part.id)}
          >
            {part.text}
          </button>
        )
      })}
    </p>
  )
}

function Match({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const left = check.left ?? []
  const right = check.right ?? []
  return (
    <div className="check-match">
      {left.map((item) => (
        <div key={item.id} className="check-match-row">
          <div className="check-match-left" dangerouslySetInnerHTML={{ __html: md(item.md) }} />
          <select
            value={value[item.id] ?? ''}
            onChange={(e) => {
              const next = { ...value }
              const picked = e.target.value
              if (!picked) delete next[item.id]
              else {
                for (const [k, v] of Object.entries(next)) {
                  if (v === picked && k !== item.id) delete next[k]
                }
                next[item.id] = picked
              }
              onChange(next)
            }}
            aria-label={`Match for ${item.md}`}
          >
            <option value="">Choose…</option>
            {right.map((r) => (
              <option key={r.id} value={r.id}>
                {r.md}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

function Order({
  choices,
  value,
  onChange
}: {
  choices: Choice[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  const byId = new Map(choices.map((c) => [c.id, c]))
  const seen = new Set<string>()
  const ids = [...value.filter((id) => byId.has(id)), ...choices.map((c) => c.id)].filter((id) => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  const [held, setHeld] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)

  const move = (index: number, dir: -1 | 1) => {
    const next = ids.slice()
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j]!, next[index]!]
    onChange(next)
  }

  function moveTo(fromId: string, toId: string) {
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    if (from < 0 || to < 0 || from === to) return
    const next = ids.slice()
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item!)
    onChange(next)
  }

  return (
    <ol className="check-order">
      {ids.map((id, i) => {
        const item = byId.get(id)!
        return (
          <li
            key={id}
            className={`check-order-item${held === id ? ' is-held' : ''}${over === id && held !== id ? ' is-target' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', id)
              e.dataTransfer.effectAllowed = 'move'
              setHeld(id)
            }}
            onDragEnd={() => {
              setHeld(null)
              setOver(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              if (held !== id) setOver(id)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const from = e.dataTransfer.getData('text/plain') || held
              if (from) moveTo(from, id)
              setHeld(null)
              setOver(null)
            }}
          >
            <span className="check-order-grip" title="Drag to reorder" aria-hidden="true">
              ⋮⋮
            </span>
            <span className="check-order-text" dangerouslySetInnerHTML={{ __html: md(item.md) }} />
            <span className="check-order-btns">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <UpIcon />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === ids.length - 1} onClick={() => move(i, 1)}>
                <DownIcon />
              </IconBtn>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function SelectWord({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: string
  onChange: (id: string) => void
}) {
  const choices = check.choices ?? []
  return (
    <p className="check-cloze">
      {splitSelect(check.promptMd).map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.text}</span>
        return (
          <select key={part.id} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Choose the word">
            <option value="">…</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.md}
              </option>
            ))}
          </select>
        )
      })}
    </p>
  )
}

function Table({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const rows = check.rows ?? []
  const cols = check.choices ?? []
  return (
    <table className="check-table">
      <thead>
        <tr>
          <th />
          {cols.map((c) => (
            <th key={c.id} dangerouslySetInnerHTML={{ __html: md(c.md) }} />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <th dangerouslySetInnerHTML={{ __html: md(row.md) }} />
            {cols.map((c) => (
              <td key={c.id}>
                <input
                  type="radio"
                  name={`${check.id}-${row.id}`}
                  checked={value[row.id] === c.id}
                  onChange={() => onChange({ ...value, [row.id]: c.id })}
                  aria-label={`${row.md}: ${c.md}`}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Tier({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: { choice: string; reason: string }
  onChange: (next: { choice: string; reason: string }) => void
}) {
  const reasons = (check.reasons ?? []).filter((r) => !r.when?.length || (value.choice && r.when.includes(value.choice)))
  return (
    <div className="check-tier">
      <ChoiceList
        name={`${check.id}-choice`}
        choices={check.choices ?? []}
        packId=""
        lessonId=""
        multiple={false}
        selected={value.choice ? [value.choice] : []}
        onToggle={(id) => onChange({ choice: id, reason: '' })}
      />
      {value.choice ? (
        <>
          <p className="check-kicker">Why?</p>
          <ChoiceList
            name={`${check.id}-reason`}
            choices={reasons}
            packId=""
            lessonId=""
            multiple={false}
            selected={value.reason ? [value.reason] : []}
            onToggle={(id) => onChange({ ...value, reason: id })}
          />
        </>
      ) : (
        <p className="muted">Pick an answer first, then say why.</p>
      )}
    </div>
  )
}

function Slider({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: number
  onChange: (n: number) => void
}) {
  const min = check.min ?? 0
  const max = check.max ?? 10
  const step = check.step ?? 1
  return (
    <label className="check-slider">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span>
        {value}
        {check.unit ? ` ${check.unit}` : ''}
      </span>
    </label>
  )
}

function NumberLine({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: number
  onChange: (n: number) => void
}) {
  const min = check.min ?? 0
  const max = check.max ?? 10
  const step = check.step ?? 1
  const ticks: number[] = []
  for (let n = min; n <= max + 1e-9; n += step) ticks.push(Number(n.toFixed(6)))
  return (
    <div className="check-line">
      <div className="check-line-track">
        {ticks.map((n) => (
          <button
            key={n}
            type="button"
            className={`check-line-tick${value === n ? ' is-on' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function Bank({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const pieces = check.pieces ?? check.choices ?? []
  const used = new Set(Object.values(value))
  const [held, setHeld] = useState<string | null>(null)
  const byId = new Map(pieces.map((p) => [p.id, p]))

  function put(blankId: string, pieceId: string | null) {
    const next = { ...value }
    for (const [k, v] of Object.entries(next)) if (v === pieceId) delete next[k]
    if (pieceId) next[blankId] = pieceId
    else delete next[blankId]
    onChange(next)
    setHeld(null)
  }

  return (
    <div className="check-bank-wrap">
      <p className="check-cloze">
        {splitCloze(check.promptMd).map((part, i) => {
          if (part.type === 'text') return <span key={i}>{part.text}</span>
          const piece = value[part.id] ? byId.get(value[part.id]!) : undefined
          return (
            <button
              key={part.id}
              type="button"
              className={`check-blank${piece ? ' has-piece' : ''}${held ? ' is-target' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const id = e.dataTransfer.getData('text/plain') || held
                if (id) put(part.id, id)
              }}
              onClick={() => {
                if (held) put(part.id, held)
                else if (value[part.id]) {
                  const id = value[part.id]!
                  put(part.id, null)
                  setHeld(id)
                }
              }}
            >
              {piece ? piece.md : '…'}
            </button>
          )
        })}
      </p>
      <PieceBank pieces={pieces} used={used} held={held} setHeld={setHeld} onClear={(id) => {
        const next = { ...value }
        for (const [k, v] of Object.entries(next)) if (v === id) delete next[k]
        onChange(next)
      }} />
    </div>
  )
}

function Place({
  check,
  value,
  onChange,
  packId,
  lessonId
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
  packId: string
  lessonId: string
}) {
  const slots = check.slots ?? []
  const pieces = check.pieces ?? check.choices ?? []
  const used = new Set(Object.values(value))
  const [held, setHeld] = useState<string | null>(null)
  const byId = new Map(pieces.map((p) => [p.id, p]))

  function assign(slotId: string, pieceId: string | null) {
    const next = { ...value }
    for (const [k, v] of Object.entries(next)) if (v === pieceId) delete next[k]
    if (pieceId) next[slotId] = pieceId
    else delete next[slotId]
    onChange(next)
    setHeld(null)
  }

  return (
    <div className="check-place">
      <Board image={check.image} packId={packId} lessonId={lessonId}>
        {slots.map((slot) => {
          const piece = value[slot.id] ? byId.get(value[slot.id]!) : undefined
          return (
            <SlotBtn
              key={slot.id}
              slot={slot}
              positioned={Boolean(check.image)}
              filled={Boolean(piece)}
              targeting={Boolean(held)}
              onDropId={(id) => assign(slot.id, id)}
              onClick={() => {
                if (held) assign(slot.id, held)
                else if (value[slot.id]) {
                  const id = value[slot.id]!
                  assign(slot.id, null)
                  setHeld(id)
                }
              }}
            >
              {piece ? <span dangerouslySetInnerHTML={{ __html: md(piece.md) }} /> : <span className="muted">{slot.label ?? 'Drop'}</span>}
            </SlotBtn>
          )
        })}
      </Board>
      <PieceBank
        pieces={pieces}
        used={used}
        held={held}
        setHeld={setHeld}
        onClear={(id) => {
          const next = { ...value }
          for (const [k, v] of Object.entries(next)) if (v === id) delete next[k]
          onChange(next)
          setHeld(null)
        }}
      />
    </div>
  )
}

function Hotspot({
  check,
  value,
  onChange,
  packId,
  lessonId
}: {
  check: CheckPrompt
  value: string
  onChange: (id: string) => void
  packId: string
  lessonId: string
}) {
  const slots = check.slots ?? []
  return (
    <Board image={check.image} packId={packId} lessonId={lessonId}>
      {slots.map((slot) => (
        <SlotBtn
          key={slot.id}
          slot={slot}
          positioned={Boolean(check.image)}
          filled={value === slot.id}
          targeting={false}
          onDropId={() => onChange(slot.id)}
          onClick={() => onChange(slot.id)}
        >
          <span className="muted">{slot.label ?? 'Here'}</span>
        </SlotBtn>
      ))}
    </Board>
  )
}

function Gorder({
  check,
  value,
  onChange,
  packId,
  lessonId
}: {
  check: CheckPrompt
  value: string[]
  onChange: (next: string[]) => void
  packId: string
  lessonId: string
}) {
  const slots = check.slots ?? []
  function tap(id: string) {
    if (value.includes(id)) onChange(value.filter((x) => x !== id))
    else onChange([...value, id])
  }
  return (
    <Board image={check.image} packId={packId} lessonId={lessonId}>
      {slots.map((slot) => {
        const n = value.indexOf(slot.id)
        return (
          <SlotBtn
            key={slot.id}
            slot={slot}
            positioned={Boolean(check.image)}
            filled={n >= 0}
            targeting={false}
            onDropId={() => tap(slot.id)}
            onClick={() => tap(slot.id)}
          >
            <span>{n >= 0 ? n + 1 : slot.label ?? '?'}</span>
          </SlotBtn>
        )
      })}
    </Board>
  )
}

function Bins({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const bins = check.bins ?? []
  const pieces = check.pieces ?? check.choices ?? []
  const used = new Set(Object.keys(value))
  const [held, setHeld] = useState<string | null>(null)
  const byId = new Map(pieces.map((p) => [p.id, p]))

  function put(pieceId: string, binId: string | null) {
    const next = { ...value }
    if (binId) next[pieceId] = binId
    else delete next[pieceId]
    onChange(next)
    setHeld(null)
  }

  return (
    <div className="check-bins">
      <div className="check-bin-cols">
        {bins.map((bin) => (
          <div
            key={bin.id}
            className={`check-bin${held ? ' is-target' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain') || held
              if (id) put(id, bin.id)
            }}
            onClick={() => {
              if (held) put(held, bin.id)
            }}
          >
            <h4>{bin.md}</h4>
            {pieces
              .filter((p) => value[p.id] === bin.id)
              .map((p) => (
                <PlacedChip
                  key={p.id}
                  piece={p}
                  held={held === p.id}
                  onHold={() => setHeld(held === p.id ? null : p.id)}
                  onDragStart={(e) => startPieceDrag(p.id, e, setHeld)}
                  onDragEnd={() => setHeld(null)}
                />
              ))}
          </div>
        ))}
      </div>
      <PieceBank
        pieces={pieces}
        used={used}
        held={held}
        setHeld={setHeld}
        onClear={(id) => put(id, null)}
      />
    </div>
  )
}

function Venn({
  check,
  value,
  onChange
}: {
  check: CheckPrompt
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const sets = check.sets ?? []
  const a = sets[0]
  const b = sets[1]
  const nameA = a?.md?.trim() || 'A'
  const nameB = b?.md?.trim() || 'B'
  const pieces = check.pieces ?? check.choices ?? []
  const used = new Set(Object.keys(value))
  const [held, setHeld] = useState<string | null>(null)
  const zones = [
    { id: a?.id ?? 'a', label: `${nameA} only` },
    { id: 'both', label: `${nameA} and ${nameB}` },
    { id: b?.id ?? 'b', label: `${nameB} only` },
    { id: 'out', label: `Neither ${nameA.toLowerCase()} nor ${nameB.toLowerCase()}` }
  ]

  function put(pieceId: string, zone: string | null) {
    const next = { ...value }
    if (zone) next[pieceId] = zone
    else delete next[pieceId]
    onChange(next)
    setHeld(null)
  }

  return (
    <div className="check-venn">
      <div className="check-venn-zones">
        {zones.map((z) => (
          <div
            key={z.id}
            className={`check-bin${held ? ' is-target' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain') || held
              if (id) put(id, z.id)
            }}
            onClick={() => {
              if (held) put(held, z.id)
            }}
          >
            <h4>{z.label}</h4>
            {pieces
              .filter((p) => value[p.id] === z.id)
              .map((p) => (
                <PlacedChip
                  key={p.id}
                  piece={p}
                  held={held === p.id}
                  onHold={() => setHeld(held === p.id ? null : p.id)}
                  onDragStart={(e) => startPieceDrag(p.id, e, setHeld)}
                  onDragEnd={() => setHeld(null)}
                />
              ))}
          </div>
        ))}
      </div>
      <PieceBank pieces={pieces} used={used} held={held} setHeld={setHeld} onClear={(id) => put(id, null)} />
    </div>
  )
}

function Board({
  image,
  packId,
  lessonId,
  children
}: {
  image?: string
  packId: string
  lessonId: string
  children: ReactNode
}) {
  return (
    <div className={`check-board${image ? ' has-image' : ''}`} onDragOver={(e) => e.preventDefault()}>
      {image ? <img src={packAssetUrl(packId, lessonId, image)} alt="" draggable={false} /> : null}
      {children}
    </div>
  )
}

function SlotBtn({
  slot,
  positioned,
  filled,
  targeting,
  onDropId,
  onClick,
  children
}: {
  slot: { id: string; x: number; y: number; w?: number; h?: number; label?: string }
  positioned: boolean
  filled: boolean
  targeting: boolean
  onDropId: (id: string) => void
  onClick: () => void
  children: ReactNode
}) {
  const style = positioned
    ? { left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w ?? 24}%`, height: `${slot.h ?? 16}%` }
    : undefined
  return (
    <button
      type="button"
      className={`check-slot${filled ? ' has-piece' : ''}${targeting ? ' is-target' : ''}`}
      style={style}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDropId(id)
      }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function startPieceDrag(pieceId: string, e: DragEvent, setHeld: (id: string | null) => void) {
  e.dataTransfer.setData('text/plain', pieceId)
  e.dataTransfer.effectAllowed = 'move'
  setHeld(pieceId)
}

function PlacedChip({
  piece,
  held,
  onHold,
  onDragStart,
  onDragEnd
}: {
  piece: Choice
  held: boolean
  onHold: () => void
  onDragStart: (e: DragEvent) => void
  onDragEnd: () => void
}) {
  return (
    <button
      type="button"
      className={`check-piece${held ? ' is-held' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation()
        onHold()
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: md(piece.md) }} />
    </button>
  )
}

function PieceBank({
  pieces,
  used,
  held,
  setHeld,
  onClear
}: {
  pieces: Choice[]
  used: Set<string>
  held: string | null
  setHeld: (id: string | null) => void
  onClear: (id: string) => void
}) {
  return (
    <div
      className="check-bank"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain') || held
        if (id) onClear(id)
        setHeld(null)
      }}
    >
      <p className="muted">Drag a piece onto a set. Drag or click it again to move it. Drop here to put it back.</p>
      <div className="check-bank-list">
        {pieces.map((p) => {
          const placed = used.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              className={`check-piece${held === p.id ? ' is-held' : ''}${placed ? ' is-used' : ''}`}
              draggable={!placed}
              disabled={placed}
              onDragStart={(e) => startPieceDrag(p.id, e, setHeld)}
              onDragEnd={() => setHeld(null)}
              onClick={() => setHeld(held === p.id ? null : p.id)}
            >
              <span dangerouslySetInnerHTML={{ __html: md(p.md) }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
