import assert from 'node:assert'
import { ping } from './main.mjs'
assert.strictEqual(ping(), 'pong')
