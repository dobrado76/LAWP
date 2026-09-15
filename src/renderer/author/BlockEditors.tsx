import { CHECK_KIND_LABEL, CHECK_KINDS, type CheckKind } from '@shared/check'
import { clampGrid } from '@shared/play'
import { DEFAULT_FLOOR, blankGridWorld, playKitPiece } from '@shared/playKit'
import { Field, ListEditor, NumInput, SelectField, TextArea, TextInput } from './fields'
import { PlayKitPicker } from './PlayKitPicker'

type Block = Record<string, unknown>
type Choice = { id: string; md: string; misconceptionId?: string; image?: string }

export function BlockEditor({
  block,
  onChange
}: {
  block: Block
  onChange: (next: Block) => void
}) {
  const type = String(block.type)
  if (type === 'explain') {
    return <TextArea label="Text (markdown)" value={str(block.md)} onChange={(md) => onChange({ ...block, md })} rows={10} />
  }
  if (type === 'reflect') {
    return (
      <>
        <TextInput label="Id" value={str(block.id)} onChange={(id) => onChange({ ...block, id })} />
        <TextArea label="Prompt" value={str(block.promptMd)} onChange={(promptMd) => onChange({ ...block, promptMd })} />
      </>
    )
  }
  if (type === 'predict') return <PredictEditor block={block} onChange={onChange} />
  if (type === 'check') return <CheckEditor block={block} onChange={onChange} />
  if (type === 'activity') return <ActivityEditor block={block} onChange={onChange} />
  if (type === 'code' || type === 'debug') return <CodeEditorBlock block={block} onChange={onChange} />
  if (type === 'project') {
    return (
      <>
        <SelectField
          label="Engine"
          value={str(block.engine, 'none')}
          onChange={(engine) => onChange({ ...block, engine })}
          options={['none', 'python', 'javascript', 'react'].map((id) => ({ id, label: id }))}
        />
        <TextArea label="Brief" value={str(block.briefMd)} onChange={(briefMd) => onChange({ ...block, briefMd })} />
      </>
    )
  }
  return <p className="muted">Unknown block type {type}</p>
}

function PredictEditor({ block, onChange }: { block: Block; onChange: (n: Block) => void }) {
  const choices = asChoices(block.choices)
  return (
    <>
      <TextInput label="Id" value={str(block.id)} onChange={(id) => onChange({ ...block, id })} />
      <TextArea label="Prompt" value={str(block.promptMd)} onChange={(promptMd) => onChange({ ...block, promptMd })} />
      <SelectField
        label="Kind"
        value={str(block.kind, 'mcq')}
        onChange={(kind) => onChange({ ...block, kind })}
        options={['mcq', 'short', 'numeric'].map((id) => ({ id, label: id }))}
      />
      <ChoicesEditor choices={choices} onChange={(c) => onChange({ ...block, choices: c })} />
      <TextInput label="Correct choice id" value={str(block.answer)} onChange={(answer) => onChange({ ...block, answer })} />
    </>
  )
}

