const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.readNote(), 'north')
assert.strictEqual(require('fs').readFileSync('out.txt', 'utf8').trim(), 'north')

