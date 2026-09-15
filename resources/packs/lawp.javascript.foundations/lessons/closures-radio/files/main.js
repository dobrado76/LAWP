function makeMover(dir) {
  return function go() {}
}
const go = makeMover("east")
module.exports = { makeMover }
