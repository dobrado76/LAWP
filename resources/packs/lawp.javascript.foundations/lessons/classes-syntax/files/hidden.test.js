const assert = require('assert')
const m = require('./main.js')
const r = new m.Route('south')
assert.strictEqual(typeof r.go, 'function')
assert.strictEqual(r.go, m.Route.prototype.go)

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  
})()
