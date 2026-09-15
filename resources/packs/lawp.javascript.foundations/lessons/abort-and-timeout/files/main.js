async function race() {
  return "ok"
}
race().then((v) => console.log(v))
module.exports = { race }
