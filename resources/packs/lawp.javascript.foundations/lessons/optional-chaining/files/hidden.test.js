const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.beaconName({ beacon: { name: 'north' } }), 'north')
assert.strictEqual(m.beaconName({}), 'unknown')
assert.strictEqual(m.beaconName(null), 'unknown')
assert.strictEqual(m.beaconName(undefined), 'unknown')
assert.strictEqual(m.beaconName({ beacon: { name: '' } }), '')

