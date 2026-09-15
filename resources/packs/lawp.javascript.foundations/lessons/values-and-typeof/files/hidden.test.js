const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.kindOf(3), 'number')
assert.strictEqual(m.kindOf('3'), 'string')

