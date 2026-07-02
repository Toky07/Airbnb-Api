import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    setupFiles: ['./src/test/vitest.setup.ts'],
  },
})