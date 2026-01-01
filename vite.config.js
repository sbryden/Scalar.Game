import { defineConfig } from 'vite'
import { execSync } from 'child_process'

// Get git commit hash or use 'dev' for development
function getBuildNumber() {
  try {
    const commit = execSync('git rev-parse --short HEAD').toString().trim()
    return commit
  } catch (e) {
    return 'dev'
  }
}

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
  publicDir: 'assets', // Copy assets folder to dist root
  define: {
    '__BUILD_NUMBER__': JSON.stringify(process.env.NODE_ENV === 'production' ? getBuildNumber() : 'dev')
  }
})
