import { defineConfig } from 'vitest/config'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': env
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'src/setupTests.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'json'],
      },
    },
  }
})