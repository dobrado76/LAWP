function onlyEast(dirs) {
  return dirs.join(",")
}
function firstEast(dirs) {
  return dirs[0]
}
console.log(onlyEast(["east", "south", "east"]))
module.exports = { onlyEast, firstEast }
