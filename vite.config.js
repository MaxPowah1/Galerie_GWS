import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), imagetools()],
  // Absolute asset URLs so nested pages (/werk/…/index.html) resolve them.
  base: '/',
})
