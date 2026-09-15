const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.flipLamp(), true)
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\bconst\b/.test(src), 'keep the record in a const binding')
assert.ok(/signal\.on\s*=/.test(src), 'change the field on the existing object')
assert.ok(!/\bsignal\s*=/.test(src.replace(/const\s+signal\s*=\s*\{\s*on:\s*false\s*\}/, '')), 'do not rebind signal')

