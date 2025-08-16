import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    base: mode === 'production' ? '/promptscribe-mcp/' : '/',
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React ecosystem
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI components (biggest chunk)
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-select',
              '@radix-ui/react-toast',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-popover',
              '@radix-ui/react-switch',
              '@radix-ui/react-label',
              'lucide-react'
            ],
            // Backend services
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-query': ['@tanstack/react-query'],
            // Form and validation
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Utility libraries
            'vendor-utils': ['clsx', 'tailwind-merge', 'date-fns', 'class-variance-authority']
          }
        }
      }
    },
    // Do not inline arbitrary process.env values into the client bundle.
    // Rely on Vite's import.meta.env for VITE_* variables.
  };
});
