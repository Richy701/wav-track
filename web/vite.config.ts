import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import viteImagemin from 'vite-plugin-imagemin'
import { vitePluginFaviconsInject } from 'vite-plugin-favicons-inject'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions, VitePWAOptions, Display } from 'vite-plugin-pwa'
import type { ManifestTransform, ManifestEntry, ManifestTransformResult } from 'workbox-build'
import fs from 'fs'

// Function to get PWA manifest configuration
const getManifestConfig = () => {
  const basePath = process.env.BASE_URL || '/';
  
  return {
    name: 'WavTrack',
    short_name: 'WavTrack',
    theme_color: '#6200ea',
    start_url: basePath,
    scope: basePath,
    display: 'standalone' as Display,
    background_color: '#121212',
    icons: [
      {
        src: `${basePath}favicon.ico`,
        sizes: '48x48',
        type: 'image/x-icon'
      },
      {
        src: `${basePath}android-chrome-192x192.png`,
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: `${basePath}android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: `${basePath}maskable-icon.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
};

const manifestForPlugin: Partial<ManifestOptions> = getManifestConfig();

interface ManifestEntryWithSize extends ManifestEntry {
  size: number
}

// Custom manifest transform function
const customManifestTransform: ManifestTransform = async (manifestEntries: ManifestEntryWithSize[]): Promise<ManifestTransformResult> => {
  const manifest = manifestEntries.map((entry: ManifestEntryWithSize) => {
    if (entry.url.startsWith('/')) {
      return {
        ...entry,
        url: `/wav-track${entry.url}`
      }
    }
    return entry
  })

  return {
    manifest,
    warnings: []
  }
}

// PWA Configuration
const pwaConfiguration: VitePWAOptions = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  injectRegister: 'auto',
  minify: true,
  injectManifest: {},
  includeManifestIcons: true,
  disable: false,
  manifest: {
    name: 'WavTrack',
    short_name: 'WavTrack',
    description: 'Track your music production journey',
    theme_color: '#6200ea',
    start_url: '/wav-track/',
    scope: '/wav-track/',
    display: 'standalone',
    background_color: '#121212',
    icons: [
      {
        src: '/wav-track/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      },
      {
        src: '/wav-track/android-chrome-192x192.png',
        type: 'image/png',
        sizes: '192x192'
      },
      {
        src: '/wav-track/android-chrome-512x512.png',
        type: 'image/png',
        sizes: '512x512'
      },
      {
        src: '/wav-track/maskable-icon.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/ewenoruuogtoqyaxelgm\.supabase\.co\/storage\/v1\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'media-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
          }
        }
      }
    ],
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    sourcemap: false,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    navigateFallback: '/wav-track/index.html',
    navigateFallbackDenylist: [/^\/api/, /^\/auth/],
    offlineGoogleAnalytics: false,
    disableDevLogs: true,
    manifestTransforms: [customManifestTransform]
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    compression(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: '.',
        },
      ],
    }),
    vitePluginFaviconsInject('./public/favicon.ico'),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: getManifestConfig(),
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
      },
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
  },
  optimizeDeps: {
    include: ['essentia.js', 'react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    exclude: ['@phosphor-icons/react'],
    esbuildOptions: {
      target: 'esnext',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true,
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
      'Access-Control-Allow-Credentials': 'true',
    },
    proxy: {
      '/auth/v1': {
        target: 'https://ewenoruuogtoqyaxelgm.supabase.co',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', 'https://ewenoruuogtoqyaxelgm.supabase.co');
            proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY || '');
            proxyReq.setHeader('X-Client-Info', 'supabase-js-web/2.39.3');
            
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
        }
      },
      '/rest/v1': {
        target: 'https://ewenoruuogtoqyaxelgm.supabase.co',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', 'https://ewenoruuogtoqyaxelgm.supabase.co');
            proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY || '');
            proxyReq.setHeader('X-Client-Info', 'supabase-js-web/2.39.3');
            
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
        }
      },
      '/storage/v1': {
        target: 'https://ewenoruuogtoqyaxelgm.supabase.co',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', 'https://ewenoruuogtoqyaxelgm.supabase.co');
            proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY || '');
            proxyReq.setHeader('X-Client-Info', 'supabase-js-web/2.39.3');
            
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    modulePreload: {
      polyfill: true
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
  },
  preview: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
      'Access-Control-Allow-Credentials': 'true',
    },
  },
})
