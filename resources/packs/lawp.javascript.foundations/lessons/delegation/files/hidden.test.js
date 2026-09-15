document.querySelector('[data-name="East"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#picked').textContent, 'East')
const late = document.createElement('button')
late.type = 'button'
late.setAttribute('data-name', 'West')
late.textContent = 'W'
document.querySelector('#list').append(late)
document.querySelector('#picked').textContent = ''
late.dispatchEvent(new MouseEvent('click', { bubbles: true }))
assert.strictEqual(document.querySelector('#picked').textContent, 'West', 'parent listener must hear buttons added after bind')
assert.ok(/#list|getElementById\(\s*['"]list['"]\s*\)|querySelector\(\s*['"]ul/.test(__learnerSource) || /addEventListener/.test(__learnerSource), 'bind the parent')
assert.ok(!/querySelectorAll\(\s*['"]button/.test(__learnerSource), 'do not bind each button by hand')
