import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { autoGenerateTailwindJIT } from './src/util'
import { assistantDevApiPlugin } from './src/vite-plugins/assistantDevApi'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    port: 4300,
  },
  plugins: [react(),
  {
    name: 'generate-tailwind-css',
    // 仅开发态补 public 里的 tailwind 文件。生产构建走 PostCSS，
    // 不能在 buildStart 里拉起 tailwindcss --watch，否则 vite build 不会退出。
    apply: 'serve',
    buildStart() {
      autoGenerateTailwindJIT()
    }
  }
  ,
  ...(mode === 'development' ? [assistantDevApiPlugin()] : []),
  ],

  resolve: {
    alias: {
      '@': '/src',
    }
  },
  build: {
    // minify: 'terser',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
        manualChunks: {
          react: ['react', 'react-dom'],
          antd: ['antd'],
        },
      },
    },
  },
}))
