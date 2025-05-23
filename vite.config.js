import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Konfigurasi proxy untuk API calls
      '/api': {
        target: 'https://8101-103-121-144-13.ngrok-free.app/',
        changeOrigin: true,
        secure: false,
        // Opsional: rewrite path
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    allowedHosts: [
      '74e1-103-121-144-163.ngrok-free.app' 
    ]
  }
});
