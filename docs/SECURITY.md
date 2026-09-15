# Security

Local learning app. Threats: **malicious packs**, **learner code**, **XSS via Markdown/JSX**.

## Process

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` on the BrowserWindow
- Preload: minimal API
- `navigation` / `window.open` denied except allowlisted about/blank iframe srcdocs if used
- No `file://` for pack HTML; use a custom protocol e.g. `lawp-pack://` **allowlisted** to pack roots and userData workspaces, or `srcdoc` + CSP

## Packs / zips

- Validate with Zod; reject extra huge files
- Zip extract: reject `..`, absolute paths, symlinks; cap entry count, uncompressed size, and ratio (`zip-unsafe` / `zip-invalid`)
- Extract to temp, validate, then move — never unzip on top of a live cartridge
- Markdown → sanitize (DOMPurify in renderer is not enough for `javascript:` if you use `dangerouslySetInnerHTML` — prefer a Markdown pipeline that emits safe elements)
- Images / video only from that lesson’s (or pack’s) `assets/` via custom protocol
- Do not execute pack JSON as code

## Runners (Python / Node)

- `shell: false`
- Absolute binary
- Fresh temp cwd per run under `userData/sandboxes/<uuid>/` (delete after)
- Env: strip unexpected vars; set `PYTHONSAFEPATH`, `PYTHONDONTWRITEBYTECODE=1`, `NO_COLOR=1`
- Timeout + max stdout (e.g. 1 MiB)
- Windows: Job Object to kill the tree if possible
- Block obvious path escapes in Python lessons at **policy** level: tests run with cwd = sandbox; document that a determined user can still use their own Python to touch the machine (**honest local-app warning** in Settings)
- v1: no network for Python/JS tests (`NO_PROXY`, and for Node `fetch` stubbed; consider Windows Firewall is out of scope)
- Never run as admin

## React preview

- iframe `sandbox="allow-scripts"` **without** `allow-same-origin` if using srcdoc; or isolated origin
- CSP: no `unsafe-eval` if the transform happens in main (preferred)
- Do not inject learner code into the Electron renderer

## Secrets

- No analytics
- Future API keys: `safeStorage` only
- Settings export strips keys and window geometry

## Path rules

- IPC paths are lesson-relative
- Main `path.resolve` + `relative` must stay inside the **lesson folder**, pack root, learner workspace, or sandbox root (`..` rejected)
