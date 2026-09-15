const items = [...document.querySelectorAll('#list li')].map((n) => n.textContent)
assert.ok(items.includes('East'))
