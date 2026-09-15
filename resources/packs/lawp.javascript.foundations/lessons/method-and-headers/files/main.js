function describe(req) {
  return req.method
}
console.log(describe({ method: "POST", headers: { "content-type": "application/json" } }))
module.exports = { describe }
