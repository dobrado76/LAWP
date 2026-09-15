const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.uppers(['ada', 'grace']), 'ADA,GRACE')
const src = ['ada']
m.uppers(src)
assert.strictEqual(src[0], 'ada')

const fs = require('fs')
const assert = require('assert')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(src.includes("map"), 'expected source to include ' + "map")
