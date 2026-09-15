# Agent notes

This workspace is **LAWP**, a standalone product.

Locked behavior: [docs/DECISIONS.md](docs/DECISIONS.md). What is in the build: [docs/STATUS.md](docs/STATUS.md). Build/tsconfig: [docs/BUILD.md](docs/BUILD.md).

Keep [CHANGELOG.md](CHANGELOG.md) current with every notable change. `npm run dist` bumps **PATCH** automatically; use `npm run dist:nobump` to rebuild the same version. On a **MINOR** bump (`package.json` `MAJOR.MINOR.PATCH`), rewrite the current section of [RELEASE_NOTES.md](RELEASE_NOTES.md) with everything since the last minor — the app shows that file once after the bump.

Do not look for a parent repo. Do not add git remotes unless the user asks.
