import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/approval': {
        target: 'http://localhost:4004',
        changeOrigin: true,
      },
      '/odata': {
        target: 'http://localhost:4004',
        changeOrigin: true,
      },
    },
  },
})
