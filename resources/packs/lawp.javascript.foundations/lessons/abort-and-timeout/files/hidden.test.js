const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.race()
  assert.strictEqual(v, 'aborted')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
