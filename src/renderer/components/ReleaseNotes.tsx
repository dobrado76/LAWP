import { md, notesBody, notesDate } from '../md'

type Notes = { version: string; minor: string; markdown: string }

export function ReleaseNotes({ notes, onDismiss }: { notes: Notes; onDismiss: () => void }) {
  const date = notesDate(notes.markdown)
  return (
    <div className="notes-backdrop" role="presentation" onClick={onDismiss}>
      <div
        className="notes-card"
        role="dialog"
        aria-labelledby="release-notes-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="notes-head">
          <p className="notes-kicker">LAWP {notes.version}</p>
          <h1 id="release-notes-title">What’s new</h1>
          {date ? <p className="muted">{date}</p> : null}
        </header>
        <div className="notes-body prose" dangerouslySetInnerHTML={{ __html: md(notesBody(notes.markdown)) }} />
        <footer className="notes-foot">
          <button type="button" className="btn primary" onClick={onDismiss}>
            Continue
          </button>
        </footer>
      </div>
    </div>
  )
}
