const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.describe({ method: 'GET', headers: {} }), 'GET none')
assert.strictEqual(m.describe({ method: 'POST', headers: { 'content-type': 'application/json' } }), 'POST application/json')

