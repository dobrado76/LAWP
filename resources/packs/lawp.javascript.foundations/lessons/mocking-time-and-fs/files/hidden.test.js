const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.report({ clock: () => 5, read: () => 'x' }), '5 x')

