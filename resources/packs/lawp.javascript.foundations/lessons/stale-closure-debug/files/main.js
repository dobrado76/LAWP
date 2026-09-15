const dirs = ["east", "south"]
const movers = []
for (var i = 0; i < dirs.length; i++) {
  movers.push(function () {
    Player.move(dirs[i])
  })
}
for (const go of movers) go()
