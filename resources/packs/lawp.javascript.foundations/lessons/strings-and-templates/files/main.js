function tagBeacon(name) {
  return "beacon:${name}"
}
console.log(tagBeacon("north"))
module.exports = { tagBeacon }
