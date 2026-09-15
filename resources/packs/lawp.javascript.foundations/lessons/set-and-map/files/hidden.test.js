const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.unique(['east', 'east', 'south']), 'east-south')
assert.strictEqual(m.unique(['west']), 'west')
assert.strictEqual(m.unique(['south', 'south', 'south']), 'south')

