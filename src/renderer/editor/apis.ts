export type EditorApi = 'player-v1'

export const PLAYER_DIRS = ['north', 'south', 'east', 'west'] as const

export const PLAYER_METHODS: Record<
  string,
  { args: string; info: string; sample: string }
> = {
  move: {
    args: '"north" | "south" | "east" | "west"',
    info: 'Walk one cell. Rocks block. The edge clamps.',
    sample: 'Player.move("east")'
  },
  rotate: {
    args: '90',
    info: 'Turn in 90° steps.',
    sample: 'Player.rotate(90)'
  },
  scale: {
    args: '1 | 2',
    info: 'Set size. Only values the lesson allows.',
    sample: 'Player.scale(2)'
  },
  say: {
    args: '"…"',
    info: 'Show a label on the stage.',
    sample: 'Player.say("ready")'
  }
}
