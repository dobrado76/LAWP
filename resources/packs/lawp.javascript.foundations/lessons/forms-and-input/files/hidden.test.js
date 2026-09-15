const el = document.querySelector('#name')
el.value = 'Beacon'
el.dispatchEvent(new Event('input', { bubbles: true }))
assert.strictEqual(document.querySelector('#echo').textContent, 'Beacon')
