const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.safeRead('/broken')
  assert.strictEqual(v, 'bad-json')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
