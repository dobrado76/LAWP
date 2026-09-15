const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.label()
  assert.strictEqual(v, 'locked')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
