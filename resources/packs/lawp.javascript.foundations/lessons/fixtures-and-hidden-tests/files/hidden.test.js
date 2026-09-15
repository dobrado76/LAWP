const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.walkLength(['a', 'b', 'c']), 3)
assert.strictEqual(m.walkLength([]), 0)

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("cases.json"), 'expected source to include ' + "cases.json")
  assert.ok(src.includes("assert"), 'expected source to include ' + "assert")
})()
