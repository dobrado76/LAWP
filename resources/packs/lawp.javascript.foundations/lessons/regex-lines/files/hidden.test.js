const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.tidy('[WARN]   beacon   down  '), 'warn: beacon down')
assert.strictEqual(m.tidy('[ERROR] lost'), 'error: lost')
assert.strictEqual(m.tidy('plain    message'), 'info: plain message')
assert.strictEqual(m.tidy('  [info]  ok  '), 'info: ok')

