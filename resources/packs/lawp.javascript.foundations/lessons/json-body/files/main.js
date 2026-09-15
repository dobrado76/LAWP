async function safeRead(url) {
  const res = await fetch(url)
  return res.json()
}
safeRead("/broken").then((v) => console.log(v))
module.exports = { safeRead }
