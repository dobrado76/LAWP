const assert = require('assert')
const m = require('./main.js')
async function main() {
  const v = await m.label()
  assert.strictEqual(v, 'keyed')
  const src = require('fs').readFileSync('main.js', 'utf8')
  assert.ok(/await\s+/.test(src), 'await a promise inside label')
  assert.ok(/Promise\.resolve|new\s+Promise/.test(src), 'await a real Promise, not only the return word')

}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
