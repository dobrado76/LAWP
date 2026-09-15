function step(dir) {
  throw new Error("bad at step")
}
step("east")
console.log("ok")
module.exports = { step }
