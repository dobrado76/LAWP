async function readKey() {
  return "ok"
}
readKey().then((v) => console.log(v))
module.exports = { readKey }
