const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.readKey()
  assert.strictEqual(v, 'lost')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
