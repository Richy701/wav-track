import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
// import imagemin from 'vite-plugin-imagemin' // Removing since module not found
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions, VitePWAOptions, Display } from 'vite-plugin-pwa'
import fs from 'fs'

// Function to get PWA manifest configuration
const getManifestConfig = () => {
  const basePath = '/wav-track/';
  
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

const pwaConfiguration: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  includeAssets: [
    'favicon.ico', 
    'robots.txt', 
    'apple-touch-icon.png',
    'assets/audio/*.mp3'
  ] as const,
  manifest: manifestForPlugin,
  strategies: 'injectManifest' as const,
  srcDir: 'src',
  filename: 'sw.ts',
  injectRegister: 'auto',
  devOptions: {
    enabled: true,
    type: 'module'
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'] as const,
    cleanupOutdatedCaches: true,
    sourcemap: true,
    runtimeCaching: [
      {
        urlPattern: /^.*\/assets\/audio\/.*\.mp3$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'audio-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    VitePWA(pwaConfiguration),
    mode === 'analyze' ? visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }) : null
  ].filter(Boolean),
  base: '/wav-track/',  // Set static base path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['essentia.js'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true,
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

          proxy.on('proxyRes', (proxyRes, req, res) => {
            Object.keys(proxyRes.headers).forEach(key => {
              const value = proxyRes.headers[key];
              if (value !== undefined) {
                res.setHeader(key, value);
              }
            });
          });

          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            res.end('Something went wrong with the proxy.');
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

          proxy.on('proxyRes', (proxyRes, req, res) => {
            Object.keys(proxyRes.headers).forEach(key => {
              const value = proxyRes.headers[key];
              if (value !== undefined) {
                res.setHeader(key, value);
              }
            });
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
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id: string): string | null => {
          // Core vendor dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor.react';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor.ui';
            }
            if (id.includes('framer-motion')) {
              return 'vendor.animation';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor.charts';
            }
            if (id.includes('sonner') || id.includes('audio') || id.includes('essentia')) {
              return 'vendor.media';
            }
            return 'vendor.other';
          }

          // Feature-based code splitting
          if (id.includes('/components/timer/')) {
            return 'feature.timer';
          }
          if (id.includes('/components/ui/')) {
            return 'feature.ui';
          }
          if (id.includes('/components/media/')) {
            return 'feature.media';
          }
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0];
            return `page.${pageName}`;
          }
          return null;
        },
        assetFileNames: (assetInfo: { name?: string }): string => {
          if (!assetInfo.name) return './assets/[name].[hash][extname]';
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `./assets/audio/[name].[extname]`;  // Removed hash for audio files
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `./assets/images/[name].[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `./assets/fonts/[name].[hash][extname]`;
          }
          return `./assets/[name].[hash][extname]`;
        },
        chunkFileNames: './assets/js/[name].[hash].js',
        entryFileNames: './assets/js/[name].[hash].js',
      },
    },
  },
}))
