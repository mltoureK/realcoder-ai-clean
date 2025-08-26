import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: './',
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/sendSMS': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/generateQuiz': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploadFiles': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/fetchRepo': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/getStoredFiles': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
