import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    hookTimeout: 60000,
    testTimeout: 60000,
    pool: 'forks',
    fileParallelism: false // each file boots its own CAP server; in parallel they clash on ports (EADDRINUSE)
  }
})
