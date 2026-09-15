const assert = require('assert')
const m = require('./main.js')
const src = { east: 3, south: 0 }
const next = m.extendSouth(src)
assert.strictEqual(next.south, 2)
assert.strictEqual(src.south, 0)

const fs = require('fs')
const assert = require('assert')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes("..."), 'expected source to include ' + "...")
