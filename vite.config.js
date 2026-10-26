import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    proxy: { '/api': 'http://localhost:3080' },
    port: 5180,
    host: '0.0.0.0',
  },
})
