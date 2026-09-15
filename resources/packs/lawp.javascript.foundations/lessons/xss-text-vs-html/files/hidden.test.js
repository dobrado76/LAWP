const safe = document.querySelector('#safe')
assert.ok(safe.textContent.includes('onerror'))
assert.strictEqual(safe.querySelector('img'), null)
