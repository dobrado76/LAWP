const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.walkLength(['east', 'south', 'west']), 3)

