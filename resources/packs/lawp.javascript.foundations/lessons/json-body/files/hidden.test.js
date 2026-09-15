const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.safeRead('/broken')
  assert.strictEqual(v, 'bad-json')
  const good = await m.safeRead('/beacons.json')
  assert.strictEqual(good.ok, true, 'good JSON must still parse')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
