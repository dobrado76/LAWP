function onlyEast(dirs) {
  return dirs.join(",")
}
console.log(onlyEast(["east", "south", "east"]))
module.exports = { onlyEast }
