const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.gate(0), 'shut')
assert.strictEqual(m.gate(''), 'shut')
assert.strictEqual(m.gate('0'), 'open')
assert.strictEqual(m.gate([]), 'open')
assert.strictEqual(m.gate(1), 'open')

