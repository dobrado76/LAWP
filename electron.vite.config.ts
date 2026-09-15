/** Placeholder so tsconfig.node.json has a real entry. Replace with electron-vite `defineConfig` during Phase 0. */
const config = {
  main: { entry: 'src/main/index.ts' },
  preload: { entry: 'src/preload/index.ts' },
  renderer: { root: 'src/renderer' }
}

export default config
