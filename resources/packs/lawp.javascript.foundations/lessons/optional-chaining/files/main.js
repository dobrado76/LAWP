function beaconName(signal) {
  return "unknown"
}
console.log(beaconName({ beacon: { name: "north" } }))
module.exports = { beaconName }
