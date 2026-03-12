import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },  server: {
    port: 5001,
    host: '0.0.0.0', // Permite conexiones externas
    proxy: {
      '/api': {
        target: 'http://localhost:5055',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5055',
        changeOrigin: true
      }
    }
  }
})
