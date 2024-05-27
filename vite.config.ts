import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { autoGenerateTailwindJIT } from './src/util'

const isDev = process.env.NODE_ENV === 'development'
// https://vitejs.dev/config/
export default defineConfig({
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
})
