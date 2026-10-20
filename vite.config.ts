import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import packageJson from './package.json' with { type: 'json' };

const buildVersion = process.env.BUILD_ID
  ? `${packageJson.version}+netlify.${process.env.BUILD_ID}`
  : process.env.DEPLOY_ID
    ? `${packageJson.version}+deploy.${process.env.DEPLOY_ID}`
    : process.env.COMMIT_REF
      ? `${packageJson.version}+commit.${process.env.COMMIT_REF.slice(0, 7)}`
      : `${packageJson.version}+local`;

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Vacation Café — Orders',
        short_name: 'Vacation Café',
        description: 'Suivi des commandes à préparer pour Vacation Café',
        theme_color: '#0f766e',
        background_color: '#f4f6f8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
    tailwindcss(),
  ],
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});