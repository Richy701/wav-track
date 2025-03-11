import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wav-track/',  // Changed back to match Router basename
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    open: true // Automatically open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production
    assetsDir: 'assets',
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return './assets/[name].[hash][extname]';
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `./assets/media/[name].[hash][extname]`;
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
})
