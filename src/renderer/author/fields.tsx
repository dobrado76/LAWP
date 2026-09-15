import type { ReactNode } from 'react'

export function Field({
  label,
  hint,
  children
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="author-field">
      <span>{label}</span>
      {children}
      {hint ? <small className="muted">{hint}</small> : null}
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 5,
  hint
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

export function TextInput({
  label,
  value,
  onChange,
  hint
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

export function NumInput({
  label,
  value,
  onChange,
  hint
}: {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function ListEditor<T>({
  title,
  items,
  onChange,
  blank,
  render
}: {
  title: string
  items: T[]
  onChange: (next: T[]) => void
  blank: () => T
  render: (item: T, set: (next: T) => void, remove: () => void) => ReactNode
}) {
  return (
    <div className="author-list">
      <div className="author-list-head">
        <strong>{title}</strong>
        <button type="button" className="btn" onClick={() => onChange([...items, blank()])}>
          Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="author-list-item">
          {render(
            item,
            (next) => onChange(items.map((x, j) => (j === i ? next : x))),
            () => onChange(items.filter((_, j) => j !== i))
          )}
        </div>
      ))}
    </div>
  )
}
