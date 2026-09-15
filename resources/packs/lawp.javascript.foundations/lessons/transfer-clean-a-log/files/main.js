function clean(text) {
  return text
}
console.log(clean(require("fs").readFileSync("messy.txt", "utf8")))
module.exports = { clean }
