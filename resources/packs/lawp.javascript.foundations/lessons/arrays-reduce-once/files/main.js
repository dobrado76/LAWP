function pathOf(dirs) {
  return dirs.join(",")
}
console.log(pathOf(["east", "south"]))
module.exports = { pathOf }
