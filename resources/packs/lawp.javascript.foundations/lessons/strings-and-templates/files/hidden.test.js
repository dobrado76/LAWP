const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.tagBeacon('east'), 'beacon:east')
assert.strictEqual(m.tagBeacon('north'), 'beacon:north')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/`[^`]*\$\{/.test(src), 'use a template literal with ${ }')
assert.ok(!/return\s+["']beacon:/.test(src), 'build the label from name, do not hard-code it')

