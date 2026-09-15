const fs = require('fs')
const assert = require('assert')
const log = JSON.parse(fs.readFileSync('play-log.json', 'utf8'))
assert.ok(Array.isArray(log) && log.length > 0, 'expected play commands')
assert.ok(!log.some((row) => row.op === 'fault'), 'play log has a fault')
assert.ok(log.some((row) => row.dir === 'east'))
assert.ok(log.some((row) => row.dir === 'south'))

