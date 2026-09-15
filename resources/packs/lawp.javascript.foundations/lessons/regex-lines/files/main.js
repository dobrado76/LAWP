function tidy(line) {
  return line.trim().toLowerCase()
}
console.log(tidy("[WARN]   beacon   down  "))
module.exports = { tidy }