function CheckEditor({ block, onChange }: { block: Block; onChange: (n: Block) => void }) {
  const kind = (CHECK_KINDS.includes(block.kind as CheckKind) ? block.kind : 'mcq') as CheckKind
  const set = (patch: Block) => onChange({ ...block, ...patch })
  return (
    <>
      <TextInput label="Id" value={str(block.id)} onChange={(id) => set({ id })} />
      <SelectField
        label="Question type"
        value={kind}
        onChange={(next) => set({ kind: next })}
        options={CHECK_KINDS.map((id) => ({ id, label: `${id} — ${CHECK_KIND_LABEL[id]}` }))}
      />
      <TextArea
        label={kind === 'cloze' || kind === 'bank' || kind === 'select' ? 'Sentence (use {{a}} or ________ for the menu)' : kind === 'hottext' ? 'Passage ([[id:word]] to tap)' : 'Prompt'}
        value={str(block.promptMd)}
        onChange={(promptMd) => set({ promptMd })}
        hint={
          kind === 'select'
            ? 'Example: A list is a ________ of values.'
            : kind === 'cloze' || kind === 'bank'
              ? 'Example: A list is a {{a}} of {{b}}.'
              : kind === 'hottext'
                ? 'Example: The fox [[ok:walked]] then [[bad:teleported]].'
                : undefined
        }
      />
      <TextArea label="After a correct answer" value={str(block.explainMd)} onChange={(explainMd) => set({ explainMd })} rows={3} />
      {usesChoices(kind) ? <ChoicesEditor choices={asChoices(block.choices)} onChange={(choices) => set({ choices })} pictures={kind === 'image'} /> : null}
      {kind === 'match' ? (
        <>
          <ChoicesEditor title="Left" choices={asChoices(block.left)} onChange={(left) => set({ left })} />
          <ChoicesEditor title="Right" choices={asChoices(block.right)} onChange={(right) => set({ right })} />
        </>
      ) : null}
      {kind === 'cloze' ? (
        <ListEditor
          title="Blanks"
          items={asBlanks(block.blanks)}
          onChange={(blanks) => set({ blanks })}
          blank={() => ({ id: 'x', choices: [{ id: 'a', md: 'A' }] })}
          render={(item, upd, remove) => (
            <div className="author-row">
              <input value={item.id} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="blank id" />
              <button type="button" className="btn" onClick={remove}>
                Remove
              </button>
              <ChoicesEditor choices={item.choices ?? []} onChange={(choices) => upd({ ...item, choices })} />
            </div>
          )}
        />
      ) : null}
      {kind === 'bank' || kind === 'place' || kind === 'bins' || kind === 'venn' ? (
        <ChoicesEditor title="Pieces" choices={asChoices(block.pieces)} onChange={(pieces) => set({ pieces })} />
      ) : null}
      {kind === 'bins' ? <ChoicesEditor title="Bins" choices={asChoices(block.bins)} onChange={(bins) => set({ bins })} /> : null}
      {kind === 'venn' ? <ChoicesEditor title="Sets (two)" choices={asChoices(block.sets)} onChange={(sets) => set({ sets })} /> : null}
      {kind === 'table' ? <ChoicesEditor title="Rows" choices={asChoices(block.rows)} onChange={(rows) => set({ rows })} /> : null}
      {kind === 'tier' ? (
        <ListEditor
          title="Reasons (why)"
          items={asReasons(block.reasons)}
          onChange={(reasons) => set({ reasons })}
          blank={() => ({ id: 'r1', md: 'Because…', when: [] })}
          render={(item, upd, remove) => (
            <div className="author-row">
              <input value={item.id} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="id" />
              <input value={item.md} onChange={(e) => upd({ ...item, md: e.target.value })} placeholder="reason" />
              <input
                value={(item.when ?? []).join(',')}
                onChange={(e) => upd({ ...item, when: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                placeholder="shown after choice ids"
              />
              <button type="button" className="btn" onClick={remove}>
                Remove
              </button>
            </div>
          )}
        />
      ) : null}
      {kind === 'place' || kind === 'hotspot' || kind === 'gorder' ? (
        <>
          <TextInput label="Diagram image" value={str(block.image)} onChange={(image) => set({ image })} hint="After Import asset, paste assets/name.svg" />
          <ListEditor
            title="Slots"
            items={asSlots(block.slots)}
            onChange={(slots) => set({ slots })}
            blank={() => ({ id: 'slot', x: 10, y: 10, w: 30, h: 16, label: 'Slot' })}
            render={(item, upd, remove) => (
              <div className="author-row">
                <input value={item.id} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="id" />
                <input value={item.label ?? ''} onChange={(e) => upd({ ...item, label: e.target.value })} placeholder="label" />
                <input type="number" value={item.x} onChange={(e) => upd({ ...item, x: Number(e.target.value) })} title="x %" />
                <input type="number" value={item.y} onChange={(e) => upd({ ...item, y: Number(e.target.value) })} title="y %" />
                <input type="number" value={item.w ?? 24} onChange={(e) => upd({ ...item, w: Number(e.target.value) })} title="w %" />
                <input type="number" value={item.h ?? 16} onChange={(e) => upd({ ...item, h: Number(e.target.value) })} title="h %" />
                <button type="button" className="btn" onClick={remove}>
                  Remove
                </button>
              </div>
            )}
          />
        </>
      ) : null}
      {kind === 'listen' ? <TextInput label="Audio file" value={str(block.audio)} onChange={(audio) => set({ audio })} hint="Import a wav/mp3, then paste assets/clip.wav" /> : null}
      {kind === 'fix' ? <TextInput label="Broken starter text" value={str(block.starter)} onChange={(starter) => set({ starter })} /> : null}
      {kind === 'numeric' || kind === 'slider' || kind === 'numberline' ? (
        <div className="author-row">
          <NumInput label="Min" value={num(block.min, 0)} onChange={(min) => set({ min })} />
          <NumInput label="Max" value={num(block.max, 10)} onChange={(max) => set({ max })} />
          <NumInput label="Step" value={num(block.step, 1)} onChange={(step) => set({ step })} />
          <TextInput label="Unit" value={str(block.unit)} onChange={(unit) => set({ unit })} />
        </div>
      ) : null}
      <AnswerEditor kind={kind} block={block} onChange={set} />
      <HintEditor items={asHints(block.hintLadder)} onChange={(hintLadder) => set({ hintLadder })} />
    </>
  )
}

function AnswerEditor({
  kind,
  block,
  onChange
}: {
  kind: CheckKind
  block: Block
  onChange: (p: Block) => void
}) {
  if (kind === 'multi' || kind === 'order' || kind === 'gorder') {
    const ids = Array.isArray(block.answer) ? (block.answer as string[]) : []
    return (
      <TextInput
        label="Correct ids (comma-separated, in order if needed)"
        value={ids.join(', ')}
        onChange={(v) => onChange({ answer: v.split(',').map((s) => s.trim()).filter(Boolean) })}
      />
    )
  }
  if (kind === 'match' || kind === 'place' || kind === 'cloze' || kind === 'bank' || kind === 'bins' || kind === 'venn' || kind === 'table') {
    const rec = asRecord(block.answer)
    return (
      <TextArea
        label="Correct map (one pair per line: leftId = rightId)"
        value={Object.entries(rec)
          .map(([k, v]) => `${k} = ${v}`)
          .join('\n')}
        onChange={(v) => {
          const answer: Record<string, string> = {}
          for (const line of v.split('\n')) {
            const m = line.match(/^\s*(\S+)\s*=\s*(.+?)\s*$/)
            if (m) answer[m[1]!] = m[2]!
          }
          onChange({ answer })
        }}
        rows={5}
      />
    )
  }
  if (kind === 'tier') {
    const a = asRecord(block.answer)
    return (
      <div className="author-row">
        <TextInput label="Correct choice id" value={a.choice ?? ''} onChange={(choice) => onChange({ answer: { ...a, choice } })} />
        <TextInput label="Correct reason id" value={a.reason ?? ''} onChange={(reason) => onChange({ answer: { ...a, reason } })} />
      </div>
    )
  }
  if (kind === 'numeric' || kind === 'slider' || kind === 'numberline') {
    const spec = typeof block.answer === 'number' ? { value: block.answer, tolerance: 0 } : asRecord(block.answer)
    return (
      <div className="author-row">
        <NumInput
          label="Correct value"
          value={num(spec.value, 0)}
          onChange={(value) => onChange({ answer: { value, tolerance: num(spec.tolerance, 0) } })}
        />
        <NumInput
          label="Tolerance"
          value={num(spec.tolerance, 0)}
          onChange={(tolerance) => onChange({ answer: { value: num(spec.value, 0), tolerance } })}
        />
      </div>
    )
  }
  if (kind === 'short' || kind === 'fix') {
    const raw = Array.isArray(block.answer) ? (block.answer as string[]).join('\n') : str(block.answer)
    return (
      <TextArea
        label="Accepted answers (one per line). Close spellings also pass."
        value={raw}
        onChange={(v) => {
          const parts = v.split('\n').map((s) => s.trim()).filter(Boolean)
          onChange({ answer: parts.length > 1 ? parts : parts[0] ?? '' })
        }}
        rows={kind === 'fix' ? 4 : 3}
      />
    )
  }
  if (kind === 'select') {
    const raw = Array.isArray(block.answer) ? (block.answer as string[]).join(', ') : str(block.answer)
    return (
      <TextInput
        label="Correct choice id(s), comma-separated if more than one is right"
        value={raw}
        onChange={(v) => {
          const parts = v.split(',').map((s) => s.trim()).filter(Boolean)
          onChange({ answer: parts.length > 1 ? parts : parts[0] ?? '' })
        }}
      />
    )
  }
  return <TextInput label="Correct id" value={str(block.answer)} onChange={(answer) => onChange({ answer })} />
}

function ActivityEditor({ block, onChange }: { block: Block; onChange: (n: Block) => void }) {
  const world = (block.world as Record<string, unknown>) ?? {}
  const parts = Array.isArray(world.parts) ? (world.parts as Record<string, unknown>[]) : []
  const actions = Array.isArray(world.actions) ? (world.actions as Record<string, unknown>[]) : []
  const rules = Array.isArray(world.rules) ? (world.rules as Record<string, unknown>[]) : []
  const goalAll = Array.isArray((block.goal as { all?: unknown[] } | undefined)?.all)
    ? ((block.goal as { all: Record<string, unknown>[] }).all)
    : []
  return (
    <>
      <TextInput label="Id" value={str(block.id)} onChange={(id) => onChange({ ...block, id })} />
      <SelectField
        label="Kind"
        value={str(block.kind, 'experiment')}
        onChange={(kind) => onChange({ ...block, kind })}
        options={['experiment', 'diagnose', 'construct', 'decide'].map((id) => ({ id, label: id }))}
      />
      <TextArea label="What to do" value={str(block.promptMd)} onChange={(promptMd) => onChange({ ...block, promptMd })} />
      <TextArea
        label="After success"
        value={str((block.explainAfter as { promptMd?: string } | undefined)?.promptMd)}
        onChange={(promptMd) => onChange({ ...block, explainAfter: { promptMd } })}
        rows={3}
      />
      <GridViewFields
        world={world}
        onChange={(next) => onChange({ ...block, world: next })}
      />
      <ListEditor
        title="Parts in the world"
        items={parts}
        onChange={(next) => onChange({ ...block, world: { ...world, parts: next } })}
        blank={() => (str((world.view as { kind?: string } | undefined)?.kind) === 'grid' ? kitPart('rock') : { id: 'part', type: 'generic', props: { value: 0, label: 'Part' } })}
        render={(item, upd, remove) => (
          <div className="author-stack">
            {str((world.view as { kind?: string } | undefined)?.kind) === 'grid' ? (
              <PlayKitPicker
                value={str(item.type)}
                onPick={(id) => upd({ ...item, type: id, props: { ...asProps(item.props), ...playKitPiece(id)?.defaults, label: playKitPiece(id)?.label ?? id } })}
              />
            ) : null}
            <div className="author-row">
            <input value={str(item.id)} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="id" />
            <input value={str(item.type)} onChange={(e) => upd({ ...item, type: e.target.value })} placeholder="type" />
            <input
              value={propsLine(item.props)}
              onChange={(e) => upd({ ...item, props: parseProps(e.target.value) })}
              placeholder="brightness=1, label=Lamp"
            />
            <button type="button" className="btn" onClick={remove}>
              Remove
            </button>
          </div>
          </div>
        )}
      />
      <ListEditor
        title="Learner actions"
        items={actions}
        onChange={(next) => onChange({ ...block, world: { ...world, actions: next } })}
        blank={() => ({ id: 'act', label: 'Set', target: 'part', op: 'set', key: 'value', values: [0, 1] })}
        render={(item, upd, remove) => (
          <div className="author-row">
            <input value={str(item.id)} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="id" />
            <input value={str(item.label)} onChange={(e) => upd({ ...item, label: e.target.value })} placeholder="label" />
            <input value={str(item.target)} onChange={(e) => upd({ ...item, target: e.target.value })} placeholder="target" />
            <input value={str(item.key)} onChange={(e) => upd({ ...item, key: e.target.value })} placeholder="key" />
            <input
              value={Array.isArray(item.values) ? item.values.join(',') : ''}
              onChange={(e) => upd({ ...item, values: parseValues(e.target.value) })}
              placeholder="0,1,2"
            />
            <button type="button" className="btn" onClick={remove}>
              Remove
            </button>
          </div>
        )}
      />
      <ListEditor
        title="Rules (when → set)"
        items={rules}
        onChange={(next) => onChange({ ...block, world: { ...world, rules: next } })}
        blank={() => ({ id: 'r1', when: [{ path: 'a.value', op: 'eq', value: 1 }], set: [{ target: 'a', key: 'ok', value: true }] })}
        render={(item, upd, remove) => (
          <div className="author-stack">
            <div className="author-row">
              <input value={str(item.id)} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="rule id" />
              <button type="button" className="btn" onClick={remove}>
                Remove
              </button>
            </div>
            <TextInput
              label="When (path op value, one per line)"
              value={propsToWhen(item.when)}
              onChange={(v) => upd({ ...item, when: parseWhen(v) })}
            />
            <TextInput
              label="Set (target.key = value, one per line)"
              value={setsToLine(item.set)}
              onChange={(v) => upd({ ...item, set: parseSets(v) })}
            />
          </div>
        )}
      />
      <ListEditor
        title="Goal (all must hold)"
        items={goalAll}
        onChange={(all) => onChange({ ...block, goal: { all } })}
        blank={() => ({ path: 'lamp.brightness', op: 'eq', value: 2 })}
        render={(item, upd, remove) => (
          <div className="author-row">
            <input value={str(item.path)} onChange={(e) => upd({ ...item, path: e.target.value })} placeholder="part.key" />
            <select value={str(item.op, 'eq')} onChange={(e) => upd({ ...item, op: e.target.value })}>
              {['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'includes'].map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input value={String(item.value ?? '')} onChange={(e) => upd({ ...item, value: coerce(e.target.value) })} />
            <button type="button" className="btn" onClick={remove}>
              Remove
            </button>
          </div>
        )}
      />
      <HintEditor items={asHints(block.hintLadder)} onChange={(hintLadder) => onChange({ ...block, hintLadder })} />
    </>
  )
}

function CodeEditorBlock({ block, onChange }: { block: Block; onChange: (n: Block) => void }) {
  const files = Array.isArray(block.files) ? (block.files as Record<string, unknown>[]) : []
  const checks = Array.isArray(block.checks) ? (block.checks as Record<string, unknown>[]) : []
  return (
    <>
      <SelectField
        label="Engine"
        value={str(block.engine, 'javascript')}
        onChange={(engine) => onChange({ ...block, engine })}
        options={['python', 'javascript', 'react'].map((id) => ({ id, label: id }))}
      />
      <TextInput label="Entry file" value={str(block.entry)} onChange={(entry) => onChange({ ...block, entry })} />
      <TextArea label="Prompt" value={str(block.promptMd)} onChange={(promptMd) => onChange({ ...block, promptMd })} rows={3} />
      <ListEditor
        title="Files"
        items={files}
        onChange={(next) => onChange({ ...block, files: next })}
        blank={() => ({ path: 'files/main.js', role: 'edit', contents: '' })}
        render={(item, upd, remove) => (
          <div className="author-stack">
            <div className="author-row">
              <input value={str(item.path)} onChange={(e) => upd({ ...item, path: e.target.value })} placeholder="files/main.js" />
              <select value={str(item.role, 'edit')} onChange={(e) => upd({ ...item, role: e.target.value })}>
                {['edit', 'ro', 'hidden-test', 'fixture'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button type="button" className="btn" onClick={remove}>
                Remove
              </button>
            </div>
            <textarea rows={8} value={str(item.contents)} onChange={(e) => upd({ ...item, contents: e.target.value })} />
          </div>
        )}
      />
      <ListEditor
        title="Hidden / visible checks"
        items={checks}
        onChange={(next) => onChange({ ...block, checks: next })}
        blank={() => ({ type: 'stdout', equals: '' })}
        render={(item, upd, remove) => (
          <div className="author-row">
            <select value={str(item.type, 'stdout')} onChange={(e) => upd({ ...item, type: e.target.value })}>
              {['stdout', 'stdout-regex', 'python-assert', 'js-assert', 'ast'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input value={str(item.equals)} onChange={(e) => upd({ ...item, equals: e.target.value })} placeholder="equals" />
            <input value={str(item.pattern)} onChange={(e) => upd({ ...item, pattern: e.target.value })} placeholder="pattern" />
            <button type="button" className="btn" onClick={remove}>
              Remove
            </button>
          </div>
        )}
      />
      <HintEditor items={asHints(block.hintLadder)} onChange={(hintLadder) => onChange({ ...block, hintLadder })} />
      <GridPlayEditor block={block} onChange={onChange} />
    </>
  )
}

function GridViewFields({
  world,
  onChange
}: {
  world: Record<string, unknown>
  onChange: (w: Record<string, unknown>) => void
}) {
  const view = (world.view as Record<string, unknown>) ?? {}
  const grid = (view.grid as Record<string, unknown>) ?? {}
  const kind = str(view.kind, 'graph')
  return (
    <>
      <SelectField
        label="View"
        value={kind}
        onChange={(next) =>
          onChange({
            ...world,
            view: {
              ...view,
              kind: next,
              grid: next === 'grid' ? { cols: Number(grid.cols ?? 5), rows: Number(grid.rows ?? 5), floor: str(grid.floor, DEFAULT_FLOOR) } : grid
            }
          })
        }
        options={[
          { id: 'graph', label: 'Graph (circuits)' },
          { id: 'list', label: 'List' },
          { id: 'grid', label: 'Grid (puzzles)' }
        ]}
      />
      {kind === 'grid' ? (
        <>
          <div className="author-row">
            <NumInput
              label="Columns (1–64)"
              value={Number(grid.cols ?? 5)}
              onChange={(cols) => onChange({ ...world, view: { ...view, grid: { ...grid, cols: clampGrid(cols) } } })}
            />
            <NumInput
              label="Rows (1–64)"
              value={Number(grid.rows ?? 5)}
              onChange={(rows) => onChange({ ...world, view: { ...view, grid: { ...grid, rows: clampGrid(rows) } } })}
            />
          </div>
          <Field label="Floor tile">
            <PlayKitPicker
              value={str(grid.floor, DEFAULT_FLOOR)}
              categories={['floors']}
              onPick={(floor) => onChange({ ...world, view: { ...view, grid: { ...grid, floor } } })}
            />
          </Field>
        </>
      ) : null}
    </>
  )
}

function GridPlayEditor({ block, onChange }: { block: Block; onChange: (n: Block) => void }) {
  const play = (block.play as Record<string, unknown>) ?? null
  if (!play) {
    return (
      <Field label="Grid puzzle">
        <button
          type="button"
          className="btn"
          onClick={() =>
            onChange({
              ...block,
              play: {
                api: 'player-v1',
                playerId: 'fox',
                world: blankGridWorld(),
                goal: { all: [{ path: 'fox.x', op: 'eq', value: 4 }, { path: 'fox.y', op: 'eq', value: 0 }] }
              }
            })
          }
        >
          Add fox grid
        </button>
      </Field>
    )
  }
  const world = (play.world as Record<string, unknown>) ?? {}
  const parts = Array.isArray(world.parts) ? (world.parts as Record<string, unknown>[]) : []
  return (
    <>
      <h4 className="author-subhead">Grid puzzle</h4>
      <GridViewFields world={world} onChange={(next) => onChange({ ...block, play: { ...play, world: next } })} />
      <ListEditor
        title="Tiles, items, characters"
        items={parts}
        onChange={(next) => onChange({ ...block, play: { ...play, world: { ...world, parts: next } } })}
        blank={() => kitPart('rock')}
        render={(item, upd, remove) => (
          <div className="author-stack">
            <PlayKitPicker
              value={str(item.type)}
              onPick={(id) =>
                upd({
                  ...item,
                  type: id,
                  props: { ...asProps(item.props), ...playKitPiece(id)?.defaults, label: playKitPiece(id)?.label ?? id }
                })
              }
            />
            <div className="author-row">
              <input value={str(item.id)} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="id" />
              <input
                value={propsLine(item.props)}
                onChange={(e) => upd({ ...item, props: parseProps(e.target.value) })}
                placeholder="x=0, y=0, solid=true"
              />
              <button type="button" className="btn" onClick={remove}>
                Remove
              </button>
            </div>
          </div>
        )}
      />
    </>
  )
}

function kitPart(type: string) {
  const piece = playKitPiece(type)
  return {
    id: piece?.id ?? type,
    type,
    props: { x: 0, y: 0, label: piece?.label ?? type, ...piece?.defaults }
  }
}

function asProps(raw: unknown): Record<string, string | number | boolean> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, string | number | boolean>
  return {}
}

function ChoicesEditor({
  title = 'Choices',
  choices,
  onChange,
  pictures
}: {
  title?: string
  choices: Choice[]
  onChange: (c: Choice[]) => void
  pictures?: boolean
}) {
  return (
    <ListEditor
      title={title}
      items={choices}
      onChange={onChange}
      blank={(): Choice => ({ id: 'x', md: 'New choice' })}
      render={(item, upd, remove) => (
        <div className="author-row">
          <input value={item.id} onChange={(e) => upd({ ...item, id: e.target.value })} placeholder="id" />
          <input value={item.md} onChange={(e) => upd({ ...item, md: e.target.value })} placeholder="text" />
          {pictures ? (
            <input value={item.image ?? ''} onChange={(e) => upd({ ...item, image: e.target.value })} placeholder="assets/a.svg" />
          ) : null}
          <input
            value={item.misconceptionId ?? ''}
            onChange={(e) => upd({ ...item, misconceptionId: e.target.value || undefined })}
            placeholder="misconception id"
          />
          <button type="button" className="btn" onClick={remove}>
            Remove
          </button>
        </div>
      )}
    />
  )
}

function HintEditor({
  items,
  onChange
}: {
  items: { level: number; kind?: string; md: string }[]
  onChange: (h: { level: number; kind?: string; md: string }[]) => void
}) {
  return (
    <ListEditor
      title="Hints (1–3 free, 4–5 assist)"
      items={items}
      onChange={onChange}
      blank={() => ({ level: items.length + 1, kind: 'concept', md: '' })}
      render={(item, upd, remove) => (
        <div className="author-row">
          <input type="number" min={1} max={5} value={item.level} onChange={(e) => upd({ ...item, level: Number(e.target.value) })} />
          <select value={item.kind ?? 'concept'} onChange={(e) => upd({ ...item, kind: e.target.value })}>
            <option value="concept">concept</option>
            <option value="assist">assist</option>
          </select>
          <input value={item.md} onChange={(e) => upd({ ...item, md: e.target.value })} placeholder="hint text" />
          <button type="button" className="btn" onClick={remove}>
            Remove
          </button>
        </div>
      )}
    />
  )
}

function usesChoices(kind: CheckKind) {
  return ['mcq', 'multi', 'odd', 'image', 'listen', 'order', 'table', 'tier', 'select'].includes(kind)
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function num(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function asChoices(v: unknown): Choice[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => ({
    id: str((x as Choice).id),
    md: str((x as Choice).md),
    misconceptionId: (x as Choice).misconceptionId,
    image: (x as Choice).image
  }))
}

function asBlanks(v: unknown): { id: string; choices?: Choice[] }[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => ({ id: str((x as { id?: string }).id), choices: asChoices((x as { choices?: unknown }).choices) }))
}

function asReasons(v: unknown): { id: string; md: string; when?: string[] }[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => ({
    id: str((x as { id?: string }).id),
    md: str((x as { md?: string }).md),
    when: Array.isArray((x as { when?: string[] }).when) ? (x as { when: string[] }).when : []
  }))
}

function asSlots(v: unknown): { id: string; x: number; y: number; w?: number; h?: number; label?: string }[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => ({
    id: str((x as { id?: string }).id),
    x: num((x as { x?: number }).x, 10),
    y: num((x as { y?: number }).y, 10),
    w: num((x as { w?: number }).w, 24),
    h: num((x as { h?: number }).h, 16),
    label: (x as { label?: string }).label
  }))
}

function asHints(v: unknown): { level: number; kind?: string; md: string }[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => ({
    level: num((x as { level?: number }).level, 1),
    kind: str((x as { kind?: string }).kind, 'concept'),
    md: str((x as { md?: string }).md)
  }))
}

function asRecord(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = String(val)
  return out
}

function propsLine(props: unknown): string {
  if (!props || typeof props !== 'object') return ''
  return Object.entries(props as Record<string, unknown>)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(', ')
}

function parseProps(s: string): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const part of s.split(',')) {
    const m = part.match(/^\s*([^=]+)=(.*)$/)
    if (m) out[m[1]!.trim()] = coerce(m[2]!.trim())
  }
  return out
}

function parseValues(s: string): Array<string | number | boolean> {
  return s.split(',').map((x) => coerce(x.trim())).filter((x) => x !== '')
}

function coerce(s: string): string | number | boolean {
  if (s === 'true') return true
  if (s === 'false') return false
  if (s !== '' && Number.isFinite(Number(s))) return Number(s)
  return s
}

function propsToWhen(when: unknown): string {
  if (!Array.isArray(when)) return ''
  return when.map((w) => `${(w as { path: string }).path} ${(w as { op: string }).op} ${(w as { value: unknown }).value}`).join('\n')
}

function parseWhen(s: string): { path: string; op: string; value: string | number | boolean }[] {
  return s
    .split('\n')
    .map((line) => line.match(/^\s*(\S+)\s+(\S+)\s+(.+?)\s*$/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ path: m[1]!, op: m[2]!, value: coerce(m[3]!) }))
}

function setsToLine(set: unknown): string {
  if (!Array.isArray(set)) return ''
  return set.map((s) => `${(s as { target: string }).target}.${(s as { key: string }).key} = ${(s as { value: unknown }).value}`).join('\n')
}

function parseSets(s: string): { target: string; key: string; value: string | number | boolean }[] {
  return s
    .split('\n')
    .map((line) => line.match(/^\s*([^.]+)\.(\S+)\s*=\s*(.+?)\s*$/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ target: m[1]!, key: m[2]!, value: coerce(m[3]!) }))
}
