import { useEffect, useState } from 'react'
import { IPC, invoke } from '../api'
import { CodeEditor } from '../editor/CodeEditor'

export function Author() {
  const [templates, setTemplates] = useState<{ id: string; title: string }[]>([])
  const [packId, setPackId] = useState('lawp.circuits.basics')
  const [lessonId, setLessonId] = useState('my-lesson')
  const [templateId, setTemplateId] = useState('activity-experiment')
  const [json, setJson] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    void invoke<{ id: string; title: string }[]>(IPC.authorTemplates).then((t) => {
      setTemplates(t)
      if (t[0]) setTemplateId(t[0].id)
    })
  }, [])

  return (
    <div className="page">
      <h1>Author</h1>
      <p>Template → save → preview/validate → export zip. Overlay onto a bundled pack when the pack id matches.</p>
      <label>Pack id</label>
      <input value={packId} onChange={(e) => setPackId(e.target.value)} />
      <label>Lesson id</label>
      <input value={lessonId} onChange={(e) => setLessonId(e.target.value)} />
      <label>Template</label>
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      <div className="row">
        <button
          className="btn primary"
          onClick={() =>
            void invoke(IPC.authorCreate, { templateId, packId, lessonId })
              .then((lesson) => {
                setJson(JSON.stringify(lesson, null, 2))
                setMsg('Created draft')
              })
              .catch((e: Error) => setMsg(e.message))
          }
        >
          Create from template
        </button>
        <button
          className="btn"
          onClick={() =>
            void invoke(IPC.authorSave, { packId, lessonId, lesson: JSON.parse(json) })
              .then(() => setMsg('Saved'))
              .catch((e: Error) => setMsg(e.message))
          }
        >
          Save
        </button>
        <button
          className="btn"
          onClick={() =>
            void invoke<{ ok: boolean; issues: { path: string; message: string }[] }>(IPC.authorValidate, { packId, lessonId }).then(
              (r) => setMsg(r.ok ? 'Valid' : r.issues.map((i) => `${i.path}: ${i.message}`).join('; '))
            )
          }
        >
          Validate
        </button>
        <button className="btn" onClick={() => void invoke(IPC.authorImportAsset, { packId, lessonId })}>
          Import asset
        </button>
        <button className="btn" onClick={() => void invoke(IPC.authorExportZip, { packId, lessonId })}>
          Export lesson zip
        </button>
        <button className="btn" onClick={() => void invoke(IPC.authorExportZip, { packId })}>
          Export pack zip
        </button>
      </div>
      {msg && <p>{msg}</p>}
      <div className="author-editor">
        <CodeEditor language="json" path="lesson.json" value={json} onChange={setJson} />
      </div>
    </div>
  )
}
