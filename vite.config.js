import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/Personal-Trainer/',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/Personal-Trainer/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Personal Trainer',
        short_name: 'Trainer',
        description: 'Personal workout tracker',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Personal-Trainer/',
        start_url: '/Personal-Trainer/',
        icons: [
          {
            src: '/Personal-Trainer/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Personal-Trainer/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/Personal-Trainer/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  base: '/Personal-Trainer/',
})
