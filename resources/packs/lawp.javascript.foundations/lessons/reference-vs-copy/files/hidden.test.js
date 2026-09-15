const assert = require('assert')
const m = require('./main.js')
assert.ok(Array.isArray(m.shared))
assert.deepStrictEqual(m.shared, ['east', 'east', 'south'], 'the shared list itself must gain the south step')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  const dirs = log.filter((row) => row.op === 'move').map((row) => row.dir)
assert.deepStrictEqual(dirs.slice(0, 3), ['east', 'east', 'south'], 'walk the shared list, do not add a move by hand')

})()
