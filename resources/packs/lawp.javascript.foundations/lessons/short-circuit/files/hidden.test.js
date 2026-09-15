const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.label(''), 'anon')
assert.strictEqual(m.label('east'), 'east')
assert.strictEqual(m.label(0), 'anon')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/\|\||\?\?/.test(src), 'use || or ?? for the default')

