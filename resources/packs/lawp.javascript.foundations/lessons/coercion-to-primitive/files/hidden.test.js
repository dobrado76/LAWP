const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.asNumber(), 2)
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/valueOf/.test(src), 'provide valueOf on the box')
assert.ok(/Number\s*\(/.test(src), 'coerce with Number(box)')
const stripped = src.replace(/valueOf\s*\([^)]*\)\s*\{[\s\S]*?\}/g, '')
assert.ok(!/return\s+2\b/.test(stripped), 'return Number(box), not the literal 2')

