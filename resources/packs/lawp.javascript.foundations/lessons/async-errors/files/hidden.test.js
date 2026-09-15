const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.readKey()
  assert.strictEqual(v, 'lost')
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/Promise\.reject/.test(src), 'await Promise.reject')
  assert.ok(/await\s+/.test(src), 'await the rejection')
  assert.ok(/try\s*\{/.test(src) && /catch\s*\(/.test(src), 'use try/catch around the await')
  assert.ok(!/return\s+["']lost["']/.test(src), 'return e.message from catch, not a hardcoded string')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
