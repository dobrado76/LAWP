function walk(steps, fn) {
  fn()
}
walk(3, () => Player.move("east"))
module.exports = { walk }
