# Course production spec

**Read this before generating a course for any subject.** It is the contract an AI agent follows to
produce a LAWP course that teaches well, plays well, and ships without a human repairing it
afterwards. It is deliberately subject-agnostic: electricity, Python, music theory, chemistry,
statistics, or first aid all go through the same gates.

It does not replace the other docs, it sequences them:

| When | Read |
| --- | --- |
| Locked product behaviour you may not contradict | [DECISIONS.md](DECISIONS.md) |
| The JSON on disk, `world-v1`, progress | [CONTENT_MODEL.md](CONTENT_MODEL.md) |
| Why the teaching loop is shaped this way | [PEDAGOGY.md](PEDAGOGY.md) |
| The human path through the Author UI | [AUTHORING.md](AUTHORING.md) |
| Existing tracks and their locked paths | [CURRICULA.md](CURRICULA.md) |
| A worked generator | [`scripts/py-curriculum/README.md`](../scripts/py-curriculum/README.md) |

Three rules override everything below. A course that breaks one of them does not ship no matter how
good the rest is.

1. **Original only.** Never reproduce Codefinity or anyone else's lessons, exercise text, or chapter
   structure. Write from the subject, not from a competitor.
2. **Nothing is true because you wrote it.** Every gate in [§10](#10-verification-gates) is a command
   you run, not a claim you make.
3. **The learner is never lied to.** No fake progress, no estimate you do not believe, no "Correct!"
   for something you did not check, no hint that reveals what the lesson is about to ask.

---

## 1. The subject brief

Write this down before a single lesson. Everything afterwards is checked against it.

| Field | What it must say |
| --- | --- |
| Pack id | `lawp.<subject>.<flavour>` — permanent, progress keys hang off it |
| Title | What the learner becomes, not what the topic is called |
| Level | Honest start and end, e.g. "absolute beginner → working practitioner" |
| Hours | A range you would defend, not a marketing number |
| Definition of done | One sentence: what the graduate can **predict**, **prove**, and **explain** |
| In scope | The list you will actually teach |
| **Out of scope** | The list you will refuse. Longer than you want it to be |
| Story | The world the lessons live in — a field station, a workshop, a clinic |
| Engine | See [§2](#2-choosing-the-engine) |

**The definition of done is the spec's spine.** "A working Python developer can predict what the
interpreter will do, prove it with a small program, and explain why." Every lesson either serves
that sentence or is cut. If you cannot write the sentence, you do not understand the subject well
enough to teach it yet.

**Out of scope is a feature.** A course that says "no NumPy, no pandas, no web frameworks" is
trustworthy. A course that implies it covers everything is not. Never stub an empty course for
something you are not teaching.

## 2. Choosing the engine

| The subject… | Engine | Example |
| --- | --- | --- |
| is code the learner writes | `python` / `javascript` / `react` | the Python and JavaScript packs |
| has state you can show, change, and be wrong about | `world-v1` | circuits: lamp, battery, meter |
| has neither | `none` — explain + checks, carried by **diagrams** | a pure theory module |

Pick `world-v1` whenever the subject has visible state. A chemistry course with a reaction you can
run, a music course with a chord you can build, an economics course with a market you can shock —
all of these are `world-v1` (parts, actions, rules, goal), not a quiz with pictures.

Two hard limits. **Do not invent a new engine**: if you cannot express the subject as parts plus
rules, author a lookup table of states, or fall back to explain plus checks. And **do not fake it as
tiles**: a thing the world cannot honestly simulate must be taught with a diagram and a question, not
a grid pretending to be the thing.

A `none` course is the hardest to make good, not the easiest. Without a runnable task, the diagrams
and the check variety carry the whole lesson — budget for real artwork.

## 3. Architecture and sizing

```
pack
└── track          a phase of the journey, 1–4 courses
    └── course     a sitting-sized chunk, 2–4 modules
        └── module a single idea cluster, 3–6 lessons
            └── lesson
```

| Unit | Size | Notes |
| --- | --- | --- |
| Pack | 20–120 lessons | 20 is a thorough beginner subject; 100+ is zero-to-hero |
| Track | 1–4 courses | Named for what the learner can do at the end of it |
| Course | 6–16 lessons | Ends in a **transfer**; may own a **creation** |
| Module | 3–6 lessons | More than 6 means you found two ideas, not one |
| Lesson | 10–25 minutes | 30+ means split it |

Course 0 of the first track is always **placement** (see [§7](#7-the-placement-battery)).

**Names are promises.** "Values you can see", "Errors you can recover from", "How Python actually
runs it" tell the learner what changes for them. "Chapter 4", "Intermediate topics", and
"Miscellaneous" tell them nothing and are rejected.

## 4. The path laws

The order is the curriculum. These hold in every subject.

1. **Nothing appears before the thing it is made of.** No comprehension before a loop, no class
   before a function, no parallel circuit before a closed loop, no chord before an interval.
2. **Eager before lazy, concrete before abstract, one before many.** Teach the list before the
   generator, the single lamp before the network, the worked case before the rule.
3. **Recovery before risk.** Error handling comes before anything that writes to disk. Fuses come
   before shorts. Teach the seatbelt before the motorway.
4. **The dense theory course goes late.** Internals, edge cases, and the language-lawyer material
   land after the learner has built real things — never as course 2 because it is "foundational".
5. **Every course ends in transfer.** A `transfer-*` lesson that applies the course's ideas to a
   **new cover story**, marked `mastery: { requiresTransfer: true }`.
6. **The last lesson of the pack is a capstone**, and it is a creation step.
7. **Ideas that follow each other must be adjacent.** Do not scatter the three module-system lessons
   across three tracks.

Write the whole path down **before** authoring any lesson, in one structure file, and copy it
independently into the locked-path test ([§10](#10-verification-gates)). If someone edits the path
and the test still passes, the path was not locked.

## 5. The skill and misconception graphs

**Skills** are what progress, mastery, and the practice queue hang off.

- One id per teachable capability: `python.collections.dict`, `circuits.ohms`, `music.interval`.
- `prereqIds` must form a DAG that agrees with the path order.
- Every skill is taught by at least one lesson; every lesson names 1–3 skills.
- Roughly one skill per module. A skill per lesson is too fine to be useful.

**Misconceptions** are the course's diagnostic value, and the hardest part to fake.

- Budget about **one per five lessons**.
- Each is a *wrong belief a real learner holds*, phrased as the belief: "Expects a default list
  argument to be new each call", "Thinks current is used up by the lamp". Not "got question 3 wrong".
- Each must be reachable from a **wrong choice** (`misconceptionId` on that choice) and must name a
  `followUpLessonId` that teaches the fix. Both directions are test-enforced; a misconception nobody
  can trigger is dead weight, and one with no follow-up is an accusation.
- **If two misconceptions fit the same wrong answer, you have not designed the question.** Split it,
  or ask a diagnostic item instead of guessing.

## 6. Lesson anatomy

Every lesson is: **teach one idea → ask about it → make them do it**.

| Block | Rule |
| --- | --- |
| `explain` | Exactly one, required. First by default; last in the play-first shape. The contract is in [§8](#8-the-explain-contract) |
| retrieval | At least one `check` or `predict` block. Two or three is the norm, four is the ceiling |
| task | One `code` / `debug` / `activity` block, unless the lesson is genuinely discussion-only |
| `reflect` | Optional, ungraded, "say it in your own words" |

A lesson that both teaches and has a task opens as **Learn**, then **Try** (D57) — Studio infers this
from the blocks, there is no field to set. Write the explain knowing the learner reads it *before*
they see the editor, and write the task prompt knowing it appears *without* the theory beside it.

Three shapes cover almost everything:

- **Teach + ask + do** — the default.
- **Play-first** — predict, then a `world-v1` experiment, then the explain as a **debrief** of what
  they just saw. Use this when the surprise is the lesson. The debrief is not optional: an experiment
  with no explanation afterwards leaves the learner with an anecdote instead of an idea.
- **Check-only** — explain plus questions, no task. Legitimate when the sandbox genuinely cannot run
  the thing (virtual environments with no network, threads that cannot be demonstrated). Not
  legitimate because the task was hard to write. If you use it, the diagrams and check variety must
  do more work, not less.

**`debug` lessons must actually be broken.** A debug starter that already passes is a test failure,
not a lenient lesson.

## 7. The placement battery

`<subject>-placement`, the first lesson of the pack.

- 8–15 items sampling the **whole** skill graph, including things taught at the very end.
- Every item is `diagnostic: true`: attempting it completes it, a wrong answer never blocks Next, the
  wrong answer is restored on revisit, and the review reveals the right answer.
- Every item carries an `explainMd` that **teaches** — this is the one place a learner is told the
  answer they missed, so it must be worth being told (test-enforced, 80+ characters).
- No task block, no grid.
- Prefer items where the reasonable guess is wrong. You are measuring, not congratulating.
- The battery is the one lesson exempt from the worked-example rule in [§8](#8-the-explain-contract):
  it is measuring what the learner already knows, so it has nothing to show them yet.

## 8. The explain contract

Four movements, in order, in one markdown block:

1. **The named idea.** Give it a heading and say what it *is*, in the learner's language.
2. **Why it bites.** The failure this causes when you get it wrong. Concrete, not "this is
   important". This is the movement people skip and it is the one that makes the lesson stick.
3. **A worked example.** A language-tagged fence for code (` ```python `, ` ```javascript `,
   ` ```text `) or a diagram for everything else (`![alt](assets/name.svg)`). At least one, always.
   It shows the idea; it is **not** the answer to the exercise.
4. **The common mistake, then the handoff.** Name the trap, then say what the exercise asks.

Bars:

| Measure | Bar |
| --- | --- |
| Prose outside the fence | 110–350 words. Under 90 fails the build |
| Worked examples | At least one. One fence for a code lesson; a visual subject may need several diagrams, and should use them |
| Fence language tag | Required. An untagged fence renders unhighlighted |
| Answer leakage | Zero. The explain may show the *idea*, never the exercise's solution |

A fenced block renders as a labelled, syntax-highlighted snippet in the editor palette; inline
`` `code `` stays in the sentence. Leftover backticks around loose lines are a bug, not a style.

**For non-code subjects the diagram is not decoration, it is the worked example.** A circuits lesson
with three paragraphs and no picture has failed this section. Original artwork only, in the pack's
`assets/`, and a lesson folder copy overrides the pack copy (D58).

**A graded picture must not name its own answer.** Label freely in teaching diagrams; ship an
unlabelled `*-quiz.svg` variant for anything a question grades. A hotspot diagram captioned "Lamp
on" is a giveaway, not a question.

## 9. Asking, doing, and helping

### Choosing a check kind

There are 27 (`CHECK_KINDS` in `src/shared/check.ts`). Pick the one that matches the *thinking*, not
the one that is easy to author.

| The learner must… | Kind |
| --- | --- |
| choose between confusable options | `mcq`, `odd` |
| commit to an outcome before seeing it | `predict` |
| recall rather than recognise | `short`, `cloze`, `numeric` |
| show they know a structure | `order`, `match`, `bins`, `table` |
| point at a thing in a picture | `hotspot`, `place`, `gorder`, `image` |
| show a quantity or a feel for scale | `slider`, `numberline` |
| justify, not just answer | `tier` |

A course that is 80% `mcq` is a quiz, not a course. Vary the kind across a module. Never add a check
kind for a single lesson: a new kind needs a grader case, Author UI, **and** a lesson in
`lawp.learning.questions`.

### Review copy

Every `check` and `predict` needs `explainMd` of 100+ characters that says **why**, not which. "That
is right" teaches nothing. "`/` is true division and always hands back a float, even when it divides
evenly — the operator that keeps a whole number is `//`" teaches. Wrong choices that represent a real
belief carry a `misconceptionId`.

### The task contract

| Piece | Rule |
| --- | --- |
| Starter | Runs cleanly (exit 0) and **fails** the check. Never already-passing, never a crash the learner did not write |
| Goal | Visible and false at the start. A goal already true when the lesson opens is a test failure |
| Hidden test | Every code task gets one. It is a **contract**, not a trick: it checks what the prompt asked for |
| Grading | The returned value or the world state, never the printed text, unless the printing *is* the skill |
| Determinism | No wall clock, no unseeded randomness, no network, no interactive input |

### The hint ladder

Four or five rungs, contiguous, always ending in `assist`:

1. **Orient** — which idea, where to look (free)
2. **Rule** — the rule in one paragraph (free)
3. **A different example** — not the exercise (free)
4. **Assist** — the answer. Marks the attempt, withholds independent mastery

Where the assist rung is machine-checkable, make it the **complete working file**, so the test suite
can paste it in and prove the lesson is solvable. Never jump to the answer on the first click, and
never let hint 1 give away hint 4.

## 10. Verification gates

Run these. A course is not done because it reads well.

| Gate | What it proves |
| --- | --- |
| Schema parse of every lesson | The cartridge is loadable |
| Locked path test | Courses, modules, and tracks list exactly the intended ids, in order |
| Path-law assertions | The orderings in [§4](#4-the-path-laws) actually hold |
| Graph integrity | Every skill prereq exists; every misconception is used and has a follow-up; every creation has its steps |
| File references | Every `files[]` entry and every `assets/` image exists on disk |
| Explain quality | Tagged fence present, prose over the word floor |
| Review copy | Every check has real `explainMd`; every diagnostic has one over 80 characters |
| Hint ladders | Contiguous levels, assist present |
| **Assists solve** | Every official answer, run through the real runtime, passes |
| **Starters fail** | Every starter fails its check while still exiting cleanly |
| **Goals start open** | No play or activity lesson opens with its objective already met |
| Library cards | Every lesson has card copy, an icon from the closed union, and 1–4 tags |

**`tests/course-spec.test.ts` already holds the subject-agnostic bars against every bundled pack**,
so a new pack inherits them the moment it lands in `resources/packs`: an explain and a retrieval
block in every lesson, a worked example in every explain, a hidden test and a full hint ladder on
every code task, a declared-and-followed-up misconception graph, and `requiresTransfer` on every
transfer and capstone. Review-copy depth is a **ratchet** in that file — the pre-spec debt per pack
may only fall, and a new pack starts at zero.

The per-subject gates sit beside it: `tests/py-curriculum.test.ts` and `tests/py-lessons.test.ts`,
`tests/js-curriculum.test.ts` and `tests/js-lessons-from-59.test.ts`, and
`tests/circuits-curriculum.test.ts`. Copy the pattern for a new subject rather than inventing one.

The last three gates are the ones that catch real damage, and they only work if the tests **execute**
the lessons. A static check cannot tell you the official answer is wrong.

## 11. Generating a pack at scale

For anything over about 30 lessons, generate the pack rather than hand-writing JSON.

```
scripts/<subject>-curriculum/
  structure.mjs   the locked path, skills, misconceptions, creations — one source of truth
  write-pack.mjs  emits pack.json, tracks/, courses/, skills.json, misconceptions.json, creations/
  lib.mjs         block builders shared by every track file
  <track>.mjs     one file per track, exporting one lessonsX() function
  README.md       the contract authors of this pack follow
scripts/author-<subject>.mjs   wipes lessons/ and rewrites everything
```

Why this shape: the path cannot drift from the manifests because both come from `structure.mjs`; a
renamed lesson cannot leave a stale folder behind because the author script wipes first; and parallel
authors cannot collide because each owns one track file and nobody edits `lib.mjs`.

Give the author script a `--partial` mode that warns about unwritten ids instead of failing, so work
in progress stays runnable.

**When several agents author in parallel**, assign one file per agent, forbid edits to shared files
(the lib, the structure, the tests, the card catalog), and require each agent to run the execution
gates and confirm no failure names one of *its* ids before reporting done.

## 12. Making it feel like play

Gamified does not mean confetti. It means the loop feels like a game, because a good game and a good
lesson are the same shape: a clear goal, a fast cycle, a legible consequence, and a capability that
visibly grows.

**A visible goal.** The learner can see what winning looks like before they act — objectives listed,
the beacon on the grid, the lamp that must light. Never "do the thing and we will tell you".

**A fast cycle.** Run is free and instant and never grades. Failure costs nothing but a rerun. The
learner should be able to try, be wrong, and understand why inside fifteen seconds.

**A legible consequence.** The world changes where they can see it. The lamp brightens, the fox
moves, the list fills. A number in a console is the weakest possible feedback — use it when the
subject *is* text, otherwise show the thing.

**Predict before acting.** Ask for a commitment, then show reality. The gap between the two is where
the memory forms, and it is the single cheapest way to make a lesson feel like a game rather than a
reading.

**Escalating capability.** Every session ends with something the learner could not do before. If a
lesson adds no new power, it is a drill, and drills belong in the practice queue.

**A creation thread.** One or two artefacts the learner builds across a track and keeps — a circuit,
a greeting bot, a log scrubber, a field station. Each step adds a visible capability, and it exports
as real files they own (D54). This is what makes a course feel like it went somewhere.

**Transfer as the boss fight.** The end of a course is the same ideas in a story they have never
seen. It should feel like a test of what they *understand*, not what they memorised.

**Honest rewards.** XP for a first independent pass and for mastery; tiny and daily-capped for
repeats; zero for opening the app or for taking a concept hint. No login chests, no pay-to-skip, no
leaderboards. A reward the learner knows they did not earn devalues the ones they did.

**Restart without shame.** Retry is a pedagogical tool. Restart restores the starter and **keeps the
history**, so the next run can show it went better. Never threaten the learner with losing progress
for trying again.

## 13. Voice

Write like a good colleague explaining something at a whiteboard: plain, concrete, specific, never
condescending and never chummy.

| Do | Instead of |
| --- | --- |
| "Charge can go out of the battery and back. That path is the loop." | "Let's dive into the exciting world of circuits!" |
| "Lamp brightness stayed dim; current is already at the cap." | "Incorrect." |
| "A single `=` binds a name. Use `==` to compare." | "Syntax error." |
| "Three east calls and two south calls. Order does not matter." | "Just move the fox to the beacon." |

Banned: emoji in lesson copy, exclamation-mark enthusiasm, "simply" and "just" and "obviously",
second-person scolding, marketing adjectives about the course itself, and any cover story borrowed
from another product. Time estimates are honest ranges. Difficulty is never hidden to be encouraging.

## 14. Definition of done

A course ships when all of these are true:

- [ ] The subject brief is written, and every lesson serves its definition of done
- [ ] The path is locked in a structure file **and** independently in a test
- [ ] Every path law in [§4](#4-the-path-laws) holds, asserted
- [ ] Skill DAG and misconception graph are complete, used, and followed up
- [ ] Placement battery: 8–15 diagnostic items, all with teaching review copy
- [ ] Every lesson teaches, asks, and — unless genuinely discussion-only — makes them do
- [ ] Every explain has a worked example and clears the word floor, with no answer leakage
- [ ] Graded diagrams do not name their own answers
- [ ] Every task has a hidden test, a failing starter, an open goal, and a full hint ladder
- [ ] Every official answer passes through the **real** runtime; every starter fails while running cleanly
- [ ] Each course ends in a transfer; the pack ends in a capstone; the creation thread exports
- [ ] Library cards exist for every lesson, with an icon and 1–4 tags
- [ ] Every content rule above is enforced by a test, not by this checklist
- [ ] [CURRICULA.md](CURRICULA.md), [STATUS.md](STATUS.md), and [CHANGELOG.md](../CHANGELOG.md) updated; anything newly locked is in [DECISIONS.md](DECISIONS.md)

If a rule in this document is worth following, it is worth a test. A checklist item nobody can
execute will be false within a month.
