const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.label(''), 'anon')
assert.strictEqual(m.label('east'), 'east')
assert.strictEqual(m.label(0), 'anon')

