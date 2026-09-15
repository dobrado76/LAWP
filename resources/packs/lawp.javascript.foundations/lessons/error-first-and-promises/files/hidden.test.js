const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.load()
  assert.strictEqual(v, 'north')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
