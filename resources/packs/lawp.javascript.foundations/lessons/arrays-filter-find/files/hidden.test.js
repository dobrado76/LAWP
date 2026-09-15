const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.onlyEast(['south', 'east', 'east']), 'east,east')
assert.strictEqual(m.onlyEast(['south']), '')

const fs = require('fs')
const assert = require('assert')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes("filter"), 'expected source to include ' + "filter")
