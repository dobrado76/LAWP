import assert from 'node:assert'
import { walkLength } from './walker.mjs'
assert.strictEqual(walkLength(['a', 'b', 'c']), 3)
