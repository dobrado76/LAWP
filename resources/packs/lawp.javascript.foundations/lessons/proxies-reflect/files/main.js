function wrapRoute(obj) {
  return obj
}
console.log(wrapRoute({}).unknown || "missing")
module.exports = { wrapRoute }
