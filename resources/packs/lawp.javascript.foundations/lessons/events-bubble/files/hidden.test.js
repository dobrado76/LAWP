document.querySelector('#inner').dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#out').textContent, 'inner>outer')
