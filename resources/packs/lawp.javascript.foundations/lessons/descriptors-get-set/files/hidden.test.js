const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.fox.position, '2,1')
assert.ok(Object.getOwnPropertyDescriptor(m.fox, 'position').get)

