const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.noteOf(m.route), 'keep')
assert.ok(m.notes instanceof WeakMap)

