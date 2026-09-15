# LAWP — Learn Anything While Playing

Standalone Windows desktop LMS (Learning Management System). **Electron + React.** Offline-first. No subscription. No dependency on any other project.

This folder is a **specification bootstrap**. Open it as its own Cursor workspace and implement from the docs here. Do not import, copy, or link another codebase.

## Read this first

| File | Purpose |
| --- | --- |
| [docs/START_HERE.md](docs/START_HERE.md) | Vibe-coding entry: what to build, in what order |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Product, screens, non-goals |
| [docs/CODEFINITY_BLUEPRINT.md](docs/CODEFINITY_BLUEPRINT.md) | What Codefinity does; what LAWP keeps, drops, and beats |
| [docs/PEDAGOGY.md](docs/PEDAGOGY.md) | How learning actually happens (play + mastery) |
| [docs/CONTENT_MODEL.md](docs/CONTENT_MODEL.md) | JSON cartridges: folder-per-lesson, zip install/export, learner progress |
| [docs/CURRICULA.md](docs/CURRICULA.md) | Demo tracks: Python, JavaScript, React |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Process model, folders, settings, window restore |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Locked decisions (D1–) |
| [docs/IPC_CONTRACT.md](docs/IPC_CONTRACT.md) | Typed IPC |
| [docs/UI_DESIGN.md](docs/UI_DESIGN.md) | Shell, lesson studio, play HUD |
| [docs/SECURITY.md](docs/SECURITY.md) | Sandboxes, path rules |
| [docs/BUILD.md](docs/BUILD.md) | `npm run dev` / `npm run dist`, shared AppData, icons, tsconfig |
| [docs/plans/IMPLEMENTATION.md](docs/plans/IMPLEMENTATION.md) | Phased build |

## Intent

Codefinity-class **interactive lessons and exercises**, but:

- **Learn anything** (generalized LMS), not a coding-only catalog behind a paywall
- **Play** is the loop (quests, runs, feedback), not a marketing wrapper
- **Understanding** over “submit until green”
- Three shipped demonstrations: **Python**, **JavaScript**, **React**

## Commands (after you scaffold — see BUILD.md)

```bash
npm install
npm run dev
npm run dist
```

Dev and installed builds **must** share `%APPDATA%\LAWP`.
