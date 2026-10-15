import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        academy: resolve(__dirname, 'academy.html'),
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        partnership: resolve(__dirname, 'partnership.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogeditor: resolve(__dirname, 'blogeditor.html'),
        admin1: resolve(__dirname, 'admin1.html')
      }
    }
  }
});
