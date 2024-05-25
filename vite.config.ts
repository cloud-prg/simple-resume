import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { autoGenerateTailwindJIT } from './src/util'

const isDev = process.env.NODE_ENV === 'development'
// https://vitejs.dev/config/
export default defineConfig({
  base: isDev ? '' : '/simple-resume/',
  server: {
    port: 4300,
  },
  plugins: [react(),
  {
    name: 'generate-tailwind-css',
    buildStart() {
      autoGenerateTailwindJIT()
    }
  }
  ],
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})
