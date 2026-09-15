import { useEffect, useState } from 'react'
import { IPC, invoke } from '../api'
import type { Settings } from '@shared/schemas/settings'

export function Settings({ userDataPath }: { userDataPath: string }) {
  const [s, setS] = useState<Settings | null>(null)
  const [learners, setLearners] = useState<{ id: string; displayName: string }[]>([])
  const [name, setName] = useState('')

  async function load() {
    setS(await invoke<Settings>(IPC.settingsGet))
    const l = await invoke<{ currentId: string; learners: { id: string; displayName: string }[] }>(IPC.learnersList)
    setLearners(l.learners)
  }
  useEffect(() => {
    void load()
  }, [])

  if (!s) return <div className="page">Loading…</div>
  return (
    <div className="page">
      <h1>Settings</h1>
      <p className="muted">About · userData (dev and installed must match)</p>
      <pre>{userDataPath}</pre>
      <label>Theme</label>
      <select
        value={s.theme}
        onChange={(e) => void invoke(IPC.settingsUpdate, { theme: e.target.value }).then((v) => setS(v as Settings))}
      >
        <option value="dark">dark</option>
        <option value="light">light</option>
        <option value="system">system</option>
      </select>
      <label>Font size</label>
      <input
        type="number"
        value={s.fontSize}
        onChange={(e) => void invoke(IPC.settingsUpdate, { fontSize: Number(e.target.value) }).then((v) => setS(v as Settings))}
      />
      <label>Python path (empty = discover py -3 / python)</label>
      <input
        value={s.pythonPath}
        onChange={(e) => void invoke(IPC.settingsUpdate, { pythonPath: e.target.value }).then((v) => setS(v as Settings))}
      />
      <label>Node path (empty = node on PATH)</label>
      <input
        value={s.nodePath}
        onChange={(e) => void invoke(IPC.settingsUpdate, { nodePath: e.target.value }).then((v) => setS(v as Settings))}
      />
      <h2>Learners</h2>
      {learners.map((l) => (
        <div key={l.id} className="row">
          <span>{l.displayName}</span>
          <button className="btn" onClick={() => void invoke(IPC.learnersSwitch, { learnerId: l.id }).then(load)}>
            Switch
          </button>
        </div>
      ))}
      <div className="row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New learner name" />
        <button className="btn" onClick={() => void invoke(IPC.learnersCreate, { displayName: name }).then(load)}>
          Add
        </button>
      </div>
      <h2>Data</h2>
      <div className="row">
        <button className="btn" onClick={() => void invoke(IPC.settingsExport, { includeCartridges: false })}>
          Export settings
        </button>
        <button className="btn primary" onClick={() => void invoke(IPC.settingsExport, { includeCartridges: true })}>
          Export setup (settings + resolved packs)
        </button>
        <button className="btn" onClick={() => void invoke(IPC.settingsImport, {}).then(load)}>
          Import settings / setup
        </button>
      </div>
      <p className="muted">Import merges and does not grant code-execution trust. Progress is never included.</p>
    </div>
  )
}
