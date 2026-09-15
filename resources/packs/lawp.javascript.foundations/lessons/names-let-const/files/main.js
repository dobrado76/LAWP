function flipLamp() {
  const signal = { on: false }
  return signal.on
}
console.log(flipLamp())
module.exports = { flipLamp }
