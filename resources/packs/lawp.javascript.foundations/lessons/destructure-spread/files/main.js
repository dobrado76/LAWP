function extendSouth(route) {
  route.south = 2
  return route
}
console.log(extendSouth({ east: 3, south: 0 }).south)
module.exports = { extendSouth }
