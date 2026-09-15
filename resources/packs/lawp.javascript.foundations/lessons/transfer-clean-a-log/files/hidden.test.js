const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.clean('b\na\nb\n'), 'a\nb')

