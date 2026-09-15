const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(typeof m.cmds.go, 'function')
assert.strictEqual(typeof m.cmds.turn, 'function')

;(function () {
  const fs = require('fs')
  const assert = require('assert')
  const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
  assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
  assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
  const src = fs.readFileSync('main.js', 'utf8')
assert.ok(/cmds\.go\s*\(/.test(src), 'call through cmds.go')
assert.ok(/cmds\.turn\s*\(/.test(src), 'call through cmds.turn')
const withoutTable = src.replace(/const\s+cmds\s*=\s*\{[\s\S]*?\n\}/, '')
assert.ok(!/Player\.move\s*\(/.test(withoutTable), 'do not call Player.move outside the cmds table')
assert.ok(!/Player\.rotate\s*\(/.test(withoutTable), 'do not call Player.rotate outside the cmds table')

})()
