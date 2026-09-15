const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.same(0, ''), false)
assert.strictEqual(m.same(1, 1), true)
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(!/[^!=]==[^=]/.test(src), 'do not use ==')

