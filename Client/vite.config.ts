import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-favicon.png', 'logo-apple-touch.png'],
      devOptions: {
        enabled: false,
        type: 'module',
      },
      manifest: {
        name: 'GreenGrow',
        short_name: 'GreenGrow',
        description: 'GreenGrow farm intelligence and services platform.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#16a34a',
        icons: [
          {
            src: '/icons/logo-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/logo-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/logo-icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/logo-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'http://localhost:5000' || url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
          {
            urlPattern: ({ url }) =>
              url.origin === 'http://localhost:5000' || url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'POST',
          },
          {
            urlPattern: ({ url }) => url.origin.startsWith('https://api.groq.com'),
            handler: 'NetworkOnly',
            method: 'POST',
          },
          {
            urlPattern: ({ url }) => url.origin.includes('onrender.com'),
            handler: 'NetworkOnly',
            method: 'POST',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
