const assert = require('assert')
const m = require('./main.js')
async function main() {
  const p = m.label()
  assert.ok(p instanceof Promise, 'label must return a Promise')
  const v = await p
  assert.strictEqual(v, 'locked')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
