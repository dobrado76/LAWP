import type { ReactNode } from 'react'

export function IconBtn({
  label,
  danger,
  disabled,
  onClick,
  children
}: {
  label: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={`btn icon-btn${danger ? ' danger' : ''}`}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M10.2 2.4 4.6 8l5.6 5.6 1.1-1.1L6.8 8l4.5-4.5-1.1-1.1Z" />
    </svg>
  )
}

export function NextIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="m5.8 2.4 5.6 5.6-5.6 5.6-1.1-1.1L9.2 8 4.7 3.5l1.1-1.1Z" />
    </svg>
  )
}

export function UpIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M2.4 10.2 8 4.6l5.6 5.6-1.1 1.1L8 6.8l-4.5 4.5-1.1-1.1Z" />
    </svg>
  )
}

export function DownIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="m2.4 5.8 5.6 5.6 5.6-5.6-1.1-1.1L8 9.2 3.5 4.7 2.4 5.8Z" />
    </svg>
  )
}

export function HintIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.6A4.6 4.6 0 0 0 3.4 6.2c0 1.9 1.1 3.2 2 4.1.4.4.8.8 1 1.3h3.2c.2-.5.6-.9 1-1.3.9-.9 2-2.2 2-4.1A4.6 4.6 0 0 0 8 1.6Zm-1.3 11.6h2.6V14H6.7v-.8Zm.2 1.6h2.2V15H6.9v-.8Z"
      />
    </svg>
  )
}

export function RestartIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M8 2.5a5.5 5.5 0 1 1-4.7 2.6l1.1.7A4.2 4.2 0 1 0 8 3.8V6L11 3.2 8 .5V2.5Z" />
    </svg>
  )
}

export function CheckVerdict({ result }: { result: 'pass' | 'fail' }) {
  return (
    <div className={`check-verdict is-${result}`} role="status">
      {result === 'pass' ? <CorrectMark /> : <IncorrectMark />}
      <strong>{result === 'pass' ? 'Correct!' : 'Incorrect!'}</strong>
    </div>
  )
}

export function CorrectMark() {
  return (
    <svg className="check-mark-svg" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#2f9e44" />
      <path d="M18 34 28 44 47 21" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IncorrectMark() {
  return (
    <svg className="check-mark-svg" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#e03131" />
      <path d="M22 22 42 42M42 22 22 42" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
