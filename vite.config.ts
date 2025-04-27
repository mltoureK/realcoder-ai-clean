import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: './',
  plugins: [
    tailwindcss(),      // ← runs Tailwind as a Vite plugin :contentReference[oaicite:0]{index=0}
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
    },
  },
});
