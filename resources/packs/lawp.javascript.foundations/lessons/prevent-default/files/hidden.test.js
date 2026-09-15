const q = document.querySelector('#q')
q.value = 'North'
const ev = new Event('submit', { bubbles: true, cancelable: true })
document.querySelector('#desk').dispatchEvent(ev)
assert.ok(ev.defaultPrevented)
assert.strictEqual(document.querySelector('#out').textContent, 'North')
