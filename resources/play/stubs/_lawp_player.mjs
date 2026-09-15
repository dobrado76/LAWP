import fs from 'node:fs'
import path from 'node:path'

const LOG = path.join(process.cwd(), 'play-log.json')

function readLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG, 'utf8'))
  } catch {
    return []
  }
}

function write(row) {
  const list = readLog()
  list.push(row)
  fs.writeFileSync(LOG, JSON.stringify(list), 'utf8')
}

const DIRS = ['north', 'south', 'east', 'west']

const api = {
  move(dir) {
    if (!DIRS.includes(dir)) {
      write({ op: 'fault', message: 'move dir must be north, south, east, or west' })
      console.log('Player.move: bad dir')
      return
    }
    write({ op: 'move', dir })
    console.log('Player.move(' + dir + ')')
  },
  rotate(deg) {
    if (typeof deg !== 'number' || deg % 90 !== 0) {
      write({ op: 'fault', message: 'rotate must be a multiple of 90' })
      console.log('Player.rotate: bad deg')
      return
    }
    write({ op: 'rotate', deg })
    console.log('Player.rotate(' + deg + ')')
  },
  scale(n) {
    if (typeof n !== 'number') {
      write({ op: 'fault', message: 'scale needs a number' })
      return
    }
    write({ op: 'scale', n })
    console.log('Player.scale(' + n + ')')
  },
  say(text) {
    write({ op: 'say', text: String(text) })
    console.log('Player.say')
  },
  wait(ticks) {
    if (!Number.isInteger(ticks) || ticks < 0) {
      write({ op: 'fault', message: 'wait ticks must be a whole number ≥ 0' })
      console.log('Player.wait: bad ticks')
      return Promise.reject(new TypeError('wait ticks must be a whole number ≥ 0'))
    }
    const ms = Math.min(2000, ticks * 25)
    return new Promise((resolve) => {
      setTimeout(() => {
        write({ op: 'wait', ticks })
        console.log('Player.wait(' + ticks + ')')
        resolve()
      }, ms)
    })
  }
}

export const Player = new Proxy(api, {
  get(target, prop) {
    if (prop in target) return target[prop]
    return function unknown() {
      write({ op: 'fault', message: 'unknown method ' + String(prop) })
      console.log('Player.' + String(prop) + ': unknown')
    }
  }
})
