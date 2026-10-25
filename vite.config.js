import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@designcodeio/threeui/style.css': path.resolve(__dirname, 'src/shaders/threeui.css'),
      '@designcodeio/threeui': path.resolve(__dirname, 'src/shaders/landing-pages/LandingPages.tsx'),
    },
  },
})
