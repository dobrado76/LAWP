assert.strictEqual(document.querySelectorAll('#list li').length, 3)
const q = document.querySelector('#q')
q.value = 'w'
q.dispatchEvent(new Event('input', { bubbles: true }))
const vis = [...document.querySelectorAll('#list li')].filter((li) => !li.hidden).map((li) => li.textContent.trim())
assert.deepStrictEqual(vis, ['West'])
