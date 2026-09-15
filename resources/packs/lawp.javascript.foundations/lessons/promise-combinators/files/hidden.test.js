const assert = require('assert')
const m = require('./main.js')
async function main() {
  const mixed = await m.report([Promise.resolve(1), Promise.resolve(2), Promise.reject(new Error('no'))])
  assert.strictEqual(mixed, 'ok:2 failed:1')
  const allOk = await m.report([Promise.resolve(1)])
  assert.strictEqual(allOk, 'ok:1 failed:0')
  const allBad = await m.report([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])
  assert.strictEqual(allBad, 'ok:0 failed:2')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
