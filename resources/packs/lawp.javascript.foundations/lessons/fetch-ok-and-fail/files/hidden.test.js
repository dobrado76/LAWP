const assert = require('assert')
const m = require('./main.js')
async function main() {
  const d = await m.read('/beacons.json')
  assert.strictEqual(d.ok, true)
  await m.read('/missing').then(
    () => { throw new Error('should reject') },
    () => undefined
  )

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
