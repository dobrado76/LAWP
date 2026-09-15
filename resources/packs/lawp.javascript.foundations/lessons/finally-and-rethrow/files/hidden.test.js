const assert = require('assert')
const m = require('./main.js')
m.notes.length = 0
try { m.attempt() } catch (e) {}
assert.strictEqual(m.notes[0], 'clear')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("finally"), 'expected source to include ' + "finally")
})()
