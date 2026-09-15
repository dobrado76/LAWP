const assert = require('assert')
const m = require('./main.js')
const target = { a: 1 }
const out = m.safeMerge(target, JSON.parse('{"__proto__":{"polluted":true},"name":"n"}'))
assert.strictEqual(out.name, 'n')
assert.strictEqual(out.a, 1)
assert.strictEqual({}.polluted, undefined)
assert.strictEqual(out.polluted, undefined, 'the merged object inherited a polluted prototype')
assert.strictEqual(Object.prototype.hasOwnProperty.call(out, '__proto__'), false)
m.safeMerge(target, { b: 2 })
assert.strictEqual(target.b, undefined, 'safeMerge must return a fresh object, not edit the target')

