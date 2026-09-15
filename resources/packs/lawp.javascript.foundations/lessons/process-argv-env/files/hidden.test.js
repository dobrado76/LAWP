const assert = require('assert')
const m = require('./main.js')
assert.strictEqual(m.flag(), 'scrub')
const src = require('fs').readFileSync('main.js', 'utf8')
assert.ok(/process\.argv/.test(src), 'read process.argv')
assert.ok(/process\.env/.test(src) || /LAWP_FLAG/.test(src), 'read process.env.LAWP_FLAG')
assert.ok(!/return\s+["']scrub["']/.test(src), 'do not hard-code return "scrub"')

