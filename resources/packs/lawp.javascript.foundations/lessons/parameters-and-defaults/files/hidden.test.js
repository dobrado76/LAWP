const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.walk.length, 0, 'declare the default as walk(n = 1)')
const before = require('fs').readFileSync('play-log.json', 'utf8')
const beforeLen = JSON.parse(before).filter((row) => row.op === 'move').length
m.walk()
const after = JSON.parse(require('fs').readFileSync('play-log.json', 'utf8'))
const afterLen = after.filter((row) => row.op === 'move').length
assert.strictEqual(afterLen - beforeLen, 1, 'walk() with no args must move once')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("n = 1"), 'expected source to include ' + "n = 1")
})()
;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  assert.ok(log.filter((row) => row.op === 'move' && row.dir === 'east').length >= 3)

})()
