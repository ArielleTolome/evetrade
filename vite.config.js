import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'EVETrade - Market Trading Tool',
        short_name: 'EVETrade',
        description: 'Discover profitable trades across New Eden. Real-time market orders, profit tracking, and trading tools for EVE Online.',
        theme_color: '#00d4ff',
        background_color: '#050508',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Overview',
            short_name: 'Overview',
            description: 'View your trading dashboard',
            url: '/overview',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Market Orders',
            short_name: 'Orders',
            description: 'View your active market orders',
            url: '/market-orders',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Station Trading',
            short_name: 'Trading',
            description: 'Find profitable station trades',
            url: '/station-trading',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // Force new service worker to take control immediately
        skipWaiting: true,
        clientsClaim: true,
        // Clean up outdated caches from previous builds
        cleanupOutdatedCaches: true,
        // Don't cache-bust URLs with hashes (Vite already does this)
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Handle SPA navigation - serve index.html for all navigation requests
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/evetrade\.s3\.amazonaws\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'evetrade-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.evetech\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'eve-images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://evetrade-modern.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['@headlessui/react'],
          // Markdown rendering
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
})
