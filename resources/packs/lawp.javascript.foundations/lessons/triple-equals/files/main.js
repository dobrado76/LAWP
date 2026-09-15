function notStrictSame(a, b) {
  return a == b
}
console.log(notStrictSame(0, ""))
module.exports = { notStrictSame }
