class RouteError extends Error {}
function fail() {
  throw new Error("blocked")
}
try { fail() } catch (e) { console.log(e.message) }
module.exports = { RouteError, fail }
