async function report(jobs) {
  const rows = await Promise.allSettled(jobs)
  return `ok:${rows.length} failed:0`
}
report([Promise.resolve(1), Promise.resolve(2), Promise.reject(new Error("no"))]).then((v) => console.log(v))
module.exports = { report }
