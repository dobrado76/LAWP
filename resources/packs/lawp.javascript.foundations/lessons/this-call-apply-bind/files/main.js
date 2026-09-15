const mover = {
  dir: "east",
  go() { Player.move(this.dir) }
}
const go = mover.go
go()
module.exports = { mover }
