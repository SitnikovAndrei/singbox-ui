import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/cgi-bin': {
        target: 'http://192.168.1.1',
        changeOrigin: true
      }
    }
  }
})