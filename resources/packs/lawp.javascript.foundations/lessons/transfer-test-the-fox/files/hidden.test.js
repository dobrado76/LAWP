const assert = require('assert')
const m = require('./main.js')
assert.deepStrictEqual(m.walk(['west', 'north']), { x: -1, y: -1 })
assert.deepStrictEqual(m.walk([]), { x: 0, y: 0 })

