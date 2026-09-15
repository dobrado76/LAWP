const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.sharedGo(), true)
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/Object\.create/.test(src), 'share go via Object.create')
assert.ok(/\.go\s*===\s*|===\s*\w+\.go/.test(src), 'compare the two go functions')
assert.ok(!/^[^\n]*return\s+true\s*$/m.test(src) || /Object\.create/.test(src), 'prove the share, do not only return true')

