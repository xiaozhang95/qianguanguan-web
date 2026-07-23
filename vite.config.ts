import react from '@vitejs/plugin-react'
import { resolve } from 'path'
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
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/@ant-design/icons')) return 'icons'
            if (id.includes('node_modules/antd/') || id.includes('node_modules/@ant-design/cssinjs') || id.includes('node_modules/@rc-component')) return 'antd'
            if (id.includes('node_modules/@ant-design/charts') || id.includes('node_modules/@antv')) return 'charts'
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) return 'react'
            if (id.includes('node_modules/dayjs')) return 'dayjs'
          }
        }
      }
    }
  }
})
