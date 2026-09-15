const fs = require('fs')
const path = require('path')
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
  }
}

const Player = new Proxy(api, {
  get(target, prop) {
    if (prop in target) return target[prop]
    return function unknown() {
      write({ op: 'fault', message: 'unknown method ' + String(prop) })
      console.log('Player.' + String(prop) + ': unknown')
    }
  }
})

module.exports = { Player }
