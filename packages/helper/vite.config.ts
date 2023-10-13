import { sveltekit } from '@sveltejs/kit/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    sveltekit(),
    visualizer({
      // template: 'sunburst',
      open: true,
      gzipSize: true,
      projectRoot: 'home/jycouet/udev/gh/lib/kitql',
    }),
  ],

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
