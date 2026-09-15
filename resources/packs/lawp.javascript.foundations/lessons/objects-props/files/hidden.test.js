const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.route.east, 3)
assert.strictEqual(m.route.south, 2)

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(src.includes("route.east"), 'expected source to include ' + "route.east")
  assert.ok(src.includes("route.south"), 'expected source to include ' + "route.south")
})()
;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  
})()
