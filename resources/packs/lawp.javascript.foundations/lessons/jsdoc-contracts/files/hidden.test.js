const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.walkLength(['a']), 1)

const fs = require('fs')
const assert = require('assert')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes("@param"), 'expected source to include ' + "@param")
assert.ok(src.includes("@returns"), 'expected source to include ' + "@returns")
