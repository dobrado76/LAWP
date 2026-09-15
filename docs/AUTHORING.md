# How to make a lesson

You do **not** write JSON. Open **Author** in the app. The forms write the cartridge for you.

The on-disk shape (for zip, git, and AI) is still JSON. That contract lives in [CONTENT_MODEL.md](CONTENT_MODEL.md). This page is the human path.

## 1. Open Author

From the top nav: **Author**.

**New** — pick a pack (or name a new one), type the lesson title, create. The id is filled from the title.

**Open** — pick a pack card, then a lesson, then Open.

You land in a workspace: outline on the left, one block in the middle, **Save** / **Play** on the top bar. **Details** (minutes, course, export, JSON) is a side panel, not the first screen.

## 2. Lesson title and details

The title is the big field in the top bar — that is what the Library shows.

**Details** (optional):

| Field | What to put |
| --- | --- |
| Card description | Two or three sentences for the Library card. No code. Capital letter, ends with a period. Takeaway pills (number, array, function) live with the card catalog. |
| Minutes | Honest estimate |
| Task revision | Bump this if you change the task so old scores do not carry |
| Skills | Optional ids, comma-separated (`plants.light`) |
| Course / Module | Where it sits on the path. New packs use `drafts` / `main` |

## 3. Add blocks (top to bottom)

Click **Add a block**. Pick Explain, Question, a playable world, or code — not a raw type name. For a question, pick the kind from the next screen (pick one, cloze, match, …).

Typical shapes:

**Reading + questions**

1. **Explain** — the idea (markdown: `##` heading, lists, `` `code` ``).
2. **Question** — pick a type (see below). Repeat for more questions.
3. **Reflect** — optional “say it in your own words” (not auto-graded).

**Playable world (circuits-style)**

1. Explain
2. **Predict** (optional, but experiments should have one)
3. **Playable world** — parts the learner can change, actions, a goal
4. Optional **Question** after the run

**Code**

1. Explain or Predict
2. **Code** or **Debug** — files, engine, what stdout / asserts must show
3. Hints on that block

**Keep / project**

- **Project** — a brief and files the learner keeps working on

### Question types

When you add a **Question**, pick the type first. Author shows only the fields that kind needs.

| Type | Learner does | You set as correct |
| --- | --- | --- |
| Pick one | One radio | Choice id |
| Pick every right answer | Checkboxes | Ids, comma-separated |
| Which does not belong? | One radio | The odd id |
| True or false | Two buttons | `true` or `false` |
| Pick the picture | Radios with images | Choice id. **Import picture** first, paste `assets/name.svg` on the choice |
| Type the word | Text box | Words, one per line. Close spellings pass |
| Choose the word | Dropdown in the sentence (`________` or `{{a}}`) | Choice id(s) — more than one can be right |
| Enter the number | Number (+ unit) | Value and optional tolerance |
| Fix this | Edit a starter line | Finished sentences, one per line. Close spellings pass |
| Fill the blanks | Dropdowns in `{{a}}` | `a = choiceId` per line |
| Drag words into the sentence | Shared word bank into `{{a}}` | Same map |
| Connect each pair | Left → right menus | `leftId = rightId` per line |
| Put these in order | Drag, or icon up / down | Ids in order |
| Place each piece | Drag onto a diagram | `slotId = pieceId` |
| Tap the right spot | Click a region | Slot id |
| Number the steps on the picture | Tap slots in order | Slot ids in order |
| Sort into bins | Drag into buckets | `pieceId = binId` |
| Place in the sets | Venn: A only / A and B / B only / neither | `pieceId = fruit` or `both` or `out` |
| Tap the word | Click `[[id:word]]` in a passage | Token id |
| Choose for each row | Table of radios | `rowId = choiceId` |
| Choose, then say why | Answer, then reason | Choice id + reason id |
| Estimate | Slider | Value + tolerance |
| Pin the number | Number line | Value |
| Listen, then pick | Play audio, then choose | Choice id. **Import** a `.wav` / `.mp3` |

**Pictures and audio:** **Import picture or audio**, then paste the returned path (`assets/lamp.svg`) into the image, piece, or audio field.

**Hints:** levels 1–3 are free conceptual help. 4–5 are assist and mark the attempt.

**Wrong-answer Why:** on a choice, set a **misconception id** that exists in the pack’s misconceptions list.

### Playable world (no JSON)

On a **Playable world** block:

- **Parts** — each thing in the scene (`id`, `type`, props like `brightness=1, label=Lamp`)
- **Learner actions** — buttons (`target`, `key`, values `0,1,2`)
- **Rules** — when a property holds, set another (`lamp.ohms eq 1` → `lamp.current = 1`)
- **Goal** — what must be true to pass (`lamp.brightness eq 2`)

Do not invent a new engine. If you cannot say it as parts + rules, use Explain + Question instead.

### Code

- Engine: Python, JavaScript, or React
- Files: path, role (`edit` / `ro` / `hidden-test` / `fixture`), and the text
- Checks: stdout equals, regex, or assert

Graphical fox lessons use `player-v1`. On a **Code** or **Debug** block, **Add fox grid** (or edit an existing grid) and pick floors, terrain, items, characters, and hazards from the built-in play kit. Same picker on a **Playable world** when View is Grid.

## 4. Save, check, play, share

| Button | What it does |
| --- | --- |
| **Save** | Writes the lesson under `%APPDATA%\LAWP\packs/<packId>/` |
| **Validate** | Schema + pack capabilities |
| **Save and play** | Save, then open Studio as a learner |
| **Export lesson zip** | One lesson, for Library → Install from ZIP |
| **Export pack zip** | The whole subject |

Reload **Library** and open the pack. New packs show a **Drafts** chapter. Overlay lessons on a bundled pack appear on that course if you set course / module, or under **Unfiled**.

## 5. What you must not do

- Do not paste Codefinity (or anyone else’s) exercises.
- Do not put secrets in a lesson. Packs can be zipped and shared.
- Do not add a new question type only in one lesson — add it to `CHECK_KINDS`, the grader, Author’s type list, **and** a lesson in the **Question types** pack (`lawp.learning.questions`).

## 6. If you already have JSON

**Advanced: raw JSON** at the bottom of Author can paste a cartridge. The forms stay the normal way to work. After a paste, click a block so the forms refresh from that object, then Save.

## See also

- [CONTENT_MODEL.md](CONTENT_MODEL.md) — zip layout, `world-v1`, progress
- [PEDAGOGY.md](PEDAGOGY.md) — hints, misconceptions, mastery
- Question types demo pack: `resources/packs/lawp.learning.questions`
