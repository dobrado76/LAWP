const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.report(5), 'loops:10 set:5')
assert.strictEqual(m.report(4), 'loops:6 set:4')
assert.strictEqual(m.report(1), 'loops:0 set:1')
assert.strictEqual(m.report(0), 'loops:0 set:0')

