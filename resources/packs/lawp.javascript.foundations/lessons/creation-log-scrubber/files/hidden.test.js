const assert = require('assert')
const m = require('./main.js')
m.scrub('messy.txt', 'out-hidden.txt')
const got = require('fs').readFileSync('out-hidden.txt', 'utf8').trim()
assert.strictEqual(got, 'east\nnorth')

