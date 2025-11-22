import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deployment configuration
export default defineConfig({
  plugins: [react()],
  base: '/trading-tracker2/',
  server: {
    host: true, // Allow external access (ngrok)
    strictPort: false,
    hmr: {
      clientPort: 443 // For ngrok HTTPS
    }
  }
})
