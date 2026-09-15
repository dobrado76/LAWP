const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.logBeacon('west'), 'beacon:west')
assert.strictEqual(m.logBeacon('south'), 'beacon:south')

