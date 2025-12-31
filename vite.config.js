import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Scalar.Game/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    assetsInlineLimit: 0, // Don't inline assets as base64
    copyPublicDir: true
  },
  publicDir: 'assets' // Copy assets folder to dist root
})
