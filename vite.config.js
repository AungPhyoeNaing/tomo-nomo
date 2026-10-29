import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readingDevPlugin } from './server/dev-reading-plugin.mjs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), readingDevPlugin({ env: loadEnv(mode, process.cwd(), '') })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          astronomy: ['astronomy-engine'],
        },
      },
    },
  },
  server: {
    port: 5180,
    host: '0.0.0.0',
  },
}))
