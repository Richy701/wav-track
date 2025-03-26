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
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),
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
          dest: './',
        },
      ],
    }),
    vitePluginFaviconsInject('./public/favicon.ico'),
    VitePWA(pwaConfiguration),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
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
    sourcemap: false,
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
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'utils-vendor': ['date-fns', 'lodash'],
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
  },
})
