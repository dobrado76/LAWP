const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.labelBox(), 'locked')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(src.includes('const'))

