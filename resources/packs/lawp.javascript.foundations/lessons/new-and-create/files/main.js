function child() {
  return { kind: "beacon" }
}
console.log(child().kind)
module.exports = { child }
