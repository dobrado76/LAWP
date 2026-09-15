const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.lastDir(['east', 'south']), 'south')
assert.strictEqual(m.lastDir(['west']), 'west')
assert.strictEqual(m.lastDir(m.dirs), 'south')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  
})()
;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const src = fs.readFileSync('main.js', 'utf8')
  assert.ok(/length\s*-\s*1/.test(src), 'last index is length - 1')
  assert.ok(/\bdirs\b/.test(src), 'use the dirs list')
  assert.ok(
    /for\s*\(.*\bof\s+dirs\b|dirs\.forEach|for\s*\(.*dirs\.length|dirs\[/.test(src),
    'iterate dirs — do not paste three hard-coded moves'
  )
  const moveLits = src.match(/Player\.move\(\s*["'](?:east|south|west|north)["']\s*\)/g) || []
  assert.ok(moveLits.length <= 1, 'move via the list values, not hard-coded headings for each step')
})()
