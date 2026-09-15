const notes = new Map()
function noteOf(route) {
  return notes.get(route)
}
const route = {}
notes.set(route, "keep")
console.log(noteOf(route))
module.exports = { noteOf, notes, route }
