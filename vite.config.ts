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
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor'
          }
          // Chart/visualization libraries
          if (id.includes('recharts') || id.includes('chart') || id.includes('d3')) {
            return 'charts'
          }
          // UI component libraries
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui'
          }
          // Heavy utilities and third-party
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
            return 'utils'
          }
          // Large node_modules packages
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    target: 'es2020',
    sourcemap: false, // Reduce build size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    cssCodeSplit: true, // Enable CSS code splitting
    chunkSizeWarningLimit: 1000, // Increase limit but still warn for large chunks
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