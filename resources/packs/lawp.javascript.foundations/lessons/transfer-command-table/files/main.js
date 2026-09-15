function run(plan, table) {}
const table = {
  e: () => Player.move("east"),
  s: () => Player.move("south")
}
run(["e", "e", "s"], table)
module.exports = { run }
