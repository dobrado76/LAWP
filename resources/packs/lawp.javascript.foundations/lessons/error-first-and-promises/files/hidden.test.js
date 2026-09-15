const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.load()
  assert.strictEqual(v, 'north')
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/fs\.promises\.readFile|promises\.readFile/.test(src), 'use fs.promises.readFile')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
