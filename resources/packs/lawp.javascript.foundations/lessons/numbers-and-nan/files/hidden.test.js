const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.failedNumber('fox'), true)
assert.strictEqual(m.failedNumber('3'), false)

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("Number.isNaN"), 'expected source to include ' + "Number.isNaN")
})()
