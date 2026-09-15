function summary(route) {
  return Object.keys(route).join(";")
}
console.log(summary({ east: 3, south: 2 }))
module.exports = { summary }
