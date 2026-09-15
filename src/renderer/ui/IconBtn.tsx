import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Lightbulb, Play, RotateCcw, Settings } from 'lucide-react'

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

const iconProps = { size: 18, strokeWidth: 2, 'aria-hidden': true as const }

export function BackIcon() {
  return <ChevronLeft {...iconProps} />
}

export function NextIcon() {
  return <ChevronRight {...iconProps} />
}

export function UpIcon() {
  return <ChevronUp {...iconProps} />
}

export function DownIcon() {
  return <ChevronDown {...iconProps} />
}

export function HintIcon() {
  return <Lightbulb {...iconProps} />
}

export function PlayIcon() {
  return <Play {...iconProps} />
}

export function SettingsIcon() {
  return <Settings {...iconProps} />
}

export function RestartIcon() {
  return <RotateCcw {...iconProps} />
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
