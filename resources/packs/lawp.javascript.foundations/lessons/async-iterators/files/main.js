async function* steps() {
  yield "east"
}
async function join() {
  return "east"
}
join().then((v) => console.log(v))
module.exports = { steps, join }
