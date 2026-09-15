;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  const waits = log.filter((row) => row.op === 'wait')
assert.ok(waits.length >= 3, 'the yard expects three waits, not one')
const ops = log.map((row) => row.op)
const moves = log.filter((row) => row.op === 'move' && row.dir === 'east')
assert.ok(moves.length >= 3, 'walk east onto the beacon after the waits')
assert.ok(ops.lastIndexOf('wait') < ops.indexOf('move'), 'finish the waiting before the walking')

})()
