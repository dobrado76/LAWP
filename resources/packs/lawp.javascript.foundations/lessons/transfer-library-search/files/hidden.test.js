document.querySelector('#go').dispatchEvent(new MouseEvent('click', { bubbles: true }))
await new Promise((r) => setTimeout(r, 30))
const names = [...document.querySelectorAll('#results li')].map((n) => n.textContent)
assert.deepStrictEqual(names, ['Beacon'])
