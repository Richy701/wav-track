declare module 'vite-plugin-favicons-inject' {
  import { Plugin } from 'vite'
  
  export function vitePluginFaviconsInject(faviconPath: string): Plugin
} 