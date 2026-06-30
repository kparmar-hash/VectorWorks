import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxies /api/nim/* → https://integrate.api.nvidia.com/v1/*
      // This sidesteps browser CORS restrictions on the NIM API.
      '/api/nim': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nim/, ''),
        secure: true,
      },
    },
  },
})
