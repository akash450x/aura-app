import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'AURA Personal Stylist',
        short_name: 'AURA',
        description: 'Your personal digital wardrobe and AI stylist.',
        theme_color: '#111111',
        background_color: '#f7f6f3',
        display: 'standalone',
        start_url: '/',
        icons: []
      }
    })
  ]
})
