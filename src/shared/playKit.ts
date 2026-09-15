export type PlayKitLayer = 'floor' | 'solid' | 'item' | 'actor' | 'hazard'
export type PlayKitCategory = 'floors' | 'terrain' | 'items' | 'characters' | 'hazards'

export type PlayKitPiece = {
  id: string
  label: string
  file: string
  category: PlayKitCategory
  layer: PlayKitLayer
  defaults?: Record<string, string | number | boolean>
}

export const DEFAULT_FLOOR = 'floor-stone'

export const PLAY_KIT: PlayKitPiece[] = [
  { id: 'floor-stone', label: 'Stone floor', file: 'floor-stone.png', category: 'floors', layer: 'floor' },
  { id: 'floor-grass', label: 'Grass', file: 'floor-grass.png', category: 'floors', layer: 'floor' },
  { id: 'floor-dirt', label: 'Dirt', file: 'floor-dirt.png', category: 'floors', layer: 'floor' },
  { id: 'floor-sand', label: 'Sand', file: 'floor-sand.png', category: 'floors', layer: 'floor' },
  { id: 'floor-wood', label: 'Wood', file: 'floor-wood.png', category: 'floors', layer: 'floor' },
  { id: 'floor-water', label: 'Water', file: 'floor-water.png', category: 'floors', layer: 'floor' },
  { id: 'floor-snow', label: 'Snow', file: 'floor-snow.png', category: 'floors', layer: 'floor' },
  { id: 'floor-brick', label: 'Brick', file: 'floor-brick.png', category: 'floors', layer: 'floor' },
  { id: 'floor-tile', label: 'Tile', file: 'floor-tile.png', category: 'floors', layer: 'floor' },
  { id: 'floor-path', label: 'Path', file: 'floor-path.png', category: 'floors', layer: 'floor' },
  { id: 'floor-lava', label: 'Lava', file: 'floor-lava.png', category: 'floors', layer: 'floor' },
  { id: 'floor-ice', label: 'Ice', file: 'floor-ice.png', category: 'floors', layer: 'floor' },

  { id: 'rock', label: 'Rock', file: 'rock.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'wall', label: 'Wall', file: 'wall.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'crate', label: 'Crate', file: 'crate.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'bush', label: 'Bush', file: 'bush.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'tree', label: 'Tree', file: 'tree.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'stump', label: 'Stump', file: 'stump.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'fence', label: 'Fence', file: 'fence.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'pillar', label: 'Pillar', file: 'pillar.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'barrel', label: 'Barrel', file: 'barrel.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'cactus', label: 'Cactus', file: 'cactus.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'ice-block', label: 'Ice block', file: 'ice-block.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },
  { id: 'mushroom', label: 'Mushroom', file: 'mushroom.png', category: 'terrain', layer: 'solid', defaults: { solid: true } },

  { id: 'coin', label: 'Coin', file: 'coin.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'key', label: 'Key', file: 'key.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'glint', label: 'Glint', file: 'glint.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'gem', label: 'Gem', file: 'gem.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'heart', label: 'Heart', file: 'heart.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'star', label: 'Star', file: 'star.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'apple', label: 'Apple', file: 'apple.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'potion', label: 'Potion', file: 'potion.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'scroll', label: 'Scroll', file: 'scroll.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'flag', label: 'Flag', file: 'flag.png', category: 'items', layer: 'item' },
  { id: 'shield', label: 'Shield', file: 'shield.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'sword', label: 'Sword', file: 'sword.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'flower', label: 'Flower', file: 'flower.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'bell', label: 'Bell', file: 'bell.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'map', label: 'Map', file: 'map.png', category: 'items', layer: 'item', defaults: { collect: true } },
  { id: 'chest', label: 'Chest', file: 'chest.png', category: 'items', layer: 'item' },
  { id: 'beacon', label: 'Beacon', file: 'beacon.png', category: 'items', layer: 'item' },

  { id: 'fox', label: 'Fox', file: 'fox.png', category: 'characters', layer: 'actor' },
  { id: 'owl', label: 'Owl', file: 'owl.png', category: 'characters', layer: 'actor' },
  { id: 'robot', label: 'Robot', file: 'robot.png', category: 'characters', layer: 'actor' },
  { id: 'slime', label: 'Slime', file: 'slime.png', category: 'characters', layer: 'actor' },
  { id: 'beetle', label: 'Beetle', file: 'beetle.png', category: 'characters', layer: 'actor' },
  { id: 'chick', label: 'Chick', file: 'chick.png', category: 'characters', layer: 'actor' },
  { id: 'ghost', label: 'Ghost', file: 'ghost.png', category: 'characters', layer: 'actor' },
  { id: 'cat', label: 'Cat', file: 'cat.png', category: 'characters', layer: 'actor' },

  { id: 'spike', label: 'Spike', file: 'spike.png', category: 'hazards', layer: 'hazard' },
  { id: 'fire', label: 'Fire', file: 'fire.png', category: 'hazards', layer: 'hazard' },
  { id: 'hole', label: 'Hole', file: 'hole.png', category: 'hazards', layer: 'hazard' },
  { id: 'poison', label: 'Poison', file: 'poison.png', category: 'hazards', layer: 'hazard' }
]

const byId = new Map(PLAY_KIT.map((p) => [p.id, p]))

export const PLAY_KIT_CATEGORIES: { id: PlayKitCategory; label: string }[] = [
  { id: 'floors', label: 'Floors' },
  { id: 'terrain', label: 'Terrain' },
  { id: 'items', label: 'Items' },
  { id: 'characters', label: 'Characters' },
  { id: 'hazards', label: 'Hazards' }
]

export function playKitPiece(id: string): PlayKitPiece | undefined {
  return byId.get(id)
}

export function playKitSrc(id: string): string | null {
  const piece = byId.get(id)
  return piece ? `lawp-play://assets/${piece.file}` : null
}

export function playKitAssetMap(): Record<string, string> {
  return Object.fromEntries(PLAY_KIT.map((p) => [p.id, p.file]))
}

export function playKitLayerRank(type: string): number {
  if (type === 'fox' || type === 'player') return 5
  const layer = byId.get(type)?.layer
  if (layer === 'floor') return 0
  if (layer === 'solid') return 1
  if (layer === 'hazard') return 2
  if (layer === 'item') return 3
  if (layer === 'actor') return 4
  return 3
}

export function blankGridWorld(floor = DEFAULT_FLOOR) {
  return {
    parts: [
      { id: 'fox', type: 'fox', props: { x: 0, y: 4, rot: 0, label: 'Fox' } },
      { id: 'beacon', type: 'beacon', props: { x: 4, y: 0, label: 'Beacon' } }
    ],
    connections: [],
    actions: [],
    rules: [],
    view: {
      kind: 'grid' as const,
      grid: { cols: 5, rows: 5, floor },
      assetMap: playKitAssetMap()
    }
  }
}
