const assert = require('assert')
const m = require('./main.js')
assert.ok(m.RouteError.prototype instanceof Error)
try { m.fail() } catch (e) {
  assert.ok(e instanceof m.RouteError)
  assert.strictEqual(e.message, 'blocked')
}

