import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Vant auto-import: automatically import components on demand
    Components({
      resolvers: [VantResolver()],
      dts: false // Disable .d.ts generation for faster builds
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  // GitHub Pages deployment base URL
  // Change 'lineminiapp' to your actual repo name
  base: process.env.NODE_ENV === 'production'
    ? '/lineminiapp/'
    : '/',

  server: {
    port: 3000,
    open: true,
    host: true
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['vant']
        }
      }
    }
  }
})
