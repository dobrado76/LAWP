# Security

Local learning app. Threats: **malicious packs**, **learner code**, **XSS via Markdown/JSX**.

**Honesty:** a temp cwd, a cleaned environment, `NO_PROXY`, and a stubbed `fetch` do **not** isolate executable code. `NO_PROXY` is about proxy bypass, not “no network.” Node’s permission model and CPython do not make imported packs safe. Do not document those knobs as a security boundary.

## Process

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` on the BrowserWindow
- Preload: minimal API
- `navigation` / `window.open` denied except allowlisted about/blank iframe srcdocs if used
- No `file://` for pack HTML; use a custom protocol e.g. `lawp-pack://` **allowlisted** to pack roots and userData workspaces, or `srcdoc` + CSP

## Packs / zips

- Validate with Zod; reject extra huge files
- Zip extract: reject `..`, absolute paths, symlinks; cap entry count, uncompressed size, and ratio
- Extract to temp, validate, then move — never unzip on top of a live cartridge
- Markdown → sanitize (safe element pipeline)
- Images / video only from that lesson’s (or pack’s) `assets/` via custom protocol
- Do not execute pack JSON as code. **`world-v1` is data:** parts, actions, `when`/`set` rules. No `eval`, no pack-supplied functions.

## Execution trust (required before spawn)

`pack.json` declares `capabilities.execute`: `none` | `python` | `javascript` | `react`.

| Pack | Spawn? |
| --- | --- |
| `execute: "none"` / only `world-v1`, checks, explain | **Never** |
| Bundled demo code packs | Yes, after the same Job Object / timeout policy |
| **Imported** zip with a code capability | **No** until the learner **trusts that pack** (Settings / install dialog). Default deny. Untrusted = Studio can still show explain/check/activity; Run/Check that would spawn returns `sandbox` with remediation “enable execution for this pack” |

Settings: honest warning — trusting a pack lets it run **their** Python/Node on **this** machine. This is not a VM.

v1 `capabilities.network` is always `false`. Do not claim the OS has disabled networking.

## Runners (Python / Node) — when execution is allowed

These are **containment knobs**, not a guarantee against a determined malicious pack:

- `shell: false`; absolute binary; no inherited extra handles if practical
- Fresh temp cwd per run under `userData/sandboxes/<runId>/` (delete after)
- Env **allowlist only** (e.g. `PATH` to the interpreter, `PYTHONSAFEPATH`, `PYTHONDONTWRITEBYTECODE=1`, `NO_COLOR=1`, `PYTHONIOENCODING=utf-8`). Do not pass the user’s full environment
- Timeout + max stdout (e.g. 1 MiB)
- Windows **Job Object** to kill the process tree
- Lesson files only; path escapes rejected
- Never run as admin
- Never `eval` learner or pack code in the renderer or in main’s own context

Do **not** list `NO_PROXY` or “stub fetch” as network isolation. A stub in the harness is a **lesson convenience** (mock `fetch` for JS Course 5), not a sandbox.

If a future version adds a real network block (OS job / firewall / separate restricted user), document it as such. Until then, imported executable packs are a **trust decision**.

## React preview

- iframe `sandbox="allow-scripts"` **without** `allow-same-origin` if using srcdoc; or isolated origin
- CSP: no `unsafe-eval` if the transform happens in main (preferred)
- Do not inject learner code into the Electron renderer

## Secrets

- No analytics
- Author/tutor API keys: `safeStorage` only
- Settings / setup export strips keys (unless opt-in) and window geometry. Setup bundles must not include `learners/` or snapshots
- AI draft must not upload arbitrary pack trees; send only the author-selected brief + objectives

## Path rules

- IPC paths are lesson-relative
- Main `path.resolve` + `relative` must stay inside the **lesson folder**, pack root, learner workspace/creation/snapshot, or sandbox root (`..` rejected)

## Run identity

A run records `runId` + `learnerId` at **start**. Results and snapshots write only to that learner, even if the UI switches profiles before the process exits.
