import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        [env.VITE_REQUEST_BASE_URL]: {
          target: env.VITE_REQUEST_TARGET,
          changeOrigin: true
        },
        '/upload': {
          target: env.VITE_REQUEST_TARGET,
          changeOrigin: true
        }
      }
    }
  }
})
