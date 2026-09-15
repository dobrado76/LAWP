import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const png = join(root, 'build', 'icon.png')
if (!existsSync(png)) {
  console.error('build/icon.png missing')
  process.exit(1)
}
const py = spawnSync('python', [join(root, 'scripts', 'icons.py')], { stdio: 'inherit', cwd: root })
process.exit(py.status ?? 1)
