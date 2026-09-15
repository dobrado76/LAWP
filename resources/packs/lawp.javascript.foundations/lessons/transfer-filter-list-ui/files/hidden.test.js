const q = document.querySelector('#q')
q.value = 'ea'
q.dispatchEvent(new Event('input', { bubbles: true }))
const vis = [...document.querySelectorAll('#list li')].filter((li) => !li.hidden).map((li) => li.textContent.trim())
assert.deepStrictEqual(vis, ['East'])
