function rows(items) {
  return items.map((item) => item).join(",")
}
console.log(rows(["a", "b"]))
