const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.shoutKeep('east'), 'EAST|east')
assert.strictEqual(m.shoutKeep('north'), 'NORTH|north')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/toUpperCase/.test(src), 'call toUpperCase to build the new string')
assert.ok(!/return\s+["']EAST\|east["']/.test(src), 'build both sides from dir, do not hard-code the result')

