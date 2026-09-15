function unique(dirs) {
  return dirs.join("-")
}
console.log(unique(["east", "east", "south"]))
module.exports = { unique }
