const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.step('east'), 'east')
assert.throws(() => m.step('up'))

