# Build, profile, icons, TypeScript

## Scripts (target)

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "dist": "electron-vite build && electron-builder --win --config electron-builder.yml --publish never",
    "typecheck": "tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json",
    "test": "vitest run"
  }
}
```

Put installers and unpackaged output in **`release/`** (gitignored). `npm run dist` must not require a different settings folder than `npm run dev`.

## Shared AppData (required)

Unpackaged Electron defaults `userData` to `%APPDATA%\Electron`. Installed apps use the product name. **That split is a bug for this project.**

In `src/main/index.ts`, **before** anything else that touches disk:

```ts
import { configureUserData } from './userData'
configureUserData()
```

`configureUserData`:

1. If `process.env.LAWP_USER_DATA` set → `path.resolve` that
2. Else if `process.env.LAWP_ISOLATED_USER_DATA === '1'` → `path.join(process.cwd(), '.dev-user-data')`
3. Else `path.join(app.getPath('appData'), 'LAWP')`
4. `mkdirSync` recursive
5. `app.setPath('userData', resolved)`

`electron-builder.yml`:

- `productName: LAWP`
- `appId: com.lawp.app` (stable; do not change casually)
- `directories.output: release`
- `win.icon: build/icon.ico`

Settings → About must show the resolved `userData` path so you can confirm dev and dist match.

## Window state

See [ARCHITECTURE.md](ARCHITECTURE.md). File: `userData/window-state.json`.

## Icon

Source art: `build/icon.png` (1024-class square, no wordmark).

On scaffold:

1. Keep `build/icon.png` as the master
2. `npm run icons` (sharp or `@electron/packager` icon-gen) → `build/icon.ico` (256/128/64/48/32/16)
3. `BrowserWindow({ icon: path.join(…, 'build/icon.ico') })` in dev; in production `nativeImage` from extraResources or electron-builder’s bundled icon
4. `package.json` `"build": { "icon": "build/icon.ico" }` / yml as above

Do not leave the default Electron icon on the taskbar.

## TypeScript — keep `tsconfig.node.json` / `tsconfig.web.json` off the red tree

Cursor/VS Code lists every `tsconfig*.json` as a project. Red badges appear when:

1. `"extends": "@electron-toolkit/tsconfig/..."` and the package is **not installed**
2. `"types": ["node"]` without `@types/node`
3. `"include"` globs match **zero** files (`composite` projects)
4. Project references without `"files": []` on the root

**Rules for this repo:**

- Root `tsconfig.json` is **only** `{ "files": [], "references": [ { "path": "./tsconfig.node.json" }, { "path": "./tsconfig.web.json" } ] }`
- **Do not `extends` any npm package.** Inline `compilerOptions`.
- Until `npm install`, use `"types": []` or omit `types` (do **not** require `@types/node` in the JSON or the file shows as error on a spec-only open)
- After scaffold + install, you may set `"types": ["node"]` on the **node** config only
- `skipLibCheck`: true
- `include` must list files that **exist** (stubs shipped in this bootstrap)
- `noEmit`: true for day-to-day IDE (emit is electron-vite’s job). If you use `composite: true` for references, set `outDir` under `out/types-node` and `out/types-web` (gitignored) so TS can emit `.d.ts` when `tsc -b` runs — or skip composite and drop `references` if the IDE still complains. **Preferred v1:** composite + outDir + existing stubs.
- Do not add a fourth `tsconfig.eslint.json` unless include is valid

This bootstrap already contains the three JSON files plus stub `.ts` so opening the folder **before** implementation does not mark those configs as broken.

## electron.vite.config.ts

Three inputs: main `src/main/index.ts`, preload `src/preload/index.ts`, renderer `src/renderer/index.html`.

Aliases: `@shared`, `@renderer` matching tsconfig `paths`.

## Node / Electron versions

Pin Electron to a current stable at scaffold time; Node types aligned with Electron’s Node. `engines` field optional.

## Tests

Vitest for Zod schemas, pack loader, hint accounting, path sandbox (`isInside(root, candidate)`). Runner tests can spawn Python if present; skip with a clear message if missing.
