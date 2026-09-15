const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.summary({ east: 3, south: 2 }), 'east=3;south=2')
assert.strictEqual(m.summary({}), '')
assert.strictEqual(m.summary({ north: 1 }), 'north=1')
const base = { ghost: 9 }
const child = Object.create(base)
child.east = 1
assert.strictEqual(m.summary(child), 'east=1', 'inherited keys must not appear')

