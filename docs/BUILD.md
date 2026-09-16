# Build, profile, icons, TypeScript

## Scripts

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "dist": "node scripts/bump-patch.mjs && electron-vite build && electron-builder …",
    "dist:nobump": "electron-vite build && electron-builder …",
    "typecheck": "tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json",
    "test": "vitest run"
  }
}
```

App version is `package.json` `version` (`MAJOR.MINOR.PATCH`). `npm run dist` **increments PATCH** (and the matching `package-lock.json` root fields) then builds. `npm run dist:nobump` builds without changing the version. Bump **MINOR** yourself for user-visible capability and rewrite [RELEASE_NOTES.md](../RELEASE_NOTES.md); the app shows that file once. `electron-builder` artifacts use `${version}`.

Put installers and unpackaged output in **`release/`** (gitignored). `npm run dist` **must** use the same `%APPDATA%\LAWP` as `npm run dev`. The installer must **not** write into AppData, seed or overwrite `packs/`, or reset `settings.json`.

## GitHub Release (tags only)

[`.github/workflows/build-windows.yml`](../.github/workflows/build-windows.yml) runs on `v*` tags (and optional `workflow_dispatch` for check-only). It typechecks, tests, then `npm run dist:nobump` and attaches `release/LAWP-*.exe` to the GitHub Release. It does **not** upload workflow artifacts. Push a tag that matches `package.json` (for example `v0.3.0`).

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
- Demo cartridges as **`extraResources`** (or `files`) under the **app install directory** (`resources/packs`), never as a target under `%APPDATA%`
- NSIS: **do not** delete AppData on uninstall by default (`deleteAppDataOnUninstall: false`). No installer custom script that copies packs into AppData
- `npm run dist` replaces binaries under Program Files (or the chosen install dir). It is not a content migration

Settings → About must show the resolved `userData` path so you can confirm **dev and the installed exe print the same path**.

### Installer vs library (D37)

| Location | Role | On `npm run dist` / upgrade |
| --- | --- | --- |
| App `resources/packs/` | Optional bundled demos, read-only | May change with the app version |
| `%APPDATA%\LAWP\packs\` | User-installed / authored cartridges | **Untouched** |
| `%APPDATA%\LAWP\settings.json` | Prefs | **Untouched** |
| `%APPDATA%\LAWP\learners\` | Progress | **Untouched** |

The Library is the **resolved** catalog (D37: overlay vs full pack), not a raw union and not “user always wins.” Never freeze a pack id list into the renderer bundle.

## Window state

See [ARCHITECTURE.md](ARCHITECTURE.md). File: `userData/window-state.json`.

## Icon

Source art: `build/icon.png` (1024-class square, no wordmark).

Icon pipeline:

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
- Do **not** set `baseUrl` (deprecated in TypeScript 6; `paths` work without it). This is what turns those two files red in the explorer.
- Until `npm install`, use `"types": []` or omit `types` (do **not** require `@types/node` in the JSON or the file shows as error on a cold open)
- After install, `"types": ["node"]` on the **node** config only
- `skipLibCheck`: true
- `include` must list files that **exist**
- `noEmit`: true for day-to-day IDE (emit is electron-vite’s job). If you use `composite: true` for references, set `outDir` under `out/types-node` and `out/types-web` (gitignored) so TS can emit `.d.ts` when `tsc -b` runs — or skip composite and drop `references` if the IDE still complains. **Preferred v1:** composite + outDir + existing stubs.
- Do not add a fourth `tsconfig.eslint.json` unless include is valid

The three JSON files plus stub `.ts` stay valid in the IDE before `npm install`.

## electron.vite.config.ts

Three inputs: main `src/main/index.ts`, preload `src/preload/index.ts`, renderer `src/renderer/index.html`.

Aliases: `@shared`, `@renderer` matching tsconfig `paths`.

## Node / Electron versions

Electron is pinned in `package.json`. Node types match Electron’s Node. `engines` is optional.

## Tests

Vitest for Zod schemas, pack loader, hint accounting, path sandbox (`isInside(root, candidate)`). Runner tests can spawn Python if present; skip with a clear message if missing.
