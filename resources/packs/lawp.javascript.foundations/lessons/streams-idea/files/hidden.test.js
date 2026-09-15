const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.lastLine()
  assert.strictEqual(v, 'east')
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(src.includes('createReadStream'))

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
