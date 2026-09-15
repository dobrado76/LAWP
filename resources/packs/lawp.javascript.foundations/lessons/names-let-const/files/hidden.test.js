const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.labelBox(), 'locked')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\bconst\b/.test(src), 'declare a const binding for the word')
assert.ok(!/return\s+["']locked["']/.test(src), 'return the binding, not the string literal')

