# Agent notes

This workspace is **LAWP**, a standalone product.

Locked behavior: [docs/DECISIONS.md](docs/DECISIONS.md). What is in the build: [docs/STATUS.md](docs/STATUS.md). Build/tsconfig: [docs/BUILD.md](docs/BUILD.md).

**Generating a course for any subject: [docs/COURSE_SPEC.md](docs/COURSE_SPEC.md).** That is the contract — path laws, lesson anatomy, the explain and task bars, the gamified loop, and the verification gates you must actually run. Do not author a pack from intuition.

How humans make lessons: [docs/AUTHORING.md](docs/AUTHORING.md). Check kinds: `src/shared/check.ts` (`CHECK_KINDS`). Adding a kind needs a grader case, Studio + Author UI, and a lesson in `lawp.learning.questions`.

Keep [CHANGELOG.md](CHANGELOG.md) current with every notable change. `npm run dist` bumps **PATCH** automatically; use `npm run dist:nobump` to rebuild the same version. On a **MINOR** bump (`package.json` `MAJOR.MINOR.PATCH`), rewrite the current section of [RELEASE_NOTES.md](RELEASE_NOTES.md) with everything since the last minor — the app shows that file once after the bump.

Do not look for a parent repo. Do not add git remotes unless the user asks.
