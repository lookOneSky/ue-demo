import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

declare const process: {
  cwd: () => string
}

const projectRootPath = process.cwd()

// https://vite.dev/config/
export default defineConfig({
  define: {
    __UE_DEMO_PROJECT_ROOT__: JSON.stringify(projectRootPath)
  },
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有地址
    port: 5177, // 你希望的端口号
    proxy: {
      '/staticRes': {
        target: 'http://10.100.5.28:5174', // 图片视频资源代理
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/staticRes/, '')
      }
    },
  },
})
