const assert = require('assert')
const m = require('./main.js')
const p = m.makePart('beacon', { x: 1, y: 2, label: 'B' })
assert.strictEqual(p.type, 'beacon')
assert.strictEqual(p.props.y, 2)
m.movePart(p, 'east')
assert.strictEqual(p.props.x, 2)

