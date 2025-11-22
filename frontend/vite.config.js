import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access (ngrok)
    strictPort: false,
    hmr: {
      clientPort: 443 // For ngrok HTTPS
    }
  }
})
