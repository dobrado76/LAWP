const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.ping(), 'pong')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("ping()"), 'expected source to include ' + "ping()")
})()
