const dirs = ["east", "east", "south"]
function lastDir(list) {
  return list[0]
}
Player.move("east")
module.exports = { dirs, lastDir }
