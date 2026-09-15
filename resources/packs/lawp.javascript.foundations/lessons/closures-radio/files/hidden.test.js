const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(typeof m.makeMover('south'), 'function')
assert.strictEqual(m.makeMover.length, 1, 'makeMover takes the heading as a parameter')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  const moves = log.filter((row) => row.op === 'move')
assert.ok(moves.length >= 3, 'call the returned function three times')
assert.ok(moves.every((row) => row.dir === 'east'), 'every step comes from the radio you tuned')
const src = fs.readFileSync('main.js', 'utf8')
assert.ok(!/Player\.move\(\s*["']east["']\s*\)/.test(src), 'move through the closure, not a hard-coded heading')

})()
