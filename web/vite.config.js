import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — changes rarely, cache longer
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Lucide icons — large but stable
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // Raise chunk warning threshold to 600KB (our icons are large)
    chunkSizeWarningLimit: 600,
    // Enable minification + tree-shaking (default terser in vite)
    minify: 'esbuild',
    // Generate source maps for production debugging (optional, remove if needed)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
  // Optimise dev server
  server: {
    port: 5173,
    open: false,
  },
})
