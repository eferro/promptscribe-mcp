import { defineConfig } from 'vitest/config'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Only load VITE_* variables for client-like tests
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Provide defaults for tests if not defined locally
  if (!env.VITE_SUPABASE_URL) env.VITE_SUPABASE_URL = 'http://localhost:54321'
  if (!env.VITE_SUPABASE_ANON_KEY) env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expose VITE_* values to tests via import.meta.env
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
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