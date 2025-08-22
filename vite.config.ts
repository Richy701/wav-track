import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|svg|webp|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
  ],
  css: {
    devSourcemap: false,
    // Let postcss.config.cjs handle PostCSS configuration
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core'
          }
          // Router
          if (id.includes('react-router') || id.includes('@tanstack/react-router')) {
            return 'router'
          }
          // Chart/visualization libraries
          if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs') || id.includes('d3')) {
            return 'charts'
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui'
          }
          // Icons
          if (id.includes('lucide-react') || id.includes('@tabler/icons') || id.includes('@heroicons') || id.includes('react-icons')) {
            return 'icons'
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase'
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms'
          }
          // Animation libraries
          if (id.includes('framer-motion') || id.includes('gsap') || id.includes('@dnd-kit')) {
            return 'animation'
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils'
          }
          // Other utilities
          if (id.includes('lodash') || id.includes('uuid') || id.includes('clsx') || id.includes('class-variance-authority')) {
            return 'utils'
          }
          // Tanstack Query
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
          // Remaining vendor packages
          if (id.includes('node_modules')) {
            // Split remaining vendor into smaller chunks
            const packageName = id.split('node_modules/')[1]?.split('/')[0]
            if (packageName) {
              const hash = packageName.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0)
                return a & a
              }, 0)
              return `vendor-${Math.abs(hash) % 4}`
            }
            return 'vendor-misc'
          }
        },
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/.test(assetInfo.name)) {
            // Critical CSS gets highest priority naming
            if (assetInfo.name.includes('index') || assetInfo.name.includes('main')) {
              return `assets/css/critical-[hash].${ext}`
            }
            return `assets/css/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    target: 'es2020',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true,
      },
    },
    cssCodeSplit: false, // Bundle all CSS together for better caching and fewer requests
    cssMinify: 'esbuild', // Faster CSS minification
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Skip compressed size reporting for faster builds
  },
  server: {
    port: 3001,
    host: true,
    cors: {
      origin: process.env.VITE_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info', 'apikey']
    },
    proxy: {
      '/auth/v1': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', process.env.VITE_SUPABASE_URL || '');
            proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY || '');
            proxyReq.setHeader('X-Client-Info', 'supabase-js/2.39.3');
            
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
        }
      },
      '/rest/v1': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', process.env.VITE_SUPABASE_URL || '');
            proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY || '');
            proxyReq.setHeader('X-Client-Info', 'supabase-js/2.39.3');
            
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
        }
      },
      '/storage/v1': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', process.env.VITE_SUPABASE_URL || '');
            proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY || '');
            proxyReq.setHeader('X-Client-Info', 'supabase-js/2.39.3');
            
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
        }
      },
    },
  },
}) 