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
    // buildEnd() {
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
