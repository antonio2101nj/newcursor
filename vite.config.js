import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      '.manusvm.computer',
      '.manus.computer',
      '5173-it3qeffu1v4ksbtrbr25g-a54ddd3d.manus.computer',
      'localhost',
      '127.0.0.1'
    ]
  },
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsDir: 'assets',
  },
})


