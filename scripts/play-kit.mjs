/** Play-kit sprites are AI-generated PNGs in resources/play/assets. This script only checks they exist. */
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'resources', 'play', 'assets')
const pngs = readdirSync(root).filter((f) => f.endsWith('.png'))
if (pngs.length < 40) {
  console.error(`play kit: expected PNG sprites in ${root}, found ${pngs.length}`)
  process.exit(1)
}
for (const f of pngs) {
  if (!existsSync(join(root, f))) process.exit(1)
}
console.log(`play kit: ${pngs.length} PNG sprites in ${root}`)
