function report(n) {
  const list = Array.from({ length: n }, (_, i) => i)
  return "loops:0 set:0"
}
console.log(report(5))
module.exports = { report }
