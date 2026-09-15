const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.notStrictSame(0, ''), true)
assert.strictEqual(m.notStrictSame(0, 0), false)

const fs = require('fs')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes('==='), 'use === or !==')
assert.ok(!/[^!=]==[^=]/.test(src), 'do not use ==')
