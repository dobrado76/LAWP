async function read(url) {
  const res = await fetch(url)
  return res.json()
}
read("/beacons.json").then((d) => console.log(d.ok))
module.exports = { read }
