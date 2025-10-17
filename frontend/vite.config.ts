import { defineConfig } from 'vite'
import dns from 'dns'
import react from '@vitejs/plugin-react'

dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from network
    // Proxy not needed - App.tsx uses dynamic API URLs based on window.location
  },
})

