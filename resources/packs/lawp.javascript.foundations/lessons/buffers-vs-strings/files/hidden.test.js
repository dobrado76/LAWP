const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.bytesOf('café'), 5)
assert.strictEqual(m.bytesOf('a'), 1)

