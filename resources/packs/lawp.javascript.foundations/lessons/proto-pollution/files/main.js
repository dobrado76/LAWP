function safeMerge(target, src) {
  return Object.assign(target, src)
}
console.log(safeMerge({}, { name: "n" }).name)
module.exports = { safeMerge }
