async function label() {
  return "open"
}
label().then((v) => console.log(v))
module.exports = { label }
