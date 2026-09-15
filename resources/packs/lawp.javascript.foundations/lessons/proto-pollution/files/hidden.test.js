const assert = require('assert')
const m = require('./main.js')
const out = m.safeMerge({ a: 1 }, JSON.parse('{"__proto__":{"polluted":true},"name":"n"}'))
assert.strictEqual(out.name, 'n')
assert.strictEqual({}.polluted, undefined)

