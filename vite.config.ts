import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { autoGenerateTailwindJIT } from './src/util'

// https://vitejs.dev/config/
export default defineConfig({
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
