import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@design/icons': path.resolve(__dirname, './src/design/icons'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@supabase')) return 'vendor-supabase';
            return 'vendor';
          }
          if (id.includes('fake-a-proverb')) return 'game-fake-a-proverb';
          if (id.includes('hot-coal')) return 'game-hot-coal';
          if (id.includes('tares-among-the-wheat')) return 'game-tares';
        },
      },
    },
  },
})
