;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  const ops = log.map((row) => row.op)
const waitAt = ops.indexOf('wait')
const sayAt = ops.indexOf('say')
const moveAt = ops.indexOf('move')
assert.ok(waitAt >= 0 && waitAt < sayAt && sayAt < moveAt)

})()
