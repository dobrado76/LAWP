const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.add(2, 3), 5)
assert.strictEqual(m.add(0, 1), 1)

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("=>"), 'expected source to include ' + "=>")
})()
