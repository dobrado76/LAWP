const notes = []
function attempt() {
  throw new Error("x")
}
try { attempt() } catch (e) {}
console.log(notes[0] || "missing")
module.exports = { attempt, notes }
