import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// dev 端口 5173；server.proxy 只在 npm run dev 生效，部署时由宿主机 nginx 转发同一路径 /api
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
