document.querySelector('[data-name="East"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#picked').textContent, 'East')
