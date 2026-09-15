import assert from 'node:assert'
import { walk } from './walk.mjs'
import { scrubLog } from './scrub.mjs'
assert.deepStrictEqual(walk(['east', 'south']), { x: 1, y: 1 })
assert.strictEqual(scrubLog('b\na\nb\n'), 'a\nb')
assert.deepStrictEqual(walk([]), { x: 0, y: 0 })
