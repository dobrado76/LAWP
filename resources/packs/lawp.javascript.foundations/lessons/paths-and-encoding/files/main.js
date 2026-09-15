const path = require("path")
function safeJoin(root, name) {
  return path.join(root, name)
}
console.log(safeJoin("logs", "a.txt"))
module.exports = { safeJoin }
