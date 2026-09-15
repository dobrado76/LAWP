const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.tagBeacon('east'), 'beacon:east')
assert.strictEqual(m.tagBeacon('north'), 'beacon:north')

