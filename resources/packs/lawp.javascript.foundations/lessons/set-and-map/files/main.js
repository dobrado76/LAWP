function unique(dirs) {
  return dirs.join("-")
}
function nameOf(map, key) {
  return key
}
console.log(unique(["east", "east", "south"]))
module.exports = { unique, nameOf }
