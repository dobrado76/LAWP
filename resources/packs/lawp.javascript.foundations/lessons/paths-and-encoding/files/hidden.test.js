const assert = require('assert')
const m = require('./main.js')
assert.ok(/logs[\\/]a\.txt/.test(m.safeJoin('logs', 'a.txt')))
assert.throws(() => m.safeJoin('logs', '../secret'))

