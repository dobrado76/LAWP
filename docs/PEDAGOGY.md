# Pedagogy

LAWP teaches through **playable practice with mastery evidence**. Fun is a consequence of clear goals, fast cycles, and visible skill — not of slot-machine rewards.

## Learning science to implement (practical, not academic cosplay)

| Idea | In product |
| --- | --- |
| Retrieval | Frequent `check` / `predict` / `code` without looking at the answer |
| Worked example → faded example → independent | Starter code shrinks across a module |
| Interleaving | Practice queue mixes nearby skills, not 40 identical `for` loops |
| Transfer | Second task with new cover story after a pass |
| Metacognition | Confidence prompt after submit; overconfidence → extra review |
| Spaced repetition | Review items from misses and aging mastered skills |
| Productive failure | Run is free; check after a genuine attempt; hints cost a small XP tax |
| Dual coding | Diagram + short text in `explain`; avoid walls of prose |

## Mastery, not completion

A lesson may be **checked** (tests green once) and later **mastered** (checked + transfer variant or mixed quiz + no hint on the last attempt, configurable per lesson).

Track “complete” requires mastery on required lessons. Optional side-quests exist.

## Hint ladder (required for `code` and hard `check`)

1. **Orient** — which skill, what to look at  
2. **Concept** — the rule in one paragraph  
3. **Example** — a *different* tiny example  
4. **Scaffold** — almost-answer (partial code / eliminated MCQ options)  
5. **Solution** — full reveal, marks the attempt as `revealed` (still can retry later for mastery)

Never jump to 5 on first click.

## Play grammar

Map Codefinity-style “ninja on a grid” to a **general** pattern:

- The learner issues actions (code, answers, moves)
- The world has visible state
- Win conditions are **properties** (“all sushi in inventory”, “component shows the filtered list”)
- Failure is visible state, then a concept pointer

Quest map on Home: nodes are lessons; edges are prerequisites (soft by default).

### XP (anti-farm)

| Event | XP |
| --- | --- |
| First check pass, no solution reveal | medium |
| Mastery pass | high |
| Review success | small–medium |
| Repeat same lesson | tiny, daily cap |
| Hint level 4–5 | XP tax |
| Opened the app | zero |

Streak: at least one **check or review success** that calendar day (local timezone).

## Diagnostics

At course entry (skippable): 8–15 items sampling the course skill graph. Results:

- **Skip** chapters whose skills are all green
- **Compress** (one mixed drill instead of five nuggets)
- **Start from zero**

Fast-track setting: more diagnostics, fewer worked examples.

## Feedback copy rules

- Quote the failing property (“Expected a list of unique names, got duplicates”)
- Name the skill id
- Offer the next hint level
- Never only `AssertionError`

## Restart without shame

Restart is pedagogical, not a punish. A learner (or a sibling on the same PC) can redo an exercise, chapter, or lesson. The cartridge does not change; only that learner’s folder does. **Default restart keeps every previous run** so the next check can show whether this time was better (score, time, hints). Do not scare them with “you will lose XP.” Confirm once, restore starters, leave the log.

Clearing or overwriting history is a separate choice for when they want a clean slate — not the path for “I want to try again.”

## Accessibility of difficulty

- Strict campaign (optional): cannot mark track complete without mastery; can still browse ahead
- Default: browse ahead, practice queue nags gaps
- Time estimates are honest ranges, not guilt

## What not to copy from edutainment

- Endless daily login chests
- Pay-to-skip
- Leaderboards in v1 (optional later, local-only)
- AI that pastes the solution
