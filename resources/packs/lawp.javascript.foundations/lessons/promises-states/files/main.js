function label() {
  return Promise.resolve("open")
}
label().then((v) => console.log(v))
module.exports = { label }
