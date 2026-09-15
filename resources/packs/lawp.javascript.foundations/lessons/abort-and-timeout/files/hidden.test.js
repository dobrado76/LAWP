const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.race()
  assert.strictEqual(v, 'aborted')
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/AbortController/.test(src), 'use AbortController')
  assert.ok(/signal/.test(src), 'pass signal to fetch')
  assert.ok(!/return\s+["']aborted["']/.test(src), 'return aborted from the AbortError path, not a hardcoded string')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
