function makePart(type, props) {
  return { type, props }
}
function movePart(part, dir) {}
const fox = makePart("fox", { x: 0, y: 0 })
movePart(fox, "east")
console.log(fox.props.x)
module.exports = { makePart, movePart }
