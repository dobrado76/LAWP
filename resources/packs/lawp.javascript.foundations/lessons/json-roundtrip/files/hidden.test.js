const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.readName('{ "name": "north", "kind": "beacon" }'), 'north')
assert.strictEqual(m.readName('{"name":"west"}'), 'west')
assert.throws(() => m.readName('{'), 'broken JSON must throw, not return undefined')

