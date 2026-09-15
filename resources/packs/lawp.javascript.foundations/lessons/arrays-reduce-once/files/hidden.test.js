const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.pathOf(['east', 'south']), 'east-south')
assert.strictEqual(m.pathOf(['west']), 'west')

const fs = require('fs')
const assert = require('assert')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes("reduce"), 'expected source to include ' + "reduce")
