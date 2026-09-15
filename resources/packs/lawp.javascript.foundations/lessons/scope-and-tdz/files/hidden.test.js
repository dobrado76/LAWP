const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.readyLabel(), 'east')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\blet\b/.test(src), 'declare a let binding for the word')
assert.ok(!/return\s+["']east["']/.test(src), 'return the binding, not the string literal')

