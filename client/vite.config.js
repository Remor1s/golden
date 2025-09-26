import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/golden/',
  publicDir: '../images',
  plugins: [react()],
  server: { port: 8080, host: true },
  preview: { port: 5174 }
})


